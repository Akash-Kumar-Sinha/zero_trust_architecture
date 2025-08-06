package api

import (
	"user_service/internal/handlers"

	"github.com/gin-gonic/gin"
)

func UsersRoutes(router *gin.RouterGroup) *gin.RouterGroup {

	router.GET("/get_users", handlers.Getusers)
	router.GET("/search_users", handlers.Searchbyusername)
	router.GET("/current_user", handlers.GetCurrentUser)
	router.PUT("/send_friend_request", handlers.SendFriendRequest)
	router.GET("/get_friend_requests", handlers.GetFriendRequests)
	router.PUT("/accept_friend_request", handlers.AcceptFriendRequest)
	router.GET("/get_friends", handlers.GetFriends)

	return router
}
