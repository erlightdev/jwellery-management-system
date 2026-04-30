import { Button } from "@jewellery-management-system/ui/components/button";
import { Input } from "@jewellery-management-system/ui/components/input";
import { Label } from "@jewellery-management-system/ui/components/label";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard-shell";
import { authClient } from "@/lib/auth-client";
import { queryClient, trpc } from "@/utils/trpc";

export const Route = createFileRoute("/customers")({
	component: CustomersPage,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) {
			throw redirect({ to: "/login" });
		}
		return { session };
	},
});

function CustomersPage() {
	const { session } = Route.useRouteContext();
	const customers = useQuery(trpc.jewellery.customers.queryOptions());
	const createCustomer = useMutation(
		trpc.jewellery.createCustomer.mutationOptions({
			onSuccess: async () => {
				toast.success("Customer created");
				await queryClient.invalidateQueries(
					trpc.jewellery.customers.queryFilter(),
				);
			},
		}),
	);

	return (
		<DashboardShell
			title="Customer Management"
			description="Profiles for billing, payment follow-up, and sales history"
			user={session.data?.user}
		>
			<ContactManager
				type="customer"
				rows={customers.data ?? []}
				isSaving={createCustomer.isPending}
				onSubmit={(data) => createCustomer.mutate(data)}
			/>
		</DashboardShell>
	);
}

export function ContactManager({
	type,
	rows,
	isSaving,
	onSubmit,
}: {
	type: string;
	rows: Array<{
		id: string;
		name: string;
		email?: string | null;
		phone?: string | null;
		address?: string | null;
	}>;
	isSaving: boolean;
	onSubmit: (data: {
		name: string;
		email?: string;
		phone?: string;
		address?: string;
	}) => void;
}) {
	return (
		<div className="grid gap-4 lg:grid-cols-[360px_1fr]">
			<form
				className="grid gap-3 border bg-card p-4"
				onSubmit={(event) => {
					event.preventDefault();
					const data = new FormData(event.currentTarget);
					onSubmit({
						name: String(data.get("name")),
						email: String(data.get("email") || ""),
						phone: String(data.get("phone") || ""),
						address: String(data.get("address") || ""),
					});
					event.currentTarget.reset();
				}}
			>
				<h2 className="font-medium">Add {type}</h2>
				<Field name="name" label="Name" />
				<Field name="email" label="Email" type="email" />
				<Field name="phone" label="Phone" />
				<div className="grid gap-2">
					<Label htmlFor="address">Address</Label>
					<textarea
						id="address"
						name="address"
						className="min-h-24 border bg-background p-2 text-sm"
					/>
				</div>
				<Button type="submit" disabled={isSaving}>
					{isSaving ? "Saving..." : `Save ${type}`}
				</Button>
			</form>
			<section className="overflow-hidden border bg-card">
				<div className="border-b p-4">
					<h2 className="font-medium capitalize">{type}s</h2>
				</div>
				<div className="overflow-auto">
					<table className="w-full text-sm">
						<thead className="bg-muted/50 text-left">
							<tr>
								<th className="p-3">Name</th>
								<th className="p-3">Email</th>
								<th className="p-3">Phone</th>
								<th className="p-3">Address</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((row) => (
								<tr key={row.id} className="border-t">
									<td className="p-3 font-medium">{row.name}</td>
									<td className="p-3">{row.email || "-"}</td>
									<td className="p-3">{row.phone || "-"}</td>
									<td className="p-3 text-muted-foreground">
										{row.address || "-"}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>
		</div>
	);
}

function Field({
	name,
	label,
	type = "text",
}: {
	name: string;
	label: string;
	type?: string;
}) {
	return (
		<div className="grid gap-2">
			<Label htmlFor={name}>{label}</Label>
			<Input id={name} name={name} type={type} />
		</div>
	);
}
