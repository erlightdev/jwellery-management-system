import { PublicFooter } from "@/components/public-footer";
import { PublicNav } from "@/components/public-nav";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/process")({
	component: ProcessPage,
});

const steps = [
	{
		no: "01",
		title: "Consultation",
		desc: "We begin with a conversation — understanding your intent, occasion, and aesthetic. Metal choice, stone preferences, and budget are discussed to set a clear brief. For traditional Nepali pieces, we consult on the auspicious motifs most relevant to the wearer.",
		duration: "1–2 days",
	},
	{
		no: "02",
		title: "Design & Sketch",
		desc: "Our craftsmen produce hand-drawn sketches and, for complex pieces, 3D CAD renderings. Proportions, weight estimates, and stone placement are finalised. You see exactly what will be made before any metal is touched.",
		duration: "2–5 days",
	},
	{
		no: "03",
		title: "Wax Carving",
		desc: "Using the traditional Cire Perdue (lost-wax) method — practised in Patan since the Licchavi era — a master carves or sculpts the piece in jeweller's wax. This wax model becomes the exact negative of the final piece, capturing every fine detail.",
		duration: "1–4 days",
	},
	{
		no: "04",
		title: "Investment Casting",
		desc: "The wax model is encased in a silica investment mould, then fired in a kiln. As the wax melts out (Cire Perdue — 'lost wax'), the cavity left behind is filled with molten metal poured at precisely controlled temperatures. For Taar Kaam filigree, wires are formed directly instead.",
		duration: "1–2 days",
	},
	{
		no: "05",
		title: "Rough Finishing",
		desc: "Once cooled, the raw casting is removed from the mould. Sprues and casting flash are cut away. The piece is filed, hammered to refine shape, and checked against the original design. For Tewa repoussé work, chasing tools add surface relief at this stage.",
		duration: "1–3 days",
	},
	{
		no: "06",
		title: "Stone Setting",
		desc: "Diamonds, rubies, sapphires, and other precious gems are set by hand using bezel, prong, pavé, or channel techniques depending on the design. Nepal's gem-setters are known for their exceptional precision — a single pavé ring may take an entire day to set.",
		duration: "1–5 days",
	},
	{
		no: "07",
		title: "Polishing & Finishing",
		desc: "Multiple progressive stages — coarse abrasive to ultra-fine rouge — bring the metal to its final surface. Matte, satin, and mirror finishes are each achieved through different buffing techniques. Textured or oxidised areas are preserved by masking.",
		duration: "1–2 days",
	},
	{
		no: "08",
		title: "Hallmarking & Quality Check",
		desc: "The completed piece is submitted to the Nepal Bureau of Standards & Metrology (NBSM) for assay and hallmarking. The stamp certifies metal purity. A final quality inspection covers symmetry, stone security, clasp function, and finish consistency before delivery.",
		duration: "2–4 days",
	},
];

const values = [
	{
		title: "No Shortcuts",
		desc: "Every step is performed by hand. We don't use pre-made stampings or machine shortcuts that compromise character.",
	},
	{
		title: "Single Artisan",
		desc: "One craftsman follows your piece from wax to finish, ensuring consistency of vision and accountability.",
	},
	{
		title: "Open Workshop",
		desc: "Commission clients are welcome to visit our Patan workshop and witness their piece being made.",
	},
];

function ProcessPage() {
	return (
		<div className="min-h-screen bg-[#FAFAF8] text-[#0D0D0B] dark:bg-[#0C0C0A] dark:text-[#F0F0EB]">
			<PublicNav />

			{/* Hero */}
			<section className="flex flex-col items-center justify-center px-6 pb-16 pt-40 text-center">
				<p className="mb-4 text-[10px] tracking-[0.22em] uppercase text-[#C4A84F]">
					How We Work
				</p>
				<h1 className="mb-5 max-w-xl text-[46px] font-light leading-[1.1] tracking-[-0.02em] md:text-[60px]">
					From Raw Metal to Masterpiece
				</h1>
				<p className="max-w-[420px] text-[16px] leading-relaxed text-[#6B6B67] dark:text-[#888882]">
					Eight deliberate steps. Centuries of refined technique. Each piece made once, made right.
				</p>
			</section>

			{/* Steps */}
			<section className="mx-auto max-w-4xl px-6 pb-24">
				<div className="space-y-0 divide-y divide-[#E8E8E3] dark:divide-[#1E1E1C]">
					{steps.map((s) => (
						<div
							key={s.no}
							className="grid grid-cols-1 gap-4 py-10 md:grid-cols-[160px_1fr_120px]"
						>
							<div>
								<span className="text-[28px] font-extralight text-[#C4A84F]">{s.no}</span>
								<h3 className="mt-1 text-[16px] font-medium">{s.title}</h3>
							</div>
							<p className="text-[13px] leading-relaxed text-[#6B6B67] dark:text-[#888882] md:pr-8">
								{s.desc}
							</p>
							<div className="flex items-start">
								<span className="rounded-full border border-[#E8E8E3] px-3 py-1 text-[11px] text-[#ADADAA] dark:border-[#2A2A28]">
									{s.duration}
								</span>
							</div>
						</div>
					))}
				</div>

				<div className="mt-8 rounded-2xl border border-[#C4A84F]/25 bg-[#C4A84F]/5 p-6">
					<p className="text-[12px] leading-relaxed text-[#6B6B67] dark:text-[#888882]">
						<span className="font-medium text-[#C4A84F]">Typical total turnaround:</span>{" "}
						10–21 business days depending on complexity, stone availability, and NBSM hallmarking queue. Rush commissions are accommodated on a case-by-case basis.
					</p>
				</div>
			</section>

			{/* Values */}
			<section className="border-t border-[#E8E8E3] dark:border-[#1E1E1C]">
				<div className="mx-auto max-w-5xl px-6 py-24">
					<p className="mb-12 text-[10px] tracking-[0.22em] uppercase text-[#ADADAA]">
						Our Commitments
					</p>
					<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
						{values.map((v) => (
							<div key={v.title}>
								<h3 className="mb-3 text-[15px] font-medium">{v.title}</h3>
								<p className="text-[13px] leading-relaxed text-[#6B6B67] dark:text-[#888882]">
									{v.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="border-t border-[#E8E8E3] dark:border-[#1E1E1C]">
				<div className="mx-auto max-w-5xl px-6 py-24 text-center">
					<h2 className="mb-4 text-[32px] font-light tracking-[-0.02em]">
						Start your commission
					</h2>
					<p className="mb-8 text-[15px] text-[#6B6B67] dark:text-[#888882]">
						Create an account to begin the consultation process with our Patan craftsmen.
					</p>
					<div className="flex flex-wrap justify-center gap-4">
						<Link
							to="/design"
							className="inline-block rounded-full border border-[#D5D5D0] px-8 py-3.5 text-[13px] text-[#6B6B67] transition-colors duration-200 hover:border-[#0D0D0B] hover:text-[#0D0D0B] dark:border-[#2A2A28] dark:text-[#888882] dark:hover:border-[#F0F0EB] dark:hover:text-[#F0F0EB]"
						>
							View Design Traditions
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
