package model

import (
	"gorm.io/gorm"
)

type CartItem struct {
    gorm.Model
    Quantity   int
    
    CartID     uint
    ProductID  uint
    
    Product Product
    Cart    Cart
}


type AddCartItem struct {
    Quantity   int  `json:"quantity"`
    ProductID  uint `json:"product_id"`
}

type UpdateCartItem struct {
    Quantity   int `json:"quantity"`
}