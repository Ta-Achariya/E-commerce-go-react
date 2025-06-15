package model

import (
	"gorm.io/gorm"
)


type OrderItem struct {
    gorm.Model
    Price      float64
    Quantity   int


    OrderID    uint
    ProductID  uint
    
    Product Product
}