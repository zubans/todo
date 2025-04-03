package app

import (
	"github.com/go-chi/chi/v5"
	"log"
	"net/http"
	"todo/internal/handlers"
	"todo/internal/repositories"
	"todo/internal/services"
	"todo/internal/storage"
)

type App struct {
	storage storage.Storage
	router  *chi.Mux
}

func Test(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Привет!"))
}

func NewApp(connStr string) (*App, error) {
	storage, err := storage.NewPostgresStorage(connStr)
	if err != nil {
		return nil, err
	}
	app := &App{
		router:  chi.NewRouter(),
		storage: storage,
	}
	app.routes()
	return app, nil
}

func (app *App) routes() {
	repo := repositories.NewTaskRepository(app.storage)
	svc := services.NewTaskService(repo)
	handler := handlers.NewTaskHandler(svc)

	app.router.Get("/", Test)
	app.router.Get("/tasks", handler.GetTasks)
	app.router.Post("/tasks", handler.CreateTask)
	app.router.Delete("/tasks/{id}", handler.DeleteTask)
	app.router.Put("/tasks/{id}", handler.UpdateTask)
}

func (app *App) Serve(addr string) {
	log.Printf("starting server on %s", addr)
	log.Fatal(http.ListenAndServe(addr, app.router))
}
