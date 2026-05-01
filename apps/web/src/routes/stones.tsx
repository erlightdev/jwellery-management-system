import { PublicFooter } from "@/components/public-footer";
import { PublicNav } from "@/components/public-nav";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/stones")({
	component: StonesPage,
});

const stones = [
	{
		id: "diamond",
		name: "Diamond",
		symbol: "◆",
		origin: "South Africa, Russia, Botswana",
		nepalSignificance: "The Vajra (thunderbolt), made of diamond, is the most sacred symbol in Vajrayana Buddhism — synonymous with indestructibility.",
		color: "Colourless to fancy (yellow, pink, blue)",
		grading: [
			{ label: "Cut", desc: "The most important C. Determines sparkle — Excellent, Very Good, Good, Fair, Poor." },
			{ label: "Clarity", desc: "FL (Flawless) to I3 (Included). Eye-clean standard: VS2 or SI1." },
			{ label: "Color", desc: "D (colorless) to Z (light yellow). D–F is highest; G–J near-colorless and excellent value." },
			{ label: "Carat", desc: "Weight, not size. 1ct = 0.2g. Price increases disproportionately at milestone weights (0.5, 1.0, 2.0ct)." },
		],
		popular: ["Round Brilliant", "Princess", "Cushion", "Oval", "Emerald Cut"],
	},
	{
		id: "ruby",
		name: "Ruby",
		symbol: "◉",
		origin: "Myanmar (Mogok), Mozambique, Thailand",
		nepalSignificance: "Ruby (Manik/Padmaraga) is the gemstone of the Sun in Hindu astrology. Associated with passion, power, and protection. Used in deity crowns and auspicious jewellery.",
		color: "Red to pinkish-red. 'Pigeon blood' — pure vivid red with a hint of blue — is the most prized.",
		grading: [
			{ label: "Color", desc: "Pigeon blood (Mogok, Myanmar) is the benchmark. Vivid, saturated red without brown or orange tones." },
			{ label: "Clarity", desc: "Unlike diamonds, some inclusions are acceptable and expected. Silk (rutile needles) can indicate natural origin." },
			{ label: "Origin", desc: "Mogok rubies command a significant premium. Heat treatment is standard practice and disclosed." },
			{ label: "Carat", desc: "Fine rubies above 2ct are rarer than comparable diamonds. Prices escalate sharply with size." },
		],
		popular: ["Oval", "Cushion", "Round", "Cabochon (star ruby)"],
	},
	{
		id: "emerald",
		name: "Emerald",
		symbol: "◇",
		origin: "Colombia, Zambia, Brazil",
		nepalSignificance: "Panna (Emerald) is ruled by Mercury and is used in astrological rings for intellect, communication, and business. Common in Nepali gemstone jewellery markets.",
		color: "Green to bluish-green. Vivid, medium-dark saturation is ideal. Colombian emeralds are the benchmark.",
		grading: [
			{ label: "Color", desc: "The defining quality. Vivid green (Colombian) vs slightly bluish-green (Zambian). Both are highly valued." },
			{ label: "Clarity", desc: "Inclusions ('jardin' — garden) are expected and don't reduce value as severely as in diamonds. Clarity-enhanced stones are common." },
			{ label: "Origin", desc: "Colombian origin (Muzo, Chivor mines) commands a premium. Zambian emeralds are excellent value." },
			{ label: "Treatment", desc: "Cedar oil or resin filling of surface fractures is standard practice — always disclosed." },
		],
		popular: ["Emerald Cut", "Oval", "Cushion", "Cabochon"],
	},
	{
		id: "sapphire",
		name: "Sapphire",
		symbol: "◈",
		origin: "Sri Lanka (Ceylon), Kashmir, Myanmar, Madagascar",
		nepalSignificance: "Neelam (Blue Sapphire) is ruled by Saturn — one of the most powerful astrological gemstones in Vedic tradition. Worn for discipline, success, and focus.",
		color: "Blue is most famous, but sapphire comes in every colour except red (which is ruby). Padparadscha (pink-orange) is exceptionally rare.",
		grading: [
			{ label: "Color", desc: "Royal blue to cornflower blue is ideal. Kashmiris have a velvety, 'sleepy' quality unique to the origin." },
			{ label: "Origin", desc: "Kashmir (now nearly depleted) commands the highest premiums. Ceylon (Sri Lanka) and Burmese are next." },
			{ label: "Clarity", desc: "Eye-clean is standard. Star sapphires (asterism from rutile silk) are a distinct and valued category." },
			{ label: "Heat Treatment", desc: "The vast majority are heated to improve colour. Unheated sapphires with fine colour are extremely rare and valuable." },
		],
		popular: ["Oval", "Round", "Cushion", "Cabochon (star)"],
	},
	{
		id: "turquoise",
		name: "Turquoise",
		symbol: "◌",
		origin: "Iran (Persian), USA (Arizona), Tibet, China",
		nepalSignificance: "Deeply embedded in Tibetan and Nepali jewellery traditions for centuries. Turquoise (Firoza) is considered a protective stone. Tibetan-style silver settings with turquoise are iconic throughout the Himalayas.",
		color: "Sky blue to blue-green. 'Robin's egg' blue (Persian) is the benchmark. Matrix patterns vary from none to pronounced.",
		grading: [
			{ label: "Color", desc: "Even, saturated sky blue without matrix is most prized (Persian type). Blue-green is also popular." },
			{ label: "Stabilisation", desc: "Most turquoise is stabilised (resin-impregnated). Natural untreated high-quality turquoise is rare and expensive." },
			{ label: "Matrix", desc: "Spider web matrix patterns are fashionable in certain markets. Pure blue without matrix is more traditional." },
			{ label: "Origin", desc: "Persian (Iranian) and Tibetan turquoise are the most relevant origins for Nepali jewellery traditions." },
		],
		popular: ["Cabochon", "Freeform", "Oval", "Round"],
	},
	{
		id: "coral",
		name: "Red Coral",
		symbol: "◎",
		origin: "Mediterranean Sea, Japan, Taiwan",
		nepalSignificance: "Moonga (Red Coral) is the gemstone of Mars in Vedic astrology. Worn for courage, vitality, and overcoming obstacles. A staple of traditional Nepali and Tibetan ceremonial jewellery.",
		color: "Ox-blood red to pinkish-red (Sardinian). Deeper red is more prized.",
		grading: [
			{ label: "Color", desc: "Deep ox-blood red (Moro coral) is the finest. Even, deep colour without white veins is ideal." },
			{ label: "Clarity", desc: "No surface pits, cracks, or white streaks. Smooth, dense surface indicates quality." },
			{ label: "Shape", desc: "Natural branch coral is common in traditional settings. Cabochons and beads for rings and malas." },
			{ label: "Treatment", desc: "Most commercial coral is bleached or dyed. Natural, untreated ox-blood coral is rare." },
		],
		popular: ["Cabochon", "Bead (mala)", "Branch (traditional settings)", "Oval"],
	},
];

