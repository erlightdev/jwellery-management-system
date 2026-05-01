import { PublicFooter } from "@/components/public-footer";
import { PublicNav } from "@/components/public-nav";
import { PriceChart } from "@/components/price-chart";
import { trpc, type RouterOutputs } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/rates")({
	component: RatesPage,
});

// ── Constants ─────────────────────────────────────────────────────────────────
const TROY_OZ   = 31.1035;
const TOLA_G    = 11.664;
const FAWAZ_URL = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json";

const UNIT_REFS = [
	{ label: "1 Tola",       eq: "= 11.664 grams" },
	{ label: "1 Troy Ounce", eq: "= 31.1035 grams" },
	{ label: "1 Tola",       eq: "= 0.3750 troy oz" },
	{ label: "1 Gram",       eq: "= 0.0858 tola" },
	{ label: "1 Kilogram",   eq: "= 85.735 tola" },
	{ label: "1 Troy Oz",    eq: "= 2.6667 tola" },
];

// ── Global market hook (fawazahmed0 CDN only) ─────────────────────────────────
interface FawazData { date: string; usd: Record<string, number> }

function useGlobalRates() {
	const fawaz = useQuery<FawazData>({
		queryKey: ["fawaz-usd"],
		queryFn: () => fetch(FAWAZ_URL).then((r) => r.json()),
		staleTime: 5 * 60_000,
		refetchInterval: 10 * 60_000,
	});

	const goldOz   = fawaz.data?.usd.xau ? 1 / fawaz.data.usd.xau : null;
	const silverOz = fawaz.data?.usd.xag ? 1 / fawaz.data.usd.xag : null;
	const nprRate  = fawaz.data?.usd.npr ?? null;

	const goldTolaUsd   = goldOz   ? goldOz   / TROY_OZ * TOLA_G : null;
	const silverTolaUsd = silverOz ? silverOz / TROY_OZ * TOLA_G : null;

	return {
		loading:   fawaz.isLoading,
		error:     fawaz.isError,
		metalDate: fawaz.data?.date,
		gold:   { perOz: goldOz,   perGram: goldOz   ? goldOz   / TROY_OZ : null, perTola: goldTolaUsd },
		silver: { perOz: silverOz, perGram: silverOz ? silverOz / TROY_OZ : null, perTola: silverTolaUsd },
		nprRate,
		goldNpr:   goldTolaUsd   && nprRate ? goldTolaUsd   * nprRate : null,
		silverNpr: silverTolaUsd && nprRate ? silverTolaUsd * nprRate : null,
	};
}

// ── UI helpers ────────────────────────────────────────────────────────────────
function Skeleton() {
	return <span className="inline-block h-4 w-20 animate-pulse rounded bg-[#E8E8E3] dark:bg-[#1E1E1C]" />;
}

