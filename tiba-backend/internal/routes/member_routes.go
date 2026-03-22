package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/tiba/tiba-backend/internal/config"
	"github.com/tiba/tiba-backend/internal/controllers"
	"github.com/tiba/tiba-backend/internal/middleware"
)

// RegisterMemberRoutes mounts all authenticated member endpoints under /member.
// Allowed roles: general_member, association_main, association_sub.
func RegisterMemberRoutes(
	rg *gin.RouterGroup,
	userCtrl *controllers.UserController,
	enrollCtrl *controllers.EnrollmentController,
	assocCtrl *controllers.AssociationController,
	notifCtrl *controllers.NotificationController,
	cfg *config.Config,
) {
	member := rg.Group("/member")
	member.Use(middleware.AuthRequired(cfg))
	member.Use(middleware.RequireRole("general_member", "association_main", "association_sub"))
	{
		// Profile
		member.GET("/profile", userCtrl.GetAdminProfile)
		member.PATCH("/profile", userCtrl.UpdateAdminProfile)
		member.POST("/profile/change-password", userCtrl.ChangePassword)

		// Enrollments
		member.GET("/enrollments", enrollCtrl.MemberListEnrollments)
		member.POST("/enrollments", enrollCtrl.MemberEnroll)
		member.POST("/enrollments/:id/slip", enrollCtrl.MemberUploadSlip)

		// Payments
		member.GET("/payments", enrollCtrl.MemberListPayments)

		// Certificates
		member.GET("/certificates", enrollCtrl.MemberListCertificates)

		// Notifications
		member.GET("/notifications", notifCtrl.ListNotifications)
		member.PUT("/notifications/:id/read", notifCtrl.MarkRead)
		member.PUT("/notifications/read-all", notifCtrl.MarkAllRead)
		member.GET("/notifications/unread-count", notifCtrl.UnreadCount)

		// Sub-member request (association_main only in practice, guard in service)
		member.POST("/sub-member/request", assocCtrl.RequestSubMember)
	}
}
