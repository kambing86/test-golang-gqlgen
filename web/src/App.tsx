import { useRef, useState } from "react";
import { testGraphQLAPI, testRestAPI } from "./api";
import Tester, { type TesterRef } from "./Tester";
import "./App.css";

const App = () => {
	const [testCount, setTestCount] = useState(1000);
	const [concurrency, setConcurrency] = useState(1);

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
