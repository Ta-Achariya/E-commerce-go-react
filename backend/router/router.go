package router

import (
	"github.com/Achariya1/e-commerce/handlers"
	"github.com/Achariya1/e-commerce/middleware"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func Initialize(router *fiber.App) {

	router.Use(cors.New())

	router.Get("/hello", func(c *fiber.Ctx) error {
		return c.SendString("Hello uiia")
	})

	//public routes
	router.Post("/register", handlers.SignUp)
	router.Post("/login", handlers.Login)

	router.Get("/product", handlers.GetProducts)
	router.Get("/product/:id", handlers.GetProductById)
	router.Get("/category", handlers.GetAllCategory)
	router.Get("/category/:id", handlers.GetCategoryById)





	//Protected routes need JWT, // all path under /api require token
	protected := router.Group("/api")
	protected.Use(middleware.Protected())

	//cart
	protected.Post("/cart/item", handlers.AddToCart)
	protected.Get("/cart", handlers.GetCartByUserId)
	protected.Put("/cart/items/:item_id", handlers.UpdateCartItemQuantity)
	protected.Delete("/cart/items/:item_id", handlers.RemoveItemFromCart)
	protected.Delete("/cart/items", handlers.ClearCart)

	//order
	protected.Get("/order", handlers.GetOrderByUserId)


	//payment
	protected.Post("/checkout", handlers.CreateCheckoutSession)
	protected.Get("/payment/success", handlers.PaymentSuccess)






	//admin-only routes (prodcut and category management)
	admin := protected.Group("/admin")
	admin.Use(middleware.AdminAuthen)

	//  admin/product
	admin.Post("/product", handlers.CreateProduct)
	admin.Put("/product/:id", handlers.UpdateProduct)
	admin.Delete("/product/:id", handlers.DeleteProduct)

	//  admin/category
	admin.Post("/category", handlers.CreateCategory)
	admin.Put("/category/:id", handlers.UpdateCategory)
	admin.Delete("/category/:id", handlers.DeleteCategory)

}
