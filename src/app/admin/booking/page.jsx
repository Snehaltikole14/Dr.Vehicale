"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

const API = "http://localhost:8080/api/admin";

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH BOOKINGS =================
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/bookings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setBookings(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  // ================= UPDATE STATUS =================
  const markCompleted = async (id) => {
    try {
      await axios.patch(
        `${API}/bookings/${id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Booking marked as COMPLETED");
      fetchBookings();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update booking");
    }
  };

  const markCancelled = async (id) => {
    try {
      await axios.patch(
        `${API}/bookings/${id}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Booking marked as CANCELLED");
      fetchBookings();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update booking");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6">All Bookings</h1>

      {loading ? (
        <p>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="w-full min-w-[900px] text-sm sm:text-base">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-3">User</th>
                <th className="p-3">Bike</th>
                <th className="p-3">Service</th>
                <th className="p-3">Date</th>
                <th className="p-3">Price</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((b) => (
                <tr
                  key={b.id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/admin/booking/${b.id}`)}
                >
                  <td className="p-3">{b.user?.name || "N/A"}</td>

                  <td className="p-3">
                    {b.bikeCompany?.name || "N/A"} {b.bikeModel?.name || ""}
                  </td>

                  <td className="p-3">{b.serviceType}</td>

                  <td className="p-3">{b.appointmentDate}</td>

                  <td className="p-3 font-semibold text-blue-600">
                    ₹{b.servicePrice || b.price || 0}
                  </td>

                  {/* STATUS BADGE */}
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${
                          b.status === "COMPLETED"
                            ? "bg-green-100 text-green-700"
                            : b.status === "CANCELLED"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {b.status}
                    </span>
                  </td>

                  {/* ACTION BUTTONS */}
                  <td
                    className="p-3 flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {b.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => markCompleted(b.id)}
                          className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                        >
                          COMPLETE
                        </button>

                        <button
                          onClick={() => markCancelled(b.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                        >
                          CANCEL
                        </button>
                      </>
                    )}

                    {b.status !== "PENDING" && (
                      <span className="text-gray-400 text-xs">No actions</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
