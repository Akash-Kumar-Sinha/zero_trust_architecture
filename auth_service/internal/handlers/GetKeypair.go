package handlers

import (
	"auth_service/internal/utils"
	"fmt"

	"github.com/gin-gonic/gin"
)

type keyPairRequest struct {
	ConversationsID uint `form:"conversations_id" binding:"required"`
	ProfileOneID    uint `form:"profile_one_id" binding:"required"`
	ProfileTwoID    uint `form:"profile_two_id" binding:"required"`
}
type keyPairResponse struct {
	utils.Response
	PrivateKey string `json:"private_key"`
	PublicKey  string `json:"public_key"`
}

func GetKeyPair(c *gin.Context) {
	var req keyPairRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(400, gin.H{
			"code":    400,
			"success": false,
			"message": "Invalid request data",
			"error":   err.Error(),
		})
		return
	}

	seed := fmt.Sprintf("%d-%d-%d", req.ConversationsID, req.ProfileOneID, req.ProfileTwoID)
	privateKey, publicKey, err := utils.KeypairGenerate(seed)

	if err != nil {
		c.JSON(500, utils.Response{
			Code:    500,
			Success: false,
			Message: "Failed to retrieve key pair",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(200, keyPairResponse{
		Response: utils.Response{
			Code:    200,
			Success: true,
			Message: "Key pair retrieved successfully",
		},
		PrivateKey: privateKey,
		PublicKey:  publicKey,
	})
}
