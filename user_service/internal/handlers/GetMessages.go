package handlers

import (
	"user_service/internal/database"
	"user_service/internal/models"
	"user_service/internal/utils"

	"github.com/gin-gonic/gin"
)

type getMessageResponse struct {
	Code    int               `json:"code"`
	Message string            `json:"message"`
	Error   string            `json:"error"`
	Data    []models.Messages `json:"data"`
}

func GetMessages(c *gin.Context) {
	conversationsID := c.Query("conversationId")

	if conversationsID == "" {
		c.JSON(400, utils.Response{
			Code:    400,
			Message: "Bad Request",
			Error:   "Missing conversationsId",
		})
		return
	}

	tx := database.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			c.JSON(500, utils.Response{
				Code:    500,
				Message: "Internal Server Error",
				Error:   "Panic Operations",
			})
		}
	}()

	var messages []models.Messages
	if err := tx.Preload("Content").
		Where("conversation_id = ?", conversationsID).
		Order("created_at ASC").
		Find(&messages).Error; err != nil {
		tx.Rollback()
		c.JSON(500, utils.Response{
			Code:    500,
			Message: "Internal Server Error",
			Error:   err.Error(),
		})
		return
	}

	tx.Commit()
	c.JSON(200, getMessageResponse{
		Code:    200,
		Message: "Messages retrieved successfully",
		Data:    messages,
	})
}
