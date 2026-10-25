"use client";

import { ArrowLeft, FileText, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import AuthForm from "./_components/AuthForm";

const fields = [
  { name: "email", type: "email", placeholder: "Email address" },
  { name: "password", type: "password", placeholder: "Password" },
];

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <main className="auth-page">
      <header className="auth-header">
        <Link className="brand" href="/" aria-label="AeroResume home">
          <span className="brand-mark"><Sparkles size={17} strokeWidth={2.2} /></span>
          <span>Aero<span className="brand-light">Resume</span></span>
        </Link>
        <Link className="auth-back" href="/"><ArrowLeft size={15} /> Back to home</Link>
      </header>

      <section className={`auth-layout ${isLogin ? "auth-login-mode" : "auth-signup-mode"}`}>
        <div className="auth-form-card">
          <div className="auth-mobile-brand">
            <span className="auth-mobile-icon"><FileText size={17} /></span>
            <span>{isLogin ? "Welcome back" : "Start your next chapter"}</span>
          </div>
          <AuthForm
            key={isLogin ? "login" : "signup"}
            title={isLogin ? "Welcome back" : "Create your account"}
            subtitle={
              isLogin
                ? "Sign in to continue building your resume."
                : "Sign up to start creating a polished resume."
            }
            buttonText={isLogin ? "Sign in" : "Create account"}
            fields={fields}
            isLogin={isLogin}
            onToggleAuth={() => setIsLogin((current) => !current)}
          />
        </div>

        <aside className="auth-aside">
          <div className="auth-aside-decoration auth-decoration-one" />
          <div className="auth-aside-decoration auth-decoration-two" />
          <span className="auth-aside-mark"><Sparkles size={19} /></span>
          <p className="auth-aside-eyebrow">AERORESUME WORKSPACE</p>
          <h1>{isLogin ? "Your next opportunity starts here." : "Make your experience stand out."}</h1>
          <p className="auth-aside-copy">
            {isLogin
              ? "Return to your resume projects, refine your story, and get ready for what’s next."
              : "Choose a template, add your details, and shape a resume that feels like you."}
          </p>
          <div className="auth-aside-note">
            <span className="auth-note-dot" />
            A clear, focused space for your next step
          </div>
          <div className="auth-mode-switch">
            <span>{isLogin ? "New to AeroResume?" : "Already have an account?"}</span>
            <button type="button" onClick={() => setIsLogin((current) => !current)}>
              {isLogin ? "Create account" : "Sign in"}
            </button>
          </div>
        </aside>
      </section>
      <footer className="auth-footer">AeroResume · Your experience, thoughtfully presented.</footer>
    </main>
  );
}
