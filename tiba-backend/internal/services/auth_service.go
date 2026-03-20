package services

import (
	"context"
	"database/sql"
	"errors"
	"log"
	"time"

	"github.com/tiba/tiba-backend/internal/config"
	"github.com/tiba/tiba-backend/internal/models"
	"github.com/tiba/tiba-backend/internal/repositories"
	"github.com/tiba/tiba-backend/pkg/hash"
	pkgjwt "github.com/tiba/tiba-backend/pkg/jwt"
)

var (
	ErrUserNotFound      = errors.New("user not found")
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrEmailTaken        = errors.New("email already in use")
	ErrInactiveAccount   = errors.New("account is deactivated")
	ErrInvalidToken      = errors.New("invalid or expired token")
)

type AuthService struct {
	userRepo *repositories.UserRepository
	assocRepo *repositories.AssociationRepository
	cfg      *config.Config
}

func NewAuthService(userRepo *repositories.UserRepository, assocRepo *repositories.AssociationRepository, cfg *config.Config) *AuthService {
	return &AuthService{userRepo: userRepo, assocRepo: assocRepo, cfg: cfg}
}

func (s *AuthService) Register(ctx context.Context, req *models.RegisterRequest) (*models.User, error) {
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

	user, err := s.userRepo.Create(ctx, tx, req.Email, passwordHash, req.Role)
	if err != nil {
		return nil, err
	}

	if req.Role == models.RoleGeneralMember {
		if err := s.userRepo.CreateGeneralProfile(ctx, tx, user.ID, req.FirstName, req.LastName, req.Phone, req.Address); err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return user, nil
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

	accessToken, err := pkgjwt.GenerateAccessToken(s.cfg.JWTSecret, s.cfg.JWTAccessExpiry, user.ID, user.Email, string(user.Role))
	if err != nil {
		return nil, err
	}

	refreshToken, err := pkgjwt.GenerateRefreshToken()
	if err != nil {
		return nil, err
	}

	tokenHash := pkgjwt.HashToken(refreshToken)
	expiresAt := time.Now().Add(s.cfg.JWTRefreshExpiry)

	if err := s.userRepo.CreateRefreshToken(ctx, user.ID, tokenHash, expiresAt); err != nil {
		return nil, err
	}

	go s.userRepo.UpdateLastLogin(context.Background(), user.ID)

	return &models.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         user,
	}, nil
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

	accessToken, err := pkgjwt.GenerateAccessToken(s.cfg.JWTSecret, s.cfg.JWTAccessExpiry, user.ID, user.Email, string(user.Role))
	if err != nil {
		return nil, err
	}

	newRefreshToken, err := pkgjwt.GenerateRefreshToken()
	if err != nil {
		return nil, err
	}

	newTokenHash := pkgjwt.HashToken(newRefreshToken)
	expiresAt := time.Now().Add(s.cfg.JWTRefreshExpiry)

	if err := s.userRepo.CreateRefreshToken(ctx, user.ID, newTokenHash, expiresAt); err != nil {
		return nil, err
	}

	return &models.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
		User:         user,
	}, nil
}

func (s *AuthService) Logout(ctx context.Context, refreshToken string) error {
	tokenHash := pkgjwt.HashToken(refreshToken)
	return s.userRepo.RevokeRefreshToken(ctx, tokenHash)
}

func (s *AuthService) ForgotPassword(ctx context.Context, email string) error {
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// Don't reveal if email exists
			return nil
		}
		return err
	}

	resetToken, err := pkgjwt.GenerateRefreshToken()
	if err != nil {
		return err
	}

	tokenHash := pkgjwt.HashToken(resetToken)
	expiresAt := time.Now().Add(1 * time.Hour)

	if err := s.userRepo.CreatePasswordResetToken(ctx, user.ID, tokenHash, expiresAt); err != nil {
		return err
	}

	// In production, send email. For now, log the token.
	log.Printf("[PASSWORD RESET] Token for %s: %s", email, resetToken)
	return nil
}

func (s *AuthService) ResetPassword(ctx context.Context, token, newPassword string) error {
	tokenHash := pkgjwt.HashToken(token)

	prt, err := s.userRepo.FindPasswordResetToken(ctx, tokenHash)
	if err != nil {
		return ErrInvalidToken
	}

	passwordHash, err := hash.HashPassword(newPassword)
	if err != nil {
		return err
	}

	if err := s.userRepo.UpdatePassword(ctx, prt.UserID, passwordHash); err != nil {
		return err
	}

	if err := s.userRepo.MarkPasswordResetTokenUsed(ctx, tokenHash); err != nil {
		return err
	}

	go s.userRepo.RevokeAllUserTokens(context.Background(), prt.UserID)

	return nil
}
