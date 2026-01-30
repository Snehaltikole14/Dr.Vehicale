"use client";

import { useEffect, useState } from "react";
import { API } from "@/utils/api";
import toast from "react-hot-toast";
import {
  FiCalendar,
  FiMapPin,
  FiTool,
  FiChevronRight,
  FiTrash2,
} from "react-icons/fi";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(""); // move token here

  // Fetch user bookings
  const fetchBookings = async (authToken) => {
    if (!authToken) {
      toast.error("Please login first");
      setLoading(false);
      return;
    }

    try {
      const res = await API.get("/api/bookings/my", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setBookings(res.data);
    } catch (err) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only run in browser
    const stoblueToken = localStorage.getItem("token");
    setToken(stoblueToken);
    fetchBookings(stoblueToken);
  }, []);

  // Delete booking
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      await API.delete(`/api/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Booking deleted successfully");
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      toast.error("Failed to delete booking");
    }
  };

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-600">Loading bookings...</p>
    );

  return (
    <div className="min-h-screen bg-blue-50 p-5">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        My Bookings
      </h1>

      {bookings.length === 0 ? (
        <p className="text-center text-gray-500">No bookings found.</p>
      ) : (
        <div className="grid gap-4 max-w-3xl mx-auto">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-white p-5 rounded-xl shadow-md border hover:shadow-lg transition"
            >
              <div className="flex justify-between">
                <h2 className="text-lg font-bold text-blue-700">
                  {b.bikeCompany?.companyName} - {b.bikeModel?.modelName}
                </h2>
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                    b.status === "PENDING"
                      ? "bg-yellow-200 text-yellow-800"
                      : b.status === "COMPLETED"
                      ? "bg-green-200 text-green-700"
                      : "bg-blue-200 text-blue-700"
                  }`}
                >
                  {b.status}
                </span>
              </div>

              <div className="mt-3 space-y-2 text-gray-700">
                <p className="flex items-center gap-2">
                  <FiTool className="text-blue-500" /> Service:{" "}
                  <span className="font-semibold">{b.serviceType}</span>
                </p>

                <p className="flex items-center gap-2">
                  <FiCalendar className="text-blue-500" /> Date:{" "}
                  <span className="font-semibold">{b.appointmentDate}</span>
                </p>

                <p className="flex items-start gap-2">
                  <FiMapPin className="text-blue-500 mt-1" /> Address:{" "}
                  <span>
                    {b.fullAddress}, {b.city} <br />
                    Landmark: {b.landmark}
                  </span>
                </p>
              </div>

              <div className="mt-4 flex justify-between items-center">


                <div className="flex justify-between mt-2">
                  <span className="text-gray-600 font-medium">Payment:</span>
                  <span
                    className={`px-2 py-1 rounded-lg text-sm font-semibold ${
                      b.paymentStatus === "PAID"
                        ? "bg-green-200 text-green-700"
                        : "bg-blue-200 text-blue-700"
                    }`}
                  >
                    {b.paymentStatus}
                  </span>
                </div>

                <button
                  onClick={() => handleDelete(b.id)}
                  className="flex items-center text-blue-600 font-medium hover:underline"
                >
                  <FiTrash2 className="mr-1" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
