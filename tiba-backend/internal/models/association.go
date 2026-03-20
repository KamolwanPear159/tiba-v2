package models

import (
	"database/sql"
	"time"
)

type EntityType string
type RegistrationStatus string
type SubUserPermission string
type SubInviteStatus string

const (
	EntityCompany    EntityType = "company"
	EntityIndividual EntityType = "individual"

	StatusInProgressFirst          RegistrationStatus = "in_progress_first"
	StatusInProgressSecondReview   RegistrationStatus = "in_progress_second_review"
	StatusInProgressSecondPayment  RegistrationStatus = "in_progress_second_payment"
	StatusAccepted                 RegistrationStatus = "accepted"
	StatusRejected                 RegistrationStatus = "rejected"

	PermissionFull     SubUserPermission = "full"
	PermissionViewOnly SubUserPermission = "view_only"

	InvitePending  SubInviteStatus = "pending"
	InviteApproved SubInviteStatus = "approved"
	InviteRejected SubInviteStatus = "rejected"
)

type AssociationRegistration struct {
	ID                  string             `db:"id" json:"id"`
	UserID              string             `db:"user_id" json:"user_id"`
	EntityType          EntityType         `db:"entity_type" json:"entity_type"`
	Status              RegistrationStatus `db:"status" json:"status"`
	OrgName             sql.NullString     `db:"org_name" json:"org_name"`
	TaxID               sql.NullString     `db:"tax_id" json:"tax_id"`
	FirstName           sql.NullString     `db:"first_name" json:"first_name"`
	LastName            sql.NullString     `db:"last_name" json:"last_name"`
	IDCardNumber        sql.NullString     `db:"id_card_number" json:"id_card_number"`
	Phone               sql.NullString     `db:"phone" json:"phone"`
	Address             sql.NullString     `db:"address" json:"address"`
	DocRegistrationCert sql.NullString     `db:"doc_registration_cert" json:"doc_registration_cert"`
	DocIDCard           sql.NullString     `db:"doc_id_card" json:"doc_id_card"`
	DocOther            sql.NullString     `db:"doc_other" json:"doc_other"`
	FirstReviewedBy     sql.NullString     `db:"first_reviewed_by" json:"first_reviewed_by"`
	FirstReviewedAt     *time.Time         `db:"first_reviewed_at" json:"first_reviewed_at"`
	FirstReviewNote     sql.NullString     `db:"first_review_note" json:"first_review_note"`
	SecondReviewedBy    sql.NullString     `db:"second_reviewed_by" json:"second_reviewed_by"`
	SecondReviewedAt    *time.Time         `db:"second_reviewed_at" json:"second_reviewed_at"`
	SecondReviewNote    sql.NullString     `db:"second_review_note" json:"second_review_note"`
	PaymentConfirmedBy  sql.NullString     `db:"payment_confirmed_by" json:"payment_confirmed_by"`
	PaymentConfirmedAt  *time.Time         `db:"payment_confirmed_at" json:"payment_confirmed_at"`
	CreatedAt           time.Time          `db:"created_at" json:"created_at"`
	UpdatedAt           time.Time          `db:"updated_at" json:"updated_at"`
}

type AssociationProfile struct {
	ID               string         `db:"id" json:"id"`
	UserID           string         `db:"user_id" json:"user_id"`
	RegistrationID   string         `db:"registration_id" json:"registration_id"`
	EntityType       EntityType     `db:"entity_type" json:"entity_type"`
	DisplayName      string         `db:"display_name" json:"display_name"`
	TaxID            sql.NullString `db:"tax_id" json:"tax_id"`
	Phone            sql.NullString `db:"phone" json:"phone"`
	Address          sql.NullString `db:"address" json:"address"`
	MembershipNumber sql.NullString `db:"membership_number" json:"membership_number"`
	MembershipExpiry *time.Time     `db:"membership_expiry_date" json:"membership_expiry_date"`
	CreatedAt        time.Time      `db:"created_at" json:"created_at"`
	UpdatedAt        time.Time      `db:"updated_at" json:"updated_at"`
}

type AssociationSubUser struct {
	ID            string          `db:"id" json:"id"`
	MainUserID    string          `db:"main_user_id" json:"main_user_id"`
	SubUserID     sql.NullString  `db:"sub_user_id" json:"sub_user_id"`
	InvitedEmail  string          `db:"invited_email" json:"invited_email"`
	Permission    SubUserPermission `db:"permission" json:"permission"`
	InviteStatus  SubInviteStatus `db:"invite_status" json:"invite_status"`
	ReviewedBy    sql.NullString  `db:"reviewed_by" json:"reviewed_by"`
	ReviewedAt    *time.Time      `db:"reviewed_at" json:"reviewed_at"`
	ReviewNote    sql.NullString  `db:"review_note" json:"review_note"`
	CreatedAt     time.Time       `db:"created_at" json:"created_at"`
	UpdatedAt     time.Time       `db:"updated_at" json:"updated_at"`
}

type UpdateRegistrationStatusRequest struct {
	Status string `json:"status" validate:"required"`
	Note   string `json:"note"`
}

type UpdateSubUserRequest struct {
	Status string `json:"status" validate:"required,oneof=approved rejected"`
	Note   string `json:"note"`
}
