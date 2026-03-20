package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/tiba/tiba-backend/internal/config"
	pkgjwt "github.com/tiba/tiba-backend/pkg/jwt"
	"github.com/tiba/tiba-backend/pkg/response"
)

func AuthRequired(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", "Authorization header required")
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", "Invalid authorization header format")
			c.Abort()
			return
		}

		tokenStr := parts[1]
		claims, err := pkgjwt.ParseAccessToken(cfg.JWTSecret, tokenStr)
		if err != nil {
			if err == pkgjwt.ErrExpiredToken {
				response.Error(c, http.StatusUnauthorized, "TOKEN_EXPIRED", "Access token expired")
			} else {
				response.Error(c, http.StatusUnauthorized, "INVALID_TOKEN", "Invalid access token")
			}
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("email", claims.Email)
		c.Set("role", claims.Role)
		c.Next()
	}
}
