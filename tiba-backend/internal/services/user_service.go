package services

import (
	"context"
	"errors"

	"github.com/tiba/tiba-backend/internal/models"
	"github.com/tiba/tiba-backend/internal/repositories"
	"github.com/tiba/tiba-backend/pkg/hash"
)

type UserService struct {
	userRepo *repositories.UserRepository
}

func NewUserService(userRepo *repositories.UserRepository) *UserService {
	return &UserService{userRepo: userRepo}
}

func (s *UserService) GetProfile(ctx context.Context, userID string) (*models.User, *models.GeneralMemberProfile, error) {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, nil, ErrUserNotFound
	}
	profile, err := s.userRepo.GetProfile(ctx, userID)
	if err != nil {
		// profile may not exist (e.g., association user)
		return user, nil, nil
	}
	return user, profile, nil
}

func (s *UserService) UpdateProfile(ctx context.Context, userID string, req *models.UpdateProfileRequest) error {
	_, err := s.userRepo.GetProfile(ctx, userID)
	if err != nil {
		return errors.New("profile not found")
	}
	return s.userRepo.UpdateProfile(ctx, userID, req.FirstName, req.LastName, req.Phone, req.Address)
}

func (s *UserService) ChangePassword(ctx context.Context, userID, currentPassword, newPassword string) error {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return ErrUserNotFound
	}
	if !hash.CheckPassword(currentPassword, user.PasswordHash) {
		return ErrInvalidCredentials
	}
	newHash, err := hash.HashPassword(newPassword)
	if err != nil {
		return err
	}
	return s.userRepo.UpdatePassword(ctx, userID, newHash)
}

func (s *UserService) ListUsers(ctx context.Context, search, role string, limit, offset int) ([]models.User, int64, error) {
	return s.userRepo.List(ctx, search, role, limit, offset)
}

func (s *UserService) GetUser(ctx context.Context, userID string) (*models.User, error) {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, ErrUserNotFound
	}
	return user, nil
}

func (s *UserService) UpdateUserStatus(ctx context.Context, userID string, isActive bool) error {
	_, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return ErrUserNotFound
	}
	return s.userRepo.UpdateStatus(ctx, userID, isActive)
}

func (s *UserService) GetDashboardStats(ctx context.Context) (*models.DashboardStats, error) {
	return s.userRepo.GetDashboardStats(ctx)
}

func (s *UserService) GetMonthlyEnrollments(ctx context.Context) ([]models.MonthlyEnrollment, error) {
	return s.userRepo.GetMonthlyEnrollments(ctx)
}

func (s *UserService) GetRecentRegistrations(ctx context.Context) ([]models.DashboardRegistration, error) {
	return s.userRepo.GetRecentRegistrations(ctx)
}

func (s *UserService) ListAdminUsers(ctx context.Context) ([]models.User, error) {
	return s.userRepo.FindAdminUsers(ctx)
}

func (s *UserService) CreateAdminUser(ctx context.Context, email, password string) (*models.User, error) {
	existing, _ := s.userRepo.FindByEmail(ctx, email)
	if existing != nil {
		return nil, ErrEmailTaken
	}
	passwordHash, err := hash.HashPassword(password)
	if err != nil {
		return nil, err
	}
	return s.userRepo.CreateAdminUser(ctx, email, passwordHash)
}

func (s *UserService) ListActivityLogs(ctx context.Context, limit, offset int) ([]models.AdminActivityLog, int64, error) {
	return s.userRepo.ListActivityLogs(ctx, limit, offset)
}
