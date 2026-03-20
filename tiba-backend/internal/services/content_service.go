package services

import (
	"context"
	"database/sql"
	"strings"
	"time"
	"unicode"

	"github.com/tiba/tiba-backend/internal/models"
	"github.com/tiba/tiba-backend/internal/repositories"
)

type ContentService struct {
	contentRepo *repositories.ContentRepository
}

func NewContentService(contentRepo *repositories.ContentRepository) *ContentService {
	return &ContentService{contentRepo: contentRepo}
}

func slugify(s string) string {
	s = strings.ToLower(s)
	var b strings.Builder
	for _, r := range s {
		if unicode.IsLetter(r) || unicode.IsDigit(r) {
			b.WriteRune(r)
		} else if unicode.IsSpace(r) || r == '-' {
			b.WriteRune('-')
		}
	}
	return strings.Trim(b.String(), "-")
}

// Articles

func (s *ContentService) ListArticles(ctx context.Context, search, articleType string, publishedOnly bool, limit, offset int) ([]models.Article, int64, error) {
	return s.contentRepo.ListArticles(ctx, search, articleType, publishedOnly, limit, offset)
}

func (s *ContentService) GetArticleBySlug(ctx context.Context, slug string) (*models.Article, error) {
	return s.contentRepo.FindArticleBySlug(ctx, slug)
}

func (s *ContentService) GetArticleByID(ctx context.Context, id string) (*models.Article, error) {
	return s.contentRepo.FindArticleByID(ctx, id)
}

func (s *ContentService) CreateArticle(ctx context.Context, req *models.CreateArticleRequest, authorID string) (*models.Article, error) {
	slug := req.Slug
	if slug == "" {
		slug = slugify(req.Title)
	}
	a := &models.Article{
		ArticleType: req.ArticleType,
		Title:       req.Title,
		Slug:        slug,
		Body:        req.Body,
		IsPublished: req.IsPublished,
		AuthorID:    authorID,
	}
	if req.IsPublished {
		now := time.Now()
		a.PublishedAt = &now
	}
	if err := s.contentRepo.CreateArticle(ctx, a); err != nil {
		return nil, err
	}
	return a, nil
}

func (s *ContentService) UpdateArticle(ctx context.Context, id string, req *models.UpdateArticleRequest) (*models.Article, error) {
	a, err := s.contentRepo.FindArticleByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if req.Title != "" {
		a.Title = req.Title
	}
	if req.Slug != "" {
		a.Slug = req.Slug
	}
	if req.Body != "" {
		a.Body = req.Body
	}
	if req.ArticleType != "" {
		a.ArticleType = req.ArticleType
	}
	if req.IsPublished != nil {
		a.IsPublished = *req.IsPublished
		if *req.IsPublished && a.PublishedAt == nil {
			now := time.Now()
			a.PublishedAt = &now
		}
	}
	if err := s.contentRepo.UpdateArticle(ctx, a); err != nil {
		return nil, err
	}
	return a, nil
}

func (s *ContentService) DeleteArticle(ctx context.Context, id string) error {
	return s.contentRepo.DeleteArticle(ctx, id)
}

// Banners

func (s *ContentService) ListBanners(ctx context.Context, activeOnly bool) ([]models.Banner, error) {
	return s.contentRepo.ListBanners(ctx, activeOnly)
}

func (s *ContentService) CreateBanner(ctx context.Context, req *models.CreateBannerRequest, imagePath string) (*models.Banner, error) {
	var linkURL *string
	if req.LinkURL != "" {
		linkURL = &req.LinkURL
	}
	b := &models.Banner{
		ImagePath:    imagePath,
		LinkURL:      linkURL,
		DisplayOrder: req.DisplayOrder,
		IsActive:     req.IsActive,
	}
	if err := s.contentRepo.CreateBanner(ctx, b); err != nil {
		return nil, err
	}
	return b, nil
}

func (s *ContentService) UpdateBanner(ctx context.Context, id string, req *models.UpdateBannerRequest, imagePath string) (*models.Banner, error) {
	b, err := s.contentRepo.FindBannerByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if imagePath != "" {
		b.ImagePath = imagePath
	}
	if req.LinkURL != "" {
		linkURL := req.LinkURL
		b.LinkURL = &linkURL
	}
	if req.DisplayOrder != nil {
		b.DisplayOrder = *req.DisplayOrder
	}
	if req.IsActive != nil {
		b.IsActive = *req.IsActive
	}
	if err := s.contentRepo.UpdateBanner(ctx, b); err != nil {
		return nil, err
	}
	return b, nil
}

