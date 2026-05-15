package handlers

import (
	"math/rand"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/mariabhaddon/mahjong-maven/server/internal/db"
	"github.com/mariabhaddon/mahjong-maven/server/internal/models"
)

func ListTournaments(c *gin.Context) {
	rows, err := db.DB.Query(`
		SELECT t.id, t.name, t.date, COALESCE(t.location,''), t.rounds, t.round_minutes, t.status, t.created_at,
		       COUNT(p.id) AS player_count
		FROM tournaments t
		LEFT JOIN players p ON p.tournament_id = t.id
		GROUP BY t.id ORDER BY t.date DESC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var ts []models.Tournament
	for rows.Next() {
		var t models.Tournament
		if err := rows.Scan(&t.ID, &t.Name, &t.Date, &t.Location, &t.Rounds, &t.RoundMinutes, &t.Status, &t.CreatedAt, &t.PlayerCount); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		ts = append(ts, t)
	}
	if ts == nil {
		ts = []models.Tournament{}
	}
	c.JSON(http.StatusOK, ts)
}

func CreateTournament(c *gin.Context) {
	var input struct {
		Name         string `json:"name" binding:"required"`
		Date         string `json:"date" binding:"required"`
		Location     string `json:"location"`
		Rounds       int    `json:"rounds"`
		RoundMinutes int    `json:"round_minutes"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if input.Rounds == 0 {
		input.Rounds = 4
	}
	if input.RoundMinutes == 0 {
		input.RoundMinutes = 45
	}

	var t models.Tournament
	err := db.DB.QueryRow(`
		INSERT INTO tournaments (name, date, location, rounds, round_minutes)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, name, date, COALESCE(location,''), rounds, round_minutes, status, created_at
	`, input.Name, input.Date, input.Location, input.Rounds, input.RoundMinutes).
		Scan(&t.ID, &t.Name, &t.Date, &t.Location, &t.Rounds, &t.RoundMinutes, &t.Status, &t.CreatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, t)
}

func GetTournament(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var t models.Tournament
	err := db.DB.QueryRow(`
		SELECT t.id, t.name, t.date, COALESCE(t.location,''), t.rounds, t.round_minutes, t.status, t.created_at,
		       COUNT(p.id) AS player_count
		FROM tournaments t
		LEFT JOIN players p ON p.tournament_id = t.id
		WHERE t.id = $1
		GROUP BY t.id
	`, id).Scan(&t.ID, &t.Name, &t.Date, &t.Location, &t.Rounds, &t.RoundMinutes, &t.Status, &t.CreatedAt, &t.PlayerCount)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "tournament not found"})
		return
	}
	c.JSON(http.StatusOK, t)
}

