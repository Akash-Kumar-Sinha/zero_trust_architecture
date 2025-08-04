package handlers

import (
	"fmt"
	"user_service/internal/database"
	"user_service/internal/models"
	"user_service/internal/utils"

	"github.com/gin-gonic/gin"
)

type userProfile struct {
	ID           uint   `json:"ID"`
	ProfileImage string `json:"ProfileImage"`
	Username     string `json:"Username"`
}
type SearchbyusernameResponse struct {
	utils.Response
	Users []userProfile `json:"users"`
}

func Searchbyusername(c *gin.Context) {
	username := c.Query("username")
	if username == "" {
		c.JSON(400, utils.Response{
			Code:    400,
			Success: false,
			Message: "Invalid username",
			Error:   nil,
		})
		return
	}
	fmt.Printf("%s", username)

	tx := database.DB.Begin()
	var users []models.Profile
	if err := tx.Where("username LIKE ?", username+"%").Find(&users).Error; err != nil {
		tx.Rollback()
		c.JSON(404, utils.Response{
			Code:    404,
			Success: false,
			Message: "Not found",
			Error:   err.Error(),
		})
		return
	}

	var userProfiles []userProfile
	for _, user := range users {
		userProfiles = append(userProfiles, userProfile{
			ID:           user.ID,
			ProfileImage: user.ProfileImage,
			Username:     user.Username,
		})
	}

	tx.Commit()
	c.JSON(200, SearchbyusernameResponse{
		Response: utils.Response{
			Code:    200,
			Success: true,
			Message: "Users found",
			Error:   nil,
		},
		Users: userProfiles,
	})
}
