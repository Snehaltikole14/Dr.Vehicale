"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CustomService() {
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

  // 🔐 AUTH USER
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.id) setUserId(storedUser.id);
  }, []);

  // ---------------- Load companies ----------------
  useEffect(() => {
    fetch("https://dr-vehicle-backend.onrender.com/api/bikes/companies")
      .then((res) => res.json())
      .then((data) => setCompanies(data));
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
    if (selectedCompany) {
      fetch(
        `https://dr-vehicle-backend.onrender.com/api/bikes/companies/${selectedCompany}/models`
      )
        .then((res) => res.json())
        .then((data) => setModels(data));
    } else {
      setModels([]);
      setSelectedModel("");
      setCc("");
    }
  }, [selectedCompany]);

  // ---------------- Auto-fill CC ----------------
  useEffect(() => {
    if (selectedModel) {
      const model = models.find((m) => m.id == selectedModel);
      if (model) setCc(model.engineCc);
    } else {
      setCc("");
    }
  }, [selectedModel, models]);

  // ---------------- Fetch saved services ----------------
  const fetchSavedServices = async () => {
    if (!userId) return;

    try {
      const res = await fetch(
        `https://dr-vehicle-backend.onrender.com/api/customized/user/${userId}`
      );
      if (!res.ok) throw new Error("Failed to fetch saved services");
      const data = await res.json();
      setSavedServices(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (userId) fetchSavedServices();
    else setSavedServices([]);
  }, [userId]);

  // ---------------- Auto-calculate price ----------------
  useEffect(() => {
    const calculatePrice = async () => {
      if (!selectedCompany || !selectedModel || !cc) {
        setPrice(null);
        return;
      }
      try {
        const res = await fetch(
          "https://dr-vehicle-backend.onrender.com/api/customized/calculate",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bikeCompany: selectedCompany,
              bikeModel: selectedModel,
              cc,
              ...services,
            }),
          }
        );
        const data = await res.json();
        setPrice(data);
      } catch (err) {
        console.error(err);
      }
    };
    calculatePrice();
  }, [selectedCompany, selectedModel, cc, services]);

  // ---------------- Save or update service ----------------
  const handleSave = async () => {
    if (!userId) {
      alert("Please login to save your custom service");
      window.location.href = "/login";
      return;
    }

    const body = {
      userId,
      bikeCompany: selectedCompany,
      bikeModel: selectedModel,
      cc,
      ...services,
      totalPrice: price,
    };

    const url = editingId
      ? `https://dr-vehicle-backend.onrender.com/api/customized/${editingId}`
      : "https://dr-vehicle-backend.onrender.com/api/customized/save";

    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const savedService = await res.json();
      alert(editingId ? "Updated successfully!" : "Saved successfully!");
      window.location.href = `/book?customServiceId=${savedService.id}&companyId=${savedService.bikeCompany}&modelId=${savedService.bikeModel}`;
    }
  };

  // ---------------- Edit / Delete ----------------
  const handleEdit = (service) => {
    if (!userId) return;

    setEditingId(service.id);
    setSelectedCompany(service.bikeCompany);
    setSelectedModel(service.bikeModel);
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
    if (!userId) return;
    if (!confirm("Delete this service?")) return;
    const res = await fetch(
      `https://dr-vehicle-backend.onrender.com/api/customized/${id}`,
      { method: "DELETE" }
    );
    if (res.ok) fetchSavedServices();
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
      {userId && (
        <div className="grid md:grid-cols-2 gap-6 mt-9">
          {savedServices.map((s) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-white rounded-3xl shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition"
              onClick={() =>
                (window.location.href = `/book?customServiceId=${s.id}&companyId=${s.bikeCompany}&modelId=${s.bikeModel}`)
              }
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {s.bikeCompany} - {s.bikeModel} ({s.cc} CC)
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

              <div className="mt-4 flex gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(s);
                  }}
                  className="px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(s.id);
                  }}
                  className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/book?customServiceId=${s.id}&companyId=${s.bikeCompany}&modelId=${s.bikeModel}`;
                  }}
                  className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Book Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