function Usd({ v }: { v: number | null }) {
	if (v === null) return <Skeleton />;
	return <span>${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
}

function Npr({ v }: { v: number | null }) {
	if (v === null) return <Skeleton />;
	return <span>NPR {Math.round(v).toLocaleString("en-US")}</span>;
}

type BadgeState = "loading" | "live" | "error" | "stale";
function StatusBadge({ state, label }: { state: BadgeState; label?: string }) {
	const cfg: Record<BadgeState, { dot: string; text: string; border: string }> = {
		loading: { dot: "bg-[#ADADAA] animate-pulse", text: "text-[#ADADAA]", border: "border-[#E8E8E3] dark:border-[#2A2A28]" },
		live:    { dot: "bg-emerald-500",              text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-900" },
		error:   { dot: "bg-red-400",                  text: "text-red-400",   border: "border-red-200 dark:border-red-900" },
		stale:   { dot: "bg-amber-400",                text: "text-amber-500", border: "border-amber-200 dark:border-amber-900" },
	};
	const c = cfg[state];
	return (
		<span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] ${c.border} ${c.text}`}>
			<span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
			{label ?? (state === "loading" ? "Loading…" : state === "live" ? "Live" : state === "error" ? "Error" : "Cached")}
		</span>
	);
}

function Row({ label, right }: { label: React.ReactNode; right: React.ReactNode }) {
	return (
		<div className="flex items-center justify-between border-b border-[#F0F0EB] py-3 last:border-0 dark:border-[#1A1A18]">
			<span className="text-[12px] text-[#888882]">{label}</span>
			<span className="text-[13px] font-medium tabular-nums">{right}</span>
		</div>
	);
}

// ── Nepal rate display ────────────────────────────────────────────────────────
type NepalRateRow = NonNullable<RouterOutputs["metalRates"]["latest"]>;

function NepalRateCard({ rate, loading }: { rate: NepalRateRow | null | undefined; loading: boolean }) {
	const grades = [
		{ label: "Fine Gold (Shuddha Suna)", sub: "24K / 999",   value: rate?.goldHallmarkTola ?? null },
		{ label: "Tejabi",                    sub: "22K / 916",   value: rate?.goldTajabiTola ?? null },
		{ label: "Silver (Shuddha Chandi)",   sub: "999 / tola",  value: rate?.silverTola ?? null },
	];

	return (
		<div>
			{grades.map((g) => (
				<Row
					key={g.label}
					label={
						<span>
							{g.label}
							<span className="ml-1.5 text-[10px] text-[#ADADAA]">{g.sub}</span>
						</span>
					}
					right={loading ? <Skeleton /> : g.value != null ? <Npr v={g.value} /> : <span className="text-[#ADADAA]">—</span>}
				/>
			))}
			{rate?.goldHallmark10g != null && (
				<Row label={<span>Gold Hallmark <span className="ml-1.5 text-[10px] text-[#ADADAA]">per 10g</span></span>}
					right={<Npr v={rate.goldHallmark10g} />} />
			)}
			{rate?.silver10g != null && (
				<Row label={<span>Silver <span className="ml-1.5 text-[10px] text-[#ADADAA]">per 10g</span></span>}
					right={<Npr v={rate.silver10g} />} />
			)}
		</div>
	);
}

// ── Page ──────────────────────────────────────────────────────────────────────
function RatesPage() {
	const global = useGlobalRates();

	// Nepal rates — latest
	const latestNepal = useQuery(trpc.metalRates.latest.queryOptions());

	// Nepal rates — by date (controlled by date picker)
	const todayStr = new Date().toISOString().slice(0, 10);
	const [pickedDate, setPickedDate] = useState(todayStr);
	const byDate = useQuery(trpc.metalRates.byDate.queryOptions({ date: pickedDate }));

	// History table — last 14 days
	const history = useQuery(trpc.metalRates.history.queryOptions({ days: 14 }));

	const nepalStatus: BadgeState = latestNepal.isLoading
		? "loading"
		: latestNepal.isError
			? "error"
			: latestNepal.data
				? "live"
				: "stale";

	return (
		<div className="min-h-screen bg-[#FAFAF8] text-[#0D0D0B] dark:bg-[#0C0C0A] dark:text-[#F0F0EB]">
			<PublicNav />

			{/* Hero */}
			<section className="flex flex-col items-center justify-center px-6 pb-16 pt-40 text-center">
				<p className="mb-4 text-[10px] tracking-[0.22em] uppercase text-[#C4A84F]">Market Rates</p>
				<h1 className="mb-5 max-w-xl text-[46px] font-light leading-[1.1] tracking-[-0.02em] md:text-[60px]">
					Gold & Silver Rates
				</h1>
				<p className="max-w-[400px] text-[16px] leading-relaxed text-[#6B6B67] dark:text-[#888882]">
					Live global spot prices and official Nepal rates from Hamropatro — with full price history.
				</p>
			</section>

			{/* ── Global Spot ────────────────────────────────────────────────── */}
			<section className="mx-auto max-w-5xl px-6 pb-16">
				<div className="mb-6 flex items-center justify-between">
					<div>
						<p className="text-[10px] tracking-[0.22em] uppercase text-[#ADADAA]">Global</p>
						<h2 className="mt-1 text-[22px] font-light">International Spot Prices</h2>
					</div>
					<div className="flex flex-col items-end gap-1">
						<StatusBadge state={global.loading ? "loading" : global.error ? "error" : "live"} />
						{global.metalDate && <span className="text-[10px] text-[#ADADAA]">As of {global.metalDate}</span>}
					</div>
				</div>

				<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
					<div className="rounded-2xl border border-[#E8E8E3] p-6 dark:border-[#1E1E1C]">
						<div className="mb-4 flex items-center justify-between">
							<h3 className="text-[15px] font-medium">Gold (XAU)</h3>
							<span className="text-[11px] text-[#ADADAA]">fawazahmed0 CDN</span>
						</div>
						<Row label="Per Troy Ounce (31.1g)" right={<Usd v={global.gold.perOz} />} />
						<Row label="Per Gram"               right={<Usd v={global.gold.perGram} />} />
						<Row label="Per Tola (11.664g)"     right={<Usd v={global.gold.perTola} />} />
						<div className="my-1 border-t border-dashed border-[#E8E8E3] dark:border-[#1E1E1C]" />
						<Row
							label={<span>Per Tola <span className="ml-1 text-[#C4A84F]">NPR</span></span>}
							right={global.goldNpr != null
								? <span className="text-[#C4A84F]">NPR {Math.round(global.goldNpr).toLocaleString("en-US")}</span>
								: <Skeleton />}
						/>
					</div>
					<div className="rounded-2xl border border-[#E8E8E3] p-6 dark:border-[#1E1E1C]">
						<div className="mb-4 flex items-center justify-between">
							<h3 className="text-[15px] font-medium">Silver (XAG)</h3>
							<span className="text-[11px] text-[#ADADAA]">fawazahmed0 CDN</span>
						</div>
						<Row label="Per Troy Ounce (31.1g)" right={<Usd v={global.silver.perOz} />} />
						<Row label="Per Gram"               right={<Usd v={global.silver.perGram} />} />
						<Row label="Per Tola (11.664g)"     right={<Usd v={global.silver.perTola} />} />
						<div className="my-1 border-t border-dashed border-[#E8E8E3] dark:border-[#1E1E1C]" />
						<Row
							label={<span>Per Tola <span className="ml-1 text-[#C4A84F]">NPR</span></span>}
							right={global.silverNpr != null
								? <span className="text-[#C4A84F]">NPR {Math.round(global.silverNpr).toLocaleString("en-US")}</span>
								: <Skeleton />}
						/>
					</div>
				</div>

				{global.nprRate != null && (
					<p className="mt-3 text-right text-[11px] text-[#ADADAA]">
						1 USD = NPR{" "}
						<span className="font-medium text-[#0D0D0B] dark:text-[#F0F0EB]">{global.nprRate.toFixed(2)}</span>
						{global.metalDate && <> · as of {global.metalDate}</>}
						{" "}· fawazahmed0 CDN
					</p>
				)}
			</section>

			{/* ── Price Chart ───────────────────────────────────────────────── */}
			<section className="border-t border-[#E8E8E3] dark:border-[#1E1E1C]">
				<div className="mx-auto max-w-5xl px-6 py-14">
					<div className="mb-6 flex items-center justify-between">
						<div>
							<p className="text-[10px] tracking-[0.22em] uppercase text-[#ADADAA]">Chart</p>
							<h2 className="mt-1 text-[22px] font-light">International Price History</h2>
						</div>
					</div>
					<div className="rounded-2xl border border-[#E8E8E3] p-6 dark:border-[#1E1E1C]">
						<PriceChart />
					</div>
				</div>
			</section>

			{/* ── Nepal Official (Hamropatro) ────────────────────────────────── */}
			<section className="border-t border-[#E8E8E3] dark:border-[#1E1E1C]">
				<div className="mx-auto max-w-5xl px-6 py-16">
					<div className="mb-6 flex flex-wrap items-start justify-between gap-4">
						<div>
							<p className="text-[10px] tracking-[0.22em] uppercase text-[#ADADAA]">Nepal (NGSDA)</p>
							<h2 className="mt-1 text-[22px] font-light">Hamropatro Official Rates</h2>
							<p className="mt-1 text-[12px] text-[#888882]">
								Updated daily at 11:00 AM NPT · Source: hamropatro.com/gold
							</p>
						</div>
						<StatusBadge state={nepalStatus} label={nepalStatus === "live" ? "Official" : undefined} />
					</div>

					{latestNepal.data === null && !latestNepal.isLoading ? (
						<div className="rounded-xl border border-dashed border-[#C4A84F]/30 p-6">
							<p className="text-[13px] text-[#888882]">
								No Nepal rates stored yet. The server scrapes Hamropatro daily at 11:15 AM NPT. Rates will appear here after the first successful scrape.
							</p>
						</div>
					) : (
						<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
							<div className="rounded-2xl border border-[#E8E8E3] p-6 dark:border-[#1E1E1C]">
								<div className="mb-4 flex items-center justify-between">
									<h3 className="text-[15px] font-medium">Today's Rates — NPR per Tola</h3>
								</div>
								<NepalRateCard rate={latestNepal.data} loading={latestNepal.isLoading} />
								{latestNepal.data?.date && (
									<p className="mt-4 text-[11px] text-[#ADADAA]">
										Rate date: {latestNepal.data.date} · Scraped:{" "}
										{new Date(latestNepal.data.scrapedAt).toLocaleTimeString()}
									</p>
								)}
							</div>

							{/* Date picker */}
							<div className="rounded-2xl border border-[#E8E8E3] p-6 dark:border-[#1E1E1C]">
								<div className="mb-4 flex items-center justify-between">
									<h3 className="text-[15px] font-medium">Look Up a Past Date</h3>
								</div>
								<input
									type="date"
									value={pickedDate}
									max={todayStr}
									onChange={(e) => setPickedDate(e.target.value)}
									className="mb-5 w-full rounded-lg border border-[#E5E5E0] bg-transparent px-3 py-2 text-[13px] text-[#0D0D0B] focus:outline-none focus:ring-1 focus:ring-[#C4A84F]/50 dark:border-[#2A2A28] dark:text-[#F0F0EB]"
								/>
								{byDate.isLoading ? (
									<div className="space-y-3">
										{[0, 1, 2].map((i) => <Skeleton key={i} />)}
									</div>
								) : byDate.data ? (
									<NepalRateCard rate={byDate.data} loading={false} />
								) : (
									<p className="text-[13px] text-[#888882]">
										No rates stored for {pickedDate}. Rates are collected from the day the server first ran.
									</p>
								)}
							</div>
						</div>
					)}
				</div>
			</section>

			{/* ── History Table ──────────────────────────────────────────────── */}
			<section className="border-t border-[#E8E8E3] dark:border-[#1E1E1C]">
				<div className="mx-auto max-w-5xl px-6 py-16">
					<p className="mb-8 text-[10px] tracking-[0.22em] uppercase text-[#ADADAA]">Price History</p>

					{history.isLoading ? (
						<div className="space-y-2">
							{[...Array(5)].map((_, i) => (
								<div key={i} className="h-10 animate-pulse rounded-lg bg-[#E8E8E3] dark:bg-[#1E1E1C]" />
							))}
						</div>
					) : !history.data?.length ? (
						<p className="text-[13px] text-[#888882]">
							No history yet — the server collects one entry per day starting from today.
						</p>
					) : (
						<div className="overflow-hidden rounded-2xl border border-[#E8E8E3] dark:border-[#1E1E1C]">
							{/* Table header */}
							<div className="grid grid-cols-[110px_1fr_1fr_1fr] gap-3 border-b border-[#E8E8E3] bg-[#F5F5F0] px-5 py-2.5 text-[10px] tracking-widest uppercase text-[#ADADAA] dark:border-[#1E1E1C] dark:bg-[#141412]">
								<span>Date</span>
								<span>Gold Hallmark / tola</span>
								<span>Gold Tejabi / tola</span>
								<span>Silver / tola</span>
							</div>

							{history.data.map((r, i) => (
								<div
									key={r?.id}
									className={`grid grid-cols-[110px_1fr_1fr_1fr] gap-3 px-5 py-3.5 text-[13px] ${i < (history.data?.length ?? 0) - 1 ? "border-b border-[#E8E8E3] dark:border-[#1E1E1C]" : ""} ${i === 0 ? "font-medium" : ""}`}
								>
									<span className="tabular-nums text-[#888882]">{r?.date}</span>
									<span className="tabular-nums">
										{r?.goldHallmarkTola != null
											? `NPR ${Math.round(r.goldHallmarkTola).toLocaleString()}`
											: "—"}
									</span>
									<span className="tabular-nums">
										{r?.goldTajabiTola != null
											? `NPR ${Math.round(r.goldTajabiTola).toLocaleString()}`
											: "—"}
									</span>
									<span className="tabular-nums">
										{r?.silverTola != null
											? `NPR ${Math.round(r.silverTola).toLocaleString()}`
											: "—"}
									</span>
								</div>
							))}
						</div>
					)}
				</div>
			</section>

			{/* ── Unit Reference ─────────────────────────────────────────────── */}
			<section className="border-t border-[#E8E8E3] dark:border-[#1E1E1C]">
				<div className="mx-auto max-w-5xl px-6 py-14">
					<p className="mb-6 text-[10px] tracking-[0.22em] uppercase text-[#ADADAA]">Unit Reference</p>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
						{UNIT_REFS.map((u) => (
							<div key={u.label + u.eq} className="rounded-xl border border-[#E8E8E3] px-4 py-3 dark:border-[#1E1E1C]">
								<p className="text-[13px] font-medium">{u.label}</p>
								<p className="mt-0.5 font-mono text-[11px] text-[#888882]">{u.eq}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="border-t border-[#E8E8E3] dark:border-[#1E1E1C]">
				<div className="mx-auto max-w-5xl px-6 py-20 text-center">
					<h2 className="mb-4 text-[28px] font-light tracking-[-0.02em]">
						Use live rates in your business
					</h2>
					<p className="mb-6 text-[14px] text-[#6B6B67] dark:text-[#888882]">
						The system auto-calculates jewellery prices from live metal rates — making, wastage, and stone charges included.
					</p>
					<Link
						to="/login"
						className="inline-block rounded-full bg-[#0D0D0B] px-8 py-3.5 text-[13px] font-medium text-white transition-opacity duration-200 hover:opacity-80 dark:bg-[#F0F0EB] dark:text-[#0C0C0A]"
					>
						Get Started
					</Link>
				</div>
			</section>

			<PublicFooter />
		</div>
	);
}
