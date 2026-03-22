// cmd/seed/main.go
// Run with: go run ./cmd/seed/main.go
// Requires the same environment variables as the main server (DB_HOST, DB_PORT, etc.)
// All inserts are idempotent via ON CONFLICT DO NOTHING.
package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/jmoiron/sqlx"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	// Load .env if present (same as server)
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, reading from environment")
	}

	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		getEnv("DB_HOST", "localhost"),
		getEnv("DB_PORT", "5432"),
		getEnv("DB_USER", "postgres"),
		getEnv("DB_PASSWORD", "postgres"),
		getEnv("DB_NAME", "tiba_db"),
		getEnv("DB_SSLMODE", "disable"),
	)

	db, err := sqlx.Open("pgx", dsn)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}
	log.Println("Connected to database")

	ctx := context.Background()
	seed(ctx, db)
	log.Println("Seed complete")
}

func seed(ctx context.Context, db *sqlx.DB) {
	seedAdmin(ctx, db)
	seedTutors(ctx, db)
	seedCourses(ctx, db)
	seedNews(ctx, db)
	seedContactInfo(ctx, db)
	seedPartners(ctx, db)
	seedPriceBenefits(ctx, db)
}

// ─── Admin ────────────────────────────────────────────────────────────────────

func seedAdmin(ctx context.Context, db *sqlx.DB) {
	hash, err := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("bcrypt error: %v", err)
	}

	_, err = db.ExecContext(ctx, `
		INSERT INTO users (email, password_hash, role, is_active)
		VALUES ($1, $2, 'admin', true)
		ON CONFLICT (email) DO NOTHING`,
		"admin@tiba.co.th", string(hash),
	)
	mustExec("seed admin user", err)
	log.Println("  admin@tiba.co.th seeded")
}

// ─── Tutors ───────────────────────────────────────────────────────────────────

type tutorSeed struct {
	Name     string
	Position string
	Order    int16
}

func seedTutors(ctx context.Context, db *sqlx.DB) {
	tutors := []tutorSeed{
		{
			Name:     "คุณประภาพร มั่งมี",
			Position: "วิทยากร",
			Order:    1,
		},
		{
			Name:     "คุณกล้า ตั้งสุวรรณ",
			Position: "CEO Wisesight Thailand",
			Order:    2,
		},
		{
			Name:     "คุณชนกานต์ ชินชัชวาล",
			Position: "CEO Co-Founder ZWIZ.AI",
			Order:    3,
		},
		{
			Name:     "คุณธัญญ์นิธิ อภิชัยโชติรัตน์",
			Position: "Facebook Alpha Tester LINE Certified Coach",
			Order:    4,
		},
		{
			Name:     "ดร.ตั้งใจวิล อนันตชัย",
			Position: "Executive Chairman INTAGE Thailand Co Ltd",
			Order:    5,
		},
	}

	for _, t := range tutors {
		_, err := db.ExecContext(ctx, `
			INSERT INTO tutors (name, position, display_order, is_active)
			VALUES ($1, $2, $3, true)
			ON CONFLICT DO NOTHING`,
			t.Name, t.Position, t.Order,
		)
		mustExec("seed tutor "+t.Name, err)
	}
	log.Printf("  %d tutors seeded", len(tutors))
}

// ─── Courses ──────────────────────────────────────────────────────────────────

// getSeedAdminID returns the ID of the admin user used as created_by for courses.
func getSeedAdminID(ctx context.Context, db *sqlx.DB) string {
	var id string
	if err := db.QueryRowContext(ctx, `SELECT id FROM users WHERE email='admin@tiba.co.th'`).Scan(&id); err != nil {
		log.Fatalf("admin user not found: %v", err)
	}
	return id
}

type courseSeed struct {
	Title            string
	Format           string
	PriceType        string
	PriceGeneral     *float64
	PriceAssociation *float64
	TotalHours       int
	IsPublished      bool
}

func f64(v float64) *float64 { return &v }

