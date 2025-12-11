"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { useRouter } from "next/navigation";
export default function SavedServices() {
  const [services, setServices] = useState([]);
  const userId = 1; // TODO: replace with token-based logged-in user id


const router = useRouter();
  useEffect(() => {
    fetch(`http://localhost:8080/api/customized/user/${userId}`)
      .then((res) => res.json())
      .then((data) => setServices(data));
  }, []);
  
  const handleBookNow = (service) => {
    // Navigate to booking page with query params
    router.push(
      `/book?customServiceId=${service.id}&companyId=${service.bikeCompanyId}&modelId=${service.bikeModelId}`
    );
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
             className="p-6 bg-white rounded-3xl shadow-lg border
              border-gray-100" >
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
