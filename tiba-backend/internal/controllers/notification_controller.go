package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/tiba/tiba-backend/internal/services"
	"github.com/tiba/tiba-backend/pkg/paginate"
	"github.com/tiba/tiba-backend/pkg/response"
)

type NotificationController struct {
	notifSvc *services.NotificationService
}

func NewNotificationController(notifSvc *services.NotificationService) *NotificationController {
	return &NotificationController{notifSvc: notifSvc}
}

// ListNotifications godoc
// GET /member/notifications
// Returns paginated notification list for the authenticated user.
func (ctrl *NotificationController) ListNotifications(c *gin.Context) {
	userID := c.GetString("user_id")
	p := paginate.Parse(c)

	items, total, err := ctrl.notifSvc.List(c.Request.Context(), userID, p.Page, p.PerPage)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	response.Paginated(c, http.StatusOK, items, response.Meta{
		Page:       p.Page,
		PerPage:    p.PerPage,
		Total:      total,
		TotalPages: paginate.TotalPages(total, p.PerPage),
	}, "Notifications retrieved")
}

// MarkRead godoc
// PUT /member/notifications/:id/read
func (ctrl *NotificationController) MarkRead(c *gin.Context) {
	userID := c.GetString("user_id")
	id := c.Param("id")

	if err := ctrl.notifSvc.MarkRead(c.Request.Context(), id, userID); err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	response.Success(c, http.StatusOK, nil, "Notification marked as read")
}

// MarkAllRead godoc
// PUT /member/notifications/read-all
func (ctrl *NotificationController) MarkAllRead(c *gin.Context) {
	userID := c.GetString("user_id")

	if err := ctrl.notifSvc.MarkAllRead(c.Request.Context(), userID); err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	response.Success(c, http.StatusOK, nil, "All notifications marked as read")
}

// UnreadCount godoc
// GET /member/notifications/unread-count
// Returns { count: N }
func (ctrl *NotificationController) UnreadCount(c *gin.Context) {
	userID := c.GetString("user_id")

	count, err := ctrl.notifSvc.UnreadCount(c.Request.Context(), userID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	response.Success(c, http.StatusOK, gin.H{"count": count}, "Unread count retrieved")
}
