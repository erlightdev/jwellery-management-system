import { PublicFooter } from "@/components/public-footer";
import { PublicNav } from "@/components/public-nav";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/metals")({
	component: MetalsPage,
});

type Tab = "gold" | "silver";

const goldGrades = [
	{
		karat: "24K",
		fineness: "999",
		nepalName: "Shuddha Suna (Fine Gold)",
		desc: "Pure gold — 99.9% gold content. Too soft for most jewellery; used for bullion, investment coins, and ceremonial pieces. Sacred in Hindu and Buddhist ritual contexts.",
		uses: "Bullion bars, deity statues, religious coins",
		hardness: "Very Soft",
	},
	{
		karat: "22K",
		fineness: "916",
		nepalName: "Tejabi",
		desc: "The most popular grade for Nepali jewellery. 91.6% gold alloyed with silver and copper for durability. Rich warm colour. Standard for traditional bridal and festival jewellery.",
		uses: "Bridal sets, bangles, necklaces, traditional ornaments",
		hardness: "Soft",
	},
	{
		karat: "22K",
		fineness: "916",
		nepalName: "Ashal",
		desc: "A specific 22K variant with a distinct alloy composition producing a slightly different hue. Closely related to Tejabi but priced and classified separately in the Nepal market. Preferred in certain regional traditions.",
		uses: "Traditional earrings, rings, heirloom pieces",
		hardness: "Soft",
	},
	{
		karat: "18K",
		fineness: "750",
		nepalName: "Aadhha Suna",
		desc: "75% gold — the sweet spot between richness and durability. Suitable for stone-set jewellery where prong security matters. Popular for contemporary and western-style designs.",
		uses: "Diamond rings, stone-set pendants, daily wear",
		hardness: "Medium",
	},
	{
		karat: "14K",
		fineness: "585",
		nepalName: "Chhahari",
		desc: "58.5% gold — durable, affordable, and resistant to tarnish. Well-suited for daily-wear pieces and active lifestyles. Common in export jewellery markets.",
		uses: "Daily-wear rings, bracelets, sports jewellery",
		hardness: "Hard",
	},
];

const silverGrades = [
	{
		karat: "999",
		fineness: "999",
		nepalName: "Shuddha Chandi (Fine Silver)",
		desc: "99.9% pure silver. Brilliant white, highly reflective, extremely soft. Used for investment bars and specialty pieces. Prone to scratching in everyday use.",
		uses: "Bullion, speciality coins, sculptural pieces",
		hardness: "Very Soft",
	},
	{
		karat: "925",
		fineness: "925",
		nepalName: "Sterling Chandi",
		desc: "The international standard — 92.5% silver alloyed with copper. Strong enough for intricate Taar Kaam filigree and Tewa repoussé. Patan's silversmiths have worked with sterling for centuries.",
		uses: "Filigree, rings, pendants, cutlery, traditional ornaments",
		hardness: "Medium",
	},
	{
		karat: "800",
		fineness: "800",
		nepalName: "Assi Chandi",
		desc: "80% silver — continental European standard. Stronger and more tarnish-resistant. Less common in Nepal but used in some export markets and industrial silverwork.",
		uses: "Decorative ware, regional export pieces",
		hardness: "Hard",
	},
];

const goldFacts = [
	"Gold is considered sacred in Hinduism, associated with Goddess Lakshmi and prosperity.",
	"In Nepal, gold jewellery is an essential part of a bride's dowry (Daijo) and a symbol of family status.",
	"The Nepal Gold & Silver Dealers' Association (NGSDA) publishes official rates daily in Kathmandu.",
	"NBSM hallmarking stamps confirm purity: a sun mark for gold, a crescent for silver.",
];

const silverFacts = [
	"Patan (Lalitpur) is renowned as the silversmithing capital of the Himalayas.",
	"The Tamrakar and Shakya communities of Patan have been silver craftsmen since at least the 7th century CE.",
	"Silver is associated with the moon and purity in both Hindu and Buddhist traditions.",
	"Tibetan-influenced silver jewellery featuring turquoise inlay is widely made in the Kathmandu Valley.",
];

function HardnessDot({ level }: { level: string }) {
	const map: Record<string, number> = { "Very Soft": 1, Soft: 2, Medium: 3, Hard: 4 };
	const count = map[level] ?? 2;
	return (
		<div className="flex gap-1">
			{[1, 2, 3, 4].map((i) => (
				<span
					key={i}
					className={`h-1.5 w-1.5 rounded-full ${i <= count ? "bg-[#C4A84F]" : "bg-[#E8E8E3] dark:bg-[#2A2A28]"}`}
				/>
			))}
		</div>
	);
}

