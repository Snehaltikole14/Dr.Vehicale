"use client";

import { FiMapPin, FiNavigation, FiPhone, FiClock } from "react-icons/fi";
import { FaWhatsapp, FaStar } from "react-icons/fa";

export default function ShopLocation() {
  return (
    <section className="bg-gray-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800">
            Visit Our Workshop
          </h2>
          <p className="text-gray-600 mt-2">
            Trusted two-wheeler service center in Hadapsar, Pune
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* LEFT SIDE */}
          <div className="space-y-6">
            {/* Shop Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 text-blue-600 p-4 rounded-full">
                  <FiMapPin size={26} />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Dr Vehicle Care
                  </h3>
                  <p className="text-gray-500">
                    Two-Wheeler & Vehicle Service Center
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-2 text-yellow-500">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <span className="text-gray-600 ml-2 text-sm">
                      5.0 Rating
                    </span>
                  </div>
                </div>
              </div>

              {/* Address */}
              <p className="text-gray-700 mt-6 leading-relaxed">
                Amanora Park Town Main Rd,
                <br />
                Laxmi Colony, Hadapsar,
                <br />
                Pune, Maharashtra 411028
              </p>

              {/* Timing */}
              <div className="flex items-center gap-3 mt-4 text-gray-700">
                <FiClock className="text-blue-600" />
                <span>
                  <strong>Open:</strong> Mon – Sat | 9:00 AM – 8:00 PM
                </span>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap gap-4 mt-6">
                <a
                  href="tel:+919XXXXXXXXX"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium transition"
                >
                  <FiPhone />
                  Call Now
                </a>

                <a
                  href="https://wa.me/9322685296"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-medium transition"
                >
                  <FaWhatsapp />
                  WhatsApp
                </a>

                <a
                  href="https://maps.app.goo.gl/HSTL5tjmpsQzpeAH8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50 px-5 py-3 rounded-lg font-medium transition"
                >
                  <FiNavigation />
                  Get Directions
                </a>
              </div>
            </div>

            {/* Shop Image */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <img
                src="/shop.jpg" // 👉 replace with your shop image
                alt="Dr Vehicle Care Workshop"
                className="w-full h-[260px] object-cover"
              />
            </div>
          </div>

          {/* RIGHT SIDE MAP */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <iframe
              title="Dr Vehicle Care Location"
              src="https://www.google.com/maps?q=Amanora%20Park%20Town%20Main%20Rd%20Laxmi%20Colony%20Hadapsar%20Pune%20411028&output=embed"
              className="w-full h-[600px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
