package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func Connect() {
	user := getenv("DB_USER", "mariahaddon")
	password := getenv("DB_PASSWORD", "")
	host := getenv("DB_HOST", "localhost")
	port := getenv("DB_PORT", "5432")
	name := getenv("DB_NAME", "mahjong_maven")
	sslmode := getenv("DB_SSLMODE", "disable")

	var dsn string
	if password == "" {
		dsn = fmt.Sprintf("postgres://%s@%s:%s/%s?sslmode=%s", user, host, port, name, sslmode)
	} else {
		dsn = fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s", user, password, host, port, name, sslmode)
	}

	var err error
	DB, err = sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("db open: %v", err)
	}
	if err = DB.Ping(); err != nil {
		log.Fatalf("db ping: %v", err)
	}
	log.Println("Connected to PostgreSQL")
}

func Migrate() {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS tournaments (
			id SERIAL PRIMARY KEY,
			name TEXT NOT NULL,
			date DATE NOT NULL,
			location TEXT,
			rounds INT NOT NULL DEFAULT 4,
			round_minutes INT NOT NULL DEFAULT 45,
			status TEXT NOT NULL DEFAULT 'upcoming',
			created_at TIMESTAMPTZ DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS players (
			id SERIAL PRIMARY KEY,
			tournament_id INT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
			name TEXT NOT NULL,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS rounds (
			id SERIAL PRIMARY KEY,
			tournament_id INT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
			number INT NOT NULL,
			completed BOOLEAN NOT NULL DEFAULT FALSE,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS tables (
			id SERIAL PRIMARY KEY,
			round_id INT NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
			number INT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS table_players (
			id SERIAL PRIMARY KEY,
			table_id INT NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
			player_id INT NOT NULL REFERENCES players(id) ON DELETE CASCADE
		)`,
		`CREATE TABLE IF NOT EXISTS scores (
			id SERIAL PRIMARY KEY,
			round_id INT NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
			table_id INT NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
			player_id INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
			score INT NOT NULL DEFAULT 0,
			UNIQUE(round_id, player_id)
		)`,
	}
	for _, q := range queries {
		if _, err := DB.Exec(q); err != nil {
			log.Fatalf("migrate: %v", err)
		}
	}
	log.Println("Database migrated")
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
