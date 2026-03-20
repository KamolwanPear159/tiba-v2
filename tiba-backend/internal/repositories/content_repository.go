package repositories

import (
	"context"
	"fmt"

	"github.com/jmoiron/sqlx"
	"github.com/tiba/tiba-backend/internal/models"
)

type ContentRepository struct {
	db *sqlx.DB
}

func NewContentRepository(db *sqlx.DB) *ContentRepository {
	return &ContentRepository{db: db}
}

// Articles

func (r *ContentRepository) ListArticles(ctx context.Context, search, articleType string, publishedOnly bool, limit, offset int) ([]models.Article, int64, error) {
	var articles []models.Article
	var total int64
	args := []interface{}{}
	where := "WHERE deleted_at IS NULL"
	idx := 1

	if publishedOnly {
		where += " AND is_published=true"
	}
	if articleType != "" {
		where += fmt.Sprintf(" AND article_type=$%d", idx)
		args = append(args, articleType)
		idx++
	}
	if search != "" {
		where += fmt.Sprintf(" AND title ILIKE $%d", idx)
		args = append(args, "%"+search+"%")
		idx++
	}

	err := r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM articles "+where, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}
	query := fmt.Sprintf("SELECT * FROM articles %s ORDER BY created_at DESC LIMIT $%d OFFSET $%d", where, idx, idx+1)
	args = append(args, limit, offset)
	err = r.db.SelectContext(ctx, &articles, query, args...)
	return articles, total, err
}

func (r *ContentRepository) FindArticleBySlug(ctx context.Context, slug string) (*models.Article, error) {
	var a models.Article
	err := r.db.GetContext(ctx, &a, `SELECT * FROM articles WHERE slug=$1 AND deleted_at IS NULL`, slug)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *ContentRepository) FindArticleByID(ctx context.Context, id string) (*models.Article, error) {
	var a models.Article
	err := r.db.GetContext(ctx, &a, `SELECT * FROM articles WHERE id=$1 AND deleted_at IS NULL`, id)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *ContentRepository) CreateArticle(ctx context.Context, a *models.Article) error {
	return r.db.QueryRowxContext(ctx, `
		INSERT INTO articles (article_type, title, slug, body, thumbnail_path, is_published, published_at, author_id)
		VALUES ($1,$2,$3,$4,NULLIF($5,''),$6,$7,$8) RETURNING *`,
		a.ArticleType, a.Title, a.Slug, a.Body, a.ThumbnailPath.String, a.IsPublished, a.PublishedAt, a.AuthorID,
	).StructScan(a)
}

func (r *ContentRepository) UpdateArticle(ctx context.Context, a *models.Article) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE articles SET article_type=$1, title=$2, slug=$3, body=$4, thumbnail_path=NULLIF($5,''),
		is_published=$6, published_at=$7 WHERE id=$8`,
		a.ArticleType, a.Title, a.Slug, a.Body, a.ThumbnailPath.String, a.IsPublished, a.PublishedAt, a.ID,
	)
	return err
}

func (r *ContentRepository) DeleteArticle(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE articles SET deleted_at=now() WHERE id=$1`, id)
	return err
}

// Banners

func (r *ContentRepository) ListBanners(ctx context.Context, activeOnly bool) ([]models.Banner, error) {
	var banners []models.Banner
	where := "WHERE deleted_at IS NULL"
	if activeOnly {
		where += " AND is_active=true"
	}
	err := r.db.SelectContext(ctx, &banners, "SELECT * FROM banners "+where+" ORDER BY display_order ASC")
	return banners, err
}

func (r *ContentRepository) FindBannerByID(ctx context.Context, id string) (*models.Banner, error) {
	var b models.Banner
	err := r.db.GetContext(ctx, &b, `SELECT * FROM banners WHERE id=$1 AND deleted_at IS NULL`, id)
	if err != nil {
		return nil, err
	}
	return &b, nil
}

func (r *ContentRepository) CreateBanner(ctx context.Context, b *models.Banner) error {
	return r.db.QueryRowxContext(ctx, `
		INSERT INTO banners (image_path, link_url, display_order, is_active)
		VALUES ($1, $2, $3, $4) RETURNING *`,
		b.ImagePath, b.LinkURL, b.DisplayOrder, b.IsActive,
	).StructScan(b)
}

