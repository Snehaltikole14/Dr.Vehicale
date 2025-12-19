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

  const userId = 1;

  // ---------------- Load companies ----------------
  useEffect(() => {
    fetch("http://localhost:8080/api/bikes/companies")
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
    if (!selectedCompany) return;
    fetch(`http://localhost:8080/api/bikes/companies/${selectedCompany}/models`)
      .then((res) => res.json())
      .then((data) => setModels(data));
  }, [selectedCompany]);

  // ---------------- Auto-fill CC ----------------
  useEffect(() => {
    const model = models.find((m) => m.id == selectedModel);
    setCc(model ? model.engineCc : "");
  }, [selectedModel, models]);

  // ---------------- Fetch saved services ----------------
  const fetchSavedServices = async () => {
    const res = await fetch(
      `http://localhost:8080/api/customized/user/${userId}`
    );
    if (res.ok) setSavedServices(await res.json());
  };

  useEffect(() => {
    fetchSavedServices();
  }, []);

  // ---------------- Auto price ----------------
  useEffect(() => {
    if (!selectedCompany || !selectedModel || !cc) {
      setPrice(null);
      return;
    }

    fetch("http://localhost:8080/api/customized/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bikeCompany: selectedCompany,
        bikeModel: selectedModel,
        cc,
        ...services,
      }),
    })
      .then((res) => res.json())
      .then(setPrice);
  }, [selectedCompany, selectedModel, cc, services]);

  // ---------------- Save ----------------
  const handleSave = async () => {
    const res = await fetch(
      editingId
        ? `http://localhost:8080/api/customized/${editingId}`
        : "http://localhost:8080/api/customized/save",
      {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          bikeCompany: selectedCompany,
          bikeModel: selectedModel,
          cc,
          ...services,
          totalPrice: price,
        }),
      }
    );

    if (res.ok) {
      const saved = await res.json();
      window.location.href = `/book?customServiceId=${saved.id}&companyId=${saved.bikeCompany}&modelId=${saved.bikeModel}`;
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8">
        {savedServices.map((s) => (
          <div
            key={s.id}
            className="bg-white p-5 rounded-2xl shadow hover:shadow-lg"
          >
            <h3 className="font-semibold text-lg">
              {s.bikeCompany} - {s.bikeModel}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{s.cc} CC</p>
            <p className="font-bold mt-2">₹ {s.totalPrice}</p>

            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <button className="bg-green-600 text-white px-4 py-2 rounded">
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
