"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { API_PUBLIC, API_PRIVATE } from "@/utils/api";

export default function CustomService() {
  const router = useRouter();

  const [companies, setCompanies] = useState([]);
  const [models, setModels] = useState([]);
  const [savedServices, setSavedServices] = useState([]);

  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [cc, setCc] = useState("");

  const [services, setServices] = useState({
    wash: false,
    oilChange: false,
    chainLube: false,
    engineTuneUp: false,
    breakCheck: false,
    fullbodyPolishing: false,
    generalInspection: false,
  });

  const [price, setPrice] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // ---------------- Load companies ----------------
  useEffect(() => {
    API_PUBLIC.get("/api/bikes/companies")
      .then((res) => setCompanies(res.data))
      .catch((err) => console.error("Companies error:", err));
  }, []);

  // ---------------- Load query params ----------------
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const companyId = params.get("companyId");
    const modelId = params.get("modelId");
    if (companyId) setSelectedCompany(companyId);
    if (modelId) setSelectedModel(modelId);
  }, []);

  // ---------------- Load models ----------------
  useEffect(() => {
    if (!selectedCompany) {
      setModels([]);
      setSelectedModel("");
      setCc("");
      return;
    }

    API_PUBLIC.get(`/api/bikes/companies/${selectedCompany}/models`)
      .then((res) => setModels(res.data))
      .catch((err) => console.error("Models error:", err));
  }, [selectedCompany]);

  // ---------------- Auto-fill CC ----------------
  useEffect(() => {
    if (!selectedModel) {
      setCc("");
      return;
    }
    const model = models.find((m) => String(m.id) === String(selectedModel));
    if (model) setCc(model.engineCc);
  }, [selectedModel, models]);

  // ---------------- Selected names (for showing + saving) ----------------
  const selectedCompanyName = useMemo(() => {
    const c = companies.find((x) => String(x.id) === String(selectedCompany));
    return c?.name || "";
  }, [companies, selectedCompany]);

  const selectedModelName = useMemo(() => {
    const m = models.find((x) => String(x.id) === String(selectedModel));
    return m?.modelName || "";
  }, [models, selectedModel]);

  // ---------------- Fetch saved services ----------------
  const fetchSavedServices = async () => {
    try {
      const res = await API_PRIVATE.get("/api/customized/my");
      setSavedServices(res.data);
    } catch (err) {
      console.error("Saved services error:", err);
    }
  };

  useEffect(() => {
    fetchSavedServices();
  }, []);

  // ---------------- Auto-calculate price ----------------
  useEffect(() => {
    const calculatePrice = async () => {
      if (!selectedCompany || !selectedModel || !cc) {
        setPrice(null);
        return;
      }

      try {
        const res = await API_PUBLIC.post("/api/customized/calculate", {
          bikeCompanyId: Number(selectedCompany),
          bikeModelId: Number(selectedModel),
          cc: Number(cc),
          ...services,
        });

        setPrice(res.data);
      } catch (err) {
        console.error("Price error:", err);
      }
    };

    calculatePrice();
  }, [selectedCompany, selectedModel, cc, services]);

  // ---------------- Save or update service ----------------
  const handleSave = async () => {
    if (!selectedCompany || !selectedModel || !cc) {
      alert("Please select bike company and model");
      return;
    }

    if (!price) {
      alert("Price not calculated yet!");
      return;
    }

    const body = {
      bikeCompanyId: Number(selectedCompany),
      bikeCompanyName: selectedCompanyName,
      bikeModelId: Number(selectedModel),
      bikeModelName: selectedModelName,
      cc: Number(cc),
      ...services,
      totalPrice: Number(price),
    };

    const url = editingId ? `/api/customized/${editingId}` : "/api/customized/save";
    const method = editingId ? "put" : "post";

    try {
      const res = await API_PRIVATE[method](url, body);

      const savedService = res.data;

      alert(editingId ? "Updated successfully!" : "Saved successfully!");

      // redirect back to booking page with customServiceId
      router.push(`/book?customServiceId=${savedService.id}`);
    } catch (err) {
      console.error("Save error:", err);
      alert("Save failed!");
    }
  };

  // ---------------- Edit / Delete ----------------
  const handleEdit = (service) => {
    setEditingId(service.id);

    setSelectedCompany(String(service.bikeCompanyId));
    setSelectedModel(String(service.bikeModelId));
    setCc(service.cc);

    setServices({
      wash: service.wash,
      oilChange: service.oilChange,
      chainLube: service.chainLube,
      engineTuneUp: service.engineTuneUp,
      breakCheck: service.breakCheck,
      fullbodyPolishing: service.fullbodyPolishing,
      generalInspection: service.generalInspection,
    });

    setPrice(service.totalPrice);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this service?")) return;

    try {
      await API_PRIVATE.delete(`/api/customized/${id}`);
      fetchSavedServices();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed");
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl sm:text-4xl font-bold text-center text-blue-600 mb-8">
        Customized Bike Service
      </h1>

      {/* FORM */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-5 sm:p-8"
      >
        {/* Company */}
        <div className="mb-4">
          <label className="font-semibold">Bike Company</label>
          <select
            className="w-full mt-2 p-3 border rounded-lg"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
          >
            <option value="">Select Company</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Model */}
        <div className="mb-4">
          <label className="font-semibold">Bike Model</label>
          <select
            className="w-full mt-2 p-3 border rounded-lg"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={!selectedCompany}
          >
            <option value="">Select Model</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.modelName}
              </option>
            ))}
          </select>
        </div>

        {/* CC */}
        <div className="mb-4">
          <label className="font-semibold">Engine CC</label>
          <input
            disabled
            value={cc}
            className="w-full mt-2 p-3 bg-gray-100 border rounded-lg"
          />
        </div>

        {/* Services */}
        <h2 className="font-semibold text-lg mb-3">Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries({
            wash: "Bike Wash",
            oilChange: "Oil Change",
            chainLube: "Chain Lube",
            engineTuneUp: "Engine Tune-up",
            breakCheck: "Brake Check",
            fullbodyPolishing: "Full Body Polishing",
            generalInspection: "General Inspection",
          }).map(([key, label]) => (
            <label
              key={key}
              className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer"
            >
              <input
                type="checkbox"
                checked={services[key]}
                onChange={(e) =>
                  setServices({ ...services, [key]: e.target.checked })
                }
              />
              <span>{label}</span>
            </label>
          ))}
        </div>

        {/* Price */}
        {price && (
          <div className="mt-6 text-center bg-blue-50 p-4 rounded-xl">
            <h3 className="text-xl font-bold text-blue-700">₹ {price}</h3>
            <button
              onClick={handleSave}
              className="mt-4 w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg"
            >
              {editingId ? "Update Service" : "Save Service"}
            </button>
          </div>
        )}
      </motion.div>

      {/* SAVED SERVICES */}
      <div className="grid md:grid-cols-2 gap-6 mt-9">
        {savedServices.map((s) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {s.bikeCompanyName} - {s.bikeModelName} ({s.cc} CC)
            </h2>

            <p className="text-gray-600 mb-3">
              <strong>Services:</strong>{" "}
              {[
                s.wash && "Wash",
                s.oilChange && "Oil Change",
                s.chainLube && "Chain Lube",
                s.engineTuneUp && "Engine Tune-up",
                s.breakCheck && "Brake Check",
                s.fullbodyPolishing && "Full Body Polishing",
                s.generalInspection && "General Inspection",
              ]
                .filter(Boolean)
                .join(", ")}
            </p>

            <p className="text-gray-800 font-bold text-lg">
              Total Price: ₹{s.totalPrice}
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => handleEdit(s)}
                className="px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(s.id)}
                className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>

              <button
                onClick={() => router.push(`/book?customServiceId=${s.id}`)}
                className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Book Now
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
