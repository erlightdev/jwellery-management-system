import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@jewellery-management-system/ui/components/sidebar";
import type React from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { ThemeSwitcher } from "@/components/theme-switcher";

type DashboardShellProps = {
	children: React.ReactNode;
	title: string;
	description?: string;
	user?: {
		name?: string | null;
		email?: string | null;
		role?: string | null;
	};
	actions?: React.ReactNode;
};

export function DashboardShell({
	children,
	title,
	description,
	user,
	actions,
}: DashboardShellProps) {
	return (
		<SidebarProvider>
			<AppSidebar user={user} />
			<SidebarInset>
				<header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4">
					<div className="flex min-w-0 items-center gap-3">
						<SidebarTrigger />
						<div className="min-w-0">
							<h1 className="truncate font-semibold text-lg">{title}</h1>
							{description ? (
								<p className="truncate text-muted-foreground text-xs">
									{description}
								</p>
							) : null}
						</div>
					</div>
					<div className="flex shrink-0 items-center gap-2">
						{actions}
						<ThemeSwitcher />
						<div className="md:hidden">
							<ModeToggle />
						</div>
					</div>
				</header>
				<main className="min-h-0 flex-1 overflow-auto p-4 md:p-6">
					{children}
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
