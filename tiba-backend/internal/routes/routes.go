package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/tiba/tiba-backend/internal/config"
	"github.com/tiba/tiba-backend/internal/controllers"
	"github.com/tiba/tiba-backend/internal/middleware"
)

func Setup(
	router *gin.Engine,
	cfg *config.Config,
	authCtrl *controllers.AuthController,
	userCtrl *controllers.UserController,
	assocCtrl *controllers.AssociationController,
	contentCtrl *controllers.ContentController,
	courseCtrl *controllers.CourseController,
	pbCtrl *controllers.PriceBenefitController,
	enrollCtrl *controllers.EnrollmentController,
) {
	// Global middleware
	router.Use(middleware.Logger())
	router.Use(middleware.CORS(cfg))

	// Static file serving for uploads
	router.Static("/uploads", cfg.UploadDir)

	// API v1
	v1 := router.Group("/api/v1")

	RegisterAuthRoutes(v1, authCtrl)
	RegisterPublicRoutes(v1, contentCtrl, courseCtrl, pbCtrl)
	RegisterMemberRoutes(v1, userCtrl, enrollCtrl, cfg)
	RegisterAdminRoutes(v1, userCtrl, assocCtrl, contentCtrl, courseCtrl, pbCtrl, enrollCtrl, cfg)

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "version": "2.0.0"})
	})
}
