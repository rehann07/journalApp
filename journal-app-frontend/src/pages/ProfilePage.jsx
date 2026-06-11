import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import ToastContainer from "../components/ToastContainer";

/**
 * ProfilePage
 *
 * PUT /user → { userName, password, sentimentAnalysis }
 * DELETE /user → 204 (deletes the authenticated user's account)
 */
export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { toasts, showToast, dismissToast } = useToast();

  const [profileForm, setProfileForm] = useState({
    userName: user?.userName || "",
    newPassword: "",
    confirmPassword: "",
    sentimentAnalysis: user?.sentimentAnalysis || false,
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  // Danger zone
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    setProfileErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: checked }));
  };

  const validateProfile = () => {
    const errs = {};
    if (!profileForm.userName.trim()) errs.userName = "Username cannot be empty.";
    if (profileForm.newPassword && profileForm.newPassword.length < 6)
      errs.newPassword = "Password must be at least 6 characters.";
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword)
      errs.confirmPassword = "Passwords do not match.";
    return errs;
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const errs = validateProfile();
    if (Object.keys(errs).length) {
      setProfileErrors(errs);
      return;
    }
    setSavingProfile(true);
    try {
      const payload = {
        userName: profileForm.userName.trim(),
        password: profileForm.newPassword || "UNCHANGED__" + Date.now(),
        sentimentAnalysis: profileForm.sentimentAnalysis,
      };
      await api.put("/user", payload);
      updateUser({ userName: profileForm.userName.trim(), sentimentAnalysis: profileForm.sentimentAnalysis });
      setProfileForm((prev) => ({ ...prev, newPassword: "", confirmPassword: "" }));
      showToast("Profile updated successfully.", "success");
    } catch (err) {
      if (err.response?.status === 404) {
        showToast("User not found. Please log in again.", "error");
      } else {
        showToast("Failed to update profile. Please try again.", "error");
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user?.userName) {
      showToast("Username does not match. Account not deleted.", "error");
      return;
    }
    setDeletingAccount(true);
    try {
      await api.delete("/user"); 
      showToast("Account deleted. Goodbye!", "success");
      setTimeout(() => {
        logout();
        navigate("/login");
      }, 1200);
    } catch {
      showToast("Failed to delete account. Please try again.", "error");
      setDeletingAccount(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-2.5 rounded-xl border ${
      profileErrors[field]
        ? "border-red-400 dark:border-red-600"
        : "border-slate-300 dark:border-slate-700"
    } bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition text-sm`;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <ToastContainer toasts={toasts} dismissToast={dismissToast} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your account details and preferences
        </p>
      </div>

      {/* 🛠️ Main Unified Update Form Wrapper */}
      <form onSubmit={handleProfileSave} className="space-y-6 mb-6">
        
        {/* Account Info Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-4 pb-6 mb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-linear-to-br from-teal-400 to-cyan-500 text-white text-xl font-bold select-none">
              {user?.userName?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{user?.userName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {user?.roles?.map((role) => (
                  <span
                    key={role}
                    className="text-xs font-medium px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400"
                  >
                    {role.replace("ROLE_", "")}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Update Profile</h2>

            {/* Username */}
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Username
              </label>
              <input
                id="userName"
                name="userName"
                type="text"
                value={profileForm.userName}
                onChange={handleProfileChange}
                className={inputClass("userName")}
              />
              {profileErrors.userName && <p className="mt-1 text-xs text-red-500">{profileErrors.userName}</p>}
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                New Password{" "}
                <span className="font-normal text-slate-400">(leave blank to keep current)</span>
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={profileForm.newPassword}
                onChange={handleProfileChange}
                placeholder="••••••••"
                className={inputClass("newPassword")}
              />
              {profileErrors.newPassword && <p className="mt-1 text-xs text-red-500">{profileErrors.newPassword}</p>}
            </div>

            {/* Confirm Password */}
            {profileForm.newPassword && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={profileForm.confirmPassword}
                  onChange={handleProfileChange}
                  placeholder="••••••••"
                  className={inputClass("confirmPassword")}
                />
                {profileErrors.confirmPassword && <p className="mt-1 text-xs text-red-500">{profileErrors.confirmPassword}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Sentiment Analysis Preferences Toggle */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center h-5">
              <input
                id="sentimentAnalysis"
                name="sentimentAnalysis"
                type="checkbox"
                checked={profileForm.sentimentAnalysis}
                onChange={handleToggleChange}
                className="w-4 h-4 text-teal-600 border-slate-300 dark:border-slate-700 rounded focus:ring-teal-500 bg-white dark:bg-slate-900"
              />
            </div>
            <div className="text-sm">
              <label htmlFor="sentimentAnalysis" className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                📊 Enable Weekly Sentiment Reports
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Receive a structured emotional trends summary in your inbox every Sunday morning. Uncheck to opt-out anytime.
              </p>
            </div>
          </div>

          {/* AI Transparency Notice */}
          <div className="bg-slate-100/70 dark:bg-slate-800/40 rounded-xl p-3.5 flex gap-2.5">
            <span className="text-sm select-none mt-0.5">ℹ️</span>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 leading-relaxed">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                How AI Processing Works
              </p>
              <p>
                When enabled, your journal text is transmitted to our AI provider to generate your weekly mindset summaries and emotional tags. 
              </p>
              <p>
                <strong>You are in full control.</strong> Unchecking this box immediately stops all future AI processing of your entries. Your journal data remains stored in your account database.
              </p>
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={savingProfile}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          {savingProfile ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving…
            </>
          ) : (
            "Save changes"
          )}
        </button>
      </form>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-red-600 dark:text-red-400 mb-1">Danger Zone</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Permanently delete your account and all journal entries. This action cannot be undone.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-sm font-medium rounded-xl transition-colors"
        >
          Delete my account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white mb-2">
              Delete account?
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              This will permanently delete your account and <strong>all journal entries</strong>. To confirm, type your username:{" "}
              <code className="text-slate-900 dark:text-white font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                {user?.userName}
              </code>
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Type your username to confirm"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm mb-4 transition"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirm(""); }}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deletingAccount || deleteConfirm !== user?.userName}
                className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-900 text-white rounded-xl transition-colors inline-flex items-center gap-2"
              >
                {deletingAccount ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting…
                  </>
                ) : (
                  "Yes, delete everything"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}