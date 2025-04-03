package main

import (
	"fmt"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
	"log"
	"net/http"
	"os"
	"todo/internal/app"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Print(".env file not found")
	}

	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "54321")
	dbUser := getEnv("DB_USER", "db_user")
	dbPass := getEnv("DB_PASS", "db_pass")
	dbName := getEnv("DB_NAME", "todo")

	conStr := fmt.Sprintf(
		"host=%s port=%s user=%s dbname=%s password=%s sslmode=disable", dbHost, dbPort, dbUser, dbName, dbPass,
	)

	newApp, err := app.NewApp(conStr)
	if err != nil {
		log.Fatal(err)
	}

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://94.103.9.172:3000"},
		AllowedMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete},
		AllowedHeaders: []string{"Content-Type"},
	})

	newApp.Serve(":8080", c)
}

func getEnv(s string, s2 string) string {
	v := os.Getenv(s)
	if v == "" {
		return s2
	}
	return v
}
