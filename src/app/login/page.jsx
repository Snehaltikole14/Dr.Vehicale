"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { API } from "@/utils/api";
import { motion } from "framer-motion";
import { FiMail, FiLock,FiEye, FiEyeOff } from "react-icons/fi";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ loginId: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);


  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
const handleSubmit = async (e) => {
  e.preventDefault();
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

    toast.success("Login successful");

    // ROLE BASED REDIRECT
    const role = res.data.role;
    if (role === "ADMIN") router.push("/admin");
    else if (role === "MECHANIC") router.push("/mechanic");
    else {
      const redirectTo = localStorage.getItem("redirectAfterLogin") || "/";
      setTimeout(() => {
        localStorage.removeItem("redirectAfterLogin");
        router.push(redirectTo);
      }, 200);
    }
  } catch (err) {
    // 🚀 FIXED: UI never shows ugly Axios 400 error
    toast.error("Invalid credentials");
  }
};



  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white rounded-xl shadow-md border border-gray-200 p-8"
      >
        {/* Logo + Brand */}
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.png" className="w-16 h-16 " />
          <h1 className="text-2xl font-bold mt-3 text-gray-800">
            Welcome Back
          </h1>
          <p className="text-sm text-gray-500">Sign in to continue</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email / Username */}
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

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <span
              onClick={() => router.push("/forgot-password")}
              className="text-blue-600 text-sm cursor-pointer hover:underline ml-60"
            >
              Forgot ?
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

              {/* Show / Hide Icon */}
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer text-gray-600 hover:text-gray-800"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        </form>

        {/* Footer */}
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
