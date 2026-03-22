package controllers

import (
	"net/http"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/tiba/tiba-backend/internal/config"
	"github.com/tiba/tiba-backend/internal/models"
	"github.com/tiba/tiba-backend/internal/repositories"
	"github.com/tiba/tiba-backend/internal/services"
	"github.com/tiba/tiba-backend/pkg/paginate"
	"github.com/tiba/tiba-backend/pkg/response"
	"github.com/tiba/tiba-backend/pkg/upload"
)

type EnrollmentController struct {
	enrollService *services.EnrollmentService
	validate      *validator.Validate
	cfg           *config.Config
}

func NewEnrollmentController(enrollService *services.EnrollmentService, cfg *config.Config) *EnrollmentController {
	return &EnrollmentController{
		enrollService: enrollService,
		validate:      validator.New(),
		cfg:           cfg,
	}
}

// ---------- Member: enroll ----------

// MemberEnroll handles POST /member/enrollments
// Body: { "session_id": "..." }
func (ctrl *EnrollmentController) MemberEnroll(c *gin.Context) {
	userID := c.GetString("user_id")
	userRole := c.GetString("role")

	var req models.CreateEnrollmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	if err := ctrl.validate.Struct(req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	// Use the legacy Enroll path which validates seat limits, dates, and pricing.
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

// ---------- Member: upload slip ----------

// MemberUploadSlip handles POST /member/enrollments/:id/slip
// Multipart field: "slip"
func (ctrl *EnrollmentController) MemberUploadSlip(c *gin.Context) {
	userID := c.GetString("user_id")
	enrollmentID := c.Param("id")

	slipDir := filepath.Join(ctrl.cfg.UploadDir, "slips", time.Now().Format("2006-01"))
	slipPath, err := upload.SaveFile(c, "slip", slipDir)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "UPLOAD_ERROR", "Slip file required: "+err.Error())
		return
	}

	if err := ctrl.enrollService.UploadSlip(c.Request.Context(), enrollmentID, userID, slipPath); err != nil {
		switch err {
		case repositories.ErrEnrollmentNotFound:
			response.Error(c, http.StatusNotFound, "NOT_FOUND", "Enrollment not found")
		case services.ErrNotOwner:
			response.Error(c, http.StatusForbidden, "FORBIDDEN", err.Error())
		case repositories.ErrPaymentNotFound:
			response.Error(c, http.StatusNotFound, "NOT_FOUND", "Payment record not found for this enrollment")
		default:
			response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		}
		return
	}
	response.Success(c, http.StatusOK, nil, "Payment slip uploaded successfully")
}

// ---------- Member: list enrollments ----------

// MemberListEnrollments handles GET /member/enrollments
func (ctrl *EnrollmentController) MemberListEnrollments(c *gin.Context) {
	userID := c.GetString("user_id")
	p := paginate.Parse(c)
	items, total, err := ctrl.enrollService.MemberListEnrollments(c.Request.Context(), userID, p.Page, p.PerPage)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Paginated(c, http.StatusOK, items, response.Meta{
		Page: p.Page, PerPage: p.PerPage, Total: total, TotalPages: paginate.TotalPages(total, p.PerPage),
	}, "Enrollments retrieved")
}

// ---------- Member: list payments ----------

// MemberListPayments handles GET /member/payments
func (ctrl *EnrollmentController) MemberListPayments(c *gin.Context) {
	userID := c.GetString("user_id")
	p := paginate.Parse(c)
	items, total, err := ctrl.enrollService.MemberListPayments(c.Request.Context(), userID, p.Page, p.PerPage)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Paginated(c, http.StatusOK, items, response.Meta{
		Page: p.Page, PerPage: p.PerPage, Total: total, TotalPages: paginate.TotalPages(total, p.PerPage),
	}, "Payments retrieved")
}

// ---------- Member: certificates ----------

// MemberListCertificates handles GET /member/certificates
func (ctrl *EnrollmentController) MemberListCertificates(c *gin.Context) {
	userID := c.GetString("user_id")
	items, err := ctrl.enrollService.MemberListCertificates(c.Request.Context(), userID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, items, "Certificates retrieved")
}

// ---------- Admin: list orders ----------

