package main

import (
	"auth_service/internal/database"
	"auth_service/internal/models"
	"log"
)

func init() {
	database.LoadInitializers()
	database.ConnectToDb()
}

func main() {
	if err := database.DB.AutoMigrate(&models.User{}); err != nil {
		log.Printf("Error migrating User: %v", err)
	}

	if err := database.DB.AutoMigrate(&models.UserLogin{}); err != nil {
		log.Printf("Error migrating UserLogin: %v", err)
	}

	if err := database.DB.AutoMigrate(&models.Profile{}); err != nil {
		log.Printf("Error migrating Profile: %v", err)
	}
}
