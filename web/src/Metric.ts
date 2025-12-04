import type { TesterRef } from "./Tester";

export class Metrics {
	private tester: TesterRef | null;
	private startTime: number;
	private completedRequests: number;
	private requestTotalTime: number;
	private serverTotalTime: number;
	private maxTime: number;
	private minTime: number;

	constructor(tester: TesterRef | null) {
		this.tester = tester;
		this.startTime = performance.now();
		this.completedRequests = 0;
		this.requestTotalTime = 0;
		this.serverTotalTime = 0;
		this.maxTime = 0;
		this.minTime = Number.MAX_VALUE;
	}

	recordRequest(duration: number, serverAppTime: number, testCount: number) {
		if (duration > this.maxTime) {
			this.maxTime = duration;
			this.tester?.setMax(this.maxTime);
		}
		if (duration < this.minTime) {
			this.minTime = duration;
			this.tester?.setMin(this.minTime);
		}
		this.completedRequests++;
		this.tester?.setCount(this.completedRequests);
		const endTime = performance.now();
		const averageTime = (endTime - this.startTime) / this.completedRequests;
		this.tester?.setAverage(averageTime);
		this.requestTotalTime += duration;
		const requestAverageTime = this.requestTotalTime / this.completedRequests;
		this.tester?.setRequestAvgTime(requestAverageTime);
		this.serverTotalTime += serverAppTime;
		const serverAverageTime = this.serverTotalTime / this.completedRequests;
		this.tester?.setServerAvgTime(serverAverageTime);
		if (this.completedRequests === testCount) {
			this.tester?.setResult(endTime - this.startTime);
		}
	}
}
