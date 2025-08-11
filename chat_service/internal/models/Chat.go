package models

import (
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

type ConversationType string

const (
	OneToOne ConversationType = "one_to_one"
	Group    ConversationType = "group"
)

type Conversations struct {
	gorm.Model

	ConversationType ConversationType `gorm:"not null;index"`

	PrivateKey *string `gorm:"uniqueIndex:idx_keys_nullable"`
	PublicKey  *string `gorm:"uniqueIndex:idx_keys_nullable"`

	Profile1ID uint    `gorm:"not null;index:idx_unique_conversation,unique"`
	Profile1   Profile `gorm:"foreignKey:Profile1ID"`

	Profile2ID uint    `gorm:"not null;index:idx_unique_conversation,unique"`
	Profile2   Profile `gorm:"foreignKey:Profile2ID"`

	Members []ConversationMember `gorm:"foreignKey:ConversationID"`

	Messages []Messages `gorm:"foreignKey:ConversationID"`
}

type ConversationMember struct {
	gorm.Model
	ConversationID uint    `gorm:"not null;index"`
	UserID         uint    `gorm:"not null;index"`
	User           Profile `gorm:"foreignKey:UserID"`
}

type Messages struct {
	gorm.Model
	ConversationID uint `gorm:"not null"`

	SenderID uint    `gorm:"not null"`
	Sender   Profile `gorm:"foreignKey:SenderID"`

	IsRead bool `gorm:"default:false"`

	Content []MessageContent `gorm:"foreignKey:MessageID"`
}

type MessageContent struct {
	gorm.Model
	MessageID   uint        `gorm:"not null"`
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