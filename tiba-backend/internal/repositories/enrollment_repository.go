package repositories

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/tiba/tiba-backend/internal/models"
)

var (
	ErrAlreadyEnrolled        = errors.New("already enrolled in this session")
	ErrEnrollmentWindowClosed = errors.New("enrollment window is closed")
	ErrSessionFull            = errors.New("session is full")
	ErrSessionNotFound        = errors.New("session not found")
)

type EnrollmentRepository struct {
	db *sqlx.DB
}

func NewEnrollmentRepository(db *sqlx.DB) *EnrollmentRepository {
	return &EnrollmentRepository{db: db}
}

func (r *EnrollmentRepository) ListAdminOrders(ctx context.Context, search, status string, limit, offset int) ([]models.AdminOrderItem, int64, error) {
	var total int64
	args := []interface{}{}
	where := "WHERE p.category = 'course_fee'"
	idx := 1

	if status != "" {
		where += fmt.Sprintf(" AND p.status::text = $%d", idx)
		args = append(args, status)
		idx++
	}
	if search != "" {
		where += fmt.Sprintf(" AND (u.email ILIKE $%d OR gmp.first_name ILIKE $%d OR gmp.last_name ILIKE $%d)", idx, idx, idx)
		args = append(args, "%"+search+"%")
		idx++
	}

	countQuery := `
		SELECT COUNT(*) FROM payments p
		JOIN users u ON u.id = p.user_id
		LEFT JOIN general_member_profiles gmp ON gmp.user_id = p.user_id
		` + where
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	query := fmt.Sprintf(`
		SELECT
			p.id AS order_id,
			COALESCE(gmp.first_name || ' ' || gmp.last_name, u.email) AS member_name,
			u.email AS member_email,
			COALESCE(c.title, '') AS course_title,
			cs.training_start,
			p.amount AS total_amount,
			p.status::text AS payment_status,
			p.slip_uploaded_at
		FROM payments p
		JOIN users u ON u.id = p.user_id
		LEFT JOIN general_member_profiles gmp ON gmp.user_id = p.user_id
		LEFT JOIN enrollments e ON e.id = p.enrollment_id
		LEFT JOIN course_sessions cs ON cs.id = e.session_id
		LEFT JOIN courses c ON c.id = cs.course_id
		%s
		ORDER BY p.created_at DESC
		LIMIT $%d OFFSET $%d`, where, idx, idx+1)
	args = append(args, limit, offset)

	var items []models.AdminOrderItem
	err := r.db.SelectContext(ctx, &items, query, args...)
	return items, total, err
}

func (r *EnrollmentRepository) ListMemberEnrollments(ctx context.Context, userID, status string, limit, offset int) ([]models.MemberEnrollmentItem, int64, error) {
	var total int64
	args := []interface{}{userID}
	where := "WHERE e.user_id = $1"
	idx := 2

	if status != "" {
		where += fmt.Sprintf(" AND e.status::text = $%d", idx)
		args = append(args, status)
		idx++
	}

	countQuery := `SELECT COUNT(*) FROM enrollments e ` + where
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	query := fmt.Sprintf(`
		SELECT
			e.id AS enrollment_id,
			c.title AS course_title,
			cs.id AS session_id,
			cs.training_start,
			cs.training_end,
			e.status::text AS enrollment_status,
			COALESCE(p.status::text, 'pending') AS payment_status,
			(e.certificate_path IS NOT NULL) AS certificate_available
		FROM enrollments e
		JOIN course_sessions cs ON cs.id = e.session_id
		JOIN courses c ON c.id = cs.course_id
		LEFT JOIN payments p ON p.enrollment_id = e.id AND p.category = 'course_fee'
		%s
		ORDER BY e.created_at DESC
		LIMIT $%d OFFSET $%d`, where, idx, idx+1)
	args = append(args, limit, offset)

	var items []models.MemberEnrollmentItem
	err := r.db.SelectContext(ctx, &items, query, args...)
	return items, total, err
}

