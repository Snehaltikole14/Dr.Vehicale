"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Clock, Wrench, Star } from "lucide-react";

const LocationModalWithMap = dynamic(
  () => import("./LocationModalWithMap/page.jsx"),
  { ssr: false }
);

export default function HomePage() {
  const [locationConfirmed, setLocationConfirmed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("selectedLocation")) setLocationConfirmed(true);
  }, []);

  if (!locationConfirmed) {
    return (
      <LocationModalWithMap
        onLocationConfirmed={() => setLocationConfirmed(true)}
      />
    );
  }

  return (
    <main className="bg-[#F5F7FA] text-[#111827] overflow-x-hidden">
      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 md:px-10 py-32 flex flex-col lg:flex-row items-center gap-16">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1"
        >
          <span className="inline-block px-4 py-1 text-sm rounded-full bg-cyan-100 text-cyan-700 font-medium">
            Premium Bike Care
          </span>
          <h1 className="mt-6 text-4xl md:text-5xl xl:text-6xl font-extrabold leading-tight">
            Professional Bike Servicing
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-500">
              At Your Doorstep
            </span>
          </h1>
          <p className="mt-6 text-gray-700 max-w-lg">
            Hassle-free bike servicing with certified experts, advanced tools,
            and transparent pricing delivered to your home.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-cyan-500 text-white font-semibold shadow-lg hover:bg-cyan-400 transition"
            >
              Explore Services <ArrowRight size={18} />
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 rounded-full border border-gray-300 text-[#111827] hover:bg-gray-100 transition"
            >
              Contact Us
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-md">
            {[ShieldCheck, Clock, Wrench].map((Icon, i) => (
              <div key={i} className="flex items-center gap-3">
                <Icon className="text-cyan-500" />
                <span className="text-sm text-gray-700 font-medium">
                  {["Verified Experts", "On-Time Service", "Advanced Tools"][i]}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="flex-1 flex justify-center relative"
        >
          <motion.img
            src="/bg.jpg"
            alt="Bike Service"
            className="w-full max-w-md xl:max-w-lg rounded-[2.5rem] shadow-2xl"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </motion.div>
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
              color: "from-cyan-600 to-red-200",
            },
            {
              icon: "⚡",
              title: "Instant Booking",
              desc: "Book your preferred slot instantly with a smooth online process.",
              link: "/book",
              color: "from-cyan-300 to-red-200",
            },
            {
              icon: "✨",
              title: "Premium Products",
              desc: "We only use high-quality, safe and eco-friendly products.",
              link: "/services/premium-products",
              color: "from-cyan-500 to-red-200",
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

      {/* How It Works */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16">How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-10">
            {[
              {
                icon: ShieldCheck,
                title: "Book Service",
                desc: "Choose your slot online.",
              },
              {
                icon: Clock,
                title: "Technician Arrival",
                desc: "Expert arrives on time.",
              },
              {
                icon: Wrench,
                title: "Bike Serviced",
                desc: "Quality maintenance guaranteed.",
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6 }}
                className="bg-white/20 backdrop-blur-md p-8 rounded-3xl shadow-lg border border-white/30 transition"
              >
                <step.icon className="text-cyan-500 w-10 h-10 mb-4 mx-auto" />
                <h3 className="text-xl font-semibold text-[#111827]">
                  {step.title}
                </h3>
                <p className="mt-2 text-gray-700">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-[#E0F2FE]">
        <div className="max-w-5xl mx-auto px-6 md:px-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16">
            What Our Customers Say
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                className="bg-white p-6 rounded-3xl shadow-md border border-white/20"
              >
                <p className="text-gray-700 mb-4">
                  “Professional service! My bike feels brand new. Highly
                  recommend.”
                </p>
                <div className="flex items-center gap-3 justify-center">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="text-cyan-500 w-5 h-5" />
                  ))}
                  <span className="text-gray-600 text-sm">John Doe</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 text-center relative">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Service Your Bike?
          </h2>
          <p className="text-gray-700 mb-8">
            Book now and get a free basic inspection included with every
            service.
          </p>
          <Link
            href={localStorage.getItem("token") ? "/book" : "/login"}
            className="px-12 py-4 rounded-full bg-cyan-500 text-white font-semibold shadow-xl hover:bg-cyan-400 transition"
          >
            Book Now
          </Link>
        </div>
      </section>
    </main>
  );
}
