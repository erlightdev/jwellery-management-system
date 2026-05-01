import { createFileRoute, redirect } from "@tanstack/react-router";
import { JewelleryTryon } from "@/components/tryon";
import { DashboardShell } from "@/components/dashboard-shell";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/try-on")({
	component: TryOnPage,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) throw redirect({ to: "/login" });
		return { session };
	},
});

function TryOnPage() {
	const { session } = Route.useRouteContext();
	const user = session.data?.user as
		| { name?: string | null; email?: string | null; role?: string | null }
		| undefined;

	return (
		<DashboardShell
			title="Jewellery Try-On"
			description="Try on jewellery live or on a photo using AI"
			user={user}
		>
			<JewelleryTryon />
		</DashboardShell>
	);
}