func (r *EnrollmentRepository) ListMemberOrders(ctx context.Context, userID, status string, limit, offset int) ([]models.MemberOrderItem, int64, error) {
	var total int64
	args := []interface{}{userID}
	where := "WHERE p.user_id = $1 AND p.category = 'course_fee'"
	idx := 2

	if status != "" {
		where += fmt.Sprintf(" AND p.status::text = $%d", idx)
		args = append(args, status)
		idx++
	}

	countQuery := `SELECT COUNT(*) FROM payments p ` + where
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	query := fmt.Sprintf(`
		SELECT
			p.id AS order_id,
			COALESCE(c.title, '') AS course_title,
			p.amount AS total_amount,
			p.status::text AS payment_status,
			p.created_at,
			(p.slip_file_path IS NOT NULL) AS slip_uploaded
		FROM payments p
		LEFT JOIN enrollments e ON e.id = p.enrollment_id
		LEFT JOIN course_sessions cs ON cs.id = e.session_id
		LEFT JOIN courses c ON c.id = cs.course_id
		%s
		ORDER BY p.created_at DESC
		LIMIT $%d OFFSET $%d`, where, idx, idx+1)
	args = append(args, limit, offset)

	var items []models.MemberOrderItem
	err := r.db.SelectContext(ctx, &items, query, args...)
	return items, total, err
}

func (r *EnrollmentRepository) Enroll(ctx context.Context, userID, sessionID, userRole string) (*models.EnrollResponse, error) {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// 1. Lock session row and validate
	var session struct {
		ID              string    `db:"id"`
		CourseID        string    `db:"course_id"`
		SeatCapacity    *int16    `db:"seat_capacity"`
		EnrollmentStart time.Time `db:"enrollment_start"`
		EnrollmentEnd   time.Time `db:"enrollment_end"`
		IsCancelled     bool      `db:"is_cancelled"`
	}
	err = tx.GetContext(ctx, &session,
		`SELECT id, course_id, seat_capacity, enrollment_start, enrollment_end, is_cancelled
		 FROM course_sessions WHERE id=$1 FOR UPDATE`, sessionID)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrSessionNotFound
	}
	if err != nil {
		return nil, err
	}
	if session.IsCancelled {
		return nil, ErrEnrollmentWindowClosed
	}
	now := time.Now()
	if now.Before(session.EnrollmentStart) || now.After(session.EnrollmentEnd) {
		return nil, ErrEnrollmentWindowClosed
	}

	// 2. Check duplicate enrollment
	var existingCount int
	if err = tx.QueryRowContext(ctx,
		`SELECT COUNT(*) FROM enrollments WHERE session_id=$1 AND user_id=$2`,
		sessionID, userID).Scan(&existingCount); err != nil {
		return nil, err
	}
	if existingCount > 0 {
		return nil, ErrAlreadyEnrolled
	}

	// 3. Check seat availability
	if session.SeatCapacity != nil {
		var enrolledCount int
		if err = tx.QueryRowContext(ctx,
			`SELECT COUNT(*) FROM enrollments WHERE session_id=$1 AND status NOT IN ('cancelled','rejected')`,
			sessionID).Scan(&enrolledCount); err != nil {
			return nil, err
		}
		if enrolledCount >= int(*session.SeatCapacity) {
			return nil, ErrSessionFull
		}
	}

	// 4. Determine price based on role
	var priceGeneral sql.NullFloat64
	var priceAssociation sql.NullFloat64
	var priceType string
	if err = tx.QueryRowContext(ctx,
		`SELECT price_type, price_general, price_association FROM courses WHERE id=$1`,
		session.CourseID).Scan(&priceType, &priceGeneral, &priceAssociation); err != nil {
		return nil, err
	}
	var amount float64
	if (userRole == "association_main" || userRole == "association_sub") &&
		priceType == "dual" && priceAssociation.Valid {
		amount = priceAssociation.Float64
	} else if priceGeneral.Valid {
		amount = priceGeneral.Float64
	}

	// 5. Insert enrollment
	var enrollmentID string
	if err = tx.QueryRowContext(ctx,
		`INSERT INTO enrollments (session_id, user_id, status) VALUES ($1, $2, 'pending_payment') RETURNING id`,
		sessionID, userID).Scan(&enrollmentID); err != nil {
		return nil, err
	}

	// 6. Insert payment record
	var paymentID string
	if err = tx.QueryRowContext(ctx,
		`INSERT INTO payments (user_id, category, status, amount, enrollment_id) VALUES ($1, 'course_fee', 'pending', $2, $3) RETURNING id`,
		userID, amount, enrollmentID).Scan(&paymentID); err != nil {
		return nil, err
	}

	if err = tx.Commit(); err != nil {
		return nil, err
	}

	return &models.EnrollResponse{
		EnrollmentID:  enrollmentID,
		OrderID:       paymentID,
		TotalAmount:   amount,
		PaymentStatus: "pending",
	}, nil
}
