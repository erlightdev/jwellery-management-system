import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard-shell";
import { authClient } from "@/lib/auth-client";
import { formatDate, formatMoney } from "@/lib/jewellery";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/calendar")({
	component: CalendarPage,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) {
			throw redirect({ to: "/login" });
		}
		return { session };
	},
});

function CalendarPage() {
	const { session } = Route.useRouteContext();
	const events = useQuery(trpc.jewellery.calendar.queryOptions());
	const grouped = new Map<string, NonNullable<typeof events.data>>();

	for (const event of events.data ?? []) {
		const key = formatDate(event.date);
		grouped.set(key, [...(grouped.get(key) ?? []), event]);
	}

	return (
		<DashboardShell
			title="Calendar"
			description="Sales and purchase activity by day"
			user={session.data?.user}
		>
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				{[...grouped.entries()].map(([date, dayEvents]) => (
					<section key={date} className="border bg-card p-4">
						<h2 className="font-medium">{date}</h2>
						<div className="mt-3 grid gap-2">
							{dayEvents.map((event) => (
								<div key={event.id} className="border p-3">
									<div className="flex items-center justify-between">
										<span className="font-medium text-sm">{event.title}</span>
										<span className="text-muted-foreground text-xs capitalize">
											{event.type}
										</span>
									</div>
									<p className="mt-1 text-muted-foreground text-sm">
										{formatMoney(event.amount)}
									</p>
								</div>
							))}
						</div>
					</section>
				))}
			</div>
		</DashboardShell>
	);
}
