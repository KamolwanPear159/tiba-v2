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

	PayPending      PaymentStatus = "pending"
	PaySlipUploaded PaymentStatus = "slip_uploaded"
	PayConfirmed    PaymentStatus = "confirmed"
	PayRejected     PaymentStatus = "rejected"
)

type Course struct {
	ID                string          `db:"id" json:"id"`
	Title             string          `db:"title" json:"title"`
	Description       sql.NullString  `db:"description" json:"description"`
	Format            CourseFormat    `db:"format" json:"format"`
	OnlineMeetingLink sql.NullString  `db:"online_meeting_link" json:"online_meeting_link"`
	PriceType         CoursePriceType `db:"price_type" json:"price_type"`
	PriceGeneral      sql.NullFloat64 `db:"price_general" json:"price_general"`
	PriceAssociation  sql.NullFloat64 `db:"price_association" json:"price_association"`
	ThumbnailPath     sql.NullString  `db:"thumbnail_path" json:"thumbnail_path"`
	TotalHours        sql.NullInt32   `db:"total_hours" json:"total_hours"`
	IsPublished       bool            `db:"is_published" json:"is_published"`
	Expectations      sql.NullString  `db:"expectations" json:"expectations"`
	AboutContent      sql.NullString  `db:"about_content" json:"about_content"`
	LocationName      sql.NullString  `db:"location_name" json:"location_name"`
	LocationMapURL    sql.NullString  `db:"location_map_url" json:"location_map_url"`
	ContactPhone      sql.NullString  `db:"contact_phone" json:"contact_phone"`
	ContactEmail      sql.NullString  `db:"contact_email" json:"contact_email"`
	ContactLine       sql.NullString  `db:"contact_line" json:"contact_line"`
	ContactFacebook   sql.NullString  `db:"contact_facebook" json:"contact_facebook"`
	BrochurePath      sql.NullString  `db:"brochure_path" json:"brochure_path"`
	CreatedBy         string          `db:"created_by" json:"created_by"`
	CreatedAt         time.Time       `db:"created_at" json:"created_at"`
	UpdatedAt         time.Time       `db:"updated_at" json:"updated_at"`
	DeletedAt         *time.Time      `db:"deleted_at" json:"deleted_at,omitempty"`
}

// CourseTutor is a tutor assigned to a course (flattened join result)
type CourseTutor struct {
	TutorID      string         `db:"tutor_id"      json:"tutor_id"`
	CourseID     string         `db:"course_id"     json:"course_id"`
	Name         string         `db:"name"          json:"name"`
	Position     string         `db:"position"      json:"position"`
	PhotoURL     string         `db:"photo_url"     json:"photo_url"`
	DisplayOrder int            `db:"display_order" json:"display_order"`
}

type CourseSession struct {
	ID              string         `db:"id" json:"id"`
	CourseID        string         `db:"course_id" json:"course_id"`
	SessionLabel    sql.NullString `db:"session_label" json:"session_label"`
	Location        sql.NullString `db:"location" json:"location"`
	SeatCapacity    *int16         `db:"seat_capacity" json:"seat_capacity"`
	EnrollmentStart time.Time      `db:"enrollment_start" json:"enrollment_start"`
	EnrollmentEnd   time.Time      `db:"enrollment_end" json:"enrollment_end"`
	TrainingStart   time.Time      `db:"training_start" json:"training_start"`
	TrainingEnd     time.Time      `db:"training_end" json:"training_end"`
	IsCancelled     bool           `db:"is_cancelled" json:"is_cancelled"`
	CancelReason    sql.NullString `db:"cancel_reason" json:"cancel_reason"`
	CreatedAt       time.Time      `db:"created_at" json:"created_at"`
	UpdatedAt       time.Time      `db:"updated_at" json:"updated_at"`
}

// ─── Request DTOs ──────────────────────────────────────────────────────────────

