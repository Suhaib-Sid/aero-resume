"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  FileBadge,
  FileText,
  GraduationCap,
  Languages,
  Mail,
  Pencil,
  Plus,
  Save,
  Trash2,
  Trophy,
  UserRound,
  X,
} from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { API_BASE_URL, getApiErrorMessage } from "@/lib/api";
import AccountActions from "../_components/AccountActions";

type Profile = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  masterJsonData: Record<string, unknown> | null;
};

type Entry = Record<string, unknown>;
type RepeatedSection = {
  key: string;
  title: string;
  icon: typeof BriefcaseBusiness;
  fields: { key: string; label: string; placeholder: string; multiline?: boolean }[];
  emptyEntry: Entry;
};

const repeatedSections: RepeatedSection[] = [
  {
    key: "experience",
    title: "Experience",
    icon: BriefcaseBusiness,
    fields: [
      { key: "jobTitle", label: "Job title", placeholder: "Senior Product Designer" },
      { key: "company", label: "Company", placeholder: "Company name" },
      { key: "location", label: "Location", placeholder: "City, Country" },
      { key: "startDate", label: "Start date", placeholder: "Jan 2022" },
      { key: "endDate", label: "End date", placeholder: "Present" },
      { key: "description", label: "Highlights", placeholder: "Describe your impact, responsibilities, and achievements", multiline: true },
    ],
    emptyEntry: { jobTitle: "", company: "", location: "", startDate: "", endDate: "", description: "" },
  },
  {
    key: "education",
    title: "Education",
    icon: GraduationCap,
    fields: [
      { key: "degree", label: "Degree", placeholder: "B.Sc. Computer Science" },
      { key: "institution", label: "Institution", placeholder: "University or school" },
      { key: "fieldOfStudy", label: "Field of study", placeholder: "Computer Science" },
      { key: "location", label: "Location", placeholder: "City, Country" },
      { key: "startDate", label: "Start date", placeholder: "2018" },
      { key: "endDate", label: "End date", placeholder: "2022" },
      { key: "description", label: "Details", placeholder: "Relevant coursework, honors, or activities", multiline: true },
    ],
    emptyEntry: { degree: "", institution: "", fieldOfStudy: "", location: "", startDate: "", endDate: "", description: "" },
  },
  {
    key: "certifications",
    title: "Certifications",
    icon: FileBadge,
    fields: [
      { key: "name", label: "Certification", placeholder: "Certification name" },
      { key: "issuer", label: "Issuing organization", placeholder: "Organization" },
      { key: "issueDate", label: "Date", placeholder: "2024" },
      { key: "credentialUrl", label: "Credential URL", placeholder: "https://…" },
    ],
    emptyEntry: { name: "", issuer: "", issueDate: "", credentialUrl: "" },
  },
  {
    key: "projects",
    title: "Projects",
    icon: FileText,
    fields: [
      { key: "name", label: "Project name", placeholder: "Project name" },
      { key: "role", label: "Your role", placeholder: "Your role or contribution" },
      { key: "url", label: "Project URL", placeholder: "https://…" },
      { key: "description", label: "Details", placeholder: "What you built and the impact it had", multiline: true },
    ],
    emptyEntry: { name: "", role: "", url: "", description: "" },
  },
  {
    key: "languages",
    title: "Languages",
    icon: Languages,
    fields: [
      { key: "language", label: "Language", placeholder: "Spanish" },
      { key: "proficiency", label: "Proficiency", placeholder: "Fluent, conversational…" },
    ],
    emptyEntry: { language: "", proficiency: "" },
  },
  {
    key: "awards",
    title: "Awards & achievements",
    icon: Trophy,
    fields: [
      { key: "title", label: "Award or achievement", placeholder: "Award title" },
      { key: "issuer", label: "Issuer", placeholder: "Organization" },
      { key: "date", label: "Date", placeholder: "2024" },
      { key: "description", label: "Details", placeholder: "Add context or significance", multiline: true },
    ],
    emptyEntry: { title: "", issuer: "", date: "", description: "" },
  },
];

function isProfile(value: unknown): value is Profile {
  if (typeof value !== "object" || value === null) return false;
  const profile = value as Record<string, unknown>;
  return (
    typeof profile.id === "number" &&
    typeof profile.email === "string" &&
    typeof profile.firstName === "string" &&
    typeof profile.lastName === "string" &&
    (profile.masterJsonData === null ||
      (typeof profile.masterJsonData === "object" &&
        !Array.isArray(profile.masterJsonData)))
  );
}

