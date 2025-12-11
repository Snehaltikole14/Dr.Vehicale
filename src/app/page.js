"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

// Dynamically import map modal
const LocationModalWithMap = dynamic(
  () => import("./LocationModalWithMap/page.jsx"),
  { ssr: false }
);

export default function HomePage() {
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loc = localStorage.getItem("selectedLocation");
    if (loc) setLocationConfirmed(true);
  }, []);

  if (!locationConfirmed) {
    return (
      <LocationModalWithMap
        onLocationConfirmed={() => setLocationConfirmed(true)}
      />
    );
  }

  return (
    <main className="relative bg-gradient-to-b from-blue-50 via-white to-white overflow-hidden">
      {/* Background Gradient Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-64 h-64 bg-blue-300/20 rounded-full blur-3xl top-20 left-20"></div>
        <div className="absolute w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl bottom-20 right-20"></div>
      </div>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between py-20">
        {/* Left Text */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="flex-1"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight">
            Doorstep Bike Servicing,
            <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
              Delivered by Experts
            </span>
          </h1>

          <p className="text-gray-600 text-lg mt-4 md:w-4/5">
            Get reliable, high-quality bike maintenance at your home with
            skilled technicians and premium tools.
          </p>

          <div className="mt-8 flex gap-5">
            <Link
              href="/services"
              className="px-8 py-3 rounded-full bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition"
            >
              Explore Services
            </Link>

            <Link
              href="/contact"
              className="px-8 py-3 rounded-full border border-blue-600 text-blue-700 font-semibold hover:bg-blue-50 transition"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>

        {/* Right Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="flex-1 flex justify-center mt-10 md:mt-0"
        >
          <motion.img
            src="/bg.jpg"
            alt="Bike Service"
            className="w-[400px] md:w-[480px] rounded-3xl shadow-xl"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </motion.div>
      </section>

      {/* WELCOME SECTION */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome to <span className="text-blue-600">Dr.Vehicle Care</span>
            </h2>

            <p className="text-gray-600 mt-4 leading-relaxed">
              Experience premium home bike servicing designed for convenience,
              quality, and trust.
            </p>

            <p className="text-gray-600 mt-3 leading-relaxed">
              From basic cleaning to premium maintenance — our experts bring
              advanced tools and years of experience right to your doorstep.
            </p>
          </div>

          <div className="flex justify-center">
            <img
              src="/bg.jpg"
              className="w-full max-w-md rounded-2xl shadow-2xl border border-gray-200"
              alt="Bike Service"
            />
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Our Premium Services
        </h2>

        <div className="max-w-7xl mx-auto px-6 md:px-10 grid md:grid-cols-3 gap-10">
          {[
            {
              icon: "🛠️",
              title: "Customized Servicing",
              desc: "Professional tools, accurate diagnostics and complete maintenance.",
              link: "/custom-service",
              color: "from-blue-600 to-cyan-500",
            },
            {
              icon: "⚡",
              title: "Instant Booking",
              desc: "Book your preferred slot instantly with a smooth online process.",
              link: "/book",
              color: "from-blue-500 to-blue-700",
            },
            {
              icon: "✨",
              title: "Premium Products",
              desc: "We only use high-quality, safe and eco-friendly products.",
              link: "/services/premium-products",
              color: "from-cyan-500 to-blue-400",
            },
          ].map((service, index) => (
            <Link key={index} href={service.link}>
              <motion.div
                whileHover={{ y: -6 }}
                className="p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 transition"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} text-white text-3xl flex items-center justify-center shadow-md`}
                >
                  {service.icon}
                </div>

                <h3 className="text-xl font-semibold mt-4 text-gray-800">
                  {service.title}
                </h3>

                <p className="text-gray-600 mt-2">{service.desc}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-16 bg-gradient-to-r from-blue-700 to-cyan-600 text-center text-white">
        <h2 className="text-3xl font-bold">Book Your Service Now</h2>
        <p className="text-white/90 mt-3">
          Get a free basic checkup with every booking.
        </p>

        <button
          onClick={() =>
            router.push(localStorage.getItem("token") ? "/book" : "/login")
          }
          className="mt-8 px-10 py-3 rounded-full bg-white text-blue-700 font-semibold shadow-xl hover:bg-gray-100 transition"
        >
          Book Now
        </button>
      </section>
    </main>
  );
}
