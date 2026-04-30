import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard-shell";
import { authClient } from "@/lib/auth-client";
import { Barcode, formatMoney } from "@/lib/jewellery";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/inventory")({
	component: InventoryPage,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) {
			throw redirect({ to: "/login" });
		}
		return { session };
	},
});

function InventoryPage() {
	const { session } = Route.useRouteContext();
	const products = useQuery(trpc.jewellery.products.queryOptions());

	return (
		<DashboardShell
			title="Inventory"
			description="Stock levels, reorder alerts, locations, and barcode scan references"
			user={session.data?.user}
		>
			<section className="overflow-hidden border bg-card">
				<div className="overflow-auto">
					<table className="w-full text-sm">
						<thead className="bg-muted/50 text-left">
							<tr>
								<th className="p-3">Product</th>
								<th className="p-3">Quantity</th>
								<th className="p-3">Reorder</th>
								<th className="p-3">Location</th>
								<th className="p-3">Metal Value</th>
								<th className="p-3">Barcode</th>
							</tr>
						</thead>
						<tbody>
							{products.data?.map((product) => {
								const quantity = product.inventory?.quantity ?? 0;
								const reorderLevel = product.inventory?.reorderLevel ?? 0;
								return (
									<tr key={product.id} className="border-t">
										<td className="p-3">
											<div className="font-medium">{product.name}</div>
											<div className="text-muted-foreground text-xs">
												{product.category} · {product.metalType}
											</div>
										</td>
										<td className="p-3">
											<span
												className={
													quantity <= reorderLevel
														? "text-destructive"
														: "text-foreground"
												}
											>
												{quantity}
											</span>
										</td>
										<td className="p-3">{reorderLevel}</td>
										<td className="p-3">
											{product.inventory?.location || "-"}
										</td>
										<td className="p-3">
											{formatMoney(
												Number(product.metalRate) * Number(product.netWeight),
											)}
										</td>
										<td className="p-3">
											<Barcode value={product.barcode} />
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</section>
		</DashboardShell>
	);
}
