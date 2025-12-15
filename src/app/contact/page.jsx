"use client";

import { FiMapPin, FiNavigation, FiPhone, FiClock } from "react-icons/fi";
import { FaWhatsapp, FaStar } from "react-icons/fa";

export default function ShopLocation() {
  return (
    <section className="bg-gray-50 py-10 sm:py-14 lg:py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
            Visit Our Workshop
          </h2>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Trusted two-wheeler service center in Hadapsar, Pune
          </p>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
          {/* LEFT SECTION */}
          <div className="space-y-5 sm:space-y-6">
            {/* INFO CARD */}
            <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-7 lg:p-8">
              <div className="flex gap-4">
                <div className="bg-blue-100 text-blue-600 p-3 sm:p-4 rounded-full shrink-0">
                  <FiMapPin size={22} />
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                    Dr Vehicle Care
                  </h3>
                  <p className="text-gray-500 text-sm sm:text-base">
                    Two-Wheeler & Vehicle Service Center
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-2 text-yellow-500">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <FaStar key={i} />
                    ))}
                    <span className="text-gray-600 ml-2 text-xs sm:text-sm">
                      5.0 Rating
                    </span>
                  </div>
                </div>
              </div>

              {/* Address */}
              <p className="text-gray-700 mt-5 text-sm sm:text-base leading-relaxed">
                Amanora Park Town Main Rd,
                <br />
                Laxmi Colony, Hadapsar,
                <br />
                Pune, Maharashtra 411028
              </p>

              {/* Timing */}
              <div className="flex items-center gap-3 mt-4 text-gray-700 text-sm sm:text-base">
                <FiClock className="text-blue-600" />
                Mon – Sat | 9:00 AM – 8:00 PM
              </div>

              {/* ACTION BUTTONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-3 mt-6">
                <a
                  href="tel:+919XXXXXXXXX"
                  className="flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-sm sm:text-base font-medium"
                >
                  <FiPhone /> Call Now
                </a>

                <a
                  href="https://wa.me/9322685296"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg text-sm sm:text-base font-medium"
                >
                  <FaWhatsapp /> WhatsApp
                </a>

                <a
                  href="https://maps.app.goo.gl/HSTL5tjmpsQzpeAH8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex justify-center items-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg text-sm sm:text-base font-medium sm:col-span-2 lg:col-auto"
                >
                  <FiNavigation /> Get Directions
                </a>
              </div>
            </div>

            {/* IMAGE */}
            {/* <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <img
                src="/shop.jpg"
                alt="Dr Vehicle Care Workshop"
                className="w-full h-44 sm:h-56 md:h-64 object-cover"
              />
            </div> */}
          </div>

          {/* MAP SECTION */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <iframe
              title="Dr Vehicle Care Location"
              src="https://www.google.com/maps?q=Amanora%20Park%20Town%20Main%20Rd%20Laxmi%20Colony%20Hadapsar%20Pune%20411028&output=embed"
              className="w-full h-64 sm:h-80 md:h-[420px] lg:h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