func seedCourses(ctx context.Context, db *sqlx.DB) {
	adminID := getSeedAdminID(ctx, db)

	courses := []courseSeed{
		{
			Title:            "เทคนิคการขายประกัน แบบฉบับนักวางแผนการเงิน",
			Format:           "online",
			PriceType:        "dual",
			PriceGeneral:     f64(23000),
			PriceAssociation: f64(20000),
			TotalHours:       50,
			IsPublished:      true,
		},
		{
			Title:        "ติวสอบ ใบอนุญาตนายหน้าและตัวแทนประกันชีวิต",
			Format:       "onsite",
			PriceType:    "single",
			PriceGeneral: f64(1600),
			TotalHours:   50,
			IsPublished:  true,
		},
		{
			Title:            "เทคนิคปิดการขาย ประกันชีวิต คุ้มครองสินเชื่อบ้าน",
			Format:           "onsite",
			PriceType:        "dual",
			PriceGeneral:     f64(3000),
			PriceAssociation: f64(2500),
			TotalHours:       50,
			IsPublished:      true,
		},
		{
			Title:        "ขอรับใบอนุญาตเป็นตัวแทนประกันวินาศภัย",
			Format:       "online",
			PriceType:    "single",
			PriceGeneral: f64(24000),
			TotalHours:   50,
			IsPublished:  true,
		},
		{
			Title:       "คอร์สตัวอย่าง 5 (เร็วๆ นี้)",
			Format:      "onsite",
			PriceType:   "single",
			TotalHours:  50,
			IsPublished: false,
		},
		{
			Title:       "คอร์สตัวอย่าง 6 (เร็วๆ นี้)",
			Format:      "online",
			PriceType:   "single",
			TotalHours:  50,
			IsPublished: false,
		},
	}

	for _, c := range courses {
		_, err := db.ExecContext(ctx, `
			INSERT INTO courses (title, format, price_type, price_general, price_association, total_hours, is_published, created_by)
			SELECT $1::text, $2::course_format, $3::course_price_type, $4::numeric, $5::numeric, $6::int, $7::bool, $8::uuid
			WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = $1::text AND deleted_at IS NULL)`,
			c.Title, c.Format, c.PriceType, c.PriceGeneral, c.PriceAssociation, c.TotalHours, c.IsPublished, adminID,
		)
		mustExec("seed course "+c.Title, err)
	}
	log.Printf("  %d courses seeded", len(courses))
}

// ─── News ─────────────────────────────────────────────────────────────────────

type newsSeed struct {
	Title     string
	Slug      string
	Body      string
	IsPinned  bool
	IsPublished bool
}

func seedNews(ctx context.Context, db *sqlx.DB) {
	adminID := getSeedAdminID(ctx, db)
	now := time.Now()

	newsList := []newsSeed{
		{
			Title:       "TIBA ขอต้อนรับสมาชิกใหม่ทุกท่าน",
			Slug:        "tiba-welcome",
			Body:        "<p>สมาคม TIBA ยินดีต้อนรับสมาชิกทุกท่าน เราพร้อมให้บริการและสนับสนุนวงการประกันภัยไทย</p>",
			IsPinned:    true,
			IsPublished: true,
		},
		{
			Title:       "อัพเดตกฎระเบียบใหม่จากคปภ. ปี 2567",
			Slug:        "oic-regulation-update-2567",
			Body:        "<p>สำนักงานคณะกรรมการกำกับและส่งเสริมการประกอบธุรกิจประกันภัย (คปภ.) ได้ออกกฎระเบียบใหม่ที่มีผลบังคับใช้ในปี 2567</p>",
			IsPinned:    false,
			IsPublished: true,
		},
		{
			Title:       "เปิดรับสมัครคอร์สติวสอบใบอนุญาตรุ่นใหม่",
			Slug:        "course-registration-new-batch",
			Body:        "<p>เปิดรับสมัครคอร์สติวสอบใบอนุญาตนายหน้าประกันภัยรุ่นใหม่ สมัครได้ทันทีผ่านเว็บไซต์</p>",
			IsPinned:    false,
			IsPublished: true,
		},
		{
			Title:       "ประกาศผลสอบใบอนุญาตประจำเดือนมีนาคม",
			Slug:        "exam-results-march",
			Body:        "<p>ประกาศผลสอบใบอนุญาตประจำเดือนมีนาคม 2567 ขอแสดงความยินดีกับผู้สอบผ่านทุกท่าน</p>",
			IsPinned:    false,
			IsPublished: true,
		},
	}

	// Check if articles table has an is_pinned column (optional, gracefully skip)
	for _, n := range newsList {
		_, err := db.ExecContext(ctx, `
			INSERT INTO articles (article_type, title, slug, body, is_published, is_pinned, author_id, published_at)
			SELECT 'news', $1::text, $2::text, $3::text, $4::bool, $5::bool, $6::uuid, $7::timestamptz
			WHERE NOT EXISTS (SELECT 1 FROM articles WHERE slug = $2::text AND deleted_at IS NULL)`,
			n.Title, n.Slug, n.Body, n.IsPublished, n.IsPinned, adminID, now,
		)
		if err != nil {
			_, err2 := db.ExecContext(ctx, `
				INSERT INTO articles (article_type, title, slug, body, is_published, author_id, published_at)
				SELECT 'news', $1::text, $2::text, $3::text, $4::bool, $5::uuid, $6::timestamptz
				WHERE NOT EXISTS (SELECT 1 FROM articles WHERE slug = $2::text AND deleted_at IS NULL)`,
				n.Title, n.Slug, n.Body, n.IsPublished, adminID, now,
			)
			mustExec("seed news (fallback) "+n.Title, err2)
		}
	}
	log.Printf("  %d news articles seeded", len(newsList))
}

