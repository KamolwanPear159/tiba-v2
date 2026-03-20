package upload

import (
	"errors"
	"fmt"
	"io"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

var allowedImageMIMEs = map[string]string{
	"image/jpeg": ".jpg",
	"image/png":  ".png",
	"image/gif":  ".gif",
}

var allowedDocMIMEs = map[string]string{
	"application/pdf": ".pdf",
}

func detectMIME(file io.Reader) (string, error) {
	buf := make([]byte, 512)
	n, err := file.Read(buf)
	if err != nil && err != io.EOF {
		return "", err
	}
	return http.DetectContentType(buf[:n]), nil
}

func SaveFile(c *gin.Context, fieldName, dir string) (string, error) {
	fileHeader, err := c.FormFile(fieldName)
	if err != nil {
		return "", err
	}

	src, err := fileHeader.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	detectedMIME, err := detectMIME(src)
	if err != nil {
		return "", err
	}
	src.Seek(0, io.SeekStart)

	ext := ""
	isImage := false
	isDoc := false

	if e, ok := allowedImageMIMEs[detectedMIME]; ok {
		ext = e
		isImage = true
	} else if e, ok := allowedDocMIMEs[detectedMIME]; ok {
		ext = e
		isDoc = true
	} else {
		// fallback: check file extension for pdf
		origExt := strings.ToLower(filepath.Ext(fileHeader.Filename))
		if origExt == ".pdf" {
			// check content-type header
			ct := fileHeader.Header.Get("Content-Type")
			mt, _, _ := mime.ParseMediaType(ct)
			if mt == "application/pdf" {
				ext = ".pdf"
				isDoc = true
			}
		}
		if !isImage && !isDoc {
			return "", errors.New("unsupported file type: " + detectedMIME)
		}
	}
	_ = isImage
	_ = isDoc

	subDir := "images"
	if isDoc {
		subDir = "documents"
	}

	targetDir := filepath.Join(dir, subDir)
	if err := os.MkdirAll(targetDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create upload directory: %w", err)
	}

	ts := time.Now().Format("20060102150405")
	filename := fmt.Sprintf("%s_%s%s", ts, uuid.New().String(), ext)
	dstPath := filepath.Join(targetDir, filename)

	dst, err := os.Create(dstPath)
	if err != nil {
		return "", fmt.Errorf("failed to create destination file: %w", err)
	}
	defer dst.Close()

	if _, err := io.Copy(dst, src); err != nil {
		return "", fmt.Errorf("failed to save file: %w", err)
	}

	urlPath := fmt.Sprintf("/uploads/%s/%s", subDir, filename)
	return urlPath, nil
}
