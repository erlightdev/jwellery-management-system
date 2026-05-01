import db from "@jewellery-management-system/db";
import { z } from "zod";
import { fetchAndStoreRates } from "../lib/hamropatro-scraper";
import { adminProcedure, publicProcedure, router } from "../index";

function toNum(d: unknown): number | null {
	if (d === null || d === undefined) return null;
	const n = Number(d);
	return isNaN(n) ? null : n;
}

function fmt(r: Awaited<ReturnType<typeof db.metalRate.findFirst>>) {
	if (!r) return null;
	return {
		id:               r.id,
		date:             r.date.toISOString().slice(0, 10),
		goldHallmarkTola: toNum(r.goldHallmarkTola),
		goldTajabiTola:   toNum(r.goldTajabiTola),
		silverTola:       toNum(r.silverTola),
		goldHallmark10g:  toNum(r.goldHallmark10g),
		goldTajabi10g:    toNum(r.goldTajabi10g),
		silver10g:        toNum(r.silver10g),
		source:           r.source,
		scrapedAt:        r.scrapedAt.toISOString(),
	};
}

export const metalRatesRouter = router({
	/** Most recent stored rate. */
	latest: publicProcedure.query(async () => {
		const row = await db.metalRate.findFirst({ orderBy: { date: "desc" } });
		return fmt(row);
	}),

	/** Rate for a specific YYYY-MM-DD date. */
	byDate: publicProcedure
		.input(z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
		.query(async ({ input }) => {
			const row = await db.metalRate.findFirst({
				where: { date: new Date(`${input.date}T00:00:00Z`) },
			});
			return fmt(row);
		}),

	/**
	 * History for the last N days (default 30, max 365).
	 * Sorted newest-first.
	 */
	history: publicProcedure
		.input(z.object({ days: z.number().int().min(1).max(365).default(30) }))
		.query(async ({ input }) => {
			const since = new Date();
			since.setUTCDate(since.getUTCDate() - input.days);
			since.setUTCHours(0, 0, 0, 0);
			const rows = await db.metalRate.findMany({
				where: { date: { gte: since } },
				orderBy: { date: "desc" },
			});
			return rows.map(fmt);
		}),

	/** Admin: trigger an on-demand scrape of Hamropatro. */
	scrapeNow: adminProcedure.mutation(async () => {
		const rates = await fetchAndStoreRates();
		return { ok: true, rates };
	}),
});
