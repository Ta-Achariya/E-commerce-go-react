package model

import (
	"gorm.io/gorm"
)

type Category struct {
    gorm.Model
    Name        string  `json:"name"`
    Description string `json:"description"`

    Products    []Product
}


type CategoryUpdate struct {
    Name        string `json:"name"`
    Description string `json:"description"`
}