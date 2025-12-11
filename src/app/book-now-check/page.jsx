"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BookNowCheck() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      // Save intended page
      localStorage.setItem("redirectAfterLogin", "/book");

      // Redirect to login
      router.replace("/login");
    } else {
      router.replace("/book"); // Already logged in
    }
  }, []);

  return null; // No UI needed
}
