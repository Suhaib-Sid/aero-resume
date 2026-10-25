import EditorWorkspace from "./EditorWorkspace";

export default async function EditorPage({
  searchParams,
}: {
  searchParams: Promise<{ templateId?: string; resumeId?: string }>;
}) {
  const { templateId, resumeId } = await searchParams;
  const validTemplateId = templateId && /^\d+$/.test(templateId) ? templateId : "";
  const validResumeId =
    resumeId && /^\d+$/.test(resumeId) && Number(resumeId) > 0
      ? Number(resumeId)
      : null;

  if (!validTemplateId || !validResumeId) {
    return (
      <main className="route-message">
        <h1>Resume project unavailable</h1>
        <p>Start a new project from the template gallery to load its draft.</p>
        <a className="landing-cta" href="/templates">Browse templates</a>
      </main>
    );
  }

  return (
    <EditorWorkspace
      key={validResumeId}
      templateId={validTemplateId}
      resumeId={validResumeId}
    />
  );
}
