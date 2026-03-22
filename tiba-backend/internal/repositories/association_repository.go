package repositories

import (
	"context"
	"fmt"

	"github.com/jmoiron/sqlx"
	"github.com/tiba/tiba-backend/internal/models"
)

type AssociationRepository struct {
	db *sqlx.DB
}

func NewAssociationRepository(db *sqlx.DB) *AssociationRepository {
	return &AssociationRepository{db: db}
}

func (r *AssociationRepository) CreateRegistration(ctx context.Context, tx *sqlx.Tx, reg *models.AssociationRegistration) error {
	query := `INSERT INTO association_registrations
		(user_id, entity_type, org_name, tax_id, first_name, last_name, id_card_number, phone, address)
		VALUES ($1,$2,NULLIF($3,''),NULLIF($4,''),NULLIF($5,''),NULLIF($6,''),NULLIF($7,''),NULLIF($8,''),NULLIF($9,''))
		RETURNING id`
	var err error
	if tx != nil {
		err = tx.QueryRowxContext(ctx, query,
			reg.UserID, reg.EntityType, reg.OrgName.String, reg.TaxID.String,
			reg.FirstName.String, reg.LastName.String, reg.IDCardNumber.String,
			reg.Phone.String, reg.Address.String).Scan(&reg.ID)
	} else {
		err = r.db.QueryRowxContext(ctx, query,
			reg.UserID, reg.EntityType, reg.OrgName.String, reg.TaxID.String,
			reg.FirstName.String, reg.LastName.String, reg.IDCardNumber.String,
			reg.Phone.String, reg.Address.String).Scan(&reg.ID)
	}
	return err
}

func (r *AssociationRepository) FindRegistrationByID(ctx context.Context, id string) (*models.AssociationRegistration, error) {
	var reg models.AssociationRegistration
	err := r.db.GetContext(ctx, &reg, `SELECT * FROM association_registrations WHERE id=$1`, id)
	if err != nil {
		return nil, err
	}
	return &reg, nil
}

func (r *AssociationRepository) FindRegistrationByUserID(ctx context.Context, userID string) (*models.AssociationRegistration, error) {
	var reg models.AssociationRegistration
	err := r.db.GetContext(ctx, &reg, `SELECT * FROM association_registrations WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1`, userID)
	if err != nil {
		return nil, err
	}
	return &reg, nil
}

func (r *AssociationRepository) UpdateRegistrationDoc(ctx context.Context, id, field, path string) error {
	query := fmt.Sprintf("UPDATE association_registrations SET %s=$1 WHERE id=$2", field)
	_, err := r.db.ExecContext(ctx, query, path, id)
	return err
}

func (r *AssociationRepository) UpdateRegistrationStatus(ctx context.Context, id, status, reviewerID, note, stage string) error {
	var query string
	switch stage {
	case "first":
		query = `UPDATE association_registrations SET status=$1, first_reviewed_by=$2, first_reviewed_at=now(), first_review_note=$3 WHERE id=$4`
	case "second":
		query = `UPDATE association_registrations SET status=$1, second_reviewed_by=$2, second_reviewed_at=now(), second_review_note=$3 WHERE id=$4`
	case "payment":
		query = `UPDATE association_registrations SET status=$1, payment_confirmed_by=$2, payment_confirmed_at=now(), second_review_note=$3 WHERE id=$4`
	default:
		query = `UPDATE association_registrations SET status=$1, first_reviewed_by=$2, first_reviewed_at=now(), first_review_note=$3 WHERE id=$4`
	}
	_, err := r.db.ExecContext(ctx, query, status, reviewerID, note, id)
	return err
}

