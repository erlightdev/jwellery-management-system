import { Button } from "@jewellery-management-system/ui/components/button";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

type AdminUser = {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	role?: string | null;
	banned?: boolean | null;
};

export const Route = createFileRoute("/admin")({
	component: RouteComponent,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		const role = (session.data?.user as { role?: string | null } | undefined)
			?.role;

		if (!session.data || role !== "admin") {
			throw redirect({
				to: "/dashboard",
			});
		}

		return { session };
	},
});

function RouteComponent() {
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const loadUsers = useCallback(async () => {
		setIsLoading(true);
		const result = await authClient.admin.listUsers({
			query: {
				limit: 100,
				offset: 0,
				sortBy: "createdAt",
				sortDirection: "desc",
			},
		});

		if (result.error) {
			toast.error(result.error.message || result.error.statusText);
		} else {
			setUsers(result.data.users as AdminUser[]);
		}

		setIsLoading(false);
	}, []);

	useEffect(() => {
		loadUsers();
	}, [loadUsers]);

	async function setRole(userId: string, role: "admin" | "user") {
		const result = await authClient.admin.setRole({
			userId,
			role,
		});

		if (result.error) {
			toast.error(result.error.message || result.error.statusText);
			return;
		}

		toast.success("Role updated");
		await loadUsers();
	}

	return (
		<main className="mx-auto w-full max-w-5xl px-4 py-8">
			<div className="mb-6 flex items-center justify-between gap-4">
				<div>
					<h1 className="font-bold text-3xl">User Management</h1>
					<p className="text-muted-foreground">
						Manage application roles and account status.
					</p>
				</div>
				<Button variant="outline" onClick={loadUsers} disabled={isLoading}>
					Refresh
				</Button>
			</div>

			<div className="overflow-hidden rounded-lg border">
				<table className="w-full border-collapse text-sm">
					<thead className="bg-muted/50 text-left">
						<tr>
							<th className="p-3 font-medium">User</th>
							<th className="p-3 font-medium">Verified</th>
							<th className="p-3 font-medium">Role</th>
							<th className="p-3 text-right font-medium">Actions</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr>
								<td className="p-4 text-center" colSpan={4}>
									Loading users...
								</td>
							</tr>
						) : (
							users.map((user) => {
								const role = user.role ?? "user";
								const nextRole = role === "admin" ? "user" : "admin";

								return (
									<tr key={user.id} className="border-t">
										<td className="p-3">
											<div className="font-medium">{user.name}</div>
											<div className="text-muted-foreground">{user.email}</div>
										</td>
										<td className="p-3">{user.emailVerified ? "Yes" : "No"}</td>
										<td className="p-3 capitalize">{role}</td>
										<td className="p-3 text-right">
											<Button
												type="button"
												variant="outline"
												onClick={() => setRole(user.id, nextRole)}
											>
												Make {nextRole}
											</Button>
										</td>
									</tr>
								);
							})
						)}
					</tbody>
				</table>
			</div>
		</main>
	);
}
