package handlers

import (
	"github.com/Achariya1/e-commerce/database"
	"github.com/Achariya1/e-commerce/model"
	"github.com/gofiber/fiber/v2"
)




func CreateProduct(c *fiber.Ctx) error{


	req := model.CreateProductRequest{}

	if err := c.BodyParser(&req); err != nil{
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	
	product := model.Product{
		Name: req.Name,
		Description: req.Description,
		Price: req.Price,
		Quantity: req.Quantity,
		Image: req.Image,
		CategoryID: req.CategoryID,
	}


	db := database.DB

	//check if category exists 
	category := model.Category{}
	if err := db.First(&category, req.CategoryID).Error; err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Category does not exist")
	}


	if err := db.Create(&product).Error ; err != nil{
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to create product: " + err.Error())
	}




	return  c.Status(fiber.StatusCreated).JSON(product)
}


func GetProducts(c *fiber.Ctx) error{
	var products []model.Product

	db := database.DB


	if err := db.Preload("Category").Find(&products).Error ; err != nil{
		return fiber.NewError(fiber.StatusNotFound, "Products not found")
	}

	return c.JSON(products)

}

func GetProductById(c *fiber.Ctx) error{
	id := c.Params("id")
	var product model.Product

	db := database.DB

	if err := db.Preload("Category").First(&product,id).Error ; err != nil{
		return fiber.NewError(fiber.StatusNotFound, "Product not found")
	}

	return c.JSON(product)
}

func UpdateProduct(c *fiber.Ctx) error {

	//get id from parameter
	id := c.Params("id")
	db := database.DB
	//get product by id
	ExistingPorduct := model.Product{}
	if err := db.First(&ExistingPorduct,id).Error ; err != nil{
		return fiber.NewError(fiber.StatusNotFound, "Product not found")
	}

	//blind jsonbody req to 
	req := model.CreateProductRequest{}
	if err := c.BodyParser(&req) ; err != nil{
		return fiber.NewError(fiber.StatusBadRequest, "Invalid body request")
	}

	//update product with req data
	ExistingPorduct.Name = req.Name
	ExistingPorduct.Description = req.Description
	ExistingPorduct.Price = req.Price
	ExistingPorduct.Quantity = req.Quantity
	ExistingPorduct.Image = req.Image
	ExistingPorduct.CategoryID = req.CategoryID

	if err := db.Save(&ExistingPorduct).Error; err != nil{
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to update product")
	}

	return c.JSON(ExistingPorduct)
}


func DeleteProduct(c *fiber.Ctx) error{
	//get id from params
	id := c.Params("id")
	db := database.DB

	product := model.Product{}

	//check if product by id is exist
	if err := db.First(&product,id).Error; err != nil{
		return fiber.NewError(fiber.StatusNotFound, "Product not found")
	}
	//soft delete
	if err := db.Delete(&product).Error; err != nil{
		return fiber.NewError(fiber.StatusInternalServerError,"Failed to delete product")
	}


	return c.SendStatus(fiber.StatusNoContent)
}




