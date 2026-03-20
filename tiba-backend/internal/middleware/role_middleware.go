package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/tiba/tiba-backend/pkg/response"
)

func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		roleVal, exists := c.Get("role")
		if !exists {
			response.Error(c, http.StatusForbidden, "FORBIDDEN", "Role not found in context")
			c.Abort()
			return
		}

		role, ok := roleVal.(string)
		if !ok {
			response.Error(c, http.StatusForbidden, "FORBIDDEN", "Invalid role type")
			c.Abort()
			return
		}

		for _, allowed := range roles {
			if role == allowed {
				c.Next()
				return
			}
		}

		response.Error(c, http.StatusForbidden, "FORBIDDEN", "Insufficient permissions")
		c.Abort()
	}
}