func (s *ContentService) DeleteBanner(ctx context.Context, id string) error {
	return s.contentRepo.DeleteBanner(ctx, id)
}

// Ads

func (s *ContentService) ListAds(ctx context.Context, position string, activeOnly bool) ([]models.Ad, error) {
	return s.contentRepo.ListAds(ctx, position, activeOnly)
}

func (s *ContentService) CreateAd(ctx context.Context, req *models.CreateAdRequest, imagePath string) (*models.Ad, error) {
	activeFrom, err := time.Parse("2006-01-02", req.ActiveFrom)
	if err != nil {
		return nil, err
	}
	activeUntil, err := time.Parse("2006-01-02", req.ActiveUntil)
	if err != nil {
		return nil, err
	}
	a := &models.Ad{
		ImagePath:   imagePath,
		LinkURL:     req.LinkURL,
		Position:    req.Position,
		ActiveFrom:  activeFrom,
		ActiveUntil: activeUntil,
		IsActive:    req.IsActive,
	}
	if err := s.contentRepo.CreateAd(ctx, a); err != nil {
		return nil, err
	}
	return a, nil
}

func (s *ContentService) UpdateAd(ctx context.Context, id string, req *models.UpdateAdRequest, imagePath string) (*models.Ad, error) {
	a, err := s.contentRepo.FindAdByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if imagePath != "" {
		a.ImagePath = imagePath
	}
	if req.LinkURL != "" {
		a.LinkURL = req.LinkURL
	}
	if req.Position != "" {
		a.Position = req.Position
	}
	if req.ActiveFrom != "" {
		if af, err := time.Parse("2006-01-02", req.ActiveFrom); err == nil {
			a.ActiveFrom = af
		}
	}
	if req.ActiveUntil != "" {
		if au, err := time.Parse("2006-01-02", req.ActiveUntil); err == nil {
			a.ActiveUntil = au
		}
	}
	if req.IsActive != nil {
		a.IsActive = *req.IsActive
	}
	if err := s.contentRepo.UpdateAd(ctx, a); err != nil {
		return nil, err
	}
	return a, nil
}

func (s *ContentService) DeleteAd(ctx context.Context, id string) error {
	return s.contentRepo.DeleteAd(ctx, id)
}

// Partners

func (s *ContentService) ListPartners(ctx context.Context, activeOnly bool) ([]models.Partner, error) {
	return s.contentRepo.ListPartners(ctx, activeOnly)
}

func (s *ContentService) CreatePartner(ctx context.Context, req *models.CreatePartnerRequest, logoPath string) (*models.Partner, error) {
	p := &models.Partner{
		Name:         req.Name,
		LogoPath:     logoPath,
		WebsiteURL:   sql.NullString{String: req.WebsiteURL, Valid: req.WebsiteURL != ""},
		DisplayOrder: req.DisplayOrder,
		IsActive:     req.IsActive,
	}
	if err := s.contentRepo.CreatePartner(ctx, p); err != nil {
		return nil, err
	}
	return p, nil
}

func (s *ContentService) UpdatePartner(ctx context.Context, id string, req *models.UpdatePartnerRequest, logoPath string) (*models.Partner, error) {
	p, err := s.contentRepo.FindPartnerByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if req.Name != "" {
		p.Name = req.Name
	}
	if logoPath != "" {
		p.LogoPath = logoPath
	}
	if req.WebsiteURL != "" {
		p.WebsiteURL = sql.NullString{String: req.WebsiteURL, Valid: true}
	}
	if req.DisplayOrder != nil {
		p.DisplayOrder = *req.DisplayOrder
	}
	if req.IsActive != nil {
		p.IsActive = *req.IsActive
	}
	if err := s.contentRepo.UpdatePartner(ctx, p); err != nil {
		return nil, err
	}
	return p, nil
}

func (s *ContentService) DeletePartner(ctx context.Context, id string) error {
	return s.contentRepo.DeletePartner(ctx, id)
}

// Executives

func (s *ContentService) ListExecutives(ctx context.Context, activeOnly bool) ([]models.Executive, error) {
	return s.contentRepo.ListExecutives(ctx, activeOnly)
}

