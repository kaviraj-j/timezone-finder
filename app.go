package main

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"runtime"
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

// Check if running as root/admin
func isAdmin() bool {
	switch runtime.GOOS {
	case "windows":
		cmd := exec.Command("net", "session")
		err := cmd.Run()
		return err == nil
	case "linux", "darwin":
		return os.Geteuid() == 0
	default:
		return false
	}
}

// Relaunch the app as root/admin
func relaunchAsAdmin() error {
	switch runtime.GOOS {
	case "windows":
		// Relaunch using PowerShell with admin privileges
		cmd := exec.Command("powershell", "Start-Process", os.Args[0], "-Verb", "runAs")
		return cmd.Run()
	case "linux":
		cmd := exec.Command("sudo", os.Args[0])
		cmd.Stdin = os.Stdin
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		return cmd.Run()
	case "darwin":
		cmd := exec.Command("osascript", "-e", fmt.Sprintf(`do shell script "%s" with administrator privileges`, os.Args[0]))
		return cmd.Run()
	default:
		return fmt.Errorf("unsupported OS")
	}
}

// SetTimezone changes the system timezone
func (a *App) SetTimezone(timezoneCode string) string {
	var cmd *exec.Cmd

	switch runtime.GOOS {
	case "linux":
		cmd = exec.Command("pkexec", "timedatectl", "set-timezone", timezoneCode) // Uses GUI sudo
	case "darwin":
		cmd = exec.Command("osascript", "-e", fmt.Sprintf(`do shell script "systemsetup -settimezone %s" with administrator privileges`, timezoneCode))
	case "windows":
		cmd = exec.Command("tzutil", "/s", ianaToWindowsMap[timezoneCode])
	default:
		return "Unsupported OS"
	}

	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Sprintf("Error: %s\nOutput: %s", err, string(output))
	}

	return fmt.Sprintf("Success: %s", string(output))
}
