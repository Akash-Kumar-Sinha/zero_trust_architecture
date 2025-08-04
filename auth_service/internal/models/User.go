package models

import (
	"time"

	"gorm.io/gorm"
)



type User struct {
	gorm.Model
	Email        string     `gorm:"uniqueIndex;not null"`
	Password     string     `gorm:"not null"`
	Verified     bool       `gorm:"default:false"`
	Username     string     `gorm:"uniqueIndex;not null"`
	Salt         string     `gorm:"not null"`
	LastLogin    time.Time  `gorm:"default:null"`
}

type UserLogin struct {
	gorm.Model
	Email    string `gorm:"uniqueIndex;not null"`
	OTP      uint   `gorm:"default:null"`
	Verified bool   `gorm:"default:false"`
}
