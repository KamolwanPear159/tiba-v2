package main

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/tiba/tiba-backend/internal/config"
	"github.com/tiba/tiba-backend/internal/controllers"
	"github.com/tiba/tiba-backend/internal/repositories"
	"github.com/tiba/tiba-backend/internal/routes"
	"github.com/tiba/tiba-backend/internal/services"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize database
	db, err := config.InitDB(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()
	log.Println("Database connected successfully")

	// Set Gin mode
	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize repositories
	userRepo := repositories.NewUserRepository(db)
	assocRepo := repositories.NewAssociationRepository(db)
	courseRepo := repositories.NewCourseRepository(db)
	contentRepo := repositories.NewContentRepository(db)
	pbRepo := repositories.NewPriceBenefitRepository(db)
	enrollRepo := repositories.NewEnrollmentRepository(db)

	// Initialize services
	authService := services.NewAuthService(userRepo, assocRepo, cfg)
	userService := services.NewUserService(userRepo)
	assocService := services.NewAssociationService(assocRepo, userRepo)
	courseService := services.NewCourseService(courseRepo)
	contentService := services.NewContentService(contentRepo)
	pbService := services.NewPriceBenefitService(pbRepo)
	enrollService := services.NewEnrollmentService(enrollRepo)

	// Initialize controllers
	authCtrl := controllers.NewAuthController(authService)
	userCtrl := controllers.NewUserController(userService)
	assocCtrl := controllers.NewAssociationController(assocService)
	courseCtrl := controllers.NewCourseController(courseService, cfg)
	contentCtrl := controllers.NewContentController(contentService, cfg)
	pbCtrl := controllers.NewPriceBenefitController(pbService)
	enrollCtrl := controllers.NewEnrollmentController(enrollService)

	// Setup router
	router := gin.New()
	router.MaxMultipartMemory = cfg.MaxFileSize

	routes.Setup(router, cfg, authCtrl, userCtrl, assocCtrl, contentCtrl, courseCtrl, pbCtrl, enrollCtrl)

	// Start server
	addr := fmt.Sprintf(":%s", cfg.ServerPort)
	log.Printf("TIBA Backend v2.0.0 starting on %s (env: %s)", addr, cfg.Env)
	if err := router.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
