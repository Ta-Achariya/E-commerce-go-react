package model

import (
	"gorm.io/gorm"
)

type Product struct {
	gorm.Model
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Quantity    int     `json:"quantity"`
	Image       string  `json:"image"`
	CategoryID uint `json:"category_id"`

	Category   Category    `json:"category"`
	CartItems  []CartItem  `json:"cart_items"`
	OrderItems []OrderItem `json:"order_items"`
}


type CreateProductRequest struct {
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Quantity    int     `json:"quantity"`
	Image       string  `json:"image"`
	CategoryID  uint    `json:"category_id"`
}

