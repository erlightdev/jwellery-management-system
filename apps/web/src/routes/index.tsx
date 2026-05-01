import { PublicFooter } from "@/components/public-footer";
import { PublicNav } from "@/components/public-nav";
import { createFileRoute, Link } from "@tanstack/react-router";
import gsap from "gsap";
import { useEffect, useRef } from "react";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

const features = [
	{
		icon: "◈",
		title: "Product Catalogue",
		desc: "Manage jewellery with metal type, purity, weight, and multi-component pricing formulas.",
	},
	{
		icon: "◇",
		title: "Sales & Billing",
		desc: "Generate invoices, track partial payments, and monitor outstanding balances in real time.",
	},
	{
		icon: "◉",
		title: "Inventory & Reports",
		desc: "Live stock levels, low-stock alerts, and detailed analytics you can export instantly.",
	},
];

function GemSVG({ size = 160 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 160 160" fill="none" aria-hidden>
			<polygon
				points="80,12 148,58 126,148 34,148 12,58"
				stroke="#C4A84F"
				strokeWidth="1"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<line x1="80" y1="12" x2="80" y2="80" stroke="#C4A84F" strokeWidth="0.5" />
			<line x1="148" y1="58" x2="80" y2="80" stroke="#C4A84F" strokeWidth="0.5" />
			<line x1="12" y1="58" x2="80" y2="80" stroke="#C4A84F" strokeWidth="0.5" />
			<line x1="126" y1="148" x2="80" y2="80" stroke="#C4A84F" strokeWidth="0.5" />
			<line x1="34" y1="148" x2="80" y2="80" stroke="#C4A84F" strokeWidth="0.5" />
			<line x1="12" y1="58" x2="148" y2="58" stroke="#C4A84F" strokeWidth="0.5" />
		</svg>
	);
}

