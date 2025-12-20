import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaLinkedinIn,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#098af3] text-gray-100 mt-20">
      <div className="max-w-7xl mx-auto px-5 py-10">
        {/* Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
          {/* Brand */}
          <div>
            <h2 className="text-white text-xl font-semibold mb-3">
              Dr. Vehicle Care
            </h2>
            <p className="text-sm leading-relaxed">
              Professional bike and vehicle servicing at your doorstep. Trusted
              technicians, transparent pricing, and quality service.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-3">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>Bike Servicing</li>
              <li>Doorstep Service</li>
              <li>Engine Care</li>
              <li>Emergency Support</li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>About Us</li>
              <li>Contact Us</li>
              <li>Privacy Policy</li>
              <li>Terms & Conditions</li>
            </ul>
          </div>

          {/* Contact + Social */}
          <div>
            <h3 className="text-white font-semibold mb-3">Contact</h3>
            <ul className="space-y-2 text-sm mb-4">
              <li>📞 +91 7447 661 899</li>
              <li>📧 official@drvehiclecare.com</li>
              <li>📍 India</li>
            </ul>

            {/* Social Icons */}
            <div className="flex justify-center md:justify-start gap-4">
              <a
                href="#"
                aria-label="Facebook"
                className="bg-white text-[#098af3] p-2 rounded-full hover:scale-110 transition"
              >
                <FaFacebookF />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="bg-white text-[#098af3] p-2 rounded-full hover:scale-110 transition"
              >
                <FaInstagram />
              </a>
              <a
                href="https://wa.me/7066672848"
                aria-label="WhatsApp"
                className="bg-white text-[#098af3] p-2 rounded-full hover:scale-110 transition"
              >
                <FaWhatsapp />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="bg-white text-[#098af3] p-2 rounded-full hover:scale-110 transition"
              >
                <FaLinkedinIn />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-10 pt-4 text-center text-sm">
          © {new Date().getFullYear()} Dr. Vehicle Care. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
