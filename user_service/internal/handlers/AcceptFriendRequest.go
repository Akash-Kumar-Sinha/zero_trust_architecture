package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"user_service/internal/database"
	"user_service/internal/models"
	"user_service/internal/utils"

	"github.com/gin-gonic/gin"
)

type acceptFriendreqest struct {
	RequestID      uint   `json:"request_id" binding:"required"`
	SenderUsername string `json:"sender_username" binding:"required"`
	CurrentUser    string `json:"current_user" binding:"required"`
}

func AcceptFriendRequest(c *gin.Context) {
	var req acceptFriendreqest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, utils.Response{
			Code:    400,
			Success: false,
			Message: "Invalid data",
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
				Message: "Internal Server error",
				Error:   "Internal Server error, try again",
			})
			return
		}
	}()
	var friendRequest models.FriendRequest
	if err := tx.Where("id = ?", req.RequestID).First(&friendRequest).Error; err != nil {
		tx.Rollback()
		c.JSON(404, utils.Response{
			Code:    404,
			Success: false,
			Message: "Friend request not found",
			Error:   err.Error(),
		})
		return
	}

	friendRequest.Status = models.Accepted
	if err := tx.Save(&friendRequest).Error; err != nil {
		tx.Rollback()
		c.JSON(500, utils.Response{
			Code:    500,
			Success: false,
			Message: "Failed to update friend request status",
			Error:   err.Error(),
		})
		return
	}

	conversations := models.Conversations{
		Profile1ID: friendRequest.RequesterID,
		Profile2ID: friendRequest.ReceiverID,
	}

	if err := tx.Create(&conversations).Error; err != nil {
		tx.Rollback()
		c.JSON(500, utils.Response{
			Code:    500,
			Success: false,
			Message: "Failed to create conversation",
			Error:   err.Error(),
		})
		return
	}

	authUrl := os.Getenv("AUTH_SERVER_URL")
	if authUrl == "" {
		log.Fatal("AUTH_SERVER_URL is not set in the environment files")
		c.JSON(400, utils.Response{
			Code:    400,
			Success: false,
			Message: "env is missing",
			Error:   "env variable is missing",
		})
		return
	}
	authKeyUrl := authUrl + "/get_keypair"
	reqParams := "?conversations_id=" + fmt.Sprintf("%d", conversations.ID) +
		"&profile_one_id=" + fmt.Sprintf("%d", friendRequest.RequesterID) +
		"&profile_two_id=" + fmt.Sprintf("%d", friendRequest.ReceiverID)

	httpReq, err := http.NewRequest("GET", authKeyUrl+reqParams, nil)
	if err != nil {
		c.JSON(500, utils.Response{
			Code:    500,
			Success: false,
			Message: "Internal Server Error",
			Error:   err.Error(),
		})
		return
	}
	client := &http.Client{}
	resp, err := client.Do(httpReq)
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

	if resp.StatusCode != http.StatusOK {
		c.JSON(resp.StatusCode, utils.Response{
			Code:    resp.StatusCode,
			Success: false,
			Message: "Failed to retrieve key pair",
			Error:   "Failed to retrieve key pair from auth service",
		})
		return
	}

	var keyPairResponse struct {
		PrivateKey string `json:"private_key"`
		PublicKey  string `json:"public_key"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&keyPairResponse); err != nil {
		c.JSON(500, utils.Response{
			Code:    500,
			Success: false,
			Message: "Failed to decode key pair response",
			Error:   err.Error(),
		})
		return
	}

	conversations.PrivateKey = &keyPairResponse.PrivateKey
	conversations.PublicKey = &keyPairResponse.PublicKey
	if err := tx.Save(&conversations).Error; err != nil {
		tx.Rollback()
		c.JSON(500, utils.Response{
			Code:    500,
			Success: false,
			Message: "Failed to save conversation with key pair",
			Error:   err.Error(),
		})
		return
	}
	if err := tx.Commit().Error; err != nil {
		c.JSON(500, utils.Response{
			Code:    500,
			Success: false,
			Message: "Failed to commit transaction",
			Error:   err.Error(),
		})
		return
	}
	fmt.Printf("Accepted friend request from %s to %s\n", req.SenderUsername, req.CurrentUser)

	c.JSON(200, utils.Response{
		Code:    200,
		Success: true,
		Message: "Accepted Friend request",
		Error:   nil,
	})

}