function HomeComponent() {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const ctx = gsap.context(() => {
			gsap.set(
				[".js-nav", ".js-badge", ".js-line", ".js-sub", ".js-cta", ".js-gem", ".js-card", ".js-scroll-hint"],
				{ autoAlpha: 0 },
			);
			gsap.set(".js-nav", { y: -14 });
			gsap.set([".js-badge", ".js-sub"], { y: 18 });
			gsap.set(".js-line", { y: 52 });
			gsap.set(".js-cta", { y: 14 });
			gsap.set(".js-gem", { scale: 0.8, rotation: -20 });
			gsap.set(".js-card", { y: 30 });

			gsap.to(".js-nav", { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.1 });

			gsap.to(".js-gem", {
				autoAlpha: 1, scale: 1, rotation: 0,
				duration: 1.5, ease: "back.out(1.2)", stagger: 0.18, delay: 0.25,
			});

			gsap.to(".js-badge", { autoAlpha: 1, y: 0, duration: 0.65, ease: "power3.out", delay: 0.45 });

			gsap.to(".js-line", {
				autoAlpha: 1, y: 0,
				duration: 1.05, stagger: 0.16, ease: "power3.out", delay: 0.62,
			});

			gsap.to(".js-sub", { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out", delay: 1.05 });

			gsap.to(".js-cta", {
				autoAlpha: 1, y: 0,
				duration: 0.65, stagger: 0.1, ease: "power2.out", delay: 1.25,
			});

			gsap.to(".js-scroll-hint", { autoAlpha: 1, duration: 0.8, ease: "power2.out", delay: 1.6 });

			gsap.to(".js-card", {
				autoAlpha: 1, y: 0,
				duration: 0.75, stagger: 0.14, ease: "power2.out", delay: 1.45,
			});

			gsap.to(".js-gem-1", { y: -18, duration: 3.4, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2.0 });
			gsap.to(".js-gem-2", { y: -10, duration: 4.2, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2.3 });
		}, containerRef);

		return () => ctx.revert();
	}, []);

	return (
		<div
			ref={containerRef}
			className="min-h-screen bg-[#FAFAF8] text-[#0D0D0B] selection:bg-[#C4A84F]/20 dark:bg-[#0C0C0A] dark:text-[#F0F0EB]"
		>
			{/* Nav — js-nav class is added via PublicNav's className prop for GSAP targeting */}
			<PublicNav className="js-nav" />

			{/* ── Hero ── */}
			<section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
				<div className="js-gem js-gem-1 pointer-events-none absolute right-[7%] top-[16%] select-none opacity-[0.12] dark:opacity-[0.15]">
					<GemSVG size={260} />
				</div>
				<div className="js-gem js-gem-2 pointer-events-none absolute bottom-[20%] left-[5%] select-none opacity-[0.07] dark:opacity-[0.08]">
					<GemSVG size={140} />
				</div>

				<div className="js-badge mb-8 inline-flex items-center gap-2.5 rounded-full border border-[#C4A84F]/30 px-4 py-1.5 text-[#C4A84F] text-[10px] tracking-[0.22em] uppercase">
					<span className="h-1 w-1 rounded-full bg-[#C4A84F]" />
					Jewellery Management System
				</div>

				<h1 className="mb-7 max-w-[640px]">
					<span className="js-line block text-[54px] font-light leading-[1.08] tracking-[-0.025em] md:text-[78px]">
						Craft. Curate.
					</span>
					<span className="js-line block text-[54px] font-light leading-[1.08] tracking-[-0.025em] md:text-[78px]">
						Command.
					</span>
				</h1>

				<p className="js-sub mb-10 max-w-[380px] text-[17px] leading-relaxed text-[#6B6B67] dark:text-[#888882]">
					A modern platform to manage your jewellery business — inventory,
					billing, and analytics in one place.
				</p>

				<div className="flex flex-wrap items-center justify-center gap-4">
					<Link
						to="/login"
						className="js-cta rounded-full bg-[#0D0D0B] px-8 py-3.5 text-[13px] font-medium text-white transition-opacity duration-200 hover:opacity-80 dark:bg-[#F0F0EB] dark:text-[#0C0C0A]"
					>
						Get Started
					</Link>
					<Link
						to="/login"
						className="js-cta rounded-full border border-[#D5D5D0] px-8 py-3.5 text-[13px] text-[#6B6B67] transition-colors duration-200 hover:border-[#0D0D0B] hover:text-[#0D0D0B] dark:border-[#2A2A28] dark:text-[#888882] dark:hover:border-[#F0F0EB] dark:hover:text-[#F0F0EB]"
					>
						Sign In
					</Link>
				</div>

				<div className="js-scroll-hint absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
					<span className="text-[9px] tracking-[0.22em] text-[#BBBBB6] uppercase dark:text-[#555552]">
						Scroll
					</span>
					<div className="h-8 w-px bg-gradient-to-b from-[#C4A84F]/35 to-transparent" />
				</div>
			</section>

			{/* ── Features ── */}
			<section className="mx-auto max-w-4xl px-6 pb-32 pt-4">
				<p className="mb-14 text-center text-[10px] tracking-[0.22em] text-[#BBBBB6] uppercase dark:text-[#555552]">
					Everything you need
				</p>
				<div className="grid grid-cols-1 gap-5 md:grid-cols-3">
					{features.map((f) => (
						<div
							key={f.title}
							className="js-card rounded-2xl border border-[#E8E8E3] p-8 transition-colors duration-300 hover:border-[#C4A84F]/40 dark:border-[#1E1E1C] dark:hover:border-[#C4A84F]/30"
						>
							<span className="mb-5 block text-[22px] text-[#C4A84F]">
								{f.icon}
							</span>
							<h3 className="mb-3 text-[14px] font-medium tracking-wide">
								{f.title}
							</h3>
							<p className="text-[13px] leading-relaxed text-[#6B6B67] dark:text-[#666662]">
								{f.desc}
							</p>
						</div>
					))}
				</div>
			</section>

			<PublicFooter />
		</div>
	);
}
