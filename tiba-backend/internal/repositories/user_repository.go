package repositories

import (
	"context"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/tiba/tiba-backend/internal/models"
)

type UserRepository struct {
	db *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	err := r.db.GetContext(ctx, &user, `SELECT * FROM users WHERE email=$1 AND deleted_at IS NULL`, email)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) FindByID(ctx context.Context, id string) (*models.User, error) {
	var user models.User
	err := r.db.GetContext(ctx, &user, `SELECT * FROM users WHERE id=$1 AND deleted_at IS NULL`, id)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) Create(ctx context.Context, tx *sqlx.Tx, email, passwordHash string, role models.UserRole) (*models.User, error) {
	query := `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING *`
	var user models.User
	var err error
	if tx != nil {
		err = tx.QueryRowxContext(ctx, query, email, passwordHash, role).StructScan(&user)
	} else {
		err = r.db.QueryRowxContext(ctx, query, email, passwordHash, role).StructScan(&user)
	}
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) CreateGeneralProfile(ctx context.Context, tx *sqlx.Tx, userID, firstName, lastName, phone, address string) error {
	query := `INSERT INTO general_member_profiles (user_id, first_name, last_name, phone, address) VALUES ($1, $2, $3, NULLIF($4,''), NULLIF($5,''))`
	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query, userID, firstName, lastName, phone, address)
	} else {
		_, err = r.db.ExecContext(ctx, query, userID, firstName, lastName, phone, address)
	}
	return err
}

func (r *UserRepository) UpdateLastLogin(ctx context.Context, userID string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE users SET last_login_at=$1 WHERE id=$2`, time.Now(), userID)
	return err
}

func (r *UserRepository) UpdatePassword(ctx context.Context, userID, passwordHash string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE users SET password_hash=$1 WHERE id=$2`, passwordHash, userID)
	return err
}

func (r *UserRepository) UpdateStatus(ctx context.Context, userID string, isActive bool) error {
	_, err := r.db.ExecContext(ctx, `UPDATE users SET is_active=$1 WHERE id=$2`, isActive, userID)
	return err
}

func (r *UserRepository) SoftDelete(ctx context.Context, userID string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE users SET deleted_at=$1 WHERE id=$2`, time.Now(), userID)
	return err
}

func (r *UserRepository) List(ctx context.Context, search, role string, limit, offset int) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	args := []interface{}{}
	where := "WHERE u.deleted_at IS NULL"
	idx := 1

	if search != "" {
		where += fmt.Sprintf(" AND (u.email ILIKE $%d)", idx)
		args = append(args, "%"+search+"%")
		idx++
	}
	if role != "" {
		where += fmt.Sprintf(" AND u.role = $%d", idx)
		args = append(args, role)
		idx++
	}

	countQuery := "SELECT COUNT(*) FROM users u " + where
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	query := fmt.Sprintf("SELECT u.* FROM users u %s ORDER BY u.created_at DESC LIMIT $%d OFFSET $%d", where, idx, idx+1)
	args = append(args, limit, offset)
	err = r.db.SelectContext(ctx, &users, query, args...)
	if err != nil {
		return nil, 0, err
	}
	return users, total, nil
}

func (r *UserRepository) GetProfile(ctx context.Context, userID string) (*models.GeneralMemberProfile, error) {
	var profile models.GeneralMemberProfile
	err := r.db.GetContext(ctx, &profile, `SELECT * FROM general_member_profiles WHERE user_id=$1`, userID)
	if err != nil {
		return nil, err
	}
	return &profile, nil
}

func (r *UserRepository) UpdateProfile(ctx context.Context, userID, firstName, lastName, phone, address string) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE general_member_profiles SET first_name=$1, last_name=$2, phone=NULLIF($3,''), address=NULLIF($4,'') WHERE user_id=$5`,
		firstName, lastName, phone, address, userID)
	return err
}

func (r *UserRepository) CreateRefreshToken(ctx context.Context, userID, tokenHash string, expiresAt time.Time) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
		userID, tokenHash, expiresAt)
	return err
}

func (r *UserRepository) FindRefreshToken(ctx context.Context, tokenHash string) (*models.RefreshToken, error) {
	var rt models.RefreshToken
	err := r.db.GetContext(ctx, &rt,
		`SELECT * FROM refresh_tokens WHERE token_hash=$1 AND revoked_at IS NULL AND expires_at > now()`,
		tokenHash)
	if err != nil {
		return nil, err
	}
	return &rt, nil
}

func (r *UserRepository) RevokeRefreshToken(ctx context.Context, tokenHash string) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE refresh_tokens SET revoked_at=$1 WHERE token_hash=$2`,
		time.Now(), tokenHash)
	return err
}

func (r *UserRepository) RevokeAllUserTokens(ctx context.Context, userID string) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE refresh_tokens SET revoked_at=$1 WHERE user_id=$2 AND revoked_at IS NULL`,
		time.Now(), userID)
	return err
}

func (r *UserRepository) CreatePasswordResetToken(ctx context.Context, userID, tokenHash string, expiresAt time.Time) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
		userID, tokenHash, expiresAt)
	return err
}

