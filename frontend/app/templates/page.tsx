"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, FileText, LayoutTemplate, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { API_BASE_URL, getApiErrorMessage } from "@/lib/api";
import AccountActions from "../_components/AccountActions";

type ResumeTemplate = {
  id: number;
  name: string;
  previewImageUrl?: string | null;
};

function isResumeTemplate(value: unknown): value is ResumeTemplate {
  if (typeof value !== "object" || value === null) return false;
  const template = value as Record<string, unknown>;
  return (
    typeof template.id === "number" &&
    typeof template.name === "string" &&
    (template.previewImageUrl === undefined ||
      template.previewImageUrl === null ||
      typeof template.previewImageUrl === "string")
  );
}

function getPreviewUrl(path?: string | null) {
  if (!path) return null;
  try {
    return new URL(path, `${API_BASE_URL}/`).toString();
  } catch {
    return null;
  }
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [creatingTemplateId, setCreatingTemplateId] = useState<number | null>(null);
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [createError, setCreateError] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [resumeNameError, setResumeNameError] = useState("");
  const resumeNameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadTemplates = async () => {
      const token = window.localStorage.getItem("token");
      if (!token) {
        setNeedsSignIn(true);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/template/`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(await getApiErrorMessage(response, `Could not load templates (${response.status}).`));
        }

        const data: unknown = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("The template service returned an unexpected response.");
        }
        if (!data.every(isResumeTemplate)) {
          throw new Error("The template service returned invalid template details.");
        }
        setTemplates(data);
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === "AbortError") return;
        setLoadError(
          loadError instanceof Error ? loadError.message : "Unable to load templates.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    void loadTemplates();
    return () => controller.abort();
  }, []);

  const startProject = async (template: ResumeTemplate) => {
    if (creatingTemplateId !== null) return;
    const trimmedResumeName = resumeName.trim();
    if (!trimmedResumeName) {
      setResumeNameError("Enter a name for your resume before choosing a template.");
      resumeNameInputRef.current?.focus();
      return;
    }

    setCreatingTemplateId(template.id);
    setCreateError("");
    setResumeNameError("");

    try {
      const token = window.localStorage.getItem("token");
      if (!token) {
        setNeedsSignIn(true);
        return;
      }

      const query = new URLSearchParams({
        templateId: String(template.id),
        resumeName: trimmedResumeName,
      });
      const response = await fetch(`${API_BASE_URL}/api/resume/?${query}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, `Could not create a resume (${response.status}).`),
        );
      }

      const payload: unknown = await response.json();
      if (typeof payload !== "object" || payload === null) {
        throw new Error("The resume service returned an unexpected response.");
      }
      const createdResume = payload as Record<string, unknown>;
      const resumeId = createdResume.id;
      const latexString = createdResume.latexContent;
      const createdName = createdResume.name;
      if (
        typeof resumeId !== "number" ||
        !Number.isSafeInteger(resumeId) ||
        resumeId <= 0 ||
        typeof latexString !== "string" ||
        !latexString.trim() ||
        typeof createdName !== "string" ||
        !createdName.trim()
      ) {
        throw new Error("The resume service returned an invalid resume response.");
      }

      window.sessionStorage.setItem(
        `aero-resume-draft-${resumeId}`,
        JSON.stringify({ latexString, resumeName: createdName }),
      );
      router.push(`/editor?templateId=${template.id}&resumeId=${resumeId}`);
    } catch (createError) {
      setCreateError(
        createError instanceof Error
          ? createError.message
          : "Unable to start the resume project. Please try again.",
      );
    } finally {
      setCreatingTemplateId(null);
    }
  };

  return (
    <main className="templates-page">
      <header className="landing-header templates-header">
        <Link className="brand" href="/" aria-label="AeroResume home">
          <span className="brand-mark"><Sparkles size={17} strokeWidth={2.2} /></span>
          <span>Aero<span className="brand-light">Resume</span></span>
        </Link>
        <Link className="templates-back" href="/"><ArrowLeft size={15} /> Home</Link>
        <AccountActions />
      </header>

      <section className="templates-content">
        <div className="templates-intro">
          <span className="landing-eyebrow"><LayoutTemplate size={14} /> TEMPLATE GALLERY</span>
          <h1>Choose your starting point</h1>
          <p>Name your resume, then select a template to open the editor.</p>
        </div>

        <label className="new-resume-name-field">
          <span>Resume name</span>
          <input
            ref={resumeNameInputRef}
            aria-label="Resume name"
            aria-invalid={Boolean(resumeNameError)}
            aria-describedby={resumeNameError ? "new-resume-name-error" : undefined}
            placeholder="For example, Product Designer Resume"
            value={resumeName}
            onChange={(event) => {
              setResumeName(event.target.value);
              if (event.target.value.trim()) setResumeNameError("");
            }}
            maxLength={120}
          />
        </label>
        {resumeNameError && (
          <p className="template-error template-name-error" id="new-resume-name-error" role="alert">
            {resumeNameError}
          </p>
        )}

        {isLoading && <p className="template-state">Loading available templates…</p>}

        {needsSignIn && (
          <div className="template-state template-state-card">
            <h2>Sign in to start a project</h2>
            <p>Your templates and resume data are connected to your account.</p>
            <Link className="landing-cta" href="/auth">Sign in <ArrowRight size={16} /></Link>
          </div>
        )}

        {loadError && <p className="template-state template-error" role="alert">{loadError}</p>}
        {createError && <p className="template-state template-error" role="alert">{createError}</p>}

        {!isLoading && !needsSignIn && !loadError && templates.length === 0 && (
          <p className="template-state">No resume templates are available yet.</p>
        )}

        {!isLoading && !needsSignIn && !loadError && templates.length > 0 && (
          <div className="template-grid">
            {templates.map((template) => {
              const previewUrl = getPreviewUrl(template.previewImageUrl);
              return (
                <button
                  className="template-card"
                  type="button"
                  onClick={() => void startProject(template)}
                  disabled={creatingTemplateId !== null}
                  key={template.id}
                >
                  <div className="template-image">
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt={`${template.name} resume template preview`}
                        fill
                        sizes="(max-width: 720px) 100vw, (max-width: 1050px) 50vw, 33vw"
                        unoptimized
                      />
                    ) : (
                      <div className="template-image-placeholder"><FileText size={38} /></div>
                    )}
                  </div>
                  <div className="template-card-details">
                    <span>
                      <strong>{template.name}</strong>
                      <small>
                        {creatingTemplateId === template.id
                          ? "Starting project…"
                          : "Resume template"}
                      </small>
                    </span>
                    <span className="template-card-arrow">
                      {creatingTemplateId === template.id ? "…" : <ArrowRight size={17} />}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
