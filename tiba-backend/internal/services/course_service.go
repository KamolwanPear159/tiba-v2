package services

import (
	"context"
	"database/sql"
	"time"

	"github.com/tiba/tiba-backend/internal/models"
	"github.com/tiba/tiba-backend/internal/repositories"
)

type CourseService struct {
	courseRepo *repositories.CourseRepository
}

func NewCourseService(courseRepo *repositories.CourseRepository) *CourseService {
	return &CourseService{courseRepo: courseRepo}
}

func (s *CourseService) ListCourses(ctx context.Context, search string, publishedOnly bool, limit, offset int) ([]models.Course, int64, error) {
	return s.courseRepo.List(ctx, search, publishedOnly, limit, offset)
}

func (s *CourseService) GetCourse(ctx context.Context, id string) (*models.Course, error) {
	return s.courseRepo.FindByID(ctx, id)
}

func (s *CourseService) CreateCourse(ctx context.Context, req *models.CreateCourseRequest, createdBy string) (*models.Course, error) {
	course := &models.Course{
		Title:             req.Title,
		Description:       sql.NullString{String: req.Description, Valid: req.Description != ""},
		Format:            req.Format,
		OnlineMeetingLink: sql.NullString{String: req.OnlineMeetingLink, Valid: req.OnlineMeetingLink != ""},
		PriceType:         req.PriceType,
		IsPublished:       req.IsPublished,
		CreatedBy:         createdBy,
	}
	if req.PriceGeneral != nil {
		course.PriceGeneral = sql.NullFloat64{Float64: *req.PriceGeneral, Valid: true}
	}
	if req.PriceAssociation != nil {
		course.PriceAssociation = sql.NullFloat64{Float64: *req.PriceAssociation, Valid: true}
	}
	if err := s.courseRepo.Create(ctx, course); err != nil {
		return nil, err
	}
	return course, nil
}

func (s *CourseService) UpdateCourse(ctx context.Context, id string, req *models.UpdateCourseRequest) (*models.Course, error) {
	course, err := s.courseRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.Title != "" {
		course.Title = req.Title
	}
	if req.Description != "" {
		course.Description = sql.NullString{String: req.Description, Valid: true}
	}
	if req.Format != "" {
		course.Format = req.Format
	}
	if req.OnlineMeetingLink != "" {
		course.OnlineMeetingLink = sql.NullString{String: req.OnlineMeetingLink, Valid: true}
	}
	if req.PriceType != "" {
		course.PriceType = req.PriceType
	}
	if req.PriceGeneral != nil {
		course.PriceGeneral = sql.NullFloat64{Float64: *req.PriceGeneral, Valid: true}
	}
	if req.PriceAssociation != nil {
		course.PriceAssociation = sql.NullFloat64{Float64: *req.PriceAssociation, Valid: true}
	}
	if req.IsPublished != nil {
		course.IsPublished = *req.IsPublished
	}

	if err := s.courseRepo.Update(ctx, course); err != nil {
		return nil, err
	}
	return course, nil
}

func (s *CourseService) DeleteCourse(ctx context.Context, id string) error {
	_, err := s.courseRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	return s.courseRepo.SoftDelete(ctx, id)
}

func (s *CourseService) UpdateCourseStatus(ctx context.Context, id string, isPublished bool) error {
	return s.courseRepo.UpdateStatus(ctx, id, isPublished)
}

func (s *CourseService) SetThumbnail(ctx context.Context, id, thumbnailPath string) error {
	course, err := s.courseRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	course.ThumbnailPath = sql.NullString{String: thumbnailPath, Valid: true}
	return s.courseRepo.Update(ctx, course)
}

func (s *CourseService) ListSessions(ctx context.Context, courseID string) ([]models.CourseSession, error) {
	return s.courseRepo.ListSessions(ctx, courseID)
}

func (s *CourseService) GetSession(ctx context.Context, id string) (*models.CourseSession, error) {
	return s.courseRepo.FindSessionByID(ctx, id)
}

func (s *CourseService) CreateSession(ctx context.Context, courseID string, req *models.CreateSessionRequest) (*models.CourseSession, error) {
	trainingStart, err := time.Parse("2006-01-02", req.TrainingStart)
	if err != nil {
		return nil, err
	}
	trainingEnd, err := time.Parse("2006-01-02", req.TrainingEnd)
	if err != nil {
		return nil, err
	}

	session := &models.CourseSession{
		CourseID:        courseID,
		SessionLabel:    sql.NullString{String: req.SessionLabel, Valid: req.SessionLabel != ""},
		Location:        sql.NullString{String: req.Location, Valid: req.Location != ""},
		SeatCapacity:    req.SeatCapacity,
		EnrollmentStart: req.EnrollmentStart,
		EnrollmentEnd:   req.EnrollmentEnd,
		TrainingStart:   trainingStart,
		TrainingEnd:     trainingEnd,
	}

	if err := s.courseRepo.CreateSession(ctx, session); err != nil {
		return nil, err
	}
	return session, nil
}

func (s *CourseService) UpdateSession(ctx context.Context, id string, req *models.UpdateSessionRequest) (*models.CourseSession, error) {
	session, err := s.courseRepo.FindSessionByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.SessionLabel != "" {
		session.SessionLabel = sql.NullString{String: req.SessionLabel, Valid: true}
	}
	if req.Location != "" {
		session.Location = sql.NullString{String: req.Location, Valid: true}
	}
	if req.SeatCapacity != nil {
		session.SeatCapacity = req.SeatCapacity
	}
	if req.EnrollmentStart != nil {
		session.EnrollmentStart = *req.EnrollmentStart
	}
	if req.EnrollmentEnd != nil {
		session.EnrollmentEnd = *req.EnrollmentEnd
	}
	if req.TrainingStart != "" {
		ts, err := time.Parse("2006-01-02", req.TrainingStart)
		if err == nil {
			session.TrainingStart = ts
		}
	}
	if req.TrainingEnd != "" {
		te, err := time.Parse("2006-01-02", req.TrainingEnd)
		if err == nil {
			session.TrainingEnd = te
		}
	}
	if req.IsCancelled != nil {
		session.IsCancelled = *req.IsCancelled
	}
	if req.CancelReason != "" {
		session.CancelReason = sql.NullString{String: req.CancelReason, Valid: true}
	}

	if err := s.courseRepo.UpdateSession(ctx, session); err != nil {
		return nil, err
	}
	return session, nil
}

func (s *CourseService) DeleteSession(ctx context.Context, id string) error {
	return s.courseRepo.DeleteSession(ctx, id)
}

func (s *CourseService) GetEnrollmentCalendar(ctx context.Context, month, year int) ([]map[string]interface{}, error) {
	return s.courseRepo.ListEnrollmentsForCalendar(ctx, month, year)
}

func (s *CourseService) GetTrainingCalendar(ctx context.Context, month, year int) ([]map[string]interface{}, error) {
	return s.courseRepo.ListTrainingCalendar(ctx, month, year)
}
