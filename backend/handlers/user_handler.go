package handlers

import (
	"github.com/Achariya1/e-commerce/database"
	"github.com/Achariya1/e-commerce/model"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
	"os"
	"time"
)

//admin role will be created manual in database. user role is 'user' by default when signup

func SignUp(c *fiber.Ctx) error {

	req := model.SignupRequest{}

	db := database.DB

	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	//validate input.
	if req.Email == "" || req.Password == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Email and password are required")
	}

	existUser := model.User{}

	if err := db.Where("email = ?", req.Email).First(&existUser).Error; err == nil {
		//return json fomat for fontend handler err easier
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Email already exists",
		})
	}

	//password hashing
	password, err := bcrypt.GenerateFromPassword([]byte(req.Password), 10)
	if err != nil {
		return fiber.NewError(fiber.StatusUnprocessableEntity, err.Error())
	}

	user := model.User{
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Email:     req.Email,
		Password:  string(password),
		Role:      "user",
	}

	if err := db.Create(&user).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Error creating user: "+err.Error())
	}

	return c.JSON(user)
}

func Login(c *fiber.Ctx) error {

	req := model.LoginRequest{}

	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body format")
	}

	db := database.DB

	user := model.User{}
	if err := db.Where("Email = ?", req.Email).First(&user).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Invalid Email or password")
	}

	//check if password matches
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "Invalid Email or password")
	}

	//crete token
	token := jwt.New(jwt.SigningMethodHS256)

	//Set claims
	claims := token.Claims.(jwt.MapClaims)
	claims["id"] = user.ID
	claims["email"] = user.Email
	claims["role"] = user.Role
	claims["exp"] = time.Now().Add(time.Hour * 24).Unix()

	//Generate encoded token
	t, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		return c.SendStatus(fiber.StatusInternalServerError)
	}

	return c.JSON(fiber.Map{
		"Role":  user.Role,
		"Email": user.Email,
		//"password" : user.Password,
		"token": t,
	})
}
