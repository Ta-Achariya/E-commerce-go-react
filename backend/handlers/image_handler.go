package handlers

import (
	"fmt"
	"path/filepath"

	"github.com/Achariya1/e-commerce/database"
	_ "github.com/Azure/azure-sdk-for-go/sdk/storage/azblob"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"context"
	"os"
)

func UploadImage(c *fiber.Ctx) error {
	file, err := c.FormFile("image")
	if err != nil {
		fmt.Println("ERROR: Failed to get file:", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Failed to get image file",
			"details": err.Error(),
		})
	}

	//open the multipart file
	src, err := file.Open()
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to open uploaded file", err.Error())
	}

	defer src.Close()

	//Get the file extension from the original filename
	ext := filepath.Ext(file.Filename)

	productName := c.FormValue("product_name")
	if productName == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Product name is required")
	}

	blobname := productName + "_" + uuid.NewString() + ext
	client := database.AzureClient

	// Upload the file to azure with specified container and specified blob name
	_, err = client.UploadStream(context.TODO(), os.Getenv("CONTAINERNAME"), blobname, src, nil)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	fmt.Println(file.Filename)
	fmt.Println(file.Header)
	fmt.Println(file.Size)

	ImageURL := fmt.Sprintf("%s/%s/%s", os.Getenv("ACCOUNTURL"), os.Getenv("CONTAINERNAME"), blobname)

	fmt.Println(ImageURL)

	return c.JSON(fiber.Map{
		"message":  "File uploaded successfully",
		"blobname": blobname,
		"size":     file.Size,
		"url":      ImageURL,
	})
}


