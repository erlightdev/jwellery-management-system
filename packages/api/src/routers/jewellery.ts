import { z } from "zod";

import { protectedProcedure, router } from "../index";

const money = z.coerce.number().min(0);
const weight = z.coerce.number().min(0);

const productInput = z.object({
	sku: z.string().min(1),
	name: z.string().min(2),
	category: z.string().min(1),
	metalType: z.string().min(1),
	purity: z.string().optional(),
	grossWeight: weight,
	netWeight: weight,
	metalRate: money,
	makingCharge: money.default(0),
	wastageCharge: money.default(0),
	stoneCharge: money.default(0),
	taxRate: money.default(0),
	barcode: z.string().optional(),
	qrCode: z.string().optional(),
	supplierId: z.string().optional(),
	quantity: z.coerce.number().int().min(0).default(1),
	reorderLevel: z.coerce.number().int().min(0).default(1),
	location: z.string().optional(),
});

const contactInput = z.object({
	name: z.string().min(2),
	email: z.string().email().optional().or(z.literal("")),
	phone: z.string().optional(),
	address: z.string().optional(),
});

const saleItemInput = z.object({
	productId: z.string().optional(),
	description: z.string().min(1),
	weight,
	metalRate: money,
	makingCharge: money.default(0),
	wastageCharge: money.default(0),
	stoneCharge: money.default(0),
	taxRate: money.default(0),
	discount: money.default(0),
});

const saleInput = z.object({
	customerId: z.string().optional(),
	paymentMethod: z.string().optional(),
	paidAmount: money.default(0),
	discount: money.default(0),
	notes: z.string().optional(),
	dueDate: z.string().optional(),
	items: z.array(saleItemInput).min(1),
});

const purchaseInput = z.object({
	supplierId: z.string().optional(),
	paymentStatus: z.string().default("pending"),
	paidAmount: money.default(0),
	notes: z.string().optional(),
	dueDate: z.string().optional(),
	items: z
		.array(
			z.object({
				productId: z.string().optional(),
				description: z.string().min(1),
				quantity: z.coerce.number().int().min(1),
				unitCost: money,
			}),
		)
		.min(1),
});

function calculateJewelleryPrice(input: {
	metalRate: number;
	weight: number;
	makingCharge: number;
	wastageCharge: number;
	stoneCharge: number;
	taxRate: number;
	discount: number;
}) {
	const metalValue = input.metalRate * input.weight;
	const taxable =
		metalValue + input.makingCharge + input.wastageCharge + input.stoneCharge;
	const tax = taxable * (input.taxRate / 100);
	const total = taxable + tax - input.discount;

	return {
		metalValue: round(metalValue),
		tax: round(tax),
		total: round(Math.max(total, 0)),
	};
}

function round(value: number) {
	return Math.round(value * 100) / 100;
}

function toNumber(value: unknown) {
	if (typeof value === "number") {
		return value;
	}

	if (value && typeof value === "object" && "toNumber" in value) {
		return (value as { toNumber: () => number }).toNumber();
	}

	return Number(value ?? 0);
}

function paymentStatus(total: number, paidAmount: number) {
	if (paidAmount <= 0) {
		return "pending";
	}

	if (paidAmount >= total) {
		return "paid";
	}

	return "partial";
}

async function nextDocumentNumber(prefix: string, count: number) {
	const date = new Date();
	const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
	return `${prefix}-${stamp}-${String(count + 1).padStart(4, "0")}`;
}

