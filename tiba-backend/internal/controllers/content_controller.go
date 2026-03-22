package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/tiba/tiba-backend/internal/config"
	"github.com/tiba/tiba-backend/internal/models"
	"github.com/tiba/tiba-backend/internal/services"
	"github.com/tiba/tiba-backend/pkg/paginate"
	"github.com/tiba/tiba-backend/pkg/response"
	"github.com/tiba/tiba-backend/pkg/upload"
)

type ContentController struct {
	contentService *services.ContentService
	validate       *validator.Validate
	cfg            *config.Config
}

func NewContentController(contentService *services.ContentService, cfg *config.Config) *ContentController {
	return &ContentController{
		contentService: contentService,
		validate:       validator.New(),
		cfg:            cfg,
	}
}

// ---------- Public Endpoints ----------

func (ctrl *ContentController) ListPublicNews(c *gin.Context) {
	p := paginate.Parse(c)
	search := c.Query("search")
	articleType := c.Query("article_type")
	articles, total, err := ctrl.contentService.ListArticles(c.Request.Context(), search, articleType, true, p.PerPage, p.Offset)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Paginated(c, http.StatusOK, articles, response.Meta{
		Page: p.Page, PerPage: p.PerPage, Total: total, TotalPages: paginate.TotalPages(total, p.PerPage),
	}, "Articles retrieved")
}

func (ctrl *ContentController) GetPublicNewsBySlug(c *gin.Context) {
	slug := c.Param("slug")
	article, err := ctrl.contentService.GetArticleBySlug(c.Request.Context(), slug)
	if err != nil {
		response.Error(c, http.StatusNotFound, "NOT_FOUND", "Article not found")
		return
	}
	if !article.IsPublished {
		response.Error(c, http.StatusNotFound, "NOT_FOUND", "Article not found")
		return
	}
	response.Success(c, http.StatusOK, article, "Article retrieved")
}

func (ctrl *ContentController) ListPublicBanners(c *gin.Context) {
	banners, err := ctrl.contentService.ListBanners(c.Request.Context(), true)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, banners, "Banners retrieved")
}

func (ctrl *ContentController) ListPublicAds(c *gin.Context) {
	position := c.Query("position")
	ads, err := ctrl.contentService.ListAds(c.Request.Context(), position, true)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, ads, "Ads retrieved")
}

func (ctrl *ContentController) ListPublicPartners(c *gin.Context) {
	partners, err := ctrl.contentService.ListPartners(c.Request.Context(), true)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, partners, "Partners retrieved")
}

func (ctrl *ContentController) ListPublicExecutives(c *gin.Context) {
	execs, err := ctrl.contentService.ListExecutives(c.Request.Context(), true)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, execs, "Executives retrieved")
}

func (ctrl *ContentController) ListPublicStatistics(c *gin.Context) {
	p := paginate.Parse(c)
	stats, total, err := ctrl.contentService.ListStatistics(c.Request.Context(), true, p.PerPage, p.Offset)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Paginated(c, http.StatusOK, stats, response.Meta{
		Page: p.Page, PerPage: p.PerPage, Total: total, TotalPages: paginate.TotalPages(total, p.PerPage),
	}, "Statistics retrieved")
}

func (ctrl *ContentController) GetPublicContact(c *gin.Context) {
	contact, err := ctrl.contentService.GetContact(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, contact.ToResponse(), "Contact info retrieved")
}

func (ctrl *ContentController) ListPublicCompanies(c *gin.Context) {
	p := paginate.Parse(c)
	search := c.Query("search")
	companies, total, err := ctrl.contentService.ListCompanies(c.Request.Context(), search, true, p.PerPage, p.Offset)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Paginated(c, http.StatusOK, companies, response.Meta{
		Page: p.Page, PerPage: p.PerPage, Total: total, TotalPages: paginate.TotalPages(total, p.PerPage),
	}, "Companies retrieved")
}

// ---------- Admin News ----------

func (ctrl *ContentController) AdminListNews(c *gin.Context) {
	p := paginate.Parse(c)
	search := c.Query("search")
	articleType := c.Query("article_type")
	articles, total, err := ctrl.contentService.ListArticles(c.Request.Context(), search, articleType, false, p.PerPage, p.Offset)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Paginated(c, http.StatusOK, articles, response.Meta{
		Page: p.Page, PerPage: p.PerPage, Total: total, TotalPages: paginate.TotalPages(total, p.PerPage),
	}, "Articles retrieved")
}

