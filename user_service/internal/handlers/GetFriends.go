package handlers

import (
	"user_service/internal/database"
	"user_service/internal/models"
	"user_service/internal/utils"

	"github.com/gin-gonic/gin"
)

type getFriendsResponse struct {
	utils.Response
	Data []models.Profile `json:"data"`
}

func GetFriends(c *gin.Context) {
	var req utils.CurrentUserProfile

	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(400, utils.Response{
			Code:    400,
			Success: false,
			Message: "Invaild data",
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
	var conversations []models.Conversations
	if err := tx.Where("profile1_id = ? OR profile2_id = ?", req.ID, req.ID).Find(&conversations).Error; err != nil {
		tx.Rollback()
		c.JSON(404, utils.Response{
			Code:    404,
			Success: false,
			Message: "No conversations found",
			Error:   err.Error(),
		})
		return
	}

	var friendIDs []uint
	for _, conv := range conversations {
		if conv.Profile1ID == req.ID {
			friendIDs = append(friendIDs, conv.Profile2ID)
		} else {
			friendIDs = append(friendIDs, conv.Profile1ID)
		}
	}

	if len(friendIDs) == 0 {
		tx.Commit()
		c.JSON(200, getFriendsResponse{
			Response: utils.Response{
				Code:    200,
				Success: true,
				Message: "No friends found",
				Error:   nil,
			},
			Data: []models.Profile{},
		})
		return
	}

	var friends []models.Profile
	if err := tx.Where("id IN ?", friendIDs).Find(&friends).Error; err != nil {
		tx.Rollback()
		c.JSON(500, utils.Response{
			Code:    500,
			Success: false,
			Message: "Failed to fetch friends",
			Error:   err.Error(),
		})
		return
	}

	tx.Commit()
	c.JSON(200, getFriendsResponse{
		Response: utils.Response{
			Code:    200,
			Success: true,
			Message: "Friends retrieved successfully",
			Error:   nil,
		},
		Data: friends,
	})
}
