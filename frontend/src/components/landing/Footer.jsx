// components/landing/Footer.jsx
import { Github, Linkedin, Mail } from "@/hooks/icons";

const FOOTER_LINKS = [
  { label: "Features",  href: "#features" },
  { label: "Dashboard", href: "#dashboard-preview" },
  { label: "About",     href: "#about" },
];

const SOCIAL_LINKS = [
  { Icon: Github,   href: "https://github.com/Utkarsh1407",       label: "GitHub"   },
  { Icon: Linkedin, href: "https://www.linkedin.com/in/utkarshkumar14/",     label: "LinkedIn" },
  { Icon: Mail,     href: "mailto:hello@dueflow.app", label: "Email"    },
];

export default function Footer() {
  return (
    <footer className="l-footer">
      <div className="l-container">
        <div className="l-footer__inner">
          {/* Brand */}
          <div className="l-footer__brand">
            <a href="#" className="l-navbar__logo">
              <div className="l-logo-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <span className="l-logo-name">DueFlow</span>
            </a>
            <p className="l-footer__tagline">Invoice automation for modern teams.</p>
          </div>

          {/* Nav links */}
          <div className="l-footer__links">
            {FOOTER_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="l-footer__link">
                {link.label}
              </a>
            ))}
          </div>

          {/* Social */}
          <div className="l-footer__social">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel={s.href.startsWith("http") ? "noreferrer" : undefined}
                aria-label={s.label}
                className="l-social-link"
              >
                <s.Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        <div className="l-footer__bottom">
          <span>© 2026 DueFlow. All rights reserved.</span>
          <span>hello@dueflow.app</span>
        </div>
      </div>
    </footer>
  );
}