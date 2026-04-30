import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import type React from "react";

import { DashboardShell } from "@/components/dashboard-shell";
import { authClient } from "@/lib/auth-client";
import { formatDate, formatMoney } from "@/lib/jewellery";
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
	const summary = useQuery(trpc.jewellery.summary.queryOptions());
	const calendar = useQuery(trpc.jewellery.calendar.queryOptions());
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
			<div className="grid gap-4 md:grid-cols-4">
				<Metric label="Revenue" value={formatMoney(summary.data?.revenue)} />
				<Metric
					label="Outstanding"
					value={formatMoney(summary.data?.outstanding)}
				/>
				<Metric label="Products" value={summary.data?.products ?? 0} />
				<Metric label="Low stock" value={summary.data?.lowStock ?? 0} />
			</div>

			<div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
				<section className="border bg-card p-4">
					<div className="mb-4 flex items-center justify-between">
						<div>
							<h2 className="font-medium">Sales Performance</h2>
							<p className="text-muted-foreground text-sm">
								Revenue, payments, and inventory signals.
							</p>
						</div>
						<span className="text-muted-foreground text-xs">
							{privateData.data?.message ?? "Connected"}
						</span>
					</div>
					<div className="grid h-64 items-end gap-2 md:grid-cols-6">
						{[
							{ label: "Revenue", value: summary.data?.revenue ?? 0 },
							{ label: "Due", value: summary.data?.outstanding ?? 0 },
							{ label: "PO Due", value: summary.data?.purchaseDue ?? 0 },
							{ label: "Items", value: summary.data?.products ?? 0 },
							{ label: "Cust", value: summary.data?.customers ?? 0 },
							{ label: "Supp", value: summary.data?.suppliers ?? 0 },
						].map((item) => {
							const value = item.value;
							const height = Math.max(12, Math.min(100, Number(value) / 20));
							return (
								<div key={item.label} className="flex flex-col gap-2">
									<div className="flex h-52 items-end border bg-muted/40 px-2">
										<div
											className="w-full bg-primary"
											style={{ height: `${height}%` }}
										/>
									</div>
									<span className="truncate text-center text-muted-foreground text-xs">
										{item.label}
									</span>
								</div>
							);
						})}
					</div>
				</section>

				<section className="border bg-card p-4">
					<h2 className="font-medium">Calendar</h2>
					<div className="mt-4 grid gap-3">
						{calendar.data?.slice(0, 6).map((event) => (
							<div key={event.id} className="border p-3">
								<div className="flex items-center justify-between gap-3">
									<span className="font-medium text-sm">{event.title}</span>
									<span className="text-muted-foreground text-xs capitalize">
										{event.type}
									</span>
								</div>
								<p className="mt-1 text-muted-foreground text-xs">
									{formatDate(event.date)} · {formatMoney(event.amount)}
								</p>
							</div>
						)) ?? (
							<p className="text-muted-foreground text-sm">No events yet.</p>
						)}
					</div>
				</section>
			</div>
		</DashboardShell>
	);
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<section className="border bg-card p-4">
			<p className="text-muted-foreground text-sm">{label}</p>
			<h2 className="mt-2 font-semibold text-2xl">{value}</h2>
		</section>
	);
}
