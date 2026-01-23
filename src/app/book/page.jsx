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
  const { register, handleSubmit, watch, setValue } = useForm();
  const router = useRouter();

  const [companies, setCompanies] = useState([]);
  const [models, setModels] = useState([]);
  const [customData, setCustomData] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectedCompany = watch("companyId");
  const today = new Date().toISOString().split("T")[0];

  /* ---------------- Load Companies ---------------- */
  useEffect(() => {
    API.get("/api/bikes/companies")
      .then((res) => setCompanies(res.data))
      .catch(console.error);
  }, []);

  /* ---------------- Load Models ---------------- */
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

  /* ---------------- Razorpay Loader ---------------- */
  const loadRazorpay = () =>
    new Promise((resolve, reject) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;

      script.onload = () => {
        if (window.Razorpay) resolve(true);
        else reject(new Error("Razorpay SDK failed"));
      };

      script.onerror = () => reject(new Error("Razorpay load failed"));
      document.body.appendChild(script);
    });

  /* ---------------- Submit ---------------- */
  const onSubmit = async (data) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Login expired. Please login again.");
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY;

      console.log("TOKEN:", token);
      console.log("RAZORPAY KEY:", RAZORPAY_KEY);

      if (!RAZORPAY_KEY) throw new Error("Razorpay Key Missing");

      await loadRazorpay();

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      /* ---------------- Create Booking ---------------- */
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
        { headers }
      );

      const booking = bookingRes.data;

      if (!booking?.id) {
        throw new Error("Booking creation failed");
      }

      /* ---------------- Create Razorpay Order ---------------- */
      const amount = (customData?.totalPrice || 99) * 100;

      const orderRes = await API.post(
        "/api/payments/create-order",
        {
          bookingId: booking.id,
          amount,
        },
        { headers }
      );

      const order = orderRes.data;

      if (!order?.id) {
        throw new Error("Razorpay Order Failed");
      }

      /* ---------------- Open Razorpay ---------------- */
      const rzp = new window.Razorpay({
        key: RAZORPAY_KEY,
        order_id: order.id,
        amount: order.amount,
        currency: "INR",
        name: "Bike Service",
        description: "Service Payment",

        handler: async (response) => {
          try {
            await API.post(
              "/api/payments/verify",
              {
                bookingId: booking.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers }
            );

            router.push("/book/booking-success");
          } catch {
            alert("Payment verification failed");
          }
        },

        modal: {
          ondismiss: () => alert("Payment cancelled"),
        },

        theme: { color: "#2563eb" },
      });

      rzp.open();
    } catch (error) {
      console.error("PAYMENT ERROR:", error);
      alert(error.response?.data?.message || error.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Book a Bike Service</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <select {...register("companyId", { required: true })} className="border p-2 w-full">
          <option value="">Select Company</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select {...register("modelId", { required: true })} disabled={!selectedCompany} className="border p-2 w-full">
          <option value="">Select Model</option>
          {models.map((m) => (
            <option key={m.id} value={m.id}>{m.modelName}</option>
          ))}
        </select>

        <select {...register("serviceType", { required: true })} className="border p-2 w-full">
          <option value="">Select Service</option>
          <option value="PLAN_UPTO_100CC">Up to 100cc</option>
          <option value="PLAN_100_TO_160CC">100cc - 160cc</option>
          <option value="PLAN_ABOVE_180CC">Above 180cc</option>
          <option value="PICK_AND_DROP">Pick and Drop</option>
          <option value="CUSTOMIZED">Customized</option>
        </select>

        <input type="date" {...register("appointmentDate", { required: true })} min={today} className="border p-2 w-full" />

        <select {...register("timeSlot", { required: true })} className="border p-2 w-full">
          <option value="">Select Time Slot</option>
          {TIME_SLOTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <textarea {...register("fullAddress", { required: true })} placeholder="Full Address" className="border p-2 w-full" />
        <input {...register("landmark")} placeholder="Landmark" className="border p-2 w-full" />
        <textarea {...register("notes")} placeholder="Notes" className="border p-2 w-full" />

        <button disabled={loading} className="bg-blue-600 text-white py-2 w-full rounded">
          {loading ? "Processing..." : "Pay & Book"}
        </button>
      </form>
    </div>
  );
}
