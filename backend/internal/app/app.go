package app

import (
	"fmt"
	"github.com/go-chi/chi/v5"
	"github.com/rs/cors"
	"io"
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

func apiHandler(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		fmt.Println(err)
	}

	fmt.Printf("Получен запрос: method=%s, path=%s, headers=%v\n, body=%s", r.Method, r.URL.Path, r.Header, string(body))
	defer r.Body.Close()
	fmt.Fprintln(w, "OK")
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
	app.router.Get("/api", apiHandler)

}

func (app *App) Serve(addr string, c *cors.Cors) {
	log.Printf("starting server on %s", addr)
	handler := c.Handler(app.router)

	log.Fatal(http.ListenAndServe(addr, handler))
}
