import EditorWorkspace from "./EditorWorkspace";

export default async function EditorPage({
  searchParams,
}: {
  searchParams: Promise<{ templateId?: string }>;
}) {
  const { templateId } = await searchParams;
  const validTemplateId = templateId && /^\d+$/.test(templateId) ? templateId : "";

  if (!validTemplateId) {
    return (
      <main className="route-message">
        <h1>Choose a resume template</h1>
        <p>Start a project by selecting a template first.</p>
        <a className="landing-cta" href="/templates">Browse templates</a>
      </main>
    );
  }

  return <EditorWorkspace templateId={validTemplateId} />;
}
