"use client";

import { FiMenu, FiUser, FiSettings, FiBell, FiLogOut } from "react-icons/fi";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();

  const menuItems = [
    { label: "Dashboard", href: "/admin", icon: <FiMenu size={20} /> },
    { label: "Bookings", href: "/admin/booking", icon: <FiBell size={20} /> },
    {
      label: "Mechanics",
      href: "/admin/mechanics",
      icon: <FiUser size={20} />,
    },
    { label: "Users", href: "/admin/AllUsers", icon: <FiUser size={20} /> },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: <FiSettings size={20} />,
    },
  ];

  // ---------- LOGOUT FUNCTION ----------
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ---------- SIDEBAR (DESKTOP) ---------- */}
      <aside
        className={`
          hidden md:block
          ${open ? "w-64" : "w-16"}
          bg-white shadow-md transition-all duration-300 p-4
        `}
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-xl font-bold ${!open && "hidden"}`}>Admin</h1>
          <FiMenu
            size={22}
            className="cursor-pointer"
            onClick={() => setOpen(!open)}
          />
        </div>

        <nav className="flex flex-col gap-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 hover:text-blue-600"
            >
              {item.icon}
              {open && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      {/* ---------- MOBILE SIDEBAR DRAWER ---------- */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-50 bg-white shadow-md p-4 w-60
          transform md:hidden transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Admin</h1>
          <FiMenu
            size={22}
            className="cursor-pointer"
            onClick={() => setMobileOpen(false)}
          />
        </div>

        <nav className="flex flex-col gap-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 hover:text-blue-600"
              onClick={() => setMobileOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* ---------- MAIN CONTENT AREA ---------- */}
      <div className="flex-1">
        {/* ---------- TOP HEADER ---------- */}
        <header className="bg-white shadow px-4 md:px-6 py-4 flex justify-between items-center">
          {/* Mobile Menu Button */}
          <FiMenu
            size={24}
            className="cursor-pointer md:hidden"
            onClick={() => setMobileOpen(true)}
          />

          <h2 className="text-lg md:text-xl font-semibold">Admin Dashboard</h2>

          <div className="relative flex items-center gap-4">
            <FiBell size={22} className="cursor-pointer" />
            <FiSettings size={22} className="cursor-pointer" />

            {/* ---------- PROFILE IMAGE ---------- */}
            <div className="relative">
              <div
                className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <FiUser size={20} />
              </div>

              {/* ---------- DROPDOWN ---------- */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 w-full"
                  >
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ---------- PAGE CONTENT ---------- */}
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
