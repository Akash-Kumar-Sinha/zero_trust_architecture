package handlers

import (
	"auth_service/internal/database"
	"auth_service/internal/models"
	"auth_service/internal/utils"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	utils.Response
	Token      string `json:"token"`
	PrivateKey string `json:"private_key"`
}

func Login(c *gin.Context) {
	var request LoginRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(400, utils.Response{
			Code:    400,
			Success: false,
			Message: "Invalid request format",
			Error:   err.Error(),
		})
		return
	}

	headers := c.Request.Header
	secret_key := os.Getenv("JWT_TOKEN")

	if secret_key == "" {
		c.JSON(500, utils.Response{
			Code:    500,
			Success: false,
			Message: "Internal Server Error",
			Error:   "JWT secret key not set in environment variables",
		})
		return
	}
	if headers.Get("Authorization") == "" {
		c.JSON(401, utils.Response{
			Code:    401,
			Success: false,
			Message: "Unauthorized",
			Error:   "Authorization header is missing",
		})
		return
	}
	authHeader := headers.Get("Authorization")

	if len(authHeader) < 7 || authHeader[:7] != "Bearer " {
		c.JSON(401, utils.Response{
			Code:    401,
			Success: false,
			Message: "Unauthorized",
			Error:   "Invalid Authorization header format",
		})
		return
	}
	token := authHeader[7:]
	claims, err := utils.DecodeJWT(token)
	if err != nil {
		c.JSON(401, utils.Response{
			Code:    401,
			Success: false,
			Message: "Unauthorized",
			Error:   fmt.Sprintf("Invalid JWT token: %v", err),
		})
		return
	}

	if claims["email"] != request.Email {
		c.JSON(401, utils.Response{
			Code:    401,
			Success: false,
			Message: "Unauthorized",
			Error:   "Email does not match",
		})
		return
	}

	tx := database.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var user models.User
	var profile models.Profile
	var privateKey string

	if err := tx.Where("email = ?", request.Email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			salt := utils.RandomNumberGenerate()
			hashedPassword, hashErr := utils.HashPassword(request.Password, fmt.Sprintf("%v", salt))
			if hashErr != nil {
				tx.Rollback()
				c.JSON(500, utils.Response{
					Code:    500,
					Success: false,
					Message: "Internal Server Error",
					Error:   "Failed to hash password",
				})
				return
			}

			seed := fmt.Sprintf("%s:%d|%s", request.Email, salt, hashedPassword)
			var publicKey string
			var keyErr error
			privateKey, publicKey, keyErr = utils.KeypairGenerate(seed)
			if keyErr != nil {
				tx.Rollback()
				c.JSON(500, utils.Response{
					Code:    500,
					Success: false,
					Message: "Internal Server Error",
					Error:   "Failed to generate key pair",
				})
				return
			}

			atIndex := strings.Index(request.Email, "@")
			if atIndex == -1 {
				tx.Rollback()
				c.JSON(400, utils.Response{
					Code:    400,
					Success: false,
					Message: "Invalid email format",
					Error:   "Email must contain @ symbol",
				})
				return
			}
			username := request.Email[:atIndex]

			if username == "" {
				tx.Rollback()
				c.JSON(400, utils.Response{
					Code:    400,
					Success: false,
					Message: "Invalid email format",
					Error:   "Username part of email cannot be empty",
				})
				return
			}

			user = models.User{
				Email:    request.Email,
				Password: hashedPassword,
				Salt:     fmt.Sprintf("%v", salt),
				Username: username,
				Verified: true,
			}
			if err := tx.Create(&user).Error; err != nil {
				tx.Rollback()
				c.JSON(500, utils.Response{
					Code:    500,
					Success: false,
					Message: "Internal Server Error",
					Error:   "Failed to create user",
				})
				return
			}

			ProfilePicture := "https://avatar.oxro.io/avatar.svg?name=" + username

			profile = models.Profile{
				Email:        user.Email,
				Username:     username,
				PublicKey:    publicKey,
				ProfileImage: ProfilePicture,
				AboutMe:      "",
				Status:       models.StatusActive,
				LastSeen:     time.Now(),
			}

			if err := tx.Create(&profile).Error; err != nil {
				tx.Rollback()
				c.JSON(500, utils.Response{
					Code:    500,
					Success: false,
					Message: "Internal Server Error",
					Error:   "Failed to create profile",
				})
				return
			}
		} else {
			tx.Rollback()
			c.JSON(500, utils.Response{
				Code:    500,
				Success: false,
				Message: "Internal Server Error",
				Error:   "Failed to query user",
			})
			return
		}
	} else {
		if !utils.ComparePassword(user.Password, request.Password, user.Salt) {
			tx.Rollback()
			c.JSON(401, utils.Response{
				Code:    401,
				Success: false,
				Message: "Unauthorized",
				Error:   "Invalid password",
			})
			return
		}

		if err := tx.Where("email = ?", request.Email).First(&profile).Error; err != nil {
			tx.Rollback()
			c.JSON(500, utils.Response{
				Code:    500,
				Success: false,
				Message: "Internal Server Error",
				Error:   "Failed to fetch user profile",
			})
			return
		}

		seed := fmt.Sprintf("%s:%s|%s", request.Email, user.Salt, user.Password)
		var keyErr error
		privateKey, _, keyErr = utils.KeypairGenerate(seed)
		if keyErr != nil {
			tx.Rollback()
			c.JSON(500, utils.Response{
				Code:    500,
				Success: false,
				Message: "Internal Server Error",
				Error:   "Failed to regenerate private key",
			})
			return
		}
	}

	tokenString, err := utils.GenerateToken(user.Email, user.ID, 24*time.Hour)
	if err != nil {
		tx.Rollback()
		c.JSON(500, utils.Response{
			Code:    500,
			Success: false,
			Message: "Internal Server Error",
			Error:   "Failed to generate JWT token",
		})
		return
	}

	user.LastLogin = time.Now()
	if err := tx.Save(&user).Error; err != nil {
		tx.Rollback()
		c.JSON(500, utils.Response{
			Code:    500,
			Success: false,
			Message: "Internal Server Error",
			Error:   "Failed to update user last login",
		})
		return
	}

	profile.LastSeen = time.Now()
	if err := tx.Save(&profile).Error; err != nil {
		tx.Rollback()
		c.JSON(500, utils.Response{
			Code:    500,
			Success: false,
			Message: "Internal Server Error",
			Error:   "Failed to update profile last seen",
		})
		return
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(500, utils.Response{
			Code:    500,
			Success: false,
			Message: "Internal Server Error",
			Error:   "Failed to commit transaction",
		})
		return
	}

	response := utils.Response{
		Code:    200,
		Success: true,
		Message: "Login successful",
		Error:   nil,
	}

	c.JSON(200, LoginResponse{
		Response:   response,
		Token:      tokenString,
		PrivateKey: privateKey,
	})
}
