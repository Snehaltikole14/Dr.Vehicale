"use client";

import { useEffect, useState } from "react";
import { FiUsers, FiSettings, FiUser } from "react-icons/fi";
import { MdOutlineBookOnline, MdMiscellaneousServices } from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";
import { Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const API = "https://dr-vehicle-backend.onrender.com/api/admin";

/* ===== COLOR MAP ===== */
const COLOR_MAP = {
  purple: "from-purple-500 to-purple-600",
  blue: "from-blue-500 to-blue-600",
  green: "from-green-500 to-green-600",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    revenue: 0, // MONTHLY revenue
  });

  const [revenueByMonth, setRevenueByMonth] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===== FETCH STATS ===== */
  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setStats({
        totalUsers: res.data.totalUsers || 0,
        totalBookings: res.data.totalBookings || 0,
        revenue: res.data.revenue || 0,
      });

      setRevenueByMonth(res.data.revenueByMonth || []);
    } catch (err) {
      toast.error("Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  /* ===== CHART DATA ===== */
  const chartData = {
    labels: revenueByMonth.map((d) => d.month),
    datasets: [
      {
        label: "Monthly Revenue",
        data: revenueByMonth.map((d) => d.amount),
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      {/* ===== TITLE ===== */}
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <StatCard
          icon={<FiUsers size={26} />}
          label="Users"
          value={stats.totalUsers}
          gradient={COLOR_MAP.purple}
          loading={loading}
        />

        <StatCard
          icon={<MdOutlineBookOnline size={26} />}
          label="Bookings"
          value={stats.totalBookings}
          gradient={COLOR_MAP.blue}
          loading={loading}
        />

        <StatCard
          icon={<MdMiscellaneousServices size={26} />}
          label="Monthly Revenue"
          value={`₹${stats.revenue}`}
          gradient={COLOR_MAP.green}
          loading={loading}
        />
      </div>

      {/* ===== CHART ===== */}
      <div className="bg-white p-6 rounded-2xl shadow mb-10">
        <h3 className="text-lg font-semibold mb-4">Monthly Revenue</h3>
        <Line data={chartData} />
      </div>

      {/* ===== QUICK LINKS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <LinkCard
          label="View Bookings"
          icon={<MdOutlineBookOnline />}
          href="/admin/bookings"
        />
        <LinkCard
          label="Manage Users"
          icon={<FiUsers />}
          href="/admin/allusers"
        />
        <LinkCard label="Mechanics" icon={<FiUser />} href="/admin/mechanics" />
        <LinkCard
          label="Settings"
          icon={<FiSettings />}
          href="/admin/settings"
        />
      </div>
    </div>
  );
}

/* ===== STAT CARD ===== */
const StatCard = ({ icon, label, value, gradient, loading }) => (
  <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-4">
    <div className={`bg-gradient-to-br ${gradient} text-white p-4 rounded-xl`}>
      {icon}
    </div>
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-2xl font-bold">{loading ? "..." : value}</p>
    </div>
  </div>
);

/* ===== LINK CARD ===== */
const LinkCard = ({ label, icon, href }) => (
  <a
    href={href}
    className="bg-white rounded-2xl shadow p-6 flex items-center justify-center gap-3 font-semibold hover:bg-slate-50 transition"
  >
    <span className="text-xl">{icon}</span>
    {label}
  </a>
);
