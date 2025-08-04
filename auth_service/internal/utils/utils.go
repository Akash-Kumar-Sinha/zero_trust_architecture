package utils

import (
	"fmt"
	"math/rand"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type Response struct {
	Code    int         `json:"code"`
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Error   interface{} `json:"error,omitempty"`
}

func GenerateToken(email string, userID uint, expiryTime time.Duration) (string, error) {
	secret_key := os.Getenv("JWT_TOKEN")

	fmt.Printf("Generating JWT for user: %s with ID: %d\n with secret key %s and expiry time %d\n", email, userID, secret_key, expiryTime)

	if secret_key == "" {
		return "", fmt.Errorf("JWT secret key not set in environment variables")
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256,
		jwt.MapClaims{
			"email":   email,
			"user_id": userID,
			"exp":     time.Now().Add(expiryTime).Unix(),
		})

	tokenString, err := token.SignedString([]byte(secret_key))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func DecodeJWT(tokenString string) (map[string]interface{}, error) {
	secret_key := os.Getenv("JWT_TOKEN")

	if secret_key == "" {
		return nil, fmt.Errorf("JWT secret key not set in environment variables")
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret_key), nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		if exp, ok := claims["exp"].(float64); ok {
			if time.Now().Unix() > int64(exp) {
				return nil, fmt.Errorf("token has expired")
			}
		}
		return claims, nil
	} else {
		return nil, fmt.Errorf("invalid token claims")
	}
}

func RandomNumberGenerate() uint {
	return uint(rand.Intn(899999) + 100000)
}

func HashPassword(password, salt string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(fmt.Sprintf("%s:%s", password, salt)), bcrypt.DefaultCost)
	return string(bytes), err
}

func ComparePassword(hashedPassword, password, salt string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(fmt.Sprintf("%s:%s", password, salt)))
	return err == nil
}
