package paginate

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

type Params struct {
	Page    int
	PerPage int
	Offset  int
}

func Parse(c *gin.Context) Params {
	page := 1
	perPage := 20

	if p := c.Query("page"); p != "" {
		if v, err := strconv.Atoi(p); err == nil && v > 0 {
			page = v
		}
	}
	if pp := c.Query("per_page"); pp != "" {
		if v, err := strconv.Atoi(pp); err == nil && v > 0 {
			perPage = v
		}
	}
	if perPage > 100 {
		perPage = 100
	}

	offset := (page - 1) * perPage
	return Params{
		Page:    page,
		PerPage: perPage,
		Offset:  offset,
	}
}

func TotalPages(total int64, perPage int) int {
	if perPage == 0 {
		return 0
	}
	pages := int(total) / perPage
	if int(total)%perPage != 0 {
		pages++
	}
	return pages
}
