import { limitAsync } from "es-toolkit";
import { Metrics } from "./Metric";
import type { TesterRef } from "./Tester";

function getLimit<T>(callback: () => Promise<T>, concurrency: number) {
	return limitAsync(async () => {
		const startTime = performance.now();
		const response = await callback();
		const endTime = performance.now();
		const duration = endTime - startTime;
		return { response, duration };
	}, concurrency);
}

function getServerAppTiming(response: Response) {
	const serverTiming = response.headers.get("server-timing");
	return Number(serverTiming?.match(/app;dur=(\d*\.?\d*)/)?.[1] ?? 0);
}

export function testRestAPI(
	testCount: number,
	concurrency: number,
	tester: TesterRef | null,
) {
	const metric = new Metrics(tester);

	const fetchPromise = getLimit(
		() => fetch("http://localhost:8080/centroid"),
		concurrency,
	);

	for (let i = 0; i < testCount; i++) {
		fetchPromise()
			.then(({ response, duration }) => {
				metric.recordRequest(duration, getServerAppTiming(response), testCount);
			})
			.catch((error) => {
				tester?.setError(`Error: ${error.message}`);
			});
	}
}

export function testGraphQLAPI(
	testCount: number,
	concurrency: number,
	tester: TesterRef | null,
) {
	const metric = new Metrics(tester);

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
			.then(({ response, duration }) => {
				metric.recordRequest(duration, getServerAppTiming(response), testCount);
			})
			.catch((error) => {
				tester?.setError(`Error: ${error.message}`);
			});
	}
}
