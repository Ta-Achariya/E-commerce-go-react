package middleware

import (
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/jwt/v2"
	"github.com/golang-jwt/jwt/v4"
)


func GetUserIDFromToken(c *fiber.Ctx) (uint ,error) {

	user := c.Locals("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)

	//extract user ID from claims
	userIDFloat ,ok := claims["id"].(float64)
	if !ok {
		return 0 , fiber.NewError(fiber.StatusUnauthorized, "Invalid token ID not found")
	}

	return uint(userIDFloat) , nil
}






func Protected() fiber.Handler {
	return jwtware.New(jwtware.Config{
		SigningKey: []byte(os.Getenv("JWT_SECRET")),
		ContextKey: "user",
	})
}



/*
func JwtError(c *fiber.Ctx , err error) error {
	return fiber.NewError(fiber.StatusUnauthorized, "Unauthorized")
}
*/


func AdminAuthen(c *fiber.Ctx) error {

	userToken := c.Locals("user")
	token, ok := userToken.(*jwt.Token)
	if !ok {
		return fiber.NewError(fiber.StatusUnauthorized, "Invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return fiber.NewError(fiber.StatusUnauthorized, "Invalid token claims")
	}

	if claims["role"] != "admin" {
		return fiber.NewError(fiber.StatusForbidden, "Admin access only")
	}

	return c.Next()
}

