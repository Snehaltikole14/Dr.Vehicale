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
  const { register, handleSubmit, watch, setValue } = useForm({ mode: "onChange" });

  const [companies, setCompanies] = useState([]);
  const [models, setModels] = useState([]);
  const [customData, setCustomData] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const initialized = useRef(false);

  const selectedCompany = watch("companyId");
  const selectedServiceType = watch("serviceType");
  const today = new Date().toISOString().split("T")[0];

  /* ---------------- Load companies ---------------- */
  useEffect(() => {
    API.get("/api/bikes/companies")
      .then((res) => setCompanies(res.data))
      .catch(console.error);
  }, []);

  /* ---------------- Load models ---------------- */
  useEffect(() => {
    if (!selectedCompany) {
      setModels([]);
      setValue("modelId", "");
      return;
    }

    API.get(`/api/bikes/companies/${selectedCompany}/models`)
      .then((res) => setModels(res.data))
      .catch(console.error);
  }, [selectedCompany, setValue]);

  /* ---------------- Load customized service ---------------- */
  useEffect(() => {
    if (initialized.current) return;

    const params = new URLSearchParams(window.location.search);
    const customServiceId = params.get("customServiceId");

    if (customServiceId) {
      setValue("serviceType", "CUSTOMIZED");

      API.get(`/api/customized/${customServiceId}`)
        .then((res) => {
          setCustomData(res.data);
          setValue("companyId", res.data.bikeCompany);
          setValue("modelId", res.data.bikeModel);
        })
        .catch(console.error);
    }

    initialized.current = true;
  }, [setValue]);

  useEffect(() => {
    if (selectedServiceType !== "CUSTOMIZED") {
      setCustomData(null);
    }
  }, [selectedServiceType]);

  /* ---------------- Razorpay loader ---------------- */
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  /* ---------------- Submit booking ---------------- */
  const onSubmit = async (data) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        alert("Razorpay SDK blocked");
        return;
      }

      /* 1️⃣ Create booking */
      const bookingRes = await API.post(
        "/api/bookings",
        {
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
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const booking = bookingRes.data;

      /* 2️⃣ Create Razorpay order (PAISE) */
      const amountInPaise =
        (customData ? customData.totalPrice : 99) * 100;

      const orderRes = await API.post(
        "/api/payments/create-order",
        {
          bookingId: booking.id,
          amount: amountInPaise,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const order = orderRes.data;

      if (!order?.id) {
        alert("Invalid payment order");
        return;
      }

      /* 3️⃣ Open Razorpay */
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: order.amount,
        currency: "INR",
        name: "Dr Vehicle Care",
        description: "Bike Service Payment",
        order_id: order.id,

        prefill: {
          name: "Customer",
          email: "support@drvehiclecare.com",
          contact: "9999999999",
        },

        handler: async (response) => {
          await API.post(
            "/api/payments/verify",
            {
              bookingId: booking.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          router.push("/book/booking-success");
        },

        modal: {
          ondismiss: () => alert("Payment cancelled"),
        },

        theme: {
          color: "#dc2626",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Book a Bike Service</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <select {...register("companyId", { required: true })} className="border p-2 w-full rounded">
          <option value="">Select Company</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select {...register("modelId", { required: true })} disabled={!selectedCompany} className="border p-2 w-full rounded">
          <option value="">Select Model</option>
          {models.map((m) => (
            <option key={m.id} value={m.id}>{m.modelName}</option>
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

        <input type="date" min={today} {...register("appointmentDate", { required: true })} className="border p-2 w-full rounded" />

        <select {...register("timeSlot", { required: true })} className="border p-2 w-full rounded">
          <option value="">Select Time Slot</option>
          {TIME_SLOTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <textarea {...register("fullAddress", { required: true })} placeholder="Full Address" className="border p-2 w-full rounded" />
        <input {...register("landmark")} placeholder="Landmark" className="border p-2 w-full rounded" />
        <textarea {...register("notes")} placeholder="Notes" className="border p-2 w-full rounded" />

        <button disabled={loading} className="bg-blue-600 text-white py-2 rounded w-full">
          {loading ? "Processing..." : "Pay & Book"}
        </button>
      </form>
    </div>
  );
}