func (s *ContentService) CreateExecutive(ctx context.Context, req *models.CreateExecutiveRequest, photoPath string) (*models.Executive, error) {
	e := &models.Executive{
		FullName:      req.FullName,
		PositionTitle: req.PositionTitle,
		PhotoPath:     sql.NullString{String: photoPath, Valid: photoPath != ""},
		DisplayOrder:  req.DisplayOrder,
		IsActive:      req.IsActive,
	}
	if err := s.contentRepo.CreateExecutive(ctx, e); err != nil {
		return nil, err
	}
	return e, nil
}

func (s *ContentService) UpdateExecutive(ctx context.Context, id string, req *models.UpdateExecutiveRequest, photoPath string) (*models.Executive, error) {
	e, err := s.contentRepo.FindExecutiveByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if req.FullName != "" {
		e.FullName = req.FullName
	}
	if req.PositionTitle != "" {
		e.PositionTitle = req.PositionTitle
	}
	if photoPath != "" {
		e.PhotoPath = sql.NullString{String: photoPath, Valid: true}
	}
	if req.DisplayOrder != nil {
		e.DisplayOrder = *req.DisplayOrder
	}
	if req.IsActive != nil {
		e.IsActive = *req.IsActive
	}
	if err := s.contentRepo.UpdateExecutive(ctx, e); err != nil {
		return nil, err
	}
	return e, nil
}

func (s *ContentService) DeleteExecutive(ctx context.Context, id string) error {
	return s.contentRepo.DeleteExecutive(ctx, id)
}

// Tutors

func (s *ContentService) ListTutors(ctx context.Context, activeOnly bool, limit, offset int) ([]models.Tutor, int64, error) {
	return s.contentRepo.ListTutors(ctx, activeOnly, limit, offset)
}

func (s *ContentService) GetTutor(ctx context.Context, id string) (*models.Tutor, error) {
	return s.contentRepo.FindTutorByID(ctx, id)
}

func (s *ContentService) CreateTutor(ctx context.Context, req *models.CreateTutorRequest, photoPath string) (*models.Tutor, error) {
	t := &models.Tutor{
		Name:         req.Name,
		Position:     req.Position,
		PhotoPath:    sql.NullString{String: photoPath, Valid: photoPath != ""},
		DisplayOrder: req.DisplayOrder,
		IsActive:     req.IsActive,
	}
	if err := s.contentRepo.CreateTutor(ctx, t); err != nil {
		return nil, err
	}
	return t, nil
}

func (s *ContentService) UpdateTutor(ctx context.Context, id string, req *models.UpdateTutorRequest, photoPath string) (*models.Tutor, error) {
	t, err := s.contentRepo.FindTutorByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if req.Name != "" {
		t.Name = req.Name
	}
	if req.Position != "" {
		t.Position = req.Position
	}
	if photoPath != "" {
		t.PhotoPath = sql.NullString{String: photoPath, Valid: true}
	}
	if req.DisplayOrder != nil {
		t.DisplayOrder = *req.DisplayOrder
	}
	if req.IsActive != nil {
		t.IsActive = *req.IsActive
	}
	if err := s.contentRepo.UpdateTutor(ctx, t); err != nil {
		return nil, err
	}
	return t, nil
}

func (s *ContentService) ToggleTutorStatus(ctx context.Context, id string, isActive bool) (*models.Tutor, error) {
	t, err := s.contentRepo.FindTutorByID(ctx, id)
	if err != nil {
		return nil, err
	}
	t.IsActive = isActive
	if err := s.contentRepo.UpdateTutor(ctx, t); err != nil {
		return nil, err
	}
	return t, nil
}

func (s *ContentService) DeleteTutor(ctx context.Context, id string) error {
	return s.contentRepo.DeleteTutor(ctx, id)
}

// Statistics

func (s *ContentService) ListStatistics(ctx context.Context, publishedOnly bool, limit, offset int) ([]models.StatisticsFile, int64, error) {
	return s.contentRepo.ListStatistics(ctx, publishedOnly, limit, offset)
}

func (s *ContentService) CreateStatistics(ctx context.Context, req *models.CreateStatisticsRequest, filePath, uploaderID string) (*models.StatisticsFile, error) {
	sf := &models.StatisticsFile{
		Title:         req.Title,
		Description:   sql.NullString{String: req.Description, Valid: req.Description != ""},
		FilePath:      filePath,
		PublishedYear: req.PublishedYear,
		DisplayOrder:  req.DisplayOrder,
		IsPublished:   req.IsPublished,
		UploadedBy:    uploaderID,
	}
	if err := s.contentRepo.CreateStatistics(ctx, sf); err != nil {
		return nil, err
	}
	return sf, nil
}

