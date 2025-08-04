package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"user_service/internal/database"
	"user_service/internal/models"
	"user_service/internal/utils"

	"github.com/gin-gonic/gin"
)

type getCurrentUserResponse struct {
	utils.Response
	Profile models.Profile `json:"profile"`
}

func GetCurrentUser(c *gin.Context) {
	headers := c.Request.Header

	authHeader := headers.Get("Authorization")
	if authHeader == "" {
		c.JSON(401, utils.Response{
			Code:    401,
			Success: false,
			Message: "Unauthorized",
			Error:   "Authorization header is missing",
		})
		return
	}

	req, err := http.NewRequest("GET", "http://localhost:8000/v1/auth/verify_token_claims", nil)
	if err != nil {
		c.JSON(500, utils.Response{
			Code:    500,
			Success: false,
			Message: "Internal Server Error",
			Error:   err.Error(),
		})
		return
	}
	req.Header.Set("Authorization", authHeader)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(500, utils.Response{
			Code:    500,
			Success: false,
			Message: "Internal Server Error",
			Error:   err.Error(),
		})
		return
	}
	defer resp.Body.Close()

	var verifyResp struct {
		utils.Response
		User utils.JwtClaims `json:"user"`
	}

	err = json.NewDecoder(resp.Body).Decode(&verifyResp)
	if err != nil {
		c.JSON(500, utils.Response{
			Code:    500,
			Success: false,
			Message: "Failed to decode response",
			Error:   err.Error(),
		})
		return
	}

	tx := database.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			c.JSON(500, utils.Response{
				Code:    500,
				Success: false,
				Message: "Internal Server Error",
				Error:   fmt.Sprintf("Panic occurred: %v", r),
			})
		}
	}()

	var profile models.Profile
	if err := tx.Where("email = ?", verifyResp.User.Email).First(&profile).Error; err != nil {
		tx.Rollback()
		c.JSON(404, utils.Response{
			Code:    404,
			Success: false,
			Message: "Profile not found",
			Error:   err.Error(),
		})
		return
	}

	tx.Commit()

	c.JSON(200, getCurrentUserResponse{
		Response: utils.Response{
			Code:    200,
			Success: true,
			Message: "Current user retrieved successfully",
			Error:   nil,
		},
		Profile: profile,
	})
}
