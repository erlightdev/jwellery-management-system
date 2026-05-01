import db from "@jewellery-management-system/db";
import { parse } from "node-html-parser";

function cleanPrice(raw: string | undefined): number | null {
	if (!raw) return null;
	const n = parseFloat(raw.replace(/,/g, "").trim());
	return isNaN(n) || n <= 0 ? null : n;
}

function priceFromLiText(text: string): number | null {
	// li text is like "Nrs.\n                    296,100.00"
	const m = text.match(/([\d,]+(?:\.\d+)?)\s*$/);
	return cleanPrice(m?.[1]);
}

export interface ScrapedRates {
	goldHallmarkTola: number | null;
	goldTajabiTola: number | null;
	silverTola: number | null;
	goldHallmark10g: number | null;
	goldTajabi10g: number | null;
	silver10g: number | null;
}

export async function scrapeHamroPatroGold(): Promise<ScrapedRates> {
	const res = await fetch("https://www.hamropatro.com/gold", {
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
			Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
		},
	});

	if (!res.ok) {
		throw new Error(`Hamropatro fetch failed: ${res.status} ${res.statusText}`);
	}

	const html = await res.text();
	const root = parse(html);

	// The page has <ul class="gold-silver"> with 12 alternating <li>s:
	// [0] label, [1] price, [2] label, [3] price, ... (6 pairs)
	// Order: Hallmark/tola, Tajabi/tola, Silver/tola, Hallmark/10g, Tajabi/10g, Silver/10g
	const ul = root.querySelector("ul.gold-silver");
	if (!ul) {
		throw new Error("Hamropatro: <ul class='gold-silver'> not found in page");
	}

	const items = ul.querySelectorAll("li");

	const rates: ScrapedRates = {
		goldHallmarkTola: priceFromLiText(items[1]?.text ?? ""),
		goldTajabiTola:   priceFromLiText(items[3]?.text ?? ""),
		silverTola:       priceFromLiText(items[5]?.text ?? ""),
		goldHallmark10g:  priceFromLiText(items[7]?.text ?? ""),
		goldTajabi10g:    priceFromLiText(items[9]?.text ?? ""),
		silver10g:        priceFromLiText(items[11]?.text ?? ""),
	};

	return rates;
}

export async function fetchAndStoreRates(): Promise<ScrapedRates> {
	// Compute today's date in Nepal Standard Time (UTC+5:45)
	const nowNPT = new Date(Date.now() + (5 * 60 + 45) * 60 * 1000);
	const today = new Date(
		Date.UTC(nowNPT.getUTCFullYear(), nowNPT.getUTCMonth(), nowNPT.getUTCDate()),
	);

	console.log(`[hamropatro] Scraping for ${today.toISOString().slice(0, 10)}…`);
	const rates = await scrapeHamroPatroGold();
	console.log("[hamropatro] Result:", rates);

	await db.metalRate.upsert({
		where: { date: today },
		create:  { date: today, ...rates, source: "hamropatro" },
		update:  { ...rates, scrapedAt: new Date() },
	});

	console.log("[hamropatro] Stored.");
	return rates;
}
