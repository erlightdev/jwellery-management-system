import {
	adminProcedure,
	protectedProcedure,
	publicProcedure,
	router,
} from "../index";
import { jewelleryRouter } from "./jewellery";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	adminData: adminProcedure.query(() => {
		return {
			message: "This is admin-only",
		};
	}),
	jewellery: jewelleryRouter,
});
export type AppRouter = typeof appRouter;
