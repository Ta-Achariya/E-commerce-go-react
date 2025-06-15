package database

import (
	"fmt"
	"github.com/Achariya1/e-commerce/model"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"log"
	"os"
	"time"
)

func ConnectDB() {
	var err error // define error here to prevent overshadowing the global DB

	
	// Connection string using environment variables
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
	os.Getenv("DB_HOST"), os.Getenv("DB_PORT"), os.Getenv("DB_USER"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_NAME"))

	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
		logger.Config{
			SlowThreshold: time.Second, // Slow SQL threshold
			LogLevel:      logger.Info, // Log level
			Colorful:      true,        // Enable color
		},
	)

	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{Logger: newLogger})
	if err != nil {
		//panic("failed to connect to database")
		log.Fatalf("Failed to connect to database: %v", err)
	}

	DB.AutoMigrate(&model.User{},&model.Product{},&model.Order{},
		&model.OrderItem{},&model.Category{},&model.Cart{},&model.CartItem{})
	print("Conneting database Successfull")

}
