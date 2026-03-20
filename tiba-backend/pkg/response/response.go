package response

import "github.com/gin-gonic/gin"

type Meta struct {
	Page       int   `json:"page"`
	PerPage    int   `json:"per_page"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}

func Success(c *gin.Context, status int, data interface{}, message string) {
	c.JSON(status, gin.H{"success": true, "data": data, "message": message})
}

func Paginated(c *gin.Context, status int, data interface{}, meta Meta, message string) {
	c.JSON(status, gin.H{"success": true, "data": data, "meta": meta, "message": message})
}

func Error(c *gin.Context, status int, code string, message string) {
	c.JSON(status, gin.H{"success": false, "error": gin.H{"code": code, "message": message}})
}