func (ctrl *ContentController) AdminGetNews(c *gin.Context) {
	id := c.Param("id")
	article, err := ctrl.contentService.GetArticleByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, "NOT_FOUND", "Article not found")
		return
	}
	response.Success(c, http.StatusOK, article, "Article retrieved")
}

func (ctrl *ContentController) AdminCreateNews(c *gin.Context) {
	authorID := c.GetString("user_id")
	var req models.CreateArticleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	if err := ctrl.validate.Struct(req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	article, err := ctrl.contentService.CreateArticle(c.Request.Context(), &req, authorID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	if _, err := c.FormFile("thumbnail"); err == nil {
		if path, err := upload.SaveFile(c, "thumbnail", ctrl.cfg.UploadDir); err == nil {
			_ = path
		}
	}

	response.Success(c, http.StatusCreated, article, "Article created")
}

func (ctrl *ContentController) AdminUpdateNews(c *gin.Context) {
	id := c.Param("id")
	var req models.UpdateArticleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	article, err := ctrl.contentService.UpdateArticle(c.Request.Context(), id, &req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, article, "Article updated")
}

func (ctrl *ContentController) AdminDeleteNews(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.contentService.DeleteArticle(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, nil, "Article deleted")
}

// ---------- Admin Banners ----------

func (ctrl *ContentController) AdminListBanners(c *gin.Context) {
	banners, err := ctrl.contentService.ListBanners(c.Request.Context(), false)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, banners, "Banners retrieved")
}

func (ctrl *ContentController) AdminCreateBanner(c *gin.Context) {
	var req models.CreateBannerRequest
	c.ShouldBind(&req)

	imagePath, err := upload.SaveFile(c, "image", ctrl.cfg.UploadDir)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "UPLOAD_ERROR", "Image file required: "+err.Error())
		return
	}

	banner, err := ctrl.contentService.CreateBanner(c.Request.Context(), &req, imagePath)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusCreated, banner, "Banner created")
}

func (ctrl *ContentController) AdminUpdateBanner(c *gin.Context) {
	id := c.Param("id")
	var req models.UpdateBannerRequest
	c.ShouldBind(&req)

	imagePath := ""
	if _, err := c.FormFile("image"); err == nil {
		imagePath, _ = upload.SaveFile(c, "image", ctrl.cfg.UploadDir)
	}

	banner, err := ctrl.contentService.UpdateBanner(c.Request.Context(), id, &req, imagePath)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, banner, "Banner updated")
}

func (ctrl *ContentController) AdminDeleteBanner(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.contentService.DeleteBanner(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, nil, "Banner deleted")
}

