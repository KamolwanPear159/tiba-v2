package controllers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/tiba/tiba-backend/internal/models"
	"github.com/tiba/tiba-backend/internal/services"
	"github.com/tiba/tiba-backend/internal/config"
	"github.com/tiba/tiba-backend/pkg/paginate"
	"github.com/tiba/tiba-backend/pkg/response"
	"github.com/tiba/tiba-backend/pkg/upload"
)

type CourseController struct {
	courseService *services.CourseService
	validate      *validator.Validate
	cfg           *config.Config
}

func NewCourseController(courseService *services.CourseService, cfg *config.Config) *CourseController {
	return &CourseController{
		courseService: courseService,
		validate:      validator.New(),
		cfg:           cfg,
	}
}

func (ctrl *CourseController) ListPublicCourses(c *gin.Context) {
	p := paginate.Parse(c)
	search := c.Query("search")
	status := c.DefaultQuery("status", "all")

	month := 0
	year := 0
	if m := c.Query("month"); m != "" {
		if v, err := strconv.Atoi(m); err == nil {
			month = v
		}
	}
	if y := c.Query("year"); y != "" {
		if v, err := strconv.Atoi(y); err == nil {
			year = v
		}
	}

	courses, total, err := ctrl.courseService.ListPublicCoursesWithNextSession(
		c.Request.Context(), search, month, year, status, p.PerPage, p.Offset,
	)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Paginated(c, http.StatusOK, courses, response.Meta{
		Page: p.Page, PerPage: p.PerPage, Total: total, TotalPages: paginate.TotalPages(total, p.PerPage),
	}, "Courses retrieved")
}

func (ctrl *CourseController) GetPublicCourse(c *gin.Context) {
	id := c.Param("id")
	course, err := ctrl.courseService.GetCourse(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, "NOT_FOUND", "Course not found")
		return
	}
	if !course.IsPublished {
		response.Error(c, http.StatusNotFound, "NOT_FOUND", "Course not found")
		return
	}
	sessions, _ := ctrl.courseService.ListSessions(c.Request.Context(), id)
	tutors, _ := ctrl.courseService.GetCourseTutors(c.Request.Context(), id)
	response.Success(c, http.StatusOK, gin.H{"course": course, "sessions": sessions, "tutors": tutors}, "Course retrieved")
}

func (ctrl *CourseController) ListAdminCourses(c *gin.Context) {
	p := paginate.Parse(c)
	search := c.Query("search")
	courses, total, err := ctrl.courseService.ListCourses(c.Request.Context(), search, false, p.PerPage, p.Offset)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Paginated(c, http.StatusOK, courses, response.Meta{
		Page: p.Page, PerPage: p.PerPage, Total: total, TotalPages: paginate.TotalPages(total, p.PerPage),
	}, "Courses retrieved")
}

func (ctrl *CourseController) GetAdminCourse(c *gin.Context) {
	id := c.Param("id")
	course, err := ctrl.courseService.GetCourse(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, "NOT_FOUND", "Course not found")
		return
	}
	sessions, _ := ctrl.courseService.ListSessions(c.Request.Context(), id)
	tutors, _ := ctrl.courseService.GetCourseTutors(c.Request.Context(), id)
	response.Success(c, http.StatusOK, gin.H{"course": course, "sessions": sessions, "tutors": tutors}, "Course retrieved")
}

