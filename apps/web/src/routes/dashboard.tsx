import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard-shell";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		const sessionData = session.data;

		if (!sessionData) {
			throw redirect({
				to: "/login",
			});
		}
		return { session };
	},
});

function RouteComponent() {
	const { session } = Route.useRouteContext();

	const privateData = useQuery(trpc.privateData.queryOptions());
	const user = session.data?.user as
		| {
				name?: string | null;
				email?: string | null;
				role?: string | null;
		  }
		| undefined;

	return (
		<DashboardShell
			title="Dashboard"
			description="Overview of your jewellery workspace"
			user={user}
		>
			<div className="grid gap-4 md:grid-cols-3">
				<section className="border bg-card p-4">
					<p className="text-muted-foreground text-sm">Welcome</p>
					<h2 className="mt-2 font-semibold text-2xl">
						{session.data?.user.name}
					</h2>
				</section>
				<section className="border bg-card p-4">
					<p className="text-muted-foreground text-sm">Role</p>
					<h2 className="mt-2 font-semibold text-2xl capitalize">
						{user?.role ?? "user"}
					</h2>
				</section>
				<section className="border bg-card p-4">
					<p className="text-muted-foreground text-sm">API</p>
					<h2 className="mt-2 font-semibold text-2xl">
						{privateData.isLoading ? "Checking..." : "Connected"}
					</h2>
				</section>
			</div>

			<section className="mt-4 border bg-card p-4">
				<h2 className="font-medium">Private Data</h2>
				<p className="mt-2 text-muted-foreground text-sm">
					{privateData.data?.message ?? "Loading private API response..."}
				</p>
			</section>
		</DashboardShell>
	);
}