func (r *ContentRepository) UpdateBanner(ctx context.Context, b *models.Banner) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE banners SET image_path=$1, link_url=$2, display_order=$3, is_active=$4 WHERE id=$5`,
		b.ImagePath, b.LinkURL, b.DisplayOrder, b.IsActive, b.ID,
	)
	return err
}

func (r *ContentRepository) DeleteBanner(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE banners SET deleted_at=now() WHERE id=$1`, id)
	return err
}

// Ads

func (r *ContentRepository) ListAds(ctx context.Context, position string, activeOnly bool) ([]models.Ad, error) {
	var ads []models.Ad
	args := []interface{}{}
	where := "WHERE deleted_at IS NULL"
	idx := 1
	if activeOnly {
		where += " AND is_active=true AND active_from<=CURRENT_DATE AND active_until>=CURRENT_DATE"
	}
	if position != "" {
		where += fmt.Sprintf(" AND position=$%d", idx)
		args = append(args, position)
		idx++
	}
	_ = idx
	err := r.db.SelectContext(ctx, &ads, "SELECT * FROM ads "+where+" ORDER BY created_at DESC", args...)
	return ads, err
}

func (r *ContentRepository) FindAdByID(ctx context.Context, id string) (*models.Ad, error) {
	var a models.Ad
	err := r.db.GetContext(ctx, &a, `SELECT * FROM ads WHERE id=$1 AND deleted_at IS NULL`, id)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *ContentRepository) CreateAd(ctx context.Context, a *models.Ad) error {
	return r.db.QueryRowxContext(ctx, `
		INSERT INTO ads (image_path, link_url, position, active_from, active_until, is_active)
		VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
		a.ImagePath, a.LinkURL, a.Position, a.ActiveFrom, a.ActiveUntil, a.IsActive,
	).StructScan(a)
}

func (r *ContentRepository) UpdateAd(ctx context.Context, a *models.Ad) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE ads SET image_path=$1, link_url=$2, position=$3, active_from=$4, active_until=$5, is_active=$6 WHERE id=$7`,
		a.ImagePath, a.LinkURL, a.Position, a.ActiveFrom, a.ActiveUntil, a.IsActive, a.ID,
	)
	return err
}

func (r *ContentRepository) DeleteAd(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE ads SET deleted_at=now() WHERE id=$1`, id)
	return err
}

// Partners

func (r *ContentRepository) ListPartners(ctx context.Context, activeOnly bool) ([]models.Partner, error) {
	var partners []models.Partner
	where := "WHERE deleted_at IS NULL"
	if activeOnly {
		where += " AND is_active=true"
	}
	err := r.db.SelectContext(ctx, &partners, "SELECT * FROM partners "+where+" ORDER BY display_order ASC")
	return partners, err
}

func (r *ContentRepository) FindPartnerByID(ctx context.Context, id string) (*models.Partner, error) {
	var p models.Partner
	err := r.db.GetContext(ctx, &p, `SELECT * FROM partners WHERE id=$1 AND deleted_at IS NULL`, id)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *ContentRepository) CreatePartner(ctx context.Context, p *models.Partner) error {
	return r.db.QueryRowxContext(ctx, `
		INSERT INTO partners (name, logo_path, website_url, display_order, is_active)
		VALUES ($1,$2,NULLIF($3,''),$4,$5) RETURNING *`,
		p.Name, p.LogoPath, p.WebsiteURL.String, p.DisplayOrder, p.IsActive,
	).StructScan(p)
}

func (r *ContentRepository) UpdatePartner(ctx context.Context, p *models.Partner) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE partners SET name=$1, logo_path=$2, website_url=NULLIF($3,''), display_order=$4, is_active=$5 WHERE id=$6`,
		p.Name, p.LogoPath, p.WebsiteURL.String, p.DisplayOrder, p.IsActive, p.ID,
	)
	return err
}

