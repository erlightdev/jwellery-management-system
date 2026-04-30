import { Button } from "@jewellery-management-system/ui/components/button";
import { Input } from "@jewellery-management-system/ui/components/input";
import { Label } from "@jewellery-management-system/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

function RouteComponent() {
	const [screen, setScreen] = useState<
		| "sign-in"
		| "sign-up"
		| "verify-email"
		| "forgot-password"
		| "reset-password"
		| "magic-link"
	>("sign-in");
	const [email, setEmail] = useState("");

	const showVerification = (nextEmail?: string) => {
		if (nextEmail) {
			setEmail(nextEmail);
		}
		setScreen("verify-email");
	};

	const showForgotPassword = (nextEmail?: string) => {
		if (nextEmail) {
			setEmail(nextEmail);
		}
		setScreen("forgot-password");
	};

	if (screen === "sign-up") {
		return (
			<SignUpForm
				onSwitchToSignIn={() => setScreen("sign-in")}
				onNeedsVerification={showVerification}
			/>
		);
	}

	if (screen === "verify-email") {
		return (
			<VerifyEmailForm email={email} onBack={() => setScreen("sign-in")} />
		);
	}

	if (screen === "forgot-password") {
		return (
			<ForgotPasswordForm
				email={email}
				onBack={() => setScreen("sign-in")}
				onCodeSent={(nextEmail) => {
					setEmail(nextEmail);
					setScreen("reset-password");
				}}
			/>
		);
	}

	if (screen === "reset-password") {
		return (
			<ResetPasswordForm email={email} onBack={() => setScreen("sign-in")} />
		);
	}

	if (screen === "magic-link") {
		return <MagicLinkForm onBack={() => setScreen("sign-in")} />;
	}

	return (
		<SignInForm
			onSwitchToSignUp={() => setScreen("sign-up")}
			onForgotPassword={showForgotPassword}
			onMagicLink={() => setScreen("magic-link")}
			onVerifyEmail={showVerification}
		/>
	);
}

function VerifyEmailForm({
	email,
	onBack,
}: {
	email: string;
	onBack: () => void;
}) {
	const navigate = useNavigate({ from: "/login" });
	const form = useForm({
		defaultValues: {
			email,
			otp: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.emailOtp.verifyEmail(
				{
					email: value.email,
					otp: value.otp,
				},
				{
					onSuccess: () => {
						toast.success("Email verified");
						navigate({ to: "/dashboard" });
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				email: z.email("Invalid email address"),
				otp: z.string().length(6, "Enter the 6 digit code"),
			}),
		},
	});

	return (
		<AuthPanel title="Verify Email">
			<form
				className="space-y-4"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<AuthField form={form} name="email" label="Email" type="email" />
				<AuthField
					form={form}
					name="otp"
					label="Verification Code"
					inputMode="numeric"
				/>
				<SubmitButton form={form} label="Verify Email" />
			</form>
			<div className="mt-3 grid gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={() => {
						const value = form.state.values.email;

						authClient.emailOtp.sendVerificationOtp(
							{ email: value, type: "email-verification" },
							{
								onSuccess: () => {
									toast.success("Verification code sent");
								},
								onError: (error) => {
									toast.error(error.error.message || error.error.statusText);
								},
							},
						);
					}}
				>
					Resend code
				</Button>
				<Button type="button" variant="link" onClick={onBack}>
					Back to sign in
				</Button>
			</div>
		</AuthPanel>
	);
}

