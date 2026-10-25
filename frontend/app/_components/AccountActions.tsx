"use client";

import { LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AccountActions() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const syncAuthState = () => {
      setIsAuthenticated(Boolean(window.localStorage.getItem("token")));
      setIsReady(true);
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("aero-auth-change", syncAuthState);
    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("aero-auth-change", syncAuthState);
    };
  }, []);

  const signOut = () => {
    window.localStorage.removeItem("token");
    for (const key of Object.keys(window.sessionStorage)) {
      if (key.startsWith("aero-resume-draft-")) {
        window.sessionStorage.removeItem(key);
      }
    }
    setIsAuthenticated(false);
    window.dispatchEvent(new Event("aero-auth-change"));
    router.push("/");
    router.refresh();
  };

  if (!isReady) {
    return <div className="account-actions account-actions-loading" aria-hidden="true" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="account-actions">
        <Link className="account-signin" href="/auth">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="account-actions">
      <Link className="account-profile" href="/profile">
        <span className="account-profile-icon"><UserRound size={15} /></span>
        <span>Profile</span>
      </Link>
      <button className="account-logout" type="button" onClick={signOut}>
        <LogOut size={15} />
        <span>Log out</span>
      </button>
    </div>
  );
}
