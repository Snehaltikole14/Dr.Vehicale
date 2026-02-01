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

  // ================= PAYMENT HELPERS =================
  const getPaymentStatus = (b) => {
    // support different backend response structures
    const status =
      b?.paymentStatus ||
      b?.payment?.status ||
      b?.payment?.paymentStatus ||
      (b?.isPaid ? "PAID" : null) ||
      (b?.paymentVerified ? "PAID" : null) ||
      (b?.payment?.verified ? "PAID" : null) ||
      null;

    return status ? String(status).toUpperCase() : "UNPAID";
  };

  const getPaymentBadgeClass = (status) => {
    if (status === "PAID" || status === "SUCCESS") return "bg-green-100 text-green-700";
    if (status === "FAILED") return "bg-red-100 text-red-700";
    if (status === "PENDING") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-700"; // UNPAID / UNKNOWN
  };

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

  // ===== Payment extracted values =====
  const payStatus = getPaymentStatus(booking);

  const paymentObj = booking.payment || booking.paymentDetails || null;

  const paymentMethod =
    booking.paymentMethod ||
    paymentObj?.method ||
    paymentObj?.paymentMethod ||
    "";

  const razorpayOrderId =
    booking.razorpayOrderId ||
    paymentObj?.razorpayOrderId ||
    paymentObj?.razorpay_order_id ||
    "";

  const razorpayPaymentId =
    booking.razorpayPaymentId ||
    paymentObj?.razorpayPaymentId ||
    paymentObj?.razorpay_payment_id ||
    "";

  const razorpaySignature =
    booking.razorpaySignature ||
    paymentObj?.razorpaySignature ||
    paymentObj?.razorpay_signature ||
    "";

  const amount =
    booking.amount ||
    booking.servicePrice ||
    booking.price ||
    paymentObj?.amount ||
    "";

  const currency = paymentObj?.currency || "INR";

  const verified =
    booking.paymentVerified ??
    paymentObj?.verified ??
    paymentObj?.isVerified ??
    null;

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

  {/* ✅ CUSTOMIZED DETAILS FIX */}
  {booking.serviceType === "CUSTOMIZED" && (() => {
    const cs =
      booking.customizedService ||
      booking.customService ||
      booking.customized ||
      booking.customServiceDetails ||
      null;

    // If backend only sends ID
    const csId =
      booking.customizedServiceId ||
      booking.customServiceId ||
      booking.customized_id ||
      null;

    if (!cs && !csId) {
      return (
        <div className="mb-4 p-4 bg-red-50 rounded-lg border">
          <p className="font-semibold text-red-600">
            Customized service not found in API response ❌
          </p>
          <p className="text-sm text-gray-700">
            Backend is sending only ID or not returning customized service object.
          </p>
        </div>
      );
    }

    // If only ID present (no object)
    if (!cs && csId) {
      return (
        <div className="mb-4 p-4 bg-yellow-50 rounded-lg border">
          <p className="font-semibold text-yellow-700">
            Customized service linked (ID: {csId}) but details not returned.
          </p>
          <p className="text-sm text-gray-700">
            Please update backend: Admin booking details API should include customizedService object.
          </p>
        </div>
      );
    }

    // If object exists
    return (
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-md font-semibold mb-2">Customization Details</h3>

        <p><b>CC:</b> {cs.cc || 0}</p>
        <p><b>Wash:</b> {cs.wash ? "Yes" : "No"}</p>
        <p><b>Oil Change:</b> {cs.oilChange ? "Yes" : "No"}</p>
        <p><b>Chain Lube:</b> {cs.chainLube ? "Yes" : "No"}</p>
        <p><b>Engine Tuneup:</b> {cs.engineTuneUp ? "Yes" : "No"}</p>
        <p><b>Break Check:</b> {cs.breakCheck ? "Yes" : "No"}</p>
        <p><b>Full Body Polishing:</b> {cs.fullbodyPolishing ? "Yes" : "No"}</p>
        <p><b>General Inspection:</b> {cs.generalInspection ? "Yes" : "No"}</p>

        <p className="font-bold mt-2">
          <b>Total Price:</b> ₹{cs.totalPrice || 0}
        </p>
      </div>
    );
  })()}

  <p><b>Date:</b> {booking.appointmentDate || "N/A"}</p>
  <p><b>Status:</b> {booking.status || "N/A"}</p>
</div>


        {/* Bike Info */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Bike Details</h2>
          <p><b>Company:</b> {booking.bikeCompany?.name || "N/A"}</p>
          <p><b>Model:</b> {booking.bikeModel?.modelName || "N/A"}</p>
        </div>

        {/* ✅ PAYMENT INFO */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Payment Information</h2>

          <div className="p-4 rounded-lg border bg-gray-50">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-semibold">Payment Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentBadgeClass(
                  payStatus
                )}`}
              >
                {payStatus}
              </span>
            </div>

            <p><b>Amount:</b> {amount ? `₹${amount}` : "N/A"}</p>
            <p><b>Currency:</b> {currency || "INR"}</p>
            <p><b>Method:</b> {paymentMethod || "N/A"}</p>

            <div className="mt-3">
              <p className="font-semibold mb-2">Razorpay Details</p>
              <p className="break-all"><b>Order ID:</b> {razorpayOrderId || "N/A"}</p>
              <p className="break-all"><b>Payment ID:</b> {razorpayPaymentId || "N/A"}</p>
              <p className="break-all"><b>Signature:</b> {razorpaySignature || "N/A"}</p>
            </div>

            <p className="mt-3">
              <b>Verified:</b>{" "}
              {verified === null ? "N/A" : verified ? "Yes ✅" : "No ❌"}
            </p>
          </div>
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

