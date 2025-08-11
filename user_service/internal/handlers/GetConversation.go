package handlers

import (
	"user_service/internal/database"
	"user_service/internal/models"
	"user_service/internal/utils"

	"github.com/gin-gonic/gin"
)

type getConversationsRequest struct {
	// user one is the current user and usertwo is the second user
	UserOneUsername string `form:"user_one_username" binding:"required"`
	UserTwoUsername string `form:"user_two_username" binding:"required"`
}

type getConversationsResponse struct {
	utils.Response
	Conversation models.Conversations `json:"conversation"`
}

func GetConversation(c *gin.Context) {
	var req getConversationsRequest

	if err := c.ShouldBindQuery(&req); err != nil {
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
				Error:   "Panic Operations",
			})
			return
		}
	}()

	var userOne models.Profile
	if err := tx.Where("username = ?", req.UserOneUsername).Find(&userOne).Error; err != nil {
		tx.Rollback()
		c.JSON(404, utils.Response{
			Code:    404,
			Success: false,
			Message: "User not found",
			Error:   err.Error(),
		})
		return
	}

	var userTwo models.Profile
	if err := tx.Where("username = ?", req.UserTwoUsername).Find(&userTwo).Error; err != nil {
		tx.Rollback()
		c.JSON(404, utils.Response{
			Code:    404,
			Success: false,
			Message: "User not found",
			Error:   err.Error(),
		})
		return
	}

	var conversation models.Conversations

	// Use preloading to get complete conversation with profiles
	if err := tx.
		Preload("Profile1").
		Preload("Profile2").
		Preload("Members").
		Preload("Members.User").
		Where("(profile1_id = ? AND profile2_id = ?) OR (profile1_id = ? AND profile2_id = ?)",
			userOne.ID, userTwo.ID, userTwo.ID, userOne.ID).First(&conversation).Error; err != nil {
		tx.Rollback()
		c.JSON(404, utils.Response{
			Code:    404,
			Success: false,
			Message: "No conversation found",
			Error:   err.Error(),
		})
		return
	}

	tx.Commit()

	c.JSON(200, getConversationsResponse{
		Response: utils.Response{
			Code:    200,
			Success: true,
			Message: "Conversation found",
			Error:   nil,
		},
		Conversation: conversation,
	})

}
