package handlers

import (
	"auth_service/internal/database"
	"auth_service/internal/models"
	"auth_service/internal/utils"
	"fmt"
	"net/smtp"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type SendOtpRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type SendOtpResponse struct {
	utils.Response
}

func SendOtp(c *gin.Context) {
	var request SendOtpRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		response := utils.Response{
			Code:    400,
			Success: false,
			Message: "Invalid request format",
			Error:   err.Error(),
		}
		c.JSON(400, SendOtpResponse{
			Response: response,
		})
		return
	}

	otp := utils.RandomNumberGenerate()
	if err := sendOtpEmail(request.Email, otp); err != nil {
		response := utils.Response{
			Code:    500,
			Success: false,
			Message: "Failed to send OTP",
			Error:   err.Error(),
		}
		c.JSON(500, SendOtpResponse{
			Response: response,
		})
		return
	}

	response := utils.Response{
		Code:    200,
		Success: true,
		Message: "OTP sent successfully",
		Error:  nil,
	}

	c.JSON(200, SendOtpResponse{
		Response: response,
	})

}

func sendOtpEmail(recipientEmail string, otp uint) error {

	senderEmail := os.Getenv("EMAIL")
	senderPassword := os.Getenv("EMAIL_PASSWORD")
	senderName := os.Getenv("SENDER_NAME")
	if senderEmail == "" || senderPassword == "" || senderName == "" {
		return fmt.Errorf("email or password or sender name not set in environment variables")
	}
	const CONFIG_SMTP_HOST = "smtp.gmail.com"
	const CONFIG_SMTP_PORT = 587
	CONFIG_SENDER_NAME := fmt.Sprintf("ZTA chat <%s>", senderEmail)
	CONFIG_AUTH_EMAIL := senderEmail
	CONFIG_AUTH_PASSWORD := senderPassword

	to := []string{recipientEmail}
	subject := "Your OTP Code"
	message := fmt.Sprintf("Hello,\n\nYour OTP code is: %d\n\nBest regards,\n%s", otp, senderName)

	if err := SendEmail(CONFIG_SMTP_HOST, CONFIG_SMTP_PORT, CONFIG_SENDER_NAME, CONFIG_AUTH_EMAIL, CONFIG_AUTH_PASSWORD, to, nil, subject, message); err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}
	tx := database.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var userLogin models.UserLogin
	if err := tx.Where("email = ?", recipientEmail).First(&userLogin).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			userLogin = models.UserLogin{
				Email:    recipientEmail,
				OTP:      otp,
				Verified: false,
			}
			if err := tx.Create(&userLogin).Error; err != nil {
				tx.Rollback()
				return fmt.Errorf("failed to save OTP to database: %w", err)
			}
		} else {
			tx.Rollback()
			return fmt.Errorf("failed to query database: %w", err)
		}
	} else {
		userLogin.OTP = otp
		userLogin.Verified = false 
		if err := tx.Save(&userLogin).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to update OTP in database: %w", err)
		}
	}

	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func SendEmail(smtpHost string, smtpPort int, senderName, authEmail, authPassword string, to, cc []string, subject, message string) error {
	body := "From: " + senderName + "\n" +
		"To: " + strings.Join(to, ",") + "\n" +
		"Cc: " + strings.Join(cc, ",") + "\n" +
		"Subject: " + subject + "\n\n" +
		message

	auth := smtp.PlainAuth("", authEmail, authPassword, smtpHost)
	smtpAddr := fmt.Sprintf("%s:%d", smtpHost, smtpPort)

	err := smtp.SendMail(smtpAddr, auth, authEmail, append(to, cc...), []byte(body))
	if err != nil {
		return err
	}

	return nil
}
