"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { API } from "@/utils/api";
import { motion } from "framer-motion";
import { FiPhone, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    loginId: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", {
        phoneOrName: form.loginId, // ✅ FIXED
        password: form.password,
      });

      // Save token & user
      localStorage.setItem("token", res.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: res.data.id,
          name: res.data.name,
          phone: res.data.phone,
          role: res.data.role,
        })
      );

      toast.success("Login successful");

      // ROLE BASED REDIRECT
      const role = res.data.role;
      if (role === "ADMIN") router.push("/admin");
      else if (role === "MECHANIC") router.push("/mechanic");
      else {
        const redirectTo =
          localStorage.getItem("redirectAfterLogin") || "/";
        localStorage.removeItem("redirectAfterLogin");
        router.push(redirectTo);
      }
    } catch (err) {
      toast.error("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-red-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white rounded-xl shadow-md border border-red-200 p-8"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <img src="/logo bike.png" className="w-16 h-9" />
          <h1 className="text-2xl font-bold mt-3 text-red-800">
            Welcome Back
          </h1>
          <p className="text-sm text-black">Sign in to continue</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Phone / Username */}
          <div>
            <label className="text-sm font-medium text-black">
              Phone or Username
            </label>
            <div className="mt-1 flex items-center gap-3 border border-red-300 rounded-lg px-3 py-2 bg-red-50">
              <FiPhone className="text-red-500" />
              <input
                type="text"
                name="loginId"
                value={form.loginId}
                onChange={handleChange}
                required
                placeholder="Enter phone or username"
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-black">
              Password
            </label>

            <span
              onClick={() => router.push("/forgot-password")}
              className="text-red-600 text-sm cursor-pointer hover:underline float-right"
            >
              Forgot?
            </span>

            <div className="mt-1 flex items-center gap-3 border border-red-300 rounded-lg px-3 py-2 bg-red-50">
              <FiLock className="text-red-500" />
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
                className="cursor-pointer text-red-600"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Sign In
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-red-600 text-sm mt-6">
          Don’t have an account?
          <span
            onClick={() => router.push("/signup")}
            className="cursor-pointer hover:underline ml-1"
          >
            Create account
          </span>
        </p>
      </motion.div>
    </div>
  );
}
