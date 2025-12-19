package data

import (
	"encoding/json"
	"os"
	"test-golang-gqlgen/graph/model"
)

type CentroidFile struct {
	Payload []model.CentroidPayload
}

var RawData []byte
var DataPayload CentroidFile

func Init() {
	RawData, _ = os.ReadFile("data/centroid.json")
	json.Unmarshal(RawData, &DataPayload)
}

func GetRawBytesFromFile() []byte {
	return RawData
}
