package services

import (
	"context"

	"github.com/tiba/tiba-backend/internal/models"
	"github.com/tiba/tiba-backend/internal/repositories"
)

type PriceBenefitService struct {
	repo *repositories.PriceBenefitRepository
}

func NewPriceBenefitService(repo *repositories.PriceBenefitRepository) *PriceBenefitService {
	return &PriceBenefitService{repo: repo}
}

func (s *PriceBenefitService) ListPlans(ctx context.Context) ([]models.PriceBenefitPlan, error) {
	return s.repo.ListPlans(ctx)
}

func (s *PriceBenefitService) GetPlan(ctx context.Context, id string) (*models.PriceBenefitPlan, error) {
	return s.repo.FindPlanByID(ctx, id)
}

func (s *PriceBenefitService) UpdatePlan(ctx context.Context, id string, req *models.UpdatePlanRequest) (*models.PriceBenefitPlan, error) {
	plan, err := s.repo.FindPlanByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if req.Label != "" {
		plan.Label = req.Label
	}
	if req.AnnualFee != nil {
		plan.AnnualFee = *req.AnnualFee
	}
	if req.DisplayOrder != nil {
		plan.DisplayOrder = *req.DisplayOrder
	}
	if req.IsActive != nil {
		plan.IsActive = *req.IsActive
	}
	if err := s.repo.UpdatePlan(ctx, plan); err != nil {
		return nil, err
	}
	return s.repo.FindPlanByID(ctx, id)
}

func (s *PriceBenefitService) ListConditions(ctx context.Context, planID string) ([]models.PriceBenefitCondition, error) {
	return s.repo.ListConditions(ctx, planID)
}

func (s *PriceBenefitService) CreateCondition(ctx context.Context, planID string, req *models.CreateConditionRequest) (*models.PriceBenefitCondition, error) {
	c := &models.PriceBenefitCondition{
		PlanID:        planID,
		ConditionText: req.ConditionText,
		DisplayOrder:  req.DisplayOrder,
	}
	if err := s.repo.CreateCondition(ctx, c); err != nil {
		return nil, err
	}
	return c, nil
}

func (s *PriceBenefitService) UpdateCondition(ctx context.Context, conditionID string, req *models.UpdateConditionRequest) (*models.PriceBenefitCondition, error) {
	c, err := s.repo.FindConditionByID(ctx, conditionID)
	if err != nil {
		return nil, err
	}
	if req.ConditionText != "" {
		c.ConditionText = req.ConditionText
	}
	if req.DisplayOrder != nil {
		c.DisplayOrder = *req.DisplayOrder
	}
	if err := s.repo.UpdateCondition(ctx, c); err != nil {
		return nil, err
	}
	return c, nil
}

func (s *PriceBenefitService) DeleteCondition(ctx context.Context, conditionID string) error {
	return s.repo.DeleteCondition(ctx, conditionID)
}
