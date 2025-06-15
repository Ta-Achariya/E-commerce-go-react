package handlers

import (
	"fmt"
	"strconv"

	"github.com/Achariya1/e-commerce/database"
	"github.com/Achariya1/e-commerce/model"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)


func CreateOrder(c *fiber.Ctx) error {
	//next feat : get user_id from jwt intsead of param
	userID := c.Params("user_id")

	db := database.DB

	//load cart with items
	cart := model.Cart{}

	if err := db.Preload("CartItems.Product").Where("user_id = ? AND status = ?",
	userID,true).First(&cart).Error; err != nil{
		return fiber.NewError(fiber.StatusNotFound, "Cart not found")
	}

	//check if cart are empty
	if len(cart.CartItems) == 0 {
		return fiber.NewError(fiber.StatusBadRequest,"Can't create order from empty cart")
	}


	//convert userID(from params) to integer
	id , err := strconv.Atoi(userID)
	if err != nil{
		return c.SendString("Fail to convert userID string to interger")
	}

	//create order and orderItems
	order := model.Order{
		UserID : uint(id),
		TotalAmount: 0,
		Status: "Success",
	}

	orderItems := []model.OrderItem{}

	for _,item := range cart.CartItems {

		product := item.Product
		//check if product was loaded in preload function
		if product.ID == 0{
			return fiber.NewError(fiber.StatusInternalServerError,"Product not found")
		}
		fmt.Println(product.Quantity , " : " , item.Quantity)

		//***validate product stock
		if product.Quantity < item.Quantity{
			return fiber.NewError(fiber.StatusBadRequest,fmt.Sprintf("Not enough stock for product '%s'. Available: %d, Requested: %d.", product.Name, product.Quantity, item.Quantity))
		}

		//add order item
		order.TotalAmount += product.Price * float64(item.Quantity)
		orderItems = append(orderItems, model.OrderItem{
			ProductID: item.ProductID,
			Quantity: item.Quantity,
			Price: product.Price,
		})

		//updaate product quantity and update to db
		product.Quantity -= item.Quantity
		if err := db.Save(&product).Error; err != nil{
			return fiber.NewError(fiber.StatusInternalServerError,fmt.Sprintf("Failed to update stock for product %d.", product.ID))
		}

	}

	order.OrderItems = orderItems


	err = db.Transaction(func(tx *gorm.DB) error{
		//Save order in database and cler cart 
		if err := tx.Create(&order).Error; err != nil{
			return err
		}

		//cler cart by change status and deleting the cart item
		cart.Status = false
		if err := db.Save(&cart).Error; err != nil{
			return err
		}

		if err := db.Where("cart_id = ?",cart.ID).Delete(&model.CartItem{}).Error; err != nil{
			return err
		}

		return nil

	})

	if err != nil{
		return fiber.NewError(fiber.StatusInternalServerError,"Failed to create order")
	}

	
	return c.Status(fiber.StatusCreated).JSON(order)

}


func GetOrderByUserId(c *fiber.Ctx) error {

	id := c.Params("user_id")
	
	order := model.Order{}


	db := database.DB

	if err := db.Where("user_id = ? AND status = ?",id,"Success").First(&order).Error; err != nil{
		return fiber.NewError(fiber.StatusNotFound, "Order not found")
	}

	
	orderItems := []model.OrderItem{}

	if err := db.Where("order_id = ?",order.ID).Find(&orderItems).Error; err != nil{
		return fiber.NewError(fiber.StatusNotFound, "Order item not found")
	}

	order.OrderItems = orderItems



	return c.JSON(order)
}