type CreateCourseRequest struct {
	Title             string          `json:"title" form:"title" validate:"required"`
	Description       string          `json:"description" form:"description"`
	Format            CourseFormat    `json:"format" form:"format" validate:"required,oneof=onsite online"`
	OnlineMeetingLink string          `json:"online_meeting_link" form:"online_meeting_link"`
	PriceType         CoursePriceType `json:"price_type" form:"price_type" validate:"required,oneof=single dual"`
	PriceGeneral      *float64        `json:"price_general" form:"price_general"`
	PriceAssociation  *float64        `json:"price_association" form:"price_association"`
	TotalHours        *int            `json:"total_hours" form:"total_hours"`
	IsPublished       bool            `json:"is_published" form:"is_published"`
}

type UpdateCourseRequest struct {
	Title             string          `json:"title" form:"title"`
	Description       string          `json:"description" form:"description"`
	Format            CourseFormat    `json:"format" form:"format"`
	OnlineMeetingLink string          `json:"online_meeting_link" form:"online_meeting_link"`
	PriceType         CoursePriceType `json:"price_type" form:"price_type"`
	PriceGeneral      *float64        `json:"price_general" form:"price_general"`
	PriceAssociation  *float64        `json:"price_association" form:"price_association"`
	TotalHours        *int            `json:"total_hours" form:"total_hours"`
	IsPublished       *bool           `json:"is_published" form:"is_published"`
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
	SessionLabel    string     `json:"session_label"`
	Location        string     `json:"location"`
	SeatCapacity    *int16     `json:"seat_capacity"`
	EnrollmentStart *time.Time `json:"enrollment_start"`
	EnrollmentEnd   *time.Time `json:"enrollment_end"`
	TrainingStart   string     `json:"training_start"`
	TrainingEnd     string     `json:"training_end"`
	IsCancelled     *bool      `json:"is_cancelled"`
	CancelReason    string     `json:"cancel_reason"`
}

// ─── Course Document ──────────────────────────────────────────────────────────

type CourseDocument struct {
	ID           string    `db:"id" json:"id"`
	CourseID     string    `db:"course_id" json:"course_id"`
	Name         string    `db:"name" json:"name"`
	FilePath     string    `db:"file_path" json:"file_path"`
	DisplayOrder int       `db:"display_order" json:"display_order"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
}

// ─── Public list item (enriched with next session) ────────────────────────────

type CoursePublicListItem struct {
	ID                  string          `db:"id" json:"id"`
	Title               string          `db:"title" json:"title"`
	Description         sql.NullString  `db:"description" json:"description"`
	Format              CourseFormat    `db:"format" json:"format"`
	OnlineMeetingLink   sql.NullString  `db:"online_meeting_link" json:"online_meeting_link"`
	PriceType           CoursePriceType `db:"price_type" json:"price_type"`
	PriceGeneral        sql.NullFloat64 `db:"price_general" json:"price_general"`
	PriceAssociation    sql.NullFloat64 `db:"price_association" json:"price_association"`
	ThumbnailPath       sql.NullString  `db:"thumbnail_path" json:"thumbnail_path"`
	TotalHours          sql.NullInt32   `db:"total_hours" json:"total_hours"`
	IsPublished         bool            `db:"is_published" json:"is_published"`
	CreatedAt           time.Time       `db:"created_at" json:"created_at"`
	UpdatedAt           time.Time       `db:"updated_at" json:"updated_at"`
	SessionsCount       int             `db:"sessions_count" json:"sessions_count"`
	NextTrainingStart   *time.Time      `db:"next_training_start" json:"next_training_start"`
	NextTrainingEnd     *time.Time      `db:"next_training_end" json:"next_training_end"`
	NextEnrollmentStart *time.Time      `db:"next_enrollment_start" json:"next_enrollment_start"`
	NextEnrollmentEnd   *time.Time      `db:"next_enrollment_end" json:"next_enrollment_end"`
}
