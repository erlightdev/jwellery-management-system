import {
	adminProcedure,
	protectedProcedure,
	publicProcedure,
	router,
} from "../index";
import { jewelleryRouter } from "./jewellery";
import { metalRatesRouter } from "./metal-rates";

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
	metalRates: metalRatesRouter,
});
export type AppRouter = typeof appRouter;
