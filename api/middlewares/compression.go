package middlewares

import (
	"compress/gzip"
	"io"
	"net/http"
	"strings"

	"github.com/andybalholm/brotli"
)

type compressedResponseWriter struct {
	http.ResponseWriter
	compressor io.WriteCloser
}

func (crw *compressedResponseWriter) Write(b []byte) (int, error) {
	return crw.compressor.Write(b)
}

func (crw *compressedResponseWriter) Close() error {
	return crw.compressor.Close()
}

// CompressionMiddleware creates a middleware that compresses responses
func CompressionMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		acceptEncoding := r.Header.Get("Accept-Encoding")

		var crw *compressedResponseWriter

		if strings.Contains(acceptEncoding, "br") {
			w.Header().Set("Content-Encoding", "br")
			brWriter := brotli.NewWriter(w)
			crw = &compressedResponseWriter{ResponseWriter: w, compressor: brWriter}
		} else if strings.Contains(acceptEncoding, "gzip") {
			w.Header().Set("Content-Encoding", "gzip")
			gzWriter := gzip.NewWriter(w)
			crw = &compressedResponseWriter{ResponseWriter: w, compressor: gzWriter}
		} else {
			// No compression
			next.ServeHTTP(w, r)
			return
		}

		defer crw.Close() // Ensure compressor is closed

		// Pass the wrapped writer to the next handler
		next.ServeHTTP(crw, r)
	})
}
