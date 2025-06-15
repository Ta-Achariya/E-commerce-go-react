package main

import (
	"fmt"
	"log"
	"os"

	"github.com/Achariya1/e-commerce/database"
	"github.com/Achariya1/e-commerce/router"
	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"

)

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Println("Error loading .env file, using environment variables")
	}

	jj := os.Getenv("DB_HOST") //check
	fmt.Println(jj)

	database.ConnectDB()

	app := fiber.New()
	router.Initialize(app)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	if err := app.Listen("0.0.0.0:" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
	fmt.Println("hello world")

	/*
		if err := app.Listen("127.0.0.1:8080") ; err != nil{
			log.Fatalf("Failed to start server: %v", err)
		}
	*/
}
