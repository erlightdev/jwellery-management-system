export function formatMoney(value: unknown) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 2,
	}).format(Number(value ?? 0));
}

export function formatDate(value: unknown) {
	if (!value) {
		return "-";
	}

	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(new Date(String(value)));
}

export function jewelleryPrice(input: {
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
	return Math.max(taxable + tax - input.discount, 0);
}

export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
	if (!rows.length) {
		return;
	}

	const headers = Object.keys(rows[0] ?? {});
	const csv = [
		headers.join(","),
		...rows.map((row) =>
			headers
				.map((header) => {
					const value = String(row[header] ?? "");
					return `"${value.replaceAll('"', '""')}"`;
				})
				.join(","),
		),
	].join("\n");

	const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}

export function Barcode({ value }: { value?: string | null }) {
	const text = value || "NO-CODE";
	return (
		<div className="inline-flex flex-col gap-1">
			<div
				className="h-8 w-32 border bg-[repeating-linear-gradient(90deg,currentColor_0_2px,transparent_2px_5px,currentColor_5px_6px,transparent_6px_10px)] text-foreground"
				role="img"
				aria-label={`Barcode ${text}`}
			/>
			<span className="font-mono text-[10px] text-muted-foreground">
				{text}
			</span>
		</div>
	);
}

export function QrMark({ value }: { value?: string | null }) {
	const text = value || "JMS";
	return (
		<div
			className="grid size-12 place-items-center border bg-[length:12px_12px] bg-[linear-gradient(45deg,currentColor_25%,transparent_25%),linear-gradient(-45deg,currentColor_25%,transparent_25%),linear-gradient(45deg,transparent_75%,currentColor_75%),linear-gradient(-45deg,transparent_75%,currentColor_75%)] bg-[position:0_0,0_6px,6px_-6px,-6px_0] text-foreground"
			title={text}
		>
			<span className="sr-only">{text}</span>
		</div>
	);
}
