"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function BookingSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-4 sm:p-6 md:p-12">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="bg-white shadow-xl rounded-xl p-6 sm:p-8 md:p-12 max-w-sm sm:max-w-md md:max-w-lg text-center w-full"
      >
        <svg
          className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-green-600 mx-auto mb-4"
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

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
          Booking Successful!
        </h1>

        <p className="text-gray-700 text-sm sm:text-base md:text-lg mb-6">
          Your bike service has been successfully booked. Thank you for choosing
          us!
        </p>

        <button
          onClick={() => router.push("/")}
          className="bg-green-600 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg hover:bg-green-700 transition text-sm sm:text-base md:text-lg w-full sm:w-auto"
        >
          Go to Home
        </button>
      </motion.div>
    </div>
  );
}
