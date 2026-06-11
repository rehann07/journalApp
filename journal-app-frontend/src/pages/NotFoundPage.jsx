import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl mb-6 select-none">📭</p>
      <h1 className="font-serif text-4xl font-bold text-slate-900 dark:text-white mb-3">
        Page not found
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm text-sm leading-relaxed">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link
        to="/dashboard"
        className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-sm transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}