export const jewelleryRouter = router({
	summary: protectedProcedure.query(async ({ ctx }) => {
		const [products, customers, suppliers, sales, purchases, inventory] =
			await Promise.all([
				ctx.prisma.product.count(),
				ctx.prisma.customer.count(),
				ctx.prisma.supplier.count(),
				ctx.prisma.sale.findMany({
					select: { total: true, paidAmount: true, saleDate: true },
				}),
				ctx.prisma.purchase.findMany({
					select: { total: true, paidAmount: true },
				}),
				ctx.prisma.inventory.findMany({
					select: { quantity: true, reorderLevel: true },
				}),
			]);

		const revenue = sales.reduce((sum, sale) => sum + toNumber(sale.total), 0);
		const outstanding = sales.reduce(
			(sum, sale) =>
				sum + Math.max(toNumber(sale.total) - toNumber(sale.paidAmount), 0),
			0,
		);
		const purchaseDue = purchases.reduce(
			(sum, purchase) =>
				sum +
				Math.max(toNumber(purchase.total) - toNumber(purchase.paidAmount), 0),
			0,
		);

		return {
			products,
			customers,
			suppliers,
			lowStock: inventory.filter((item) => item.quantity <= item.reorderLevel)
				.length,
			revenue: round(revenue),
			outstanding: round(outstanding),
			purchaseDue: round(purchaseDue),
		};
	}),

	calendar: protectedProcedure.query(async ({ ctx }) => {
		const [sales, purchases] = await Promise.all([
			ctx.prisma.sale.findMany({
				take: 50,
				orderBy: { saleDate: "desc" },
				select: { invoiceNumber: true, saleDate: true, total: true },
			}),
			ctx.prisma.purchase.findMany({
				take: 50,
				orderBy: { purchaseDate: "desc" },
				select: { purchaseNumber: true, purchaseDate: true, total: true },
			}),
		]);

		return [
			...sales.map((sale) => ({
				id: sale.invoiceNumber,
				type: "sale",
				title: sale.invoiceNumber,
				date: sale.saleDate,
				amount: toNumber(sale.total),
			})),
			...purchases.map((purchase) => ({
				id: purchase.purchaseNumber,
				type: "purchase",
				title: purchase.purchaseNumber,
				date: purchase.purchaseDate,
				amount: toNumber(purchase.total),
			})),
		].sort((a, b) => b.date.getTime() - a.date.getTime());
	}),

	products: protectedProcedure.query(async ({ ctx }) => {
		return ctx.prisma.product.findMany({
			orderBy: { createdAt: "desc" },
			include: { inventory: true, supplier: true },
		});
	}),

	createProduct: protectedProcedure
		.input(productInput)
		.mutation(async ({ ctx, input }) => {
			const barcode = input.barcode || input.sku;
			return ctx.prisma.product.create({
				data: {
					sku: input.sku,
					name: input.name,
					category: input.category,
					metalType: input.metalType,
					purity: input.purity,
					grossWeight: input.grossWeight,
					netWeight: input.netWeight,
					metalRate: input.metalRate,
					makingCharge: input.makingCharge,
					wastageCharge: input.wastageCharge,
					stoneCharge: input.stoneCharge,
					taxRate: input.taxRate,
					barcode,
					qrCode: input.qrCode || `JMS:${barcode}`,
					supplierId: input.supplierId || undefined,
					inventory: {
						create: {
							quantity: input.quantity,
							reorderLevel: input.reorderLevel,
							location: input.location,
						},
					},
				},
			});
		}),

	customers: protectedProcedure.query(({ ctx }) => {
		return ctx.prisma.customer.findMany({ orderBy: { createdAt: "desc" } });
	}),

	createCustomer: protectedProcedure
		.input(contactInput)
		.mutation(({ ctx, input }) => {
			return ctx.prisma.customer.create({
				data: {
					name: input.name,
					email: input.email || undefined,
					phone: input.phone,
					address: input.address,
				},
			});
		}),

	suppliers: protectedProcedure.query(({ ctx }) => {
		return ctx.prisma.supplier.findMany({ orderBy: { createdAt: "desc" } });
	}),

	createSupplier: protectedProcedure
		.input(contactInput)
		.mutation(({ ctx, input }) => {
			return ctx.prisma.supplier.create({
				data: {
					name: input.name,
					email: input.email || undefined,
					phone: input.phone,
					address: input.address,
				},
			});
		}),

	sales: protectedProcedure.query(({ ctx }) => {
		return ctx.prisma.sale.findMany({
			orderBy: { saleDate: "desc" },
			include: { customer: true, items: true },
		});
	}),

	createSale: protectedProcedure
		.input(saleInput)
		.mutation(async ({ ctx, input }) => {
			const saleCount = await ctx.prisma.sale.count();
			const invoiceNumber = await nextDocumentNumber("INV", saleCount);
			const lineItems = input.items.map((item) => {
				const calculated = calculateJewelleryPrice(item);
				return {
					...item,
					lineTotal: calculated.total,
				};
			});
			const subtotal = round(
				lineItems.reduce((sum, item) => sum + item.lineTotal, 0),
			);
			const tax = round(
				input.items.reduce(
					(sum, item) => sum + calculateJewelleryPrice(item).tax,
					0,
				),
			);
			const total = round(Math.max(subtotal - input.discount, 0));

			return ctx.prisma.$transaction(async (tx) => {
				const sale = await tx.sale.create({
					data: {
						invoiceNumber,
						customerId: input.customerId || undefined,
						subtotal,
						discount: input.discount,
						tax,
						total,
						paidAmount: input.paidAmount,
						paymentMethod: input.paymentMethod,
						paymentStatus: paymentStatus(total, input.paidAmount),
						notes: input.notes,
						dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
						items: {
							create: lineItems.map((item) => ({
								productId: item.productId || undefined,
								description: item.description,
								weight: item.weight,
								metalRate: item.metalRate,
								makingCharge: item.makingCharge,
								wastageCharge: item.wastageCharge,
								stoneCharge: item.stoneCharge,
								taxRate: item.taxRate,
								discount: item.discount,
								lineTotal: item.lineTotal,
							})),
						},
					},
					include: { items: true, customer: true },
				});

				for (const item of lineItems) {
					if (item.productId) {
						await tx.inventory.updateMany({
							where: { productId: item.productId },
							data: { quantity: { decrement: 1 } },
						});
					}
				}

				return sale;
			});
		}),

	purchases: protectedProcedure.query(({ ctx }) => {
		return ctx.prisma.purchase.findMany({
			orderBy: { purchaseDate: "desc" },
			include: { supplier: true, items: true },
		});
	}),

	createPurchase: protectedProcedure
		.input(purchaseInput)
		.mutation(async ({ ctx, input }) => {
			const purchaseCount = await ctx.prisma.purchase.count();
			const purchaseNumber = await nextDocumentNumber("PO", purchaseCount);
			const items = input.items.map((item) => ({
				...item,
				lineTotal: round(item.quantity * item.unitCost),
			}));
			const total = round(items.reduce((sum, item) => sum + item.lineTotal, 0));

			return ctx.prisma.purchase.create({
				data: {
					purchaseNumber,
					supplierId: input.supplierId || undefined,
					total,
					paidAmount: input.paidAmount,
					paymentStatus: paymentStatus(total, input.paidAmount),
					notes: input.notes,
					dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
					items: {
						create: items.map((item) => ({
							productId: item.productId || undefined,
							description: item.description,
							quantity: item.quantity,
							unitCost: item.unitCost,
							lineTotal: item.lineTotal,
						})),
					},
				},
				include: { items: true, supplier: true },
			});
		}),

	reportRows: protectedProcedure.query(async ({ ctx }) => {
		const sales = await ctx.prisma.sale.findMany({
			orderBy: { saleDate: "desc" },
			include: { customer: true },
		});

		return sales.map((sale) => ({
			date: sale.saleDate.toISOString().slice(0, 10),
			invoice: sale.invoiceNumber,
			customer: sale.customer?.name ?? "Walk-in",
			subtotal: toNumber(sale.subtotal),
			discount: toNumber(sale.discount),
			tax: toNumber(sale.tax),
			total: toNumber(sale.total),
			paid: toNumber(sale.paidAmount),
			balance: round(toNumber(sale.total) - toNumber(sale.paidAmount)),
			status: sale.paymentStatus,
		}));
	}),
});
