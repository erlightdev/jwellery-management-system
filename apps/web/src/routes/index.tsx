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

			{/* ── Bento Grid ── */}
				<BentoSection />

				{/* ── Try-On Feature Section ── */}
				<TryOnSection />

				<PublicFooter />
			</div>
		);
}

function BentoSection() {
	const sectionRef = useRef<HTMLElement>(null);

	useEffect(() => {
		const el = sectionRef.current;
		if (!el) return;
		const targets = el.querySelectorAll<HTMLElement>(".js-bento");
		targets.forEach(t => { t.style.opacity = "0"; t.style.transform = "translateY(20px)"; });
		const obs = new IntersectionObserver(
			(entries) => {
				if (!entries[0].isIntersecting) return;
				obs.disconnect();
				let delay = 0;
				targets.forEach(t => {
					setTimeout(() => {
						t.style.transition = "opacity 0.6s ease, transform 0.6s ease";
						t.style.opacity = "1";
						t.style.transform = "translateY(0)";
					}, delay);
					delay += 75;
				});
			},
			{ threshold: 0.08 },
		);
		obs.observe(el);
		return () => obs.disconnect();
	}, []);

	return (
		<section ref={sectionRef} className="mx-auto max-w-5xl px-6 pb-32 pt-4">
			<p className="mb-12 text-center text-[10px] tracking-[0.22em] text-[#BBBBB6] uppercase dark:text-[#555552]">
				Built for every part of your business
			</p>
			<div className="grid grid-cols-2 gap-3 md:grid-cols-4">

				{/* Live Metal Rates — 2×2 */}
				<div className="js-bento col-span-2 row-span-2 rounded-2xl border border-[#E8E8E3] bg-white p-6 dark:border-[#1E1E1C] dark:bg-[#0D0D0B]">
					<div className="flex items-center justify-between">
						<span className="text-[9px] font-medium tracking-[0.18em] uppercase text-[#ADADAA]">Live Metal Rates</span>
						<span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[9px] text-green-600 dark:bg-green-950/30 dark:text-green-400">
							<span className="h-1 w-1 animate-pulse rounded-full bg-green-500" />live
						</span>
					</div>
					<div className="mt-5">
						<div className="flex items-baseline gap-2">
							<span className="text-[28px] font-light tracking-tight text-[#0D0D0B] dark:text-[#F0F0EB]">12,480</span>
							<span className="text-[11px] text-[#888882]">NPR / tola</span>
						</div>
						<div className="mt-0.5 flex items-center gap-2">
							<span className="text-[11px] font-medium text-[#C4A84F]">Au 24K Gold</span>
							<span className="rounded-full bg-green-50 px-1.5 text-[9px] text-green-600 dark:bg-green-950/30 dark:text-green-400">+0.42%</span>
						</div>
					</div>
					<svg viewBox="0 0 220 68" className="mt-5 w-full" aria-hidden>
						<defs>
							<linearGradient id="bentoGoldGrad" x1="0" x2="0" y1="0" y2="1">
								<stop offset="0%" stopColor="#C4A84F" stopOpacity="0.25" />
								<stop offset="100%" stopColor="#C4A84F" stopOpacity="0" />
							</linearGradient>
						</defs>
						<path d="M0,52 C15,48 25,50 40,44 C55,38 65,42 80,36 C95,30 105,34 120,26 C135,18 145,22 160,16 C175,10 195,14 220,8" stroke="#C4A84F" strokeWidth="1.5" fill="none" strokeLinecap="round" />
						<path d="M0,52 C15,48 25,50 40,44 C55,38 65,42 80,36 C95,30 105,34 120,26 C135,18 145,22 160,16 C175,10 195,14 220,8 L220,68 L0,68Z" fill="url(#bentoGoldGrad)" />
						<circle cx="220" cy="8" r="2.5" fill="#C4A84F" />
					</svg>
					<div className="mt-4 flex items-center justify-between rounded-xl border border-[#E8E8E3] px-4 py-3 dark:border-[#1E1E1C]">
						<div>
							<div className="text-[10px] text-[#ADADAA]">Ag Silver</div>
							<div className="mt-0.5 text-[16px] font-light text-[#0D0D0B] dark:text-[#F0F0EB]">
								NPR 148 <span className="text-[10px] text-[#888882]">/ gram</span>
							</div>
						</div>
						<span className="rounded-full bg-red-50 px-2 py-0.5 text-[9px] text-red-400 dark:bg-red-950/30">−0.18%</span>
					</div>
					<p className="mt-3 flex items-center gap-1.5 text-[9px] text-[#BBBBB6]">
						<svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
							<circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1" />
							<path d="M5 2.5V5l1.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
						</svg>
						Updated just now · Refreshes every 5 min
					</p>
				</div>

				{/* Sales & Invoicing */}
				<div className="js-bento rounded-2xl border border-[#E8E8E3] bg-white p-5 dark:border-[#1E1E1C] dark:bg-[#0D0D0B]">
					<span className="text-[9px] font-medium tracking-[0.18em] uppercase text-[#ADADAA]">Sales</span>
					<div className="mt-4 space-y-3">
						{[
							{ id: "INV-0024", amt: "NPR 45,200", paid: true },
							{ id: "INV-0023", amt: "NPR 18,750", paid: true },
							{ id: "INV-0022", amt: "NPR 92,000", paid: false },
						].map(inv => (
							<div key={inv.id} className="flex items-center justify-between gap-2">
								<span className="font-mono text-[10px] text-[#888882]">{inv.id}</span>
								<span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] ${inv.paid ? "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400" : "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"}`}>
									{inv.paid ? "Paid" : "Pending"}
								</span>
							</div>
						))}
					</div>
					<div className="mt-4 border-t border-[#E8E8E3] pt-2.5 dark:border-[#1E1E1C]">
						<span className="text-[9px] text-[#BBBBB6]">3 invoices today</span>
					</div>
				</div>

				{/* Customers */}
				<div className="js-bento rounded-2xl border border-[#E8E8E3] bg-white p-5 dark:border-[#1E1E1C] dark:bg-[#0D0D0B]">
					<span className="text-[9px] font-medium tracking-[0.18em] uppercase text-[#ADADAA]">Customers</span>
					<div className="mt-4 space-y-3">
						{[
							{ name: "Sita Sharma", tag: "VIP", color: "#C4A84F" },
							{ name: "Ram Thapa", tag: "Regular", color: "#888882" },
							{ name: "Gita Lama", tag: "New", color: "#6B9EC4" },
						].map(c => (
							<div key={c.name} className="flex items-center gap-2.5">
								<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-medium text-white" style={{ backgroundColor: c.color }}>
									{c.name[0]}
								</div>
								<span className="flex-1 text-[11px] text-[#0D0D0B] dark:text-[#F0F0EB]">{c.name}</span>
								<span className="text-[8px] text-[#ADADAA]">{c.tag}</span>
							</div>
						))}
					</div>
					<div className="mt-3 text-[9px] text-[#BBBBB6]">214 customers total</div>
				</div>

				{/* Inventory */}
				<div className="js-bento rounded-2xl border border-[#E8E8E3] bg-white p-5 dark:border-[#1E1E1C] dark:bg-[#0D0D0B]">
					<span className="text-[9px] font-medium tracking-[0.18em] uppercase text-[#ADADAA]">Inventory</span>
					<div className="mt-4 space-y-4">
						{[
							{ label: "Gold 24K", pct: 78, warn: false },
							{ label: "Silver", pct: 45, warn: false },
							{ label: "Gemstones", pct: 22, warn: true },
						].map(s => (
							<div key={s.label}>
								<div className="mb-1.5 flex justify-between">
									<span className="text-[10px] text-[#6B6B67]">{s.label}</span>
									<span className={`text-[9px] ${s.warn ? "text-red-400" : "text-[#888882]"}`}>{s.pct}%{s.warn ? " ⚠" : ""}</span>
								</div>
								<div className="h-1 rounded-full bg-[#F0F0EB] dark:bg-[#1E1E1C]">
									<div className="h-1 rounded-full" style={{ width: `${s.pct}%`, backgroundColor: s.warn ? "#F87171" : "#C4A84F" }} />
								</div>
							</div>
						))}
					</div>
					<div className="mt-4 text-[9px] text-[#BBBBB6]">142 SKUs tracked</div>
				</div>

				{/* Analytics & Reports */}
				<div className="js-bento rounded-2xl border border-[#E8E8E3] bg-white p-5 dark:border-[#1E1E1C] dark:bg-[#0D0D0B]">
					<span className="text-[9px] font-medium tracking-[0.18em] uppercase text-[#ADADAA]">Reports</span>
					<div className="mt-4 flex items-end gap-1" style={{ height: 56 }}>
						{[32, 48, 38, 62, 45, 70, 55].map((h, i) => (
							<div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, backgroundColor: "#C4A84F", opacity: 0.3 + i * 0.1 }} />
						))}
					</div>
					<div className="mt-1.5 flex">
						{["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
							<span key={i} className="flex-1 text-center text-[8px] text-[#BBBBB6]">{d}</span>
						))}
					</div>
					<div className="mt-3 border-t border-[#E8E8E3] pt-2.5 dark:border-[#1E1E1C]">
						<span className="text-[9px] text-green-500">+12% vs last week</span>
					</div>
				</div>

				{/* Suppliers & Purchases — 2col */}
				<div className="js-bento col-span-2 rounded-2xl border border-[#E8E8E3] bg-white p-5 dark:border-[#1E1E1C] dark:bg-[#0D0D0B]">
					<span className="text-[9px] font-medium tracking-[0.18em] uppercase text-[#ADADAA]">Suppliers & Purchases</span>
					<div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
						{[
							{ name: "Nepal Gold Trading Co.", meta: "Au 24K · 500g", status: "Delivered" },
							{ name: "Himalayan Gems Ltd.", meta: "Mixed · 120 pcs", status: "In Transit" },
							{ name: "Kathmandu Silver House", meta: "Ag 999 · 2 kg", status: "Pending" },
							{ name: "Diamond Imports Pvt.", meta: "Diamonds · 45 pcs", status: "Delivered" },
						].map(s => (
							<div key={s.name} className="flex items-start gap-2.5">
								<div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#F0F0EB] dark:bg-[#1E1E1C]">
									<span className="text-[8px] text-[#888882]">{s.name[0]}</span>
								</div>
								<div className="min-w-0 flex-1">
									<p className="truncate text-[10px] text-[#0D0D0B] dark:text-[#F0F0EB]">{s.name}</p>
									<p className="text-[9px] text-[#888882]">{s.meta}</p>
								</div>
								<span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] ${
									s.status === "Delivered" ? "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400" :
									s.status === "In Transit" ? "bg-blue-50 text-blue-500 dark:bg-blue-950/30 dark:text-blue-400" :
									"bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
								}`}>{s.status}</span>
							</div>
						))}
					</div>
				</div>

				{/* Calendar — 2col */}
				<div className="js-bento col-span-2 rounded-2xl border border-[#E8E8E3] bg-white p-5 dark:border-[#1E1E1C] dark:bg-[#0D0D0B]">
					<div className="flex items-center justify-between">
						<span className="text-[9px] font-medium tracking-[0.18em] uppercase text-[#ADADAA]">Upcoming</span>
						<span className="text-[11px] font-medium text-[#0D0D0B] dark:text-[#F0F0EB]">May 2026</span>
					</div>
					<div className="mt-4 grid grid-cols-7 gap-y-0.5 text-center">
						{["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(d => (
							<span key={d} className="py-1 text-[8px] text-[#BBBBB6]">{d}</span>
						))}
						{/* May 1 2026 = Friday → 4 empty offset cells */}
						{[..."    "].map((_, i) => <span key={`e${i}`} />)}
						{Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
							<div key={d} className={`mx-auto flex h-5 w-5 items-center justify-center rounded-full text-[9px] ${
								d === 1 ? "bg-[#C4A84F] font-medium text-white" :
								[5, 12, 20, 27].includes(d) ? "bg-[#C4A84F]/10 text-[#C4A84F]" :
								"text-[#888882]"
							}`}>{d}</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

// ── Bracelet + wrist UI mockup (pure CSS/SVG, no camera needed) ─────────────
function TryonMockup() {
	return (
		<div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#2A2A28] bg-[#0A0A08]">
			{/* Ambient background glow */}
			<div className="absolute inset-0 bg-gradient-to-br from-[#180a18] via-[#0a0a10] to-[#08080a]" />
			<div className="absolute -top-12 right-8 h-40 w-40 rounded-full bg-[#C4A84F]/5 blur-3xl" />

			{/* Wrist / forearm shape */}
			<div className="absolute bottom-0 left-1/2 -translate-x-1/2">
				<svg width="220" height="220" viewBox="0 0 220 220" fill="none" aria-hidden>
					{/* Forearm skin shape */}
					<path
						d="M 70 220 Q 65 160 68 120 Q 72 88 85 78 Q 100 70 120 72 Q 140 74 148 86 Q 158 100 155 130 Q 152 165 148 220 Z"
						fill="url(#skin)"
					/>
					{/* Fine arm hair lines */}
					<path d="M 90 120 Q 92 108 94 96" stroke="#8B6A50" strokeWidth="0.4" opacity="0.4" />
					<path d="M 105 114 Q 107 100 110 88" stroke="#8B6A50" strokeWidth="0.4" opacity="0.3" />
					<path d="M 120 118 Q 121 105 123 93" stroke="#8B6A50" strokeWidth="0.4" opacity="0.4" />
					<path d="M 134 124 Q 135 111 136 100" stroke="#8B6A50" strokeWidth="0.4" opacity="0.3" />

					{/* Gold bracelet C-shape */}
					<path
						d="M 72 138 Q 68 118 80 106 Q 96 92 118 92 Q 140 92 152 108 Q 160 120 156 138"
						stroke="#C4A84F"
						strokeWidth="7"
						fill="none"
						strokeLinecap="round"
					/>
					{/* Bracelet shine */}
					<path
						d="M 78 132 Q 75 116 85 104 Q 98 93 118 93"
						stroke="#E8D08A"
						strokeWidth="2"
						fill="none"
						strokeLinecap="round"
						opacity="0.6"
					/>
					{/* Bracelet shadow edge */}
					<path
						d="M 72 138 Q 68 118 80 106"
						stroke="#8B6A2A"
						strokeWidth="3"
						fill="none"
						strokeLinecap="round"
						opacity="0.5"
					/>

					{/* Landmark tracking dots */}
					<circle cx="110" cy="135" r="2.5" fill="#C4A84F" opacity="0.8" />
					<circle cx="90"  cy="130" r="1.5" fill="#C4A84F" opacity="0.5" />
					<circle cx="132" cy="132" r="1.5" fill="#C4A84F" opacity="0.5" />
					<circle cx="110" cy="92"  r="1.5" fill="#C4A84F" opacity="0.4" />

					<defs>
						<linearGradient id="skin" x1="68" y1="70" x2="158" y2="220" gradientUnits="userSpaceOnUse">
							<stop offset="0%"   stopColor="#C68642" />
							<stop offset="40%"  stopColor="#B5723A" />
							<stop offset="100%" stopColor="#8B5E3C" />
						</linearGradient>
					</defs>
				</svg>
			</div>

			{/* Detection badge */}
			<div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-[10px] text-white backdrop-blur-sm">
				<div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
				Hand detected
			</div>

			{/* Type selector chrome */}
			<div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 rounded-full border border-[#2A2A28] bg-black/50 px-2 py-1.5 backdrop-blur-sm">
				{["Earring", "Necklace", "Ring", "Bracelet"].map((t, i) => (
					<span key={t} className={`rounded-full px-2.5 py-0.5 text-[9px] font-medium transition-colors ${
						i === 3 ? "bg-[#C4A84F]/20 text-[#C4A84F]" : "text-[#555552]"
					}`}>{t}</span>
				))}
			</div>

			{/* Scale control chrome */}
			<div className="absolute top-3 left-3 flex items-center gap-2 rounded-full border border-[#2A2A28] bg-black/50 px-3 py-1.5 backdrop-blur-sm">
				<span className="text-[9px] text-[#555552]">Scale</span>
				<div className="h-px w-14 bg-[#2A2A28]">
					<div className="h-px w-8 bg-[#C4A84F]" />
				</div>
			</div>
		</div>
	);
}

function TryOnSection() {
	const sectionRef = useRef<HTMLElement>(null);

	useEffect(() => {
		const el = sectionRef.current;
		if (!el) return;
		const targets = el.querySelectorAll<HTMLElement>(".js-t");
		targets.forEach(t => { t.style.opacity = "0"; t.style.transform = "translateY(24px)"; });

		const obs = new IntersectionObserver(
			(entries) => {
				if (!entries[0].isIntersecting) return;
				obs.disconnect();
				let delay = 0;
				targets.forEach(t => {
					setTimeout(() => {
						t.style.transition = "opacity 0.65s ease, transform 0.65s ease";
						t.style.opacity    = "1";
						t.style.transform  = "translateY(0)";
					}, delay);
					delay += 110;
				});
			},
			{ threshold: 0.15 },
		);
		obs.observe(el);
		return () => obs.disconnect();
	}, []);

	return (
		<section ref={sectionRef} className="bg-[#0D0D0B] dark:bg-[#080806]">
			<div className="mx-auto max-w-5xl px-6 py-24">
				<div className="grid grid-cols-1 items-center gap-14 md:grid-cols-2">

					{/* Left: copy */}
					<div>
						<div className="js-t mb-6 inline-flex items-center gap-2 rounded-full border border-[#C4A84F]/25 px-3.5 py-1.5 text-[#C4A84F] text-[9px] tracking-[0.22em] uppercase">
							<span className="h-1 w-1 rounded-full bg-[#C4A84F]" />
							New feature
						</div>

						<h2 className="js-t mb-5 text-[38px] md:text-[50px] font-light text-[#F0F0EB] leading-[1.1] tracking-[-0.025em]">
							Virtual
							<br />
							<span className="text-[#C4A84F]">Try-On</span>
						</h2>

						<p className="js-t mb-8 text-[14px] text-[#888882] leading-relaxed max-w-sm">
							Customers pick a jewellery image from anywhere on the web, paste it in, and instantly see it on themselves — live from their camera or a photo they upload.
						</p>

						{/* Steps */}
						<div className="mb-10 space-y-4">
							{[
								{ step: "01", text: "Paste any jewellery photo — from Pinterest, Instagram, or any website" },
								{ step: "02", text: "AI removes the background automatically in seconds" },
								{ step: "03", text: "See it live on your face, wrist, finger, or neck" },
							].map(({ step, text }) => (
								<div key={step} className="js-t flex items-start gap-4">
									<span className="mt-0.5 shrink-0 text-[11px] tabular-nums text-[#C4A84F]/60 font-light">{step}</span>
									<span className="text-[13px] text-[#555552] leading-relaxed">{text}</span>
								</div>
							))}
						</div>

						<Link
							to="/virtual-tryon"
							className="js-t inline-flex items-center gap-2 rounded-full bg-[#C4A84F] px-7 py-3 text-[12px] font-medium text-[#0D0D0B] transition-opacity hover:opacity-85"
						>
							Try It Free
							<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
								<path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</Link>
					</div>

					{/* Right: UI mockup */}
					<div className="js-t">
						<TryonMockup />
						<p className="mt-3 text-center text-[10px] text-[#333330]">
							Works entirely in your browser · No data uploaded
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
