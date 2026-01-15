"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { API } from "@/utils/api";

const TIME_SLOTS = [
  { value: "MORNING", label: "Morning (9am - 12pm)" },
  { value: "AFTERNOON", label: "Afternoon (12pm - 4pm)" },
  { value: "EVENING", label: "Evening (4pm - 8pm)" },
];

export default function BookingPage() {
  const { register, handleSubmit, watch, setValue } = useForm();
  const router = useRouter();
  const initialized = useRef(false);

  const [companies, setCompanies] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const selectedCompany = watch("companyId");
  const today = new Date().toISOString().split("T")[0];

  /* ---------------- Load companies ---------------- */
  useEffect(() => {
    API.get("/api/bikes/companies")
      .then((res) => setCompanies(res.data))
      .catch(() => setErrorMsg("Failed to load companies"));
  }, []);

  /* ---------------- Load models ---------------- */
  useEffect(() => {
    if (!selectedCompany) {
      setModels([]);
      return;
    }

    API.get(`/api/bikes/companies/${selectedCompany}/models`)
      .then((res) => setModels(res.data))
      .catch(() => setErrorMsg("Failed to load models"));
  }, [selectedCompany]);

  /* ---------------- Razorpay loader ---------------- */
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) return resolve(true);

      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  /* ---------------- Submit ---------------- */
  const onSubmit = async (data) => {
    setErrorMsg("");
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        setErrorMsg("Payment service unavailable. Try again.");
        return;
      }

      /* 1️⃣ Create order */
      const orderRes = await API.post(
        "/api/payments/create-order",
        { amount: 99 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const order = orderRes.data;

      /* 2️⃣ Open Razorpay */
      const razorpay = new window.Razorpay({
        key: "rzp_test_RUUsLf5ulwr2cW",
        order_id: order.id,
        amount: order.amount,
        currency: "INR",
        name: "Bike Service",
        description: "Service Payment",

        handler: async (response) => {
          try {
            /* 3️⃣ Verify payment + create booking */
            await API.post(
              "/api/payments/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingData: data,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            router.push("/book/booking-success");
          } catch (err) {
            console.error(err);
            setErrorMsg(
              err.response?.data?.message ||
              "Payment succeeded but booking failed. Contact support."
            );
          }
        },

        modal: {
          ondismiss: () => {
            setErrorMsg("Payment cancelled by user");
          },
        },
        theme: { color: "#dc2626" },
      });

      razorpay.open();
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.message ||
        "Server error. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Book a Bike Service</h1>

      {errorMsg && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <select {...register("companyId")} required className="border p-2 w-full">
          <option value="">Select Company</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select {...register("modelId")} required className="border p-2 w-full">
          <option value="">Select Model</option>
          {models.map((m) => (
            <option key={m.id} value={m.id}>{m.modelName}</option>
          ))}
        </select>

        <select {...register("serviceType")} required className="border p-2 w-full">
          <option value="">Select Service</option>
          <option value="PLAN_UPTO_100CC">Up to 100cc</option>
          <option value="PLAN_100_TO_160CC">100cc - 160cc</option>
          <option value="PLAN_ABOVE_180CC">Above 180cc</option>
          <option value="PICK_AND_DROP">Pick & Drop</option>
        </select>

        <input type="date" min={today} {...register("appointmentDate")} required />
        <select {...register("timeSlot")} required>
          {TIME_SLOTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <textarea {...register("fullAddress")} placeholder="Address" required />
        <input {...register("landmark")} placeholder="Landmark" />
        <textarea {...register("notes")} placeholder="Notes" />

        <button
          disabled={loading}
          className="bg-red-600 text-white py-2 w-full rounded disabled:opacity-50"
        >
          {loading ? "Processing Payment..." : "Pay & Book"}
        </button>
      </form>
    </div>
  );
}