func (s *ContentService) UpdateStatistics(ctx context.Context, id string, req *models.UpdateStatisticsRequest, filePath string) (*models.StatisticsFile, error) {
	sf, err := s.contentRepo.FindStatisticsByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if req.Title != "" {
		sf.Title = req.Title
	}
	if req.Description != "" {
		sf.Description = sql.NullString{String: req.Description, Valid: true}
	}
	if filePath != "" {
		sf.FilePath = filePath
	}
	if req.PublishedYear != nil {
		sf.PublishedYear = req.PublishedYear
	}
	if req.DisplayOrder != nil {
		sf.DisplayOrder = *req.DisplayOrder
	}
	if req.IsPublished != nil {
		sf.IsPublished = *req.IsPublished
	}
	if err := s.contentRepo.UpdateStatistics(ctx, sf); err != nil {
		return nil, err
	}
	return sf, nil
}

func (s *ContentService) DeleteStatistics(ctx context.Context, id string) error {
	return s.contentRepo.DeleteStatistics(ctx, id)
}

// Contact

func (s *ContentService) GetContact(ctx context.Context) (*models.ContactInfo, error) {
	return s.contentRepo.GetContact(ctx)
}

func (s *ContentService) UpdateContact(ctx context.Context, req *models.UpdateContactRequest) (*models.ContactInfo, error) {
	c := &models.ContactInfo{
		ID:          1,
		Address:     sql.NullString{String: req.Address, Valid: req.Address != ""},
		Phone:       sql.NullString{String: req.Phone, Valid: req.Phone != ""},
		Email:       sql.NullString{String: req.Email, Valid: req.Email != ""},
		MapEmbedURL: sql.NullString{String: req.MapEmbedURL, Valid: req.MapEmbedURL != ""},
		LineID:      sql.NullString{String: req.LineID, Valid: req.LineID != ""},
		FacebookURL: sql.NullString{String: req.FacebookURL, Valid: req.FacebookURL != ""},
	}
	if err := s.contentRepo.UpdateContact(ctx, c); err != nil {
		return nil, err
	}
	return s.contentRepo.GetContact(ctx)
}

// Companies

func (s *ContentService) ListCompanies(ctx context.Context, search string, activeOnly bool, limit, offset int) ([]models.PublicCompany, int64, error) {
	return s.contentRepo.ListCompanies(ctx, search, activeOnly, limit, offset)
}

func (s *ContentService) CreateCompany(ctx context.Context, req *models.CreateCompanyRequest, logoPath string) (*models.PublicCompany, error) {
	c := &models.PublicCompany{
		Name:         req.Name,
		LogoPath:     sql.NullString{String: logoPath, Valid: logoPath != ""},
		WebsiteURL:   sql.NullString{String: req.WebsiteURL, Valid: req.WebsiteURL != ""},
		Description:  sql.NullString{String: req.Description, Valid: req.Description != ""},
		DisplayOrder: req.DisplayOrder,
		IsActive:     req.IsActive,
	}
	if err := s.contentRepo.CreateCompany(ctx, c); err != nil {
		return nil, err
	}
	return c, nil
}

func (s *ContentService) UpdateCompany(ctx context.Context, id string, req *models.UpdateCompanyRequest, logoPath string) (*models.PublicCompany, error) {
	c, err := s.contentRepo.FindCompanyByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if req.Name != "" {
		c.Name = req.Name
	}
	if logoPath != "" {
		c.LogoPath = sql.NullString{String: logoPath, Valid: true}
	}
	if req.WebsiteURL != "" {
		c.WebsiteURL = sql.NullString{String: req.WebsiteURL, Valid: true}
	}
	if req.Description != "" {
		c.Description = sql.NullString{String: req.Description, Valid: true}
	}
	if req.DisplayOrder != nil {
		c.DisplayOrder = *req.DisplayOrder
	}
	if req.IsActive != nil {
		c.IsActive = *req.IsActive
	}
	if err := s.contentRepo.UpdateCompany(ctx, c); err != nil {
		return nil, err
	}
	return c, nil
}

func (s *ContentService) DeleteCompany(ctx context.Context, id string) error {
	return s.contentRepo.DeleteCompany(ctx, id)
}
