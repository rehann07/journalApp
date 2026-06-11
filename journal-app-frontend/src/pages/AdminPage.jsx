import { useState, useEffect, useCallback } from "react";
import api from "../api/axiosConfig";
import { useToast } from "../hooks/useToast";
import ToastContainer from "../components/ToastContainer";

/**
 * AdminPage — /admin (requires ROLE_ADMIN)
 *
 * GET  /admin/all-users          → List<User>
 * POST /admin/create-admin-user  → User { userName, password, email }
 * GET  /admin/clear-app-cache    → void (clears Redis + in-memory AppCache)
 */
function StatCard({ label, value, icon, accent }) {
  const accentMap = {
    teal: "from-teal-500/10 to-cyan-500/10 border-teal-200 dark:border-teal-900 text-teal-700 dark:text-teal-400",
    violet: "from-violet-500/10 to-purple-500/10 border-violet-200 dark:border-violet-900 text-violet-700 dark:text-violet-400",
    amber: "from-amber-500/10 to-yellow-500/10 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400",
  };
  return (
    <div className={`bg-gradient-to-br ${accentMap[accent]} border rounded-2xl p-5`}>
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-sm mt-1 font-medium">{label}</p>
    </div>
  );
}

function UserRow({ user, index }) {
  const isAdmin = user.roles?.includes("ROLE_ADMIN") || user.roles?.includes("ADMIN");
  return (
    <tr className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-500 w-10">{index + 1}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0 select-none">
            {user.userName?.charAt(0)?.toUpperCase()}
          </div>
          <span className="text-sm font-medium text-slate-900 dark:text-white">{user.userName}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{user.email || "—"}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {(user.roles || []).map((r) => (
            <span
              key={r}
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                r.includes("ADMIN")
                  ? "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {r.replace("ROLE_", "")}
            </span>
          ))}
        </div>
      </td>
      <td className="px-4 py-3 text-sm">
        <span className={`inline-flex items-center gap-1 ${user.sentimentAnalysis ? "text-teal-600 dark:text-teal-400" : "text-slate-400"}`}>
          {user.sentimentAnalysis ? "✓ On" : "Off"}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
        {user.journalEntries?.length ?? 0}
      </td>
    </tr>
  );
}

export default function AdminPage() {
  const { toasts, showToast, dismissToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState("");

  const [adminForm, setAdminForm] = useState({ userName: "", email: "", password: "" });
  const [adminErrors, setAdminErrors] = useState({});
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const { data } = await api.get("/admin/all-users");
      setUsers(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setUsers([]);
      } else {
        showToast("Failed to load users.", "error");
      }
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const validateAdminForm = () => {
    const errs = {};
    if (!adminForm.userName.trim()) errs.userName = "Username is required.";
    if (!adminForm.password || adminForm.password.length < 6) errs.password = "Password must be ≥ 6 characters.";
    return errs;
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    const errs = validateAdminForm();
    if (Object.keys(errs).length) { setAdminErrors(errs); return; }
    setCreatingAdmin(true);
    try {
      await api.post("/admin/create-admin-user", {
        userName: adminForm.userName.trim(),
        email: adminForm.email.trim() || null,
        password: adminForm.password,
        roles: ["USER", "ADMIN"],
      });
      showToast(`Admin user "${adminForm.userName}" created.`, "success");
      setAdminForm({ userName: "", email: "", password: "" });
      setShowAdminForm(false);
      fetchUsers(); // refresh table
    } catch {
      showToast("Failed to create admin user.", "error");
    } finally {
      setCreatingAdmin(false);
    }
  };

  const adminCount = users.filter(
    (u) => u.roles?.includes("ROLE_ADMIN") || u.roles?.includes("ADMIN")
  ).length;

  const saCount = users.filter((u) => u.sentimentAnalysis).length;

  const filtered = users.filter(
    (u) =>
      u.userName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const inputClass = (field) =>
    `w-full px-4 py-2.5 rounded-xl border ${
      adminErrors[field]
        ? "border-red-400 dark:border-red-600"
        : "border-slate-300 dark:border-slate-700"
    } bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm transition`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <ToastContainer toasts={toasts} dismissToast={dismissToast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">Admin Panel</h1>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400">
              Restricted
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">User management and system operations</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAdminForm((v) => !v)}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-violet-300 dark:border-violet-800 text-violet-700 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/40 text-sm font-medium rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Admin
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Users" value={users.length} icon="👥" accent="teal" />
        <StatCard label="Admins" value={adminCount} icon="🛡️" accent="violet" />
        <StatCard label="Sentiment Opted-in" value={saCount} icon="📊" accent="amber" />
      </div>

      {/* Create Admin Form */}
      {showAdminForm && (
        <div className="bg-white dark:bg-slate-900 border border-violet-200 dark:border-violet-900 rounded-2xl p-6 mb-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Create Admin User</h2>
          <form onSubmit={handleCreateAdmin} className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Username *</label>
              <input
                type="text"
                value={adminForm.userName}
                onChange={(e) => { setAdminForm((p) => ({ ...p, userName: e.target.value })); setAdminErrors((p) => ({ ...p, userName: "" })); }}
                placeholder="admin_user"
                className={inputClass("userName")}
              />
              {adminErrors.userName && <p className="mt-1 text-xs text-red-500">{adminErrors.userName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                value={adminForm.email}
                onChange={(e) => setAdminForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="admin@example.com"
                className={inputClass("email")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password *</label>
              <input
                type="password"
                value={adminForm.password}
                onChange={(e) => { setAdminForm((p) => ({ ...p, password: e.target.value })); setAdminErrors((p) => ({ ...p, password: "" })); }}
                placeholder="Min. 6 characters"
                className={inputClass("password")}
              />
              {adminErrors.password && <p className="mt-1 text-xs text-red-500">{adminErrors.password}</p>}
            </div>
            <div className="sm:col-span-3 flex gap-3">
              <button
                type="submit"
                disabled={creatingAdmin}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {creatingAdmin ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating…</>
                ) : "Create Admin"}
              </button>
              <button type="button" onClick={() => setShowAdminForm(false)} className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">All Users</h2>
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users…"
              className="pl-9 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm transition w-52"
            />
          </div>
        </div>

        {loadingUsers ? (
          <div className="p-8 flex justify-center">
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
              Loading users…
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400 dark:text-slate-600 text-sm">
              {search ? `No users match "${search}"` : "No users found."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Username</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Roles</th>
                  <th className="px-4 py-3 text-left">Sentiment</th>
                  <th className="px-4 py-3 text-left">Entries</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => (
                  <UserRow key={user.id || user.userName} user={user} index={i} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loadingUsers && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-600">
            Showing {filtered.length} of {users.length} users
          </div>
        )}
      </div>
    </div>
  );
}