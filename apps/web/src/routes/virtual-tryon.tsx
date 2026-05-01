import { PublicFooter } from "@/components/public-footer";
import { PublicNav } from "@/components/public-nav";
import { JewelleryTryon } from "@/components/tryon";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/virtual-tryon")({
	component: VirtualTryonPage,
});

const steps = [
	{
		n: "01",
		title: "Upload a jewellery image",
		desc: "Paste directly from Pinterest, Instagram, or any product page. Background is removed automatically.",
	},
	{
		n: "02",
		title: "Choose your body part",
		desc: "Earrings, necklaces, rings, and bracelets — each placed at the precise landmark by AI.",
	},
	{
		n: "03",
		title: "Try live or on your photo",
		desc: "Use your webcam for real-time try-on, or upload any photo of yourself for an instant result.",
	},
];

function VirtualTryonPage() {
	return (
		<div className="min-h-screen bg-[#FAFAF8] text-[#0D0D0B] dark:bg-[#0C0C0A] dark:text-[#F0F0EB]">
			<PublicNav />

			{/* ── Hero ── */}
			<section className="pt-32 pb-12 text-center px-6">
				<div className="inline-flex items-center gap-2 rounded-full border border-[#C4A84F]/30 px-4 py-1.5 text-[#C4A84F] text-[10px] tracking-[0.22em] uppercase mb-7">
					<span className="h-1 w-1 rounded-full bg-[#C4A84F]" />
					Free · No account needed
				</div>
				<h1 className="text-[42px] md:text-[64px] font-light leading-[1.08] tracking-[-0.025em] mb-5 max-w-2xl mx-auto">
					Try Before
					<br />
					<em className="not-italic text-[#C4A84F]">You Wear It</em>
				</h1>
				<p className="text-[16px] text-[#6B6B67] dark:text-[#888882] max-w-lg mx-auto leading-relaxed mb-8">
					Upload any jewellery image — from Pinterest, Instagram, or anywhere — and see exactly how it looks on you using your camera or a photo.
				</p>
				<div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-[#888882]">
					{["Works in your browser", "AI removes the background", "Live webcam or your photo", "Free to try"].map(t => (
						<span key={t} className="flex items-center gap-1.5 rounded-full border border-[#E5E5E0] px-3 py-1 dark:border-[#2A2A28]">
							<span className="h-1 w-1 rounded-full bg-[#C4A84F]" />{t}
						</span>
					))}
				</div>
			</section>

			{/* ── Try-On Component ── */}
			<section className="mx-auto max-w-6xl px-4 md:px-6 pb-16">
				<div className="rounded-3xl border border-[#E8E8E3] bg-white p-4 md:p-8 dark:border-[#1E1E1C] dark:bg-[#0D0D0B]">
					<JewelleryTryon />
				</div>
			</section>

			{/* ── How it works ── */}
			<section className="border-t border-[#E8E8E3] dark:border-[#1E1E1C] py-20 px-6">
				<div className="mx-auto max-w-4xl">
					<p className="mb-14 text-center text-[10px] tracking-[0.22em] text-[#BBBBB6] uppercase dark:text-[#555552]">
						How it works
					</p>
					<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
						{steps.map((s) => (
							<div key={s.n} className="flex flex-col gap-4">
								<span className="text-[32px] font-light text-[#C4A84F]/40 tabular-nums leading-none">{s.n}</span>
								<h3 className="text-[14px] font-medium">{s.title}</h3>
								<p className="text-[13px] leading-relaxed text-[#6B6B67] dark:text-[#666662]">{s.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── Upsell CTA ── */}
			<section className="bg-[#0D0D0B] dark:bg-[#080806] py-20 px-6 text-center">
				<p className="text-[10px] tracking-[0.22em] text-[#555552] uppercase mb-6">Love the try-on?</p>
				<h2 className="text-[32px] md:text-[46px] font-light text-[#F0F0EB] leading-tight tracking-[-0.02em] mb-4 max-w-xl mx-auto">
					Manage your entire jewellery business in one place
				</h2>
				<p className="text-[14px] text-[#888882] max-w-md mx-auto mb-10 leading-relaxed">
					Inventory, sales, purchasing, suppliers, reports — and your customers get the try-on experience built right in.
				</p>
				<div className="flex flex-wrap items-center justify-center gap-4">
					<Link
						to="/login"
						className="rounded-full bg-[#C4A84F] px-8 py-3.5 text-[13px] font-medium text-[#0D0D0B] transition-opacity hover:opacity-85"
					>
						Get Started Free
					</Link>
					<Link
						to="/"
						className="rounded-full border border-[#2A2A28] px-8 py-3.5 text-[13px] text-[#888882] transition-colors hover:border-[#555552] hover:text-[#F0F0EB]"
					>
						Learn More
					</Link>
				</div>
			</section>

			<PublicFooter />
		</div>
	);
}