function StonesPage() {
	const [active, setActive] = useState("diamond");
	const stone = stones.find((s) => s.id === active) ?? stones[0];

	return (
		<div className="min-h-screen bg-[#FAFAF8] text-[#0D0D0B] dark:bg-[#0C0C0A] dark:text-[#F0F0EB]">
			<PublicNav />

			{/* Hero */}
			<section className="flex flex-col items-center justify-center px-6 pb-16 pt-40 text-center">
				<p className="mb-4 text-[10px] tracking-[0.22em] uppercase text-[#C4A84F]">
					Gemstones
				</p>
				<h1 className="mb-5 max-w-xl text-[46px] font-light leading-[1.1] tracking-[-0.02em] md:text-[60px]">
					Stones & Their Stories
				</h1>
				<p className="max-w-[420px] text-[16px] leading-relaxed text-[#6B6B67] dark:text-[#888882]">
					Grading, origins, and the significance of each gemstone in Nepali and Himalayan jewellery traditions.
				</p>
			</section>

			{/* Stone selector */}
			<div className="mx-auto max-w-5xl px-6 pb-6">
				<div className="flex flex-wrap gap-2">
					{stones.map((s) => (
						<button
							key={s.id}
							type="button"
							onClick={() => setActive(s.id)}
							className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] transition-all duration-200 ${
								active === s.id
									? "border-[#C4A84F] bg-[#C4A84F]/10 text-[#C4A84F]"
									: "border-[#E5E5E0] text-[#888882] hover:border-[#C4A84F]/40 hover:text-[#0D0D0B] dark:border-[#2A2A28] dark:hover:text-[#F0F0EB]"
							}`}
						>
							<span>{s.symbol}</span>
							{s.name}
						</button>
					))}
				</div>
			</div>

			{/* Stone detail */}
			<section className="mx-auto max-w-5xl px-6 pb-24">
				<div className="rounded-2xl border border-[#E8E8E3] dark:border-[#1E1E1C]">
					{/* Header */}
					<div className="border-b border-[#E8E8E3] p-8 dark:border-[#1E1E1C]">
						<div className="flex flex-wrap items-start justify-between gap-6">
							<div>
								<span className="block text-[36px] text-[#C4A84F]">{stone.symbol}</span>
								<h2 className="mt-2 text-[28px] font-light">{stone.name}</h2>
								<p className="mt-1 text-[12px] text-[#888882]">Origin: {stone.origin}</p>
							</div>
							<div className="max-w-sm rounded-xl border border-[#C4A84F]/20 bg-[#C4A84F]/5 p-5">
								<p className="mb-1 text-[10px] tracking-widest uppercase text-[#C4A84F]">
									Nepal Significance
								</p>
								<p className="text-[12px] leading-relaxed text-[#6B6B67] dark:text-[#888882]">
									{stone.nepalSignificance}
								</p>
							</div>
						</div>
						<p className="mt-5 text-[13px] leading-relaxed text-[#6B6B67] dark:text-[#888882]">
							<span className="font-medium text-[#0D0D0B] dark:text-[#F0F0EB]">Colour: </span>
							{stone.color}
						</p>
					</div>

					{/* Grading */}
					<div className="p-8">
						<p className="mb-6 text-[10px] tracking-[0.22em] uppercase text-[#ADADAA]">
							Grading Factors
						</p>
						<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
							{stone.grading.map((g) => (
								<div
									key={g.label}
									className="rounded-xl border border-[#E8E8E3] p-5 dark:border-[#1E1E1C]"
								>
									<p className="mb-1.5 text-[12px] font-medium text-[#C4A84F]">{g.label}</p>
									<p className="text-[12px] leading-relaxed text-[#6B6B67] dark:text-[#888882]">
										{g.desc}
									</p>
								</div>
							))}
						</div>

						<div className="mt-6">
							<p className="mb-3 text-[10px] tracking-[0.22em] uppercase text-[#ADADAA]">
								Popular Cuts / Shapes
							</p>
							<div className="flex flex-wrap gap-2">
								{stone.popular.map((p) => (
									<span
										key={p}
										className="rounded-full border border-[#E8E8E3] px-3 py-1 text-[11px] text-[#888882] dark:border-[#2A2A28]"
									>
										{p}
									</span>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>

			<PublicFooter />
		</div>
	);
}
