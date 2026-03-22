package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/tiba/tiba-backend/internal/config"
	"github.com/tiba/tiba-backend/internal/controllers"
	"github.com/tiba/tiba-backend/internal/middleware"
)

func RegisterAdminRoutes(
	rg *gin.RouterGroup,
	userCtrl *controllers.UserController,
	assocCtrl *controllers.AssociationController,
	contentCtrl *controllers.ContentController,
	courseCtrl *controllers.CourseController,
	pbCtrl *controllers.PriceBenefitController,
	enrollCtrl *controllers.EnrollmentController,
	cfg *config.Config,
) {
	admin := rg.Group("/admin")
	admin.Use(middleware.AuthRequired(cfg))
	admin.Use(middleware.RequireRole("admin"))
	{
		// Dashboard
		admin.GET("/dashboard/stats", userCtrl.GetDashboardStats)
		admin.GET("/dashboard/monthly-enrollments", userCtrl.GetMonthlyEnrollments)
		admin.GET("/dashboard/recent-registrations", userCtrl.GetRecentRegistrations)

		// Admin profile
		admin.GET("/profile", userCtrl.GetAdminProfile)
		admin.PATCH("/profile", userCtrl.UpdateAdminProfile)
		admin.POST("/profile/change-password", userCtrl.ChangePassword)

		// Members
		admin.GET("/members", userCtrl.ListMembers)
		admin.GET("/members/:id", userCtrl.GetMember)
		admin.PATCH("/members/:id/status", userCtrl.UpdateMemberStatus)

		// Orders
		admin.GET("/orders", enrollCtrl.AdminListOrders)
		admin.GET("/orders/:id", enrollCtrl.AdminGetOrder)
		admin.PUT("/orders/:id/confirm", enrollCtrl.AdminConfirmPayment)
		admin.PUT("/orders/:id/reject", enrollCtrl.AdminRejectPayment)

		// Enrollment certificates
		admin.POST("/enrollments/:id/certificate", enrollCtrl.AdminIssueCertificate)

		// Registrations (association)
		admin.GET("/registrations", assocCtrl.AdminListRegistrations)
		admin.GET("/registrations/:id", assocCtrl.AdminGetRegistration)
		admin.PATCH("/registrations/:id/status", assocCtrl.AdminUpdateRegistrationStatus)

		// Sub user requests
		admin.GET("/sub-user-requests", assocCtrl.AdminListSubUserRequests)
		admin.PATCH("/sub-user-requests/:id", assocCtrl.AdminUpdateSubUserRequest)

		// Admin user management
		admin.GET("/users", userCtrl.ListAdminUsers)
		admin.POST("/users", userCtrl.CreateAdminUser)
		admin.PATCH("/users/:id/status", userCtrl.UpdateAdminUserStatus)

		// Activity logs
		admin.GET("/activity-logs", userCtrl.ListActivityLogs)

		// Tutors
		admin.GET("/tutors", contentCtrl.AdminListTutors)
		admin.POST("/tutors", contentCtrl.AdminCreateTutor)
		admin.GET("/tutors/:id", contentCtrl.AdminGetTutor)
		admin.PUT("/tutors/:id", contentCtrl.AdminUpdateTutor)
		admin.DELETE("/tutors/:id", contentCtrl.AdminDeleteTutor)
		admin.PATCH("/tutors/:id/status", contentCtrl.AdminToggleTutorStatus)

		// News/Articles
		admin.GET("/news", contentCtrl.AdminListNews)
		admin.POST("/news", contentCtrl.AdminCreateNews)
		admin.GET("/news/:id", contentCtrl.AdminGetNews)
		admin.PUT("/news/:id", contentCtrl.AdminUpdateNews)
		admin.DELETE("/news/:id", contentCtrl.AdminDeleteNews)

		// Banners
		admin.GET("/banners", contentCtrl.AdminListBanners)
		admin.POST("/banners", contentCtrl.AdminCreateBanner)
		admin.PUT("/banners/:id", contentCtrl.AdminUpdateBanner)
		admin.DELETE("/banners/:id", contentCtrl.AdminDeleteBanner)
		admin.PATCH("/banners/:id/status", contentCtrl.AdminToggleBannerStatus)

		// Ads
		admin.GET("/ads", contentCtrl.AdminListAds)
		admin.POST("/ads", contentCtrl.AdminCreateAd)
		admin.PUT("/ads/:id", contentCtrl.AdminUpdateAd)
		admin.DELETE("/ads/:id", contentCtrl.AdminDeleteAd)

		// Partners
		admin.GET("/partners", contentCtrl.AdminListPartners)
		admin.POST("/partners", contentCtrl.AdminCreatePartner)
		admin.PUT("/partners/:id", contentCtrl.AdminUpdatePartner)
		admin.DELETE("/partners/:id", contentCtrl.AdminDeletePartner)

		// Executives
		admin.GET("/executives", contentCtrl.AdminListExecutives)
		admin.POST("/executives", contentCtrl.AdminCreateExecutive)
		admin.PUT("/executives/:id", contentCtrl.AdminUpdateExecutive)
		admin.DELETE("/executives/:id", contentCtrl.AdminDeleteExecutive)

		// Statistics
		admin.GET("/statistics", contentCtrl.AdminListStatistics)
		admin.POST("/statistics", contentCtrl.AdminCreateStatistics)
		admin.PUT("/statistics/:id", contentCtrl.AdminUpdateStatistics)
		admin.DELETE("/statistics/:id", contentCtrl.AdminDeleteStatistics)

		// Contact
		admin.GET("/contact", contentCtrl.AdminGetContact)
		admin.PUT("/contact", contentCtrl.AdminUpdateContact)

		// Companies
		admin.GET("/companies", contentCtrl.AdminListCompanies)
		admin.POST("/companies", contentCtrl.AdminCreateCompany)
		admin.PUT("/companies/:id", contentCtrl.AdminUpdateCompany)
		admin.DELETE("/companies/:id", contentCtrl.AdminDeleteCompany)

		// Price Benefits
		admin.GET("/price-benefits", pbCtrl.AdminListPlans)
		admin.PUT("/price-benefits/:id", pbCtrl.AdminUpdatePlan)
		admin.GET("/price-benefits/:id/conditions", pbCtrl.AdminListConditions)
		admin.POST("/price-benefits/:id/conditions", pbCtrl.AdminCreateCondition)
		admin.PUT("/price-benefits/:id/conditions/:cid", pbCtrl.AdminUpdateCondition)
		admin.DELETE("/price-benefits/:id/conditions/:cid", pbCtrl.AdminDeleteCondition)

		// Courses
		admin.GET("/courses", courseCtrl.ListAdminCourses)
		admin.POST("/courses", courseCtrl.CreateCourse)
		admin.GET("/courses/:id", courseCtrl.GetAdminCourse)
		admin.PUT("/courses/:id", courseCtrl.UpdateCourse)
		admin.DELETE("/courses/:id", courseCtrl.DeleteCourse)
		admin.PUT("/courses/:id/tutors", courseCtrl.SetCourseTutors)
		admin.PATCH("/courses/:id/status", courseCtrl.UpdateCourseStatus)
		admin.GET("/courses/:id/sessions", courseCtrl.ListSessions)
		admin.POST("/courses/:id/sessions", courseCtrl.CreateSession)

		// Course thumbnail
		admin.POST("/courses/:id/thumbnail", courseCtrl.UploadThumbnail)

		// Course documents
		admin.GET("/courses/:id/documents", courseCtrl.ListDocuments)
		admin.POST("/courses/:id/documents", courseCtrl.AddDocument)
		admin.PUT("/courses/:id/documents/:doc_id", courseCtrl.UpdateDocument)
		admin.DELETE("/courses/:id/documents/:doc_id", courseCtrl.DeleteDocument)

		// Sessions
		admin.GET("/sessions/:id", courseCtrl.GetSession)
		admin.PUT("/sessions/:id", courseCtrl.UpdateSession)
		admin.DELETE("/sessions/:id", courseCtrl.DeleteSession)

		// Calendar
		admin.GET("/calendar/enrollments", courseCtrl.GetEnrollmentCalendar)
		admin.GET("/calendar/training", courseCtrl.GetTrainingCalendar)
	}
}
