package models

import (
	"database/sql"
	"time"
)

type AdPosition string
type ArticleType string

const (
	AdTop     AdPosition = "top"
	AdSidebar AdPosition = "sidebar"
	AdBottom  AdPosition = "bottom"
	AdPopup   AdPosition = "popup"

	ArticleNews ArticleType = "news"
	ArticleBlog ArticleType = "blog"
)

type Article struct {
	ID            string         `db:"id" json:"id"`
	ArticleType   ArticleType    `db:"article_type" json:"article_type"`
	Title         string         `db:"title" json:"title"`
	Slug          string         `db:"slug" json:"slug"`
	Body          string         `db:"body" json:"body"`
	ThumbnailPath sql.NullString `db:"thumbnail_path" json:"thumbnail_path"`
	IsPublished   bool           `db:"is_published" json:"is_published"`
	IsPinned      bool           `db:"is_pinned" json:"is_pinned"`
	ViewCount     int            `db:"view_count" json:"view_count"`
	PublishedAt   *time.Time     `db:"published_at" json:"published_at"`
	AuthorID      string         `db:"author_id" json:"author_id"`
	CreatedAt     time.Time      `db:"created_at" json:"created_at"`
	UpdatedAt     time.Time      `db:"updated_at" json:"updated_at"`
	DeletedAt     *time.Time     `db:"deleted_at" json:"deleted_at,omitempty"`
}

type Banner struct {
	ID           string     `db:"id" json:"banner_id"`
	ImagePath    string     `db:"image_path" json:"image_url"`
	LinkURL      *string    `db:"link_url" json:"link_url"`
	DisplayOrder int16      `db:"display_order" json:"display_order"`
	IsActive     bool       `db:"is_active" json:"is_active"`
	CreatedAt    time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt    time.Time  `db:"updated_at" json:"updated_at"`
	DeletedAt    *time.Time `db:"deleted_at" json:"deleted_at,omitempty"`
}

type Ad struct {
	ID          string     `db:"id" json:"id"`
	ImagePath   string     `db:"image_path" json:"image_path"`
	LinkURL     string     `db:"link_url" json:"link_url"`
	Position    AdPosition `db:"position" json:"position"`
	ActiveFrom  time.Time  `db:"active_from" json:"active_from"`
	ActiveUntil time.Time  `db:"active_until" json:"active_until"`
	IsActive    bool       `db:"is_active" json:"is_active"`
	CreatedAt   time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time  `db:"updated_at" json:"updated_at"`
	DeletedAt   *time.Time `db:"deleted_at" json:"deleted_at,omitempty"`
}

type Partner struct {
	ID           string         `db:"id" json:"id"`
	Name         string         `db:"name" json:"name"`
	LogoPath     string         `db:"logo_path" json:"logo_path"`
	WebsiteURL   sql.NullString `db:"website_url" json:"website_url"`
	DisplayOrder int16          `db:"display_order" json:"display_order"`
	IsActive     bool           `db:"is_active" json:"is_active"`
	CreatedAt    time.Time      `db:"created_at" json:"created_at"`
	UpdatedAt    time.Time      `db:"updated_at" json:"updated_at"`
	DeletedAt    *time.Time     `db:"deleted_at" json:"deleted_at,omitempty"`
}

// Tutor — JSON tags match frontend Tutor interface (tutor_id, photo_url)
type Tutor struct {
	ID           string         `db:"id"           json:"tutor_id"`
	Name         string         `db:"name"         json:"name"`
	Position     string         `db:"position"     json:"position"`
	PhotoPath    sql.NullString `db:"photo_path"   json:"photo_url"`
	DisplayOrder int16          `db:"display_order" json:"display_order"`
	IsActive     bool           `db:"is_active"    json:"is_active"`
	CreatedAt    time.Time      `db:"created_at"   json:"created_at"`
	UpdatedAt    time.Time      `db:"updated_at"   json:"updated_at"`
	DeletedAt    *time.Time     `db:"deleted_at"   json:"deleted_at,omitempty"`
}

type Executive struct {
	ID            string         `db:"id" json:"id"`
	FullName      string         `db:"full_name" json:"full_name"`
	PositionTitle string         `db:"position_title" json:"position_title"`
	PhotoPath     sql.NullString `db:"photo_path" json:"photo_path"`
	DisplayOrder  int16          `db:"display_order" json:"display_order"`
	IsActive      bool           `db:"is_active" json:"is_active"`
	CreatedAt     time.Time      `db:"created_at" json:"created_at"`
	UpdatedAt     time.Time      `db:"updated_at" json:"updated_at"`
	DeletedAt     *time.Time     `db:"deleted_at" json:"deleted_at,omitempty"`
}

