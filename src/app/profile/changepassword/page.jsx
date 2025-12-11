"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { API } from "@/utils/api";
import { FiLock, FiKey } from "react-icons/fi";

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in");
        router.push("/login");
        return;
      }

      const res = await API.post(
        "/api/users/change-password",
        { oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Password changed successfully!");
      router.push("/profile");
    } catch (err) {
      toast.error(err.response?.data || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-5">
      <div className="bg-white/30 backdrop-blur-xl border border-white/40 shadow-xl p-8 rounded-2xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Change Password
        </h1>

        <form onSubmit={handleChangePassword} className="space-y-5">
          {/* OLD PASSWORD */}
          <div>
            <label className="font-medium text-gray-700 flex items-center gap-2">
              <FiKey /> Old Password
            </label>
            <input
              type="password"
              className="w-full mt-1 px-4 py-2 rounded-lg bg-white/70 border outline-none focus:ring-2 focus:ring-blue-500"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>

          {/* NEW PASSWORD */}
          <div>
            <label className="font-medium text-gray-700 flex items-center gap-2">
              <FiLock /> New Password
            </label>
            <input
              type="password"
              className="w-full mt-1 px-4 py-2 rounded-lg bg-white/70 border outline-none focus:ring-2 focus:ring-blue-500"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          {/* BUTTON */}
          <button
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-150"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
