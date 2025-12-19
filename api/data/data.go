package data

import (
	"encoding/json"
	"os"
	"test-golang-gqlgen/graph/model"
)

type CentroidFile struct {
	Payload []model.CentroidPayload
}

var DataPayload CentroidFile

func Init() {
	var centroidData, _ = os.ReadFile("data/centroid.json")
	json.Unmarshal(centroidData, &DataPayload)
}

func GetRawBytesFromFile() []byte {
	data, _ := os.ReadFile("data/centroid.json")
	return data
}
