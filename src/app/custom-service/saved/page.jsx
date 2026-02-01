"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { API } from "@/utils/api";

export default function SavedServices() {
  const [services, setServices] = useState([]);
  const router = useRouter();

  // ⚠️ TEMP: Use logged in userId
  // best: decode token or backend should give /my endpoint
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  useEffect(() => {
    const fetchServices = async () => {
      try {
        if (!userId) return;

        const res = await API.get(`/api/customized/user/${userId}`);
        setServices(res.data);
      } catch (error) {
        console.error("Error fetching saved services:", error);
      }
    };

    fetchServices();
  }, [userId]);

  const handleBookNow = (service) => {
    router.push(`/book?customServiceId=${service.id}`);
  };

  return (
    <main className="max-w-5xl mx-auto py-16 px-6">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-10">
        Your Saved Customized Services
      </h1>

      {services.length === 0 ? (
        <p className="text-center text-gray-600">No saved services yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {services.map((s) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => handleBookNow(s)}
              className="p-6 bg-white rounded-3xl shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {s.bikeCompany} - {s.bikeModel} ({s.cc} CC)
              </h2>

              <p className="text-gray-600 mb-3">
                <strong>Services:</strong>{" "}
                {[
                  s.wash && "Wash",
                  s.oilChange && "Oil Change",
                  s.chainLube && "Chain Lube",
                  s.engineTuneUp && "Engine Tune-up",
                  s.breakCheck && "Brake Check",
                  s.fullbodyPolishing && "Full Body Polishing",
                  s.generalInspection && "General Inspection",
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>

              <p className="text-gray-800 font-bold text-lg">
                Total Price: ₹{s.totalPrice}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
