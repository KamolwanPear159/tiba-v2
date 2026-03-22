package models

import "time"

// ---------- DB row structs ----------

// Enrollment maps to the enrollments table.
type Enrollment struct {
	ID                   string     `json:"id" db:"id"`
	SessionID            string     `json:"session_id" db:"session_id"`
	UserID               string     `json:"user_id" db:"user_id"`
	Status               string     `json:"status" db:"status"`
	CertificatePath      *string    `json:"certificate_path" db:"certificate_path"`
	CertificateIssuedAt  *time.Time `json:"certificate_issued_at" db:"certificate_issued_at"`
	IssuedBy             *string    `json:"issued_by" db:"issued_by"`
	CreatedAt            time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt            time.Time  `json:"updated_at" db:"updated_at"`
}

// Payment maps to the payments table.
type Payment struct {
	ID              string     `json:"id" db:"id"`
	UserID          string     `json:"user_id" db:"user_id"`
	Category        string     `json:"category" db:"category"`
	Status          string     `json:"status" db:"status"`
	Amount          float64    `json:"amount" db:"amount"`
	RegistrationID  *string    `json:"registration_id" db:"registration_id"`
	EnrollmentID    *string    `json:"enrollment_id" db:"enrollment_id"`
	SlipFilePath    *string    `json:"slip_file_path" db:"slip_file_path"`
	SlipUploadedAt  *time.Time `json:"slip_uploaded_at" db:"slip_uploaded_at"`
	ConfirmedBy     *string    `json:"confirmed_by" db:"confirmed_by"`
	ConfirmedAt     *time.Time `json:"confirmed_at" db:"confirmed_at"`
	RejectionNote   *string    `json:"rejection_note" db:"rejection_note"`
	CreatedAt       time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at" db:"updated_at"`
}

// Notification maps to the notifications table.
type Notification struct {
	ID        string    `json:"id" db:"id"`
	UserID    string    `json:"user_id" db:"user_id"`
	Title     string    `json:"title" db:"title"`
	Body      string    `json:"body" db:"body"`
	Type      string    `json:"type" db:"type"`
	IsRead    bool      `json:"is_read" db:"is_read"`
	RelatedID *string   `json:"related_id" db:"related_id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// ---------- Request structs ----------

// CreateEnrollmentRequest is the body for POST /member/enrollments.
type CreateEnrollmentRequest struct {
	SessionID string `json:"session_id" validate:"required"`
}

// AdminConfirmPaymentRequest is the body for PUT /admin/orders/:id/confirm.
type AdminConfirmPaymentRequest struct {
	Note string `json:"note"`
}

// AdminRejectPaymentRequest is the body for PUT /admin/orders/:id/reject.
type AdminRejectPaymentRequest struct {
	Note string `json:"note" validate:"required"`
}

// ---------- View / join DTOs ----------

// EnrollmentWithDetails carries enrollment data joined with course + session info
// for the member's enrollment list and certificate list views.
type EnrollmentWithDetails struct {
	EnrollmentID         string     `json:"enrollment_id" db:"enrollment_id"`
	CourseTitle          string     `json:"course_title" db:"course_title"`
	SessionID            string     `json:"session_id" db:"session_id"`
	TrainingStart        time.Time  `json:"training_start" db:"training_start"`
	TrainingEnd          time.Time  `json:"training_end" db:"training_end"`
	EnrollmentStatus     string     `json:"enrollment_status" db:"enrollment_status"`
	PaymentStatus        string     `json:"payment_status" db:"payment_status"`
	CertificateAvailable bool       `json:"certificate_available" db:"certificate_available"`
	CertificatePath      *string    `json:"certificate_path,omitempty" db:"certificate_path"`
	CertificateIssuedAt  *time.Time `json:"certificate_issued_at,omitempty" db:"certificate_issued_at"`
}

// PaymentWithDetails carries payment data joined with member + course info
// for the admin orders list and member payments list.
type PaymentWithDetails struct {
	OrderID        string     `json:"order_id" db:"order_id"`
	MemberName     string     `json:"member_name" db:"member_name"`
	MemberEmail    string     `json:"member_email" db:"member_email"`
	CourseTitle    string     `json:"course_title" db:"course_title"`
	TrainingStart  *time.Time `json:"session_training_start" db:"training_start"`
	TotalAmount    float64    `json:"total_amount" db:"total_amount"`
	PaymentStatus  string     `json:"payment_status" db:"payment_status"`
	Category       string     `json:"category" db:"category"`
	SlipFilePath   *string    `json:"slip_file_path" db:"slip_file_path"`
	SlipUploadedAt *time.Time `json:"slip_uploaded_at" db:"slip_uploaded_at"`
	RejectionNote  *string    `json:"rejection_note" db:"rejection_note"`
	EnrollmentID   *string    `json:"enrollment_id" db:"enrollment_id"`
	CreatedAt      time.Time  `json:"created_at" db:"created_at"`
}

// AdminOrderListItem is the compact list-view DTO for GET /admin/orders.
// (kept for backward compat; PaymentWithDetails supersedes for detail view)
type AdminOrderListItem struct {
	OrderID        string     `json:"order_id" db:"order_id"`
	MemberName     string     `json:"member_name" db:"member_name"`
	MemberEmail    string     `json:"member_email" db:"member_email"`
	CourseTitle    string     `json:"course_title" db:"course_title"`
	TrainingStart  *time.Time `json:"session_training_start" db:"training_start"`
	TotalAmount    float64    `json:"total_amount" db:"total_amount"`
	PaymentStatus  string     `json:"payment_status" db:"payment_status"`
	SlipUploadedAt *time.Time `json:"slip_uploaded_at" db:"slip_uploaded_at"`
}

// MemberCourseItem is the compact item for /member/courses list.
type MemberCourseItem struct {
	EnrollmentID     string    `json:"enrollment_id" db:"enrollment_id"`
	CourseTitle      string    `json:"course_title" db:"course_title"`
	SessionID        string    `json:"session_id" db:"session_id"`
	TrainingStart    time.Time `json:"training_start" db:"training_start"`
	TrainingEnd      time.Time `json:"training_end" db:"training_end"`
	EnrollmentStatus string    `json:"enrollment_status" db:"enrollment_status"`
	PaymentStatus    string    `json:"payment_status" db:"payment_status"`
}

// ---------- Legacy structs preserved for existing code compatibility ----------

// AdminOrderItem is the legacy DTO used by the original admin orders query.
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

// MemberEnrollmentItem is the legacy DTO for GET /member/enrollments.
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

// MemberOrderItem is the legacy DTO for GET /member/orders.
type MemberOrderItem struct {
	OrderID       string    `json:"order_id" db:"order_id"`
	CourseTitle   string    `json:"course_title" db:"course_title"`
	TotalAmount   float64   `json:"total_amount" db:"total_amount"`
	PaymentStatus string    `json:"payment_status" db:"payment_status"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
	SlipUploaded  bool      `json:"slip_uploaded" db:"slip_uploaded"`
}

// EnrollRequest is the legacy body for POST /member/enrollments.
type EnrollRequest struct {
	SessionID string `json:"session_id" validate:"required"`
}

// EnrollResponse is returned on successful enrollment (legacy).
type EnrollResponse struct {
	EnrollmentID  string  `json:"enrollment_id"`
	OrderID       string  `json:"order_id"`
	TotalAmount   float64 `json:"total_amount"`
	PaymentStatus string  `json:"payment_status"`
}
