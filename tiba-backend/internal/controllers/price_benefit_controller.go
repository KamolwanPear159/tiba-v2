package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/tiba/tiba-backend/internal/models"
	"github.com/tiba/tiba-backend/internal/services"
	"github.com/tiba/tiba-backend/pkg/response"
)

type PriceBenefitController struct {
	service  *services.PriceBenefitService
	validate *validator.Validate
}

func NewPriceBenefitController(service *services.PriceBenefitService) *PriceBenefitController {
	return &PriceBenefitController{
		service:  service,
		validate: validator.New(),
	}
}

func (ctrl *PriceBenefitController) ListPublicPlans(c *gin.Context) {
	plans, err := ctrl.service.ListPlans(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, plans, "Price benefit plans retrieved")
}

func (ctrl *PriceBenefitController) AdminListPlans(c *gin.Context) {
	plans, err := ctrl.service.ListPlans(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, plans, "Price benefit plans retrieved")
}

func (ctrl *PriceBenefitController) AdminUpdatePlan(c *gin.Context) {
	id := c.Param("id")
	var req models.UpdatePlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	plan, err := ctrl.service.UpdatePlan(c.Request.Context(), id, &req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, plan, "Plan updated")
}

func (ctrl *PriceBenefitController) AdminListConditions(c *gin.Context) {
	planID := c.Param("id")
	conditions, err := ctrl.service.ListConditions(c.Request.Context(), planID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, conditions, "Conditions retrieved")
}

func (ctrl *PriceBenefitController) AdminCreateCondition(c *gin.Context) {
	planID := c.Param("id")
	var req models.CreateConditionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	if err := ctrl.validate.Struct(req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	condition, err := ctrl.service.CreateCondition(c.Request.Context(), planID, &req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusCreated, condition, "Condition created")
}

func (ctrl *PriceBenefitController) AdminUpdateCondition(c *gin.Context) {
	conditionID := c.Param("cid")
	var req models.UpdateConditionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	condition, err := ctrl.service.UpdateCondition(c.Request.Context(), conditionID, &req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, condition, "Condition updated")
}

func (ctrl *PriceBenefitController) AdminDeleteCondition(c *gin.Context) {
	conditionID := c.Param("cid")
	if err := ctrl.service.DeleteCondition(c.Request.Context(), conditionID); err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, nil, "Condition deleted")
}
