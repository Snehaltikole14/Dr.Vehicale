"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { API } from "@/utils/api";
import { motion } from "framer-motion";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // Step 1 = request OTP, Step 2 = verify OTP
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    otp: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Step 1: Request OTP
  const requestOtp = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/signup/request-otp", {
        email: form.email,
        phone: form.phone,
      });
      toast.success("OTP sent to your phone/email!");
      setStep(2);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === "string"
          ? err.response.data
          : "Failed to send OTP");
      toast.error(message);
    }
  };

  // ✅ Step 2: Verify OTP and complete signup
  const verifyOtp = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/signup/verify-otp", form);
      toast.success("Account created successfully!");
      router.push("/login");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === "string"
          ? err.response.data
          : "OTP verification failed!");
      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-50">
      <Toaster />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-8 rounded-2xl shadow-xl w-[400px]"
      >
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-2">
          Dr. Vehicle Care
        </h2>
        <p className="text-center text-gray-500 mb-6">Create your account</p>

        {step === 1 ? (
          // Step 1: Request OTP Form
          <form onSubmit={requestOtp}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Send OTP
            </button>
          </form>
        ) : (
          // Step 2: Verify OTP Form
          <form onSubmit={verifyOtp}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Enter OTP
              </label>
              <input
                type="text"
                name="otp"
                value={form.otp}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Verify OTP & Sign Up
            </button>
          </form>
        )}

        <p className="text-center text-sm mt-4 text-gray-600">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </motion.div>
    </div>
  );
}
