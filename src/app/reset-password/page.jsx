"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const BASE_URL = "http://localhost:8080/auth";

export default function ResetPasswordPage() {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [email, setEmail] = useState("");

  const router = useRouter();

  useEffect(() => {
    const savedEmail = localStorage.getItem("resetEmail");
    if (!savedEmail) {
      toast.error("No email found. Start again.");
      router.push("/forgot-password");
    } else {
      setEmail(savedEmail);
    }
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${BASE_URL}/reset-password`, {
        email,
        otp,
        newPassword,
      });

      toast.success("Password reset successful!");
      localStorage.removeItem("resetEmail");

      router.push("/login");
    } catch (error) {
      toast.error(error.response?.data || "Failed to reset password");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Toaster />
      <form
        onSubmit={handleResetPassword}
        className="bg-white shadow p-6 rounded-lg w-96"
      >
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>

        <label className="block mb-2">OTP</label>
        <input
          type="text"
          className="border p-2 w-full rounded"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />

        <label className="block mt-4 mb-2">New Password</label>
        <input
          type="password"
          className="border p-2 w-full rounded"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-green-600 text-white w-full py-2 mt-4 rounded hover:bg-green-700"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
}
