package models

import (
	"time"

	"gorm.io/gorm"
)

type UserStatus string

const (
	StatusActive   UserStatus = "online"
	StatusInactive UserStatus = "offline"
)

type Profile struct {
	gorm.Model
	Email        string     `gorm:"uniqueIndex;not null"`
	Username     string     `gorm:"uniqueIndex;not null"`
	PublicKey    string     `gorm:"uniqueIndex;not null"`
	ProfileImage string     `gorm:"default:null"`
	AboutMe      string     `gorm:"default:null"`
	Status       UserStatus `gorm:"default:offline"`
	LastSeen     time.Time  `gorm:"default:null"`
}
