package models

import (
	"time"

	"gorm.io/gorm"
)

type ContentType string

const (
	ContentTypeText  ContentType = "text"
	ContentTypeImage ContentType = "image"
	ContentTypeFile  ContentType = "file"
	ContentTypeVideo ContentType = "video"
	ContentTypeAudio ContentType = "audio"
	ContentTypeLink  ContentType = "link"
)

type RequestStatus string

const (
	Pending  RequestStatus = "pending"
	Accepted RequestStatus = "accepted"
	Rejected RequestStatus = "rejected"
)

type Conversations struct {
	gorm.Model
	Messages  []Messages `gorm:"foreignKey:ConversationID"`
	ProfileID uint       `gorm:"not null"`
	Profile   Profile    `gorm:"foreignKey:ProfileID"`
}

type Messages struct {
	gorm.Model
	ConversationID uint          `gorm:"not null"`
	Conversation   Conversations `gorm:"foreignKey:ConversationID"`
	SenderID       uint          `gorm:"not null"`
	Sender         Profile       `gorm:"foreignKey:SenderID"`
	ReceiverID     uint          `gorm:"not null"`
	Receiver       Profile       `gorm:"foreignKey:ReceiverID"`
	Content        []Content     `gorm:"foreignKey:MessageID"`
	Timestamp      time.Time     `gorm:"default:current_timestamp"`
	IsRead         bool          `gorm:"default:false"`
}

type Content struct {
	gorm.Model
	MessageID   uint        `gorm:"not null"`
	Message     Messages    `gorm:"foreignKey:MessageID"`
	ContentType ContentType `gorm:"not null"`
	Content     string      `gorm:"not null"`
}

type FriendRequest struct {
	gorm.Model
	RequesterID uint    `gorm:"not null"`
	Requester   Profile `gorm:"foreignKey:RequesterID"`

	ReceiverID uint    `gorm:"not null"`
	Receiver   Profile `gorm:"foreignKey:ReceiverID"`

	Status RequestStatus `gorm:"default:pending"`
}
