package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/tiba/tiba-backend/internal/controllers"
)

func RegisterPublicRoutes(rg *gin.RouterGroup, contentCtrl *controllers.ContentController, courseCtrl *controllers.CourseController, pbCtrl *controllers.PriceBenefitController) {
	pub := rg.Group("/public")
	{
		pub.GET("/news", contentCtrl.ListPublicNews)
		pub.GET("/news/:slug", contentCtrl.GetPublicNewsBySlug)
		pub.GET("/banners", contentCtrl.ListPublicBanners)
		pub.GET("/ads", contentCtrl.ListPublicAds)
		pub.GET("/partners", contentCtrl.ListPublicPartners)
		pub.GET("/executives", contentCtrl.ListPublicExecutives)
		pub.GET("/statistics", contentCtrl.ListPublicStatistics)
		pub.GET("/courses", courseCtrl.ListPublicCourses)
		pub.GET("/courses/:id", courseCtrl.GetPublicCourse)
		pub.GET("/courses/:id/documents", courseCtrl.ListDocuments)
		pub.GET("/price-benefits", pbCtrl.ListPublicPlans)
		pub.GET("/contact", contentCtrl.GetPublicContact)
		pub.GET("/companies", contentCtrl.ListPublicCompanies)
	}
}
