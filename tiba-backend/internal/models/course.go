package models

import (
	"database/sql"
	"time"
)

type CourseFormat string
type CoursePriceType string
type EnrollmentStatus string
type PaymentCategory string
type PaymentStatus string

const (
	FormatOnsite CourseFormat = "onsite"
	FormatOnline CourseFormat = "online"

	PriceSingle CoursePriceType = "single"
	PriceDual   CoursePriceType = "dual"

	EnrollPendingPayment   EnrollmentStatus = "pending_payment"
	EnrollSlipUploaded     EnrollmentStatus = "slip_uploaded"
	EnrollPaymentConfirmed EnrollmentStatus = "payment_confirmed"
	EnrollCancelled        EnrollmentStatus = "cancelled"
	EnrollRejected         EnrollmentStatus = "rejected"

	PayCatMembershipFee PaymentCategory = "membership_fee"
	PayCatCourseFee     PaymentCategory = "course_fee"

	PayPending    PaymentStatus = "pending"
	PaySlipUploaded PaymentStatus = "slip_uploaded"
	PayConfirmed  PaymentStatus = "confirmed"
	PayRejected   PaymentStatus = "rejected"
)

type Course struct {
	ID               string          `db:"id" json:"id"`
	Title            string          `db:"title" json:"title"`
	Description      sql.NullString  `db:"description" json:"description"`
	Format           CourseFormat    `db:"format" json:"format"`
	OnlineMeetingLink sql.NullString `db:"online_meeting_link" json:"online_meeting_link"`
	PriceType        CoursePriceType `db:"price_type" json:"price_type"`
	PriceGeneral     sql.NullFloat64 `db:"price_general" json:"price_general"`
	PriceAssociation sql.NullFloat64 `db:"price_association" json:"price_association"`
	ThumbnailPath    sql.NullString  `db:"thumbnail_path" json:"thumbnail_path"`
	IsPublished      bool            `db:"is_published" json:"is_published"`
	CreatedBy        string          `db:"created_by" json:"created_by"`
	CreatedAt        time.Time       `db:"created_at" json:"created_at"`
	UpdatedAt        time.Time       `db:"updated_at" json:"updated_at"`
	DeletedAt        *time.Time      `db:"deleted_at" json:"deleted_at,omitempty"`
}

type CourseSession struct {
	ID              string     `db:"id" json:"id"`
	CourseID        string     `db:"course_id" json:"course_id"`
	SessionLabel    sql.NullString `db:"session_label" json:"session_label"`
	Location        sql.NullString `db:"location" json:"location"`
	SeatCapacity    *int16     `db:"seat_capacity" json:"seat_capacity"`
	EnrollmentStart time.Time  `db:"enrollment_start" json:"enrollment_start"`
	EnrollmentEnd   time.Time  `db:"enrollment_end" json:"enrollment_end"`
	TrainingStart   time.Time  `db:"training_start" json:"training_start"`
	TrainingEnd     time.Time  `db:"training_end" json:"training_end"`
	IsCancelled     bool       `db:"is_cancelled" json:"is_cancelled"`
	CancelReason    sql.NullString `db:"cancel_reason" json:"cancel_reason"`
	CreatedAt       time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt       time.Time  `db:"updated_at" json:"updated_at"`
}

type Enrollment struct {
	ID                  string           `db:"id" json:"id"`
	SessionID           string           `db:"session_id" json:"session_id"`
	UserID              string           `db:"user_id" json:"user_id"`
	Status              EnrollmentStatus `db:"status" json:"status"`
	CertificatePath     sql.NullString   `db:"certificate_path" json:"certificate_path"`
	CertificateIssuedAt *time.Time       `db:"certificate_issued_at" json:"certificate_issued_at"`
	IssuedBy            sql.NullString   `db:"issued_by" json:"issued_by"`
	CreatedAt           time.Time        `db:"created_at" json:"created_at"`
	UpdatedAt           time.Time        `db:"updated_at" json:"updated_at"`
}

type Payment struct {
	ID             string          `db:"id" json:"id"`
	UserID         string          `db:"user_id" json:"user_id"`
	Category       PaymentCategory `db:"category" json:"category"`
	Status         PaymentStatus   `db:"status" json:"status"`
	Amount         float64         `db:"amount" json:"amount"`
	RegistrationID sql.NullString  `db:"registration_id" json:"registration_id"`
	EnrollmentID   sql.NullString  `db:"enrollment_id" json:"enrollment_id"`
	SlipFilePath   sql.NullString  `db:"slip_file_path" json:"slip_file_path"`
	SlipUploadedAt *time.Time      `db:"slip_uploaded_at" json:"slip_uploaded_at"`
	ConfirmedBy    sql.NullString  `db:"confirmed_by" json:"confirmed_by"`
	ConfirmedAt    *time.Time      `db:"confirmed_at" json:"confirmed_at"`
	RejectionNote  sql.NullString  `db:"rejection_note" json:"rejection_note"`
	CreatedAt      time.Time       `db:"created_at" json:"created_at"`
	UpdatedAt      time.Time       `db:"updated_at" json:"updated_at"`
}

// Request DTOs

type CreateCourseRequest struct {
	Title             string          `json:"title" validate:"required"`
	Description       string          `json:"description"`
	Format            CourseFormat    `json:"format" validate:"required,oneof=onsite online"`
	OnlineMeetingLink string          `json:"online_meeting_link"`
	PriceType         CoursePriceType `json:"price_type" validate:"required,oneof=single dual"`
	PriceGeneral      *float64        `json:"price_general"`
	PriceAssociation  *float64        `json:"price_association"`
	IsPublished       bool            `json:"is_published"`
}

type UpdateCourseRequest struct {
	Title             string          `json:"title"`
	Description       string          `json:"description"`
	Format            CourseFormat    `json:"format"`
	OnlineMeetingLink string          `json:"online_meeting_link"`
	PriceType         CoursePriceType `json:"price_type"`
	PriceGeneral      *float64        `json:"price_general"`
	PriceAssociation  *float64        `json:"price_association"`
	IsPublished       *bool           `json:"is_published"`
}

type CreateSessionRequest struct {
	SessionLabel    string    `json:"session_label"`
	Location        string    `json:"location"`
	SeatCapacity    *int16    `json:"seat_capacity"`
	EnrollmentStart time.Time `json:"enrollment_start" validate:"required"`
	EnrollmentEnd   time.Time `json:"enrollment_end" validate:"required"`
	TrainingStart   string    `json:"training_start" validate:"required"`
	TrainingEnd     string    `json:"training_end" validate:"required"`
}

type UpdateSessionRequest struct {
	SessionLabel    string    `json:"session_label"`
	Location        string    `json:"location"`
	SeatCapacity    *int16    `json:"seat_capacity"`
	EnrollmentStart *time.Time `json:"enrollment_start"`
	EnrollmentEnd   *time.Time `json:"enrollment_end"`
	TrainingStart   string    `json:"training_start"`
	TrainingEnd     string    `json:"training_end"`
	IsCancelled     *bool     `json:"is_cancelled"`
	CancelReason    string    `json:"cancel_reason"`
}
