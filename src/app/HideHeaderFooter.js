"use client";

import { usePathname } from "next/navigation";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function HideHeaderFooter({ children }) {
  const pathname = usePathname();

  // pages where header & footer should NOT appear
  const hiddenRoutes = ["/login", "/signup"];

  const shouldHide = hiddenRoutes.includes(pathname);

  return (
    <>
      {!shouldHide && <Header />}

      <main className="flex-grow">{children}</main>

      {!shouldHide && <Footer />}
    </>
  );
}
