"use client";

import Link from "next/link";

export default function DoorstepCleaning() {
  return (
    <main className="max-w-5xl mx-auto px-8 py-20">
      <h1 className="text-5xl font-bold text-blue-700 mb-6">
        Doorstep Cleaning
      </h1>
      <p className="text-lg text-gray-700 mb-6">
        Our professionals arrive at your location fully equipped with all the
        necessary tools and premium cleaning products. Enjoy a spotless vehicle
        without leaving your home!
      </p>
      <p className="text-gray-600 mb-10">
        We ensure a complete wash and detailing experience tailored to your
        vehicle’s needs. Eco-friendly products and expert care guaranteed.
      </p>
      <Link
        href="/services"
        className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition"
      >
        Back to Services
      </Link>
    </main>
  );
}
