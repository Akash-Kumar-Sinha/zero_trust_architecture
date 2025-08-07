package utils

type Response struct {
	Code    int         `json:"code"`
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Error   interface{} `json:"error,omitempty"`
}

type CurrentUserProfile struct {
	Username string `form:"username" binding:"omitempty"`
	ID       uint   `form:"id" binding:"omitempty"`
}
