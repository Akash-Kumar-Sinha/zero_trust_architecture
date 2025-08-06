package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"user_service/internal/database"
	"user_service/internal/models"
	"user_service/internal/utils"

	"github.com/gin-gonic/gin"
)



func SendFriendRequest(c *gin.Context) {
	var request utils.CurrentUserProfile

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(400, utils.Response{
			Code:    400,
			Success: false,
			Message: "Invalid information",
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
				Error:   fmt.Sprintf("Panic occured: %v", r),
			})
			return
		}
	}()

	var receiver models.Profile
	if err := tx.Where("username = ?", request.Username).First(&receiver).Error; err != nil {
		tx.Rollback()
		c.JSON(404, utils.Response{
			Code:    404,
			Success: false,
			Message: "User not found",
			Error:   err.Error(),
		})
		return

	}
	headers := c.Request.Header

	authHeader := headers.Get("Authorization")

	if authHeader == "" {
		c.JSON(401, utils.Response{
			Code:    401,
			Success: false,
			Message: "Unauthorized",
			Error:   "Unauthorized user",
		})
		return
	}

	verifyUrl := os.Getenv("VERIFY_TOKEN_CLAIMS")
	if verifyUrl == "" {
		c.JSON(400, utils.Response{
			Code:    400,
			Success: false,
			Message: "env is missing",
			Error:   "env variable is missing",
		})
		return
	}

	req, err := http.NewRequest("GET", verifyUrl, nil)
	if err != nil {
		c.JSON(500, utils.Response{
			Code:    500,
			Success: false,
			Message: "Internal server error",
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

	var verifyResp utils.VerifyResp

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

	addFriendRequest := models.FriendRequest{
		RequesterID: profile.ID,
		ReceiverID:  receiver.ID,
		Status:      models.Pending,
	}

	if err := tx.Create(&addFriendRequest).Error; err != nil {
		tx.Rollback()
		c.JSON(500, utils.Response{
			Code:    500,
			Success: false,
			Message: "Internal Server Error",
			Error:   "Faild to send friend request",
		})
		return
	}

	tx.Commit()

	c.JSON(200, utils.Response{
		Code:    200,
		Success: true,
		Message: fmt.Sprintf("Send friend request to %v", receiver.Username),
		Error:   nil,
	})
}
