package handlers

import (
	"auth_service/internal/database"
	"auth_service/internal/models"
	"auth_service/internal/utils"
	"fmt"
	"os"

	"github.com/gin-gonic/gin"
)

func Checklogin(c *gin.Context) {
	email := c.Query("email")
	fmt.Printf("Checking login for email: %s\n", email)
	if email == "" {
		c.JSON(400, utils.Response{
			Code:    400,
			Success: false,
			Message: "Bad Request",
			Error:   "Email is required",
		})
		return
	}

	headers := c.Request.Header
	secret_key := os.Getenv("JWT_TOKEN")

	if secret_key == "" {
		c.JSON(500, utils.Response{
			Code:    500,
			Success: false,
			Message: "Internal Server Error",
			Error:   "Secret key not set in the environment variable",
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
	fmt.Printf("Authorization header: %s\n", authHeader)

	if len(authHeader) < 7 || authHeader[:7] != "Bearer " {
		c.JSON(401, utils.Response{
			Code:    401,
			Success: false,
			Message: "Unauthorized",
			Error:   "Invalid auth headers",
		})
		return
	}

	token := authHeader[7:]
	fmt.Printf("Token: %s\n", token)
	claims, err := utils.DecodeJWT(token)
	if err != nil {
		c.JSON(401, utils.Response{
			Code:    401,
			Success: false,
			Message: "Unauthorized",
			Error:   "Invalid auth tokens",
		})
		return
	}

	tx := database.DB.Begin()

	var user models.User
	if err := tx.Where("email = ?", email).First(&user).Error; err != nil {
		tx.Rollback()
		c.JSON(404, utils.Response{
			Code:    404,
			Success: false,
			Message: "User does not exist",
			Error:   err.Error(),
		})
		return
	}

	if claims["email"] != email {
		c.JSON(401, utils.Response{
			Code:    401,
			Success: false,
			Message: "Unauthorized",
			Error:   "User mismatch",
		})
		return
	}

	fmt.Printf("claims: %v\n", claims)

	tx.Commit()

	c.JSON(200, utils.Response{
		Code:    200,
		Success: true,
		Message: "Verified",
		Error:   nil,
	})

}
