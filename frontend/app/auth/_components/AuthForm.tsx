"use client";
import { Eye, EyeOff } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL, getApiErrorMessage } from "@/lib/api";
import type { Fields } from "@/lib/util";

type User = {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
};

type AuthFormProps = {
  title: string;
  subtitle: string;
  buttonText: string;
  fields: Fields[];
  isLogin: boolean;
  onToggleAuth: () => void;
};

const AuthForm = ({
  title,
  subtitle,
  buttonText,
  fields,
  isLogin,
  onToggleAuth,
}: AuthFormProps) => {
  const router = useRouter();
  const [user, setUser] = useState<User>({});
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackIsSuccess, setFeedbackIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback("");
    setFeedbackIsSuccess(false);
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/${isLogin ? "login" : "signup"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        },
      );
      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, `Request failed (${response.status}).`));
      }
      let data: { token?: string };
      try {
        data = await response.json();
      } catch {
        throw new Error("The authentication service returned an invalid response.");
      }
      if (isLogin && typeof data.token === "string") {
        window.localStorage.setItem("token", data.token);
        window.dispatchEvent(new Event("aero-auth-change"));
        router.push("/templates");
      } else if (isLogin) {
        throw new Error("The login response did not include an authentication token.");
      } else if (!isLogin) {
        setFeedbackIsSuccess(true);
        setFeedback("Account created. Switch to Sign In to continue.");
      }
    } catch (error) {
      setFeedbackIsSuccess(false);
      setFeedback(
        error instanceof Error ? error.message : "Unable to authenticate. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="auth-form"
    >
      <div className="auth-form-heading">
        <span className="auth-form-kicker">{isLogin ? "YOUR WORKSPACE" : "GET STARTED"}</span>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="auth-fields">
        {!isLogin && (
          <div className="auth-name-fields">
            <input
              name="firstName"
              placeholder="First Name"
              type="text"
              onChange={(e) => handleChange(e)}
              autoComplete="given-name"
              required
            />
            <input
              name="lastName"
              placeholder="Last Name"
              type="text"
              onChange={(e) => handleChange(e)}
              autoComplete="family-name"
              required
            />
          </div>
        )}
        {fields.map((f, i) =>
          f.type == "password" ? (
            <div key={i} className="relative w-full flex-1 z-0">
              <input
                name={f.name}
                placeholder={f.placeholder}
                type={showPassword ? "text" : "password"}
                onChange={(e) => handleChange(e)}
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(x => !x)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff/>:<Eye/> }
              </button>
            </div>
          ) : (
            <input
              key={i}
              name={f.name}
              placeholder={f.placeholder}
              type={f.type}
              onChange={(e) => handleChange(e)}
              autoComplete="email"
              required
            />
          ),
        )}
      </div>
      {feedback && <p role={feedbackIsSuccess ? "status" : "alert"} className={`auth-feedback ${feedbackIsSuccess ? "auth-feedback-success" : ""}`}>{feedback}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="auth-submit"
      >
        {isSubmitting ? "Please wait…" : buttonText}
      </button>
      <p className="auth-inline-switch">
        {isLogin ? "Don’t have an account?" : "Already registered?"}
        <button type="button" onClick={onToggleAuth}>
          {isLogin ? "Create one" : "Sign in"}
        </button>
      </p>
    </form>
  );
};

export default AuthForm;
