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

export const Route = createFileRoute("/sales")({
	component: SalesPage,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) {
			throw redirect({ to: "/login" });
		}
		return { session };
	},
});

function SalesPage() {
	const { session } = Route.useRouteContext();
	const customers = useQuery(trpc.jewellery.customers.queryOptions());
	const products = useQuery(trpc.jewellery.products.queryOptions());
	const sales = useQuery(trpc.jewellery.sales.queryOptions());
	const createSale = useMutation(
		trpc.jewellery.createSale.mutationOptions({
			onSuccess: async () => {
				toast.success("Invoice generated");
				await Promise.all([
					queryClient.invalidateQueries(trpc.jewellery.sales.queryFilter()),
					queryClient.invalidateQueries(trpc.jewellery.products.queryFilter()),
					queryClient.invalidateQueries(trpc.jewellery.summary.queryFilter()),
				]);
			},
		}),
	);

	return (
		<DashboardShell
			title="Sales Billing"
			description="Invoice generation with jewellery pricing and payment tracking"
			user={session.data?.user}
		>
			<div className="grid gap-4 xl:grid-cols-[420px_1fr]">
				<form
					className="grid gap-3 border bg-card p-4"
					onSubmit={(event) => {
						event.preventDefault();
						const data = new FormData(event.currentTarget);
						const productId = String(data.get("productId") || "");
						const product = products.data?.find(
							(item) => item.id === productId,
						);
						const item = {
							productId: productId || undefined,
							description: String(
								data.get("description") || product?.name || "Jewellery item",
							),
							weight: Number(data.get("weight")),
							metalRate: Number(data.get("metalRate")),
							makingCharge: Number(data.get("makingCharge") || 0),
							wastageCharge: Number(data.get("wastageCharge") || 0),
							stoneCharge: Number(data.get("stoneCharge") || 0),
							taxRate: Number(data.get("taxRate") || 0),
							discount: Number(data.get("lineDiscount") || 0),
						};
						createSale.mutate({
							customerId: String(data.get("customerId") || "") || undefined,
							paymentMethod: String(data.get("paymentMethod") || ""),
							paidAmount: Number(data.get("paidAmount") || 0),
							discount: Number(data.get("invoiceDiscount") || 0),
							notes: String(data.get("notes") || ""),
							dueDate: String(data.get("dueDate") || "") || undefined,
							items: [item],
						});
						event.currentTarget.reset();
					}}
				>
					<h2 className="font-medium">Create invoice</h2>
					<Select name="customerId" label="Customer">
						<option value="">Walk-in</option>
						{customers.data?.map((customer) => (
							<option key={customer.id} value={customer.id}>
								{customer.name}
							</option>
						))}
					</Select>
					<Select name="productId" label="Product">
						<option value="">Custom item</option>
						{products.data?.map((product) => (
							<option key={product.id} value={product.id}>
								{product.name} ({product.sku})
							</option>
						))}
					</Select>
					<Field name="description" label="Description" />
					<div className="grid gap-3 sm:grid-cols-2">
						<Field name="weight" label="Weight" type="number" step="0.001" />
						<Field
							name="metalRate"
							label="Metal rate"
							type="number"
							step="0.01"
						/>
						<Field
							name="makingCharge"
							label="Making"
							type="number"
							step="0.01"
						/>
						<Field
							name="wastageCharge"
							label="Wastage"
							type="number"
							step="0.01"
						/>
						<Field name="stoneCharge" label="Stone" type="number" step="0.01" />
						<Field name="taxRate" label="Tax %" type="number" step="0.01" />
						<Field
							name="lineDiscount"
							label="Line discount"
							type="number"
							step="0.01"
						/>
						<Field
							name="invoiceDiscount"
							label="Invoice discount"
							type="number"
							step="0.01"
						/>
						<Field name="paidAmount" label="Paid" type="number" step="0.01" />
						<Field name="dueDate" label="Due date" type="date" />
					</div>
					<Field
						name="paymentMethod"
						label="Payment method"
						placeholder="Cash / Card / Bank"
					/>
					<Button type="submit" disabled={createSale.isPending}>
						{createSale.isPending ? "Generating..." : "Generate invoice"}
					</Button>
				</form>

				<section className="overflow-hidden border bg-card">
					<div className="border-b p-4">
						<h2 className="font-medium">Invoices</h2>
					</div>
					<div className="overflow-auto">
						<table className="w-full text-sm">
							<thead className="bg-muted/50 text-left">
								<tr>
									<th className="p-3">Invoice</th>
									<th className="p-3">Customer</th>
									<th className="p-3">Date</th>
									<th className="p-3">Total</th>
									<th className="p-3">Paid</th>
									<th className="p-3">Status</th>
								</tr>
							</thead>
							<tbody>
								{sales.data?.map((sale) => (
									<tr key={sale.id} className="border-t">
										<td className="p-3 font-medium">{sale.invoiceNumber}</td>
										<td className="p-3">{sale.customer?.name ?? "Walk-in"}</td>
										<td className="p-3">{formatDate(sale.saleDate)}</td>
										<td className="p-3">{formatMoney(sale.total)}</td>
										<td className="p-3">{formatMoney(sale.paidAmount)}</td>
										<td className="p-3 capitalize">{sale.paymentStatus}</td>
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

function Field(props: {
	name: string;
	label: string;
	type?: string;
	step?: string;
	placeholder?: string;
}) {
	const { label, ...inputProps } = props;
	return (
		<div className="grid gap-2">
			<Label htmlFor={props.name}>{label}</Label>
			<Input id={props.name} {...inputProps} />
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