func ListPlayers(c *gin.Context) {
	tid, _ := strconv.Atoi(c.Param("id"))
	rows, err := db.DB.Query(`SELECT id, tournament_id, name FROM players WHERE tournament_id=$1 ORDER BY name`, tid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()
	var ps []models.Player
	for rows.Next() {
		var p models.Player
		rows.Scan(&p.ID, &p.TournamentID, &p.Name)
		ps = append(ps, p)
	}
	if ps == nil {
		ps = []models.Player{}
	}
	c.JSON(http.StatusOK, ps)
}

func AddPlayer(c *gin.Context) {
	tid, _ := strconv.Atoi(c.Param("id"))
	var input struct {
		Name string `json:"name" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var p models.Player
	err := db.DB.QueryRow(`
		INSERT INTO players (tournament_id, name) VALUES ($1,$2)
		RETURNING id, tournament_id, name
	`, tid, input.Name).Scan(&p.ID, &p.TournamentID, &p.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, p)
}

func AddPlayersBulk(c *gin.Context) {
	tid, _ := strconv.Atoi(c.Param("id"))
	var input struct {
		Names []string `json:"names" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var added []models.Player
	for _, name := range input.Names {
		if name == "" {
			continue
		}
		var p models.Player
		err := db.DB.QueryRow(`
			INSERT INTO players (tournament_id, name) VALUES ($1,$2)
			RETURNING id, tournament_id, name
		`, tid, name).Scan(&p.ID, &p.TournamentID, &p.Name)
		if err == nil {
			added = append(added, p)
		}
	}
	if added == nil {
		added = []models.Player{}
	}
	c.JSON(http.StatusCreated, added)
}

func RemovePlayer(c *gin.Context) {
	pid, _ := strconv.Atoi(c.Param("pid"))
	_, err := db.DB.Exec(`DELETE FROM players WHERE id=$1`, pid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": pid})
}

func ListRounds(c *gin.Context) {
	tid, _ := strconv.Atoi(c.Param("id"))
	rows, err := db.DB.Query(`SELECT id, tournament_id, number, completed FROM rounds WHERE tournament_id=$1 ORDER BY number`, tid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var rounds []models.Round
	for rows.Next() {
		var r models.Round
		rows.Scan(&r.ID, &r.TournamentID, &r.Number, &r.Completed)

		tableRows, _ := db.DB.Query(`SELECT id, round_id, number FROM tables WHERE round_id=$1 ORDER BY number`, r.ID)
		for tableRows.Next() {
			var t models.Table
			tableRows.Scan(&t.ID, &t.RoundID, &t.Number)

			playerRows, _ := db.DB.Query(`
				SELECT p.id, p.tournament_id, p.name, s.score
				FROM table_players tp
				JOIN players p ON p.id = tp.player_id
				LEFT JOIN scores s ON s.player_id = p.id AND s.round_id = $1
				WHERE tp.table_id = $2
				ORDER BY p.name
			`, r.ID, t.ID)
			for playerRows.Next() {
				var p models.Player
				playerRows.Scan(&p.ID, &p.TournamentID, &p.Name, &p.Score)
				t.Players = append(t.Players, p)
			}
			playerRows.Close()
			r.Tables = append(r.Tables, t)
		}
		tableRows.Close()
		rounds = append(rounds, r)
	}
	if rounds == nil {
		rounds = []models.Round{}
	}
	c.JSON(http.StatusOK, rounds)
}

func GenerateRound(c *gin.Context) {
	tid, _ := strconv.Atoi(c.Param("id"))

	var t models.Tournament
	err := db.DB.QueryRow(`SELECT id, rounds FROM tournaments WHERE id=$1`, tid).Scan(&t.ID, &t.Rounds)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "tournament not found"})
		return
	}

	var roundCount int
	db.DB.QueryRow(`SELECT COUNT(*) FROM rounds WHERE tournament_id=$1`, tid).Scan(&roundCount)
	if roundCount >= t.Rounds {
		c.JSON(http.StatusBadRequest, gin.H{"error": "all rounds already generated"})
		return
	}

	rows, _ := db.DB.Query(`SELECT id FROM players WHERE tournament_id=$1 ORDER BY id`, tid)
	var playerIDs []int
	for rows.Next() {
		var id int
		rows.Scan(&id)
		playerIDs = append(playerIDs, id)
	}
	rows.Close()

	if len(playerIDs) < 4 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "need at least 4 players"})
		return
	}

	rand.Shuffle(len(playerIDs), func(i, j int) { playerIDs[i], playerIDs[j] = playerIDs[j], playerIDs[i] })

	roundNumber := roundCount + 1
	var roundID int
	db.DB.QueryRow(`INSERT INTO rounds (tournament_id, number) VALUES ($1,$2) RETURNING id`, tid, roundNumber).Scan(&roundID)

	tableNum := 1
	for i := 0; i+3 < len(playerIDs); i += 4 {
		group := playerIDs[i : i+4]
		if i+4 == len(playerIDs)-1 {
			group = playerIDs[i : i+4]
		}
		var tableID int
		db.DB.QueryRow(`INSERT INTO tables (round_id, number) VALUES ($1,$2) RETURNING id`, roundID, tableNum).Scan(&tableID)
		for _, pid := range group {
			db.DB.Exec(`INSERT INTO table_players (table_id, player_id) VALUES ($1,$2)`, tableID, pid)
		}
		tableNum++
	}

	// Handle remainder (sit-outs are simply not assigned)
	db.DB.Exec(`UPDATE tournaments SET status='active' WHERE id=$1`, tid)

	c.JSON(http.StatusCreated, gin.H{"round": roundNumber})
}

func SaveScores(c *gin.Context) {
	rid, _ := strconv.Atoi(c.Param("rid"))
	var input struct {
		TableID int            `json:"table_id"`
		Scores  []models.Score `json:"scores"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	for _, s := range input.Scores {
		db.DB.Exec(`
			INSERT INTO scores (round_id, table_id, player_id, score)
			VALUES ($1,$2,$3,$4)
			ON CONFLICT (round_id, player_id) DO UPDATE SET score=EXCLUDED.score
		`, rid, input.TableID, s.PlayerID, s.Score)
	}
	db.DB.Exec(`UPDATE rounds SET completed=true WHERE id=$1`, rid)
	c.JSON(http.StatusOK, gin.H{"saved": true})
}

func GetStandings(c *gin.Context) {
	tid, _ := strconv.Atoi(c.Param("id"))
	rows, err := db.DB.Query(`
		SELECT p.id, p.name, COALESCE(SUM(s.score),0) AS total, COUNT(s.id) AS rounds_played
		FROM players p
		LEFT JOIN scores s ON s.player_id = p.id
		WHERE p.tournament_id = $1
		GROUP BY p.id, p.name
		ORDER BY total DESC, p.name
	`, tid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()
	var standings []models.Standing
	for rows.Next() {
		var s models.Standing
		rows.Scan(&s.PlayerID, &s.Name, &s.TotalScore, &s.RoundsPlayed)
		standings = append(standings, s)
	}
	if standings == nil {
		standings = []models.Standing{}
	}
	c.JSON(http.StatusOK, standings)
}
