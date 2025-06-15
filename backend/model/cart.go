package model

import (
	"gorm.io/gorm"
)

type Cart struct {
    gorm.Model
    UserID     uint
    Status     bool
    CartItems  []CartItem
}