func (ctrl *CourseController) CreateCourse(c *gin.Context) {
	createdBy := c.GetString("user_id")
	var req models.CreateCourseRequest
	if err := c.ShouldBind(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	if err := ctrl.validate.Struct(req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	course, err := ctrl.courseService.CreateCourse(c.Request.Context(), &req, createdBy)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	// Handle thumbnail upload if provided
	if _, err := c.FormFile("thumbnail"); err == nil {
		if path, err := upload.SaveFile(c, "thumbnail", ctrl.cfg.UploadDir); err == nil {
			ctrl.courseService.SetThumbnail(c.Request.Context(), course.ID, path)
			course, _ = ctrl.courseService.GetCourse(c.Request.Context(), course.ID)
		}
	}

	response.Success(c, http.StatusCreated, course, "Course created")
}

func (ctrl *CourseController) UpdateCourse(c *gin.Context) {
	id := c.Param("id")
	var req models.UpdateCourseRequest
	if err := c.ShouldBind(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	course, err := ctrl.courseService.UpdateCourse(c.Request.Context(), id, &req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	if _, err := c.FormFile("thumbnail"); err == nil {
		if path, err := upload.SaveFile(c, "thumbnail", ctrl.cfg.UploadDir); err == nil {
			ctrl.courseService.SetThumbnail(c.Request.Context(), course.ID, path)
			course, _ = ctrl.courseService.GetCourse(c.Request.Context(), course.ID)
		}
	}

	response.Success(c, http.StatusOK, course, "Course updated")
}

func (ctrl *CourseController) DeleteCourse(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.courseService.DeleteCourse(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, nil, "Course deleted")
}

func (ctrl *CourseController) UpdateCourseStatus(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		IsPublished bool `json:"is_published"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	if err := ctrl.courseService.UpdateCourseStatus(c.Request.Context(), id, req.IsPublished); err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, nil, "Course status updated")
}

func (ctrl *CourseController) ListSessions(c *gin.Context) {
	courseID := c.Param("id")
	sessions, err := ctrl.courseService.ListSessions(c.Request.Context(), courseID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, sessions, "Sessions retrieved")
}

func (ctrl *CourseController) CreateSession(c *gin.Context) {
	courseID := c.Param("id")
	var req models.CreateSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	session, err := ctrl.courseService.CreateSession(c.Request.Context(), courseID, &req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusCreated, session, "Session created")
}

func (ctrl *CourseController) GetSession(c *gin.Context) {
	id := c.Param("id")
	session, err := ctrl.courseService.GetSession(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, "NOT_FOUND", "Session not found")
		return
	}
	response.Success(c, http.StatusOK, session, "Session retrieved")
}

func (ctrl *CourseController) UpdateSession(c *gin.Context) {
	id := c.Param("id")
	var req models.UpdateSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	session, err := ctrl.courseService.UpdateSession(c.Request.Context(), id, &req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, session, "Session updated")
}

func (ctrl *CourseController) DeleteSession(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.courseService.DeleteSession(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, nil, "Session deleted")
}

func (ctrl *CourseController) GetEnrollmentCalendar(c *gin.Context) {
	now := time.Now()
	month := now.Month()
	year := now.Year()

	if m := c.Query("month"); m != "" {
		if v, err := strconv.Atoi(m); err == nil {
			month = time.Month(v)
		}
	}
	if y := c.Query("year"); y != "" {
		if v, err := strconv.Atoi(y); err == nil {
			year = v
		}
	}

	calendar, err := ctrl.courseService.GetEnrollmentCalendar(c.Request.Context(), int(month), year)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, calendar, "Enrollment calendar retrieved")
}

func (ctrl *CourseController) GetTrainingCalendar(c *gin.Context) {
	now := time.Now()
	month := now.Month()
	year := now.Year()

	if m := c.Query("month"); m != "" {
		if v, err := strconv.Atoi(m); err == nil {
			month = time.Month(v)
		}
	}
	if y := c.Query("year"); y != "" {
		if v, err := strconv.Atoi(y); err == nil {
			year = v
		}
	}

	calendar, err := ctrl.courseService.GetTrainingCalendar(c.Request.Context(), int(month), year)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, calendar, "Training calendar retrieved")
}

func (ctrl *CourseController) SetCourseTutors(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		TutorIDs []string `json:"tutor_ids"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	if req.TutorIDs == nil {
		req.TutorIDs = []string{}
	}
	if err := ctrl.courseService.SetCourseTutors(c.Request.Context(), id, req.TutorIDs); err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, nil, "Course tutors updated")
}

// ─── Course Documents ─────────────────────────────────────────────────────────

func (ctrl *CourseController) ListDocuments(c *gin.Context) {
	courseID := c.Param("id")
	docs, err := ctrl.courseService.ListDocuments(c.Request.Context(), courseID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, docs, "Documents retrieved")
}

func (ctrl *CourseController) AddDocument(c *gin.Context) {
	courseID := c.Param("id")
	name := c.PostForm("name")
	if name == "" {
		name = "เอกสาร"
	}

	filePath, err := upload.SaveFile(c, "file", ctrl.cfg.UploadDir)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "UPLOAD_ERROR", "ไม่พบไฟล์ที่อัปโหลด")
		return
	}

	// Count existing docs to set order
	existing, _ := ctrl.courseService.ListDocuments(c.Request.Context(), courseID)
	order := len(existing)

	doc, err := ctrl.courseService.AddDocument(c.Request.Context(), courseID, name, filePath, order)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusCreated, doc, "Document added")
}

func (ctrl *CourseController) UpdateDocument(c *gin.Context) {
	docID := c.Param("doc_id")
	var req struct {
		Name string `json:"name"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	if err := ctrl.courseService.UpdateDocument(c.Request.Context(), docID, req.Name); err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, nil, "Document updated")
}

func (ctrl *CourseController) DeleteDocument(c *gin.Context) {
	docID := c.Param("doc_id")
	if err := ctrl.courseService.DeleteDocument(c.Request.Context(), docID); err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, nil, "Document deleted")
}

func (ctrl *CourseController) UploadThumbnail(c *gin.Context) {
	id := c.Param("id")
	path, err := upload.SaveFile(c, "thumbnail", ctrl.cfg.UploadDir)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "UPLOAD_ERROR", "ไม่พบไฟล์ thumbnail")
		return
	}
	if err := ctrl.courseService.SetThumbnail(c.Request.Context(), id, path); err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	course, _ := ctrl.courseService.GetCourse(c.Request.Context(), id)
	response.Success(c, http.StatusOK, course, "Thumbnail updated")
}
