package utils

import (
	"fmt"
	"math/rand"
	"os"
	"strings"
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

type JwtClaims struct {
	Email  string `json:"email"`
	UserID uint   `json:"user_id"`
	jwt.RegisteredClaims
}

func GenerateToken(email string, userID uint, expiryTime time.Duration) (string, error) {
	secret_key := os.Getenv("JWT_TOKEN")

	fmt.Printf("Generating JWT for user: %s with ID: %d\n", email, userID)

	if secret_key == "" {
		return "", fmt.Errorf("JWT secret key not set in environment variables")
	}

	// Create claims with proper structure
	claims := JwtClaims{
		Email:  email,
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiryTime)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(secret_key))
	if err != nil {
		return "", fmt.Errorf("failed to sign token: %w", err)
	}

	fmt.Printf("Successfully generated JWT token\n")
	return tokenString, nil
}

func DecodeJWT(tokenString string) (map[string]interface{}, error) {
	secret_key := os.Getenv("JWT_TOKEN")

	if secret_key == "" {
		return nil, fmt.Errorf("JWT secret key not set in environment variables")
	}

	// Trim any whitespace from token
	tokenString = strings.TrimSpace(tokenString)

	fmt.Printf("Attempting to decode JWT token\n")

	// Parse token with custom claims
	token, err := jwt.ParseWithClaims(tokenString, &JwtClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Validate signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret_key), nil
	})

	if err != nil {
		fmt.Printf("Error parsing token: %v\n", err)
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	// Extract claims
	if claims, ok := token.Claims.(*JwtClaims); ok && token.Valid {
		// Check if token is expired
		if time.Now().Unix() > claims.ExpiresAt.Unix() {
			return nil, fmt.Errorf("token has expired")
		}

		claimsMap := map[string]interface{}{
			"email":   claims.Email,
			"user_id": claims.UserID,
			"exp":     claims.ExpiresAt.Unix(),
		}

		fmt.Printf("Successfully decoded JWT for user: %s\n", claims.Email)
		return claimsMap, nil
	}

	return nil, fmt.Errorf("invalid token claims")
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
