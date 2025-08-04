package main

import (
	"user_service/api"
	"user_service/internal/database"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func init() {
	database.LoadInitializers()
	database.ConnectToDb()
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "9000"
	}

	router := gin.Default()

	// Allow all origins
	router.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		AllowCredentials: true,
	}))

	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "User Service API is running!",
			"version": "1.0.0",
		})
	})

	userroute := router.Group("/v1/u")
	api.UsersRoutes(userroute)

	log.Printf("Server starting on port %s", port)
	log.Fatal(router.Run("0.0.0.0:" + port))
}
