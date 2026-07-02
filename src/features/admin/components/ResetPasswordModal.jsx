import { useState } from "react";
import { resetUserPassword } from "../../../services/allAPI";
import { KeyRound, Eye, EyeOff, X } from "lucide-react";

const ResetPasswordModal = ({ isOpen, onClose, userId, userName }) => {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      setMessage("Please enter a new password");
      setIsSuccess(false);
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      await resetUserPassword(userId, { newPassword });
      setMessage("Password reset successfully!");
      setIsSuccess(true);
      setNewPassword("");
      setTimeout(() => {
        onClose();
        setMessage("");
        setIsSuccess(false);
      }, 1500);
    } catch (err) {
      setMessage(err?.response?.data?.message || "Failed to reset password");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-gradient-to-r from-red-500 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <KeyRound size={24} />
            <h2 className="text-xl font-bold">Reset Password</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-sm text-slate-600">
            Enter a new password for <span className="font-semibold text-slate-900">{userName || "this user"}</span>.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {message && (
              <p className={`text-sm ${isSuccess ? "text-emerald-600" : "text-red-600"}`}>
                {message}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-70"
              >
                {loading ? "Resetting..." : "Reset"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