func (r *AssociationRepository) ListRegistrations(ctx context.Context, status string, limit, offset int) ([]models.AssociationRegistration, int64, error) {
	var regs []models.AssociationRegistration
	var total int64

	args := []interface{}{}
	where := "WHERE 1=1"
	idx := 1

	if status != "" {
		where += fmt.Sprintf(" AND status=$%d", idx)
		args = append(args, status)
		idx++
	}

	err := r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM association_registrations "+where, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	query := fmt.Sprintf("SELECT * FROM association_registrations %s ORDER BY created_at DESC LIMIT $%d OFFSET $%d", where, idx, idx+1)
	args = append(args, limit, offset)
	err = r.db.SelectContext(ctx, &regs, query, args...)
	return regs, total, err
}

func (r *AssociationRepository) CreateProfile(ctx context.Context, tx *sqlx.Tx, profile *models.AssociationProfile) error {
	query := `INSERT INTO association_profiles
		(user_id, registration_id, entity_type, display_name, tax_id, phone, address, membership_number)
		VALUES ($1,$2,$3,$4,NULLIF($5,''),NULLIF($6,''),NULLIF($7,''),NULLIF($8,''))`
	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query,
			profile.UserID, profile.RegistrationID, profile.EntityType, profile.DisplayName,
			profile.TaxID.String, profile.Phone.String, profile.Address.String,
			profile.MembershipNumber.String)
	} else {
		_, err = r.db.ExecContext(ctx, query,
			profile.UserID, profile.RegistrationID, profile.EntityType, profile.DisplayName,
			profile.TaxID.String, profile.Phone.String, profile.Address.String,
			profile.MembershipNumber.String)
	}
	return err
}

func (r *AssociationRepository) FindProfileByUserID(ctx context.Context, userID string) (*models.AssociationProfile, error) {
	var profile models.AssociationProfile
	err := r.db.GetContext(ctx, &profile, `SELECT * FROM association_profiles WHERE user_id=$1`, userID)
	if err != nil {
		return nil, err
	}
	return &profile, nil
}

func (r *AssociationRepository) ListSubUserRequests(ctx context.Context, status string, limit, offset int) ([]models.AssociationSubUser, int64, error) {
	var subs []models.AssociationSubUser
	var total int64

	args := []interface{}{}
	where := "WHERE 1=1"
	idx := 1

	if status != "" {
		where += fmt.Sprintf(" AND invite_status=$%d", idx)
		args = append(args, status)
		idx++
	}

	err := r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM association_sub_users "+where, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	query := fmt.Sprintf("SELECT * FROM association_sub_users %s ORDER BY created_at DESC LIMIT $%d OFFSET $%d", where, idx, idx+1)
	args = append(args, limit, offset)
	err = r.db.SelectContext(ctx, &subs, query, args...)
	return subs, total, err
}

func (r *AssociationRepository) FindSubUserByID(ctx context.Context, id string) (*models.AssociationSubUser, error) {
	var sub models.AssociationSubUser
	err := r.db.GetContext(ctx, &sub, `SELECT * FROM association_sub_users WHERE id=$1`, id)
	if err != nil {
		return nil, err
	}
	return &sub, nil
}

func (r *AssociationRepository) UpdateSubUserStatus(ctx context.Context, id, status, reviewerID, note string) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE association_sub_users SET invite_status=$1, reviewed_by=$2, reviewed_at=now(), review_note=NULLIF($3,'') WHERE id=$4`,
		status, reviewerID, note, id)
	return err
}

// RequestSubMember inserts a new sub-user invitation record for the given main user.
func (r *AssociationRepository) RequestSubMember(ctx context.Context, mainUserID, invitedEmail, permission string) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO association_sub_users (main_user_id, invited_email, permission, invite_status)
		 VALUES ($1, $2, $3, 'pending')`,
		mainUserID, invitedEmail, permission,
	)
	return err
}

// ListSubUsers returns all sub-user records that belong to the given main user.
func (r *AssociationRepository) ListSubUsers(ctx context.Context, mainUserID string) ([]models.AssociationSubUser, error) {
	var subs []models.AssociationSubUser
	err := r.db.SelectContext(ctx, &subs,
		`SELECT * FROM association_sub_users WHERE main_user_id = $1 ORDER BY created_at DESC`,
		mainUserID,
	)
	return subs, err
}
