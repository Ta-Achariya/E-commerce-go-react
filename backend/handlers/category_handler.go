package handlers

import (
	"github.com/Achariya1/e-commerce/database"
	"github.com/Achariya1/e-commerce/model"
	"github.com/gofiber/fiber/v2"
)


func CreateCategory(c *fiber.Ctx) error{

	category := model.Category{}

	if err := c.BodyParser(&category) ; err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	db := database.DB

	if err := db.Create(&category).Error ; err != nil{
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to create category " + err.Error())
	}



	return c.JSON(category)
}

func GetAllCategory(c *fiber.Ctx) error{
	categorys := []model.Category{}

	db := database.DB

	if err := db.Find(&categorys).Error; err != nil{
		return fiber.NewError(fiber.StatusNotFound, "Category not found")
	}

	return c.JSON(categorys)

}

func GetCategoryById(c *fiber.Ctx) error{
	
	id := c.Params("id")
	category := model.Category{}

	db := database.DB

	if err := db.First(&category,id).Error; err != nil{
		return fiber.NewError(fiber.StatusNotFound, "Category not found")
	}

	return c.JSON(category)

}


/*
don't need to Updating Related Tables, 
product are only has ctegory_id. this function only update name field
*/

func UpdateCategory(c *fiber.Ctx) error{
	
	id := c.Params("id")
	db := database.DB

	//Get Category by Id
	ExistingCategory := model.Category{}
	if err := db.First(&ExistingCategory,id).Error; err != nil{
		return fiber.NewError(fiber.StatusNotFound, "Category not found")
	}

	//blind the req json to model
	req := model.CategoryUpdate{}
	if err := c.BodyParser(&req); err != nil{
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}


	//update data
	ExistingCategory.Name = req.Name
	ExistingCategory.Description = req.Description

	if err := db.Save(&ExistingCategory).Error; err != nil{
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to update caategory")
	}



	return c.JSON(ExistingCategory)
}


func DeleteCategory(c *fiber.Ctx) error{
	id := c.Params("id")

	category := model.Category{}

	db := database.DB

	if err := db.First(&category,id).Error; err != nil{
		return fiber.NewError(fiber.StatusNotFound, "Category not found")
	}

	if err := db.Delete(&category).Error; err != nil{
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to delete category")
	}

	return c.SendStatus(fiber.StatusNoContent)
}