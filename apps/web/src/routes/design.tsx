import { PublicFooter } from "@/components/public-footer";
import { PublicNav } from "@/components/public-nav";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/design")({
	component: DesignPage,
});

const traditions = [
	{
		name: "Taar Kaam",
		subtitle: "Filigree Wirework",
		desc: "One of Nepal's most celebrated techniques. Ultra-fine threads of gold or silver are twisted, coiled, and soldered to form intricate lace-like patterns. Originated in Patan (Lalitpur) and passed down through generations of Newar goldsmith families.",
		detail: "Common in: pendants, earrings, temple jewellery",
	},
	{
		name: "Tewa",
		subtitle: "Repoussé & Chasing",
		desc: "Metal is hammered from the reverse side to create three-dimensional raised reliefs, then refined from the front using chasing tools. Used extensively in ritual and devotional jewellery depicting deities, lotus flowers, and sacred animals.",
		detail: "Common in: ritual bowls, temple ornaments, deity crowns",
	},
	{
		name: "Kolam",
		subtitle: "Granulation",
		desc: "Microscopic spheres of the same metal are fused onto a surface without visible solder, creating rich textured patterns. This ancient technique demands extraordinary precision and temperature control — a true mark of master craftsmanship.",
		detail: "Common in: high-end rings, ceremonial pieces, heirloom jewellery",
	},
	{
		name: "Dhaka Motifs",
		subtitle: "Woven Pattern Adaptation",
		desc: "Inspired by Nepal's iconic Dhaka textile (handwoven fabric with geometric patterns), these motifs are translated into metal through engraving and inlay work. A bridge between textile and jewellery traditions.",
		detail: "Common in: bangles, belt buckles, contemporary cuffs",
	},
	{
		name: "Thangka Iconography",
		subtitle: "Sacred Symbolism",
		desc: "Drawing from Nepal's rich tradition of Thangka paintings, jewellery incorporates the Ashtamangala (Eight Auspicious Symbols): Lotus, Endless Knot, Dharma Wheel, Conch Shell, Parasol, Golden Fish, Treasure Vase, and Victory Banner.",
		detail: "Common in: pendants, prayer beads, devotional rings",
	},
	{
		name: "Pagan Kaam",
		subtitle: "Lost-Wax Casting",
		desc: "The ancient Cire Perdue method — a wax model is encased in clay, fired to remove the wax, then filled with molten metal. Nepal's craftsmen in Patan have refined this technique over 1,500 years to produce sculptures and jewellery of extraordinary detail.",
		detail: "Common in: figurines, statement pendants, complex rings",
	},
];

const motifs = [
	{ symbol: "☸", name: "Dharma Chakra", meaning: "The Wheel of Law — completeness, eternity" },
	{ symbol: "✿", name: "Kamala (Lotus)", meaning: "Purity arising from impermanence" },
	{ symbol: "∞", name: "Endless Knot", meaning: "Interdependence, wisdom, compassion" },
	{ symbol: "♦", name: "Vajra (Thunderbolt)", meaning: "Indestructibility, divine power" },
	{ symbol: "⊕", name: "Surya (Sun)", meaning: "Life, energy, sovereignty" },
	{ symbol: "☽", name: "Chandra (Moon)", meaning: "Serenity, fertility, time" },
];

