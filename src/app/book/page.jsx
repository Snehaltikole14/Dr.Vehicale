"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { API_PUBLIC, API_PRIVATE } from "@/utils/api";

const TIME_SLOTS = [
  { value: "MORNING", label: "Morning (9am - 12pm)" },
  { value: "AFTERNOON", label: "Afternoon (12pm - 4pm)" },
  { value: "EVENING", label: "Evening (4pm - 8pm)" },
];

export default function BookingPage() {
  const { register, handleSubmit, watch, setValue } = useForm({ mode: "onChange" });
  const [companies, setCompanies] = useState([]);
  const [models, setModels] = useState([]);
  const [customData, setCustomData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState("");

  const router = useRouter();
  const initialized = useRef(false);

  const selectedCompany = watch("companyId");
  const selectedServiceType = watch("serviceType");
  const today = new Date().toISOString().split("T")[0];

  // ================= Razorpay Script Loader =================
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) return resolve(true);
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  // ================= Load Razorpay Key =================
  useEffect(() => {
    API_PUBLIC.get("/api/payments/key")
      .then((res) => {
        if (res.data?.key) setRazorpayKey(res.data.key);
      })
      .catch((err) => console.error("Razorpay Key Error:", err));
  }, []);

  // ================= Load Companies =================
  useEffect(() => {
    API_PUBLIC.get("/api/bikes/companies")
      .then((res) => setCompanies(res.data))
      .catch((err) => console.error("Company error:", err));
  }, []);

  // ================= Load Models =================
  useEffect(() => {
    if (!selectedCompany) {
      setModels([]);
      setValue("modelId", "");
      return;
    }
    API_PUBLIC.get(`/api/bikes/companies/${selectedCompany}/models`)
      .then((res) => setModels(res.data))
      .catch((err) => console.error("Models error:", err));
  }, [selectedCompany, setValue]);

  // ================= Load Customized Service =================
  useEffect(() => {
    if (initialized.current) return;

    const params = new URLSearchParams(window.location.search);
    const customServiceId = params.get("customServiceId");

    if (customServiceId) {
      setValue("serviceType", "CUSTOMIZED");
      API_PUBLIC.get(`/api/customized/${customServiceId}`)
        .then((res) => {
          const data = res.data;
          setCustomData(data);
          setValue("companyId", data.bikeCompany);
          setValue("modelId", data.bikeModel);
        })
        .catch((err) => console.error("Customized error:", err));
    }

    initialized.current = true;
  }, [setValue]);

  useEffect(() => {
    if (selectedServiceType !== "CUSTOMIZED") setCustomData(null);
  }, [selectedServiceType]);

  // ================= Submit Booking =================
  const onSubmit = async (data) => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    if (!razorpayKey) {
      alert("Razorpay Key not loaded. Please refresh.");
      return;
    }

    setLoading(true);

    try {
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        alert("Razorpay failed to load. Disable adblock & try again.");
        return;
      }

      // 1️⃣ Create Razorpay order on backend (no booking yet)
      const amountInRupees = customData ? Number(customData.totalPrice) : 99;

      const orderRes = await API_PUBLIC.post("/api/payments/create-order", {
        amount: amountInRupees,
      });

      const order = orderRes.data;

      // 2️⃣ Razorpay checkout options
      const options = {
        key: "rzp_live_S7C5WPF2wQHogV",
        amount: order.amount,
        currency: order.currency,
        name: "Dr VehicleCare",
        description: "Bike Service Payment",
        order_id: order.id,
        handler: async function (response) {
          try {
            // 3️⃣ Only after successful payment → create booking and verify payment
            await API_PRIVATE.post("/api/bookings", {
              bikeCompanyId: Number(data.companyId),
              bikeModelId: Number(data.modelId),
              serviceType: data.serviceType,
              appointmentDate: data.appointmentDate,
              timeSlot: data.timeSlot,
              fullAddress: data.fullAddress,
              city: "Pune",
              landmark: data.landmark,
              notes: data.notes,
              customizedService: customData || null,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            router.push("/book/booking-success");
          } catch (err) {
            console.error("Booking creation/verification failed:", err);
            alert("Payment succeeded but booking failed. Contact support!");
          }
        },
        modal: { ondismiss: () => alert("Payment cancelled") },
        theme: { color: "#dc2626" },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response) => {
        console.error("Payment failed:", response.error);
        alert("Payment failed: " + response.error.description);
      });

      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Book a Bike Service</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <select {...register("companyId", { required: true })} className="border p-2 w-full rounded">
          <option value="">Select Company</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          {...register("modelId", { required: true })}
          disabled={!selectedCompany}
          className="border p-2 w-full rounded"
        >
          <option value="">Select Model</option>
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.modelName}
            </option>
          ))}
        </select>

        <select {...register("serviceType", { required: true })} className="border p-2 w-full rounded">
          <option value="">Select Service</option>
          <option value="PLAN_UPTO_100CC">Up to 100cc</option>
          <option value="PLAN_100_TO_160CC">100cc - 160cc</option>
          <option value="PLAN_ABOVE_180CC">Above 180cc</option>
          <option value="PICK_AND_DROP">Pick and Drop</option>
          <option value="CUSTOMIZED">Customized</option>
        </select>

        <input
          type="date"
          {...register("appointmentDate", { required: true })}
          min={today}
          className="border p-2 w-full rounded"
        />

        <select {...register("timeSlot", { required: true })} className="border p-2 w-full rounded">
          <option value="">Select Time Slot</option>
          {TIME_SLOTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <textarea
          {...register("fullAddress", { required: true })}
          placeholder="Full Address"
          className="border p-2 w-full rounded"
        />

        <input {...register("landmark")} placeholder="Landmark" className="border p-2 w-full rounded" />

        <textarea {...register("notes")} placeholder="Notes" className="border p-2 w-full rounded" />

        <button disabled={loading} className="bg-blue-600 text-white py-2 rounded w-full">
          {loading ? "Processing..." : "Pay & Book"}
        </button>
      </form>
    </div>
  );
}