function toEntries(value: unknown, emptyEntry: Entry): Entry[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item) => ({
      ...item,
      ...Object.fromEntries(
        Object.keys(emptyEntry).map((key) => [
          key,
          typeof item[key] === "string" ? item[key] : "",
        ]),
      ),
    }));
}

function toSkillGroups(value: unknown): { heading: string; skills: string }[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item) => ({
      heading: typeof item.heading === "string" ? item.heading : "",
      skills: Array.isArray(item.items)
        ? item.items.filter((skill): skill is string => typeof skill === "string").join(", ")
        : typeof item.skills === "string"
          ? item.skills
          : "",
    }));
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function displayValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "—";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value, null, 2) ?? String(value);
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [details, setDetails] = useState<Record<string, unknown>>({});
  const [skillGroups, setSkillGroups] = useState<{ heading: string; skills: string }[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const loadProfile = async () => {
      const token = window.localStorage.getItem("token");
      if (!token) {
        setNeedsSignIn(true);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/user/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(await getApiErrorMessage(response, `Could not load your profile (${response.status}).`));
        }
        const data: unknown = await response.json();
        if (!isProfile(data)) throw new Error("The profile service returned invalid user details.");
        setProfile(data);
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setDetails(data.masterJsonData ?? {});
        setSkillGroups(toSkillGroups(data.masterJsonData?.skills));
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === "AbortError") return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load your profile.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    void loadProfile();
    return () => controller.abort();
  }, []);

  const updateDetail = (key: string, value: string) => {
    setDetails((current) => ({ ...current, [key]: value }));
  };

  const updateEntry = (section: string, index: number, key: string, value: string) => {
    const definition = repeatedSections.find((item) => item.key === section);
    if (!definition) return;
    const entries = toEntries(details[section], definition.emptyEntry);
    const updatedEntries = entries.map((entry, entryIndex) =>
      entryIndex === index ? { ...entry, [key]: value } : entry,
    );
    setDetails((current) => ({ ...current, [section]: updatedEntries }));
  };

  const addEntry = (section: string) => {
    const definition = repeatedSections.find((item) => item.key === section);
    if (!definition) return;
    const entries = toEntries(details[section], definition.emptyEntry);
    setDetails((current) => ({
      ...current,
      [section]: [...entries, { ...definition.emptyEntry }],
    }));
  };

  const removeEntry = (section: string, index: number) => {
    const definition = repeatedSections.find((item) => item.key === section);
    if (!definition) return;
    const entries = toEntries(details[section], definition.emptyEntry);
    setDetails((current) => ({
      ...current,
      [section]: entries.filter((_, entryIndex) => entryIndex !== index),
    }));
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile) return;
    const token = window.localStorage.getItem("token");
    if (!token) {
      setNeedsSignIn(true);
      return;
    }

    setIsSaving(true);
    setError("");
    setNotice("");
    try {
      const masterJsonData = {
        ...details,
        skills: skillGroups.map((group) => ({
          heading: group.heading.trim(),
          items: group.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
        })).filter((group) => group.heading || group.items.length > 0),
      };
      const response = await fetch(`${API_BASE_URL}/api/user/profile/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: profile.id,
          email: profile.email,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          masterJsonData,
        }),
      });
      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, `Could not save your profile (${response.status}).`));
      }
      const updated: unknown = await response.json();
      if (!isProfile(updated)) throw new Error("The profile service returned an invalid saved profile.");
      setProfile(updated);
      setFirstName(updated.firstName);
      setLastName(updated.lastName);
      setDetails(updated.masterJsonData ?? {});
      setSkillGroups(toSkillGroups(updated.masterJsonData?.skills));
      setIsEditing(false);
      setNotice("Your profile details have been saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEditing = () => {
    if (!profile) return;
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setDetails(profile.masterJsonData ?? {});
    setSkillGroups(toSkillGroups(profile.masterJsonData?.skills));
    setError("");
    setNotice("");
    setIsEditing(false);
  };

  return (
    <main className="profile-page">
      <header className="landing-header templates-header">
        <Link className="brand" href="/" aria-label="AeroResume home">
          <span className="brand-mark"><UserRound size={17} /></span>
          <span>Aero<span className="brand-light">Resume</span></span>
        </Link>
        <div className="profile-header-actions">
          <Link className="templates-back" href="/templates"><ArrowLeft size={15} /> Templates</Link>
          <AccountActions />
        </div>
      </header>

      <section className="profile-content">
        <span className="landing-eyebrow"><UserRound size={14} /> YOUR ACCOUNT</span>
        <div className="profile-title-row">
          <div>
            <h1>Profile</h1>
            <p className="profile-intro">Manage your personal information and the details you want to use on your resumes.</p>
          </div>
          {profile && !isEditing && (
            <button className="profile-edit-button" type="button" onClick={() => { setNotice(""); setIsEditing(true); }}>
              <Pencil size={15} /> Edit profile
            </button>
          )}
        </div>

        {isLoading && <p className="profile-state">Loading your profile…</p>}
        {needsSignIn && (
          <div className="profile-state-card">
            <h2>Sign in to view your profile</h2>
            <p>Your account details are available after signing in.</p>
            <Link className="landing-cta" href="/auth">Sign in</Link>
          </div>
        )}
        {error && <p className="profile-feedback profile-error" role="alert">{error}</p>}
        {notice && <p className="profile-feedback profile-success" role="status">{notice}</p>}

        {profile && (
          <>
            <section className="profile-card" aria-label="Account details">
              <div className="profile-card-cover" />
              <div className="profile-card-main">
                <div className="profile-avatar"><UserRound size={27} /></div>
                <div className="profile-name">
                  <span className="profile-status"><BadgeCheck size={13} /> Account profile</span>
                  <h2>{[profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Your profile"}</h2>
                  <p><Mail size={14} /> {profile.email}</p>
                </div>
                <div className="profile-id">Account #{profile.id}</div>
              </div>
            </section>

            {isEditing ? (
              <form className="profile-edit-form" onSubmit={saveProfile}>
                <section className="profile-edit-card">
                  <div className="profile-section-heading">
                    <span className="profile-section-icon"><UserRound size={18} /></span>
                    <div><h2>Personal information</h2><p>Contact details and professional summary</p></div>
                  </div>
                  <div className="profile-form-grid">
                    <label className="profile-field"><span>First name</span><input required value={firstName} onChange={(event) => setFirstName(event.target.value)} /></label>
                    <label className="profile-field"><span>Last name</span><input required value={lastName} onChange={(event) => setLastName(event.target.value)} /></label>
                    <label className="profile-field"><span>Email</span><input value={profile.email} readOnly /></label>
                      <label className="profile-field"><span>Phone</span><input value={stringValue(details.phone)} onChange={(event) => updateDetail("phone", event.target.value)} placeholder="+1 555 010 1234" /></label>
                    <label className="profile-field"><span>Location</span><input value={stringValue(details.location)} onChange={(event) => updateDetail("location", event.target.value)} placeholder="City, Country" /></label>
                    <label className="profile-field"><span>Website</span><input type="url" value={stringValue(details.website)} onChange={(event) => updateDetail("website", event.target.value)} placeholder="https://your-portfolio.com" /></label>
                    <label className="profile-field"><span>LinkedIn</span><input value={stringValue(details.linkedin)} onChange={(event) => updateDetail("linkedin", event.target.value)} placeholder="LinkedIn profile URL" /></label>
                    <label className="profile-field profile-field-wide"><span>Professional summary</span><textarea rows={4} value={stringValue(details.summary)} onChange={(event) => updateDetail("summary", event.target.value)} placeholder="A short introduction highlighting your strengths and career focus." /></label>
                  </div>
                </section>

                {repeatedSections.slice(0, 2).map((section) => (
                  <EditableSection
                    key={section.key}
                    section={section}
                    entries={toEntries(details[section.key], section.emptyEntry)}
                    onAdd={() => addEntry(section.key)}
                    onChange={(index, key, value) => updateEntry(section.key, index, key, value)}
                    onRemove={(index) => removeEntry(section.key, index)}
                  />
                ))}

                <section className="profile-edit-card">
                  <div className="profile-section-heading">
                    <span className="profile-section-icon"><BadgeCheck size={18} /></span>
                    <div><h2>Skills</h2><p>Group skills under custom headings such as “Design” or “Tools”</p></div>
                  </div>
                  <div className="profile-repeat-list">
                    {skillGroups.map((group, index) => (
                      <div className="profile-entry-card" key={`skill-group-${index}`}>
                        <div className="profile-entry-header"><span>Skill group {index + 1}</span><button className="profile-remove-button" type="button" onClick={() => setSkillGroups((groups) => groups.filter((_, groupIndex) => groupIndex !== index))} aria-label={`Remove skill group ${index + 1}`}><Trash2 size={15} /></button></div>
                        <div className="profile-form-grid">
                          <label className="profile-field"><span>Heading</span><input value={group.heading} onChange={(event) => setSkillGroups((groups) => groups.map((item, groupIndex) => groupIndex === index ? { ...item, heading: event.target.value } : item))} placeholder="Design tools" /></label>
                          <label className="profile-field"><span>Skills</span><input value={group.skills} onChange={(event) => setSkillGroups((groups) => groups.map((item, groupIndex) => groupIndex === index ? { ...item, skills: event.target.value } : item))} placeholder="Figma, prototyping, design systems" /></label>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="profile-add-button" type="button" onClick={() => setSkillGroups((groups) => [...groups, { heading: "", skills: "" }])}><Plus size={15} /> Add skill group</button>
                </section>

                {repeatedSections.slice(2).map((section) => (
                  <EditableSection
                    key={section.key}
                    section={section}
                    entries={toEntries(details[section.key], section.emptyEntry)}
                    onAdd={() => addEntry(section.key)}
                    onChange={(index, key, value) => updateEntry(section.key, index, key, value)}
                    onRemove={(index) => removeEntry(section.key, index)}
                  />
                ))}

                <div className="profile-form-actions">
                  <button className="profile-cancel-button" type="button" onClick={cancelEditing} disabled={isSaving}><X size={15} /> Cancel</button>
                  <button className="profile-save-button" type="submit" disabled={isSaving}><Save size={15} /> {isSaving ? "Saving…" : "Save profile"}</button>
                </div>
              </form>
            ) : (
              <section className="profile-data-card">
                <div className="profile-section-heading">
                  <span className="profile-section-icon"><FileText size={18} /></span>
                  <div><h2>Resume details</h2><p>Your saved contact information and resume content</p></div>
                </div>
                <div className="profile-view-grid">
                  {Object.entries(profile.masterJsonData ?? {}).filter(([, value]) => value !== null && value !== undefined && value !== "").map(([key, value]) => (
                    <div className="profile-view-item" key={key}>
                      <h3>{key.replace(/([A-Z])/g, " $1").replaceAll("_", " ")}</h3>
                      <ProfileValue value={value} />
                    </div>
                  ))}
                  {!profile.masterJsonData || Object.keys(profile.masterJsonData).length === 0 ? (
                    <p className="profile-empty">Add your contact information, experience, skills, and more to get started.</p>
                  ) : null}
                </div>
              </section>
            )}
          </>
        )}
      </section>
    </main>
  );
}

function EditableSection({
  section,
  entries,
  onAdd,
  onChange,
  onRemove,
}: {
  section: RepeatedSection;
  entries: Entry[];
  onAdd: () => void;
  onChange: (index: number, key: string, value: string) => void;
  onRemove: (index: number) => void;
}) {
  const Icon = section.icon;
  return (
    <section className="profile-edit-card">
      <div className="profile-section-heading">
        <span className="profile-section-icon"><Icon size={18} /></span>
        <div><h2>{section.title}</h2><p>Add one or more entries to your resume</p></div>
      </div>
      <div className="profile-repeat-list">
        {entries.map((entry, index) => (
          <div className="profile-entry-card" key={`${section.key}-${index}`}>
            <div className="profile-entry-header">
              <span>{section.title} {index + 1}</span>
              <button className="profile-remove-button" type="button" onClick={() => onRemove(index)} aria-label={`Remove ${section.title.toLowerCase()} ${index + 1}`}><Trash2 size={15} /></button>
            </div>
            <div className="profile-form-grid">
              {section.fields.map((field) => (
                <label className={`profile-field ${field.multiline ? "profile-field-wide" : ""}`} key={field.key}>
                  <span>{field.label}</span>
                  {field.multiline ? (
                    <textarea rows={3} value={stringValue(entry[field.key])} onChange={(event) => onChange(index, field.key, event.target.value)} placeholder={field.placeholder} />
                  ) : (
                    <input value={stringValue(entry[field.key])} onChange={(event) => onChange(index, field.key, event.target.value)} placeholder={field.placeholder} />
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button className="profile-add-button" type="button" onClick={onAdd}><Plus size={15} /> Add {section.title.toLowerCase()}</button>
    </section>
  );
}

function ProfileValue({ value }: { value: unknown }) {
  if (Array.isArray(value)) {
    if (value.every((item) => typeof item === "string")) {
      return <div className="profile-chip-list">{value.map((item, index) => <span className="profile-chip" key={`${item}-${index}`}>{item}</span>)}</div>;
    }
    return (
      <div className="profile-view-entries">
        {value.map((item, index) => (
          <article className="profile-view-entry" key={index}>
            {typeof item === "object" && item !== null
              ? Object.entries(item).map(([entryKey, entryValue]) => (
                  <p key={entryKey}><strong>{entryKey.replace(/([A-Z])/g, " $1").replaceAll("_", " ")}:</strong> {displayValue(entryValue)}</p>
                ))
              : <p>{displayValue(item)}</p>}
          </article>
        ))}
      </div>
    );
  }
  return <p className="profile-view-text">{displayValue(value)}</p>;
}
