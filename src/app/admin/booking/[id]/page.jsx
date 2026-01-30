"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_PRIVATE } from "@/utils/api";

export default function BookingDetails() {
  const { id } = useParams();
  const router = useRouter();

  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchBooking = async () => {
    try {
      setError("");
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await API_PRIVATE.get(`/api/admin/bookings/${id}`);
      setBooking(res.data);
    } catch (err) {
      console.error(err);

      if (err?.response?.status === 403) {
        setError("403 Forbidden: You are not ADMIN or token is invalid.");
      } else {
        setError("Unable to load booking details");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchBooking();
  }, [id]);

  const approveBooking = async () => {
    try {
      await API_PRIVATE.patch(`/api/admin/bookings/${id}/approve`, {});
      fetchBooking();
    } catch (err) {
      console.error(err);
      alert("Approve failed");
    }
  };

  const rejectBooking = async () => {
    try {
      await API_PRIVATE.patch(`/api/admin/bookings/${id}/reject`, {});
      fetchBooking();
    } catch (err) {
      console.error(err);
      alert("Reject failed");
    }
  };

  if (loading) return <p className="p-10">Loading...</p>;
  if (error) return <p className="p-10 text-red-600">{error}</p>;
  if (!booking) return <p className="p-10">No booking found</p>;

  return (
    <div className="min-h-screen p-10 bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Booking Details</h1>

        {/* User Info */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">User Information</h2>
          <p><b>Name:</b> {booking.user?.name || "N/A"}</p>
          <p><b>Email:</b> {booking.user?.email || "N/A"}</p>
          <p><b>Phone:</b> {booking.user?.phone || "N/A"}</p>
        </div>

        {/* Booking Info */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Booking Information</h2>
          <p><b>Service:</b> {booking.serviceType || "N/A"}</p>

          {booking.serviceType === "CUSTOMIZED" && booking.customizedService && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-md font-semibold mb-2">Customization Details</h3>

              <p><b>CC:</b> {booking.customizedService.cc || 0}</p>
              <p><b>Wash:</b> {booking.customizedService.wash ? "Yes" : "No"}</p>
              <p><b>Oil Change:</b> {booking.customizedService.oilChange ? "Yes" : "No"}</p>
              <p><b>Chain Lube:</b> {booking.customizedService.chainLube ? "Yes" : "No"}</p>
              <p><b>Engine Tuneup:</b> {booking.customizedService.engineTuneUp ? "Yes" : "No"}</p>
              <p><b>Break Check:</b> {booking.customizedService.breakCheck ? "Yes" : "No"}</p>
              <p><b>Full Body Polishing:</b> {booking.customizedService.fullbodyPolishing ? "Yes" : "No"}</p>
              <p><b>General Inspection:</b> {booking.customizedService.generalInspection ? "Yes" : "No"}</p>

              <p className="font-bold mt-2">
                <b>Total Price:</b> ₹{booking.customizedService.totalPrice || 0}
              </p>
            </div>
          )}

          <p><b>Date:</b> {booking.appointmentDate || "N/A"}</p>
          <p><b>Status:</b> {booking.status || "N/A"}</p>
        </div>

        {/* Bike Info */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Bike Details</h2>
          <p><b>Company:</b> {booking.bikeCompany?.name || "N/A"}</p>
          <p><b>Model:</b> {booking.bikeModel?.modelName || "N/A"}</p>
        </div>

        {/* Action Buttons */}
        {booking.status === "PENDING" && (
          <div className="flex gap-4 mt-4">
            <button
              onClick={approveBooking}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              APPROVE
            </button>

            <button
              onClick={rejectBooking}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              REJECT
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
