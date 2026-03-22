package config

import (
	"log"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	ServerPort       string
	Env              string
	DBHost           string
	DBPort           string
	DBUser           string
	DBPassword       string
	DBName           string
	DBSSLMode        string
	JWTSecret        string
	JWTAccessExpiry  time.Duration
	JWTRefreshExpiry time.Duration
	UploadDir        string
	MaxFileSize      int64
	AllowedOrigins   string
	// SMTP
	SMTPHost     string
	SMTPPort     string
	SMTPEmail    string
	SMTPPassword string
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, reading from environment")
	}

	accessExpiry, err := time.ParseDuration(getEnv("JWT_ACCESS_EXPIRY", "15m"))
	if err != nil {
		accessExpiry = 15 * time.Minute
	}
	refreshExpiry, err := time.ParseDuration(getEnv("JWT_REFRESH_EXPIRY", "720h"))
	if err != nil {
		refreshExpiry = 720 * time.Hour
	}

	maxFileSize, err := strconv.ParseInt(getEnv("MAX_FILE_SIZE", "10485760"), 10, 64)
	if err != nil {
		maxFileSize = 10485760
	}

	return &Config{
		ServerPort:       getEnv("SERVER_PORT", "8080"),
		Env:              getEnv("ENV", "development"),
		DBHost:           getEnv("DB_HOST", "localhost"),
		DBPort:           getEnv("DB_PORT", "5432"),
		DBUser:           getEnv("DB_USER", "postgres"),
		DBPassword:       getEnv("DB_PASSWORD", "postgres"),
		DBName:           getEnv("DB_NAME", "tiba_db"),
		DBSSLMode:        getEnv("DB_SSLMODE", "disable"),
		JWTSecret:        getEnv("JWT_SECRET", "secret"),
		JWTAccessExpiry:  accessExpiry,
		JWTRefreshExpiry: refreshExpiry,
		UploadDir:        getEnv("UPLOAD_DIR", "./uploads"),
		MaxFileSize:      maxFileSize,
		AllowedOrigins:   getEnv("ALLOWED_ORIGINS", "http://localhost:3000"),
		SMTPHost:         getEnv("SMTP_HOST", "smtp.gmail.com"),
		SMTPPort:         getEnv("SMTP_PORT", "587"),
		SMTPEmail:        getEnv("SMTP_EMAIL", ""),
		SMTPPassword:     getEnv("SMTP_PASSWORD", ""),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