function MetalsPage() {
	const [tab, setTab] = useState<Tab>("gold");
	const grades = tab === "gold" ? goldGrades : silverGrades;
	const facts = tab === "gold" ? goldFacts : silverFacts;

	return (
		<div className="min-h-screen bg-[#FAFAF8] text-[#0D0D0B] dark:bg-[#0C0C0A] dark:text-[#F0F0EB]">
			<PublicNav />

			{/* Hero */}
			<section className="flex flex-col items-center justify-center px-6 pb-16 pt-40 text-center">
				<p className="mb-4 text-[10px] tracking-[0.22em] uppercase text-[#C4A84F]">
					Materials
				</p>
				<h1 className="mb-5 max-w-xl text-[46px] font-light leading-[1.1] tracking-[-0.02em] md:text-[60px]">
					Gold & Silver
				</h1>
				<p className="max-w-[400px] text-[16px] leading-relaxed text-[#6B6B67] dark:text-[#888882]">
					Understanding purity grades, Nepali naming conventions, and what each karat means for your jewellery.
				</p>
			</section>

			{/* Tab switcher */}
			<div className="flex justify-center px-6 pb-10">
				<div className="flex rounded-full border border-[#E5E5E0] p-1 dark:border-[#2A2A28]">
					{(["gold", "silver"] as Tab[]).map((t) => (
						<button
							key={t}
							type="button"
							onClick={() => setTab(t)}
							className={`rounded-full px-6 py-2 text-[12px] font-medium capitalize transition-all duration-200 ${
								tab === t
									? "bg-[#0D0D0B] text-white dark:bg-[#F0F0EB] dark:text-[#0C0C0A]"
									: "text-[#888882] hover:text-[#0D0D0B] dark:hover:text-[#F0F0EB]"
							}`}
						>
							{t}
						</button>
					))}
				</div>
			</div>

			{/* Grades table */}
			<section className="mx-auto max-w-5xl px-6 pb-24">
				<div className="overflow-hidden rounded-2xl border border-[#E8E8E3] dark:border-[#1E1E1C]">
					{/* Header */}
					<div className="grid grid-cols-[80px_1fr_120px_100px] gap-4 border-b border-[#E8E8E3] bg-[#F5F5F0] px-6 py-3 dark:border-[#1E1E1C] dark:bg-[#141412]">
						<span className="text-[10px] tracking-widest uppercase text-[#ADADAA]">Karat</span>
						<span className="text-[10px] tracking-widest uppercase text-[#ADADAA]">Name / Use</span>
						<span className="text-[10px] tracking-widest uppercase text-[#ADADAA]">Fineness</span>
						<span className="text-[10px] tracking-widest uppercase text-[#ADADAA]">Hardness</span>
					</div>

					{grades.map((g, i) => (
						<div
							key={g.karat + g.nepalName}
							className={`grid grid-cols-[80px_1fr_120px_100px] gap-4 px-6 py-6 ${
								i < grades.length - 1 ? "border-b border-[#E8E8E3] dark:border-[#1E1E1C]" : ""
							}`}
						>
							<div>
								<span className="text-[18px] font-light text-[#C4A84F]">{g.karat}</span>
							</div>
							<div>
								<p className="mb-1 text-[13px] font-medium">{g.nepalName}</p>
								<p className="mb-2 text-[12px] leading-relaxed text-[#6B6B67] dark:text-[#888882]">
									{g.desc}
								</p>
								<p className="text-[11px] text-[#ADADAA]">{g.uses}</p>
							</div>
							<div className="flex items-start">
								<span className="rounded-full border border-[#E8E8E3] px-3 py-1 text-[11px] font-mono text-[#888882] dark:border-[#2A2A28]">
									.{g.fineness}
								</span>
							</div>
							<div className="flex items-start pt-1">
								<HardnessDot level={g.hardness} />
							</div>
						</div>
					))}
				</div>
			</section>

			{/* Nepal context */}
			<section className="border-t border-[#E8E8E3] dark:border-[#1E1E1C]">
				<div className="mx-auto max-w-5xl px-6 py-24">
					<p className="mb-8 text-[10px] tracking-[0.22em] uppercase text-[#ADADAA]">
						Nepal Context
					</p>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{facts.map((f) => (
							<div
								key={f}
								className="flex gap-3 rounded-xl border border-[#E8E8E3] p-5 dark:border-[#1E1E1C]"
							>
								<span className="mt-0.5 text-[#C4A84F]">◈</span>
								<p className="text-[13px] leading-relaxed text-[#6B6B67] dark:text-[#888882]">{f}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="border-t border-[#E8E8E3] dark:border-[#1E1E1C]">
				<div className="mx-auto max-w-5xl px-6 py-20 text-center">
					<h2 className="mb-4 text-[28px] font-light tracking-[-0.02em]">
						See today's metal rates
					</h2>
					<p className="mb-6 text-[14px] text-[#6B6B67] dark:text-[#888882]">
						Live global and Nepal NGSDA rates — updated daily.
					</p>
					<Link
						to="/rates"
						className="inline-block rounded-full bg-[#0D0D0B] px-8 py-3.5 text-[13px] font-medium text-white transition-opacity duration-200 hover:opacity-80 dark:bg-[#F0F0EB] dark:text-[#0C0C0A]"
					>
						View Rates
					</Link>
				</div>
			</section>

			<PublicFooter />
		</div>
	);
}
