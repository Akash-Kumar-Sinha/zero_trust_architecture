package handlers

import (
	"user_service/internal/database"
	"user_service/internal/models"
	"user_service/internal/utils"

	"github.com/gin-gonic/gin"
)

type userResponse struct {
	utils.Response
	Data []models.Profile `json:"data"`
}

func Getusers(c *gin.Context) {
	tx := database.DB.Begin()
	// fetch all users from the database
	var users []models.Profile
	if err := tx.Find(&users).Error; err != nil {
		tx.Rollback()
		c.JSON(500, utils.Response{
			Code:    500,
			Success: false,
			Message: "Internal Server Error",
			Error:   "Failed to fetch users",
		})
		return
	}

	c.JSON(200, userResponse{
		Response: utils.Response{
			Code:    200,
			Success: true,
			Message: "Users fetched successfully",
			Error:   nil,
		},
		Data: users,
	})
}
