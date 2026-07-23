"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { API } from "@/utils/api";
import { motion } from "framer-motion";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    otp: "",
  });

  const [sendingOtp, setSendingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  // ================= STEP 1: REQUEST OTP =================
  const requestOtp = async (e) => {
    e.preventDefault();

    if (sendingOtp || cooldown > 0) return;

    setSendingOtp(true);

    try {
      await API.post("/auth/signup/request-otp", {
        phone: form.phone,
        email: form.email,
      });

      toast.success("OTP sent to your phone!");

      setStep(2);
      setCooldown(30);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (typeof err.response?.data === "string"
          ? err.response.data
          : "Failed to send OTP");

      toast.error(message);
    } finally {
      setSendingOtp(false);
    }
  };

  // ================= STEP 2: VERIFY OTP =================
  const verifyOtp = async (e) => {
    e.preventDefault();

    try {
      await API.post("/auth/signup/verify-otp", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        otp: form.otp,
      });

      toast.success("Account created successfully!");

      router.push("/login");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (typeof err.response?.data === "string"
          ? err.response.data
          : "OTP verification failed");

      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Toaster position="top-right" />

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

        {/* ================= STEP 1 ================= */}
        {step === 1 ? (
          <form onSubmit={requestOtp}>
            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                requiblue
              />
            </div>

            {/* Phone */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Phone Number
              </label>

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                requiblue
              />
            </div>

            <button
              type="submit"
              disabled={sendingOtp || cooldown > 0}
              className={`w-full py-2 rounded-lg font-semibold transition ${
                sendingOtp || cooldown > 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {sendingOtp
                ? "Sending OTP..."
                : cooldown > 0
                  ? `Resend OTP in ${cooldown}s`
                  : "Send OTP"}
            </button>
          </form>
        ) : (
          /* ================= STEP 2 ================= */
          <form onSubmit={verifyOtp}>
            {/* Full Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                requiblue
              />
            </div>

            {/* Email - Username */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email / Username
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                readOnly
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100"
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                requiblue
              />
            </div>

            {/* OTP */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Enter OTP
              </label>

              <input
                type="text"
                name="otp"
                value={form.otp}
                onChange={handleChange}
                placeholder="Enter OTP"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                requiblue
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
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
