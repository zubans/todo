package main

import (
	"fmt"
	"github.com/joho/godotenv"
	"log"
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

	newApp.Serve(":8080")
}

func getEnv(s string, s2 string) string {
	v := os.Getenv(s)
	if v == "" {
		return s2
	}
	return v
}
