"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

const API = "https://dr-vehicle-backend.onrender.com/api/admin";

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

  // ================= PAYMENT STATUS HELPER =================
  const getPaymentStatus = (b) => {
    // support different backend structures
    const status =
      b.paymentStatus ||
      b.payment?.status ||
      (b.isPaid ? "PAID" : null) ||
      (b.paymentVerified ? "PAID" : null) ||
      null;

    // if not present, decide based on servicePrice/payment fields
    if (!status) return "UNPAID";

    return String(status).toUpperCase();
  };

  const getPaymentBadgeClass = (status) => {
    if (status === "PAID" || status === "SUCCESS") return "bg-green-100 text-green-700";
    if (status === "FAILED") return "bg-red-100 text-red-700";
    if (status === "PENDING") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-700"; // UNPAID / UNKNOWN
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6">All Bookings</h1>

      {loading ? (
        <p>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="w-full min-w-[1100px] text-sm sm:text-base">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-3">User</th>
                <th className="p-3">Bike</th>
                <th className="p-3">Service</th>
                <th className="p-3">Date</th>
                <th className="p-3">Price</th>

                {/* ✅ NEW COLUMN */}
                <th className="p-3">Payment</th>

                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((b) => {
                const payStatus = getPaymentStatus(b);
                const payMethod =
                  b.paymentMethod || b.payment?.method || b.payment?.paymentMethod || "";

                return (
                  <tr
                    key={b.id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/admin/booking/${b.id}`)}
                  >
                    <td className="p-3">{b.user?.name || "N/A"}</td>

                    <td className="p-3">
                      {b.bikeCompany?.name || "N/A"} {b.bikeModel?.modelName || ""}
                    </td>

                    <td className="p-3">{b.serviceType}</td>

                    <td className="p-3">{b.appointmentDate}</td>

                    <td className="p-3 font-semibold text-blue-600">
                      ₹{b.servicePrice || b.price || 0}
                    </td>

                    {/* ✅ PAYMENT STATUS */}
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex w-fit px-3 py-1 rounded-full text-xs font-semibold ${getPaymentBadgeClass(
                            payStatus
                          )}`}
                        >
                          {payStatus}
                        </span>

                        {payMethod && (
                          <span className="text-[11px] text-gray-500">
                            {payMethod}
                          </span>
                        )}
                      </div>
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
