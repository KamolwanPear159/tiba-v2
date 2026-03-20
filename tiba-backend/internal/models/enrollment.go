package models

import "time"

// AdminOrderItem is the list-view DTO for GET /admin/orders
type AdminOrderItem struct {
	OrderID        string     `json:"order_id" db:"order_id"`
	MemberName     string     `json:"member_name" db:"member_name"`
	MemberEmail    string     `json:"member_email" db:"member_email"`
	CourseTitle    string     `json:"course_title" db:"course_title"`
	TrainingStart  *time.Time `json:"session_training_start" db:"training_start"`
	TotalAmount    float64    `json:"total_amount" db:"total_amount"`
	PaymentStatus  string     `json:"payment_status" db:"payment_status"`
	SlipUploadedAt *time.Time `json:"slip_uploaded_at" db:"slip_uploaded_at"`
}

// MemberEnrollmentItem is the DTO for GET /member/enrollments
type MemberEnrollmentItem struct {
	EnrollmentID         string    `json:"enrollment_id" db:"enrollment_id"`
	CourseTitle          string    `json:"course_title" db:"course_title"`
	SessionID            string    `json:"session_id" db:"session_id"`
	TrainingStart        time.Time `json:"training_start" db:"training_start"`
	TrainingEnd          time.Time `json:"training_end" db:"training_end"`
	EnrollmentStatus     string    `json:"enrollment_status" db:"enrollment_status"`
	PaymentStatus        string    `json:"payment_status" db:"payment_status"`
	CertificateAvailable bool      `json:"certificate_available" db:"certificate_available"`
}

// MemberOrderItem is the DTO for GET /member/orders
type MemberOrderItem struct {
	OrderID       string    `json:"order_id" db:"order_id"`
	CourseTitle   string    `json:"course_title" db:"course_title"`
	TotalAmount   float64   `json:"total_amount" db:"total_amount"`
	PaymentStatus string    `json:"payment_status" db:"payment_status"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
	SlipUploaded  bool      `json:"slip_uploaded" db:"slip_uploaded"`
}

// EnrollRequest is the body for POST /member/enrollments
type EnrollRequest struct {
	SessionID string `json:"session_id" validate:"required"`
}

// EnrollResponse is returned on successful enrollment
type EnrollResponse struct {
	EnrollmentID  string  `json:"enrollment_id"`
	OrderID       string  `json:"order_id"`
	TotalAmount   float64 `json:"total_amount"`
	PaymentStatus string  `json:"payment_status"`
}
