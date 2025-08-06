package api

import (
	"auth_service/internal/handlers"

	"github.com/gin-gonic/gin"
)

func AuthRoutes(router *gin.RouterGroup) *gin.RouterGroup {
	router.POST("/otp_sent", handlers.SendOtp)

	router.POST("/verify_otp", handlers.VerifyOtp)

	router.POST("/login_account", handlers.Login)

	router.GET("/auth_verifications", handlers.Checklogin)

	router.GET("/verify_token_claims", handlers.VerifyTokenClaims)

	router.GET("/get_keypair", handlers.GetKeyPair)

	return router
}
