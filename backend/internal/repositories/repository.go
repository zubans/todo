package repositories

import (
	"todo/internal/models"
	"todo/internal/storage"
)

type TaskRepository struct {
	storage storage.Storage
}

func NewTaskRepository(storage storage.Storage) *TaskRepository {
	return &TaskRepository{storage: storage}
}

func (repo *TaskRepository) CreateTask(task models.Task) error {
	return repo.storage.CreateTask(task)
}

func (repo *TaskRepository) GetTasks() ([]models.Task, error) {
	return repo.storage.GetTasks()
}

func (repo *TaskRepository) UpdateTask(task *models.Task) error {
	return repo.storage.UpdateTask(task)
}

func (repo *TaskRepository) DeleteTask(id int) error {
	return repo.storage.DeleteTask(id)
}

func (repo *TaskRepository) GetTaskById(id int) (*models.Task, error) {
	return repo.storage.GetTaskById(id)
}
