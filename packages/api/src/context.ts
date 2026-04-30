import { auth } from "@jewellery-management-system/auth";
import prisma from "@jewellery-management-system/db";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { fromNodeHeaders } from "better-auth/node";

export async function createContext(opts: CreateExpressContextOptions) {
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(opts.req.headers),
	});
	return {
		auth: null,
		prisma,
		session,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
