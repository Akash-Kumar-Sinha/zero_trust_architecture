package handlers

import (
	"auth_service/internal/utils"
	"fmt"

	"github.com/gin-gonic/gin"
)

type verifyTokenClaimsResponse struct {
	utils.Response
	User utils.JwtClaims `json:"user"`
}

func VerifyTokenClaims(c *gin.Context) {
	headers := c.Request.Header

	if headers.Get("Authorization") == "" {
		c.JSON(400, utils.Response{
			Code:    400,
			Success: false,
			Message: "AutheHeader not found",
			Error:   "Missing header toke",
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

	// Safely extract claims with type checking
	email, emailOk := claims["email"].(string)
	if !emailOk {
		c.JSON(401, utils.Response{
			Code:    401,
			Success: false,
			Message: "Unauthorized",
			Error:   "Invalid email claim in token",
		})
		return
	}

	userID, userIDOk := claims["user_id"].(uint)
	if !userIDOk {
		c.JSON(401, utils.Response{
			Code:    401,
			Success: false,
			Message: "Unauthorized",
			Error:   "Invalid user_id claim in token",
		})
		return
	}

	c.JSON(200, verifyTokenClaimsResponse{
		Response: utils.Response{
			Code:    200,
			Success: true,
			Message: "User retrieved successfully",
		},
		User: utils.JwtClaims{
			Email:  email,
			UserID: uint(userID),
		},
	})
}
