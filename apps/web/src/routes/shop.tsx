import { PublicFooter } from "@/components/public-footer";
import { PublicNav } from "@/components/public-nav";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/shop")({
	component: ShopPage,
});

const categories = [
	{
		icon: "◈",
		title: "Gold Jewellery",
		desc: "24K fine gold to 14K everyday pieces — rings, necklaces, bangles, and earrings crafted by Newari artisans.",
		href: "/metals",
	},
	{
		icon: "◇",
		title: "Silver Jewellery",
		desc: "925 sterling and fine silver — from Patan's legendary silversmiths to contemporary minimalist designs.",
		href: "/metals",
	},
	{
		icon: "◉",
		title: "Diamond Pieces",
		desc: "Ethically sourced diamonds set by certified craftsmen. Solitaires, halos, and pavé collections.",
		href: "/stones",
	},
	{
		icon: "◌",
		title: "Ruby & Precious Gems",
		desc: "Pigeon-blood rubies, Burmese sapphires, and emeralds set in traditional and modern designs.",
		href: "/stones",
	},
	{
		icon: "◎",
		title: "Traditional Nepali",
		desc: "Taar Kaam filigree, Tewa repoussé, and auspicious motifs rooted in centuries of Himalayan heritage.",
		href: "/design",
	},
	{
		icon: "◫",
		title: "Custom Commissions",
		desc: "Bring your vision to life. Work directly with master craftsmen to create a one-of-a-kind heirloom.",
		href: "/process",
	},
];

const reasons = [
	{
		title: "Heritage Craftsmanship",
		desc: "Nepal's Newar community has practiced fine metalwork for over a thousand years. Every piece carries that legacy.",
	},
	{
		title: "Hallmark Certified",
		desc: "All pieces are verified and hallmarked by the Nepal Bureau of Standards & Metrology (NBSM) for guaranteed purity.",
	},
	{
		title: "Transparent Pricing",
		desc: "Our pricing is based on daily metal rates from the Nepal Gold & Silver Dealers' Association — no hidden markups.",
	},
];

function ShopPage() {
	return (
		<div className="min-h-screen bg-[#FAFAF8] text-[#0D0D0B] dark:bg-[#0C0C0A] dark:text-[#F0F0EB]">
			<PublicNav />

			{/* Hero */}
			<section className="flex flex-col items-center justify-center px-6 pb-16 pt-40 text-center">
				<p className="mb-4 text-[10px] tracking-[0.22em] uppercase text-[#C4A84F]">
					Our Collection
				</p>
				<h1 className="mb-5 max-w-xl text-[46px] font-light leading-[1.1] tracking-[-0.02em] md:text-[60px]">
					Jewellery that tells a story
				</h1>
				<p className="max-w-[400px] text-[16px] leading-relaxed text-[#6B6B67] dark:text-[#888882]">
					Handcrafted in Kathmandu and Patan — where ancient technique meets contemporary vision.
				</p>
			</section>

			{/* Categories */}
			<section className="mx-auto max-w-5xl px-6 pb-24">
				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
					{categories.map((c) => (
						<Link
							key={c.title}
							to={c.href as "/"}
							className="group rounded-2xl border border-[#E8E8E3] p-8 transition-all duration-300 hover:border-[#C4A84F]/40 dark:border-[#1E1E1C] dark:hover:border-[#C4A84F]/30"
						>
							<span className="mb-5 block text-[20px] text-[#C4A84F]">{c.icon}</span>
							<h3 className="mb-2.5 text-[14px] font-medium">{c.title}</h3>
							<p className="text-[12px] leading-relaxed text-[#6B6B67] dark:text-[#666662]">
								{c.desc}
							</p>
							<span className="mt-5 block text-[11px] text-[#C4A84F] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
								Explore →
							</span>
						</Link>
					))}
				</div>
			</section>

			{/* Why Nepali Jewellery */}
			<section className="border-t border-[#E8E8E3] dark:border-[#1E1E1C]">
				<div className="mx-auto max-w-5xl px-6 py-24">
					<p className="mb-12 text-[10px] tracking-[0.22em] uppercase text-[#ADADAA]">
						Why Nepali Jewellery
					</p>
					<div className="grid grid-cols-1 gap-10 md:grid-cols-3">
						{reasons.map((r) => (
							<div key={r.title}>
								<h3 className="mb-3 text-[15px] font-medium">{r.title}</h3>
								<p className="text-[13px] leading-relaxed text-[#6B6B67] dark:text-[#888882]">
									{r.desc}
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
						Ready to manage your collection?
					</h2>
					<p className="mb-8 text-[15px] text-[#6B6B67] dark:text-[#888882]">
						Sign in to access inventory, billing, and analytics for your jewellery business.
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
