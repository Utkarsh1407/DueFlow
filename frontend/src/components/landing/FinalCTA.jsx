// components/landing/FinalCTA.jsx
import { ArrowRight } from "@/hooks/icons";
import { useInView } from "@/hooks/hooks";

export default function FinalCTA() {
  const [ref, inView] = useInView();

  return (
    <section className="l-final-cta" ref={ref}>
      <div className="l-final-cta__blob" />

      <div className={`l-container l-final-cta__inner ${inView ? "l-animate-in" : ""}`}>
        <div className="l-section-label l-section-label--light">Get Started</div>

        <h2 className="l-final-cta__title">
          Ready to streamline your<br />
          <span className="l-gradient-text">invoice workflow?</span>
        </h2>

        <p className="l-final-cta__sub">
          Join freelancers and agencies who get paid on time with DueFlow.
        </p>

        <div className="l-hero__ctas">
          <a href="/dashboard" className="l-btn l-btn--primary l-btn--lg">
            Open Dashboard
            <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}