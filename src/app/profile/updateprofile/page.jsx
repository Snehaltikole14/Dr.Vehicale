"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { API } from "@/utils/api";
import { FiUser, FiPhone, FiShield, FiTrash2, FiEdit3 } from "react-icons/fi";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile
  useEffect(() => {
    if (typeof window === "undefined") return;

    const userData = localStorage.getItem("user");
    if (!userData) {
      toast.error("You must be logged in");
      router.push("/login");
      return;
    }

    const { id: userId } = JSON.parse(userData);

    const fetchUser = async () => {
      try {
        const res = await API.get(`/api/users/${userId}`);
        setUser(res.data);
      } catch (err) {
        toast.error("Failed to load profile");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // Update profile
  const handleUpdate = async () => {
    try {
      await API.put(`/api/users/${user.id}`, user);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  // Delete profile
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your account?")) return;

    try {
      await API.delete(`/api/users/${user.id}`);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.success("Account deleted successfully");
      router.push("/signup");
    } catch (err) {
      toast.error("Failed to delete account");
    }
  };

  if (loading) return <p className="text-center mt-20">Loading...</p>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white flex justify-center items-center p-4">
      <div className="bg-white/30 backdrop-blur-xl shadow-xl rounded-2xl max-w-lg w-full p-8 border border-white/40">
        {/* Profile Header */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-white shadow-md flex justify-center items-center mb-3">
            <FiUser className="text-4xl text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
          <p className="text-gray-600 -mt-1">{user.email}</p>
        </div>

        <div className="h-px bg-white/50 my-6"></div>

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="text-gray-700 font-medium flex items-center gap-2">
              <FiUser /> Full Name
            </label>
            <input
              className="w-full mt-1 px-4 py-2 rounded-lg bg-white/70 border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-gray-700 font-medium flex items-center gap-2">
              <FiPhone /> Phone
            </label>
            <input
              className="w-full mt-1 px-4 py-2 rounded-lg bg-white/70 border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
              value={user.phone || ""}
              onChange={(e) => setUser({ ...user, phone: e.target.value })}
            />
          </div>

          {/* Role */}
          <div>
            <label className="text-gray-700 font-medium flex items-center gap-2">
              <FiShield /> Role
            </label>
            <input
              className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 border"
              value={user.role}
              disabled
            />
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={handleUpdate}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 shadow-md"
          >
            <FiEdit3 /> Update Profile
          </button>

          <button
            onClick={handleDelete}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 shadow-md"
          >
            <FiTrash2 /> Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}  