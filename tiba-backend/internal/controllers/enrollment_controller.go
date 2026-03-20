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

type EnrollmentController struct {
	enrollService *services.EnrollmentService
	validate      *validator.Validate
}

func NewEnrollmentController(enrollService *services.EnrollmentService) *EnrollmentController {
	return &EnrollmentController{
		enrollService: enrollService,
		validate:      validator.New(),
	}
}

func (ctrl *EnrollmentController) AdminListOrders(c *gin.Context) {
	p := paginate.Parse(c)
	search := c.Query("search")
	status := c.Query("payment_status")
	items, total, err := ctrl.enrollService.ListAdminOrders(c.Request.Context(), search, status, p.PerPage, p.Offset)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Paginated(c, http.StatusOK, items, response.Meta{
		Page: p.Page, PerPage: p.PerPage, Total: total, TotalPages: paginate.TotalPages(total, p.PerPage),
	}, "Orders retrieved")
}

func (ctrl *EnrollmentController) MemberListEnrollments(c *gin.Context) {
	userID := c.GetString("user_id")
	p := paginate.Parse(c)
	status := c.Query("status")
	items, total, err := ctrl.enrollService.ListMemberEnrollments(c.Request.Context(), userID, status, p.PerPage, p.Offset)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Paginated(c, http.StatusOK, items, response.Meta{
		Page: p.Page, PerPage: p.PerPage, Total: total, TotalPages: paginate.TotalPages(total, p.PerPage),
	}, "Enrollments retrieved")
}

func (ctrl *EnrollmentController) MemberListOrders(c *gin.Context) {
	userID := c.GetString("user_id")
	p := paginate.Parse(c)
	status := c.Query("status")
	items, total, err := ctrl.enrollService.ListMemberOrders(c.Request.Context(), userID, status, p.PerPage, p.Offset)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Paginated(c, http.StatusOK, items, response.Meta{
		Page: p.Page, PerPage: p.PerPage, Total: total, TotalPages: paginate.TotalPages(total, p.PerPage),
	}, "Orders retrieved")
}

func (ctrl *EnrollmentController) MemberEnroll(c *gin.Context) {
	userID := c.GetString("user_id")
	userRole := c.GetString("role")

	var req models.EnrollRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	if err := ctrl.validate.Struct(req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	result, err := ctrl.enrollService.Enroll(c.Request.Context(), userID, req.SessionID, userRole)
	if err != nil {
		switch err {
		case services.ErrAlreadyEnrolled:
			response.Error(c, http.StatusConflict, "ALREADY_ENROLLED", err.Error())
		case services.ErrEnrollmentWindowClosed:
			response.Error(c, http.StatusUnprocessableEntity, "SESSION_ENROLLMENT_CLOSED", err.Error())
		case services.ErrSessionFull:
			response.Error(c, http.StatusUnprocessableEntity, "SESSION_FULL", err.Error())
		default:
			response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		}
		return
	}
	response.Success(c, http.StatusCreated, result, "Enrollment created, please complete payment within 3 days")
}
