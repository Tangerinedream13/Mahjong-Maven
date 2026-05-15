package models

import "time"

type Tournament struct {
	ID           int       `json:"id"`
	Name         string    `json:"name"`
	Date         string    `json:"date"`
	Location     string    `json:"location"`
	Rounds       int       `json:"rounds"`
	RoundMinutes int       `json:"round_minutes"`
	Status       string    `json:"status"`
	PlayerCount  int       `json:"player_count"`
	CreatedAt    time.Time `json:"created_at"`
}

type Player struct {
	ID           int    `json:"id"`
	TournamentID int    `json:"tournament_id"`
	Name         string `json:"name"`
	Score        *int   `json:"score,omitempty"`
}

type Round struct {
	ID           int     `json:"id"`
	TournamentID int     `json:"tournament_id"`
	Number       int     `json:"number"`
	Completed    bool    `json:"completed"`
	Tables       []Table `json:"tables,omitempty"`
}

type Table struct {
	ID      int      `json:"id"`
	RoundID int      `json:"round_id"`
	Number  int      `json:"number"`
	Players []Player `json:"players"`
}

type Score struct {
	PlayerID int `json:"player_id"`
	Score    int `json:"score"`
}

type Standing struct {
	PlayerID     int    `json:"player_id"`
	Name         string `json:"name"`
	TotalScore   int    `json:"total_score"`
	RoundsPlayed int    `json:"rounds_played"`
}
