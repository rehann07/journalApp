import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";

/**
 * SignupPage
 * POST /public/signup  → UserDTO { userName, email, password, sentimentAnalysis }
 * Returns 201 on success.
 *
 * sentimentAnalysis: if true, backend will send weekly sentiment emails.
 */
export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    sentimentAnalysis: false,
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
  };

  const validate = () => {
    const errs = {};
    if (!form.userName.trim()) errs.userName = "Username is required.";
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email address.";
    if (!form.password) errs.password = "Password is required.";
    else if (form.password.length < 6)
      errs.password = "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      // Matches UserDTO: userName, email, password, sentimentAnalysis
      await api.post("/public/signup", {
        userName: form.userName.trim(),
        email: form.email.trim(),
        password: form.password,
        sentimentAnalysis: form.sentimentAnalysis,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      if (err.response?.status === 400) {
        setApiError("Username already exists or the input is invalid. Please try again.");
      } else {
        setApiError("Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-2.5 rounded-xl border ${
      errors[field]
        ? "border-red-400 dark:border-red-600 focus:ring-red-400"
        : "border-slate-300 dark:border-slate-700 focus:ring-teal-500 focus:border-teal-500"
    } bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition text-sm`;

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20 px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/40 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mb-2">Account created!</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Redirecting you to login…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500/10 dark:bg-teal-400/10 mb-4">
            <span className="text-3xl">✍️</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
            Start your journal
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Create an account to capture your thoughts
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* API Error */}
            {apiError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
                </svg>
                {apiError}
              </div>
            )}

            {/* Username */}
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Username
              </label>
              <input id="userName" name="userName" type="text" autoComplete="username" value={form.userName} onChange={handleChange} placeholder="your_username" className={inputClass("userName")} />
              {errors.userName && <p className="mt-1 text-xs text-red-500">{errors.userName}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email
              </label>
              <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className={inputClass("email")} />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <input id="password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" className={inputClass("password")} />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" className={inputClass("confirmPassword")} />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>

            {/* Sentiment Analysis toggle */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900">
              <div className="flex items-center pt-0.5">
                <input
                  id="sentimentAnalysis"
                  name="sentimentAnalysis"
                  type="checkbox"
                  checked={form.sentimentAnalysis}
                  onChange={handleChange}
                  className="w-4 h-4 accent-teal-600 rounded"
                />
              </div>
              <div>
                <label htmlFor="sentimentAnalysis" className="block text-sm font-medium text-slate-800 dark:text-slate-200 cursor-pointer">
                  📊 Weekly Sentiment Reports
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Receive a beautifully structured emotional trends summary in your inbox every Sunday morning. Entirely optional.
                </p>
                <p className="text-[11px] text-teal-600 dark:text-teal-400 mt-1 flex items-center gap-1 font-medium">
                  🔒 Privacy Note: AI analysis is only performed when enabled, and your text is processed securely.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold rounded-xl transition-colors duration-150 text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}