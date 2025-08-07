package main

import (
	"chat_service/internal/database"
	"chat_service/internal/ws"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func init() {
	database.LoadInitializers()
	database.ConnectToDb()
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	r := gin.Default()

	r.GET("/ws", func(c *gin.Context) {
		ws.Wshandler(c.Writer, c.Request)
	})

	log.Printf("Server starting on port %s", port)
	r.Run(":" + port)
}
