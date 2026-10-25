import {
  ArrowRight,
  Bot,
  FileText,
  LayoutTemplate,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import AccountActions from "./_components/AccountActions";

export default function Home() {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <Link className="brand" href="/" aria-label="AeroResume home">
          <span className="brand-mark">
            <Sparkles size={17} strokeWidth={2.2} />
          </span>
          <span>Aero<span className="brand-light">Resume</span></span>
        </Link>
        <AccountActions />
      </header>

      <section className="landing-hero">
        <div className="landing-copy">
          <span className="landing-eyebrow">
            <Sparkles size={14} /> A clearer way to build your next resume
          </span>
          <h1>Make your experience <span>take flight.</span></h1>
          <p>
            Create a polished, professional resume from your experience. Pick a
            template, edit the LaTeX source, and preview your document as you work.
          </p>
          <Link className="landing-cta" href="/templates">
            Start a new resume project <ArrowRight size={17} />
          </Link>
          <div className="landing-trust">
            <span><FileText size={15} /> Your experience, your story</span>
            <span><LayoutTemplate size={15} /> Professional templates</span>
          </div>
        </div>

        <div className="landing-preview" aria-label="Resume editor preview">
          <div className="landing-preview-top">
            <span className="landing-preview-dots"><i /><i /><i /></span>
            <span>Resume workspace</span>
            <span className="landing-preview-ready"><span /> Live preview</span>
          </div>
          <div className="landing-preview-content">
            <div className="landing-preview-source">
              <span className="landing-preview-label">SOURCE</span>
              <div className="source-line source-line-wide" />
              <div className="source-line source-line-short" />
              <div className="source-line source-line-medium" />
              <div className="source-gap" />
              <div className="source-line source-line-medium" />
              <div className="source-line source-line-wide" />
              <div className="source-line source-line-short" />
              <div className="source-gap" />
              <div className="source-line source-line-wide" />
              <div className="source-line source-line-medium" />
              <div className="source-line source-line-short" />
            </div>
            <div className="landing-preview-paper">
              <div className="preview-name" />
              <div className="preview-contact" />
              <div className="preview-rule" />
              <div className="preview-section-title" />
              <div className="preview-text preview-text-long" />
              <div className="preview-text" />
              <div className="preview-section-title" />
              <div className="preview-job" />
              <div className="preview-text preview-text-long" />
              <div className="preview-text" />
              <div className="preview-job" />
              <div className="preview-text preview-text-long" />
              <div className="preview-text" />
              <div className="preview-section-title" />
              <div className="preview-text preview-text-long" />
            </div>
          </div>
          <div className="landing-preview-caption">
            <span><Bot size={14} /> Built around your experience</span>
            <span>LaTeX editor&nbsp; · &nbsp;PDF preview</span>
          </div>
        </div>
      </section>

      <section className="landing-features" aria-label="How AeroResume works">
        <article>
          <span className="feature-icon"><LayoutTemplate size={18} /></span>
          <h2>Choose a starting point</h2>
          <p>Browse resume layouts and choose the style that fits your next step.</p>
        </article>
        <article>
          <span className="feature-icon"><FileText size={18} /></span>
          <h2>Make it yours</h2>
          <p>Work directly with the resume source and shape the details yourself.</p>
        </article>
        <article>
          <span className="feature-icon"><Sparkles size={18} /></span>
          <h2>Preview as you go</h2>
          <p>Compile your document and review the PDF beside your editor.</p>
        </article>
      </section>
      <footer className="landing-footer">AeroResume · A thoughtful workspace for your next opportunity.</footer>
    </main>
  );
}
