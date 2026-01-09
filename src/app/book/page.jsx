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

  const companyName =
    companies.find((c) => c.id == watch("companyId"))?.name || "";

  const modelName =
    models.find((m) => m.id == watch("modelId"))?.modelName || "";

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

  /* ---------------- Submit booking ---------------- */
  const onSubmit = async (data) => {
    const token = localStorage.getItem("token");
    if (!token) {
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
          bikeCompanyName: companyName,
          bikeModelId: Number(data.modelId),
          bikeModelName: modelName,
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

      setPopup({ type: "success" });

      setTimeout(() => {
        setPopup(null);
        router.push("/book/booking-success");
      }, 2000);
    } catch (err) {
      setPopup({ type: "error" });

      setTimeout(() => {
        setPopup(null);
      }, 2000);
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
    <div className="w-full max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Book a Bike Service
      </h1>

      {/* -------- Customized Summary -------- */}
      {customData && (
        <div className="bg-blue-50 border p-4 rounded-lg mb-6">
          <p>
            <b>Company:</b> {companyName}
          </p>
          <p>
            <b>Model:</b> {modelName}
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white rounded-xl p-6 w-80 text-center">
              {popup.type === "success" ? (
                <AiOutlineCheckCircle className="text-green-600 text-5xl mx-auto" />
              ) : (
                <AiOutlineCloseCircle className="text-red-600 text-5xl mx-auto" />
              )}

              <p className="mt-4 font-semibold">
                {popup.type === "success"
                  ? "Booking created successfully!"
                  : "Unable to place booking. Please try again."}
              </p>

              <button
                onClick={() => setPopup(null)}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded font-semibold"
              >
                OK
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* -------- Form -------- */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <select
          {...register("companyId", { required: true })}
          className="border p-3 rounded w-full"
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
          className="border p-3 rounded w-full"
        >
          <option value="">Select Model</option>
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.modelName}
            </option>
          ))}
        </select>

        <select
          {...register("serviceType", { required: true })}
          className="border p-3 rounded w-full"
        >
          <option value="">Select Service</option>
          <option value="PLAN_UPTO_100CC">Pick And Drop</option>
          <option value="PLAN_UPTO_100CC">Up to 100cc</option>
          <option value="PLAN_100_TO_160CC">100cc - 160cc</option>
          <option value="PLAN_ABOVE_180CC">Above 180cc</option>
          <option value="CUSTOMIZED">Customized</option>
        </select>

        <input
          type="date"
          {...register("appointmentDate", { required: true })}
          min={today}
          className="border p-3 rounded w-full"
        />

        <textarea
          {...register("fullAddress", { required: true })}
          placeholder="Full Address"
          className="border p-3 rounded w-full"
        />

        <input
          {...register("landmark")}
          placeholder="Landmark"
          className="border p-3 rounded w-full"
        />

        <textarea
          {...register("notes")}
          placeholder="Notes (optional)"
          className="border p-3 rounded w-full"
        />

        <button
          disabled={loading}
          className="bg-blue-600 text-white py-3 rounded w-full font-semibold"
        >
          {loading ? "Booking..." : "Book Now"}
        </button>
      </form>
    </div>
  );
}
