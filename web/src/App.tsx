import { useRef, useState } from "react";
import "./App.css";

import { limitAsync } from "es-toolkit/array";
import Tester, { type TesterRef } from "./Tester";

// Limit to at most 3 concurrent requests.
function getLimit<T>(callback: () => Promise<T>, concurrency: number) {
	return limitAsync(async () => {
		const startTime = performance.now();
		const data = await callback();
		const endTime = performance.now();
		const duration = endTime - startTime;
		return { data, duration };
	}, concurrency);
}

function testRestAPI(
	testCount: number,
	concurrency: number,
	tester: TesterRef | null,
) {
	const startTime = performance.now();
	let completedRequests = 0;
	let maxTime = 0;
	let minTime = Number.MAX_VALUE;

	const fetchPromise = getLimit(
		() => fetch("http://localhost:8080/centroid"),
		concurrency,
	);

	for (let i = 0; i < testCount; i++) {
		fetchPromise()
			.then(({ duration }) => {
				if (duration > maxTime) {
					maxTime = duration;
					tester?.setMax(maxTime);
				}
				if (duration < minTime) {
					minTime = duration;
					tester?.setMin(minTime);
				}
				completedRequests++;
				tester?.setCount(completedRequests);
				const endTime = performance.now();
				const averageTime = (endTime - startTime) / completedRequests;
				tester?.setAverage(averageTime);
				if (completedRequests === testCount) {
					const totalTime = endTime - startTime;
					tester?.setResult(totalTime);
				}
			})
			.catch((error) => {
				tester?.setError(`Error: ${error.message}`);
			});
	}
}

function testGraphQLAPI(
	testCount: number,
	concurrency: number,
	tester: TesterRef | null,
) {
	const startTime = performance.now();
	let completedRequests = 0;
	let maxTime = 0;
	let minTime = Number.MAX_VALUE;

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

	const fetchPromise = getLimit(
		() =>
			fetch("http://localhost:8080/query", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ query }),
			}),
		concurrency,
	);

	for (let i = 0; i < testCount; i++) {
		fetchPromise()
			.then(({ duration }) => {
				if (duration > maxTime) {
					maxTime = duration;
					tester?.setMax(maxTime);
				}
				if (duration < minTime) {
					minTime = duration;
					tester?.setMin(minTime);
				}
				completedRequests++;
				tester?.setCount(completedRequests);
				const endTime = performance.now();
				const averageTime = (endTime - startTime) / completedRequests;
				tester?.setAverage(averageTime);
				if (completedRequests === testCount) {
					const totalTime = endTime - startTime;
					tester?.setResult(totalTime);
				}
			})
			.catch((error) => {
				tester?.setError(`Error: ${error.message}`);
			});
	}
}

const App = () => {
	const [testCount, setTestCount] = useState(1000);
	const [concurrency, setConcurrency] = useState(10);

	function clear() {
		restTest.current?.clear();
		graphqlTest.current?.clear();
	}

	const restTest = useRef<TesterRef>(null);
	const graphqlTest = useRef<TesterRef>(null);

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
			<div>
				Concurrency:{" "}
				<input
					value={concurrency}
					onChange={(e) => {
						setConcurrency(Number(e.target.value));
						clear();
					}}
				/>
			</div>
			<div style={{ display: "flex" }}>
				<div style={{ flex: "1 1 0" }}>
					<Tester
						title="REST"
						testCount={testCount}
						onTest={() => {
							restTest.current?.clear();
							testRestAPI(testCount, concurrency, restTest.current);
						}}
						ref={restTest}
					/>
				</div>
				<div style={{ flex: "1 1 0" }}>
					<Tester
						title="GraphQL"
						testCount={testCount}
						onTest={() => {
							graphqlTest.current?.clear();
							testGraphQLAPI(testCount, concurrency, graphqlTest.current);
						}}
						ref={graphqlTest}
					/>
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
						testRestAPI(testCount, concurrency, restTest.current);
						testGraphQLAPI(testCount, concurrency, graphqlTest.current);
					}}
				>
					Test together
				</button>
			</div>
		</div>
	);
};

export default App;
