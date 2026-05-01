import {
	Avatar,
	AvatarFallback,
} from "@jewellery-management-system/ui/components/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@jewellery-management-system/ui/components/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@jewellery-management-system/ui/components/sidebar";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
	BarChart3,
	CalendarDays,
	ChevronsUpDown,
	Diamond,
	Home,
	LayoutDashboard,
	LogOut,
	Package,
	Receipt,
	ScanFace,
	Settings,
	Shield,
	ShoppingBag,
	Sparkles,
	Truck,
	Users,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
	user?: {
		name?: string | null;
		email?: string | null;
		role?: string | null;
	};
};

const navItems = [
	{ to: "/" as const, label: "Home", icon: Home },
	{ to: "/dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
	{ to: "/products" as const, label: "Products", icon: Package },
	{ to: "/inventory" as const, label: "Inventory", icon: Sparkles },
	{ to: "/sales" as const, label: "Sales Billing", icon: Receipt },
	{ to: "/customers" as const, label: "Customers", icon: Users },
	{ to: "/suppliers" as const, label: "Suppliers", icon: Truck },
	{ to: "/purchases" as const, label: "Purchases", icon: ShoppingBag },
	{ to: "/reports" as const, label: "Reports", icon: BarChart3 },
	{ to: "/calendar" as const, label: "Calendar", icon: CalendarDays },
	{ to: "/try-on" as const,  label: "Try On",   icon: ScanFace },
	{ to: "/settings" as const, label: "Profile Settings", icon: Settings },
];

export function AppSidebar({ user, ...props }: AppSidebarProps) {
	const navigate = useNavigate();
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const isAdmin = user?.role === "admin";
	const initials = getInitials(user?.name || user?.email || "User");
	const displayName = user?.name || "Account";
	const displayEmail = user?.email || "";

	const links = isAdmin
		? [...navItems, { to: "/admin" as const, label: "Admin", icon: Shield }]
		: navItems;

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" tooltip="Jewellery Management">
							<div className="flex aspect-square size-8 items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground">
								<Diamond className="size-4" />
							</div>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">
									Jewellery Management
								</span>
								<span className="truncate text-muted-foreground text-xs">
									Workspace
								</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Navigation</SidebarGroupLabel>
					<SidebarMenu>
						{links.map((item) => {
							const isActive = pathname === item.to;
							const Icon = item.icon;

							return (
								<SidebarMenuItem key={item.to}>
									<SidebarMenuButton
										isActive={isActive}
										tooltip={item.label}
										render={<Link to={item.to} />}
									>
										<Icon />
										<span>{item.label}</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							);
						})}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger
								render={<SidebarMenuButton size="lg" tooltip="Account" />}
							>
								<Avatar className="size-8">
									<AvatarFallback>{initials}</AvatarFallback>
								</Avatar>
								<div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">{displayName}</span>
									<span className="truncate text-muted-foreground text-xs">
										{displayEmail}
									</span>
								</div>
								<ChevronsUpDown className="ml-auto size-4" />
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="w-64"
								side="right"
								align="end"
								sideOffset={8}
							>
								<DropdownMenuGroup>
									<DropdownMenuLabel className="p-2">
										<div className="flex items-center gap-2">
											<Avatar className="size-8">
												<AvatarFallback>{initials}</AvatarFallback>
											</Avatar>
											<div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
												<span className="truncate font-medium">
													{displayName}
												</span>
												<span className="truncate text-muted-foreground text-xs">
													{displayEmail}
												</span>
											</div>
										</div>
									</DropdownMenuLabel>
								</DropdownMenuGroup>
								<DropdownMenuSeparator />
								<DropdownMenuGroup>
									<DropdownMenuItem
										onClick={() => {
											navigate({ to: "/settings" });
										}}
									>
										<Settings />
										Profile settings
									</DropdownMenuItem>
								</DropdownMenuGroup>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									variant="destructive"
									onClick={() => {
										authClient.signOut({
											fetchOptions: {
												onSuccess: () => {
													navigate({ to: "/" });
												},
											},
										});
									}}
								>
									<LogOut />
									Sign out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}

function getInitials(value: string) {
	return value
		.split(/[\s@.]+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("");
}
