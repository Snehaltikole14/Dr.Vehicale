"use client";

import { useEffect, useState } from "react";
import { FiMenu, FiBell, FiUser, FiSearch, FiSettings } from "react-icons/fi";
import { MdMiscellaneousServices } from "react-icons/md";
import axios from "axios";
 import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
 
  const router = useRouter();


  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/admin/bookings", {
        withCredentials: true,
      });
      setBookings(res.data);
    } catch (err) {
      setError("Unable to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const approveBooking = async (id) => {
    try {
      await axios.patch(
        `http://localhost:8080/api/admin/bookings/${id}/approve`,
        {},
        {
          withCredentials: true,
        }
      );
      fetchBookings(); // refresh bookings after update
    } catch (err) {
      console.error(err);
      alert("Failed to approve booking");
    }
  };

  const rejectBooking = async (id) => {
    try {
      await axios.patch(
        `http://localhost:8080/api/admin/bookings/${id}/reject`,
        {},
        {
          withCredentials: true,
        }
      );
      fetchBookings(); // refresh bookings after update
    } catch (err) {
      console.error(err);
      alert("Failed to reject booking");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-10">
        {/* Stats Section */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow flex items-center gap-4">
            <div className="bg-blue-100 text-blue-600 p-3 sm:p-4 rounded-full">
              <MdMiscellaneousServices size={28} />
            </div>
            <div>
              <p className="text-gray-500 text-sm sm:text-base">
                Total Bookings
              </p>
              <p className="text-2xl sm:text-3xl font-bold">
                {bookings.length}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow flex items-center gap-4">
            <div className="bg-green-100 text-green-600 p-3 sm:p-4 rounded-full">
              <FiUser size={28} />
            </div>
            <div>
              <p className="text-gray-500 text-sm sm:text-base">
                Active Mechanics
              </p>
              <p className="text-2xl sm:text-3xl font-bold">18</p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow flex items-center gap-4">
            <div className="bg-purple-100 text-purple-600 p-3 sm:p-4 rounded-full">
              <FiUser size={28} />
            </div>
            <div>
              <p className="text-gray-500 text-sm sm:text-base">Users</p>
              <p className="text-2xl sm:text-3xl font-bold">430</p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow flex items-center gap-4">
            <div className="bg-yellow-100 text-yellow-600 p-3 sm:p-4 rounded-full">
              ₹
            </div>
            <div>
              <p className="text-gray-500 text-sm sm:text-base">Revenue</p>
              <p className="text-2xl sm:text-3xl font-bold">₹85,000</p>
            </div>
          </div>
        </div>

        {/* Table Wrapper */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow overflow-x-auto">
          <h3 className="text-lg sm:text-xl font-semibold mb-4">
            Recent Bookings
          </h3>

          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : bookings.length === 0 ? (
            <p>No bookings found.</p>
          ) : (
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow overflow-x-auto">
            <table className="w-full text-sm sm:text-base min-w-[800px]">
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
                    onClick={() => router.push(`/admin/booking/${b.id}`)}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="p-3">{b.user?.name || "N/A"}</td>

                    <td className="p-3">
                      {b.bikeCompany?.name || "N/A"} {b.bikeModel?.name || ""}
                    </td>

                    <td className="p-3">{b.serviceType}</td>

                    <td className="p-3">{b.appointmentDate}</td>

                    {/* NEW PRICE CELL */}
                    <td className="p-3 font-semibold text-blue-600">
                      ₹{b.servicePrice || b.price || "0"}
                    </td>

                    <td
                      className={`p-3 font-semibold
            ${b.status === "COMPLETED" ? "text-green-600" : ""}
            ${b.status === "CANCELLED" ? "text-red-600" : ""}
            ${b.status === "PENDING" ? "text-yellow-600" : ""}
          `}
                    >
                      {b.status}
                    </td>

                    <td
                      className="p-3 flex flex-col sm:flex-row gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {b.status === "PENDING" && (
                        <div>
                          <button
                            onClick={() => approveBooking(b.id)}
                            className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                          >
                            COMPLETED
                          </button>

                          <button
                            onClick={() => rejectBooking(b.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                          >
                            CANCELLED
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}