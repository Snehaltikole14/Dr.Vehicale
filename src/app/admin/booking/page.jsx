"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

export default function BookingDetails() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");

  const fetchBooking = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/admin/bookings/${id}`,
        {
          withCredentials: true,
        }
      );
      setBooking(res.data);
    } catch (err) {
      setError("Unable to load booking details");
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  if (!booking) return <p className="p-10">Loading...</p>;

  return (
    <div className="min-h-screen p-10 bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Booking Details</h1>

        {/* User Info */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold">User Information</h2>
          <p>
            <b>Name:</b> {booking.user?.name}
          </p>
          <p>
            <b>Email:</b> {booking.user?.email}
          </p>
          <p>
            <b>Phone:</b> {booking.user?.phone}
          </p>
        </div>

        {/* Booking Info */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Booking Information</h2>
          <p>
            <b>Service:</b> {booking.serviceType}
          </p>
          <p>
            <b>Date:</b> {booking.appointmentDate}
          </p>
          <p>
            <b>Status:</b> {booking.status}
          </p>
        </div>

        {/* Bike Info */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Bike Details</h2>
          <p>
            <b>Company:</b> {booking.bikeCompany?.name}
          </p>
          <p>
            <b>Model:</b> {booking.bikeModel?.name}
          </p>
        </div>

        {/* Buttons */}
        {booking.status === "PENDING" && (
          <div className="flex gap-4 mt-6">
            <button
              onClick={() =>
                axios
                  .patch(
                    `http://localhost:8080/api/admin/bookings/${id}/approve`,
                    {},
                    { withCredentials: true }
                  )
                  .then(fetchBooking)
              }
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              APPROVE
            </button>

            <button
              onClick={() =>
                axios
                  .patch(
                    `http://localhost:8080/api/admin/bookings/${id}/reject`,
                    {},
                    { withCredentials: true }
                  )
                  .then(fetchBooking)
              }
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              REJECT
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
