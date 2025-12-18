import type { TesterRef } from "./Tester";

export class Metrics {
	private tester: TesterRef | null;
	private startTime: number;
	private completedRequests: number;
	private requestTotalTime: number;
	private requestMaxTime: number;
	private requestMinTime: number;
	private serverTotalTime: number;
	private serverMaxTime: number;
	private serverMinTime: number;

	constructor(tester: TesterRef | null) {
		this.tester = tester;
		this.startTime = performance.now();
		this.completedRequests = 0;
		this.requestTotalTime = 0;
		this.requestMaxTime = 0;
		this.requestMinTime = Number.MAX_VALUE;
		this.serverTotalTime = 0;
		this.serverMaxTime = 0;
		this.serverMinTime = Number.MAX_VALUE;
	}

	recordRequest(duration: number, serverAppTime: number, testCount: number) {
		if (duration > this.requestMaxTime) {
			this.requestMaxTime = duration;
			this.tester?.setRequestMaxTime(this.requestMaxTime);
		}
		if (duration < this.requestMinTime) {
			this.requestMinTime = duration;
			this.tester?.setRequestMinTime(this.requestMinTime);
		}
		if (serverAppTime > this.serverMaxTime) {
			this.serverMaxTime = serverAppTime;
			this.tester?.setServerMaxTime(this.serverMaxTime);
		}
		if (serverAppTime < this.serverMinTime) {
			this.serverMinTime = serverAppTime;
			this.tester?.setServerMinTime(this.serverMinTime);
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
