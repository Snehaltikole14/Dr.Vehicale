"use client";

import React, { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function BikeServicesSection() {
  const [services, setServices] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await fetch(
          "https://dr-vehicle-backend.onrender.com/api/services/plans"
        ); // Make sure endpoint matches SecurityConfig
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        const data = await res.json();
        setServices(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching services:", err);
        setError(err.message);
      }
    };
    loadServices();
  }, []);

  // Show only 3 services initially if showAll is false
  const displayedServices = showAll ? services : services.slice(0, 3);

  return (
    <section className="px-6 py-12 md:py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Bike Servicing Plans
          </h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Choose the right plan for your bike’s engine capacity.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-center text-red-600 mb-6">
            Failed to load services: {error}
          </p>
        )}

        {/* Services Grid */}
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
          {displayedServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className={`rounded-2xl p-8 shadow-md hover:shadow-lg transition-all duration-300 bg-white border ${
                service.highlight
                  ? "border-yellow-400 ring-4 ring-yellow-50"
                  : "border-yellow-400"
              }`}
            >
              <h3 className="text-xl font-semibold text-gray-900">
                {service.title}
              </h3>
              <p className="mt-2 text-3xl font-extrabold text-yellow-600">
                {service.price}
              </p>

              <ul className="mt-6 space-y-3 text-gray-700">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 w-6 h-6 flex items-center justify-center rounded-full bg-yellow-50 text-yellow-700 text-xs font-bold">
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <a
                  href={localStorage.getItem("token") ? "/book" : "/login"}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700"
                >
                  Book Now <ChevronRight size={18} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View Details / Show Less Button */}
        {services.length > 3 && (
          <div className="text-center mt-6">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-6 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition"
            >
              {showAll ? "Show Less" : "View Details"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
