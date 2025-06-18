package model

import (
	"gorm.io/gorm"
)

type Order struct {
    gorm.Model
    UserID     uint
    Status     string
    TotalAmount float64
    StripeSessionID string    `json:"stripe_session_id" gorm:"unique"`

    OrderItems []OrderItem
}