// AdminListOrders handles GET /admin/orders?status=...
func (ctrl *EnrollmentController) AdminListOrders(c *gin.Context) {
	p := paginate.Parse(c)
	status := c.Query("status")
	items, total, err := ctrl.enrollService.AdminListOrders(c.Request.Context(), status, p.Page, p.PerPage)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Paginated(c, http.StatusOK, items, response.Meta{
		Page: p.Page, PerPage: p.PerPage, Total: total, TotalPages: paginate.TotalPages(total, p.PerPage),
	}, "Orders retrieved")
}

// ---------- Admin: get single order ----------

// AdminGetOrder handles GET /admin/orders/:id
func (ctrl *EnrollmentController) AdminGetOrder(c *gin.Context) {
	id := c.Param("id")
	payment, err := ctrl.enrollService.GetPaymentByID(c.Request.Context(), id)
	if err != nil {
		if err == repositories.ErrPaymentNotFound {
			response.Error(c, http.StatusNotFound, "NOT_FOUND", "Order not found")
			return
		}
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, payment, "Order retrieved")
}

// ---------- Admin: confirm payment ----------

// AdminConfirmPayment handles PUT /admin/orders/:id/confirm
func (ctrl *EnrollmentController) AdminConfirmPayment(c *gin.Context) {
	adminID := c.GetString("user_id")
	id := c.Param("id")

	var req models.AdminConfirmPaymentRequest
	_ = c.ShouldBindJSON(&req) // note field is optional

	if err := ctrl.enrollService.AdminConfirmPayment(c.Request.Context(), id, adminID); err != nil {
		if err == repositories.ErrPaymentNotFound {
			response.Error(c, http.StatusNotFound, "NOT_FOUND", "Order not found")
			return
		}
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, nil, "Payment confirmed")
}

// ---------- Admin: reject payment ----------

// AdminRejectPayment handles PUT /admin/orders/:id/reject
func (ctrl *EnrollmentController) AdminRejectPayment(c *gin.Context) {
	adminID := c.GetString("user_id")
	id := c.Param("id")

	var req models.AdminRejectPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	if err := ctrl.validate.Struct(req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	if err := ctrl.enrollService.AdminRejectPayment(c.Request.Context(), id, adminID, req.Note); err != nil {
		if err == repositories.ErrPaymentNotFound {
			response.Error(c, http.StatusNotFound, "NOT_FOUND", "Order not found")
			return
		}
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, nil, "Payment rejected")
}

// ---------- Admin: issue certificate ----------

// AdminIssueCertificate handles POST /admin/enrollments/:id/certificate
// Multipart field: "certificate"
func (ctrl *EnrollmentController) AdminIssueCertificate(c *gin.Context) {
	adminID := c.GetString("user_id")
	enrollmentID := c.Param("id")

	certDir := filepath.Join(ctrl.cfg.UploadDir, "certificates")
	certPath, err := upload.SaveFile(c, "certificate", certDir)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "UPLOAD_ERROR", "Certificate file required: "+err.Error())
		return
	}

	if err := ctrl.enrollService.IssueCertificate(c.Request.Context(), enrollmentID, certPath, adminID); err != nil {
		if err == repositories.ErrEnrollmentNotFound {
			response.Error(c, http.StatusNotFound, "NOT_FOUND", "Enrollment not found")
			return
		}
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, gin.H{"certificate_path": certPath}, "Certificate issued")
}

// ---------- Legacy handlers (preserved for existing routes) ----------

// AdminListOrdersLegacy handles the original search+status admin orders endpoint.
func (ctrl *EnrollmentController) AdminListOrdersLegacy(c *gin.Context) {
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

// MemberListEnrollmentsLegacy is the old handler with status filter query param.
func (ctrl *EnrollmentController) MemberListEnrollmentsLegacy(c *gin.Context) {
	userID := c.GetString("user_id")
	p := paginate.Parse(c)
	status := c.Query("status")
	items, total, err := ctrl.enrollService.ListMemberEnrollmentsLegacy(c.Request.Context(), userID, status, p.PerPage, p.Offset)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Paginated(c, http.StatusOK, items, response.Meta{
		Page: p.Page, PerPage: p.PerPage, Total: total, TotalPages: paginate.TotalPages(total, p.PerPage),
	}, "Enrollments retrieved")
}

// MemberListOrders is the legacy member orders endpoint.
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
