"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API } from "@/utils/api";
import { motion, AnimatePresence } from "framer-motion";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";

export default function SignupPage() {
  const router = useRouter();
   const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Step 1 = request OTP, Step 2 = verify OTP
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    otp: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [popup, setPopup] = useState(null); // { type: 'success' | 'error', title, message }

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Step 1: Request OTP
  const requestOtp = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/signup/request-otp", {
        email: form.email,
        phone: form.phone,
      });
      setPopup({
        type: "success",
        title: "OTP Sent!",
        message: "OTP has been sent to your phone/email.",
      });
      setStep(2);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === "string"
          ? err.response.data
          : "Failed to send OTP");
      setPopup({ type: "error", title: "Failed", message });
    }
  };

  // Step 2: Verify OTP and signup
  const verifyOtp = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/signup/verify-otp", form);
      setPopup({
        type: "success",
        title: "Account Created!",
        message: "Your account has been created successfully.",
      });
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === "string"
          ? err.response.data
          : "OTP verification failed!");
      setPopup({ type: "error", title: "Failed", message });
    }
  };

  const closePopup = () => setPopup(null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-50 relative">
      {/* Popup */}
      <AnimatePresence>
        {popup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-xl shadow-2xl w-80 p-6 flex flex-col items-center text-center">
              {/* Animated Icon */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="mb-4 text-6xl"
              >
                {popup.type === "success" ? (
                  <AiOutlineCheckCircle className="text-green-600" />
                ) : (
                  <AiOutlineCloseCircle className="text-red-600" />
                )}
              </motion.div>

              {/* Title */}
              <h2
                className={`text-2xl font-bold mb-2 ${
                  popup.type === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {popup.title}
              </h2>

              {/* Message */}
              <p className="text-gray-700 mb-6">{popup.message}</p>

              {/* OK Button */}
              <button
                onClick={closePopup}
                className={`w-24 px-4 py-2 rounded-lg font-semibold text-white transition ${
                  popup.type === "success"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Ok
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              disabled={loading}
              className={`w-full py-2.5 rounded-lg font-semibold text-white transition ${
                loading
                  ? "bg-cyan-300 cursor-not-allowed"
                  : "bg-cyan-600 hover:bg-cyan-700"
              }`}
            >
              {loading ? "Sending..." : "Send OTP"}
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div className="mb-4 relative">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[35px] cursor-pointer text-gray-600 hover:text-gray-800"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
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
