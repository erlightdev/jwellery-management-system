import { Button } from "@jewellery-management-system/ui/components/button";
import { Input } from "@jewellery-management-system/ui/components/input";
import { Label } from "@jewellery-management-system/ui/components/label";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import type React from "react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard-shell";
import { authClient } from "@/lib/auth-client";
import { formatDate, formatMoney } from "@/lib/jewellery";
import { queryClient, trpc } from "@/utils/trpc";

export const Route = createFileRoute("/purchases")({
	component: PurchasesPage,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) {
			throw redirect({ to: "/login" });
		}
		return { session };
	},
});

function PurchasesPage() {
	const { session } = Route.useRouteContext();
	const suppliers = useQuery(trpc.jewellery.suppliers.queryOptions());
	const products = useQuery(trpc.jewellery.products.queryOptions());
	const purchases = useQuery(trpc.jewellery.purchases.queryOptions());
	const createPurchase = useMutation(
		trpc.jewellery.createPurchase.mutationOptions({
			onSuccess: async () => {
				toast.success("Purchase recorded");
				await queryClient.invalidateQueries(
					trpc.jewellery.purchases.queryFilter(),
				);
			},
		}),
	);

	return (
		<DashboardShell
			title="Purchase Management"
			description="Supplier purchases, dues, and item cost tracking"
			user={session.data?.user}
		>
			<div className="grid gap-4 xl:grid-cols-[380px_1fr]">
				<form
					className="grid gap-3 border bg-card p-4"
					onSubmit={(event) => {
						event.preventDefault();
						const data = new FormData(event.currentTarget);
						createPurchase.mutate({
							supplierId: String(data.get("supplierId") || "") || undefined,
							paidAmount: Number(data.get("paidAmount") || 0),
							notes: String(data.get("notes") || ""),
							dueDate: String(data.get("dueDate") || "") || undefined,
							items: [
								{
									productId: String(data.get("productId") || "") || undefined,
									description: String(data.get("description")),
									quantity: Number(data.get("quantity") || 1),
									unitCost: Number(data.get("unitCost") || 0),
								},
							],
						});
						event.currentTarget.reset();
					}}
				>
					<h2 className="font-medium">Record purchase</h2>
					<Select name="supplierId" label="Supplier">
						<option value="">No supplier</option>
						{suppliers.data?.map((supplier) => (
							<option key={supplier.id} value={supplier.id}>
								{supplier.name}
							</option>
						))}
					</Select>
					<Select name="productId" label="Product">
						<option value="">New/custom item</option>
						{products.data?.map((product) => (
							<option key={product.id} value={product.id}>
								{product.name}
							</option>
						))}
					</Select>
					<Field name="description" label="Description" />
					<Field name="quantity" label="Quantity" type="number" />
					<Field name="unitCost" label="Unit cost" type="number" step="0.01" />
					<Field
						name="paidAmount"
						label="Paid amount"
						type="number"
						step="0.01"
					/>
					<Field name="dueDate" label="Due date" type="date" />
					<Button type="submit" disabled={createPurchase.isPending}>
						{createPurchase.isPending ? "Saving..." : "Save purchase"}
					</Button>
				</form>
				<section className="overflow-hidden border bg-card">
					<div className="overflow-auto">
						<table className="w-full text-sm">
							<thead className="bg-muted/50 text-left">
								<tr>
									<th className="p-3">PO</th>
									<th className="p-3">Supplier</th>
									<th className="p-3">Date</th>
									<th className="p-3">Total</th>
									<th className="p-3">Paid</th>
									<th className="p-3">Status</th>
								</tr>
							</thead>
							<tbody>
								{purchases.data?.map((purchase) => (
									<tr key={purchase.id} className="border-t">
										<td className="p-3 font-medium">
											{purchase.purchaseNumber}
										</td>
										<td className="p-3">{purchase.supplier?.name ?? "-"}</td>
										<td className="p-3">{formatDate(purchase.purchaseDate)}</td>
										<td className="p-3">{formatMoney(purchase.total)}</td>
										<td className="p-3">{formatMoney(purchase.paidAmount)}</td>
										<td className="p-3 capitalize">{purchase.paymentStatus}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>
			</div>
		</DashboardShell>
	);
}

function Field({
	name,
	label,
	type = "text",
	step,
}: {
	name: string;
	label: string;
	type?: string;
	step?: string;
}) {
	return (
		<div className="grid gap-2">
			<Label htmlFor={name}>{label}</Label>
			<Input id={name} name={name} type={type} step={step} />
		</div>
	);
}

function Select({
	name,
	label,
	children,
}: {
	name: string;
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="grid gap-2">
			<Label htmlFor={name}>{label}</Label>
			<select
				id={name}
				name={name}
				className="h-8 border bg-background px-2 text-sm"
			>
				{children}
			</select>
		</div>
	);
}
