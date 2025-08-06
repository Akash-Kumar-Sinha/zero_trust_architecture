package utils

import "github.com/golang-jwt/jwt/v5"

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

type VerifyResp struct {
	Response
	User JwtClaims `json:"user"`
}

type CurrentUserProfile struct {
	Username string `form:"username" binding:"omitempty"`
	ID       uint   `form:"id" binding:"omitempty"`
}
