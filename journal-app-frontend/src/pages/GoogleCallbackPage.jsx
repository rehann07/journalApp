import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosConfig";

/**
 * GoogleCallbackPage — /auth/callback
 *
 * Two possible flows depending on backend configuration:
 *
 * Flow A (backend redirects to frontend with token):
 *   The backend sets the JWT as ?token=<jwt> in the redirect URL.
 *   This page reads it and logs the user in.
 *
 * Flow B (backend returns JSON at /auth/google/callback):
 *   The backend already has GET /auth/google/callback?code=...
 *   This page receives the ?code= param forwarded from Google,
 *   and calls the backend endpoint directly if no token is present.
 *
 * Currently the backend returns JSON { token: string } from the
 * /auth/google/callback endpoint, so we support both.
 */
export default function GoogleCallbackPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const token = searchParams.get("token");
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      navigate("/login?error=google_auth_failed", { replace: true });
      return;
    }

    if (token) {
      // Flow A: backend already gave us the JWT
      login(token);
      navigate("/dashboard", { replace: true });
      return;
    }

    if (code) {
      // Flow B: forward the code to our backend /auth/google/callback
      api
        .get(`/auth/google/callback`, { params: { code } })
        .then(({ data }) => {
          if (data?.token) {
            login(data.token);
            navigate("/dashboard", { replace: true });
          } else {
            throw new Error("No token in response");
          }
        })
        .catch(() => {
          navigate("/login?error=google_auth_failed", { replace: true });
        });
      return;
    }

    // No token or code — redirect back
    navigate("/login", { replace: true });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
          Completing sign-in with Google…
        </p>
      </div>
    </div>
  );
}