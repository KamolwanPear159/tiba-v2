package services

import (
	"context"
	"errors"
	"fmt"

	"github.com/tiba/tiba-backend/internal/models"
	"github.com/tiba/tiba-backend/internal/repositories"
)

var (
	ErrAlreadyEnrolled        = errors.New("already enrolled in this session")
	ErrEnrollmentWindowClosed = errors.New("enrollment window is closed")
	ErrSessionFull            = errors.New("session is full")
	ErrNotOwner               = errors.New("you do not own this enrollment")
)

type EnrollmentService struct {
	enrollRepo *repositories.EnrollmentRepository
	notifRepo  *repositories.NotificationRepository
}

func NewEnrollmentService(enrollRepo *repositories.EnrollmentRepository, notifRepo *repositories.NotificationRepository) *EnrollmentService {
	return &EnrollmentService{
		enrollRepo: enrollRepo,
		notifRepo:  notifRepo,
	}
}

// ---------- Member actions ----------

// MemberEnroll creates an enrollment + pending payment for a session.
func (s *EnrollmentService) MemberEnroll(ctx context.Context, userID, sessionID string) (*models.Payment, error) {
	enrollment, err := s.enrollRepo.CreateEnrollment(ctx, sessionID, userID)
	if err != nil {
		return nil, err
	}

	payment, err := s.enrollRepo.CreatePayment(ctx, userID, "course_fee", "0", nil, &enrollment.ID)
	if err != nil {
		return nil, err
	}
	return payment, nil
}

// UploadSlip validates ownership then records the payment slip path.
func (s *EnrollmentService) UploadSlip(ctx context.Context, enrollmentID, userID, slipPath string) error {
	enrollment, err := s.enrollRepo.FindEnrollmentByID(ctx, enrollmentID)
	if err != nil {
		return err
	}
	if enrollment.UserID != userID {
		return ErrNotOwner
	}

	payment, err := s.enrollRepo.FindPaymentByEnrollment(ctx, enrollmentID)
	if err != nil {
		return err
	}

	return s.enrollRepo.UpdatePaymentSlip(ctx, payment.ID, slipPath)
}

// MemberListEnrollments returns a paginated list of enrollments for a member.
func (s *EnrollmentService) MemberListEnrollments(ctx context.Context, userID string, page, pageSize int) ([]models.EnrollmentWithDetails, int64, error) {
	offset := (page - 1) * pageSize
	return s.enrollRepo.ListMemberEnrollments(ctx, userID, pageSize, offset)
}

// MemberListPayments returns a paginated list of course payments for a member.
func (s *EnrollmentService) MemberListPayments(ctx context.Context, userID string, page, pageSize int) ([]models.PaymentWithDetails, int64, error) {
	offset := (page - 1) * pageSize
	return s.enrollRepo.ListMemberPayments(ctx, userID, pageSize, offset)
}

// ---------- Admin actions ----------

// AdminListOrders returns paginated payment orders, optionally filtered by status.
func (s *EnrollmentService) AdminListOrders(ctx context.Context, status string, page, pageSize int) ([]models.PaymentWithDetails, int64, error) {
	offset := (page - 1) * pageSize
	return s.enrollRepo.AdminListOrders(ctx, status, pageSize, offset)
}

// AdminConfirmPayment confirms a payment and notifies the member.
func (s *EnrollmentService) AdminConfirmPayment(ctx context.Context, paymentID, adminID string) error {
	payment, err := s.enrollRepo.FindPaymentByID(ctx, paymentID)
	if err != nil {
		return err
	}

	if err := s.enrollRepo.ConfirmPayment(ctx, paymentID, adminID); err != nil {
		return err
	}

	_ = s.notifRepo.CreateNotification(ctx,
		payment.UserID,
		"การชำระเงินได้รับการยืนยัน",
		fmt.Sprintf("การชำระเงินสำหรับคำสั่งซื้อ #%s ของคุณได้รับการยืนยันแล้ว", paymentID),
		"payment_confirmed",
		paymentID,
	)
	return nil
}

// AdminRejectPayment rejects a payment and notifies the member.
func (s *EnrollmentService) AdminRejectPayment(ctx context.Context, paymentID, adminID, note string) error {
	payment, err := s.enrollRepo.FindPaymentByID(ctx, paymentID)
	if err != nil {
		return err
	}

	if err := s.enrollRepo.RejectPayment(ctx, paymentID, adminID, note); err != nil {
		return err
	}

	_ = s.notifRepo.CreateNotification(ctx,
		payment.UserID,
		"การชำระเงินถูกปฏิเสธ",
		fmt.Sprintf("การชำระเงินสำหรับคำสั่งซื้อ #%s ถูกปฏิเสธ: %s", paymentID, note),
		"payment_rejected",
		paymentID,
	)
	return nil
}

// IssueCertificate records the certificate path on the enrollment.
func (s *EnrollmentService) IssueCertificate(ctx context.Context, enrollmentID, certPath, adminID string) error {
	return s.enrollRepo.IssueCertificate(ctx, enrollmentID, certPath, adminID)
}

// MemberListCertificates returns all enrollments that have an issued certificate.
func (s *EnrollmentService) MemberListCertificates(ctx context.Context, userID string) ([]models.EnrollmentWithDetails, error) {
	return s.enrollRepo.ListMemberCertificates(ctx, userID)
}

// GetPaymentByID returns a single payment by ID.
func (s *EnrollmentService) GetPaymentByID(ctx context.Context, id string) (*models.Payment, error) {
	return s.enrollRepo.FindPaymentByID(ctx, id)
}

// ---------- Legacy methods preserved for existing controller code ----------

func (s *EnrollmentService) ListAdminOrders(ctx context.Context, search, status string, limit, offset int) ([]models.AdminOrderItem, int64, error) {
	return s.enrollRepo.ListAdminOrders(ctx, search, status, limit, offset)
}

func (s *EnrollmentService) ListMemberEnrollmentsLegacy(ctx context.Context, userID, status string, limit, offset int) ([]models.MemberEnrollmentItem, int64, error) {
	return s.enrollRepo.ListMemberEnrollmentsLegacy(ctx, userID, status, limit, offset)
}

func (s *EnrollmentService) ListMemberOrders(ctx context.Context, userID, status string, limit, offset int) ([]models.MemberOrderItem, int64, error) {
	return s.enrollRepo.ListMemberOrders(ctx, userID, status, limit, offset)
}

func (s *EnrollmentService) Enroll(ctx context.Context, userID, sessionID, userRole string) (*models.EnrollResponse, error) {
	result, err := s.enrollRepo.Enroll(ctx, userID, sessionID, userRole)
	if err != nil {
		switch err {
		case repositories.ErrAlreadyEnrolled:
			return nil, ErrAlreadyEnrolled
		case repositories.ErrEnrollmentWindowClosed:
			return nil, ErrEnrollmentWindowClosed
		case repositories.ErrSessionFull:
			return nil, ErrSessionFull
		}
		return nil, err
	}
	return result, nil
}
