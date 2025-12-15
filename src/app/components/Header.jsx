"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, User, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (err) {
          console.error("User parsing error:", err);
        }
      }
    }
  }, []);

  if (!mounted) return null;

  const userName = user?.name || user?.username || user?.fullName || "Profile";

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Custom Plan", href: "/custom-service" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 cursor-pointer">
          <Image
            src="/logo.png"
            alt="Dr. Vehicle Care Logo"
            width={50}
            height={50}
            className=""
          />
          <h1 className="text-black font-extrabold text-2xl hover:text-cyan-500 transition">
            Dr. Vehicle Care
          </h1>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 font-semibold text-black">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="hover:text-cyan-500 transition"
            >
              {link.name}
            </Link>
          ))}

          {!user && (
            <Link
              href="/login"
              className="ml-4 px-4 py-2 rounded-lg bg-cyan-500 text-white font-bold hover:bg-cyan-400 transition"
            >
              Sign In
            </Link>
          )}

          {user && (
            <div className="relative group">
              <button className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-md hover:shadow-lg transition">
                <User size={20} className="text-cyan-500" /> {userName}
              </button>

              <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg p-3 w-44 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-300">
                <Link
                  href="/profile"
                  className="block py-2 text-black hover:text-cyan-500 transition"
                >
                  My Profile
                </Link>
                <Link
                  href="/settings"
                  className="block py-2 text-black hover:text-cyan-500 transition flex items-center gap-2"
                >
                  <Settings size={16} /> Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 text-red-600 hover:text-red-800 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-black"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="md:hidden fixed top-0  right-0 w-64 h-full bg-white shadow-xl z-50 flex flex-col justify-between"
            >
              {/* Close Button */}
              <div className="flex justify-end p-4 border-b border-gray-200">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="text-black"
                >
                  <X size={28} />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col gap-2 px-4 py-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-base font-medium text-gray-800 hover:text-cyan-500 transition py-2 px-2 rounded"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              {/* User Actions */}
              <div className="flex flex-col gap-2 px-4 pb-6 border-t border-gray-200">
                {!user ? (
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center py-2 rounded-lg bg-cyan-500 text-white font-semibold hover:bg-cyan-400 transition"
                  >
                    Sign In
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-800 font-medium hover:bg-cyan-50 transition"
                    >
                      <User size={18} /> Profile
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-800 font-medium hover:bg-cyan-50 transition"
                    >
                      <Settings size={18} /> Settings
                    </Link>

                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center px-3 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
