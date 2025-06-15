package model

import (
	"gorm.io/gorm"
)

type Order struct {
    gorm.Model
    UserID     uint
    Status     string
    TotalAmount float64

    OrderItems []OrderItem
}