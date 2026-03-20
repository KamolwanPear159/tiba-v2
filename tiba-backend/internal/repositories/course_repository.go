package repositories

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/jmoiron/sqlx"
	"github.com/tiba/tiba-backend/internal/models"
)

type CourseRepository struct {
	db *sqlx.DB
}

func NewCourseRepository(db *sqlx.DB) *CourseRepository {
	return &CourseRepository{db: db}
}

func (r *CourseRepository) List(ctx context.Context, search string, publishedOnly bool, limit, offset int) ([]models.Course, int64, error) {
	var courses []models.Course
	var total int64

	args := []interface{}{}
	where := "WHERE deleted_at IS NULL"
	idx := 1

	if publishedOnly {
		where += " AND is_published=true"
	}
	if search != "" {
		where += fmt.Sprintf(" AND title ILIKE $%d", idx)
		args = append(args, "%"+search+"%")
		idx++
	}

	err := r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM courses "+where, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	query := fmt.Sprintf("SELECT * FROM courses %s ORDER BY created_at DESC LIMIT $%d OFFSET $%d", where, idx, idx+1)
	args = append(args, limit, offset)
	err = r.db.SelectContext(ctx, &courses, query, args...)
	return courses, total, err
}

func (r *CourseRepository) FindByID(ctx context.Context, id string) (*models.Course, error) {
	var course models.Course
	err := r.db.GetContext(ctx, &course, `SELECT * FROM courses WHERE id=$1 AND deleted_at IS NULL`, id)
	if err != nil {
		return nil, err
	}
	return &course, nil
}

func (r *CourseRepository) Create(ctx context.Context, course *models.Course) error {
	return r.db.QueryRowxContext(ctx, `
		INSERT INTO courses (title, description, format, online_meeting_link, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
		VALUES ($1, NULLIF($2,''), $3, NULLIF($4,''), $5, $6, $7, NULLIF($8,''), $9, $10)
		RETURNING *`,
		course.Title, course.Description.String, course.Format, course.OnlineMeetingLink.String,
		course.PriceType, nullableFloat64(course.PriceGeneral), nullableFloat64(course.PriceAssociation),
		course.ThumbnailPath.String, course.IsPublished, course.CreatedBy,
	).StructScan(course)
}

func (r *CourseRepository) Update(ctx context.Context, course *models.Course) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE courses SET title=$1, description=NULLIF($2,''), format=$3, online_meeting_link=NULLIF($4,''),
		price_type=$5, price_general=$6, price_association=$7,
		thumbnail_path=NULLIF($8,''), is_published=$9 WHERE id=$10`,
		course.Title, course.Description.String, course.Format, course.OnlineMeetingLink.String,
		course.PriceType, nullableFloat64(course.PriceGeneral), nullableFloat64(course.PriceAssociation),
		course.ThumbnailPath.String, course.IsPublished, course.ID,
	)
	return err
}

func (r *CourseRepository) SoftDelete(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE courses SET deleted_at=now() WHERE id=$1`, id)
	return err
}

func (r *CourseRepository) UpdateStatus(ctx context.Context, id string, isPublished bool) error {
	_, err := r.db.ExecContext(ctx, `UPDATE courses SET is_published=$1 WHERE id=$2`, isPublished, id)
	return err
}

func (r *CourseRepository) ListSessions(ctx context.Context, courseID string) ([]models.CourseSession, error) {
	var sessions []models.CourseSession
	err := r.db.SelectContext(ctx, &sessions, `SELECT * FROM course_sessions WHERE course_id=$1 ORDER BY training_start`, courseID)
	return sessions, err
}

func (r *CourseRepository) FindSessionByID(ctx context.Context, id string) (*models.CourseSession, error) {
	var session models.CourseSession
	err := r.db.GetContext(ctx, &session, `SELECT * FROM course_sessions WHERE id=$1`, id)
	if err != nil {
		return nil, err
	}
	return &session, nil
}

