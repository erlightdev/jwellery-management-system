import { Button } from "@jewellery-management-system/ui/components/button";
import { Input } from "@jewellery-management-system/ui/components/input";
import { Label } from "@jewellery-management-system/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
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
		<div className="mx-auto mt-10 w-full max-w-md p-6">
			<h1 className="mb-6 text-center font-bold text-3xl">Welcome Back</h1>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-4"
			>
				<form.Field name="email">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Email</Label>
							<Input
								id={field.name}
								name={field.name}
								type="email"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							{field.state.meta.errors.map((error) => (
								<p key={error?.message} className="text-red-500 text-sm">
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>

				<form.Field name="password">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Password</Label>
							<Input
								id={field.name}
								name={field.name}
								type="password"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							{field.state.meta.errors.map((error) => (
								<p key={error?.message} className="text-red-500 text-sm">
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>

				<form.Subscribe
					selector={(state) => ({
						canSubmit: state.canSubmit,
						isSubmitting: state.isSubmitting,
					})}
				>
					{({ canSubmit, isSubmitting }) => (
						<Button
							type="submit"
							className="w-full"
							disabled={!canSubmit || isSubmitting}
						>
							{isSubmitting ? "Submitting..." : "Sign In"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<div className="mt-3 grid gap-2">
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
					Continue with Google
				</Button>
				<Button type="button" variant="secondary" onClick={onMagicLink}>
					Email me a magic link
				</Button>
			</div>

			<div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center">
				<Button
					variant="link"
					onClick={() => onForgotPassword(form.state.values.email)}
				>
					Forgot password?
				</Button>
				<Button
					variant="link"
					onClick={() => onVerifyEmail(form.state.values.email)}
				>
					Verify email
				</Button>
				<Button variant="link" onClick={onSwitchToSignUp}>
					Need an account? Sign Up
				</Button>
			</div>
		</div>
	);
}
