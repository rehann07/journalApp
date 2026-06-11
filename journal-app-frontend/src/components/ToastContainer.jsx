/**
 * ToastContainer — renders all active toasts.
 * Place once at the top level (App.jsx or main.jsx).
 */
export default function ToastContainer({ toasts, dismissToast }) {
  if (!toasts.length) return null;

  const styles = {
    success: "bg-teal-600 text-white",
    error: "bg-red-600 text-white",
    info: "bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-900",
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start justify-between gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto animate-slide-up ${styles[t.type] || styles.info}`}
        >
          <span>{t.message}</span>
          <button
            onClick={() => dismissToast(t.id)}
            className="opacity-70 hover:opacity-100 transition-opacity shrink-0 mt-0.5"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}