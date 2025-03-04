package main

import (
	"context"
	"fmt"
	"strings"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

type TzResponse struct {
	TzName string `json:"tz_name"`
	TzCode string `json:"tz_code"`
}

// findTimezone performs a rough search for a timezone
func (a *App) FindTimezone(tzKeyword string) []TzResponse {
	tzKeyword = strings.ToLower(tzKeyword) // Normalize input
	result := []TzResponse{}
	for name, tz := range tzMap {
		// Check if the input keyword is a substring of the standard time name (case-insensitive)
		if strings.Contains(strings.ToLower(name), tzKeyword) || strings.Contains(strings.ToLower(tz), tzKeyword) {
			result = append(result, TzResponse{
				TzName: name,
				TzCode: tz,
			})
		}
	}

	return result
}