type StatisticsFile struct {
	ID            string         `db:"id" json:"id"`
	Title         string         `db:"title" json:"title"`
	Description   sql.NullString `db:"description" json:"description"`
	FilePath      string         `db:"file_path" json:"file_path"`
	PublishedYear *int16         `db:"published_year" json:"published_year"`
	DisplayOrder  int16          `db:"display_order" json:"display_order"`
	IsPublished   bool           `db:"is_published" json:"is_published"`
	ViewCount     int            `db:"view_count" json:"view_count"`
	DownloadCount int            `db:"download_count" json:"download_count"`
	UploadedBy    string         `db:"uploaded_by" json:"uploaded_by"`
	CreatedAt     time.Time      `db:"created_at" json:"created_at"`
	UpdatedAt     time.Time      `db:"updated_at" json:"updated_at"`
	DeletedAt     *time.Time     `db:"deleted_at" json:"deleted_at,omitempty"`
}

type ContactInfo struct {
	ID          int            `db:"id" json:"id"`
	Address     sql.NullString `db:"address" json:"address"`
	Phone       sql.NullString `db:"phone" json:"phone"`
	Email       sql.NullString `db:"email" json:"email"`
	MapEmbedURL sql.NullString `db:"map_embed_url" json:"map_embed_url"`
	LineID      sql.NullString `db:"line_id" json:"line_id"`
	FacebookURL sql.NullString `db:"facebook_url" json:"facebook_url"`
	UpdatedAt   time.Time      `db:"updated_at" json:"updated_at"`
}

