package repositories

import (
	"context"
	"crypto/rand"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/tiba/tiba-backend/internal/models"
)

type OTPRepository struct {
	db *sqlx.DB
}

func NewOTPRepository(db *sqlx.DB) *OTPRepository {
	return &OTPRepository{db: db}
}

func (r *OTPRepository) GenerateCode() (string, error) {
	b := make([]byte, 3)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	n := (int(b[0])<<16 | int(b[1])<<8 | int(b[2])) % 1000000
	return fmt.Sprintf("%06d", n), nil
}

func (r *OTPRepository) Create(ctx context.Context, email, code, purpose string) error {
	// Invalidate previous OTPs for same email+purpose
	_, err := r.db.ExecContext(ctx,
		`UPDATE otp_codes SET used_at = now() WHERE email=$1 AND purpose=$2 AND used_at IS NULL`,
		email, purpose,
	)
	if err != nil {
		return err
	}
	_, err = r.db.ExecContext(ctx,
		`INSERT INTO otp_codes (email, code, purpose, expires_at) VALUES ($1,$2,$3,$4)`,
		email, code, purpose, time.Now().Add(5*time.Minute),
	)
	return err
}

func (r *OTPRepository) Verify(ctx context.Context, email, code, purpose string) (*models.OTPCode, error) {
	var otp models.OTPCode
	err := r.db.GetContext(ctx, &otp,
		`SELECT * FROM otp_codes
		 WHERE email=$1 AND code=$2 AND purpose=$3 AND used_at IS NULL AND expires_at > now()
		 ORDER BY created_at DESC LIMIT 1`,
		email, code, purpose,
	)
	if err != nil {
		return nil, err
	}
	return &otp, nil
}

func (r *OTPRepository) MarkUsed(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE otp_codes SET used_at = now() WHERE id = $1`,
		id,
	)
	return err
}
