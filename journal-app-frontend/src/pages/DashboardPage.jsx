import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { useToast } from "../hooks/useToast";
import ToastContainer from "../components/ToastContainer";

// Sentiment badge colours matching the Sentiment enum
const SENTIMENT_LABELS = {
  HAPPY:   { label: "Happy",   cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400", emoji: "😊" },
  SAD:     { label: "Sad",     cls: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400",             emoji: "😔" },
  ANGRY:   { label: "Angry",   cls: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400",                 emoji: "😤" },
  ANXIOUS: { label: "Anxious", cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400",         emoji: "😰" },
};

function SentimentBadge({ sentiment }) {
  if (!sentiment) return null;
  const cfg = SENTIMENT_LABELS[sentiment] || {};
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${cfg.cls}`}>
      {cfg.emoji} {cfg.label}
    </span>
  );
}

function EntryCard({ entry, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const formattedDate = entry.date
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(entry.date))
    : null;

  const handleDelete = async (e) => {
    e.stopPropagation();
    e.preventDefault(); // don't navigate on card click
    if (!window.confirm(`Delete "${entry.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    await onDelete(entry.id);
    setDeleting(false);
  };

  return (
    <article
      onClick={() => navigate(`/entry/${entry.id}`)}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 cursor-pointer hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-md transition-all duration-200"
    >
      {/* Sentiment badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-serif text-lg font-semibold text-slate-900 dark:text-white line-clamp-1 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
          {entry.title}
        </h3>
        <SentimentBadge sentiment={entry.sentiment} />
      </div>

      {/* Content preview */}
      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
        {entry.content || <span className="italic">No content…</span>}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 dark:text-slate-500">{formattedDate}</span>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/entry/${entry.id}`); }}
            className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline"
          >
            Edit
          </button>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs font-medium text-red-500 dark:text-red-400 hover:underline disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}

function GreetingBanner({ greeting }) {
  if (!greeting) return null;
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-teal-500/10 to-cyan-500/5 dark:from-teal-500/10 dark:to-cyan-500/5 border border-teal-200 dark:border-teal-900 mb-6">
      <span className="text-2xl">👋</span> 
      <p className="text-sm font-medium text-teal-800 dark:text-teal-300">{greeting}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { toasts, showToast, dismissToast } = useToast();
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [greeting, setGreeting] = useState("");
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [loadingGreeting, setLoadingGreeting] = useState(true);
  const [search, setSearch] = useState("");

  // GET /user 
  useEffect(() => {
    api
      .get("/user")
      .then(({ data }) => setGreeting(data))
      .catch(() => {}) // greeting is non-critical
      .finally(() => setLoadingGreeting(false));
  }, []);

  // GET /journal → List<JournalEntry>
  const fetchEntries = useCallback(async () => {
    setLoadingEntries(true);
    try {
      const { data } = await api.get("/journal");
      // Sort newest first
      const sorted = [...data].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setEntries(sorted);
    } catch (err) {
      if (err.response?.status === 404) {
        setEntries([]); // 404 means empty — treat gracefully
      } else {
        showToast("Failed to load journal entries.", "error");
      }
    } finally {
      setLoadingEntries(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // DELETE /journal/id/:id
  const handleDelete = async (id) => {
    try {
      await api.delete(`/journal/id/${id}`);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      showToast("Entry deleted.", "success");
    } catch {
      showToast("Could not delete the entry. Please try again.", "error");
    }
  };

  const filtered = entries.filter(
    (e) =>
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.content?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <ToastContainer toasts={toasts} dismissToast={dismissToast} />

      {/* Greeting */}
      {!loadingGreeting && <GreetingBanner greeting={greeting} />}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
            My Journal
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {entries.length === 0 ? "No entries yet" : `${entries.length} entr${entries.length === 1 ? "y" : "ies"}`}
          </p>
        </div>
        <Link
          to="/entry/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Entry
        </Link>
      </div>

      {/* Search */}
      {entries.length > 0 && (
        <div className="relative mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entries…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm transition"
          />
        </div>
      )}

      {/* Content */}
      {loadingEntries ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl h-40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((entry) => (
            <EntryCard key={entry.id} entry={entry} onDelete={handleDelete} />
          ))}
        </div>
      ) : entries.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="text-6xl mb-4">📝</span>
          <h2 className="font-serif text-2xl font-bold text-slate-800 dark:text-white mb-2">
            Your journal is empty
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm text-sm">
            Start writing — your first entry is a moment worth keeping.
          </p>
          <Link
            to="/entry/new"
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            Write your first entry
          </Link>
        </div>
      ) : (
        /* Search empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-4xl mb-3">🔍</span>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            No entries match <strong>"{search}"</strong>
          </p>
          <button onClick={() => setSearch("")} className="mt-3 text-sm text-teal-600 dark:text-teal-400 hover:underline">
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}