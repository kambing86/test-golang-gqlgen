package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"test-golang-gqlgen/data"
	"test-golang-gqlgen/graph"
	"test-golang-gqlgen/middlewares"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/vektah/gqlparser/v2/ast"
)

const defaultPort = "8080"

func main() {
	data.Init()

	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	srv := handler.New(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{}}))

	srv.AddTransport(transport.Options{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})

	srv.SetQueryCache(lru.New[*ast.QueryDocument](1000))

	srv.Use(extension.Introspection{})
	srv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New[string](100),
	})

	mux := http.NewServeMux()

	mux.Handle("/", playground.Handler("GraphQL playground", "/query"))
	mux.Handle("/query", srv)

	mux.HandleFunc("/centroid", func(w http.ResponseWriter, r *http.Request) {
		responseBytes, err := json.Marshal(data.DataPayload.Payload[0])
		if err != nil {
			http.Error(w, "Failed to marshal payload", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(responseBytes)
	})

	mux.HandleFunc("/centroid/raw", func(w http.ResponseWriter, r *http.Request) {
		responseBytes := data.GetRawBytesFromFile()
		w.Header().Set("Content-Type", "application/json")
		w.Write(responseBytes)
	})

	handler := middlewares.TimerMiddleware(mux, "app")
	handler = middlewares.CorsMiddleware(handler)
	handler = middlewares.TimerMiddleware(handler, "cors")
	handler = middlewares.CompressionMiddleware(handler)

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
