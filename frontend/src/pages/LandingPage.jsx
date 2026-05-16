// app/page.jsx  (or wherever your landing route lives)
// No inline styles — CSS lives in styles/landing.css and globals.css.

import "@/styles/landing.css";

import Navbar          from "@/components/landing/Navbar";
import Hero            from "@/components/landing/Hero";
import Features        from "@/components/landing/Features";
import DashboardPreview from "@/components/landing/Dashboardpreview";
import EmailPreview    from "@/components/landing/Emailpreview";
import FinalCTA        from "@/components/landing/FinalCTA";
import Footer          from "@/components/landing/Footer";
import { useEffect } from "react";

export const metadata = {
  title:       "DueFlow — Invoice automation for freelancers & agencies",
  description: "Track invoices, automate payment reminders, and manage overdue payments.",
};

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <DashboardPreview />
        <EmailPreview />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}