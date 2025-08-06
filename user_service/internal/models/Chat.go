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

	PrivateKey *string `gorm:"uniqueIndex:idx_keys_nullable"`
	PublicKey  *string `gorm:"uniqueIndex:idx_keys_nullable"`

	Profile1ID uint    `gorm:"not null;index:idx_unique_conversation,unique"`
	Profile1   Profile `gorm:"foreignKey:Profile1ID"`

	Profile2ID uint    `gorm:"not null;index:idx_unique_conversation,unique"`
	Profile2   Profile `gorm:"foreignKey:Profile2ID"`

	Messages []Messages `gorm:"foreignKey:ConversationID"`
}

type Messages struct {
	gorm.Model
	ConversationID uint          `gorm:"not null"`
	Conversation   Conversations `gorm:"foreignKey:ConversationID"`

	SenderID uint    `gorm:"not null"`
	Sender   Profile `gorm:"foreignKey:SenderID"`

	Content []Content `gorm:"foreignKey:MessageID"`

	Timestamp time.Time `gorm:"default:current_timestamp"`
	IsRead    bool      `gorm:"default:false"`
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
