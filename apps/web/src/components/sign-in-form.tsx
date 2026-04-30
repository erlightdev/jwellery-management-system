import { Button } from "@jewellery-management-system/ui/components/button";
import {
	Card,
	CardContent,
} from "@jewellery-management-system/ui/components/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@jewellery-management-system/ui/components/field";
import { Input } from "@jewellery-management-system/ui/components/input";
import { cn } from "@jewellery-management-system/ui/lib/utils";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Gem } from "lucide-react";
import type React from "react";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

type SignInFormProps = {
	onSwitchToSignUp: () => void;
	onForgotPassword: (email?: string) => void;
	onMagicLink: () => void;
	onVerifyEmail: (email?: string) => void;
};

export default function SignInForm({
	onSwitchToSignUp,
	onForgotPassword,
	onMagicLink,
	onVerifyEmail,
}: SignInFormProps) {
	const navigate = useNavigate({ from: "/" });

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
					callbackURL: "/dashboard",
				},
				{
					onSuccess: () => {
						navigate({ to: "/dashboard" });
						toast.success("Sign in successful");
					},
					onError: (error) => {
						const message = error.error.message || error.error.statusText;

						if (message.toLowerCase().includes("email")) {
							onVerifyEmail(value.email);
						}

						toast.error(message);
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				email: z.email("Invalid email address"),
				password: z.string().min(8, "Password must be at least 8 characters"),
			}),
		},
	});

	return (
		<AuthFrame>
			<Card className="overflow-hidden p-0">
				<CardContent className="grid p-0 md:grid-cols-[1.05fr_0.95fr]">
					<form
						className="p-6 md:p-8"
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							form.handleSubmit();
						}}
					>
						<FieldGroup>
							<div className="flex flex-col items-center gap-2 text-center">
								<h1 className="font-bold text-2xl">Welcome back</h1>
								<p className="text-balance text-muted-foreground text-sm">
									Sign in to manage your jewellery workspace.
								</p>
							</div>

							<form.Field name="email">
								{(field) => (
									<Field data-invalid={field.state.meta.errors.length > 0}>
										<FieldLabel htmlFor={field.name}>Email</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											type="email"
											autoComplete="email"
											placeholder="name@example.com"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
										/>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								)}
							</form.Field>

							<form.Field name="password">
								{(field) => (
									<Field data-invalid={field.state.meta.errors.length > 0}>
										<div className="flex items-center">
											<FieldLabel htmlFor={field.name}>Password</FieldLabel>
											<button
												type="button"
												className="ml-auto text-muted-foreground text-xs underline-offset-4 hover:text-foreground hover:underline"
												onClick={() =>
													onForgotPassword(form.state.values.email)
												}
											>
												Forgot password?
											</button>
										</div>
										<Input
											id={field.name}
											name={field.name}
											type="password"
											autoComplete="current-password"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
										/>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								)}
							</form.Field>

							<form.Subscribe
								selector={(state) => ({
									canSubmit: state.canSubmit,
									isSubmitting: state.isSubmitting,
								})}
							>
								{({ canSubmit, isSubmitting }) => (
									<Field>
										<Button type="submit" disabled={!canSubmit || isSubmitting}>
											{isSubmitting ? "Signing in..." : "Sign in"}
										</Button>
									</Field>
								)}
							</form.Subscribe>

							<FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
								Or continue with
							</FieldSeparator>

							<Field className="grid grid-cols-2 gap-3">
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										authClient.signIn.social({
											provider: "google",
											callbackURL: "/dashboard",
											errorCallbackURL: "/login",
										});
									}}
								>
									<GoogleIcon />
									Google
								</Button>
								<Button type="button" variant="outline" onClick={onMagicLink}>
									Magic link
								</Button>
							</Field>

							<FieldDescription className="text-center">
								Need to verify your email?{" "}
								<button
									type="button"
									className="underline underline-offset-4 hover:text-primary"
									onClick={() => onVerifyEmail(form.state.values.email)}
								>
									Enter code
								</button>
							</FieldDescription>

							<FieldDescription className="text-center">
								Don&apos;t have an account?{" "}
								<button
									type="button"
									className="underline underline-offset-4 hover:text-primary"
									onClick={onSwitchToSignUp}
								>
									Sign up
								</button>
							</FieldDescription>
						</FieldGroup>
					</form>
					<AuthVisual />
				</CardContent>
			</Card>
		</AuthFrame>
	);
}

function AuthFrame({ children }: { children: React.ReactNode }) {
	return (
		<main className="flex min-h-svh items-center justify-center bg-background p-4">
			<div className="w-full max-w-4xl">{children}</div>
		</main>
	);
}

function AuthVisual() {
	return (
		<div className="relative hidden overflow-hidden border-l bg-muted md:block">
			<div className="absolute inset-0 bg-gradient-to-br from-background to-muted" />
			<div className="absolute top-10 left-10 h-40 w-40 bg-primary/10 blur-3xl" />
			<div className="relative flex h-full min-h-[520px] flex-col justify-between p-8">
				<div className="flex items-center gap-2">
					<div className="flex size-9 items-center justify-center bg-primary text-primary-foreground">
						<Gem className="size-4" />
					</div>
					<div>
						<p className="font-medium">Jewellery Management</p>
						<p className="text-muted-foreground text-xs">Secure workspace</p>
					</div>
				</div>
				<div className="space-y-3">
					<p className="max-w-sm text-balance font-semibold text-2xl">
						Inventory, customers, orders, and roles in one focused place.
					</p>
					<p className="max-w-sm text-muted-foreground text-sm">
						Protected by Better Auth with email verification and admin access.
					</p>
				</div>
			</div>
		</div>
	);
}

function GoogleIcon({ className }: { className?: string }) {
	return (
		<svg
			className={cn("size-4", className)}
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<path
				d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
				fill="currentColor"
			/>
		</svg>
	);
}
