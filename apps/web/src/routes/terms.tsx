import { PublicFooter } from "@/components/public-footer";
import { PublicNav } from "@/components/public-nav";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
	component: TermsPage,
});

const sections = [
	{
		title: "1. Acceptance of Terms",
		body: `By accessing or using the Luminos Jewellery Management System ("Service"), you agree to be bound by these Terms and Conditions. If you do not agree to all terms, you may not access the Service. These terms apply to all users, including business owners, employees, and any other persons who access the Service.`,
	},
	{
		title: "2. Description of Service",
		body: `Luminos provides a cloud-based jewellery business management platform encompassing inventory management, sales invoicing, purchase order management, customer and supplier management, and business analytics. The Service is intended for commercial jewellery businesses operating in Nepal and internationally.`,
	},
	{
		title: "3. Account Registration",
		body: `You must register for an account to access the full Service. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your account password. You agree not to disclose your password to any third party and to take sole responsibility for any activities or actions under your account.`,
	},
	{
		title: "4. Acceptable Use",
		body: `You agree to use the Service only for lawful business purposes in accordance with applicable laws and regulations, including but not limited to Nepal's Commercial Act, Consumer Protection Act, and applicable tax regulations. You may not use the Service to process fraudulent transactions, misrepresent metal purity or gemstone quality, store or transmit harmful or unlawful content, or attempt to gain unauthorized access to any portion of the Service.`,
	},
	{
		title: "5. Metal Rates & Pricing Data",
		body: `Rate information displayed in the Service (including global spot prices and Nepal NGSDA rates) is provided for reference purposes only. While we strive to maintain accuracy, Luminos does not guarantee the accuracy, completeness, or timeliness of rate data. All business decisions, pricing, and transactions remain the sole responsibility of the user. Rate data sourced from third-party providers is subject to their respective terms.`,
	},
	{
		title: "6. Intellectual Property",
		body: `The Service and its original content, features, and functionality are and will remain the exclusive property of Luminos and its licensors. The Service is protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, sell, or lease any part of the Service without prior written consent.`,
	},
	{
		title: "7. Data and Privacy",
		body: `Your use of the Service is also governed by our Privacy Policy, which is incorporated by reference into these Terms. By using the Service, you consent to the collection and use of information as described in the Privacy Policy. Business data you enter into the Service (customers, products, transactions) remains your property. We do not sell your business data to third parties.`,
	},
	{
		title: "8. Limitation of Liability",
		body: `To the maximum extent permitted by applicable law, Luminos shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from your use or inability to use the Service. Our total liability for any claims relating to the Service shall not exceed the amount you paid for the Service in the twelve months preceding the claim.`,
	},
	{
		title: "9. Termination",
		body: `We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Service will cease. You may request an export of your data within 30 days of termination.`,
	},
	{
		title: "10. Governing Law",
		body: `These Terms shall be governed by and construed in accordance with the laws of Nepal. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of Kathmandu, Nepal. If you are accessing the Service from outside Nepal, you are responsible for compliance with local laws.`,
	},
	{
		title: "11. Changes to Terms",
		body: `We reserve the right to modify these Terms at any time. We will provide notice of significant changes by updating the date at the top of this page and, where appropriate, notifying you by email. Your continued use of the Service after changes constitutes acceptance of the updated Terms.`,
	},
	{
		title: "12. Contact",
		body: `If you have questions about these Terms, please contact us through the account portal or at the address provided in your service agreement.`,
	},
];

function TermsPage() {
	const updated = "1 May 2026";

	return (
		<div className="min-h-screen bg-[#FAFAF8] text-[#0D0D0B] dark:bg-[#0C0C0A] dark:text-[#F0F0EB]">
			<PublicNav />

			<main className="mx-auto max-w-3xl px-6 pb-24 pt-40">
				<p className="mb-4 text-[10px] tracking-[0.22em] uppercase text-[#C4A84F]">Legal</p>
				<h1 className="mb-3 text-[38px] font-light leading-[1.1] tracking-[-0.02em]">
					Terms & Conditions
				</h1>
				<p className="mb-16 text-[12px] text-[#ADADAA]">Last updated: {updated}</p>

				<div className="space-y-0 divide-y divide-[#E8E8E3] dark:divide-[#1E1E1C]">
					{sections.map((s) => (
						<div key={s.title} className="py-8">
							<h2 className="mb-3 text-[15px] font-medium">{s.title}</h2>
							<p className="text-[13px] leading-[1.8] text-[#6B6B67] dark:text-[#888882]">{s.body}</p>
						</div>
					))}
				</div>
			</main>

			<PublicFooter />
		</div>
	);
}