func (ctrl *ContentController) AdminToggleBannerStatus(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		IsActive bool `json:"is_active"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	isActive := req.IsActive
	updateReq := &models.UpdateBannerRequest{IsActive: &isActive}
	banner, err := ctrl.contentService.UpdateBanner(c.Request.Context(), id, updateReq, "")
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, banner, "Banner status updated")
}

// ---------- Admin Ads ----------

func (ctrl *ContentController) AdminListAds(c *gin.Context) {
	position := c.Query("position")
	ads, err := ctrl.contentService.ListAds(c.Request.Context(), position, false)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, ads, "Ads retrieved")
}

func (ctrl *ContentController) AdminCreateAd(c *gin.Context) {
	var req models.CreateAdRequest
	c.ShouldBind(&req)

	imagePath, err := upload.SaveFile(c, "image", ctrl.cfg.UploadDir)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "UPLOAD_ERROR", "Image file required: "+err.Error())
		return
	}

	ad, err := ctrl.contentService.CreateAd(c.Request.Context(), &req, imagePath)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusCreated, ad, "Ad created")
}

func (ctrl *ContentController) AdminUpdateAd(c *gin.Context) {
	id := c.Param("id")
	var req models.UpdateAdRequest
	c.ShouldBind(&req)

	imagePath := ""
	if _, err := c.FormFile("image"); err == nil {
		imagePath, _ = upload.SaveFile(c, "image", ctrl.cfg.UploadDir)
	}

	ad, err := ctrl.contentService.UpdateAd(c.Request.Context(), id, &req, imagePath)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, ad, "Ad updated")
}

func (ctrl *ContentController) AdminDeleteAd(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.contentService.DeleteAd(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, nil, "Ad deleted")
}

// ---------- Admin Partners ----------

func (ctrl *ContentController) AdminListPartners(c *gin.Context) {
	partners, err := ctrl.contentService.ListPartners(c.Request.Context(), false)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, partners, "Partners retrieved")
}

func (ctrl *ContentController) AdminCreatePartner(c *gin.Context) {
	var req models.CreatePartnerRequest
	c.ShouldBind(&req)

	logoPath, err := upload.SaveFile(c, "logo", ctrl.cfg.UploadDir)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "UPLOAD_ERROR", "Logo file required: "+err.Error())
		return
	}

	partner, err := ctrl.contentService.CreatePartner(c.Request.Context(), &req, logoPath)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusCreated, partner, "Partner created")
}

func (ctrl *ContentController) AdminUpdatePartner(c *gin.Context) {
	id := c.Param("id")
	var req models.UpdatePartnerRequest
	c.ShouldBind(&req)

	logoPath := ""
	if _, err := c.FormFile("logo"); err == nil {
		logoPath, _ = upload.SaveFile(c, "logo", ctrl.cfg.UploadDir)
	}

	partner, err := ctrl.contentService.UpdatePartner(c.Request.Context(), id, &req, logoPath)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, partner, "Partner updated")
}

func (ctrl *ContentController) AdminDeletePartner(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.contentService.DeletePartner(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, nil, "Partner deleted")
}

// ---------- Admin Tutors ----------

func (ctrl *ContentController) AdminListTutors(c *gin.Context) {
	p := paginate.Parse(c)
	tutors, total, err := ctrl.contentService.ListTutors(c.Request.Context(), false, p.PerPage, p.Offset)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Paginated(c, http.StatusOK, tutors, response.Meta{
		Page: p.Page, PerPage: p.PerPage, Total: total, TotalPages: paginate.TotalPages(total, p.PerPage),
	}, "Tutors retrieved")
}

func (ctrl *ContentController) AdminGetTutor(c *gin.Context) {
	id := c.Param("id")
	tutor, err := ctrl.contentService.GetTutor(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, "NOT_FOUND", "Tutor not found")
		return
	}
	response.Success(c, http.StatusOK, tutor, "Tutor retrieved")
}

func (ctrl *ContentController) AdminCreateTutor(c *gin.Context) {
	var req models.CreateTutorRequest
	c.ShouldBind(&req)

	photoPath := ""
	if _, err := c.FormFile("photo"); err == nil {
		photoPath, _ = upload.SaveFile(c, "photo", ctrl.cfg.UploadDir)
	}

	tutor, err := ctrl.contentService.CreateTutor(c.Request.Context(), &req, photoPath)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusCreated, tutor, "Tutor created")
}

func (ctrl *ContentController) AdminUpdateTutor(c *gin.Context) {
	id := c.Param("id")
	var req models.UpdateTutorRequest
	c.ShouldBind(&req)

	photoPath := ""
	if _, err := c.FormFile("photo"); err == nil {
		photoPath, _ = upload.SaveFile(c, "photo", ctrl.cfg.UploadDir)
	}

	tutor, err := ctrl.contentService.UpdateTutor(c.Request.Context(), id, &req, photoPath)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, tutor, "Tutor updated")
}

func (ctrl *ContentController) AdminToggleTutorStatus(c *gin.Context) {
	id := c.Param("id")
	var req models.ToggleTutorStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}
	tutor, err := ctrl.contentService.ToggleTutorStatus(c.Request.Context(), id, req.IsActive)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, tutor, "Tutor status updated")
}

func (ctrl *ContentController) AdminDeleteTutor(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.contentService.DeleteTutor(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, nil, "Tutor deleted")
}

// ---------- Admin Executives ----------

func (ctrl *ContentController) AdminListExecutives(c *gin.Context) {
	execs, err := ctrl.contentService.ListExecutives(c.Request.Context(), false)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, execs, "Executives retrieved")
}

func (ctrl *ContentController) AdminCreateExecutive(c *gin.Context) {
	var req models.CreateExecutiveRequest
	c.ShouldBind(&req)

	photoPath := ""
	if _, err := c.FormFile("photo"); err == nil {
		photoPath, _ = upload.SaveFile(c, "photo", ctrl.cfg.UploadDir)
	}

	exec, err := ctrl.contentService.CreateExecutive(c.Request.Context(), &req, photoPath)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusCreated, exec, "Executive created")
}

func (ctrl *ContentController) AdminUpdateExecutive(c *gin.Context) {
	id := c.Param("id")
	var req models.UpdateExecutiveRequest
	c.ShouldBind(&req)

	photoPath := ""
	if _, err := c.FormFile("photo"); err == nil {
		photoPath, _ = upload.SaveFile(c, "photo", ctrl.cfg.UploadDir)
	}

	exec, err := ctrl.contentService.UpdateExecutive(c.Request.Context(), id, &req, photoPath)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, exec, "Executive updated")
}

func (ctrl *ContentController) AdminDeleteExecutive(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.contentService.DeleteExecutive(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, nil, "Executive deleted")
}

// ---------- Admin Statistics ----------

func (ctrl *ContentController) AdminListStatistics(c *gin.Context) {
	p := paginate.Parse(c)
	stats, total, err := ctrl.contentService.ListStatistics(c.Request.Context(), false, p.PerPage, p.Offset)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Paginated(c, http.StatusOK, stats, response.Meta{
		Page: p.Page, PerPage: p.PerPage, Total: total, TotalPages: paginate.TotalPages(total, p.PerPage),
	}, "Statistics retrieved")
}

func (ctrl *ContentController) AdminCreateStatistics(c *gin.Context) {
	uploaderID := c.GetString("user_id")
	var req models.CreateStatisticsRequest
	c.ShouldBind(&req)

	filePath, err := upload.SaveFile(c, "file", ctrl.cfg.UploadDir)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "UPLOAD_ERROR", "File required: "+err.Error())
		return
	}

	sf, err := ctrl.contentService.CreateStatistics(c.Request.Context(), &req, filePath, uploaderID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusCreated, sf, "Statistics file created")
}

func (ctrl *ContentController) AdminUpdateStatistics(c *gin.Context) {
	id := c.Param("id")
	var req models.UpdateStatisticsRequest
	c.ShouldBind(&req)

	filePath := ""
	if _, err := c.FormFile("file"); err == nil {
		filePath, _ = upload.SaveFile(c, "file", ctrl.cfg.UploadDir)
	}

	sf, err := ctrl.contentService.UpdateStatistics(c.Request.Context(), id, &req, filePath)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, sf, "Statistics file updated")
}

func (ctrl *ContentController) AdminDeleteStatistics(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.contentService.DeleteStatistics(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, nil, "Statistics file deleted")
}

// ---------- Admin Contact ----------

func (ctrl *ContentController) AdminGetContact(c *gin.Context) {
	contact, err := ctrl.contentService.GetContact(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, contact.ToResponse(), "Contact info retrieved")
}

func (ctrl *ContentController) AdminUpdateContact(c *gin.Context) {
	var req models.UpdateContactRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}
	contact, err := ctrl.contentService.UpdateContact(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, contact.ToResponse(), "Contact info updated")
}

// ---------- Admin Companies ----------

func (ctrl *ContentController) AdminListCompanies(c *gin.Context) {
	p := paginate.Parse(c)
	search := c.Query("search")
	companies, total, err := ctrl.contentService.ListCompanies(c.Request.Context(), search, false, p.PerPage, p.Offset)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Paginated(c, http.StatusOK, companies, response.Meta{
		Page: p.Page, PerPage: p.PerPage, Total: total, TotalPages: paginate.TotalPages(total, p.PerPage),
	}, "Companies retrieved")
}

func (ctrl *ContentController) AdminCreateCompany(c *gin.Context) {
	var req models.CreateCompanyRequest
	c.ShouldBind(&req)

	logoPath := ""
	if _, err := c.FormFile("logo"); err == nil {
		logoPath, _ = upload.SaveFile(c, "logo", ctrl.cfg.UploadDir)
	}

	company, err := ctrl.contentService.CreateCompany(c.Request.Context(), &req, logoPath)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusCreated, company, "Company created")
}

func (ctrl *ContentController) AdminUpdateCompany(c *gin.Context) {
	id := c.Param("id")
	var req models.UpdateCompanyRequest
	c.ShouldBind(&req)

	logoPath := ""
	if _, err := c.FormFile("logo"); err == nil {
		logoPath, _ = upload.SaveFile(c, "logo", ctrl.cfg.UploadDir)
	}

	company, err := ctrl.contentService.UpdateCompany(c.Request.Context(), id, &req, logoPath)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, company, "Company updated")
}

func (ctrl *ContentController) AdminDeleteCompany(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.contentService.DeleteCompany(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(c, http.StatusOK, nil, "Company deleted")
}