// ContactInfoResponse is the JSON-safe version of ContactInfo (plain strings instead of sql.NullString)
type ContactInfoResponse struct {
	ID          int       `json:"id"`
	Address     string    `json:"address"`
	Phone       string    `json:"phone"`
	Email       string    `json:"email"`
	MapEmbedURL string    `json:"map_embed_url"`
	LineID      string    `json:"line_id"`
	FacebookURL string    `json:"facebook_url"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (c *ContactInfo) ToResponse() *ContactInfoResponse {
	return &ContactInfoResponse{
		ID:          c.ID,
		Address:     c.Address.String,
		Phone:       c.Phone.String,
		Email:       c.Email.String,
		MapEmbedURL: c.MapEmbedURL.String,
		LineID:      c.LineID.String,
		FacebookURL: c.FacebookURL.String,
		UpdatedAt:   c.UpdatedAt,
	}
}

type PublicCompany struct {
	ID           string         `db:"id" json:"id"`
	Name         string         `db:"name" json:"name"`
	LogoPath     sql.NullString `db:"logo_path" json:"logo_path"`
	WebsiteURL   sql.NullString `db:"website_url" json:"website_url"`
	Description  sql.NullString `db:"description" json:"description"`
	DisplayOrder int16          `db:"display_order" json:"display_order"`
	IsActive     bool           `db:"is_active" json:"is_active"`
	CreatedAt    time.Time      `db:"created_at" json:"created_at"`
	UpdatedAt    time.Time      `db:"updated_at" json:"updated_at"`
	DeletedAt    *time.Time     `db:"deleted_at" json:"deleted_at,omitempty"`
}

type AdminActivityLog struct {
	ID             int64  `db:"id" json:"id"`
	AdminID        string `db:"admin_id" json:"admin_id"`
	ActionCategory string `db:"action_category" json:"action_category"`
	ActionVerb     string `db:"action_verb" json:"action_verb"`
	TargetTable    sql.NullString `db:"target_table" json:"target_table"`
	TargetID       sql.NullString `db:"target_id" json:"target_id"`
	Description    sql.NullString `db:"description" json:"description"`
	IPAddress      sql.NullString `db:"ip_address" json:"ip_address"`
	CreatedAt      time.Time `db:"created_at" json:"created_at"`
}

// Request DTOs

type CreateArticleRequest struct {
	ArticleType ArticleType `json:"article_type" validate:"required,oneof=news blog"`
	Title       string      `json:"title" validate:"required"`
	Slug        string      `json:"slug" validate:"required"`
	Body        string      `json:"body" validate:"required"`
	IsPublished bool        `json:"is_published"`
}

type UpdateArticleRequest struct {
	ArticleType ArticleType `json:"article_type"`
	Title       string      `json:"title"`
	Slug        string      `json:"slug"`
	Body        string      `json:"body"`
	IsPublished *bool       `json:"is_published"`
}

type CreateBannerRequest struct {
	LinkURL      string `json:"link_url" form:"link_url"`
	DisplayOrder int16  `json:"display_order" form:"display_order"`
	IsActive     bool   `json:"is_active" form:"is_active"`
}

type UpdateBannerRequest struct {
	LinkURL      string `json:"link_url" form:"link_url"`
	DisplayOrder *int16 `json:"display_order" form:"display_order"`
	IsActive     *bool  `json:"is_active" form:"is_active"`
}

type CreateAdRequest struct {
	LinkURL     string     `json:"link_url" validate:"required"`
	Position    AdPosition `json:"position" validate:"required,oneof=top sidebar bottom popup"`
	ActiveFrom  string     `json:"active_from" validate:"required"`
	ActiveUntil string     `json:"active_until" validate:"required"`
	IsActive    bool       `json:"is_active"`
}

type UpdateAdRequest struct {
	LinkURL     string     `json:"link_url"`
	Position    AdPosition `json:"position"`
	ActiveFrom  string     `json:"active_from"`
	ActiveUntil string     `json:"active_until"`
	IsActive    *bool      `json:"is_active"`
}

type CreatePartnerRequest struct {
	Name         string `json:"name" validate:"required"`
	WebsiteURL   string `json:"website_url"`
	DisplayOrder int16  `json:"display_order"`
	IsActive     bool   `json:"is_active"`
}

type UpdatePartnerRequest struct {
	Name         string `json:"name"`
	WebsiteURL   string `json:"website_url"`
	DisplayOrder *int16 `json:"display_order"`
	IsActive     *bool  `json:"is_active"`
}

type CreateTutorRequest struct {
	Name         string `json:"name"          form:"name"          validate:"required"`
	Position     string `json:"position"      form:"position"      validate:"required"`
	DisplayOrder int16  `json:"display_order" form:"display_order"`
	IsActive     bool   `json:"is_active"     form:"is_active"`
}

type UpdateTutorRequest struct {
	Name         string `json:"name"          form:"name"`
	Position     string `json:"position"      form:"position"`
	DisplayOrder *int16 `json:"display_order" form:"display_order"`
	IsActive     *bool  `json:"is_active"     form:"is_active"`
}

type ToggleTutorStatusRequest struct {
	IsActive bool `json:"is_active"`
}

type CreateExecutiveRequest struct {
	FullName      string `json:"full_name" validate:"required"`
	PositionTitle string `json:"position_title" validate:"required"`
	DisplayOrder  int16  `json:"display_order"`
	IsActive      bool   `json:"is_active"`
}

type UpdateExecutiveRequest struct {
	FullName      string `json:"full_name"`
	PositionTitle string `json:"position_title"`
	DisplayOrder  *int16 `json:"display_order"`
	IsActive      *bool  `json:"is_active"`
}

type CreateStatisticsRequest struct {
	Title         string `json:"title" validate:"required"`
	Description   string `json:"description"`
	PublishedYear *int16 `json:"published_year"`
	DisplayOrder  int16  `json:"display_order"`
	IsPublished   bool   `json:"is_published"`
}

type UpdateStatisticsRequest struct {
	Title         string `json:"title"`
	Description   string `json:"description"`
	PublishedYear *int16 `json:"published_year"`
	DisplayOrder  *int16 `json:"display_order"`
	IsPublished   *bool  `json:"is_published"`
}

type UpdateContactRequest struct {
	Address     string `json:"address"`
	Phone       string `json:"phone"`
	Email       string `json:"email"`
	MapEmbedURL string `json:"map_embed_url"`
	LineID      string `json:"line_id"`
	FacebookURL string `json:"facebook_url"`
}

type CreateCompanyRequest struct {
	Name         string `json:"name" validate:"required"`
	WebsiteURL   string `json:"website_url"`
	Description  string `json:"description"`
	DisplayOrder int16  `json:"display_order"`
	IsActive     bool   `json:"is_active"`
}

type UpdateCompanyRequest struct {
	Name         string `json:"name"`
	WebsiteURL   string `json:"website_url"`
	Description  string `json:"description"`
	DisplayOrder *int16 `json:"display_order"`
	IsActive     *bool  `json:"is_active"`
}
