"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { API_PUBLIC, API_PRIVATE } from "@/utils/api";

const TIME_SLOTS = [
  { value: "MORNING", label: "Morning (9am - 12pm)" },
  { value: "AFTERNOON", label: "Afternoon (12pm - 4pm)" },
  { value: "EVENING", label: "Evening (4pm - 8pm)" },
];

export default function BookingPage() {
  const { register, handleSubmit, watch, setValue, getValues } = useForm({
    mode: "onChange",
  });

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

  // ================= Redirect immediately when CUSTOMIZED selected =================
  useEffect(() => {
    if (selectedServiceType === "CUSTOMIZED" && !customData) {
      // save draft
      localStorage.setItem("bookingDraft", JSON.stringify(getValues()));
      router.push("/custom-service");
    }
  }, [selectedServiceType, customData, router, getValues]);

  // ================= Restore booking draft =================
  useEffect(() => {
    const saved = localStorage.getItem("bookingDraft");
    if (saved) {
      const draft = JSON.parse(saved);
      Object.entries(draft).forEach(([key, value]) => setValue(key, value));
      localStorage.removeItem("bookingDraft");
    }
  }, [setValue]);

  // ================= Load Customized Service from Query Param =================
  useEffect(() => {
    if (initialized.current) return;

    const params = new URLSearchParams(window.location.search);
    const customServiceId = params.get("customServiceId");

    if (customServiceId) {
      setValue("serviceType", "CUSTOMIZED");

      API_PRIVATE.get(`/api/customized/${customServiceId}`)
        .then((res) => {
          const data = res.data;
          setCustomData(data);

          setValue("companyId", String(data.bikeCompanyId));
          setValue("modelId", String(data.bikeModelId));
        })
        .catch((err) => console.error("Customized error:", err));
    }

    initialized.current = true;
  }, [setValue]);

  // ================= Show Bike Name =================
  const companyName = useMemo(() => {
    const id = Number(getValues("companyId"));
    return companies.find((c) => c.id === id)?.name || "";
  }, [companies, getValues, selectedCompany]);

  const modelName = useMemo(() => {
    const id = Number(getValues("modelId"));
    return models.find((m) => m.id === id)?.modelName || "";
  }, [models, getValues, watch("modelId")]);

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

  // ================= Submit Booking =================
  const onSubmit = async (data) => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    // if customized but not loaded, block booking
    if (data.serviceType === "CUSTOMIZED" && !customData) {
      alert("Please create customized service first.");
      return;
    }

    if (!razorpayKey) {
      alert("Razorpay Key not loaded. Please refresh.");
      return;
    }

    setLoading(true);

    try {
      const ok = await loadRazorpayScript();
      if (!ok) {
        alert("Razorpay failed to load.");
        return;
      }

      const bookingRes = await API_PRIVATE.post("/api/bookings", {
        bikeCompanyId: Number(data.companyId),
        bikeModelId: Number(data.modelId),
        serviceType: data.serviceType,
        appointmentDate: data.appointmentDate,
        timeSlot: data.timeSlot,
        fullAddress: data.fullAddress,
        city: "Pune",
        landmark: data.landmark,
        notes: data.notes,
        customizedServiceId: customData?.id || null,
      });

      const booking = bookingRes.data;

      const amountInRupees = customData ? Number(customData.totalPrice) : 99;

      const orderRes = await API_PUBLIC.post("/api/payments/create-order", {
        bookingId: booking.id,
        amount: amountInRupees,
      });

      const order = orderRes.data;

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "Dr VehicleCare",
        description: "Bike Service Payment",
        order_id: order.id,
        handler: async function (response) {
          await API_PRIVATE.post("/api/payments/verify", {
            bookingId: booking.id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          router.push("/book/booking-success");
        },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      console.error("Booking error:", err);
      alert("Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const servicesList = customData
    ? [
        customData.wash && "Wash",
        customData.oilChange && "Oil Change",
        customData.chainLube && "Chain Lube",
        customData.engineTuneUp && "Engine Tune-up",
        customData.breakCheck && "Brake Check",
        customData.fullbodyPolishing && "Full Body Polishing",
        customData.generalInspection && "General Inspection",
      ].filter(Boolean)
    : [];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Book a Bike Service</h1>

      {/* Customized Details */}
      {customData && (
        <div className="mb-5 p-4 rounded-xl border bg-green-50">
          <p className="font-semibold text-green-700">Customized Service Loaded ✅</p>
          <p className="text-sm mt-1">
            <b>Bike:</b> {companyName} {modelName ? `- ${modelName}` : ""}
          </p>
          <p className="text-sm mt-1">
            <b>Services:</b> {servicesList.join(", ")}
          </p>
          <p className="text-sm mt-1">
            <b>Total Price:</b> ₹{customData.totalPrice}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <select {...register("companyId", { required: true })} disabled={!!customData} className="border p-2 w-full rounded">
          <option value="">Select Company</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select {...register("modelId", { required: true })} disabled={!selectedCompany || !!customData} className="border p-2 w-full rounded">
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

        <input type="date" {...register("appointmentDate", { required: true })} min={today} className="border p-2 w-full rounded" />

        <select {...register("timeSlot", { required: true })} className="border p-2 w-full rounded">
          <option value="">Select Time Slot</option>
          {TIME_SLOTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
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
