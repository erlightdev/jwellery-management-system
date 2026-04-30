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
import { Gem } from "lucide-react";
import type React from "react";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

type SignUpFormProps = {
	onSwitchToSignIn: () => void;
	onNeedsVerification: (email: string) => void;
};

export default function SignUpForm({
	onSwitchToSignIn,
	onNeedsVerification,
}: SignUpFormProps) {
	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
			name: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signUp.email(
				{
					email: value.email,
					password: value.password,
					name: value.name,
					callbackURL: "/dashboard",
				},
				{
					onSuccess: () => {
						toast.success("Check your email for a verification code");
						onNeedsVerification(value.email);
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				},
			);
		},
		validators: {
			onSubmit: z
				.object({
					name: z.string().min(2, "Name must be at least 2 characters"),
					email: z.email("Invalid email address"),
					password: z.string().min(8, "Password must be at least 8 characters"),
					confirmPassword: z.string().min(8, "Confirm your password"),
				})
				.refine((data) => data.password === data.confirmPassword, {
					message: "Passwords do not match",
					path: ["confirmPassword"],
				}),
		},
	});

	return (
		<AuthFrame>
			<Card className="overflow-hidden p-0">
				<CardContent className="grid p-0 md:grid-cols-[0.95fr_1.05fr]">
					<AuthVisual />
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
								<h1 className="font-bold text-2xl">Create your account</h1>
								<p className="text-balance text-muted-foreground text-sm">
									Register with email and verify your code before entering the
									dashboard.
								</p>
							</div>

							<form.Field name="name">
								{(field) => (
									<Field data-invalid={field.state.meta.errors.length > 0}>
										<FieldLabel htmlFor={field.name}>Name</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											autoComplete="name"
											placeholder="Your name"
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

							<Field className="grid gap-4 md:grid-cols-2">
								<form.Field name="password">
									{(field) => (
										<Field data-invalid={field.state.meta.errors.length > 0}>
											<FieldLabel htmlFor={field.name}>Password</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												type="password"
												autoComplete="new-password"
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

								<form.Field name="confirmPassword">
									{(field) => (
										<Field data-invalid={field.state.meta.errors.length > 0}>
											<FieldLabel htmlFor={field.name}>Confirm</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												type="password"
												autoComplete="new-password"
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
								<FieldDescription className="md:col-span-2">
									Password must be at least 8 characters.
								</FieldDescription>
							</Field>

							<form.Subscribe
								selector={(state) => ({
									canSubmit: state.canSubmit,
									isSubmitting: state.isSubmitting,
								})}
							>
								{({ canSubmit, isSubmitting }) => (
									<Field>
										<Button type="submit" disabled={!canSubmit || isSubmitting}>
											{isSubmitting ? "Creating account..." : "Create account"}
										</Button>
									</Field>
								)}
							</form.Subscribe>

							<FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
								Or continue with
							</FieldSeparator>

							<Field>
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
									Continue with Google
								</Button>
							</Field>

							<FieldDescription className="text-center">
								Already have an account?{" "}
								<button
									type="button"
									className="underline underline-offset-4 hover:text-primary"
									onClick={onSwitchToSignIn}
								>
									Sign in
								</button>
							</FieldDescription>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</AuthFrame>
	);
}

function AuthFrame({ children }: { children: React.ReactNode }) {
	return (
		<main className="flex min-h-svh items-center justify-center bg-background p-4">
			<div className="w-full max-w-5xl">{children}</div>
		</main>
	);
}

function AuthVisual() {
	return (
		<div className="relative hidden overflow-hidden border-r bg-muted md:block">
			<div className="absolute inset-0 bg-gradient-to-br from-muted to-background" />
			<div className="absolute top-10 right-10 h-40 w-40 bg-primary/10 blur-3xl" />
			<div className="relative flex h-full min-h-[560px] flex-col justify-between p-8">
				<div className="flex items-center gap-2">
					<div className="flex size-9 items-center justify-center bg-primary text-primary-foreground">
						<Gem className="size-4" />
					</div>
					<div>
						<p className="font-medium">Jewellery Management</p>
						<p className="text-muted-foreground text-xs">Verified access</p>
					</div>
				</div>
				<div className="space-y-3">
					<p className="max-w-sm text-balance font-semibold text-2xl">
						Create a secure workspace for your jewellery operations.
					</p>
					<p className="max-w-sm text-muted-foreground text-sm">
						Email OTP verification keeps new accounts gated before dashboard
						access.
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
