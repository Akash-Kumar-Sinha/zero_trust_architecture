package handlers

import (
	"auth_service/internal/utils"
	"os"

	"github.com/gin-gonic/gin"
)

func Profile(c *gin.Context) {
	headers := c.Request.Header
	secret_key := os.Getenv("JWT_TOKEN")

	if secret_key == "" {
		c.JSON(500, utils.Response{
			Code:    500,
			Success: false,
			Message: "Internal Server Error",
			Error:   "JWT secret key not set in environment variables",
		})
		return
	}
	if headers.Get("Authorization") == "" {
		c.JSON(401, utils.Response{
			Code:    401,
			Success: false,
			Message: "Unauthorized",
			Error:   "Authorization header is missing",
		})
		return
	}
	authHeader := headers.Get("Authorization")

	if len(authHeader) < 7 || authHeader[:7] != "Bearer " {
		c.JSON(401, utils.Response{
			Code:    401,
			Success: false,
			Message: "Unauthorized",
			Error:   "Invalid Authorization header format",
		})
		return
	}
	token := authHeader[7:]
	claims, err := utils.DecodeJWT(token)
	if err != nil {
		c.JSON(401, utils.Response{
			Code:    401,
			Success: false,
			Message: "Unauthorized",
			Error:   "Invalid JWT token",
		})
		return
	}

	c.JSON(200, utils.Response{
		Code:    200,
		Success: true,
		Message: "Profile fetched successfully",
		Error:    claims,
	})

}