func (r *ContentRepository) DeletePartner(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE partners SET deleted_at=now() WHERE id=$1`, id)
	return err
}

// Tutors

func (r *ContentRepository) ListTutors(ctx context.Context, activeOnly bool, limit, offset int) ([]models.Tutor, int64, error) {
	var tutors []models.Tutor
	var total int64
	where := "WHERE deleted_at IS NULL"
	if activeOnly {
		where += " AND is_active=true"
	}
	err := r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM tutors "+where).Scan(&total)
	if err != nil {
		return nil, 0, err
	}
	err = r.db.SelectContext(ctx, &tutors,
		fmt.Sprintf("SELECT * FROM tutors %s ORDER BY display_order ASC, created_at ASC LIMIT $1 OFFSET $2", where),
		limit, offset,
	)
	return tutors, total, err
}

func (r *ContentRepository) FindTutorByID(ctx context.Context, id string) (*models.Tutor, error) {
	var t models.Tutor
	err := r.db.GetContext(ctx, &t, `SELECT * FROM tutors WHERE id=$1 AND deleted_at IS NULL`, id)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *ContentRepository) CreateTutor(ctx context.Context, t *models.Tutor) error {
	return r.db.QueryRowxContext(ctx, `
		INSERT INTO tutors (name, position, photo_path, display_order, is_active)
		VALUES ($1,$2,NULLIF($3,''),$4,$5) RETURNING *`,
		t.Name, t.Position, t.PhotoPath.String, t.DisplayOrder, t.IsActive,
	).StructScan(t)
}

func (r *ContentRepository) UpdateTutor(ctx context.Context, t *models.Tutor) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE tutors SET name=$1, position=$2, photo_path=NULLIF($3,''), display_order=$4, is_active=$5, updated_at=now() WHERE id=$6`,
		t.Name, t.Position, t.PhotoPath.String, t.DisplayOrder, t.IsActive, t.ID,
	)
	return err
}

func (r *ContentRepository) DeleteTutor(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE tutors SET deleted_at=now() WHERE id=$1`, id)
	return err
}

// Executives

func (r *ContentRepository) ListExecutives(ctx context.Context, activeOnly bool) ([]models.Executive, error) {
	var execs []models.Executive
	where := "WHERE deleted_at IS NULL"
	if activeOnly {
		where += " AND is_active=true"
	}
	err := r.db.SelectContext(ctx, &execs, "SELECT * FROM executives "+where+" ORDER BY display_order ASC")
	return execs, err
}

func (r *ContentRepository) FindExecutiveByID(ctx context.Context, id string) (*models.Executive, error) {
	var e models.Executive
	err := r.db.GetContext(ctx, &e, `SELECT * FROM executives WHERE id=$1 AND deleted_at IS NULL`, id)
	if err != nil {
		return nil, err
	}
	return &e, nil
}

func (r *ContentRepository) CreateExecutive(ctx context.Context, e *models.Executive) error {
	return r.db.QueryRowxContext(ctx, `
		INSERT INTO executives (full_name, position_title, photo_path, display_order, is_active)
		VALUES ($1,$2,NULLIF($3,''),$4,$5) RETURNING *`,
		e.FullName, e.PositionTitle, e.PhotoPath.String, e.DisplayOrder, e.IsActive,
	).StructScan(e)
}

func (r *ContentRepository) UpdateExecutive(ctx context.Context, e *models.Executive) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE executives SET full_name=$1, position_title=$2, photo_path=NULLIF($3,''), display_order=$4, is_active=$5 WHERE id=$6`,
		e.FullName, e.PositionTitle, e.PhotoPath.String, e.DisplayOrder, e.IsActive, e.ID,
	)
	return err
}

