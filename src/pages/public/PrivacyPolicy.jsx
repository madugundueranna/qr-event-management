// src/pages/public/PrivacyPolicy.jsx

import PublicNavbar from "../../components/layout/PublicNavbar";
import PublicFooter from "../../components/layout/PublicFooter";
import { Link } from "react-router-dom";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    content: `We collect information you provide directly when you create an account, book a ticket, or contact us. This includes:

• **Account data**: Name, email address, phone number, and password (hashed).
• **Booking data**: Event preferences, ticket tiers selected, and payment transaction references.
• **Device & usage data**: IP address, browser type, pages visited, and time spent on the platform.
• **Communications**: Messages sent to our support team.

We do not collect or store your card numbers — payments are processed securely by Razorpay.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use the information we collect to:

• Provide, operate, and improve the QREventix platform.
• Generate and deliver your QR tickets.
• Process payments and send booking confirmations.
• Respond to support enquiries.
• Send transactional emails (booking confirmations, password resets) and, with your consent, marketing communications about events you may like.
• Detect and prevent fraud, abuse, and security incidents.
• Comply with legal obligations.`,
  },
  {
    title: "3. Sharing of Information",
    content: `We do not sell your personal data. We may share information with:

• **Event Organisers**: Your name and contact details are shared with the organiser of events you register for, to facilitate entry and communication.
• **Payment Processors**: Razorpay receives transaction data necessary to process payments.
• **Service Providers**: We use trusted third-party services (e.g., Cloudinary for media, email providers) that process data on our behalf under strict confidentiality agreements.
• **Legal Requirements**: We may disclose information when required by law, court order, or to protect the rights and safety of QREventix and its users.`,
  },
  {
    title: "4. Cookies & Tracking",
    content: `QREventix uses cookies and similar technologies to:

• Keep you logged in (authentication cookies — HTTP-only, secure).
• Remember your preferences.
• Analyse platform usage through aggregated analytics.

You can control cookie settings through your browser. Disabling authentication cookies will require you to log in on every visit.`,
  },
  {
    title: "5. Data Retention",
    content: `We retain your account data for as long as your account is active or as needed to provide services. Booking and ticket records are retained for 7 years for tax and legal compliance. You may request deletion of your account at any time; we will delete your personal data within 30 days, except where retention is required by law.`,
  },
  {
    title: "6. Security",
    content: `We implement industry-standard security measures including TLS encryption for data in transit, bcrypt password hashing, HTTP-only authentication cookies, and regular security audits. While we strive to protect your data, no internet transmission is 100% secure. Please use a strong, unique password and log out of shared devices.`,
  },
  {
    title: "7. Your Rights",
    content: `Subject to applicable law, you have the right to:

• **Access**: Request a copy of your personal data.
• **Correction**: Update inaccurate information via your account settings.
• **Deletion**: Request deletion of your account and associated personal data.
• **Portability**: Request your data in a machine-readable format.
• **Opt-out**: Unsubscribe from marketing emails at any time using the link in those emails.

To exercise these rights, contact us at privacy@qreventix.in.`,
  },
  {
    title: "8. Children's Privacy",
    content: `QREventix is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal data, contact us immediately and we will delete the information.`,
  },
  {
    title: "9. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. When we make material changes, we'll notify you by email and/or by displaying a prominent notice on the platform. Your continued use of QREventix after such notification constitutes acceptance of the updated policy.`,
  },
  {
    title: "10. Contact Us",
    content: `For privacy-related questions or requests, contact our Data Protection Officer at:

Email: privacy@qreventix.in
Address: QREventix Technologies Pvt. Ltd., No. 12, Brigade Road, Bangalore – 560025, Karnataka, India.`,
  },
];

function renderContent(content) {
  return content.split("\n").map((line, i) => {
    if (!line.trim()) return <br key={i} />;
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className="mt-2 text-slate-600 leading-relaxed text-sm">
        {parts.map((part, j) =>
          part.startsWith("**") && part.endsWith("**")
            ? <strong key={j} className="text-slate-800">{part.slice(2, -2)}</strong>
            : part
        )}
      </p>
    );
  });
}

export default function PrivacyPolicy() {
  return (
    <>
      <PublicNavbar />

      {/* Hero */}
      <section className="bg-gradient-to-r from-slate-800 to-slate-900 py-16 text-white">
        <div className="container-page">
          <h1 className="text-4xl font-black">Privacy Policy</h1>
          <p className="mt-3 text-white/60">Last updated: 1 June 2026</p>
          <p className="mt-4 max-w-2xl text-white/70 leading-relaxed">
            QREventix Technologies Pvt. Ltd. ("QREventix", "we", "us") is committed to protecting
            your personal information. This policy explains how we collect, use, and safeguard your
            data when you use our platform.
          </p>
        </div>
      </section>

      <main className="container-page py-16">
        <div className="mx-auto max-w-3xl">
          <div className="space-y-8">
            {SECTIONS.map(({ title, content }) => (
              <section key={title} className="glass-card p-7">
                <h2 className="text-lg font-black text-slate-900">{title}</h2>
                <div className="mt-3">{renderContent(content)}</div>
              </section>
            ))}
          </div>

          <div className="mt-12 rounded-2xl bg-indigo-50 border border-indigo-100 p-6 text-center">
            <p className="text-slate-700">Have questions about your privacy? We're here to help.</p>
            <Link to="/contact" className="btn-primary mt-4 inline-block px-6 py-2.5">
              Contact Us
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
