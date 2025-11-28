import { useState } from "react";
import "./App.css";

const App = () => {
	const [testCount, setTestCount] = useState(200);
	const [restResult, setRestResult] = useState<number>(0);
	const [graphqlResult, setGraphqlResult] = useState<number>(0);

	function testRestAPI() {
		const startTime = performance.now();
		let completedRequests = 0;

		for (let i = 0; i < testCount; i++) {
			fetch("http://localhost:8080/centroid")
				.then((response) => response.json())
				.then((_data) => {
					completedRequests++;
					if (completedRequests === testCount) {
						const endTime = performance.now();
						const totalTime = endTime - startTime;
						setRestResult(totalTime);
					}
				});
		}
	}

	function testGraphQLAPI() {
		const startTime = performance.now();
		let completedRequests = 0;

		const query = `
{
  centroid {
    acquired_at
    acquisition_id
    centroid {
      freq_centroid_Hz
      time_centroid_ns
    }
    centroidProcessDuration
    error
    sensor_id
  }
}
`;

		for (let i = 0; i < testCount; i++) {
			fetch("http://localhost:8080/query", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ query }),
			})
				.then((response) => response.json())
				.then((_data) => {
					completedRequests++;
					if (completedRequests === testCount) {
						const endTime = performance.now();
						const totalTime = endTime - startTime;
						setGraphqlResult(totalTime);
					}
				});
		}
	}

	function clear() {
		setRestResult(0);
		setGraphqlResult(0);
	}

	return (
		<div className="content">
			<h1>Rsbuild with React</h1>
			<p>Start building amazing things with Rsbuild.</p>
			<div>
				Test count:{" "}
				<input
					value={testCount}
					onChange={(e) => {
						setTestCount(Number(e.target.value));
						clear();
					}}
				/>
			</div>
			<div style={{ display: "flex" }}>
				<div style={{ flex: "1 1 0" }}>
					<div>REST</div>
					<button type="button" onClick={testRestAPI}>
						Test {testCount} times
					</button>
					<div>
						{restResult
							? `Completed ${testCount} REST requests in ${restResult.toFixed(2)} ms`
							: ""}
					</div>
				</div>
				<div style={{ flex: "1 1 0" }}>
					<div>GraphQL</div>
					<button type="button" onClick={testGraphQLAPI}>
						Test {testCount} times
					</button>
					<div>
						{graphqlResult
							? `Completed ${testCount} GraphQL requests in ${graphqlResult.toFixed(2)} ms`
							: ""}
					</div>
				</div>
			</div>
			<div>
				<button
					type="button"
					onClick={() => {
						clear();
					}}
				>
					Clear
				</button>
				<button
					type="button"
					onClick={() => {
						clear();
						testRestAPI();
						testGraphQLAPI();
					}}
				>
					Test together
				</button>
			</div>
		</div>
	);
};

export default App;
