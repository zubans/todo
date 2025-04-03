package models

import "time"

type Task struct {
	Id        int       `json:"id"`
	Title     string    `json:"title"`
	Desc      string    `json:"description"`
	Priority  string    `json:"priority"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
