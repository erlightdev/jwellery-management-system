import { Button } from "@jewellery-management-system/ui/components/button";
import { cn } from "@jewellery-management-system/ui/lib/utils";
import { Monitor, Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme-provider";

const themes = [
	{ value: "light", label: "Light", icon: Sun },
	{ value: "dark", label: "Dark", icon: Moon },
	{ value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeSwitcher() {
	const { theme, setTheme } = useTheme();

	return (
		<div className="hidden items-center border bg-muted/40 p-0.5 md:flex">
			{themes.map((item) => {
				const Icon = item.icon;
				const isActive = theme === item.value;

				return (
					<Button
						key={item.value}
						type="button"
						variant="ghost"
						size="sm"
						className={cn(
							"h-7 gap-1.5 px-2 text-muted-foreground",
							isActive &&
								"bg-background text-foreground shadow-sm hover:bg-background",
						)}
						onClick={() => setTheme(item.value)}
					>
						<Icon className="size-3.5" />
						<span>{item.label}</span>
					</Button>
				);
			})}
		</div>
	);
}
