package models

import "time"

type MemberPlanType string

const (
	PlanGeneral             MemberPlanType = "general"
	PlanAssociationCompany  MemberPlanType = "association_company"
	PlanAssociationIndividual MemberPlanType = "association_individual"
)

type PriceBenefitPlan struct {
	ID           string         `db:"id" json:"id"`
	PlanType     MemberPlanType `db:"plan_type" json:"plan_type"`
	Label        string         `db:"label" json:"label"`
	AnnualFee    float64        `db:"annual_fee" json:"annual_fee"`
	DisplayOrder int16          `db:"display_order" json:"display_order"`
	IsActive     bool           `db:"is_active" json:"is_active"`
	CreatedAt    time.Time      `db:"created_at" json:"created_at"`
	UpdatedAt    time.Time      `db:"updated_at" json:"updated_at"`
	Conditions   []PriceBenefitCondition `db:"-" json:"conditions,omitempty"`
}

type PriceBenefitCondition struct {
	ID           string    `db:"id" json:"id"`
	PlanID       string    `db:"plan_id" json:"plan_id"`
	ConditionText string   `db:"condition_text" json:"condition_text"`
	DisplayOrder int16     `db:"display_order" json:"display_order"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
	UpdatedAt    time.Time `db:"updated_at" json:"updated_at"`
}

type UpdatePlanRequest struct {
	Label        string  `json:"label"`
	AnnualFee    *float64 `json:"annual_fee"`
	DisplayOrder *int16  `json:"display_order"`
	IsActive     *bool   `json:"is_active"`
}

type CreateConditionRequest struct {
	ConditionText string `json:"condition_text" validate:"required"`
	DisplayOrder  int16  `json:"display_order"`
}

type UpdateConditionRequest struct {
	ConditionText string `json:"condition_text"`
	DisplayOrder  *int16 `json:"display_order"`
}
