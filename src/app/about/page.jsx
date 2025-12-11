"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Wrench, ShieldCheck, Bike, Star } from "lucide-react";

export default function AboutPage() {
  return (
    <section className="bg-gray-50 text-gray-800">
      {/* 🌟 Hero Section with Motion */}
      <div className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <Image
          src="/about.jpg"
          alt="Bike Servicing"
          fill
          priority
          unoptimized
          className="object-cover z-[-1] brightness-75"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80 z-0"></div>

        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative z-10 text-center text-white px-6"
        >
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg"
          >
            Your Trusted Partner in{" "}
            <span className="text-yellow-400">Bike Care</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="max-w-2xl mx-auto text-lg text-gray-200"
          >
            Expert home bike servicing to keep your ride smooth, reliable, and
            ready for every journey — anytime, anywhere.
          </motion.p>

          <motion.a
            href="/book"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-block mt-8 px-8 py-3 bg-yellow-500 text-black font-semibold rounded-full shadow-lg hover:bg-yellow-400 transition-all"
          >
            🚀 Book Your Service Now
          </motion.a>
        </motion.div>

        {/* Floating Icons Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2, y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 6 }}
          className="absolute bottom-8 right-10 text-yellow-400 text-6xl"
        >
          🏍️
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2, y: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 7, delay: 1 }}
          className="absolute top-10 left-12 text-yellow-400 text-5xl"
        >
          ⚙️
        </motion.div>
      </div>

      {/* 🧰 About Section */}
      <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Image
            src="/bg.jpg"
            alt="Dr. Vehicle Care Mechanic"
            width={600}
            height={400}
            className="rounded-2xl shadow-lg"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">About Dr. Vehicle Care</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            At <span className="font-semibold">Dr. Vehicle Care</span>, we
            believe your two-wheeler deserves expert care without the hassle of
            visiting a service center. We provide{" "}
            <span className="font-semibold text-yellow-600">
              doorstep bike servicing
            </span>{" "}
            and repair solutions — ensuring convenience, quality, and
            reliability.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Our certified mechanics use the latest tools and genuine spare parts
            to deliver top-notch maintenance and emergency repairs for all bike
            brands and models.
          </p>
        </motion.div>
      </div>

      {/* 💡 Why Choose Us Section */}
      <div className="bg-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Why Choose Us?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience hassle-free bike servicing with transparent pricing and
            trusted professionals.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: <Wrench size={28} className="text-yellow-600" />,
              title: "Doorstep Service",
              text: "Get your bike serviced at your home or office — no queues, no waiting.",
            },
            {
              icon: <ShieldCheck size={28} className="text-yellow-600" />,
              title: "Expert Technicians",
              text: "Experienced mechanics ensuring quality work with precision and care.",
            },
            {
              icon: <Bike size={28} className="text-yellow-600" />,
              title: "Genuine Spare Parts",
              text: "Only authentic parts for long-term performance and safety.",
            },
            {
              icon: <Star size={28} className="text-yellow-600" />,
              title: "Customer Satisfaction",
              text: "Your safety and convenience are always our top priorities.",
            },
            {
              icon: <Wrench size={28} className="text-yellow-600" />,
              title: "Transparent Pricing",
              text: "Affordable, honest service with no hidden charges or surprises.",
            },
            {
              icon: <ShieldCheck size={28} className="text-yellow-600" />,
              title: "Fast & Reliable",
              text: "Book, relax, and let our team handle the rest with on-time service.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gray-50 p-8 rounded-2xl border hover:shadow-xl transition-all text-center"
            >
              <div className="flex justify-center mb-4">{item.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 💬 Testimonials + Contact */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="bg-yellow-50 py-20 px-6 text-center"
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-gray-700 italic mb-6">
            “Dr. Vehicle Care provided exceptional bike servicing at home.
            Highly recommend their professional and convenient service!”
          </p>
          <div className="text-gray-800 font-semibold">– Happy Customer</div>
        </div>

        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-2">
            📍 Service Areas: Pune & PCMC
          </h3>
          <p className="text-gray-700">📞 7447661899 / 7066672848</p>
          <p className="text-gray-700">✉️ official@drvehiclecare.com</p>

          <motion.a
            href="/book"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block mt-6 px-8 py-3 bg-yellow-600 text-white font-semibold rounded-full hover:bg-yellow-700 transition-all"
          >
            🚀 Book Your Service Now
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
}
