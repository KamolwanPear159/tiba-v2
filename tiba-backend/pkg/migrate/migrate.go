package migrate

import (
	"fmt"
	"io/fs"
	"log"
	"sort"
	"strings"

	"github.com/jmoiron/sqlx"
	"github.com/tiba/tiba-backend/migrations"
)

// Run applies all pending SQL migrations in lexicographic order.
// A schema_migrations table tracks which files have already been applied,
// so re-running is safe (idempotent).
func Run(db *sqlx.DB) error {
	if _, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version    VARCHAR(255) PRIMARY KEY,
			applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
		)
	`); err != nil {
		return fmt.Errorf("migrate: create tracking table: %w", err)
	}

	var applied []string
	if err := db.Select(&applied, `SELECT version FROM schema_migrations ORDER BY version`); err != nil {
		return fmt.Errorf("migrate: read applied versions: %w", err)
	}
	done := make(map[string]bool, len(applied))
	for _, v := range applied {
		done[v] = true
	}

	entries, err := fs.ReadDir(migrations.FS, ".")
	if err != nil {
		return fmt.Errorf("migrate: list migration files: %w", err)
	}
	var files []string
	for _, e := range entries {
		if !e.IsDir() && strings.HasSuffix(e.Name(), ".sql") {
			files = append(files, e.Name())
		}
	}
	sort.Strings(files)

	for _, name := range files {
		if done[name] {
			continue
		}
		content, err := migrations.FS.ReadFile(name)
		if err != nil {
			return fmt.Errorf("migrate: read %s: %w", name, err)
		}

		log.Printf("migrate: applying %s ...", name)
		tx, err := db.Begin()
		if err != nil {
			return fmt.Errorf("migrate: begin tx %s: %w", name, err)
		}
		if _, err := tx.Exec(string(content)); err != nil {
			tx.Rollback() //nolint:errcheck
			return fmt.Errorf("migrate: exec %s: %w", name, err)
		}
		if _, err := tx.Exec(`INSERT INTO schema_migrations (version) VALUES ($1)`, name); err != nil {
			tx.Rollback() //nolint:errcheck
			return fmt.Errorf("migrate: record %s: %w", name, err)
		}
		if err := tx.Commit(); err != nil {
			return fmt.Errorf("migrate: commit %s: %w", name, err)
		}
		log.Printf("migrate: applied  %s", name)
	}

	log.Println("migrate: schema is up to date")
	return nil
}
