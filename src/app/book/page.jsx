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
  const [companies, setCompanies] = useState([]);
  const [models, setModels] = useState([]);
  const [customData, setCustomData] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const initialized = useRef(false);

  const selectedCompany = watch("companyId");
  const selectedServiceType = watch("serviceType");
  const today = new Date().toISOString().split("T")[0];

  // ---------------- Load companies ----------------
  useEffect(() => {
    API.get("/api/bikes/companies")
      .then((res) => setCompanies(res.data))
      .catch(console.error);
  }, []);

  // ---------------- Load models based on company ----------------
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

  // ---------------- Load custom service from URL ----------------
  useEffect(() => {
    if (initialized.current) return;

    const params = new URLSearchParams(window.location.search);
    const customServiceId = params.get("customServiceId");

    if (customServiceId) {
      setValue("serviceType", "CUSTOMIZED");

      API.get(`/api/customized/${customServiceId}`)
        .then((res) => {
          const data = res.data;
          setCustomData(data);
          setValue("companyId", data.bikeCompany);
          setValue("modelId", data.bikeModel);
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

  // ---------------- Razorpay loader ----------------
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

  // ---------------- Submit handler ----------------
  const onSubmit = async (data) => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    setLoading(true);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert("Razorpay SDK failed to load");
        return;
      }

      // 1️⃣ Create Razorpay Order
      const orderRes = await API.post(
        "/api/payments/create-order",
        { amount: customData?.totalPrice || 99 }, // default fallback
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const order = orderRes.data;

      // 2️⃣ Open Razorpay Checkout
      new window.Razorpay({
        key: "rzp_test_RUUsLf5ulwr2cW",
        amount: order.amount,
        currency: "INR",
        order_id: order.id,
        name: "Bike Service",
        description: "Service Payment",
        handler: async (response) => {
          try {
            // 3️⃣ Verify payment + Save booking
            await API.post(
              "/api/payments/verify-and-book",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingData: {
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
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            router.push("/book/booking-success");
          } catch (err) {
            console.error(err);
            alert("Payment verification or booking failed");
          }
        },
        modal: {
          ondismiss: () => alert("Payment cancelled"),
        },
        theme: { color: "#dc2626" },
      }).open();
    } catch (err) {
      console.error(err);
      alert("Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Render form ----------------
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Book a Bike Service</h1>

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
          <option value="CUSTOMIZED">Customized</option>
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

        <button disabled={loading} className="bg-red-600 text-white py-2 w-full">
          {loading ? "Processing..." : "Pay & Book"}
        </button>
      </form>
    </div>
  );
}
