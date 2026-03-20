package services

import (
	"context"
	"database/sql"
	"errors"

	"github.com/tiba/tiba-backend/internal/models"
	"github.com/tiba/tiba-backend/internal/repositories"
)

var ErrRegistrationNotFound = errors.New("registration not found")
var ErrSubUserNotFound = errors.New("sub user request not found")

type AssociationService struct {
	assocRepo *repositories.AssociationRepository
	userRepo  *repositories.UserRepository
}

func NewAssociationService(assocRepo *repositories.AssociationRepository, userRepo *repositories.UserRepository) *AssociationService {
	return &AssociationService{assocRepo: assocRepo, userRepo: userRepo}
}

func (s *AssociationService) CreateRegistration(ctx context.Context, userID string, req *models.RegisterRequest) (*models.AssociationRegistration, error) {
	reg := &models.AssociationRegistration{
		UserID: userID,
	}
	if req.OrgName != "" {
		reg.EntityType = models.EntityCompany
		reg.OrgName = sql.NullString{String: req.OrgName, Valid: true}
	} else {
		reg.EntityType = models.EntityIndividual
		reg.FirstName = sql.NullString{String: req.FirstName, Valid: req.FirstName != ""}
		reg.LastName = sql.NullString{String: req.LastName, Valid: req.LastName != ""}
	}
	reg.Phone = sql.NullString{String: req.Phone, Valid: req.Phone != ""}
	reg.Address = sql.NullString{String: req.Address, Valid: req.Address != ""}

	if err := s.assocRepo.CreateRegistration(ctx, nil, reg); err != nil {
		return nil, err
	}
	return reg, nil
}

func (s *AssociationService) ListRegistrations(ctx context.Context, status string, limit, offset int) ([]models.AssociationRegistration, int64, error) {
	return s.assocRepo.ListRegistrations(ctx, status, limit, offset)
}

func (s *AssociationService) GetRegistration(ctx context.Context, id string) (*models.AssociationRegistration, error) {
	reg, err := s.assocRepo.FindRegistrationByID(ctx, id)
	if err != nil {
		return nil, ErrRegistrationNotFound
	}
	return reg, nil
}

func (s *AssociationService) UpdateRegistrationStatus(ctx context.Context, id, status, reviewerID, note string) error {
	reg, err := s.assocRepo.FindRegistrationByID(ctx, id)
	if err != nil {
		return ErrRegistrationNotFound
	}

	stage := "first"
	switch models.RegistrationStatus(status) {
	case models.StatusInProgressSecondReview:
		stage = "first"
	case models.StatusInProgressSecondPayment:
		stage = "second"
	case models.StatusAccepted:
		stage = "payment"
	case models.StatusRejected:
		stage = "first"
	}
	_ = reg
	return s.assocRepo.UpdateRegistrationStatus(ctx, id, status, reviewerID, note, stage)
}

func (s *AssociationService) ListSubUserRequests(ctx context.Context, status string, limit, offset int) ([]models.AssociationSubUser, int64, error) {
	return s.assocRepo.ListSubUserRequests(ctx, status, limit, offset)
}

func (s *AssociationService) UpdateSubUserRequest(ctx context.Context, id, status, reviewerID, note string) error {
	_, err := s.assocRepo.FindSubUserByID(ctx, id)
	if err != nil {
		return ErrSubUserNotFound
	}
	return s.assocRepo.UpdateSubUserStatus(ctx, id, status, reviewerID, note)
}
