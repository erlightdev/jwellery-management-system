import { initTRPC, TRPCError } from "@trpc/server";

import type { Context } from "./context";

export const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.session) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Authentication required",
			cause: "No session",
		});
	}
	return next({
		ctx: {
			...ctx,
			session: ctx.session,
		},
	});
});

export const verifiedProcedure = protectedProcedure.use(({ ctx, next }) => {
	if (!ctx.session.user.emailVerified) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Email verification required",
		});
	}

	return next({ ctx });
});

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
	const role = (ctx.session.user as { role?: string | null }).role;

	if (role !== "admin") {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Admin role required",
		});
	}

	return next({ ctx });
});
