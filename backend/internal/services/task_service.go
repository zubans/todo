package services

import (
	"todo/internal/models"
	"todo/internal/repositories"
)

type TaskService struct {
	repo *repositories.TaskRepository
}

func NewTaskService(repo *repositories.TaskRepository) *TaskService {
	return &TaskService{repo}
}

func (service *TaskService) CreateTask(task models.Task) error {
	return service.repo.CreateTask(task)
}

func (service *TaskService) GetTasks() ([]models.Task, error) {
	return service.repo.GetTasks()
}

func (service *TaskService) DeleteTask(id int) error {
	return service.repo.DeleteTask(id)
}

func (service *TaskService) GetTaskById(id int) (*models.Task, error) {
	return service.repo.GetTaskById(id)
}

func (service *TaskService) UpdteTask(task *models.Task) error {
	err := service.repo.UpdateTask(task)
	if err != nil {
		return err
	}

	return nil
}
