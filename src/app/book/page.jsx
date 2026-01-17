"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { API } from "@/utils/api";

const TIME_SLOTS = [
  { value: "MORNING", label: "Morning (9am - 12pm)" },
  { value: "AFTERNOON", label: "Afternoon (12pm - 4pm)" },
  { value: "EVENING", label: "Evening (4pm - 8pm)" },
];

export default function BookingPage() {
  const { register, handleSubmit, watch } = useForm();
  const router = useRouter();

  const [companies, setCompanies] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const selectedCompany = watch("companyId");
  const today = new Date().toISOString().split("T")[0];

  /* ================= Load Companies ================= */
  useEffect(() => {
    API.get("/api/bikes/companies")
      .then(res => setCompanies(res.data))
      .catch(() => setErrorMsg("Failed to load companies"));
  }, []);

  /* ================= Load Models ================= */
  useEffect(() => {
    if (!selectedCompany) {
      setModels([]);
      return;
    }

    API.get(`/api/bikes/companies/${selectedCompany}/models`)
      .then(res => setModels(res.data))
      .catch(() => setErrorMsg("Failed to load models"));
  }, [selectedCompany]);

  /* ================= Razorpay Loader ================= */
  const loadRazorpayScript = () => {
    return new Promise(resolve => {
      if (document.getElementById("razorpay-script")) return resolve(true);

      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  /* ================= Submit ================= */
  const onSubmit = async (formData) => {
    setErrorMsg("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        setErrorMsg("Payment service unavailable");
        return;
      }

      /* Create Order */
      const orderRes = await API.post(
        "/api/payments/create-order",
        { amount: 99 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const order = orderRes.data;

      /* Open Razorpay */
      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        order_id: order.id,
        amount: order.amount,
        currency: "INR",
        name: "Dr VehicleCare",
        description: "Bike Service Payment",

        handler: async (response) => {
          await API.post(
            "/api/payments/verify",
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingData: formData,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          router.push("/book/booking-success");
        },

        modal: {
          ondismiss: () => setErrorMsg("Payment cancelled"),
        },

        theme: { color: "#dc2626" },
      });

      razorpay.open();

    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Book a Bike Service
        </h1>

        {errorMsg && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <select {...register("companyId")} required className="input">
            <option value="">Select Company</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select {...register("modelId")} required className="input">
            <option value="">Select Model</option>
            {models.map(m => (
              <option key={m.id} value={m.id}>{m.modelName}</option>
            ))}
          </select>

          <select {...register("serviceType")} required className="input">
            <option value="">Select Service</option>
            <option value="PLAN_UPTO_100CC">Up to 100cc</option>
            <option value="PLAN_100_TO_160CC">100cc – 160cc</option>
            <option value="PLAN_ABOVE_180CC">Above 180cc</option>
            <option value="PICK_AND_DROP">Pick & Drop</option>
          </select>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              min={today}
              {...register("appointmentDate")}
              required
              className="input"
            />

            <select {...register("timeSlot")} required className="input">
              {TIME_SLOTS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <textarea {...register("fullAddress")} placeholder="Full Address" required className="input h-24" />
          <input {...register("landmark")} placeholder="Landmark" className="input" />
          <textarea {...register("notes")} placeholder="Additional Notes" className="input h-20" />

          <button
            disabled={loading}
            className="w-full rounded-lg bg-red-600 py-3 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? "Processing Payment..." : "Pay ₹99 & Book"}
          </button>
        </form>
      </div>
    </div>
  );
}
