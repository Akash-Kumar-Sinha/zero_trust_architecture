package main

import (
	"log"
	"user_service/internal/database"
	"user_service/internal/models"
)

func init() {
	database.LoadInitializers()
	database.ConnectToDb()
}

func main() {
	if err := database.DB.AutoMigrate(&models.Profile{}); err != nil {
		log.Printf("Error migrating Profile: %v", err)
	}

	if err := database.DB.AutoMigrate(&models.Conversations{}); err != nil {
		log.Printf("Error migrating Conversations: %v", err)
	}
	if err := database.DB.AutoMigrate(&models.Messages{}); err != nil {
		log.Printf("Error migrating Messages: %v", err)
	}
	if err := database.DB.AutoMigrate(&models.Content{}); err != nil {
		log.Printf("Error migrating Content: %v", err)
	}
}
