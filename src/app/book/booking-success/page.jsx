"use client";

import { useRouter } from "next/navigation";

export default function BookingSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-6">
      <div className="bg-white shadow-xl rounded-xl p-8 max-w-md text-center">
        <svg
          className="w-20 h-20 text-green-600 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <h1 className="text-3xl font-bold mb-2">Booking Successful!</h1>
        <p className="text-gray-700 mb-6">
          Your bike service has been successfully booked. Thank you for choosing
          us!
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}
