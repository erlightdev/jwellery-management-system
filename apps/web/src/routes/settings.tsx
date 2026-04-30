import { Button } from "@jewellery-management-system/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@jewellery-management-system/ui/components/card";
import { Input } from "@jewellery-management-system/ui/components/input";
import { Label } from "@jewellery-management-system/ui/components/label";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard-shell";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/settings")({
	component: RouteComponent,
	beforeLoad: async () => {
		const session = await authClient.getSession();

		if (!session.data) {
			throw redirect({
				to: "/login",
			});
		}

		return { session };
	},
});

function RouteComponent() {
	const { session } = Route.useRouteContext();
	const user = session.data?.user as {
		name?: string | null;
		email?: string | null;
		role?: string | null;
	};
	const [name, setName] = useState(user.name ?? "");
	const [isSavingProfile, setIsSavingProfile] = useState(false);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isSavingPassword, setIsSavingPassword] = useState(false);

	async function saveProfile() {
		if (name.trim().length < 2) {
			toast.error("Name must be at least 2 characters");
			return;
		}

		setIsSavingProfile(true);
		const result = await authClient.updateUser({
			name: name.trim(),
		});
		setIsSavingProfile(false);

		if (result.error) {
			toast.error(result.error.message || result.error.statusText);
			return;
		}

		toast.success("Profile updated");
	}

	async function savePassword() {
		if (newPassword.length < 8) {
			toast.error("Password must be at least 8 characters");
			return;
		}

		if (newPassword !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		setIsSavingPassword(true);
		const result = await authClient.changePassword({
			currentPassword,
			newPassword,
			revokeOtherSessions: true,
		});
		setIsSavingPassword(false);

		if (result.error) {
			toast.error(result.error.message || result.error.statusText);
			return;
		}

		setCurrentPassword("");
		setNewPassword("");
		setConfirmPassword("");
		toast.success("Password updated");
	}

	return (
		<DashboardShell
			title="Profile Settings"
			description="Manage your account profile and password"
			user={user}
		>
			<div className="grid max-w-3xl gap-4">
				<Card>
					<CardHeader>
						<CardTitle>Profile</CardTitle>
						<CardDescription>{user.email}</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-4">
						<div className="grid gap-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								value={name}
								onChange={(event) => setName(event.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input id="email" value={user.email ?? ""} disabled />
						</div>
						<div>
							<Button onClick={saveProfile} disabled={isSavingProfile}>
								{isSavingProfile ? "Saving..." : "Save profile"}
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Password</CardTitle>
						<CardDescription>
							Password changes sign out your other active sessions.
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-4">
						<div className="grid gap-2">
							<Label htmlFor="current-password">Current password</Label>
							<Input
								id="current-password"
								type="password"
								value={currentPassword}
								onChange={(event) => setCurrentPassword(event.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="new-password">New password</Label>
							<Input
								id="new-password"
								type="password"
								value={newPassword}
								onChange={(event) => setNewPassword(event.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="confirm-password">Confirm password</Label>
							<Input
								id="confirm-password"
								type="password"
								value={confirmPassword}
								onChange={(event) => setConfirmPassword(event.target.value)}
							/>
						</div>
						<div>
							<Button onClick={savePassword} disabled={isSavingPassword}>
								{isSavingPassword ? "Saving..." : "Change password"}
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</DashboardShell>
	);
}
