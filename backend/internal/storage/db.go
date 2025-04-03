package storage

import "todo/internal/models"

type Storage interface {
	CreateTask(task models.Task) error
	GetTasks() ([]models.Task, error)
	UpdateTask(task *models.Task) error
	DeleteTask(id int) error
	GetTaskById(id int) (*models.Task, error)
}
