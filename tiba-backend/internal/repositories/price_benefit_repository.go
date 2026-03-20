package repositories

import (
	"context"

	"github.com/jmoiron/sqlx"
	"github.com/tiba/tiba-backend/internal/models"
)

type PriceBenefitRepository struct {
	db *sqlx.DB
}

func NewPriceBenefitRepository(db *sqlx.DB) *PriceBenefitRepository {
	return &PriceBenefitRepository{db: db}
}

func (r *PriceBenefitRepository) ListPlans(ctx context.Context) ([]models.PriceBenefitPlan, error) {
	var plans []models.PriceBenefitPlan
	err := r.db.SelectContext(ctx, &plans, `SELECT * FROM price_benefit_plans ORDER BY display_order ASC`)
	if err != nil {
		return nil, err
	}
	for i := range plans {
		conditions, err := r.ListConditions(ctx, plans[i].ID)
		if err != nil {
			return nil, err
		}
		plans[i].Conditions = conditions
	}
	return plans, nil
}

func (r *PriceBenefitRepository) FindPlanByID(ctx context.Context, id string) (*models.PriceBenefitPlan, error) {
	var plan models.PriceBenefitPlan
	err := r.db.GetContext(ctx, &plan, `SELECT * FROM price_benefit_plans WHERE id=$1`, id)
	if err != nil {
		return nil, err
	}
	conditions, err := r.ListConditions(ctx, id)
	if err != nil {
		return nil, err
	}
	plan.Conditions = conditions
	return &plan, nil
}

func (r *PriceBenefitRepository) UpdatePlan(ctx context.Context, plan *models.PriceBenefitPlan) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE price_benefit_plans SET label=$1, annual_fee=$2, display_order=$3, is_active=$4 WHERE id=$5`,
		plan.Label, plan.AnnualFee, plan.DisplayOrder, plan.IsActive, plan.ID,
	)
	return err
}

func (r *PriceBenefitRepository) ListConditions(ctx context.Context, planID string) ([]models.PriceBenefitCondition, error) {
	var conditions []models.PriceBenefitCondition
	err := r.db.SelectContext(ctx, &conditions, `SELECT * FROM price_benefit_conditions WHERE plan_id=$1 ORDER BY display_order ASC`, planID)
	return conditions, err
}

func (r *PriceBenefitRepository) FindConditionByID(ctx context.Context, id string) (*models.PriceBenefitCondition, error) {
	var c models.PriceBenefitCondition
	err := r.db.GetContext(ctx, &c, `SELECT * FROM price_benefit_conditions WHERE id=$1`, id)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *PriceBenefitRepository) CreateCondition(ctx context.Context, c *models.PriceBenefitCondition) error {
	return r.db.QueryRowxContext(ctx, `
		INSERT INTO price_benefit_conditions (plan_id, condition_text, display_order)
		VALUES ($1,$2,$3) RETURNING *`,
		c.PlanID, c.ConditionText, c.DisplayOrder,
	).StructScan(c)
}

func (r *PriceBenefitRepository) UpdateCondition(ctx context.Context, c *models.PriceBenefitCondition) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE price_benefit_conditions SET condition_text=$1, display_order=$2 WHERE id=$3`,
		c.ConditionText, c.DisplayOrder, c.ID,
	)
	return err
}

func (r *PriceBenefitRepository) DeleteCondition(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM price_benefit_conditions WHERE id=$1`, id)
	return err
}
