import { Button } from "@jewellery-management-system/ui/components/button";
import { Input } from "@jewellery-management-system/ui/components/input";
import { Label } from "@jewellery-management-system/ui/components/label";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard-shell";
import { authClient } from "@/lib/auth-client";
import { Barcode, formatMoney, QrMark } from "@/lib/jewellery";
import { queryClient, trpc } from "@/utils/trpc";

export const Route = createFileRoute("/products")({
	component: ProductsPage,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) {
			throw redirect({ to: "/login" });
		}
		return { session };
	},
});

function ProductsPage() {
	const { session } = Route.useRouteContext();
	const products = useQuery(trpc.jewellery.products.queryOptions());
	const suppliers = useQuery(trpc.jewellery.suppliers.queryOptions());
	const createProduct = useMutation(
		trpc.jewellery.createProduct.mutationOptions({
			onSuccess: async () => {
				toast.success("Product created");
				await queryClient.invalidateQueries(
					trpc.jewellery.products.queryFilter(),
				);
				await queryClient.invalidateQueries(
					trpc.jewellery.summary.queryFilter(),
				);
			},
		}),
	);

	return (
		<DashboardShell
			title="Product Management"
			description="Catalogue, pricing formula, barcode, and QR metadata"
			user={session.data?.user}
		>
			<div className="grid gap-4 xl:grid-cols-[420px_1fr]">
				<form
					className="grid gap-3 border bg-card p-4"
					onSubmit={(event) => {
						event.preventDefault();
						const data = new FormData(event.currentTarget);
						createProduct.mutate({
							sku: String(data.get("sku")),
							name: String(data.get("name")),
							category: String(data.get("category")),
							metalType: String(data.get("metalType")),
							purity: String(data.get("purity") || ""),
							grossWeight: Number(data.get("grossWeight")),
							netWeight: Number(data.get("netWeight")),
							metalRate: Number(data.get("metalRate")),
							makingCharge: Number(data.get("makingCharge") || 0),
							wastageCharge: Number(data.get("wastageCharge") || 0),
							stoneCharge: Number(data.get("stoneCharge") || 0),
							taxRate: Number(data.get("taxRate") || 0),
							quantity: Number(data.get("quantity") || 1),
							reorderLevel: Number(data.get("reorderLevel") || 1),
							location: String(data.get("location") || ""),
							supplierId: String(data.get("supplierId") || "") || undefined,
						});
						event.currentTarget.reset();
					}}
				>
					<h2 className="font-medium">Add jewellery item</h2>
					<div className="grid gap-3 sm:grid-cols-2">
						<Field name="sku" label="SKU" />
						<Field name="name" label="Name" />
						<Field name="category" label="Category" placeholder="Ring" />
						<Field name="metalType" label="Metal" placeholder="Gold" />
						<Field name="purity" label="Purity" placeholder="22K" />
						<Field name="location" label="Location" placeholder="Showcase A" />
						<Field
							name="grossWeight"
							label="Gross Wt"
							type="number"
							step="0.001"
						/>
						<Field name="netWeight" label="Net Wt" type="number" step="0.001" />
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
						<Field name="quantity" label="Qty" type="number" />
						<Field name="reorderLevel" label="Reorder" type="number" />
						<div className="grid gap-2 sm:col-span-2">
							<Label htmlFor="supplierId">Supplier</Label>
							<select
								id="supplierId"
								name="supplierId"
								className="h-8 border bg-background px-2 text-sm"
							>
								<option value="">None</option>
								{suppliers.data?.map((supplier) => (
									<option key={supplier.id} value={supplier.id}>
										{supplier.name}
									</option>
								))}
							</select>
						</div>
					</div>
					<Button type="submit" disabled={createProduct.isPending}>
						{createProduct.isPending ? "Saving..." : "Save product"}
					</Button>
				</form>

				<section className="overflow-hidden border bg-card">
					<div className="border-b p-4">
						<h2 className="font-medium">Products</h2>
						<p className="text-muted-foreground text-sm">
							Formula: metal rate x weight + making + wastage + stone + tax -
							discount
						</p>
					</div>
					<div className="overflow-auto">
						<table className="w-full text-sm">
							<thead className="bg-muted/50 text-left">
								<tr>
									<th className="p-3">Item</th>
									<th className="p-3">Stock</th>
									<th className="p-3">Base Value</th>
									<th className="p-3">Barcode</th>
									<th className="p-3">QR</th>
								</tr>
							</thead>
							<tbody>
								{products.data?.map((product) => {
									const base =
										Number(product.metalRate) * Number(product.netWeight) +
										Number(product.makingCharge) +
										Number(product.wastageCharge) +
										Number(product.stoneCharge);
									return (
										<tr key={product.id} className="border-t">
											<td className="p-3">
												<div className="font-medium">{product.name}</div>
												<div className="text-muted-foreground text-xs">
													{product.sku} · {product.metalType} {product.purity}
												</div>
											</td>
											<td className="p-3">
												{product.inventory?.quantity ?? 0}
												<span className="text-muted-foreground text-xs">
													{" "}
													/ reorder {product.inventory?.reorderLevel ?? 0}
												</span>
											</td>
											<td className="p-3">{formatMoney(base)}</td>
											<td className="p-3">
												<Barcode value={product.barcode} />
											</td>
											<td className="p-3">
												<QrMark value={product.qrCode} />
											</td>
										</tr>
									);
								})}
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
			<Label htmlFor={props.name}>{props.label}</Label>
			<Input id={props.name} {...inputProps} />
		</div>
	);
}
