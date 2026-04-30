import { Button } from "@jewellery-management-system/ui/components/button";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard-shell";
import { authClient } from "@/lib/auth-client";
import { downloadCsv, formatMoney } from "@/lib/jewellery";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/reports")({
	component: ReportsPage,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) {
			throw redirect({ to: "/login" });
		}
		return { session };
	},
});

function ReportsPage() {
	const { session } = Route.useRouteContext();
	const rows = useQuery(trpc.jewellery.reportRows.queryOptions());

	return (
		<DashboardShell
			title="Reports"
			description="Sales report export for CSV, Excel, and Google Sheets import"
			user={session.data?.user}
			actions={
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={() =>
							downloadCsv("jewellery-sales-report.csv", rows.data ?? [])
						}
					>
						Download CSV
					</Button>
					<Button
						variant="outline"
						onClick={async () => {
							const data = rows.data ?? [];
							if (!data.length) return;
							const headers = Object.keys(data[0] ?? {});
							const text = [
								headers.join("\t"),
								...data.map((row) =>
									headers
										.map((header) => row[header as keyof typeof row])
										.join("\t"),
								),
							].join("\n");
							await navigator.clipboard.writeText(text);
							toast.success("Copied for Google Sheets");
						}}
					>
						Copy for Sheets
					</Button>
				</div>
			}
		>
			<section className="overflow-hidden border bg-card">
				<div className="overflow-auto">
					<table className="w-full text-sm">
						<thead className="bg-muted/50 text-left">
							<tr>
								{[
									"Date",
									"Invoice",
									"Customer",
									"Total",
									"Paid",
									"Balance",
									"Status",
								].map((header) => (
									<th key={header} className="p-3">
										{header}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{rows.data?.map((row) => (
								<tr key={row.invoice} className="border-t">
									<td className="p-3">{row.date}</td>
									<td className="p-3 font-medium">{row.invoice}</td>
									<td className="p-3">{row.customer}</td>
									<td className="p-3">{formatMoney(row.total)}</td>
									<td className="p-3">{formatMoney(row.paid)}</td>
									<td className="p-3">{formatMoney(row.balance)}</td>
									<td className="p-3 capitalize">{row.status}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>
		</DashboardShell>
	);
}
