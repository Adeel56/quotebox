package metrics

import (
	"testing"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/testutil"
	"github.com/stretchr/testify/assert"
)

func TestRecordQuoteFetched(t *testing.T) {
	// Reset metrics before test
	QuotesFetchedTotal = prometheus.NewCounter(prometheus.CounterOpts{
		Name: "quotes_fetched_total_test",
	})
	QuotesByTag = prometheus.NewCounterVec(prometheus.CounterOpts{
		Name: "quotes_by_tag_test",
	}, []string{"tag"})

	tag := "joy"
	RecordQuoteFetched(tag)

	// Verify counter was incremented
	count := testutil.ToFloat64(QuotesFetchedTotal)
	assert.Equal(t, float64(1), count)
}

func TestRecordQuoteError(t *testing.T) {
	// Reset metrics before test
	QuoteFetchErrorsTotal = prometheus.NewCounter(prometheus.CounterOpts{
		Name: "quote_fetch_errors_total_test",
	})

	RecordQuoteError()

	count := testutil.ToFloat64(QuoteFetchErrorsTotal)
	assert.Equal(t, float64(1), count)
}

func TestSetOpenRouterStatus(t *testing.T) {
	// Reset metric before test
	OpenRouterUp = prometheus.NewGauge(prometheus.GaugeOpts{
		Name: "openrouter_up_test",
	})

	// Test setting to up
	SetOpenRouterStatus(true)
	assert.Equal(t, float64(1), testutil.ToFloat64(OpenRouterUp))

	// Test setting to down
	SetOpenRouterStatus(false)
	assert.Equal(t, float64(0), testutil.ToFloat64(OpenRouterUp))
}

func TestRecordLatency(t *testing.T) {
	// Reset metric before test
	QuoteFetchLatency = prometheus.NewHistogram(prometheus.HistogramOpts{
		Name:    "quote_fetch_latency_seconds_test",
		Buckets: prometheus.DefBuckets,
	})

	RecordLatency(0.5)
	RecordLatency(1.0)
	RecordLatency(2.0)

	// Verify histogram has observations
	count := testutil.ToFloat64(QuoteFetchLatency)
	assert.Equal(t, float64(3), count)
}
