package handlers

import (
	"fmt"

	"github.com/Achariya1/e-commerce/database"
	"github.com/Achariya1/e-commerce/middleware"
	"github.com/Achariya1/e-commerce/model"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)
/*
func CreateOrder(c *fiber.Ctx) error {
	//userID := c.Params("user_id")

	userID, err := middleware.GetUserIDFromToken(c)
	if err != nil {
		return err
	}

	db := database.DB

	//load cart with items
	cart := model.Cart{}

	if err := db.Preload("CartItems.Product").Where("user_id = ? AND status = ?",
		userID, true).First(&cart).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Cart not found")
	}

	//check if cart are empty
	if len(cart.CartItems) == 0 {
		return fiber.NewError(fiber.StatusBadRequest, "Can't create order from empty cart")
	}

	//create order and orderItems
	order := model.Order{
		UserID:      userID,
		TotalAmount: 0,
		Status:      "Success",
	}

	orderItems := []model.OrderItem{}

	for _, item := range cart.CartItems {

		product := item.Product
		//check if product was loaded in preload function
		if product.ID == 0 {
			return fiber.NewError(fiber.StatusInternalServerError, "Product not found")
		}
		fmt.Println(product.Quantity, " : ", item.Quantity)

		//***validate product stock
		if product.Quantity < item.Quantity {
			return fiber.NewError(fiber.StatusBadRequest, fmt.Sprintf("Not enough stock for product '%s'. Available: %d, Requested: %d.", product.Name, product.Quantity, item.Quantity))
		}

		//add order item
		order.TotalAmount += product.Price * float64(item.Quantity)
		orderItems = append(orderItems, model.OrderItem{
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     product.Price,
		})

		//updaate product quantity and update to db
		product.Quantity -= item.Quantity
		if err := db.Save(&product).Error; err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, fmt.Sprintf("Failed to update stock for product %d.", product.ID))
		}

	}

	order.OrderItems = orderItems

	err = db.Transaction(func(tx *gorm.DB) error {
		//Save order in database and cler cart
		if err := tx.Create(&order).Error; err != nil {
			return err
		}

		//cler cart by change status and deleting the cart item
		cart.Status = false
		if err := db.Save(&cart).Error; err != nil {
			return err
		}

		if err := db.Where("cart_id = ?", cart.ID).Delete(&model.CartItem{}).Error; err != nil {
			return err
		}

		return nil

	})

	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to create order")
	}

	return c.Status(fiber.StatusCreated).JSON(order)

}*/

func GetOrderByUserId(c *fiber.Ctx) error {

	userID, err := middleware.GetUserIDFromToken(c)
	if err != nil {
		return err
	}

	order := model.Order{}

	db := database.DB

	if err := db.Where("user_id = ? AND status = ?", userID, "Success").First(&order).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Order not found")
	}

	orderItems := []model.OrderItem{}

	if err := db.Where("order_id = ?", order.ID).Find(&orderItems).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Order item not found")
	}

	order.OrderItems = orderItems

	return c.JSON(order)
}

// Helper function to create order from cart
func createOrderFromCart(userID, cartID uint, stripeSessionID string ) (*model.Order, error) {
	db := database.DB

	// Load cart with items
	cart := model.Cart{}
	if err := db.Preload("CartItems.Product").Where("id = ? AND user_id = ? AND status = ?",
		cartID, userID, true).First(&cart).Error; err != nil {
		return nil, fiber.NewError(fiber.StatusNotFound, "Cart not found")
	}

	// Check if cart is empty
	if len(cart.CartItems) == 0 {
		return nil, fiber.NewError(fiber.StatusBadRequest, "Can't create order from empty cart")
	}

	// Check if order already exists for this session (prevent duplicates)
	existingOrder := model.Order{}
	if err := db.Where("stripe_session_id = ?", stripeSessionID).First(&existingOrder).Error; err == nil {
		return &existingOrder, nil // Order already exists
	}

	// Create order and orderItems
	order := model.Order{
		UserID:          userID,
		TotalAmount:     0,
		Status:          "Success",
		StripeSessionID: stripeSessionID,
	}

	orderItems := []model.OrderItem{}

	for _, item := range cart.CartItems {
		product := item.Product
		// Check if product was loaded in preload function
		if product.ID == 0 {
			return nil, fiber.NewError(fiber.StatusInternalServerError, "Product not found")
		}

		// Validate product stock
		if product.Quantity < item.Quantity {
			return nil, fiber.NewError(fiber.StatusBadRequest,
				fmt.Sprintf("Not enough stock for product '%s'. Available: %d, Requested: %d.",
					product.Name, product.Quantity, item.Quantity))
		}

		// Add order item
		order.TotalAmount += product.Price * float64(item.Quantity)
		orderItems = append(orderItems, model.OrderItem{
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     product.Price,
		})

		// Update product quantity
		product.Quantity -= item.Quantity
		if err := db.Save(&product).Error; err != nil {
			return nil, fiber.NewError(fiber.StatusInternalServerError,
				fmt.Sprintf("Failed to update stock for product %d.", product.ID))
		}
	}

	order.OrderItems = orderItems

	// Use transaction to ensure data consistency ********
	err := db.Transaction(func(tx *gorm.DB) error {
		// Save order in database
		if err := tx.Create(&order).Error; err != nil {
			return err
		}

		// Clear cart by changing status and deleting cart items
		cart.Status = false
		if err := tx.Save(&cart).Error; err != nil {
			return err
		}

		if err := tx.Where("cart_id = ?", cart.ID).Delete(&model.CartItem{}).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to create order")
	}

	return &order, nil
}
