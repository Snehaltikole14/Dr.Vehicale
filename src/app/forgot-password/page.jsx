"use client";

import { useState } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const BASE_URL = "http://localhost:8080/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${BASE_URL}/forgot-password`, { email });

      toast.success("OTP sent to your email");
      localStorage.setItem("resetEmail", email); // store email for next page

      router.push("/reset-password"); // go to reset page
    } catch (error) {
      toast.error(error.response?.data || "Failed to send OTP");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Toaster />
      <form
        onSubmit={handleForgotPassword}
        className="bg-white shadow p-6 rounded-lg w-96"
      >
        <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>

        <label className="block mb-2">Enter your email</label>
        <input
          type="email"
          className="border p-2 w-full rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-2 mt-4 rounded hover:bg-blue-700"
        >
          Send OTP
        </button>
      </form>
    </div>
  );
}
