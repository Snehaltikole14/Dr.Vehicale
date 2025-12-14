"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API } from "@/utils/api";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ loginId: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(null); // { type: 'success' | 'error', title, message }

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/login", {
        emailOrName: form.loginId,
        password: form.password,
      });

      // Save token & user
      localStorage.setItem("token", res.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: res.data.id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role,
        })
      );

      // Show success popup
      setPopup({
        type: "success",
        title: "Welcome Back!",
        message: `You have successfully logged in, ${res.data.name}.`,
      });

      // Auto redirect after 1.5s
      setTimeout(() => {
        const role = res.data.role;
        if (role === "ADMIN") router.push("/admin");
        else if (role === "MECHANIC") router.push("/mechanic");
        else router.push("/");
      }, 1500);
    } catch (err) {
      setPopup({
        type: "error",
        title: "Login Failed!",
        message: "This email is not registered or password is incorrect.",
      });
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => setPopup(null);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4 relative">
      {/* Popup */}
      <AnimatePresence>
        {popup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              exit={{ y: -20 }}
              className="bg-white rounded-xl shadow-2xl w-80 p-6 flex flex-col items-center text-center"
            >
              {/* Animated Icon */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-8"
      >
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.png" className="w-16 h-16 rounded-full shadow-md" />
          <h1 className="text-3xl font-bold mt-3 text-gray-800">
            Welcome Back
          </h1>
          <p className="text-sm text-gray-500">Sign in to continue</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Email or Username
            </label>
            <div className="mt-1 flex items-center gap-3 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
              <FiMail className="text-gray-500" />
              <input
                type="text"
                name="loginId"
                value={form.loginId}
                onChange={handleChange}
                required
                placeholder="Enter email or username"
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <span
              onClick={() => router.push("/forgot-password")}
              className="text-blue-600 text-sm cursor-pointer hover:underline float-right"
            >
              Forgot?
            </span>
            <div className="mt-1 flex items-center gap-3 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
              <FiLock className="text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Enter password"
                className="w-full bg-transparent outline-none"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer text-gray-600 hover:text-gray-800"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
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
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Don’t have an account?
          <span
            onClick={() => router.push("/signup")}
            className="text-blue-600 cursor-pointer hover:underline ml-1"
          >
            Create account
          </span>
        </p>
      </motion.div>
    </div>
  );
}
