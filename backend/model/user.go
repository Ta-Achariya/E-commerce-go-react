package model

import (
	"gorm.io/gorm"
)

type User struct {
    gorm.Model
    FirstName string
    LastName  string
    Email     string
    Password  string
    Role      string `gorm:"default:user"`
    Address   string
    
    Cart      Cart
    Orders    []Order
}


type SignupRequest struct{
    FirstName string `json:"firstname"`
    LastName  string `json:"lastname"`
    Email     string `json:"email"`
    Password  string `json:"password"`
    Address   string `json:"address"`
}


type LoginRequest struct{
    Email     string `json:"email"`
    Password  string `json:"password"`
}