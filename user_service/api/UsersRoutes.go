package api

import (
	"user_service/internal/handlers"

	"github.com/gin-gonic/gin"
)

func UsersRoutes(router *gin.RouterGroup) *gin.RouterGroup {

	router.GET("/get_users", handlers.Getusers)
	router.GET("/search_users", handlers.Searchbyusername)

	return router
}
