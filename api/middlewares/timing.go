package middlewares

import (
	"net/http"
	"strconv"
	"strings"
	"time"
)

// TimerMiddleware measures the time taken to process a request
func TimerMiddleware(next http.Handler, label string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		startTime := time.Now()           // Record the start time
		next.ServeHTTP(w, r)              // Call the next handler in the chain
		duration := time.Since(startTime) // Calculate the duration
		milliSeconds := strconv.FormatFloat(float64(duration.Nanoseconds())/1e6, 'f', 6, 64)
		previousTimings := w.Header().Values("Server-Timing")
		previousTimings = append(previousTimings, label+";dur="+milliSeconds)
		w.Header().Set("Server-Timing", strings.Join(previousTimings, ", "))
	})
}
