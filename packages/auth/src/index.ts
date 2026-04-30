import { createPrismaClient } from "@jewellery-management-system/db";
import { env } from "@jewellery-management-system/env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, emailOTP, magicLink } from "better-auth/plugins";

import { sendMagicLinkEmail, sendOTPEmail } from "./email";

export function createAuth() {
	const prisma = createPrismaClient();

	return betterAuth({
		database: prismaAdapter(prisma, {
			provider: "mysql",
		}),

		trustedOrigins: [env.CORS_ORIGIN],
		emailVerification: {
			autoSignInAfterVerification: true,
		},
		socialProviders: {
			google: {
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
			},
		},
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: true,
			autoSignIn: false,
		},
		secret: env.BETTER_AUTH_SECRET,
		baseURL: env.BETTER_AUTH_URL,
		advanced: {
			defaultCookieAttributes: {
				sameSite: "none",
				secure: true,
				httpOnly: true,
			},
		},
		plugins: [
			emailOTP({
				otpLength: 6,
				expiresIn: 5 * 60,
				sendVerificationOnSignUp: true,
				overrideDefaultEmailVerification: true,
				async sendVerificationOTP({ email, otp, type }) {
					await sendOTPEmail({ email, otp, type });
				},
			}),
			magicLink({
				disableSignUp: false,
				async sendMagicLink({ email, url }) {
					await sendMagicLinkEmail({ email, url });
				},
			}),
			admin({
				defaultRole: "user",
				adminRoles: ["admin"],
			}),
		],
	});
}

export const auth = createAuth();
