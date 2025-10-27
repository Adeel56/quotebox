package client

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestHTTPError_Error(t *testing.T) {
	err := &HTTPError{
		StatusCode: 500,
		Message:    "Internal Server Error",
	}

	expected := "HTTP 500: Internal Server Error"
	assert.Equal(t, expected, err.Error())
}

func TestIsRetryableError(t *testing.T) {
	tests := []struct {
		name     string
		err      error
		expected bool
	}{
		{
			name: "Retryable - 429",
			err: &HTTPError{
				StatusCode: 429,
				Message:    "Too Many Requests",
			},
			expected: true,
		},
		{
			name: "Retryable - 500",
			err: &HTTPError{
				StatusCode: 500,
				Message:    "Internal Server Error",
			},
			expected: true,
		},
		{
			name: "Retryable - 503",
			err: &HTTPError{
				StatusCode: 503,
				Message:    "Service Unavailable",
			},
			expected: true,
		},
		{
			name: "Not retryable - 400",
			err: &HTTPError{
				StatusCode: 400,
				Message:    "Bad Request",
			},
			expected: false,
		},
		{
			name: "Not retryable - 404",
			err: &HTTPError{
				StatusCode: 404,
				Message:    "Not Found",
			},
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := isRetryableError(tt.err)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestNewOpenRouterClient(t *testing.T) {
	// Set required environment variable
	t.Setenv("OPENROUTER_API_KEY", "test-key")
	t.Setenv("OPENROUTER_MODEL", "test-model")
	t.Setenv("OPENROUTER_BASE_URL", "https://test.example.com")

	client := NewOpenRouterClient()

	assert.NotNil(t, client)
	assert.Equal(t, "test-key", client.APIKey)
	assert.Equal(t, "test-model", client.Model)
	assert.Equal(t, "https://test.example.com", client.BaseURL)
	assert.NotNil(t, client.HTTPClient)
}
