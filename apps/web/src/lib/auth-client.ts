import { env } from "@jewellery-management-system/env/web";
import {
	adminClient,
	emailOTPClient,
	magicLinkClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: env.VITE_SERVER_URL,
	plugins: [emailOTPClient(), magicLinkClient(), adminClient()],
});
