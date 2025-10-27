package models

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestIsValidTag(t *testing.T) {
	tests := []struct {
		name     string
		tag      string
		expected bool
	}{
		{"Valid tag - joy", "joy", true},
		{"Valid tag - resilience", "resilience", true},
		{"Valid tag - contentment", "contentment", true},
		{"Invalid tag - invalid", "invalid", false},
		{"Invalid tag - empty", "", false},
		{"Invalid tag - random", "random", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := IsValidTag(tt.tag)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestGetTagSource(t *testing.T) {
	tests := []struct {
		name     string
		tag      string
		expected string
	}{
		{"Preset tag", "joy", "preset"},
		{"Custom tag", "custom_emotion", "custom"},
		{"Another preset", "gratitude", "preset"},
		{"Another custom", "test", "custom"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := GetTagSource(tt.tag)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestValidTagsCount(t *testing.T) {
	// Ensure we have between 20-30 tags as specified
	assert.GreaterOrEqual(t, len(ValidTags), 20, "Should have at least 20 tags")
	assert.LessOrEqual(t, len(ValidTags), 30, "Should have at most 30 tags")
}

func TestValidTagsUniqueness(t *testing.T) {
	// Ensure all tags are unique
	tagMap := make(map[string]bool)
	for _, tag := range ValidTags {
		assert.False(t, tagMap[tag], "Tag %s appears more than once", tag)
		tagMap[tag] = true
	}
}
