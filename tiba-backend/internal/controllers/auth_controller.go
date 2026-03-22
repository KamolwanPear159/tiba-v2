package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/tiba/tiba-backend/internal/models"
	"github.com/tiba/tiba-backend/internal/services"
	"github.com/tiba/tiba-backend/pkg/response"
)

type AuthController struct {
	authService *services.AuthService
	validate    *validator.Validate
}

func NewAuthController(authService *services.AuthService) *AuthController {
	return &AuthController{
		authService: authService,
		validate:    validator.New(),
	}
}

// SendOTP godoc
// POST /auth/send-otp
// Body: { email, purpose: "register"|"forgot_password"|"sub_member" }
func (ctrl *AuthController) SendOTP(c *gin.Context) {
	var req models.SendOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	if err := ctrl.validate.Struct(req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	if err := ctrl.authService.SendOTP(c.Request.Context(), &req); err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	response.Success(c, http.StatusOK, nil, "OTP sent successfully")
}

// VerifyOTP godoc
// POST /auth/verify-otp
// Body: { email, code, purpose }
// Returns: { valid: true }
func (ctrl *AuthController) VerifyOTP(c *gin.Context) {
	var req models.VerifyOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	if err := ctrl.validate.Struct(req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	if err := ctrl.authService.VerifyOTP(c.Request.Context(), &req); err != nil {
		if err == services.ErrInvalidOTP {
			response.Error(c, http.StatusBadRequest, "INVALID_OTP", "Invalid or expired OTP code")
			return
		}
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	response.Success(c, http.StatusOK, gin.H{"valid": true}, "OTP verified")
}

// RegisterNormal godoc
// POST /auth/register/normal
// Body: MemberRegisterNormalRequest { email, password, first_name, last_name, phone, address, otp_code }
func (ctrl *AuthController) RegisterNormal(c *gin.Context) {
	var req models.MemberRegisterNormalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	if err := ctrl.validate.Struct(req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	result, err := ctrl.authService.RegisterNormal(c.Request.Context(), &req)
	if err != nil {
		switch err {
		case services.ErrEmailTaken:
			response.Error(c, http.StatusConflict, "CONFLICT", "Email is already in use")
		case services.ErrInvalidOTP:
			response.Error(c, http.StatusBadRequest, "INVALID_OTP", "Invalid or expired OTP code")
		default:
			response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		}
		return
	}

	response.Success(c, http.StatusCreated, result, "Registration successful")
}

// RegisterAssociation godoc
// POST /auth/register/association
// Body: MemberRegisterAssociationRequest { email, password, entity_type, org_name, tax_id, first_name, last_name, id_card_number, phone, address, otp_code }
func (ctrl *AuthController) RegisterAssociation(c *gin.Context) {
	var req models.MemberRegisterAssociationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	if err := ctrl.validate.Struct(req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	result, err := ctrl.authService.RegisterAssociation(c.Request.Context(), &req)
	if err != nil {
		switch err {
		case services.ErrEmailTaken:
			response.Error(c, http.StatusConflict, "CONFLICT", "Email is already in use")
		case services.ErrInvalidOTP:
			response.Error(c, http.StatusBadRequest, "INVALID_OTP", "Invalid or expired OTP code")
		default:
			response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		}
		return
	}

	response.Success(c, http.StatusCreated, result, "Association registration successful")
}

// Login godoc
// POST /auth/login
// Body: { email, password }
// Works for both admin and member accounts.
func (ctrl *AuthController) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	if err := ctrl.validate.Struct(req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	result, err := ctrl.authService.Login(c.Request.Context(), &req)
	if err != nil {
		switch err {
		case services.ErrInvalidCredentials:
			response.Error(c, http.StatusUnauthorized, "INVALID_CREDENTIALS", "Invalid email or password")
		case services.ErrInactiveAccount:
			response.Error(c, http.StatusForbidden, "INACTIVE_ACCOUNT", "Account is deactivated")
		default:
			response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		}
		return
	}

	response.Success(c, http.StatusOK, result, "Login successful")
}

// RefreshToken godoc
// POST /auth/refresh
func (ctrl *AuthController) RefreshToken(c *gin.Context) {
	var req models.RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	result, err := ctrl.authService.RefreshToken(c.Request.Context(), req.RefreshToken)
	if err != nil {
		if err == services.ErrInvalidToken {
			response.Error(c, http.StatusUnauthorized, "INVALID_TOKEN", "Invalid or expired refresh token")
			return
		}
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	response.Success(c, http.StatusOK, result, "Token refreshed")
}

// Logout godoc
// POST /auth/logout
func (ctrl *AuthController) Logout(c *gin.Context) {
	var req models.LogoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	if err := ctrl.authService.Logout(c.Request.Context(), req.RefreshToken); err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	response.Success(c, http.StatusOK, nil, "Logged out successfully")
}

// ForgotPassword godoc
// POST /auth/forgot-password
// Body: { email } — sends OTP to email
func (ctrl *AuthController) ForgotPassword(c *gin.Context) {
	var req models.ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	if err := ctrl.validate.Struct(req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	if err := ctrl.authService.ForgotPasswordOTP(c.Request.Context(), req.Email); err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	response.Success(c, http.StatusOK, nil, "If the email exists, an OTP has been sent")
}

// ResetPassword godoc
// POST /auth/reset-password
// Body: { email, otp_code, new_password }
func (ctrl *AuthController) ResetPassword(c *gin.Context) {
	var req struct {
		Email       string `json:"email" validate:"required,email"`
		OTPCode     string `json:"otp_code" validate:"required"`
		NewPassword string `json:"new_password" validate:"required,min=8"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	if err := ctrl.validate.Struct(req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	if err := ctrl.authService.ResetPasswordWithOTP(c.Request.Context(), req.Email, req.OTPCode, req.NewPassword); err != nil {
		switch err {
		case services.ErrInvalidOTP:
			response.Error(c, http.StatusBadRequest, "INVALID_OTP", "Invalid or expired OTP code")
		case services.ErrUserNotFound:
			response.Error(c, http.StatusNotFound, "NOT_FOUND", "User not found")
		default:
			response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		}
		return
	}

	response.Success(c, http.StatusOK, nil, "Password reset successful")
}
