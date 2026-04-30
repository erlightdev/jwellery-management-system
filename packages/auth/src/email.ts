import { env } from "@jewellery-management-system/env/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	host: env.SMTP_HOST,
	port: env.SMTP_PORT,
	secure: env.SMTP_PORT === 465,
	connectionTimeout: 10_000,
	greetingTimeout: 10_000,
	socketTimeout: 10_000,
	auth: {
		user: env.SMTP_USER,
		pass: env.SMTP_PASS,
	},
});

type SendEmailInput = {
	to: string;
	subject: string;
	text: string;
	html: string;
};

export async function sendEmail({ to, subject, text, html }: SendEmailInput) {
	const info = await transporter.sendMail({
		from: env.SMTP_FROM,
		to,
		subject,
		text,
		html,
	});

	console.info("Email sent", {
		to,
		messageId: info.messageId,
		accepted: info.accepted,
		rejected: info.rejected,
	});
}

export async function sendOTPEmail({
	email,
	otp,
	type,
}: {
	email: string;
	otp: string;
	type: "sign-in" | "email-verification" | "forget-password" | "change-email";
}) {
	const purpose =
		type === "forget-password"
			? "reset your password"
			: type === "email-verification"
				? "verify your email"
				: type === "change-email"
					? "change your email"
					: "sign in";

	await sendEmail({
		to: email,
		subject: "Your Jewellery Management System code",
		text: `Use this code to ${purpose}: ${otp}. This code expires soon.`,
		html: `<p>Use this code to ${purpose}:</p><p style="font-size:24px;font-weight:700;letter-spacing:4px">${otp}</p><p>This code expires soon.</p>`,
	});
}

export async function sendMagicLinkEmail({
	email,
	url,
}: {
	email: string;
	url: string;
}) {
	await sendEmail({
		to: email,
		subject: "Your Jewellery Management System sign-in link",
		text: `Use this link to sign in: ${url}`,
		html: `<p>Use this link to sign in:</p><p><a href="${url}">${url}</a></p>`,
	});
}
