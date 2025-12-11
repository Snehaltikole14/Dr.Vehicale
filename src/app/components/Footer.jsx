export default function Footer() {
  return (
    <footer className="bg-[#009FE3] text-white py-6 mt-16">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm">
          © {new Date().getFullYear()} Dr. Vehicle Care. All Rights Reserved.
        </p>
        <div className="flex gap-6 mt-3 md:mt-0">
          <a href="#" className="hover:text-yellow-300">
            Facebook
          </a>
          <a href="#" className="hover:text-yellow-300">
            Instagram
          </a>
          <a href="#" className="hover:text-yellow-300">
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
