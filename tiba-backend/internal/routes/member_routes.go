package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/tiba/tiba-backend/internal/controllers"
	"github.com/tiba/tiba-backend/internal/middleware"
	"github.com/tiba/tiba-backend/internal/config"
)

func RegisterMemberRoutes(rg *gin.RouterGroup, userCtrl *controllers.UserController, enrollCtrl *controllers.EnrollmentController, cfg *config.Config) {
	member := rg.Group("/member")
	member.Use(middleware.AuthRequired(cfg))
	member.Use(middleware.RequireRole("general_member", "association_main", "association_sub"))
	{
		member.GET("/profile", userCtrl.GetAdminProfile)
		member.PATCH("/profile", userCtrl.UpdateAdminProfile)
		member.POST("/profile/change-password", userCtrl.ChangePassword)

		// Enrollments
		member.GET("/enrollments", enrollCtrl.MemberListEnrollments)
		member.POST("/enrollments", enrollCtrl.MemberEnroll)

		// Orders
		member.GET("/orders", enrollCtrl.MemberListOrders)
	}
}
