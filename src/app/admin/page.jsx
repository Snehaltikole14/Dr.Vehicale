"use client";

import { useEffect, useState } from "react";
import { FiUser } from "react-icons/fi";
import { MdMiscellaneousServices } from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const API = "http://localhost:8080/api/admin";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMechanics: 0,
    revenue: 0,
    totalBookings: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // ================= FETCH STATS =================
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await axios.get(`${API}/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setStats(res.data);
      setRevenueData(res.data.revenueByMonth || []); // revenue by month array from backend
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch stats");
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // ================= CHART DATA =================
  const chartData = {
    labels: revenueData.map((d) => d.month), // e.g., ["Jan", "Feb"]
    datasets: [
      {
        label: "Revenue",
        data: revenueData.map((d) => d.amount),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Revenue Trend" },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<FiUser size={28} />}
          label="Users"
          value={stats.totalUsers}
          color="purple"
          loading={loadingStats}
        />
        <StatCard
          icon={<FiUser size={28} />}
          label="Mechanics"
          value={stats.totalMechanics}
          color="green"
          loading={loadingStats}
        />
        <StatCard
          icon={<MdMiscellaneousServices size={28} />}
          label="Bookings"
          value={stats.totalBookings}
          color="blue"
          loading={loadingStats}
        />
        <StatCard
          label="Revenue"
          value={`₹${stats.revenue}`}
          color="yellow"
          loading={loadingStats}
        />
      </div>

      {/* REVENUE GRAPH */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow mb-8">
        <h3 className="text-lg sm:text-xl font-semibold mb-4">Revenue Graph</h3>
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* QUICK LINKS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <LinkCard label="View Bookings" href="/admin/bookings" />
        <LinkCard label="Manage Users" href="/admin/allusers" />
        <LinkCard label="Manage Mechanics" href="/admin/mechanics" />
        <LinkCard label="Settings" href="/admin/settings" />
      </div>
    </div>
  );
}

/* ================= STAT CARD ================= */
const StatCard = ({ icon, label, value, color, loading }) => (
  <div className="bg-white p-4 sm:p-6 rounded-xl shadow flex gap-4 items-center">
    <div className={`bg-${color}-100 text-${color}-600 p-4 rounded-full`}>
      {icon}
    </div>
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold">
        {loading ? "..." : value}
      </p>
    </div>
  </div>
);

const LinkCard = ({ label, href }) => (
  <a
    href={href}
    className="bg-white p-6 rounded-xl shadow hover:shadow-md transition flex justify-center items-center font-semibold"
  >
    {label}
  </a>
);
