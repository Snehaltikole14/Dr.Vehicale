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
              animate={{ opacity: 0.35 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="fixed top-0 right-0 h-full w-[280px] bg-white z-50 shadow-2xl flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setMenuOpen(false)}
                className="absolute top-4 right-4 text-gray-700 hover:text-black transition"
              >
                <X size={26} />
              </button>

              {/* Navigation */}
              <nav className="mt-16 flex flex-col px-6 gap-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-[15px] font-semibold text-gray-800 hover:text-cyan-600 transition"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              {/* Divider */}
              <div className="my-6 h-px bg-gray-200 mx-6" />

              {/* User Section */}
              <div className="px-6 flex flex-col gap-3">
                {!user ? (
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-lg bg-cyan-500 text-white font-semibold hover:bg-cyan-400 transition"
                  >
                    Sign In
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 text-gray-800 font-medium hover:text-cyan-600 transition"
                    >
                      <User size={18} /> My Profile
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 text-gray-800 font-medium hover:text-cyan-600 transition"
                    >
                      <Settings size={18} /> Settings
                    </Link>
                  </>
                )}
              </div>

              {/* Logout */}
              {user && (
                <div className="mt-auto px-6 pb-6">
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="w-full py-2.5 rounded-lg border border-red-500 text-red-500 font-semibold hover:bg-red-50 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