func (r *ContentRepository) DeleteExecutive(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE executives SET deleted_at=now() WHERE id=$1`, id)
	return err
}

// Statistics

func (r *ContentRepository) ListStatistics(ctx context.Context, publishedOnly bool, limit, offset int) ([]models.StatisticsFile, int64, error) {
	var stats []models.StatisticsFile
	var total int64
	where := "WHERE deleted_at IS NULL"
	if publishedOnly {
		where += " AND is_published=true"
	}
	err := r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM statistics_files "+where).Scan(&total)
	if err != nil {
		return nil, 0, err
	}
	err = r.db.SelectContext(ctx, &stats, fmt.Sprintf("SELECT * FROM statistics_files %s ORDER BY display_order ASC LIMIT $1 OFFSET $2", where), limit, offset)
	return stats, total, err
}

func (r *ContentRepository) FindStatisticsByID(ctx context.Context, id string) (*models.StatisticsFile, error) {
	var s models.StatisticsFile
	err := r.db.GetContext(ctx, &s, `SELECT * FROM statistics_files WHERE id=$1 AND deleted_at IS NULL`, id)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *ContentRepository) CreateStatistics(ctx context.Context, s *models.StatisticsFile) error {
	return r.db.QueryRowxContext(ctx, `
		INSERT INTO statistics_files (title, description, file_path, published_year, display_order, is_published, uploaded_by)
		VALUES ($1,NULLIF($2,''),$3,$4,$5,$6,$7) RETURNING *`,
		s.Title, s.Description.String, s.FilePath, s.PublishedYear, s.DisplayOrder, s.IsPublished, s.UploadedBy,
	).StructScan(s)
}

func (r *ContentRepository) UpdateStatistics(ctx context.Context, s *models.StatisticsFile) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE statistics_files SET title=$1, description=NULLIF($2,''), file_path=$3, published_year=$4, display_order=$5, is_published=$6 WHERE id=$7`,
		s.Title, s.Description.String, s.FilePath, s.PublishedYear, s.DisplayOrder, s.IsPublished, s.ID,
	)
	return err
}

func (r *ContentRepository) DeleteStatistics(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE statistics_files SET deleted_at=now() WHERE id=$1`, id)
	return err
}

// Contact

func (r *ContentRepository) GetContact(ctx context.Context) (*models.ContactInfo, error) {
	var c models.ContactInfo
	err := r.db.GetContext(ctx, &c, `SELECT * FROM contact_info WHERE id=1`)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *ContentRepository) UpdateContact(ctx context.Context, c *models.ContactInfo) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE contact_info SET address=NULLIF($1,''), phone=NULLIF($2,''), email=NULLIF($3,''),
		map_embed_url=NULLIF($4,''), line_id=NULLIF($5,''), facebook_url=NULLIF($6,''), updated_at=now() WHERE id=1`,
		c.Address.String, c.Phone.String, c.Email.String, c.MapEmbedURL.String, c.LineID.String, c.FacebookURL.String,
	)
	return err
}

// Companies

func (r *ContentRepository) ListCompanies(ctx context.Context, search string, activeOnly bool, limit, offset int) ([]models.PublicCompany, int64, error) {
	var companies []models.PublicCompany
	var total int64
	args := []interface{}{}
	where := "WHERE deleted_at IS NULL"
	idx := 1
	if activeOnly {
		where += " AND is_active=true"
	}
	if search != "" {
		where += fmt.Sprintf(" AND name ILIKE $%d", idx)
		args = append(args, "%"+search+"%")
		idx++
	}
	err := r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM public_companies "+where, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}
	query := fmt.Sprintf("SELECT * FROM public_companies %s ORDER BY display_order ASC LIMIT $%d OFFSET $%d", where, idx, idx+1)
	args = append(args, limit, offset)
	err = r.db.SelectContext(ctx, &companies, query, args...)
	return companies, total, err
}

func (r *ContentRepository) FindCompanyByID(ctx context.Context, id string) (*models.PublicCompany, error) {
	var c models.PublicCompany
	err := r.db.GetContext(ctx, &c, `SELECT * FROM public_companies WHERE id=$1 AND deleted_at IS NULL`, id)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *ContentRepository) CreateCompany(ctx context.Context, c *models.PublicCompany) error {
	return r.db.QueryRowxContext(ctx, `
		INSERT INTO public_companies (name, logo_path, website_url, description, display_order, is_active)
		VALUES ($1,NULLIF($2,''),NULLIF($3,''),NULLIF($4,''),$5,$6) RETURNING *`,
		c.Name, c.LogoPath.String, c.WebsiteURL.String, c.Description.String, c.DisplayOrder, c.IsActive,
	).StructScan(c)
}

func (r *ContentRepository) UpdateCompany(ctx context.Context, c *models.PublicCompany) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE public_companies SET name=$1, logo_path=NULLIF($2,''), website_url=NULLIF($3,''), description=NULLIF($4,''), display_order=$5, is_active=$6 WHERE id=$7`,
		c.Name, c.LogoPath.String, c.WebsiteURL.String, c.Description.String, c.DisplayOrder, c.IsActive, c.ID,
	)
	return err
}

func (r *ContentRepository) DeleteCompany(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE public_companies SET deleted_at=now() WHERE id=$1`, id)
	return err
}
