"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { API } from "@/utils/api";

export default function BookingPage() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
  } = useForm({ mode: "onChange" });

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

  /* ---------------- Load custom service AFTER return ---------------- */
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

  /* ---------------- Submit booking ---------------- */
  const onSubmit = async (data) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // ✅ Redirect ONLY on submit
    if (data.serviceType === "CUSTOMIZED" && !customData) {
      router.push(
        `/custom-service?companyId=${data.companyId}&modelId=${data.modelId}`
      );
      return;
    }

    setLoading(true);
    try {
      await API.post(
        "/api/bookings",
        {
          bikeCompanyId: Number(data.companyId),
          bikeModelId: Number(data.modelId),
          serviceType: data.serviceType,
          appointmentDate: data.appointmentDate,
          fullAddress: data.fullAddress,
          city: "Pune",
          landmark: data.landmark,
          notes: data.notes,
          customizedService: customData || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      router.push("/book/booking-success");
    } catch (err) {
      console.error(err);
      alert("Unable to place booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Book a Bike Service
      </h1>

      {/* ✅ Custom Service Summary */}
      {customData && (
        <div className="bg-blue-50 border p-4 rounded mb-6">
          <p><b>CC:</b> {customData.cc}</p>
          <ul className="list-disc ml-5 mt-2 text-sm">
            {customData.wash && <li>Bike Wash</li>}
            {customData.oilChange && <li>Oil Change</li>}
            {customData.chainLube && <li>Chain Lube</li>}
            {customData.engineTuneUp && <li>Engine Tune-up</li>}
            {customData.breakCheck && <li>Brake Check</li>}
            {customData.fullbodyPolishing && <li>Full Body Polishing</li>}
            {customData.generalInspection && <li>General Inspection</li>}
          </ul>
          <p className="mt-2 font-bold text-green-700">
            Total: ₹{customData.totalPrice}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <select {...register("companyId", { required: true })} className="border p-3 rounded w-full">
          <option value="">Select Company</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select {...register("modelId", { required: true })} disabled={!selectedCompany} className="border p-3 rounded w-full">
          <option value="">Select Model</option>
          {models.map((m) => (
            <option key={m.id} value={m.id}>{m.modelName}</option>
          ))}
        </select>

        <select {...register("serviceType", { required: true })} className="border p-3 rounded w-full">
          <option value="">Select Service</option>
          <option value="PLAN_UPTO_100CC">Up to 100cc</option>
          <option value="PLAN_100_TO_160CC">100cc - 160cc</option>
          <option value="PLAN_ABOVE_180CC">Above 180cc</option>
          <option value="CUSTOMIZED">Customized</option>
        </select>

        <input type="date" {...register("appointmentDate", { required: true })} min={today} className="border p-3 rounded w-full" />

        <textarea {...register("fullAddress", { required: true })} placeholder="Full Address" className="border p-3 rounded w-full" />
        <input {...register("landmark")} placeholder="Landmark" className="border p-3 rounded w-full" />
        <textarea {...register("notes")} placeholder="Notes" className="border p-3 rounded w-full" />

        <button disabled={loading} className="bg-blue-600 text-white py-3 rounded w-full font-semibold">
          {loading ? "Booking..." : "Book Now"}
        </button>
      </form>
    </div>
  );
}
