package storage

import (
	"database/sql"
	"fmt"
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

func (s *PostgresStorage) CreateTask(task *models.Task) error {
	err := s.db.QueryRow("INSERT INTO tasks (title, description, priority ) VALUES ($1, $2, $3) RETURNING id", task.Title, task.Desc, task.Priority).Scan(&task.Id)

	if err != nil {
		return fmt.Errorf("failed to create task: %w", err)
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

func (s *PostgresStorage) UpdateTask(task *models.Task) error {
	id := task.Id
	err := s.db.QueryRow("UPDATE tasks SET title = $1, description = $2, priority = $3 WHERE id = $4 RETURNING id", task.Title, task.Desc, task.Priority, id).Scan(&task.Id)

	if err != nil {
		return fmt.Errorf("failed to create task: %w", err)
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

func (s *PostgresStorage) GetTaskById(id int) (*models.Task, error) {
	row := s.db.QueryRow("SELECT id, title, description, priority FROM tasks WHERE id = $1", id)

	var task models.Task
	err := row.Scan(&task.Id, &task.Title, &task.Desc, &task.Priority)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("task with id %d not found", id)
	} else if err != nil {
		return nil, fmt.Errorf("failed to get task: %w", err)
	}

	return &task, nil
}

func (s *PostgresStorage) Close() error {
	return s.db.Close()
}
