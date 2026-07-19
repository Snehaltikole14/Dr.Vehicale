"use client";

import { usePathname } from "next/navigation";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Script from "next/script";

export default function RootLayout({ children }) {
const pathname = usePathname();

const hideHeader =
pathname === "/login" ||
pathname === "/signup" ||
pathname.startsWith("/admin");

return (
<html lang="en" style={{ colorScheme: "light" }}>
<body
className={`${
          !hideHeader ? "pt-[70px]" : "pt-0"
        } flex min-h-screen flex-col bg-white text-black`}
>
<Script
id="organization-schema"
type="application/ld+json"
dangerouslySetInnerHTML={{
__html: JSON.stringify({
"@context": "https://schema.org",
"@type": "Organization",
name: "Dr Vehicle Care",
url: "https://www.drvehiclecare.com",
logo: "https://www.drvehiclecare.com/logo.png",
}),
}}
/>


    {!hideHeader && <Header />}

    <main className="flex-grow">{children}</main>

    {!hideHeader && <Footer />}

    <Toaster position="top-right" />
  </body>
</html>


);
}
