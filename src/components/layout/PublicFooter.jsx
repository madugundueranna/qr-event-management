// src/components/layout/PublicFooter.jsx  →  QREventix footer

import { Link } from "react-router-dom";
import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { MdQrCode2 } from "react-icons/md";
import {
  FaFacebook, FaInstagram, FaLinkedin, FaTwitter, FaYoutube,
} from "react-icons/fa";

const footerLinks = {
  Explore: [
    { label: "All Events",        to: "/events" },
    { label: "Music",             to: "/events/category/music" },
    { label: "Tech & Conferences",to: "/events/category/tech-conferences" },
    { label: "Sports",            to: "/events/category/sports" },
    { label: "Arts & Culture",    to: "/events/category/arts-culture" },
  ],
  Company: [
    { label: "About Us",  to: "/about"   },
    { label: "Careers",   to: "/careers" },
    { label: "Blog",      to: "/blog"    },
    { label: "Press",     to: "/press"   },
  ],
  Support: [
    { label: "Help Center",    to: "/help"         },
    { label: "Contact Us",     to: "/contact"      },
    { label: "Report Issue",   to: "/report-issue" },
    { label: "Privacy Policy", to: "/privacy"      },
    { label: "Terms of Use",   to: "/terms"        },
  ],
};

const socials = [
  { Icon: FaFacebook,  href: import.meta.env.VITE_SOCIAL_FACEBOOK,  label: "Facebook"  },
  { Icon: FaInstagram, href: import.meta.env.VITE_SOCIAL_INSTAGRAM, label: "Instagram" },
  { Icon: FaTwitter,   href: import.meta.env.VITE_SOCIAL_TWITTER,   label: "Twitter"   },
  { Icon: FaLinkedin,  href: import.meta.env.VITE_SOCIAL_LINKEDIN,  label: "LinkedIn"  },
  { Icon: FaYoutube,   href: import.meta.env.VITE_SOCIAL_YOUTUBE,   label: "YouTube"   },
].filter(({ href }) => href);

export default function PublicFooter() {
  return (
    <footer className="bg-ink-900 text-white">
      <div className="container-page py-16">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 font-black text-xl">Q</div>
              <div>
                <p className="font-bold tracking-[0.3em]">QREventix</p>
                <p className="text-xs tracking-[0.4em] text-white/50">EVENTS</p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-white/60 leading-relaxed">
              India's premier event discovery platform with instant QR ticket generation and contactless check-in for seamless experiences.
            </p>

            <div className="mt-6 space-y-3 text-sm text-white/60">
              <div className="flex items-start gap-3">
                <FiMapPin className="mt-0.5 shrink-0 text-indigo-400" />
                <span>No. 12, Brigade Road, Bangalore – 560025, Karnataka</span>
              </div>
              <div className="flex items-center gap-3">
                <FiPhone className="shrink-0 text-indigo-400" />
                <span>+91 80 4120 5000</span>
              </div>
              <div className="flex items-center gap-3">
                <FiMail className="shrink-0 text-indigo-400" />
                <span>support@qreventix.in</span>
              </div>
            </div>

            <div className="mt-7 flex gap-3">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white/70 transition hover:bg-indigo-600 hover:text-white"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-5 font-bold tracking-wide text-white">{title}</h4>
              <ul className="space-y-3">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-white/60 transition hover:text-indigo-400"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-white/40">
            <MdQrCode2 />
            © {new Date().getFullYear()} QREventix. All rights reserved.
          </div>
          <p className="text-sm text-white/40">
            QR-Powered Events · Secure Tickets · Contactless Entry
          </p>
        </div>
      </div>
    </footer>
  );
}