function DesignPage() {
	return (
		<div className="min-h-screen bg-[#FAFAF8] text-[#0D0D0B] dark:bg-[#0C0C0A] dark:text-[#F0F0EB]">
			<PublicNav />

			{/* Hero */}
			<section className="flex flex-col items-center justify-center px-6 pb-16 pt-40 text-center">
				<p className="mb-4 text-[10px] tracking-[0.22em] uppercase text-[#C4A84F]">
					Design Heritage
				</p>
				<h1 className="mb-5 max-w-2xl text-[46px] font-light leading-[1.1] tracking-[-0.02em] md:text-[60px]">
					Crafted in the Heart of Nepal
				</h1>
				<p className="max-w-[460px] text-[16px] leading-relaxed text-[#6B6B67] dark:text-[#888882]">
					Patan — the silversmithing capital of the Himalayas — has been home to master metalworkers for over fifteen centuries. Every tradition below is still alive in our workshops today.
				</p>
			</section>

			{/* Traditions */}
			<section className="mx-auto max-w-5xl px-6 pb-24">
				<p className="mb-12 text-[10px] tracking-[0.22em] uppercase text-[#ADADAA]">
					Techniques & Traditions
				</p>
				<div className="space-y-0 divide-y divide-[#E8E8E3] dark:divide-[#1E1E1C]">
					{traditions.map((t, i) => (
						<div key={t.name} className="grid grid-cols-1 gap-4 py-10 md:grid-cols-[200px_1fr]">
							<div>
								<span className="text-[11px] font-medium tracking-[0.1em] uppercase text-[#C4A84F]">
									0{i + 1}
								</span>
								<h3 className="mt-2 text-[18px] font-medium">{t.name}</h3>
								<p className="mt-1 text-[12px] text-[#888882]">{t.subtitle}</p>
							</div>
							<div>
								<p className="text-[14px] leading-relaxed text-[#6B6B67] dark:text-[#888882]">
									{t.desc}
								</p>
								<p className="mt-4 text-[11px] tracking-wide text-[#ADADAA]">
									{t.detail}
								</p>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* Sacred motifs */}
			<section className="border-t border-[#E8E8E3] dark:border-[#1E1E1C]">
				<div className="mx-auto max-w-5xl px-6 py-24">
					<p className="mb-12 text-[10px] tracking-[0.22em] uppercase text-[#ADADAA]">
						Sacred Motifs
					</p>
					<div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-6">
						{motifs.map((m) => (
							<div key={m.name} className="text-center">
								<span className="block text-[28px] text-[#C4A84F]">{m.symbol}</span>
								<p className="mt-2 text-[12px] font-medium">{m.name}</p>
								<p className="mt-1 text-[11px] leading-snug text-[#888882]">
									{m.meaning}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Patan highlight */}
			<section className="border-t border-[#E8E8E3] dark:border-[#1E1E1C]">
				<div className="mx-auto max-w-5xl px-6 py-24">
					<div className="grid grid-cols-1 gap-12 md:grid-cols-2">
						<div>
							<p className="mb-4 text-[10px] tracking-[0.22em] uppercase text-[#ADADAA]">
								Our Origin
							</p>
							<h2 className="mb-5 text-[32px] font-light leading-[1.1] tracking-[-0.02em]">
								Patan — Where Metal Becomes Art
							</h2>
							<p className="text-[14px] leading-relaxed text-[#6B6B67] dark:text-[#888882]">
								Patan Durbar Square is listed as a UNESCO World Heritage Site, not just for its temples, but for the living metalworking tradition that surrounds them. The Shakya and Tamrakar communities of Patan have been the custodians of this craft since the Licchavi era (4th–9th century CE).
							</p>
							<p className="mt-4 text-[14px] leading-relaxed text-[#6B6B67] dark:text-[#888882]">
								Today, workshops in alleys just off Mangal Bazaar still produce pieces using tools and techniques that would be recognisable to their ancestors — while also embracing CAD design, precision casting, and international gemology standards.
							</p>
						</div>
						<div className="space-y-4">
							{[
								["1,500+", "Years of continuous metalworking tradition in Patan"],
								["UNESCO", "World Heritage Site — Patan Durbar Square"],
								["NBSM", "National hallmarking by Nepal Bureau of Standards & Metrology"],
								["NGSDA", "Daily gold and silver rates set by Nepal dealers' association"],
							].map(([stat, label]) => (
								<div
									key={stat}
									className="flex items-start gap-4 rounded-xl border border-[#E8E8E3] p-5 dark:border-[#1E1E1C]"
								>
									<span className="text-[18px] font-medium text-[#C4A84F]">{stat}</span>
									<p className="text-[13px] leading-snug text-[#6B6B67] dark:text-[#888882]">
										{label}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="border-t border-[#E8E8E3] dark:border-[#1E1E1C]">
				<div className="mx-auto max-w-5xl px-6 py-24 text-center">
					<h2 className="mb-4 text-[32px] font-light tracking-[-0.02em]">
						Commission a Custom Design
					</h2>
					<p className="mb-8 text-[15px] text-[#6B6B67] dark:text-[#888882]">
						Work directly with Patan craftsmen to create a piece rooted in Nepal's heritage.
					</p>
					<div className="flex flex-wrap justify-center gap-4">
						<Link
							to="/process"
							className="inline-block rounded-full border border-[#D5D5D0] px-8 py-3.5 text-[13px] text-[#6B6B67] transition-colors duration-200 hover:border-[#0D0D0B] hover:text-[#0D0D0B] dark:border-[#2A2A28] dark:text-[#888882] dark:hover:border-[#F0F0EB] dark:hover:text-[#F0F0EB]"
						>
							See Our Process
						</Link>
						<Link
							to="/login"
							className="inline-block rounded-full bg-[#0D0D0B] px-8 py-3.5 text-[13px] font-medium text-white transition-opacity duration-200 hover:opacity-80 dark:bg-[#F0F0EB] dark:text-[#0C0C0A]"
						>
							Get Started
						</Link>
					</div>
				</div>
			</section>

			<PublicFooter />
		</div>
	);
}
