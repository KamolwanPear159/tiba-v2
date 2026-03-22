package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/tiba/tiba-backend/internal/controllers"
)

func RegisterAuthRoutes(rg *gin.RouterGroup, authCtrl *controllers.AuthController) {
	auth := rg.Group("/auth")
	{
		auth.POST("/send-otp", authCtrl.SendOTP)
		auth.POST("/verify-otp", authCtrl.VerifyOTP)
		auth.POST("/register/normal", authCtrl.RegisterNormal)
		auth.POST("/register/association", authCtrl.RegisterAssociation)
		auth.POST("/login", authCtrl.Login)
		auth.POST("/refresh", authCtrl.RefreshToken)
		auth.POST("/logout", authCtrl.Logout)
		auth.POST("/forgot-password", authCtrl.ForgotPassword)
		auth.POST("/reset-password", authCtrl.ResetPassword)
	}
}
