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

type AssociationController struct {
	assocService *services.AssociationService
	validate     *validator.Validate
}

func NewAssociationController(assocService *services.AssociationService) *AssociationController {
	return &AssociationController{
		assocService: assocService,
		validate:     validator.New(),
	}
}

func (ctrl *AssociationController) AdminListRegistrations(c *gin.Context) {
	p := paginate.Parse(c)
	status := c.Query("status")
	regs, total, err := ctrl.assocService.ListRegistrations(c.Request.Context(), status, p.PerPage, p.Offset)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Paginated(c, http.StatusOK, regs, response.Meta{
		Page: p.Page, PerPage: p.PerPage, Total: total, TotalPages: paginate.TotalPages(total, p.PerPage),
	}, "Registrations retrieved")
}

func (ctrl *AssociationController) AdminGetRegistration(c *gin.Context) {
	id := c.Param("id")
	reg, err := ctrl.assocService.GetRegistration(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, "NOT_FOUND", "Registration not found")
		return
	}
	response.Success(c, http.StatusOK, reg, "Registration retrieved")
}

func (ctrl *AssociationController) AdminUpdateRegistrationStatus(c *gin.Context) {
	id := c.Param("id")
	reviewerID := c.GetString("user_id")
	var req models.UpdateRegistrationStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	if err := ctrl.assocService.UpdateRegistrationStatus(c.Request.Context(), id, req.Status, reviewerID, req.Note); err != nil {
		if err == services.ErrRegistrationNotFound {
			response.Error(c, http.StatusNotFound, "NOT_FOUND", "Registration not found")
			return
		}
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, nil, "Registration status updated")
}

func (ctrl *AssociationController) AdminListSubUserRequests(c *gin.Context) {
	p := paginate.Parse(c)
	status := c.Query("status")
	subs, total, err := ctrl.assocService.ListSubUserRequests(c.Request.Context(), status, p.PerPage, p.Offset)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Paginated(c, http.StatusOK, subs, response.Meta{
		Page: p.Page, PerPage: p.PerPage, Total: total, TotalPages: paginate.TotalPages(total, p.PerPage),
	}, "Sub user requests retrieved")
}

func (ctrl *AssociationController) AdminUpdateSubUserRequest(c *gin.Context) {
	id := c.Param("id")
	reviewerID := c.GetString("user_id")
	var req models.UpdateSubUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	if err := ctrl.validate.Struct(req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	if err := ctrl.assocService.UpdateSubUserRequest(c.Request.Context(), id, req.Status, reviewerID, req.Note); err != nil {
		if err == services.ErrSubUserNotFound {
			response.Error(c, http.StatusNotFound, "NOT_FOUND", "Sub user request not found")
			return
		}
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, nil, "Sub user request updated")
}
