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
  const [popup, setPopup] = useState(null);

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

      setPopup({
        type: "success",
        title: "Welcome Back!",
        message: `You have successfully logged in, ${res.data.name}.`,
      });

      setTimeout(() => {
        if (res.data.role === "ADMIN") router.push("/admin");
        else if (res.data.role === "MECHANIC") router.push("/mechanic");
        else router.push("/");
      }, 1500);
    } catch {
      setPopup({
        type: "error",
        title: "Login Failed!",
        message: "Invalid email/username or password.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4 py-6 relative">
      {/* POPUP */}
      <AnimatePresence>
        {popup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-5xl mb-3"
              >
                {popup.type === "success" ? (
                  <AiOutlineCheckCircle className="text-green-600" />
                ) : (
                  <AiOutlineCloseCircle className="text-red-600" />
                )}
              </motion.div>

              <h2
                className={`text-xl font-bold ${
                  popup.type === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {popup.title}
              </h2>

              <p className="text-gray-600 mt-2 text-sm">{popup.message}</p>

              <button
                onClick={() => setPopup(null)}
                className={`mt-5 px-6 py-2 rounded-lg text-white font-semibold ${
                  popup.type === "success" ? "bg-green-600" : "bg-red-600"
                }`}
              >
                OK
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOGIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8"
      >
        {/* HEADER */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow"
          />
          <h1 className="text-2xl sm:text-3xl font-bold mt-3 text-gray-800">
            Welcome Back
          </h1>
          <p className="text-sm text-gray-500">Sign in to continue</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email or Username</label>
            <div className="flex items-center gap-2 border rounded-lg px-3 py-2 mt-1 bg-gray-50">
              <FiMail />
              <input
                name="loginId"
                value={form.loginId}
                onChange={handleChange}
                required
                className="w-full bg-transparent outline-none text-sm"
                placeholder="Enter email or username"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <span
              onClick={() => router.push("/forgot-password")}
              className="text-blue-600 text-xs float-right cursor-pointer"
            >
              Forgot?
            </span>
            <div className="flex items-center gap-2 border rounded-lg px-3 py-2 mt-1 bg-gray-50">
              <FiLock />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full bg-transparent outline-none text-sm"
              />
              <span onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-lg text-white font-semibold ${
              loading ? "bg-cyan-300" : "bg-cyan-600 hover:bg-cyan-700"
            }`}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          Don’t have an account?
          <span
            onClick={() => router.push("/signup")}
            className="text-blue-600 ml-1 cursor-pointer"
          >
            Create account
          </span>
        </p>
      </motion.div>
    </div>
  );
}
