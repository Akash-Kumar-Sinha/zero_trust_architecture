package handlers

import (
	"fmt"
	"user_service/internal/database"
	"user_service/internal/models"
	"user_service/internal/utils"

	"github.com/gin-gonic/gin"
)

type friendRequestResponse struct {
	utils.Response
	Requests []models.FriendRequest `json:"requests"`
}

func GetFriendRequests(c *gin.Context) {
	var req utils.CurrentUserProfile

	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(400, utils.Response{
			Code:    400,
			Success: false,
			Message: "Data not found",
			Error:   err.Error(),
		})
		return
	}

	fmt.Print("Fetching friend requests for user ID: ", req.ID)

	tx := database.DB.Begin()
	defer func() {
		tx.Rollback()
		if r := recover(); r != nil {
			c.JSON(500, utils.Response{
				Code:    500,
				Success: false,
				Message: "Internal server error",
				Error:   fmt.Sprintf("Panic occured %v", r),
			})
			return
		}
	}()

	var friendRequests []models.FriendRequest

	if err := tx.Preload("Requester").Where("receiver_id = ? AND status = ?", req.ID, models.Pending).Find(&friendRequests).Error; err != nil {
		tx.Rollback()
		c.JSON(500, utils.Response{
			Code:    500,
			Success: false,
			Message: "Failed to retrieve friend requests",
			Error:   err.Error(),
		})
		return
	}
	tx.Commit()

	c.JSON(200, friendRequestResponse{
		Response: utils.Response{
			Code:    200,
			Success: true,
			Message: "Friend requests retrieved successfully",
		},
		Requests: friendRequests,
	})

}
