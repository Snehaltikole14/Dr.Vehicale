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
    formState: { errors },
  } = useForm({ mode: "onChange" });

  const [success, setSuccess] = useState("");
  const [showPopup, setShowPopup] = useState(false);
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
      .catch((err) => console.error(err));
  }, []);

  // ---------------- Load models when company changes ----------------
  useEffect(() => {
    if (!selectedCompany || selectedCompany === "undefined") {
      setModels([]);
      setValue("modelId", "");
      return;
    }

    API.get(`/api/bikes/companies/${selectedCompany}/models`)
      .then((res) => setModels(res.data))
      .catch((err) => console.error("Error fetching models:", err));
  }, [selectedCompany, setValue]);

  // ---------------- Load custom service if query parameters exist ----------------
  useEffect(() => {
    if (initialized.current) return;

    // Use URL query parameters instead of useSearchParams()
    const params = new URLSearchParams(window.location.search);
    const customServiceId = params.get("customServiceId");
    const companyId = params.get("companyId");
    const modelId = params.get("modelId");

    if (companyId && companyId !== "undefined")
      setValue("companyId", companyId);
    if (modelId && modelId !== "undefined") setValue("modelId", modelId);

    if (customServiceId) {
      setValue("serviceType", "CUSTOMIZED");

      API.get(`/api/customized/${customServiceId}`)
        .then((res) => {
          const data = res.data;
          setCustomData(data);

          if (data.bikeCompany) setValue("companyId", data.bikeCompany);
          if (data.bikeModel) setValue("modelId", data.bikeModel);
        })
        .catch((err) => console.error("Error fetching custom data:", err));
    }

    initialized.current = true;
  }, [setValue]);

  // ---------------- Clear customData if service type changes ----------------
  useEffect(() => {
    if (selectedServiceType !== "CUSTOMIZED") setCustomData(null);
  }, [selectedServiceType]);

  // ---------------- Submit booking ----------------
  const onSubmit = async (data) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to book a service");
      router.push(`/login`);
      return;
    }

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
          customizedService: customData
            ? {
                id: customData.id,
                bikeCompany: customData.bikeCompany,
                bikeModel: customData.bikeModel,
                cc: customData.cc,
                wash: customData.wash,
                oilChange: customData.oilChange,
                chainLube: customData.chainLube,
                engineTuneUp: customData.engineTuneUp,
                breakCheck: customData.breakCheck,
                fullbodyPolishing: customData.fullbodyPolishing,
                generalInspection: customData.generalInspection,
                totalPrice: customData.totalPrice,
              }
            : null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Your booking has been successfully created!");
      setShowPopup(true);

      setTimeout(() => {
        setShowPopup(false);
        router.push("book/booking-success");
      }, 2000);
    } catch (err) {
      console.error(err.response || err);
      alert(err.response?.data || "Booking failed.");
    } finally {
      setLoading(false);
    }
  };

  const getSelectedServices = () => {
    if (!customData) return [];
    const map = {
      wash: "Bike Wash",
      oilChange: "Oil Change",
      chainLube: "Chain Lube",
      engineTuneUp: "Engine Tune-Up",
      breakCheck: "Break Check",
      fullbodyPolishing: "Full Body Polishing",
      generalInspection: "General Inspection",
    };
    return Object.keys(map).filter((k) => customData[k]);
  };

  const getCompanyName = (id) =>
    companies.find((c) => c.id === Number(id))?.name || id;
  const getModelName = (id) =>
    models.find((m) => m.id === Number(id))?.modelName || id;

  // ---------------- Render ----------------
  return (
    <div className="max-w-2xl mx-auto p-6 relative">
      <h1 className="text-3xl font-bold mb-6">Book a Bike Service</h1>

      {customData && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-bold text-blue-800 mb-2">
            Customized Service Summary
          </h2>
          <p>
            <strong>Company:</strong> {getCompanyName(customData.bikeCompany)}
          </p>
          <p>
            <strong>Model:</strong> {getModelName(customData.bikeModel)}
          </p>
          <p>
            <strong>CC:</strong> {customData.cc}
          </p>

          <h3 className="font-semibold mt-3">Selected Services:</h3>
          <ul className="list-disc ml-6 text-sm">
            {getSelectedServices().map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <p className="font-bold text-lg mt-3 text-green-700">
            Total Price: ₹{customData.totalPrice}
          </p>
        </div>
      )}

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white text-black p-8 rounded-xl shadow-xl max-w-md text-center">
            <div className="mb-4 flex justify-center">
              <svg
                className="w-16 h-16 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-2xl font-bold">{success}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Bike Company */}
        <div>
          <label className="block mb-1 font-semibold">Bike Company</label>
          <select
            {...register("companyId", { required: true })}
            className="border p-2 w-full rounded"
          >
            <option value="">Select company</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Bike Model */}
        <div>
          <label className="block mb-1 font-semibold">Bike Model</label>
          <select
            {...register("modelId", { required: true })}
            className="border p-2 w-full rounded"
            disabled={!selectedCompany}
          >
            <option value="">Select model</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.modelName}
              </option>
            ))}
          </select>
        </div>

        {/* Service Type */}
        <div>
          <label className="block mb-1 font-semibold">Service Type</label>
          <select
            {...register("serviceType", { required: true })}
            className="border p-2 w-full rounded"
          >
            <option value="">Select service</option>

            <option value="PLAN_UPTO_100CC">
              Servicing Plan (Up to 100cc)
            </option>
            <option value="PLAN_100_TO_160CC">
              Servicing Plan (100cc - 160cc)
            </option>
            <option value="PLAN_ABOVE_180CC">
              Servicing Plan (Above 180cc)
            </option>
            <option value="CUSTOMIZED">Customized Service</option>
          </select>
        </div>

        {/* Appointment Date */}
        <div>
          <label className="block mb-1 font-semibold">Appointment Date</label>
          <input
            type="date"
            {...register("appointmentDate", {
              required: "Appointment date is required",
              validate: (value) =>
                value >= today || "Please select a future date",
            })}
            className="border p-2 w-full rounded"
            min={today}
          />
          {errors.appointmentDate && (
            <p className="text-red-600 text-sm mt-1">
              {errors.appointmentDate.message}
            </p>
          )}
        </div>

        {/* Full Address */}
        <div>
          <label className="block mb-1 font-semibold">Full Address</label>
          <textarea
            {...register("fullAddress", { required: true })}
            className="border p-2 w-full rounded"
            placeholder="Full address in Pune"
          />
        </div>

        {/* Landmark */}
        <div>
          <label className="block mb-1 font-semibold">Landmark</label>
          <input
            {...register("landmark")}
            className="border p-2 w-full rounded"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block mb-1 font-semibold">Notes</label>
          <textarea
            {...register("notes")}
            className="border p-2 w-full rounded"
            placeholder="Any extra notes"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Booking..." : "Book Now"}
        </button>
      </form>
    </div>
  );
}
