package repositories

import (
	"context"
	"database/sql"
	"errors"

	"github.com/jmoiron/sqlx"
	"github.com/tiba/tiba-backend/internal/models"
)

var ErrNotificationNotFound = errors.New("notification not found")

type NotificationRepository struct {
	db *sqlx.DB
}

func NewNotificationRepository(db *sqlx.DB) *NotificationRepository {
	return &NotificationRepository{db: db}
}

// CreateNotification inserts a new notification row.
func (r *NotificationRepository) CreateNotification(ctx context.Context, userID, title, body, notifType, relatedID string) error {
	var relID *string
	if relatedID != "" {
		relID = &relatedID
	}
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO notifications (user_id, title, body, type, is_read, related_id)
		 VALUES ($1, $2, $3, $4, FALSE, $5)`,
		userID, title, body, notifType, relID,
	)
	return err
}

// ListNotifications returns a paginated list of notifications for a user.
func (r *NotificationRepository) ListNotifications(ctx context.Context, userID string, limit, offset int) ([]models.Notification, int64, error) {
	var total int64
	if err := r.db.QueryRowContext(ctx,
		`SELECT COUNT(*) FROM notifications WHERE user_id = $1`, userID,
	).Scan(&total); err != nil {
		return nil, 0, err
	}

	var items []models.Notification
	err := r.db.SelectContext(ctx, &items,
		`SELECT id, user_id, title, body, type, is_read, related_id, created_at
		 FROM notifications
		 WHERE user_id = $1
		 ORDER BY created_at DESC
		 LIMIT $2 OFFSET $3`,
		userID, limit, offset,
	)
	return items, total, err
}

// MarkRead marks a single notification as read, validating ownership.
func (r *NotificationRepository) MarkRead(ctx context.Context, notifID, userID string) error {
	res, err := r.db.ExecContext(ctx,
		`UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2`,
		notifID, userID,
	)
	if err != nil {
		return err
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return ErrNotificationNotFound
	}
	return nil
}

// MarkAllRead marks every unread notification for a user as read.
func (r *NotificationRepository) MarkAllRead(ctx context.Context, userID string) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE`,
		userID,
	)
	return err
}

// CountUnread returns the number of unread notifications for a user.
func (r *NotificationRepository) CountUnread(ctx context.Context, userID string) (int64, error) {
	var count int64
	err := r.db.QueryRowContext(ctx,
		`SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE`, userID,
	).Scan(&count)
	if errors.Is(err, sql.ErrNoRows) {
		return 0, nil
	}
	return count, err
}
