import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Layout
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Pages
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import EntryEditorPage from "./pages/EntryEditorPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import GoogleCallbackPage from "./pages/GoogleCallbackPage";
import NotFoundPage from "./pages/NotFoundPage";

/**
 * AppLayout — wraps all authenticated pages with the sticky Navbar.
 * The <Outlet /> renders the matched child route below the nav.
 */
function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

/**
 * PublicLayout — minimal shell for login / signup (no Navbar).
 */
function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public routes (no auth required, no Navbar) ───────────── */}
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            {/* Google OAuth callback — receives ?code= or ?token= */}
            <Route path="/auth/callback" element={<GoogleCallbackPage />} />
          </Route>

          {/* ── Protected routes (auth required, with Navbar) ─────────── */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {/* Dashboard */}
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* Journal entries */}
              {/* Create: /entry/new */}
              <Route path="/entry/new" element={<EntryEditorPage />} />
              {/* Edit:   /entry/:id */}
              <Route path="/entry/:id" element={<EntryEditorPage />} />

              {/* Profile / settings */}
              <Route path="/profile" element={<ProfilePage />} />

              {/* Admin — nested guard: must be ROLE_ADMIN */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminPage />} />
              </Route>
            </Route>
          </Route>

          {/* ── Root redirect ──────────────────────────────────────────── */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* ── 404 ───────────────────────────────────────────────────── */}
          <Route
            path="*"
            element={
              <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
                <Navbar />
                <NotFoundPage />
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}