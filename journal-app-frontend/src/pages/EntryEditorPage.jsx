import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axiosConfig";
import { useToast } from "../hooks/useToast";
import ToastContainer from "../components/ToastContainer";

const SENTIMENT_LABELS = {
  HAPPY:   { emoji: "😊", label: "Happy",   cls: "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" },
  SAD:     { emoji: "😔", label: "Sad",     cls: "border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" },
  ANGRY:   { emoji: "😤", label: "Angry",   cls: "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400" },
  ANXIOUS: { emoji: "😰", label: "Anxious", cls: "border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400" },
};

/**
 * EntryEditorPage — handles both Create and Edit modes.
 *
 * Create: route /entry/new  → POST /journal
 * Edit:   route /entry/:id  → GET /journal/id/:id, then PUT /journal/id/:id
 *
 * JournalEntry fields sent: { title, content }
 * JournalEntry received:    { id, title, content, date, sentiment }
 */
export default function EntryEditorPage() {
  const { id } = useParams(); // undefined on /entry/new
  const isEdit = Boolean(id) && id !== "new";
  const navigate = useNavigate();
  const { toasts, showToast, dismissToast } = useToast();

  const [form, setForm] = useState({ title: "", content: "" });
  const [sentiment, setSentiment] = useState(null); // read-only display from backend
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [charCount, setCharCount] = useState(0);

  // Load existing entry for edit mode
  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/journal/id/${id}`)
      .then(({ data }) => {
        setForm({ title: data.title || "", content: data.content || "" });
        setSentiment(data.sentiment || null);
        setCharCount((data.content || "").length);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          showToast("Entry not found.", "error");
          navigate("/dashboard");
        } else {
          setError("Failed to load entry.");
        }
      })
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "content") setCharCount(value.length);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Please add a title before saving.");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        // PUT /journal/id/:id → { title, content }
        const { data } = await api.put(`/journal/id/${id}`, {
          title: form.title.trim(),
          content: form.content.trim(),
        });
        setSentiment(data.sentiment || null);
        showToast("Entry updated successfully.", "success");
        setTimeout(() => navigate("/dashboard"), 800);
      } else {
        // POST /journal → { title, content }
        await api.post("/journal", {
          title: form.title.trim(),
          content: form.content.trim(),
        });
        showToast("Entry created!", "success");
        setTimeout(() => navigate("/dashboard"), 800);
      }
    } catch {
      showToast("Failed to save entry. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 flex justify-center">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <div className="w-5 h-5 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
          Loading entry…
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <ToastContainer toasts={toasts} dismissToast={dismissToast} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
        <Link to="/dashboard" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
          Dashboard
        </Link>
        <span>›</span>
        <span className="text-slate-900 dark:text-white font-medium">
          {isEdit ? "Edit Entry" : "New Entry"}
        </span>
      </nav>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Sentiment display (edit mode, if backend returned one) */}
        {isEdit && sentiment && (
          <div className="px-6 pt-5">
            <div className={`inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full border ${SENTIMENT_LABELS[sentiment]?.cls}`}>
              <span>{SENTIMENT_LABELS[sentiment]?.emoji}</span>
              <span>AI detected: {SENTIMENT_LABELS[sentiment]?.label}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <input
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="Give this entry a title…"
              className="w-full px-0 py-2 text-2xl font-serif font-bold text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-700 bg-transparent border-0 border-b-2 border-slate-200 dark:border-slate-800 focus:outline-none focus:border-teal-500 transition-colors"
              maxLength={200}
            />
          </div>

          {/* Content */}
          <div className="relative">
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="What's on your mind today?

Write freely — this is your space. There are no rules here."
              rows={16}
              className="w-full px-0 py-3 text-base text-slate-700 dark:text-slate-300 placeholder-slate-300 dark:placeholder-slate-700 bg-transparent border-0 focus:outline-none resize-none leading-relaxed"
            />
            {/* Character count */}
            <div className="absolute bottom-2 right-2 text-xs text-slate-300 dark:text-slate-700 select-none">
              {charCount.toLocaleString()} chars
            </div>
          </div>

          {/* Sentiment hint for new entries */}
          {!isEdit && (
            <p className="text-xs text-slate-400 dark:text-slate-600 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m1.636-6.364l.707.707M12 21v-1M5.636 18.364l.707-.707M18.364 18.364l-.707-.707" />
              </svg>
              AI sentiment analysis runs automatically in the background after saving.
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {isEdit ? "Save changes" : "Publish entry"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Writing tips */}
      <details className="mt-4 group">
        <summary className="text-xs text-slate-400 dark:text-slate-600 cursor-pointer select-none hover:text-slate-600 dark:hover:text-slate-400 transition-colors">
          ✨ Writing tips
        </summary>
        <ul className="mt-2 text-xs text-slate-400 dark:text-slate-600 space-y-1 list-disc list-inside">
          <li>Describe how you feel, not just what happened.</li>
          <li>Even 3 sentences is a valid entry — consistency beats length.</li>
          <li>Your entries are private and protected by JWT authentication.</li>
          <li>Sentiment reports are emailed every Sunday if you opted in.</li>
        </ul>
      </details>
    </div>
  );
}