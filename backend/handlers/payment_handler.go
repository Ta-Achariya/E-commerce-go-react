package handlers

import (
	"fmt"
	"os"
	"strconv"

	"github.com/Achariya1/e-commerce/database"
	"github.com/Achariya1/e-commerce/middleware"
	"github.com/Achariya1/e-commerce/model"
	"github.com/gofiber/fiber/v2"
	"github.com/stripe/stripe-go/v82"
	"github.com/stripe/stripe-go/v82/checkout/session"
)

//create the url checkout session
//take data from fontend --> generate the seesion --> return the url

func CreateCheckoutSession(c *fiber.Ctx) error {



	//Get user ID from JWT
	userID, err := middleware.GetUserIDFromToken(c)
	if err != nil {
		return err
	}


	// Convert to string for database queries
	userIDStr := strconv.FormatUint(uint64(userID), 10)

	db := database.DB

	// Load cart with items
	cart := model.Cart{}
	if err := db.Preload("CartItems.Product").Where("user_id = ? AND status = ?",
		userIDStr, true).First(&cart).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Cart not found")
	}

	// Check if cart is empty
	if len(cart.CartItems) == 0 {
		return fiber.NewError(fiber.StatusBadRequest, "Can't create checkout from empty cart")
	}

	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

	/*
		body := CheckoutRequest{}
		if err := c.BodyParser(&body); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
		}*/

	var lineItems []*stripe.CheckoutSessionLineItemParams

	for _, item := range cart.CartItems {
		product := item.Product
		if product.ID == 0 {
			return fiber.NewError(fiber.StatusInternalServerError, "Product not found")
		}

		lineItems = append(lineItems, &stripe.CheckoutSessionLineItemParams{
			PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
				Currency: stripe.String("thb"),
				ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
					Name: stripe.String(product.Name),
				},
				UnitAmount: stripe.Int64(int64(product.Price *100)), // cents
			},
			Quantity: stripe.Int64(int64(item.Quantity)),
		})
	}

	params := &stripe.CheckoutSessionParams{
		PaymentMethodTypes: stripe.StringSlice([]string{"card"}),
		LineItems:          lineItems,
		Mode:               stripe.String(stripe.CheckoutSessionModePayment),
		SuccessURL:         stripe.String("http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}"),
		CancelURL:          stripe.String("http://localhost:5173/cancel"),
		Metadata: map[string]string{
			"user_id" : userIDStr,
			"cart_id" : fmt.Sprintf("%d" , cart.ID),
		},
	}

	s, err := session.New(params)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"checkout_url": s.URL,
		"session_id" : s.ID,

	})
}




// HandlePaymentSuccess - Called after successful Stripe payment
func PaymentSuccess(c *fiber.Ctx) error {
	sessionID := c.Query("session_id")
	if sessionID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Session ID is required")
	}

	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

	// Retrieve the session from Stripe
	sess, err := session.Get(sessionID, nil)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to retrieve session")
	}

	// Check if payment was successful
	if sess.PaymentStatus != "paid" {
		return fiber.NewError(fiber.StatusBadRequest, "Payment not completed")
	}

	// Extract user_id and cart_id from metadata
	userIDStr := sess.Metadata["user_id"]
	cartIDStr := sess.Metadata["cart_id"]

	if userIDStr == "" || cartIDStr == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid session metadata")
	}

	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid user ID")
	}

	cartID, err := strconv.ParseUint(cartIDStr, 10, 32)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid cart ID")
	}

	// Create the order /CreateOrder
	order, err := createOrderFromCart(uint(userID), uint(cartID), sessionID )
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Order created successfully",
		"order":   order,
	})
}