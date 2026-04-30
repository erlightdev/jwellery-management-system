import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard-shell";
import { authClient } from "@/lib/auth-client";
import { ContactManager } from "@/routes/customers";
import { queryClient, trpc } from "@/utils/trpc";

export const Route = createFileRoute("/suppliers")({
	component: SuppliersPage,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) {
			throw redirect({ to: "/login" });
		}
		return { session };
	},
});

function SuppliersPage() {
	const { session } = Route.useRouteContext();
	const suppliers = useQuery(trpc.jewellery.suppliers.queryOptions());
	const createSupplier = useMutation(
		trpc.jewellery.createSupplier.mutationOptions({
			onSuccess: async () => {
				toast.success("Supplier created");
				await queryClient.invalidateQueries(
					trpc.jewellery.suppliers.queryFilter(),
				);
			},
		}),
	);

	return (
		<DashboardShell
			title="Supplier Management"
			description="Vendor records for purchases and product sourcing"
			user={session.data?.user}
		>
			<ContactManager
				type="supplier"
				rows={suppliers.data ?? []}
				isSaving={createSupplier.isPending}
				onSubmit={(data) => createSupplier.mutate(data)}
			/>
		</DashboardShell>
	);
}
