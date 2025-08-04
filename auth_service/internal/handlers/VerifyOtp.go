package handlers

import (
	"auth_service/internal/database"
	"auth_service/internal/models"
	"auth_service/internal/utils"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
)

type VerifyOtpRequest struct {
	Email string `json:"email" binding:"required,email"`
	OTP   uint   `json:"otp" binding:"required"`
}

type VerifyOtpResponse struct {
	utils.Response
	Token string `json:"token"`
}

func VerifyOtp(c *gin.Context) {
	var request VerifyOtpRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(400, utils.Response{
			Code:    400,
			Success: false,
			Message: "Invalid request format",
			Error:   err.Error(),
		})
		return
	}

	fmt.Printf("Received OTP verification request for email: %s with OTP: %d\n", request.Email, request.OTP)

	var userLogin models.UserLogin
	tx := database.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			c.JSON(500, utils.Response{
				Code:    500,
				Success: false,
				Message: "Internal server error",
				Error:   "An unexpected error occurred",
			})
		}
	}()
	if err := tx.Where("email = ? AND otp = ?", request.Email, request.OTP).First(&userLogin).Error; err != nil {
		tx.Rollback()
		c.JSON(404, utils.Response{
			Code:    404,
			Success: false,
			Message: "Invalid OTP or email not found",
			Error:   "No matching user login found",
		})
		return
	}
	if err := tx.Where("email = ? AND otp = ?", request.Email, request.OTP).First(&userLogin).Error; err != nil {
		tx.Rollback()
		c.JSON(404, utils.Response{
			Code:    404,
			Success: false,
			Message: "Invalid OTP or email not found",
			Error:   "No matching user login found",
		})
		return
	}
	if err := tx.Where("email = ? AND otp = ?", request.Email, request.OTP).First(&userLogin).Error; err != nil {
		tx.Rollback()
		c.JSON(404, utils.Response{
			Code:    404,
			Success: false,
			Message: "Invalid OTP or email not found",
			Error:   "No matching user login found",
		})
		return

	}

	token, err := utils.GenerateToken(request.Email, userLogin.ID, 5*time.Minute)
	if err != nil {
		tx.Rollback()

		c.JSON(500, utils.Response{
			Code:    500,
			Success: false,
			Message: "Failed to generate token",
			Error:   err.Error(),
		})
		return

	}

	userLogin.Verified = true
	userLogin.OTP = 0
	if err := tx.Save(&userLogin).Error; err != nil {
		tx.Rollback()
		c.JSON(500, utils.Response{
			Code:    500,
			Success: false,
			Message: "Failed to update user login",
			Error:   err.Error(),
		})
		return

	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(500, utils.Response{
			Code:    500,
			Success: false,
			Message: "Failed to commit changes",
			Error:   err.Error(),
		})
		return
	}

	response := utils.Response{
		Code:    200,
		Success: true,
		Message: "OTP verified successfully",
		Error:   nil,
	}

	c.JSON(200, VerifyOtpResponse{
		Response: response,
		Token:    token,
	})
}
