package models

import (
	"database/sql"
	"time"
)

type UserRole string

const (
	RoleAdmin          UserRole = "admin"
	RoleGeneralMember  UserRole = "general_member"
	RoleAssociationMain UserRole = "association_main"
	RoleAssociationSub  UserRole = "association_sub"
)

type User struct {
	ID              string         `db:"id" json:"id"`
	Email           string         `db:"email" json:"email"`
	PasswordHash    string         `db:"password_hash" json:"-"`
	Role            UserRole       `db:"role" json:"role"`
	IsActive        bool           `db:"is_active" json:"is_active"`
	EmailVerifiedAt *time.Time     `db:"email_verified_at" json:"email_verified_at"`
	LastLoginAt     *time.Time     `db:"last_login_at" json:"last_login_at"`
	CreatedAt       time.Time      `db:"created_at" json:"created_at"`
	UpdatedAt       time.Time      `db:"updated_at" json:"updated_at"`
	DeletedAt       *time.Time     `db:"deleted_at" json:"deleted_at,omitempty"`
}

type GeneralMemberProfile struct {
	ID        string         `db:"id" json:"id"`
	UserID    string         `db:"user_id" json:"user_id"`
	FirstName string         `db:"first_name" json:"first_name"`
	LastName  string         `db:"last_name" json:"last_name"`
	Phone     sql.NullString `db:"phone" json:"phone"`
	Address   sql.NullString `db:"address" json:"address"`
	CreatedAt time.Time      `db:"created_at" json:"created_at"`
	UpdatedAt time.Time      `db:"updated_at" json:"updated_at"`
}

type UserWithProfile struct {
	User
	FirstName sql.NullString `db:"first_name" json:"first_name"`
	LastName  sql.NullString `db:"last_name" json:"last_name"`
	Phone     sql.NullString `db:"phone" json:"phone"`
}

type RefreshToken struct {
	ID        string     `db:"id" json:"id"`
	UserID    string     `db:"user_id" json:"user_id"`
	TokenHash string     `db:"token_hash" json:"-"`
	ExpiresAt time.Time  `db:"expires_at" json:"expires_at"`
	RevokedAt *time.Time `db:"revoked_at" json:"revoked_at"`
	CreatedAt time.Time  `db:"created_at" json:"created_at"`
}

type PasswordResetToken struct {
	ID        string     `db:"id" json:"id"`
	UserID    string     `db:"user_id" json:"user_id"`
	TokenHash string     `db:"token_hash" json:"-"`
	ExpiresAt time.Time  `db:"expires_at" json:"expires_at"`
	UsedAt    *time.Time `db:"used_at" json:"used_at"`
	CreatedAt time.Time  `db:"created_at" json:"created_at"`
}

// Request/Response DTOs

type RegisterRequest struct {
	Email     string   `json:"email" validate:"required,email"`
	Password  string   `json:"password" validate:"required,min=8"`
	Role      UserRole `json:"role" validate:"required,oneof=general_member association_main"`
	FirstName string   `json:"first_name" validate:"required_if=Role general_member"`
	LastName  string   `json:"last_name" validate:"required_if=Role general_member"`
	Phone     string   `json:"phone"`
	Address   string   `json:"address"`
	OrgName   string   `json:"org_name"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type LoginResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	User         *User  `json:"user"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

type LogoutRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email" validate:"required,email"`
}

type ResetPasswordRequest struct {
	Token       string `json:"token" validate:"required"`
	NewPassword string `json:"new_password" validate:"required,min=8"`
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" validate:"required"`
	NewPassword     string `json:"new_password" validate:"required,min=8"`
}

type UpdateProfileRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Phone     string `json:"phone"`
	Address   string `json:"address"`
}

type DashboardStats struct {
	TotalMembers            int64 `json:"total_members"`
	PendingRegistrations    int64 `json:"pending_registrations"`
	PendingPayments         int64 `json:"pending_payments"`
	ActiveCourses           int64 `json:"active_courses"`
	PendingSubUserRequests  int64 `json:"pending_sub_user_requests"`
}

type MonthlyEnrollment struct {
	Month string `json:"month" db:"month"`
	Count int64  `json:"count" db:"count"`
}

type DashboardRegistration struct {
	RegistrationID string    `json:"registration_id" db:"registration_id"`
	MemberID       string    `json:"member_id" db:"member_id"`
	MemberName     string    `json:"member_name" db:"member_name"`
	MemberEmail    string    `json:"member_email" db:"member_email"`
	CourseID       string    `json:"course_id" db:"course_id"`
	CourseTitle    string    `json:"course_title" db:"course_title"`
	SessionID      string    `json:"session_id" db:"session_id"`
	SessionLabel   string    `json:"session_label" db:"session_label"`
	Status         string    `json:"status" db:"status"`
	RegisteredAt   time.Time `json:"registered_at" db:"registered_at"`
}
