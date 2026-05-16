// components/landing/Navbar.jsx
import { useState } from "react";
import { Menu, X } from "@/hooks/icons";
import { useScrolled } from "@/hooks/hooks";

const NAV_LINKS = [
  { label: "Features",  href: "#features" },
  { label: "Dashboard", href: "#dashboard-preview" },
  { label: "About",     href: "#about" },
];

const LogoIcon = ({ sm }) => (
  <div className={sm ? "l-logo-icon l-logo-icon--sm" : "l-logo-icon"}>
    <svg
      width={sm ? 12 : 18}
      height={sm ? 12 : 18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#000"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  </div>
);

export default function Navbar() {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);

  return (
    <nav className={`l-navbar ${scrolled ? "l-navbar--scrolled" : ""}`}>
      <div className="l-navbar__inner">
        {/* Logo */}
        <a href="#" className="l-navbar__logo">
          <LogoIcon />
          <span className="l-logo-name">DueFlow</span>
        </a>

        {/* Desktop links */}
        <ul className="l-navbar__links">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a href={link.href} className="l-navbar__link">{link.label}</a>
            </li>
          ))}
        </ul>

        {/* Desktop CTAs */}
        <div className="l-navbar__ctas">
          <a href="/sign-in"    className="l-btn l-btn--ghost">Login</a>
          <a href="/dashboard"  className="l-btn l-btn--primary">Open Dashboard</a>
        </div>

        {/* Hamburger */}
        <button
          className="l-navbar__hamburger"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`l-navbar__drawer ${open ? "l-navbar__drawer--open" : ""}`}>
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="l-drawer__link"
            onClick={() => setOpen(false)}
          >
            {link.label}
          </a>
        ))}
        <div className="l-drawer__ctas">
          <a href="/sign-in"   className="l-btn l-btn--ghost   l-btn--full">Login</a>
          <a href="/dashboard" className="l-btn l-btn--primary l-btn--full">Open Dashboard</a>
        </div>
      </div>
    </nav>
  );
}