func (r *CourseRepository) CreateSession(ctx context.Context, session *models.CourseSession) error {
	return r.db.QueryRowxContext(ctx, `
		INSERT INTO course_sessions (course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
		VALUES ($1, NULLIF($2,''), NULLIF($3,''), $4, $5, $6, $7, $8)
		RETURNING *`,
		session.CourseID, session.SessionLabel.String, session.Location.String, nullableInt16(session.SeatCapacity),
		session.EnrollmentStart, session.EnrollmentEnd, session.TrainingStart, session.TrainingEnd,
	).StructScan(session)
}

func (r *CourseRepository) UpdateSession(ctx context.Context, session *models.CourseSession) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE course_sessions SET session_label=NULLIF($1,''), location=NULLIF($2,''),
		seat_capacity=$3, enrollment_start=$4, enrollment_end=$5,
		training_start=$6, training_end=$7, is_cancelled=$8, cancel_reason=NULLIF($9,'')
		WHERE id=$10`,
		session.SessionLabel.String, session.Location.String, nullableInt16(session.SeatCapacity),
		session.EnrollmentStart, session.EnrollmentEnd, session.TrainingStart, session.TrainingEnd,
		session.IsCancelled, session.CancelReason.String, session.ID,
	)
	return err
}

func (r *CourseRepository) DeleteSession(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM course_sessions WHERE id=$1`, id)
	return err
}

func (r *CourseRepository) ListEnrollmentsForCalendar(ctx context.Context, month, year int) ([]map[string]interface{}, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT e.id, e.session_id, e.user_id, e.status, cs.training_start, cs.training_end, c.title as course_title
		FROM enrollments e
		JOIN course_sessions cs ON cs.id = e.session_id
		JOIN courses c ON c.id = cs.course_id
		WHERE EXTRACT(MONTH FROM cs.enrollment_start)=$1 AND EXTRACT(YEAR FROM cs.enrollment_start)=$2`,
		month, year)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []map[string]interface{}
	for rows.Next() {
		m := make(map[string]interface{})
		var id, sessionID, userID, status, title string
		var trainingStart, trainingEnd interface{}
		if err := rows.Scan(&id, &sessionID, &userID, &status, &trainingStart, &trainingEnd, &title); err != nil {
			continue
		}
		m["id"] = id
		m["session_id"] = sessionID
		m["user_id"] = userID
		m["status"] = status
		m["training_start"] = trainingStart
		m["training_end"] = trainingEnd
		m["course_title"] = title
		result = append(result, m)
	}
	return result, nil
}

func (r *CourseRepository) ListTrainingCalendar(ctx context.Context, month, year int) ([]map[string]interface{}, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT cs.id, cs.course_id, c.title as course_title, cs.training_start, cs.training_end, cs.location, cs.is_cancelled
		FROM course_sessions cs
		JOIN courses c ON c.id = cs.course_id
		WHERE EXTRACT(MONTH FROM cs.training_start)=$1 AND EXTRACT(YEAR FROM cs.training_start)=$2
		ORDER BY cs.training_start`,
		month, year)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []map[string]interface{}
	for rows.Next() {
		m := make(map[string]interface{})
		var id, courseID, title string
		var loc sql.NullString
		var trainingStart, trainingEnd interface{}
		var isCancelled bool
		if err := rows.Scan(&id, &courseID, &title, &trainingStart, &trainingEnd, &loc, &isCancelled); err != nil {
			continue
		}
		m["id"] = id
		m["course_id"] = courseID
		m["course_title"] = title
		m["training_start"] = trainingStart
		m["training_end"] = trainingEnd
		m["location"] = loc
		m["is_cancelled"] = isCancelled
		result = append(result, m)
	}
	return result, nil
}

func nullableFloat64(f sql.NullFloat64) interface{} {
	if !f.Valid {
		return nil
	}
	return f.Float64
}

func nullableInt16(i *int16) interface{} {
	if i == nil {
		return nil
	}
	return *i
}
