import { useTheme } from "@/components/theme-provider";
import { Link } from "@tanstack/react-router";
import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const navLinks = [
	{ to: "/shop" as const, label: "Shop" },
	{ to: "/design" as const, label: "Design" },
	{ to: "/process" as const, label: "Process" },
	{ to: "/rates" as const, label: "Rates" },
	{ to: "/virtual-tryon" as const, label: "Try On" },
];

function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	const cycle = () => {
		if (theme === "dark") setTheme("light");
		else if (theme === "light") setTheme("system");
		else setTheme("dark");
	};

	if (!mounted) return <div className="h-6 w-6" />;

	const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

	return (
		<button
			type="button"
			onClick={cycle}
			title={`Theme: ${theme}`}
			className="flex h-6 w-6 items-center justify-center rounded-full text-[#888882] transition-colors duration-200 hover:text-[#0D0D0B] dark:hover:text-[#F0F0EB]"
		>
			<Icon size={13} strokeWidth={1.5} />
		</button>
	);
}

interface PublicNavProps {
	/** Extra class on the pill — pass "js-nav" when a parent GSAP context animates it */
	pillClassName?: string;
	/** Alias kept for convenience — maps to pillClassName */
	className?: string;
}

export function PublicNav({ pillClassName, className }: PublicNavProps) {
	const extra = pillClassName ?? className;
	return (
		<nav className="fixed inset-x-0 top-5 z-50 flex justify-center px-4">
			<div
				className={[
					"flex items-center gap-1 rounded-full border border-[#E5E5E0] bg-white/85 px-5 py-2.5 backdrop-blur-md dark:border-[#2A2A28] dark:bg-[#0C0C0A]/85",
					extra,
				]
					.filter(Boolean)
					.join(" ")}
			>
				{/* Logo */}
				<Link
					to="/"
					className="text-[11px] font-semibold tracking-[0.28em] uppercase text-[#0D0D0B] dark:text-[#F0F0EB]"
				>
					Luminos
				</Link>

				<div className="mx-3 h-3 w-px bg-[#E0E0DB] dark:bg-[#2A2A28]" />

				{/* Nav links — hidden on mobile */}
				<div className="hidden items-center gap-1 md:flex">
					{navLinks.map((link) =>
						link.to === "/virtual-tryon" ? (
							<Link
								key={link.to}
								to={link.to}
								className="rounded-full bg-[#C4A84F]/10 px-3 py-1.5 text-[12px] text-[#C4A84F] transition-colors duration-200 hover:bg-[#C4A84F]/20"
							>
								✦ {link.label}
							</Link>
						) : (
							<Link
								key={link.to}
								to={link.to}
								className="rounded-full px-3 py-1.5 text-[12px] text-[#6B6B67] transition-colors duration-200 hover:bg-[#F0F0EB] hover:text-[#0D0D0B] dark:text-[#888882] dark:hover:bg-[#1E1E1C] dark:hover:text-[#F0F0EB]"
							>
								{link.label}
							</Link>
						)
					)}
				</div>

				<div className="mx-3 hidden h-3 w-px bg-[#E0E0DB] dark:bg-[#2A2A28] md:block" />

				{/* Theme toggle */}
				<ThemeToggle />

				<div className="mx-3 h-3 w-px bg-[#E0E0DB] dark:bg-[#2A2A28]" />

				{/* Auth links */}
				<Link
					to="/login"
					className="hidden text-[12px] text-[#6B6B67] transition-colors duration-200 hover:text-[#0D0D0B] dark:text-[#888882] dark:hover:text-[#F0F0EB] sm:block"
				>
					Sign In
				</Link>
				<Link
					to="/login"
					className="ml-2 rounded-full bg-[#0D0D0B] px-4 py-1.5 text-[11px] font-medium text-white transition-opacity duration-200 hover:opacity-80 dark:bg-[#F0F0EB] dark:text-[#0C0C0A]"
				>
					Get Started
				</Link>
			</div>
		</nav>
	);
}
