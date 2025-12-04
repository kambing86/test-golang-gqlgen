import React, { type ForwardedRef } from "react";

export interface TesterRef {
	setResult: (value: number) => void;
	setCount: (value: number) => void;
	setAverage: (value: number) => void;
	setRequestAvgTime: (value: number) => void;
	setServerAvgTime: (value: number) => void;
	setMax: (value: number) => void;
	setMin: (value: number) => void;
	setError: (value: string | null) => void;
	clear: () => void;
}

const Tester = React.forwardRef(
	(
		{
			title,
			testCount,
			onTest,
		}: {
			title: string;
			testCount: number;
			onTest: () => void;
		},
		ref: ForwardedRef<TesterRef>,
	) => {
		const [result, setResult] = React.useState<number>(0);
		const [count, setCount] = React.useState<number>(0);
		const [average, setAverage] = React.useState<number>(0);
		const [requestAvgTime, setRequestAvgTime] = React.useState<number>(0);
		const [serverAvgTime, setServerAvgTime] = React.useState<number>(0);
		const [max, setMax] = React.useState<number>(0);
		const [min, setMin] = React.useState<number>(0);
		const [error, setError] = React.useState<string | null>(null);
		if (ref && typeof ref !== "function" && ref.current == null) {
			ref.current = {
				setResult,
				setCount,
				setAverage,
				setRequestAvgTime,
				setServerAvgTime,
				setMax,
				setMin,
				setError,
				clear: () => {
					setResult(0);
					setCount(0);
					setAverage(0);
					setRequestAvgTime(0);
					setServerAvgTime(0);
					setMax(0);
					setMin(0);
					setError(null);
				},
			};
		}
		return (
			<>
				<div>{title}</div>
				<button type="button" onClick={() => onTest()}>
					Test {testCount} times
				</button>
				<div>
					{result
						? `Completed ${testCount} ${title} requests in ${result.toFixed(
								2,
							)} ms`
						: ""}
				</div>
				<div>Count: {count}</div>
				<div>Average: {average ? `${average.toFixed(2)} ms` : ""}</div>
				<div>
					Request Average:{" "}
					{requestAvgTime ? `${requestAvgTime.toFixed(2)} ms` : ""}
				</div>
				<div>
					Server Average:{" "}
					{serverAvgTime ? `${serverAvgTime.toFixed(2)} ms` : ""}
				</div>
				<div>Max: {max ? `${max.toFixed(2)} ms` : ""}</div>
				<div>Min: {min ? `${min.toFixed(2)} ms` : ""}</div>
				{error && <div style={{ color: "red" }}>{error}</div>}
			</>
		);
	},
);

export default Tester;
