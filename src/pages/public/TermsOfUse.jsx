// src/pages/public/TermsOfUse.jsx

import PublicNavbar from "../../components/layout/PublicNavbar";
import PublicFooter from "../../components/layout/PublicFooter";
import { Link } from "react-router-dom";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using the QREventix platform (website or app), you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree, please do not use our services.

These terms apply to all users — attendees, event organisers, and visitors.`,
  },
  {
    title: "2. Your Account",
    content: `You must register for an account to book tickets or list events. You agree to:

• Provide accurate and up-to-date information during registration.
• Maintain the confidentiality of your account credentials.
• Notify us immediately of any unauthorised use of your account.
• Be responsible for all activity that occurs under your account.

Accounts must be for individual use only. Sharing account credentials is not permitted.`,
  },
  {
    title: "3. Ticket Purchases",
    content: `All ticket sales are final unless the event is cancelled by the organiser. When you purchase a ticket:

• You receive a non-transferable QR ticket linked to your account.
• Tickets may not be resold or transferred without the organiser's written consent.
• QREventix acts as a technology platform — it is not a party to the contract between you and the event organiser.
• In the event of a cancellation, refunds are governed by the organiser's cancellation policy. QREventix will facilitate the refund process but is not liable for refund delays caused by third parties.`,
  },
  {
    title: "4. For Event Organisers",
    content: `If you list events as an organiser, you additionally agree to:

• Provide accurate event information including date, venue, capacity, and ticket pricing.
• Comply with all applicable local laws regarding event permits, safety, and taxes.
• Not list events that are fraudulent, illegal, or violate third-party rights.
• Honour all tickets sold through the platform.
• Pay QREventix's platform fee as specified in the Organiser Agreement.

QREventix reserves the right to remove events or suspend organiser accounts that violate these terms.`,
  },
  {
    title: "5. Prohibited Conduct",
    content: `You agree not to:

• Use the platform for any unlawful purpose or in violation of applicable law.
• Post false, misleading, or fraudulent event listings.
• Attempt to scrape, reverse-engineer, or disrupt the platform.
• Harass, abuse, or harm other users.
• Use automated bots or scripts to purchase tickets.
• Circumvent any security or access control measures.

Violation of these prohibitions may result in immediate account termination and legal action.`,
  },
  {
    title: "6. Intellectual Property",
    content: `All content on the QREventix platform — including the brand, logo, design, software, and text — is owned by QREventix Technologies Pvt. Ltd. or its licensors and is protected by applicable intellectual property laws.

You may not reproduce, distribute, or create derivative works from our content without prior written permission. Event organisers retain ownership of their event content but grant QREventix a licence to display it on the platform.`,
  },
  {
    title: "7. Disclaimers & Limitation of Liability",
    content: `The QREventix platform is provided "as is" without warranties of any kind. We do not guarantee:

• Uninterrupted or error-free operation of the platform.
• The accuracy of event information provided by organisers.
• That events will proceed as listed.

To the fullest extent permitted by law, QREventix shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability to you shall not exceed the amount you paid for the specific ticket giving rise to the claim.`,
  },
  {
    title: "8. Governing Law & Disputes",
    content: `These Terms are governed by the laws of India. Any disputes shall first be attempted to be resolved through good-faith negotiation. If unresolved, disputes shall be subject to the exclusive jurisdiction of the courts of Bangalore, Karnataka.`,
  },
  {
    title: "9. Changes to These Terms",
    content: `We may revise these Terms from time to time. We will notify you of material changes by email and/or a notice on the platform at least 14 days before changes take effect. Your continued use of QREventix after the effective date constitutes your acceptance of the revised Terms.`,
  },
  {
    title: "10. Contact",
    content: `Questions about these Terms? Contact us at:

Email: legal@qreventix.in
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

export default function TermsOfUse() {
  return (
    <>
      <PublicNavbar />

      {/* Hero */}
      <section className="bg-gradient-to-r from-slate-800 to-slate-900 py-16 text-white">
        <div className="container-page">
          <h1 className="text-4xl font-black">Terms of Use</h1>
          <p className="mt-3 text-white/60">Last updated: 1 June 2026</p>
          <p className="mt-4 max-w-2xl text-white/70 leading-relaxed">
            Please read these Terms of Use carefully before using QREventix. They govern your
            relationship with QREventix Technologies Pvt. Ltd. and your use of our event discovery
            and ticketing platform.
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
            <p className="text-slate-700">
              Questions about our Terms?{" "}
              <Link to="/contact" className="text-indigo-600 hover:underline font-semibold">
                Contact us
              </Link>{" "}
              or review our{" "}
              <Link to="/privacy" className="text-indigo-600 hover:underline font-semibold">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