func (r *UserRepository) FindPasswordResetToken(ctx context.Context, tokenHash string) (*models.PasswordResetToken, error) {
	var prt models.PasswordResetToken
	err := r.db.GetContext(ctx, &prt,
		`SELECT * FROM password_reset_tokens WHERE token_hash=$1 AND used_at IS NULL AND expires_at > now()`,
		tokenHash)
	if err != nil {
		return nil, err
	}
	return &prt, nil
}

func (r *UserRepository) MarkPasswordResetTokenUsed(ctx context.Context, tokenHash string) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE password_reset_tokens SET used_at=$1 WHERE token_hash=$2`,
		time.Now(), tokenHash)
	return err
}

func (r *UserRepository) CountByRole(ctx context.Context, role string) (int64, error) {
	var count int64
	err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM users WHERE role=$1 AND deleted_at IS NULL`, role).Scan(&count)
	return count, err
}

func (r *UserRepository) BeginTx(ctx context.Context) (*sqlx.Tx, error) {
	return r.db.BeginTxx(ctx, nil)
}

func (r *UserRepository) CreateAdminUser(ctx context.Context, email, passwordHash string) (*models.User, error) {
	var user models.User
	err := r.db.QueryRowxContext(ctx,
		`INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'admin') RETURNING *`,
		email, passwordHash).StructScan(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) FindAdminUsers(ctx context.Context) ([]models.User, error) {
	var users []models.User
	err := r.db.SelectContext(ctx, &users, `SELECT * FROM users WHERE role='admin' AND deleted_at IS NULL ORDER BY created_at DESC`)
	return users, err
}

func (r *UserRepository) GetDashboardStats(ctx context.Context) (*models.DashboardStats, error) {
	var s models.DashboardStats
	row := r.db.QueryRowContext(ctx, `
		SELECT
			(SELECT COUNT(*) FROM users WHERE role IN ('general_member','association_main') AND deleted_at IS NULL),
			(SELECT COUNT(*) FROM association_registrations WHERE status IN ('in_progress_first','in_progress_second_review','in_progress_second_payment')),
			(SELECT COUNT(*) FROM payments WHERE status = 'pending'),
			(SELECT COUNT(*) FROM course_sessions WHERE is_cancelled = false AND training_end >= CURRENT_DATE),
			(SELECT COUNT(*) FROM association_sub_users WHERE invite_status = 'pending')
	`)
	err := row.Scan(&s.TotalMembers, &s.PendingRegistrations, &s.PendingPayments, &s.ActiveCourses, &s.PendingSubUserRequests)
	return &s, err
}

func (r *UserRepository) GetMonthlyEnrollments(ctx context.Context) ([]models.MonthlyEnrollment, error) {
	var result []models.MonthlyEnrollment
	err := r.db.SelectContext(ctx, &result, `
		SELECT
			TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
			COUNT(*) AS count
		FROM enrollments
		WHERE created_at >= NOW() - INTERVAL '12 months'
		GROUP BY DATE_TRUNC('month', created_at)
		ORDER BY DATE_TRUNC('month', created_at)
	`)
	return result, err
}

func (r *UserRepository) GetRecentRegistrations(ctx context.Context) ([]models.DashboardRegistration, error) {
	var result []models.DashboardRegistration
	err := r.db.SelectContext(ctx, &result, `
		SELECT
			e.id AS registration_id,
			u.id AS member_id,
			COALESCE(gmp.first_name || ' ' || gmp.last_name, u.email) AS member_name,
			u.email AS member_email,
			c.id AS course_id,
			c.title AS course_title,
			cs.id AS session_id,
			COALESCE(cs.session_label, '') AS session_label,
			e.status::text AS status,
			e.created_at AS registered_at
		FROM enrollments e
		JOIN course_sessions cs ON cs.id = e.session_id
		JOIN courses c ON c.id = cs.course_id
		JOIN users u ON u.id = e.user_id
		LEFT JOIN general_member_profiles gmp ON gmp.user_id = e.user_id
		ORDER BY e.created_at DESC
		LIMIT 5
	`)
	return result, err
}

func (r *UserRepository) ListActivityLogs(ctx context.Context, limit, offset int) ([]models.AdminActivityLog, int64, error) {
	var logs []models.AdminActivityLog
	var total int64
	err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM admin_activity_logs`).Scan(&total)
	if err != nil {
		return nil, 0, err
	}
	err = r.db.SelectContext(ctx, &logs, `SELECT * FROM admin_activity_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2`, limit, offset)
	return logs, total, err
}

func (r *UserRepository) InsertActivityLog(ctx context.Context, entry models.AdminActivityLog) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO admin_activity_logs (admin_id, action_category, action_verb, target_table, target_id, description, ip_address) VALUES ($1,$2,$3,NULLIF($4,''),NULLIF($5,''),NULLIF($6,''),NULLIF($7,''))`,
		entry.AdminID, entry.ActionCategory, entry.ActionVerb,
		entry.TargetTable.String,
		entry.TargetID.String,
		entry.Description.String,
		entry.IPAddress.String,
	)
	return err
}
