package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/mariabhaddon/mahjong-maven/server/internal/db"
	"github.com/mariabhaddon/mahjong-maven/server/internal/handlers"
	"github.com/mariabhaddon/mahjong-maven/server/internal/middleware"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	db.Connect()
	db.Migrate()

	r := gin.Default()
	r.Use(middleware.CORS())

	api := r.Group("/api")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"message": "Mahjong Maven API is running!"})
		})

		// Tournaments
		api.GET("/tournaments", handlers.ListTournaments)
		api.POST("/tournaments", handlers.CreateTournament)
		api.GET("/tournaments/:id", handlers.GetTournament)

		// Players
		api.GET("/tournaments/:id/players", handlers.ListPlayers)
		api.POST("/tournaments/:id/players", handlers.AddPlayer)
		api.POST("/tournaments/:id/players/bulk", handlers.AddPlayersBulk)
		api.DELETE("/tournaments/:id/players/:pid", handlers.RemovePlayer)

		// Rounds
		api.GET("/tournaments/:id/rounds", handlers.ListRounds)
		api.POST("/tournaments/:id/rounds/generate", handlers.GenerateRound)

		// Scores
		api.POST("/rounds/:rid/scores", handlers.SaveScores)

		// Standings
		api.GET("/tournaments/:id/standings", handlers.GetStandings)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Starting Mahjong Maven API on :%s\n", port)
	r.Run(":" + port)
}
