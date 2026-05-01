import { fetchAndStoreRates } from "@jewellery-management-system/api/lib/hamropatro-scraper";
import cron from "node-cron";

/**
 * Hamropatro publishes Nepal gold/silver rates daily at ~11:00 AM NPT.
 * Nepal Standard Time (NPT) = UTC+5:45
 * 11:15 AM NPT = 05:30 UTC  →  cron "30 5 * * *"
 * Retry at 12:15 PM NPT     = 06:30 UTC  →  cron "30 6 * * *"
 */
export function startRateScheduler(): void {
	cron.schedule("30 5 * * *", async () => {
		console.log("[rate-scheduler] 11:15 AM NPT — scraping Hamropatro…");
		await fetchAndStoreRates().catch((err) =>
			console.error("[rate-scheduler] Primary scrape failed:", err),
		);
	});

	cron.schedule("30 6 * * *", async () => {
		console.log("[rate-scheduler] Retry 12:15 PM NPT");
		await fetchAndStoreRates().catch((err) =>
			console.error("[rate-scheduler] Retry scrape failed:", err),
		);
	});

	console.log("[rate-scheduler] Ready — daily at 11:15 AM & 12:15 PM NPT");
}
