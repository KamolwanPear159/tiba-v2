package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/tiba/tiba-backend/internal/models"
	"github.com/tiba/tiba-backend/internal/services"
	"github.com/tiba/tiba-backend/pkg/paginate"
	"github.com/tiba/tiba-backend/pkg/response"
)

type UserController struct {
	userService *services.UserService
	validate    *validator.Validate
}

func NewUserController(userService *services.UserService) *UserController {
	return &UserController{
		userService: userService,
		validate:    validator.New(),
	}
}

func (ctrl *UserController) GetAdminProfile(c *gin.Context) {
	userID := c.GetString("user_id")
	user, profile, err := ctrl.userService.GetProfile(c.Request.Context(), userID)
	if err != nil {
		response.Error(c, http.StatusNotFound, "NOT_FOUND", "User not found")
		return
	}
	response.Success(c, http.StatusOK, gin.H{"user": user, "profile": profile}, "Profile retrieved")
}

func (ctrl *UserController) UpdateAdminProfile(c *gin.Context) {
	userID := c.GetString("user_id")
	var req models.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	if err := ctrl.userService.UpdateProfile(c.Request.Context(), userID, &req); err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, nil, "Profile updated")
}

func (ctrl *UserController) ChangePassword(c *gin.Context) {
	userID := c.GetString("user_id")
	var req models.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	if err := ctrl.userService.ChangePassword(c.Request.Context(), userID, req.CurrentPassword, req.NewPassword); err != nil {
		if err == services.ErrInvalidCredentials {
			response.Error(c, http.StatusBadRequest, "INVALID_PASSWORD", "Current password is incorrect")
			return
		}
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, nil, "Password changed successfully")
}

func (ctrl *UserController) GetDashboardStats(c *gin.Context) {
	stats, err := ctrl.userService.GetDashboardStats(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, stats, "Dashboard stats retrieved")
}

func (ctrl *UserController) GetMonthlyEnrollments(c *gin.Context) {
	data, err := ctrl.userService.GetMonthlyEnrollments(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, data, "Monthly enrollments retrieved")
}

func (ctrl *UserController) GetRecentRegistrations(c *gin.Context) {
	data, err := ctrl.userService.GetRecentRegistrations(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, data, "Recent registrations retrieved")
}

func (ctrl *UserController) ListMembers(c *gin.Context) {
	p := paginate.Parse(c)
	search := c.Query("search")
	role := c.Query("role")

	users, total, err := ctrl.userService.ListUsers(c.Request.Context(), search, role, p.PerPage, p.Offset)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Paginated(c, http.StatusOK, users, response.Meta{
		Page:       p.Page,
		PerPage:    p.PerPage,
		Total:      total,
		TotalPages: paginate.TotalPages(total, p.PerPage),
	}, "Members retrieved")
}

func (ctrl *UserController) GetMember(c *gin.Context) {
	id := c.Param("id")
	user, err := ctrl.userService.GetUser(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, "NOT_FOUND", "User not found")
		return
	}
	response.Success(c, http.StatusOK, user, "User retrieved")
}

func (ctrl *UserController) UpdateMemberStatus(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		IsActive bool `json:"is_active"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	if err := ctrl.userService.UpdateUserStatus(c.Request.Context(), id, req.IsActive); err != nil {
		if err == services.ErrUserNotFound {
			response.Error(c, http.StatusNotFound, "NOT_FOUND", "User not found")
			return
		}
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, nil, "Status updated")
}

func (ctrl *UserController) ListAdminUsers(c *gin.Context) {
	users, err := ctrl.userService.ListAdminUsers(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, users, "Admin users retrieved")
}

func (ctrl *UserController) CreateAdminUser(c *gin.Context) {
	var req struct {
		Email    string `json:"email" validate:"required,email"`
		Password string `json:"password" validate:"required,min=8"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	if err := ctrl.validate.Struct(req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	user, err := ctrl.userService.CreateAdminUser(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		if err == services.ErrEmailTaken {
			response.Error(c, http.StatusConflict, "EMAIL_TAKEN", "Email already in use")
			return
		}
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusCreated, user, "Admin user created")
}

func (ctrl *UserController) UpdateAdminUserStatus(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		IsActive bool `json:"is_active"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	if err := ctrl.userService.UpdateUserStatus(c.Request.Context(), id, req.IsActive); err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, nil, "Status updated")
}

func (ctrl *UserController) ListActivityLogs(c *gin.Context) {
	p := paginate.Parse(c)
	logs, total, err := ctrl.userService.ListActivityLogs(c.Request.Context(), p.PerPage, p.Offset)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Paginated(c, http.StatusOK, logs, response.Meta{
		Page:       p.Page,
		PerPage:    p.PerPage,
		Total:      total,
		TotalPages: paginate.TotalPages(total, p.PerPage),
	}, "Activity logs retrieved")
}
