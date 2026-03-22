package services

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/tiba/tiba-backend/internal/config"
	"github.com/tiba/tiba-backend/internal/models"
	"github.com/tiba/tiba-backend/internal/repositories"
	"github.com/tiba/tiba-backend/pkg/email"
	"github.com/tiba/tiba-backend/pkg/hash"
	pkgjwt "github.com/tiba/tiba-backend/pkg/jwt"
)

var (
	ErrUserNotFound       = errors.New("user not found")
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrEmailTaken         = errors.New("email already in use")
	ErrInactiveAccount    = errors.New("account is deactivated")
	ErrInvalidToken       = errors.New("invalid or expired token")
	ErrInvalidOTP         = errors.New("invalid or expired OTP")
)

type AuthService struct {
	userRepo  *repositories.UserRepository
	assocRepo *repositories.AssociationRepository
	otpRepo   *repositories.OTPRepository
	emailSvc  *email.Service
	cfg       *config.Config
}

func NewAuthService(
	userRepo *repositories.UserRepository,
	assocRepo *repositories.AssociationRepository,
	otpRepo *repositories.OTPRepository,
	emailSvc *email.Service,
	cfg *config.Config,
) *AuthService {
	return &AuthService{
		userRepo:  userRepo,
		assocRepo: assocRepo,
		otpRepo:   otpRepo,
		emailSvc:  emailSvc,
		cfg:       cfg,
	}
}

func (s *AuthService) SendOTP(ctx context.Context, req *models.SendOTPRequest) error {
	code, err := s.otpRepo.GenerateCode()
	if err != nil {
		return err
	}
	if err := s.otpRepo.Create(ctx, req.Email, code, req.Purpose); err != nil {
		return err
	}
	go s.emailSvc.SendOTP(req.Email, req.Purpose, code)
	return nil
}

func (s *AuthService) VerifyOTP(ctx context.Context, req *models.VerifyOTPRequest) error {
	_, err := s.otpRepo.Verify(ctx, req.Email, req.Code, req.Purpose)
	if err != nil {
		return ErrInvalidOTP
	}
	return nil
}

func (s *AuthService) RegisterNormal(ctx context.Context, req *models.MemberRegisterNormalRequest) (*models.LoginResponse, error) {
	otp, err := s.otpRepo.Verify(ctx, req.Email, req.OTPCode, "register")
	if err != nil {
		return nil, ErrInvalidOTP
	}

	existing, err := s.userRepo.FindByEmail(ctx, req.Email)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return nil, err
	}
	if existing != nil {
		return nil, ErrEmailTaken
	}

	passwordHash, err := hash.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	tx, err := s.userRepo.BeginTx(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	user, err := s.userRepo.Create(ctx, tx, req.Email, passwordHash, models.RoleGeneralMember)
	if err != nil {
		return nil, err
	}
	if err := s.userRepo.CreateGeneralProfile(ctx, tx, user.ID, req.FirstName, req.LastName, req.Phone, req.Address); err != nil {
		return nil, err
	}
	if err := tx.Commit(); err != nil {
		return nil, err
	}

	go s.otpRepo.MarkUsed(context.Background(), otp.ID)
	return s.issueTokens(ctx, user)
}

func (s *AuthService) RegisterAssociation(ctx context.Context, req *models.MemberRegisterAssociationRequest) (*models.LoginResponse, error) {
	otp, err := s.otpRepo.Verify(ctx, req.Email, req.OTPCode, "register")
	if err != nil {
		return nil, ErrInvalidOTP
	}

	existing, err := s.userRepo.FindByEmail(ctx, req.Email)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return nil, err
	}
	if existing != nil {
		return nil, ErrEmailTaken
	}

	passwordHash, err := hash.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	tx, err := s.userRepo.BeginTx(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	user, err := s.userRepo.Create(ctx, tx, req.Email, passwordHash, models.RoleAssociationMain)
	if err != nil {
		return nil, err
	}
	if err := tx.Commit(); err != nil {
		return nil, err
	}

	go s.otpRepo.MarkUsed(context.Background(), otp.ID)
	return s.issueTokens(ctx, user)
}

func (s *AuthService) Login(ctx context.Context, req *models.LoginRequest) (*models.LoginResponse, error) {
	user, err := s.userRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrInvalidCredentials
		}
		return nil, err
	}
	if !hash.CheckPassword(req.Password, user.PasswordHash) {
		return nil, ErrInvalidCredentials
	}
	if !user.IsActive {
		return nil, ErrInactiveAccount
	}
	go s.userRepo.UpdateLastLogin(context.Background(), user.ID)
	return s.issueTokens(ctx, user)
}

func (s *AuthService) RefreshToken(ctx context.Context, refreshToken string) (*models.LoginResponse, error) {
	tokenHash := pkgjwt.HashToken(refreshToken)
	rt, err := s.userRepo.FindRefreshToken(ctx, tokenHash)
	if err != nil {
		return nil, ErrInvalidToken
	}
	user, err := s.userRepo.FindByID(ctx, rt.UserID)
	if err != nil {
		return nil, ErrUserNotFound
	}
	if err := s.userRepo.RevokeRefreshToken(ctx, tokenHash); err != nil {
		return nil, err
	}
	return s.issueTokens(ctx, user)
}

func (s *AuthService) Logout(ctx context.Context, refreshToken string) error {
	return s.userRepo.RevokeRefreshToken(ctx, pkgjwt.HashToken(refreshToken))
}

func (s *AuthService) ForgotPasswordOTP(ctx context.Context, emailAddr string) error {
	_, err := s.userRepo.FindByEmail(ctx, emailAddr)
	if err != nil {
		return nil // don't reveal
	}
	code, err := s.otpRepo.GenerateCode()
	if err != nil {
		return err
	}
	if err := s.otpRepo.Create(ctx, emailAddr, code, "forgot_password"); err != nil {
		return err
	}
	go s.emailSvc.SendOTP(emailAddr, "forgot_password", code)
	return nil
}

func (s *AuthService) ResetPasswordWithOTP(ctx context.Context, emailAddr, otpCode, newPassword string) error {
	otp, err := s.otpRepo.Verify(ctx, emailAddr, otpCode, "forgot_password")
	if err != nil {
		return ErrInvalidOTP
	}
	user, err := s.userRepo.FindByEmail(ctx, emailAddr)
	if err != nil {
		return ErrUserNotFound
	}
	passwordHash, err := hash.HashPassword(newPassword)
	if err != nil {
		return err
	}
	if err := s.userRepo.UpdatePassword(ctx, user.ID, passwordHash); err != nil {
		return err
	}
	go s.otpRepo.MarkUsed(context.Background(), otp.ID)
	go s.userRepo.RevokeAllUserTokens(context.Background(), user.ID)
	return nil
}

func (s *AuthService) issueTokens(ctx context.Context, user *models.User) (*models.LoginResponse, error) {
	accessToken, err := pkgjwt.GenerateAccessToken(s.cfg.JWTSecret, s.cfg.JWTAccessExpiry, user.ID, user.Email, string(user.Role))
	if err != nil {
		return nil, err
	}
	refreshToken, err := pkgjwt.GenerateRefreshToken()
	if err != nil {
		return nil, err
	}
	tokenHash := pkgjwt.HashToken(refreshToken)
	if err := s.userRepo.CreateRefreshToken(ctx, user.ID, tokenHash, time.Now().Add(s.cfg.JWTRefreshExpiry)); err != nil {
		return nil, err
	}
	return &models.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         user,
	}, nil
}
