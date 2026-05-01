import { LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

const TROY_OZ = 31.1035;
const TOLA_G  = 11.664;

type Filter   = "1D" | "7D" | "30D" | "1Y";
type Metal    = "gold" | "silver";
type Currency = "USD" | "NPR";

interface DataPoint { date: string; usdOz: number; usdTola: number; nprTola: number | null }

function buildDates(filter: Filter): string[] {
	const today = new Date();
	const cfg: Record<Filter, { days: number; step: number }> = {
		"1D":  { days: 2,   step: 1 },
		"7D":  { days: 7,   step: 1 },
		"30D": { days: 30,  step: 1 },
		"1Y":  { days: 365, step: 7 },
	};
	const { days, step } = cfg[filter];
	const out: string[] = [];
	for (let i = days - 1; i >= 0; i -= step) {
		const d = new Date(today);
		d.setDate(d.getDate() - i);
		out.push(d.toISOString().slice(0, 10));
	}
	return out;
}

async function fetchHistory(dates: string[], metal: Metal): Promise<DataPoint[]> {
	const key = metal === "gold" ? "xau" : "xag";
	const results = await Promise.all(
		dates.map(async (date): Promise<DataPoint | null> => {
			try {
				const r = await fetch(
					`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${date}/v1/currencies/usd.json`,
					{ signal: AbortSignal.timeout(8000) },
				);
				const json = await r.json();
				const raw = json?.usd?.[key];
				if (!raw) return null;
				const usdOz   = 1 / raw;
				const usdTola = usdOz / TROY_OZ * TOLA_G;
				const nprRate = json?.usd?.npr ?? null;
				return { date, usdOz, usdTola, nprTola: nprRate ? usdTola * nprRate : null };
			} catch {
				return null;
			}
		}),
	);
	return results.filter((r): r is DataPoint => r !== null);
}

function useDarkMode() {
	const [dark, setDark] = useState(
		() => typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
	);
	useEffect(() => {
		const obs = new MutationObserver(() =>
			setDark(document.documentElement.classList.contains("dark")),
		);
		obs.observe(document.documentElement, { attributeFilter: ["class"] });
		return () => obs.disconnect();
	}, []);
	return dark;
}

export function PriceChart() {
	const isDark = useDarkMode();
	const ref    = useRef<HTMLDivElement>(null);
	const inst   = useRef<echarts.ECharts | null>(null);

	const [filter,   setFilter]   = useState<Filter>("30D");
	const [metal,    setMetal]    = useState<Metal>("gold");
	const [currency, setCurrency] = useState<Currency>("USD");

	const { data, isFetching } = useQuery({
		queryKey: ["price-chart", filter, metal],
		queryFn:  () => fetchHistory(buildDates(filter), metal),
		staleTime: 10 * 60_000,
		gcTime:    60 * 60_000,
	});

	// Init / destroy
	useEffect(() => {
		if (!ref.current) return;
		inst.current = echarts.init(ref.current, undefined, { renderer: "canvas" });
		const ro = new ResizeObserver(() => inst.current?.resize());
		ro.observe(ref.current);
		return () => { ro.disconnect(); inst.current?.dispose(); };
	}, []);

	// Render chart
	useEffect(() => {
		if (!inst.current || !data?.length) return;

		const color  = metal === "gold" ? "#C4A84F" : "#8FA0B4";
		const dim    = isDark ? "#888882" : "#9B9B97";
		const gridC  = isDark ? "#1E1E1C" : "#F0F0EB";
		const bg     = isDark ? "#141412" : "#FAFAF8";
		const fg     = isDark ? "#F0F0EB" : "#0D0D0B";
		const border = isDark ? "#2A2A28" : "#E8E8E3";

		const values = data.map(p =>
			currency === "USD" ? p.usdOz : (p.nprTola ?? p.usdTola),
		);
		const labels = data.map(p => p.date);

		const fmt = (v: number) =>
			currency === "USD"
				? `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
				: `NPR ${Math.round(v).toLocaleString("en-US")}`;

		inst.current.setOption(
			{
				backgroundColor: "transparent",
				grid: { left: 14, right: 14, top: 10, bottom: 28, containLabel: true },
				xAxis: {
					type: "category",
					data: labels,
					boundaryGap: false,
					axisLine: { lineStyle: { color: gridC } },
					axisTick: { show: false },
					axisLabel: {
						color: dim,
						fontSize: 10,
						interval: Math.max(0, Math.floor(labels.length / 6) - 1),
					},
					splitLine: { show: false },
				},
				yAxis: {
					type: "value",
					position: "right",
					axisLine: { show: false },
					axisTick: { show: false },
					axisLabel: {
						color: dim,
						fontSize: 10,
						formatter: (v: number) =>
							currency === "USD"
								? `$${(v / 1000).toFixed(1)}k`
								: `${Math.round(v / 1000)}k`,
					},
					splitLine: { lineStyle: { color: gridC, type: "dashed" as const } },
				},
				tooltip: {
					trigger: "axis",
					backgroundColor: bg,
					borderColor: border,
					padding: [10, 14],
					textStyle: { color: fg, fontSize: 12 },
					axisPointer: { lineStyle: { color: color + "70", width: 1 } },
					formatter(params: Array<{ name: string; value: number }>) {
						const p = params[0];
						return (
							`<div style="font-size:10px;color:${dim};margin-bottom:4px">${p.name}</div>` +
							`<div style="font-weight:500;color:${fg}">${fmt(p.value)}</div>`
						);
					},
				},
				series: [
					{
						type: "line",
						data: values,
						smooth: 0.3,
						symbol: "none",
						sampling: "lttb",
						lineStyle: { color, width: 1.5 },
						areaStyle: {
							color: {
								type: "linear",
								x: 0, y: 0, x2: 0, y2: 1,
								colorStops: [
									{ offset: 0, color: color + "38" },
									{ offset: 1, color: color + "00" },
								],
							},
						},
					},
				],
			},
			true,
		);
	}, [data, currency, metal, isDark]);

	const FILTERS:    Filter[]   = ["1D", "7D", "30D", "1Y"];
	const METALS:     Metal[]    = ["gold", "silver"];
	const CURRENCIES: Currency[] = ["USD", "NPR"];

	return (
		<div>
			{/* ── Controls ─────────────────────────────────────────────────── */}
			<div className="mb-5 flex flex-wrap items-center justify-between gap-3">
				{/* Metal tabs */}
				<div className="flex overflow-hidden rounded-full border border-[#E5E5E0] dark:border-[#2A2A28]">
					{METALS.map((m) => (
						<button
							key={m}
							onClick={() => setMetal(m)}
							className={`px-5 py-1.5 text-[11px] font-medium transition-colors ${
								metal === m
									? "bg-[#C4A84F] text-white"
									: "text-[#888882] hover:text-[#0D0D0B] dark:hover:text-[#F0F0EB]"
							}`}
						>
							{m === "gold" ? "Gold" : "Silver"}
						</button>
					))}
				</div>

				<div className="flex items-center gap-3">
					{/* Currency toggle */}
					<div className="flex overflow-hidden rounded border border-[#E5E5E0] dark:border-[#2A2A28]">
						{CURRENCIES.map((c) => (
							<button
								key={c}
								onClick={() => setCurrency(c)}
								className={`px-3 py-1.5 text-[10px] font-medium transition-colors ${
									currency === c
										? "bg-[#0D0D0B] text-[#F0F0EB] dark:bg-[#F0F0EB] dark:text-[#0D0D0B]"
										: "text-[#888882] hover:text-[#0D0D0B] dark:hover:text-[#F0F0EB]"
								}`}
							>
								{c}
							</button>
						))}
					</div>

					{/* Time filters */}
					<div className="flex gap-0.5">
						{FILTERS.map((f) => (
							<button
								key={f}
								onClick={() => setFilter(f)}
								className={`rounded px-3 py-1.5 text-[11px] font-medium transition-colors ${
									filter === f
										? "bg-[#C4A84F]/15 text-[#C4A84F]"
										: "text-[#888882] hover:text-[#0D0D0B] dark:hover:text-[#F0F0EB]"
								}`}
							>
								{f}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* ── Chart ────────────────────────────────────────────────────── */}
			<div className="relative h-72">
				{isFetching && (
					<div className="absolute inset-0 z-10 flex items-center justify-center bg-[#FAFAF8]/60 dark:bg-[#0C0C0A]/60">
						<div className="h-5 w-5 animate-spin rounded-full border-2 border-[#C4A84F] border-t-transparent" />
					</div>
				)}
				<div ref={ref} className="h-full w-full" />
			</div>

			<p className="mt-2 text-right text-[10px] text-[#ADADAA]">
				{currency === "NPR" ? "NPR per tola" : "USD per troy oz"} · fawazahmed0 CDN
				{filter === "1Y" && " · weekly intervals"}
			</p>
		</div>
	);
}
