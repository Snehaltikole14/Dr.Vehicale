import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Dr. Vehicle Care | Bike & Vehicle Service in Pune",
  description:
    "Dr. Vehicle Care offers professional bike and vehicle servicing within 10 km of Shivaji Nagar, Pune. Doorstep service with affordable plans.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-[70px]">{children}</main>
        <Footer />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
