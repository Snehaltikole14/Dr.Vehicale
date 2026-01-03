"use client";
import { usePathname } from "next/navigation";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  const hideHeader =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/admin");

  return (
    <html lang="en" style={{ colorScheme: "light" }}>
      <head>
        {/* 🔥 Prevent forced dark mode */}
        <meta name="color-scheme" content="light" />
      </head>

      <body
        className={`${
          !hideHeader ? "pt-[70px]" : "pt-0"
        } flex flex-col min-h-screen bg-white text-black`}
      >
        {!hideHeader && <Header />}

        <main className="flex-grow">{children}</main>

        {!hideHeader && <Footer />}

        <Toaster position="top-right" />
      </body>
    </html>
  );
}
