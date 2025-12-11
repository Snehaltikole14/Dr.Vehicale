"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false); // ✅ NEW

  // Load user after mount (prevents hydration issue)
  useEffect(() => {
    setMounted(true); // ✅ NEW FIX

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      console.log("Loaded User:", userData); // ✅ Debug

      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (err) {
          console.error("User parsing error:", err);
        }
      }
    }
  }, []);

  if (!mounted) return null; // ✅ REQUIRED FIX

  // 🔥 This will handle any API user format
  const userName =
    user?.name ||
    user?.username ||
    user?.fullName ||
    user?.firstName ||
    user?.email ||
    "Profile";

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Plan", href: "/services" },
    { name: " Customized Plan", href: "/custom-service" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/book" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-[#009FE3]/90 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <motion.div whileHover={{ rotate: 10, scale: 1.05 }}>
            <Image
              src="/logo.png"
              alt="Dr. Vehicle Care Logo"
              width={50}
              height={50}
              className="drop-shadow-lg "
            />
          </motion.div>
          <h1 className="text-white font-extrabold text-2xl group-hover:text-yellow-300 transition">
            Dr. Vehicle Care
          </h1>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 items-center text-white font-semibold">
          {navLinks.map((link) => (
            <motion.div key={link.name} whileHover={{ y: -3 }}>
              <Link href={link.href} className="hover:text-yellow-300">
                {link.name}
              </Link>
            </motion.div>
          ))}

          {/* Guest: Show Sign In */}
          {!user && (
            <Link
              href="/login"
              className="bg-yellow-400 px-4 py-2 rounded-lg text-black font-bold"
            >
              Sign In
            </Link>
          )}

          {/* Logged In: Show Name */}
          {user && (
            <div className="relative group">
              <button className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg text-black font-semibold">
                <User size={20} /> {userName}
              </button>

              {/* Dropdown */}
              <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg p-3 w-40 hidden group-hover:block">
                <Link
                  href="/profile"
                  className="block text-black py-2 hover:text-blue-600"
                >
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 text-red-600 hover:text-red-800"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Mobile Menu */}
        <button
          className="md:hidden text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={30} /> : <Menu size={30} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            className="bg-[#007DC3]/95 md:hidden flex flex-col items-center gap-6 py-6 text-white"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            {!user && (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="bg-yellow-400 px-4 py-2 rounded-lg text-black font-bold"
              >
                Sign In
              </Link>
            )}

            {user && (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="bg-white text-black px-4 py-2 rounded-lg"
                >
                  Profile
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="bg-red-500 px-4 py-2 rounded-lg text-white"
                >
                  Logout
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
