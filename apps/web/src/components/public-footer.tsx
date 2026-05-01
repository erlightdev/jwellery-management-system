import { Link } from "@tanstack/react-router";

const cols = [
	{
		heading: "Explore",
		links: [
			{ to: "/shop", label: "Shop" },
			{ to: "/design", label: "Design" },
			{ to: "/process", label: "Process" },
			{ to: "/rates", label: "Rates" },
		],
	},
	{
		heading: "Materials",
		links: [
			{ to: "/metals", label: "Gold & Silver" },
			{ to: "/stones", label: "Gemstones" },
		],
	},
	{
		heading: "Legal",
		links: [
			{ to: "/terms", label: "Terms & Conditions" },
			{ to: "/privacy", label: "Privacy Policy" },
		],
	},
];

export function PublicFooter() {
	return (
		<footer className="border-t border-[#E8E8E3] dark:border-[#1E1E1C]">
			<div className="mx-auto max-w-5xl px-6 py-14">
				<div className="grid grid-cols-2 gap-10 md:grid-cols-4">
					{/* Brand */}
					<div>
						<span className="text-[11px] font-semibold tracking-[0.28em] uppercase text-[#0D0D0B] dark:text-[#F0F0EB]">
							Luminos
						</span>
						<p className="mt-3 text-[12px] leading-relaxed text-[#888882]">
							A modern jewellery management system rooted in Nepali craftsmanship.
						</p>
					</div>

					{/* Link columns */}
					{cols.map((col) => (
						<div key={col.heading}>
							<p className="mb-4 text-[10px] font-medium tracking-[0.18em] uppercase text-[#ADADAA]">
								{col.heading}
							</p>
							<ul className="space-y-2.5">
								{col.links.map((l) => (
									<li key={l.to}>
										<Link
											to={l.to as "/"}
											className="text-[12px] text-[#888882] transition-colors duration-200 hover:text-[#0D0D0B] dark:hover:text-[#F0F0EB]"
										>
											{l.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				<div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-[#E8E8E3] pt-6 dark:border-[#1E1E1C] sm:flex-row sm:items-center">
					<span className="text-[11px] text-[#ADADAA]">
						© {new Date().getFullYear()} Luminos Jewellery Management. All rights reserved.
					</span>
					<span className="text-[11px] text-[#ADADAA]">
						Crafted with care in Nepal
					</span>
				</div>
			</div>
		</footer>
	);
}
