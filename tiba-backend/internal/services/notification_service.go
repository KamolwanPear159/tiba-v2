package services

import (
	"context"

	"github.com/tiba/tiba-backend/internal/models"
	"github.com/tiba/tiba-backend/internal/repositories"
)

type NotificationService struct {
	notifRepo *repositories.NotificationRepository
}

func NewNotificationService(notifRepo *repositories.NotificationRepository) *NotificationService {
	return &NotificationService{notifRepo: notifRepo}
}

// List returns a paginated list of notifications for the given user.
func (s *NotificationService) List(ctx context.Context, userID string, page, pageSize int) ([]models.Notification, int64, error) {
	offset := (page - 1) * pageSize
	return s.notifRepo.ListNotifications(ctx, userID, pageSize, offset)
}

// MarkRead marks a single notification as read, scoped to the owning user.
func (s *NotificationService) MarkRead(ctx context.Context, id, userID string) error {
	return s.notifRepo.MarkRead(ctx, id, userID)
}

// MarkAllRead marks every unread notification for the user as read.
func (s *NotificationService) MarkAllRead(ctx context.Context, userID string) error {
	return s.notifRepo.MarkAllRead(ctx, userID)
}

// UnreadCount returns the number of unread notifications for the user.
func (s *NotificationService) UnreadCount(ctx context.Context, userID string) (int64, error) {
	return s.notifRepo.CountUnread(ctx, userID)
}

// Create inserts a new notification record for the given user.
func (s *NotificationService) Create(ctx context.Context, userID, title, body, notifType, relatedID string) error {
	return s.notifRepo.CreateNotification(ctx, userID, title, body, notifType, relatedID)
}
