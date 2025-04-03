package storage

import (
	"database/sql"
	_ "github.com/lib/pq"
	"time"
	"todo/internal/models"
)

type PostgresStorage struct {
	db *sql.DB
}

func NewPostgresStorage(connStr string) (*PostgresStorage, error) {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, err
	}

	return &PostgresStorage{db: db}, nil
}

func (s *PostgresStorage) CreateTask(task models.Task) error {
	_, err := s.db.Exec("INSERT INTO tasks (title, description, priority) VALUES ($1, $2, $3)", task.Title, task.Desc, task.Priority)
	if err != nil {
		return err
	}
	return nil
}

func (s *PostgresStorage) GetTasks() ([]models.Task, error) {
	rows, err := s.db.Query("SELECT id, title, description, priority, created_at, updated_at FROM tasks")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tasks := []models.Task{}
	for rows.Next() {
		var id int
		var title, description, priority string
		var createdAt, updatedAt time.Time

		if err := rows.Scan(&id, &title, &description, &priority, &createdAt, &updatedAt); err != nil {
			return nil, err
		}
		tasks = append(tasks, models.Task{
			Id:        id,
			Title:     title,
			Desc:      description,
			Priority:  priority,
			CreatedAt: createdAt,
			UpdatedAt: updatedAt,
		})
	}
	return tasks, nil
}

func (s *PostgresStorage) UpdateTask(task models.Task) error {
	id := task.Id
	res, err := s.db.Exec("UPDATE tasks SET title = $1, description = $2, priority = $3 WHERE id = $4", task.Title, task.Desc, task.Priority, id)
	if err != nil {
		return err
	}
	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (s *PostgresStorage) DeleteTask(id int) error {
	_, err := s.db.Exec("DELETE FROM tasks WHERE id = $1", id)
	if err != nil {
		return err
	}
	return nil
}

func (s *PostgresStorage) Close() error {
	return s.db.Close()
}