// ─── Contact Info ─────────────────────────────────────────────────────────────

func seedContactInfo(ctx context.Context, db *sqlx.DB) {
	// Upsert the single contact_info row (id=1)
	_, err := db.ExecContext(ctx, `
		INSERT INTO contact_info (id, phone, email, line_id, facebook_url)
		VALUES (1, $1, $2, $3, $4)
		ON CONFLICT (id) DO UPDATE
			SET phone        = EXCLUDED.phone,
				email        = EXCLUDED.email,
				line_id      = EXCLUDED.line_id,
				facebook_url = EXCLUDED.facebook_url`,
		"02 645 1133",
		"info@tiba.co.th",
		"@TIBA",
		"https://www.facebook.com/IBATHAI/",
	)
	mustExec("seed contact info", err)
	log.Println("  contact info seeded")
}

// ─── Partners ─────────────────────────────────────────────────────────────────

type partnerSeed struct {
	Name  string
	Order int16
}

func seedPartners(ctx context.Context, db *sqlx.DB) {
	partners := []partnerSeed{
		{Name: "MSIG", Order: 1},
		{Name: "Dhipaya", Order: 2},
		{Name: "คปภ.", Order: 3},
		{Name: "FWD", Order: 4},
		{Name: "รู้ใจ", Order: 5},
	}

	for _, p := range partners {
		_, err := db.ExecContext(ctx, `
			INSERT INTO partners (name, logo_path, display_order, is_active)
			SELECT $1::text, '', $2::int, true
			WHERE NOT EXISTS (SELECT 1 FROM partners WHERE name = $1::text AND deleted_at IS NULL)`,
			p.Name, p.Order,
		)
		mustExec("seed partner "+p.Name, err)
	}
	log.Printf("  %d partners seeded", len(partners))
}

// ─── Price Benefits ───────────────────────────────────────────────────────────

func seedPriceBenefits(ctx context.Context, db *sqlx.DB) {
	// Ensure the three plans exist
	plans := []struct {
		PlanType     string
		Label        string
		AnnualFee    float64
		DisplayOrder int16
	}{
		{"general", "สมาชิกทั่วไป", 0, 1},
		{"association_company", "สมาชิกสมาคม (นิติบุคคล)", 0, 2},
		{"association_individual", "สมาชิกสมาคม (บุคคลธรรมดา)", 0, 3},
	}

	for _, p := range plans {
		_, err := db.ExecContext(ctx, `
			INSERT INTO price_benefit_plans (plan_type, label, annual_fee, display_order, is_active)
			VALUES ($1, $2, $3, $4, true)
			ON CONFLICT (plan_type) DO NOTHING`,
			p.PlanType, p.Label, p.AnnualFee, p.DisplayOrder,
		)
		mustExec("seed plan "+p.PlanType, err)
	}

	// Seed conditions for general plan
	generalConditions := []string{
		"เข้าถึงข้อมูลทั่วไป",
		"อัพเดตข่าวสาร",
		"รับสิทธิ์สมัครคอร์ส",
	}
	seedConditionsForPlan(context.Background(), db, "general", generalConditions)

	// Seed conditions for both association plans (same 5 conditions)
	associationConditions := []string{
		"เข้าถึงข้อมูลทั่วไป",
		"อัพเดตข่าวสาร",
		"รับสิทธิ์สมัครคอร์ส",
		"ได้รับการขึ้นโลโก้",
		"สามารถดาวน์โหลดประกาศ",
	}
	seedConditionsForPlan(context.Background(), db, "association_company", associationConditions)
	seedConditionsForPlan(context.Background(), db, "association_individual", associationConditions)

	log.Println("  price benefit plans and conditions seeded")
}

func seedConditionsForPlan(ctx context.Context, db *sqlx.DB, planType string, conditions []string) {
	var planID string
	if err := db.QueryRowContext(ctx,
		`SELECT id FROM price_benefit_plans WHERE plan_type = $1`, planType,
	).Scan(&planID); err != nil {
		log.Printf("  WARNING: plan %s not found, skipping conditions: %v", planType, err)
		return
	}

	for i, cond := range conditions {
		_, err := db.ExecContext(ctx, `
			INSERT INTO price_benefit_conditions (plan_id, condition_text, display_order)
			SELECT $1::uuid, $2::text, $3::int
			WHERE NOT EXISTS (
				SELECT 1 FROM price_benefit_conditions
				WHERE plan_id = $1::uuid AND condition_text = $2::text
			)`,
			planID, cond, int16(i+1),
		)
		mustExec("seed condition "+cond, err)
	}
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

func mustExec(label string, err error) {
	if err != nil {
		log.Fatalf("SEED ERROR [%s]: %v", label, err)
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
