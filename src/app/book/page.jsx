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

const [companies, setCompanies] = useState([]);
const [models, setModels] = useState([]);
const [customData, setCustomData] = useState(null);
const [loading, setLoading] = useState(false);

const initialized = useRef(false);

const selectedCompany = watch("companyId");
const selectedServiceType = watch("serviceType");

const today = new Date().toISOString().split("T")[0];

/* ================= Load companies ================= */
useEffect(() => {
API.get("/api/bikes/companies")
.then(res => setCompanies(res.data))
.catch(console.error);
}, []);

/* ================= Load models ================= */
useEffect(() => {
if (!selectedCompany) {
setModels([]);
setValue("modelId", "");
return;
}


API.get(`/api/bikes/companies/${selectedCompany}/models`)
  .then(res => setModels(res.data))
  .catch(console.error);


}, [selectedCompany, setValue]);

/* ================= Load custom service after returning ================= */
useEffect(() => {
if (initialized.current) return;


const params = new URLSearchParams(window.location.search);
const customServiceId = params.get("customServiceId");

if (customServiceId) {
  setValue("serviceType", "CUSTOMIZED");

  API.get(`/api/customized/${customServiceId}`)
    .then(res => {
      const data = res.data;
      setCustomData(data);
      setValue("companyId", data.bikeCompany);
      setValue("modelId", data.bikeModel);
    })
    .catch(console.error);
}

initialized.current = true;


}, [setValue]);

/* ================= Clear custom data if service changes ================= */
useEffect(() => {
if (selectedServiceType !== "CUSTOMIZED") {
setCustomData(null);
}
}, [selectedServiceType]);

/* ================= Razorpay loader ================= */
const loadRazorpayScript = () =>
new Promise(resolve => {
if (document.getElementById("razorpay-script")) return resolve(true);
const script = document.createElement("script");
script.id = "razorpay-script";
script.src = "[https://checkout.razorpay.com/v1/checkout.js](https://checkout.razorpay.com/v1/checkout.js)";
script.onload = () => resolve(true);
script.onerror = () => resolve(false);
document.body.appendChild(script);
});

/* ================= Submit booking ================= */
const onSubmit = async (data) => {
const token = localStorage.getItem("token");
if (!token) {
router.push("/login");
return;
}


// 👉 Redirect ONLY on Pay & Book
if (data.serviceType === "CUSTOMIZED" && !customData) {
  router.push(
    `/custom-service?companyId=${data.companyId}&modelId=${data.modelId}`
  );
  return;
}

setLoading(true);

try {
  const razorLoaded = await loadRazorpayScript();
  if (!razorLoaded) {
    alert("Razorpay SDK failed to load");
    return;
  }

  // 1️⃣ Create booking
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
      customizedService: customData,
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const booking = bookingRes.data;

  // 2️⃣ Create payment order
  const orderRes = await API.post(
    "/api/payments/create-order",
    {
      bookingId: booking.id,
      amount: customData ? customData.totalPrice : 99,
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const order = orderRes.data;

  // 3️⃣ Open Razorpay
  const rzp = new window.Razorpay({
    key: "rzp_test_RUUsLf5ulwr2cW",
    order_id: order.id,
    amount: order.amount,
    currency: "INR",
    name: "Bike Service",
    description: "Service Payment",
    handler: async (response) => {
      await API.post(
        "/api/payments/verify",
        response,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push("/book/booking-success");
    },
    modal: {
      ondismiss: () =>
        alert("Payment cancelled. Booking saved as unpaid."),
    },
    theme: { color: "#2563eb" },
  });

  rzp.open();
} catch (err) {
  console.error(err);
  alert("Booking created but payment failed.");
} finally {
  setLoading(false);
}

};

/* ================= UI ================= */
return ( <div className="max-w-2xl mx-auto p-6"> <h1 className="text-3xl font-bold mb-6 text-center">
Book a Bike Service </h1>

  {customData && (
    <div className="border p-4 rounded mb-4 bg-blue-50">
      <h3 className="font-semibold mb-2">Customized Service</h3>
      <ul className="text-sm space-y-1">
        {customData.wash && <li>✔ Bike Wash</li>}
        {customData.oilChange && <li>✔ Oil Change</li>}
        {customData.chainLube && <li>✔ Chain Lubrication</li>}
        {customData.engineTuneUp && <li>✔ Engine Tune-up</li>}
        {customData.breakCheck && <li>✔ Brake Check</li>}
        {customData.fullbodyPolishing && <li>✔ Full Body Polishing</li>}
        {customData.generalInspection && <li>✔ General Inspection</li>}
      </ul>
      <p className="mt-2 font-bold">
        Total: ₹{customData.totalPrice}
      </p>
    </div>
  )}

  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
    <select {...register("companyId", { required: true })} className="border p-2 w-full rounded">
      <option value="">Select Company</option>
      {companies.map(c => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>

    <select {...register("modelId", { required: true })} disabled={!selectedCompany} className="border p-2 w-full rounded">
      <option value="">Select Model</option>
      {models.map(m => (
        <option key={m.id} value={m.id}>{m.modelName}</option>
      ))}
    </select>

    <select {...register("serviceType", { required: true })} className="border p-2 w-full rounded">
      <option value="">Select Service</option>
      <option value="PLAN_UPTO_100CC">Up to 100cc</option>
      <option value="PLAN_100_TO_160CC">100cc - 160cc</option>
      <option value="PLAN_ABOVE_180CC">Above 180cc</option>
      <option value="CUSTOMIZED">Customized</option>
    </select>

    <input type="date" {...register("appointmentDate", { required: true })} min={today} className="border p-2 w-full rounded" />

    <select {...register("timeSlot", { required: true })} className="border p-2 w-full rounded">
      <option value="">Select Time Slot</option>
      {TIME_SLOTS.map(s => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>

    <textarea {...register("fullAddress", { required: true })} placeholder="Full Address" className="border p-2 w-full rounded" />
    <input {...register("landmark")} placeholder="Landmark" className="border p-2 w-full rounded" />
    <textarea {...register("notes")} placeholder="Notes" className="border p-2 w-full rounded" />

    <button disabled={loading} className="bg-blue-600 text-white py-3 rounded w-full">
      {loading ? "Processing..." : "Pay & Book"}
    </button>
  </form>
</div>

);
}
