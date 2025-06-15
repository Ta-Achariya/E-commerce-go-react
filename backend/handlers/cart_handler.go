package handlers

import (

	"strconv"

	"github.com/Achariya1/e-commerce/database"
	"github.com/Achariya1/e-commerce/middleware"
	"github.com/Achariya1/e-commerce/model"
	"github.com/gofiber/fiber/v2"
)



func AddToCart(c *fiber.Ctx) error {
	db := database.DB

	//userID := c.Locals("user_id").(string)

	addCartItem := model.AddCartItem{}
	product := model.Product{}



	if err := c.BodyParser(&addCartItem); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid reqeust body")
	}






	//check if product exists
	reqProductID := strconv.Itoa(int(addCartItem.ProductID))

	if err := db.First(&product, reqProductID).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Prodcut not found")
	}

	//validate item quantity
	if addCartItem.Quantity <= 0 {
        return fiber.NewError(fiber.StatusBadRequest, "Quantity must be greater than zero")
    }
	if addCartItem.Quantity > product.Quantity {
        return fiber.NewError(fiber.StatusBadRequest, "Not enough stock for product")
    }



	//create cart if don't exit by finding cart with userID and status = true.
	cart := model.Cart{}

	if err := db.Where("user_id = ? AND status = ?", addCartItem.UserID, true).First(&cart).Error; err != nil {
		cart.Status = true
		cart.UserID = addCartItem.UserID

		if err := db.Create(&cart).Error; err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Failed to creted cart")
		}
	}




	//create cartiem in cart or increase quantity if cartitem is exist in cart
	var cartItem = model.CartItem{}


	if err := db.Where("cart_id = ? AND product_id = ?", cart.ID, product.ID).First(&cartItem).Error; err != nil {
		cartItem = model.CartItem{
			CartID:    cart.ID,
			ProductID: product.ID,
			Quantity:  addCartItem.Quantity,
			
		}
		if err := db.Create(&cartItem).Error; err != nil{
			return fiber.NewError(fiber.StatusInternalServerError,"Failed to create the cartItem")
		}

	} else {
		cartItem.Quantity += addCartItem.Quantity

		if cartItem.Quantity > product.Quantity {
        	return fiber.NewError(fiber.StatusBadRequest, "Not enough stock for product")
    	}
		if err := db.Save(&cartItem).Error; err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Failed to update cart item")
		}
	}

	return c.JSON(cartItem)
}




func GetCartByUserId(c *fiber.Ctx) error{

	userID, err := middleware.GetUserIDFromToken(c)
	if err != nil {
		return err
	}
	
	cart := model.Cart{}

	db := database.DB

	//find cart by user_id and status = true
	if err := db.Preload("CartItems.Product").Where("user_id = ? AND status = ?",userID,true).First(&cart).Error; err != nil{
		return fiber.NewError(fiber.StatusNotFound, "Cart not found")
	}



	return c.JSON(cart)
}



func UpdateCartItemQuantity(c *fiber.Ctx) error{

	userID, err := middleware.GetUserIDFromToken(c)
	if err != nil {
		return err
	}


	item_id := c.Params("item_id") 
	db := database.DB

	req := model.UpdateCartItem{}
	

	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}


	//validate a quantity item
	if req.Quantity <= 0 {
		return RemoveItemFromCart(c)
	}
	

	//load cart item
	cartItem := model.CartItem{}
	if err := db.Preload("Cart").Where("id = ?",item_id).First(&cartItem).Error; err != nil{
		return fiber.NewError(fiber.StatusNotFound,"cartItem not found")
	}
	
	/*
	//check user id
	if fmt.Sprint(cartItem.Cart.UserID) != user_id {
		return fiber.NewError(fiber.StatusForbidden,"You are not allowed to modify this cart item")
	}*/
	if cartItem.Cart.UserID != userID {
		return fiber.NewError(fiber.StatusForbidden,"You are not allowed to modify this cart item")
	}


	//update quantity
	cartItem.Quantity = req.Quantity
	

	if err := db.Save(&cartItem).Error; err != nil{
		return fiber.NewError(fiber.StatusInternalServerError,"Failed to update cart item")
	}

	return c.JSON(cartItem)

}



func RemoveItemFromCart(c *fiber.Ctx) error{


	userID, err := middleware.GetUserIDFromToken(c)
	if err != nil {
		return err
	}

	cartItemId := c.Params("item_id")


	db := database.DB


	//find cartItem and preload cart 
	cartItem := model.CartItem{}
	if err := db.Preload("Cart").First(&cartItem,cartItemId).Error; err != nil{
		return fiber.NewError(fiber.StatusNotFound, "Cart item not found")
	}


	//checking if cartitem has correct ownership
	//fmt.Sprint = convert value to string
	/*
	if  fmt.Sprint(cartItem.Cart.UserID) != userId {
		return fiber.NewError(fiber.StatusForbidden,"You are not allowed to remove this item")
	}*/
	if  cartItem.Cart.UserID != userID {
		return fiber.NewError(fiber.StatusForbidden,"You are not allowed to remove this item")
	}

	//delete item from database
	if err := db.Delete(&cartItem).Error; err != nil{
		return fiber.NewError(fiber.StatusInternalServerError,"Failed to delete cart item")
	}



	return c.SendStatus(fiber.StatusNoContent)
}


func ClearCart(c *fiber.Ctx) error {
    userID, err := middleware.GetUserIDFromToken(c)
	if err != nil {
		return err
	}


    db := database.DB

    cart := model.Cart{}
	//might need to convert userID to string before query ********
    if err := db.Where("user_id = ? AND status = ?", userID, true).First(&cart).Error; err != nil {
        return fiber.NewError(fiber.StatusNotFound, "Cart not found")
    }

    if err := db.Where("cart_id = ?", cart.ID).Delete(&model.CartItem{}).Error; err != nil {
        return fiber.NewError(fiber.StatusInternalServerError, "Failed to clear cart")
    }

	cart.Status = false
	if err := db.Save(&cart).Error; err != nil{
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to update cart status")
	}

    return c.SendStatus(fiber.StatusNoContent)
}

