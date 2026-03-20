package services

import (
	"context"
	"errors"

	"github.com/tiba/tiba-backend/internal/models"
	"github.com/tiba/tiba-backend/internal/repositories"
)

var (
	ErrAlreadyEnrolled        = errors.New("already enrolled in this session")
	ErrEnrollmentWindowClosed = errors.New("enrollment window is closed")
	ErrSessionFull            = errors.New("session is full")
)

type EnrollmentService struct {
	enrollRepo *repositories.EnrollmentRepository
}

func NewEnrollmentService(enrollRepo *repositories.EnrollmentRepository) *EnrollmentService {
	return &EnrollmentService{enrollRepo: enrollRepo}
}

func (s *EnrollmentService) ListAdminOrders(ctx context.Context, search, status string, limit, offset int) ([]models.AdminOrderItem, int64, error) {
	return s.enrollRepo.ListAdminOrders(ctx, search, status, limit, offset)
}

func (s *EnrollmentService) ListMemberEnrollments(ctx context.Context, userID, status string, limit, offset int) ([]models.MemberEnrollmentItem, int64, error) {
	return s.enrollRepo.ListMemberEnrollments(ctx, userID, status, limit, offset)
}

func (s *EnrollmentService) ListMemberOrders(ctx context.Context, userID, status string, limit, offset int) ([]models.MemberOrderItem, int64, error) {
	return s.enrollRepo.ListMemberOrders(ctx, userID, status, limit, offset)
}

func (s *EnrollmentService) Enroll(ctx context.Context, userID, sessionID, userRole string) (*models.EnrollResponse, error) {
	result, err := s.enrollRepo.Enroll(ctx, userID, sessionID, userRole)
	if err != nil {
		switch err {
		case repositories.ErrAlreadyEnrolled:
			return nil, ErrAlreadyEnrolled
		case repositories.ErrEnrollmentWindowClosed:
			return nil, ErrEnrollmentWindowClosed
		case repositories.ErrSessionFull:
			return nil, ErrSessionFull
		}
		return nil, err
	}
	return result, nil
}