function ForgotPasswordForm({
	email,
	onBack,
	onCodeSent,
}: {
	email: string;
	onBack: () => void;
	onCodeSent: (email: string) => void;
}) {
	const form = useForm({
		defaultValues: {
			email,
		},
		onSubmit: async ({ value }) => {
			await authClient.emailOtp.requestPasswordReset(
				{ email: value.email },
				{
					onSuccess: () => {
						toast.success("Password reset code sent");
						onCodeSent(value.email);
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				email: z.email("Invalid email address"),
			}),
		},
	});

	return (
		<AuthPanel title="Forgot Password">
			<form
				className="space-y-4"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<AuthField form={form} name="email" label="Email" type="email" />
				<SubmitButton form={form} label="Send Reset Code" />
			</form>
			<Button
				type="button"
				variant="link"
				className="mt-3 w-full"
				onClick={onBack}
			>
				Back to sign in
			</Button>
		</AuthPanel>
	);
}

function ResetPasswordForm({
	email,
	onBack,
}: {
	email: string;
	onBack: () => void;
}) {
	const form = useForm({
		defaultValues: {
			email,
			otp: "",
			password: "",
			confirmPassword: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.emailOtp.resetPassword(
				{
					email: value.email,
					otp: value.otp,
					password: value.password,
				},
				{
					onSuccess: () => {
						toast.success("Password reset successful");
						onBack();
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
					email: z.email("Invalid email address"),
					otp: z.string().length(6, "Enter the 6 digit code"),
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
		<AuthPanel title="Reset Password">
			<form
				className="space-y-4"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<AuthField form={form} name="email" label="Email" type="email" />
				<AuthField
					form={form}
					name="otp"
					label="Reset Code"
					inputMode="numeric"
				/>
				<AuthField
					form={form}
					name="password"
					label="New Password"
					type="password"
				/>
				<AuthField
					form={form}
					name="confirmPassword"
					label="Confirm Password"
					type="password"
				/>
				<SubmitButton form={form} label="Reset Password" />
			</form>
			<Button
				type="button"
				variant="link"
				className="mt-3 w-full"
				onClick={onBack}
			>
				Back to sign in
			</Button>
		</AuthPanel>
	);
}

function MagicLinkForm({ onBack }: { onBack: () => void }) {
	const form = useForm({
		defaultValues: {
			email: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signIn.magicLink(
				{
					email: value.email,
					callbackURL: "/dashboard",
					errorCallbackURL: "/login",
				},
				{
					onSuccess: () => {
						toast.success("Magic link sent");
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				email: z.email("Invalid email address"),
			}),
		},
	});

	return (
		<AuthPanel title="Magic Link Login">
			<form
				className="space-y-4"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<AuthField form={form} name="email" label="Email" type="email" />
				<SubmitButton form={form} label="Send Magic Link" />
			</form>
			<Button
				type="button"
				variant="link"
				className="mt-3 w-full"
				onClick={onBack}
			>
				Back to sign in
			</Button>
		</AuthPanel>
	);
}

function AuthPanel({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="mx-auto mt-10 w-full max-w-md p-6">
			<h1 className="mb-6 text-center font-bold text-3xl">{title}</h1>
			{children}
		</div>
	);
}

function AuthField({
	form,
	name,
	label,
	type = "text",
	inputMode,
}: {
	// biome-ignore lint/suspicious/noExplicitAny: TanStack Form's Field component carries deep generics across each form shape.
	form: any;
	name: string;
	label: string;
	type?: string;
	inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
	return (
		<form.Field name={name}>
			{
				// biome-ignore lint/suspicious/noExplicitAny: Field API is inferred by TanStack Form at runtime for this shared renderer.
				(field: any) => (
					<div className="space-y-2">
						<Label htmlFor={field.name}>{label}</Label>
						<Input
							id={field.name}
							name={field.name}
							type={type}
							inputMode={inputMode}
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						{field.state.meta.errors.map((error: { message?: string }) => (
							<p key={error?.message} className="text-red-500 text-sm">
								{error?.message}
							</p>
						))}
					</div>
				)
			}
		</form.Field>
	);
}

function SubmitButton({
	form,
	label,
}: {
	// biome-ignore lint/suspicious/noExplicitAny: TanStack Form's Subscribe component is bound to each form's generic state.
	form: any;
	label: string;
}) {
	return (
		<form.Subscribe
			selector={(state: { canSubmit: boolean; isSubmitting: boolean }) => ({
				canSubmit: state.canSubmit,
				isSubmitting: state.isSubmitting,
			})}
		>
			{({
				canSubmit,
				isSubmitting,
			}: {
				canSubmit: boolean;
				isSubmitting: boolean;
			}) => (
				<Button
					type="submit"
					className="w-full"
					disabled={!canSubmit || isSubmitting}
				>
					{isSubmitting ? "Submitting..." : label}
				</Button>
			)}
		</form.Subscribe>
	);
}
