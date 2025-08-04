package api

import (
	"user_service/internal/handlers"

	"github.com/gin-gonic/gin"
)

func UsersRoutes(router *gin.RouterGroup) *gin.RouterGroup {

	router.GET("/get_users", handlers.Getusers)
	router.GET("/search_users", handlers.Searchbyusername)
	router.GET("/current_user", handlers.GetCurrentUser)

	return router
}
