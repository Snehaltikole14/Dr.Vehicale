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
    phone: "",
    password: "",
    otp: "",
  });

  const [sendingOtp, setSendingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0); // seconds

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ⏳ Countdown timer
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
      });

      toast.success("OTP sent to your phone!");
      setStep(2);
      setCooldown(30); // ⏳ 30 sec cooldown
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-100 via-white to-red-50">
      <Toaster />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-8 rounded-2xl shadow-xl w-[400px]"
      >
        <h2 className="text-3xl font-bold text-center text-red-700 mb-2">
          Dr. Vehicle Care
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Create your account
        </p>

        {step === 1 ? (
          <form onSubmit={requestOtp}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={sendingOtp || cooldown > 0}
              className={`w-full py-2 rounded-lg font-semibold transition
                ${
                  sendingOtp || cooldown > 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 text-white"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700"
            >
              Verify OTP & Sign Up
            </button>
          </form>
        )}

        <p className="text-center text-sm mt-4 text-gray-600">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-red-600 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </motion.div>
    </div>
  );
}
