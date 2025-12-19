"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { API } from "@/utils/api";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";

export default function BookingPage() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  const [popup, setPopup] = useState(null);
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

  /* ---------------- Load custom service ---------------- */
  useEffect(() => {
    if (initialized.current) return;

    const params = new URLSearchParams(window.location.search);
    const customServiceId = params.get("customServiceId");
    const companyId = params.get("companyId");
    const modelId = params.get("modelId");

    if (companyId) setValue("companyId", companyId);
    if (modelId) setValue("modelId", modelId);

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
    if (selectedServiceType !== "CUSTOMIZED") setCustomData(null);
  }, [selectedServiceType]);

  /* ---------------- Submit booking ---------------- */
  const onSubmit = async (data) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setPopup({ type: "error", message: "Please login to continue." });
      router.push("/login");
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
          customizedService: customData,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPopup({
        type: "success",
        message: "Booking created successfully!",
      });

      setTimeout(() => {
        setPopup(null);
        router.push("/book/booking-success");
      }, 2000);
    } catch (err) {
      setPopup({
        type: "error",
        message: err.response?.data || "Booking failed",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Helpers ---------------- */
  const getSelectedServices = () => {
    if (!customData) return [];
    const map = {
      wash: "Bike Wash",
      oilChange: "Oil Change",
      chainLube: "Chain Lube",
      engineTuneUp: "Engine Tune-Up",
      breakCheck: "Brake Check",
      fullbodyPolishing: "Full Body Polishing",
      generalInspection: "General Inspection",
    };
    return Object.keys(map).filter((k) => customData[k]);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-5 md:px-8 py-4 sm:py-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center md:text-left">
        Book a Bike Service
      </h1>

      {/* -------- Customized Summary -------- */}
      {customData && (
        <div className="bg-blue-50 border p-3 sm:p-4 rounded-lg mb-6 text-sm sm:text-base">
          <p>
            <b>Company:</b> {customData.bikeCompany}
          </p>
          <p>
            <b>Model:</b> {customData.bikeModel}
          </p>
          <p>
            <b>CC:</b> {customData.cc}
          </p>

          <ul className="list-disc ml-5 mt-2">
            {getSelectedServices().map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>

          <p className="mt-2 font-bold text-green-700">
            Total: ₹{customData.totalPrice}
          </p>
        </div>
      )}

      {/* -------- Popup -------- */}
      <AnimatePresence>
        {popup && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white rounded-xl p-4 sm:p-6 max-w-xs sm:max-w-sm w-full text-center">
              {popup.type === "success" ? (
                <AiOutlineCheckCircle className="text-green-600 text-5xl mx-auto" />
              ) : (
                <AiOutlineCloseCircle className="text-red-600 text-5xl mx-auto" />
              )}
              <p className="mt-4 font-semibold">{popup.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* -------- Form -------- */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <select
            {...register("companyId", { required: true })}
            className="border p-3 rounded w-full text-base"
          >
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
            className="border p-3 rounded w-full text-base"
          >
            <option value="">Select Model</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.modelName}
              </option>
            ))}
          </select>
        </div>

        <select
          {...register("serviceType", { required: true })}
          className="border p-3 rounded w-full text-base"
        >
          <option value="">Select Service</option>
          <option value="PLAN_UPTO_100CC">Up to 100cc</option>
          <option value="PLAN_100_TO_160CC">100cc - 160cc</option>
          <option value="PLAN_ABOVE_180CC">Above 180cc</option>
          <option value="CUSTOMIZED">Customized</option>
        </select>

        <input
          type="date"
          {...register("appointmentDate", {
            required: "Date required",
            validate: (v) => v >= today || "Select future date",
          })}
          min={today}
          className="border p-3 rounded w-full text-base"
        />

        <textarea
          {...register("fullAddress", { required: true })}
          placeholder="Full Address"
          className="border p-3 rounded w-full text-base"
        />

        <input
          {...register("landmark")}
          placeholder="Landmark"
          className="border p-3 rounded w-full text-base"
        />

        <textarea
          {...register("notes")}
          placeholder="Notes (optional)"
          className="border p-3 rounded w-full text-base"
        />

        <button
          disabled={loading}
          className="bg-blue-600 text-white py-3 rounded w-full font-semibold text-base hover:bg-blue-700"
        >
          {loading ? "Booking..." : "Book Now"}
        </button>
      </form>
    </div>
  );
}
