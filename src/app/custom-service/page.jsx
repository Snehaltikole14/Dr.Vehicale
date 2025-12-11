"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

export default function CustomService() {
  const searchParams = useSearchParams();
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

  const userId = 1; // replace with actual logged-in user ID

  // Fetch all companies
  useEffect(() => {
    fetch("http://localhost:8080/api/bikes/companies")
      .then((res) => res.json())
      .then((data) => setCompanies(data));
  }, []);

  // Pre-fill from query params if coming from BookingPage
  useEffect(() => {
    const companyId = searchParams.get("companyId");
    const modelId = searchParams.get("modelId");
    if (companyId) setSelectedCompany(companyId);
    if (modelId) setSelectedModel(modelId);
  }, [searchParams]);

  // Fetch models when company changes
  useEffect(() => {
    if (selectedCompany) {
      fetch(
        `http://localhost:8080/api/bikes/companies/${selectedCompany}/models`
      )
        .then((res) => res.json())
        .then((data) => setModels(data));
    } else {
      setModels([]);
      setSelectedModel("");
      setCc("");
    }
  }, [selectedCompany]);

  // Auto-fill CC when model selected
  useEffect(() => {
    if (selectedModel) {
      const model = models.find((m) => m.id == selectedModel);
      if (model) setCc(model.engineCc);
    } else {
      setCc("");
    }
  }, [selectedModel, models]);

  // Fetch saved services
  const fetchSavedServices = async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/customized/user/${userId}`
      );
      if (!res.ok) throw new Error("Failed to fetch saved services");
      const data = await res.json();
      setSavedServices(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSavedServices();
  }, [userId]);

  // Auto-calculate price
  useEffect(() => {
    const calculatePrice = async () => {
      if (!selectedCompany || !selectedModel || !cc) {
        setPrice(null);
        return;
      }
      try {
        const res = await fetch(
          "http://localhost:8080/api/customized/calculate",
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

const handleSave = async () => {
  const body = {
    userId,
    bikeCompany: selectedCompany,
    bikeModel: selectedModel,
    cc,
    ...services,
    totalPrice: price,
  };
  const url = editingId
    ? `http://localhost:8080/api/customized/${editingId}`
    : "http://localhost:8080/api/customized/save";
  const method = editingId ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.ok) {
    const savedService = await res.json(); // get saved service details (id, company, model, etc.)

    alert(editingId ? "Updated successfully!" : "Saved successfully!");

    // Redirect to BookingPage with saved service details in query params
    window.location.href = `/book?customServiceId=${savedService.id}&companyId=${savedService.bikeCompany}&modelId=${savedService.bikeModel}`;

  }
};

  const handleEdit = (service) => {
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
    if (!confirm("Delete this service?")) return;
    const res = await fetch(`http://localhost:8080/api/customized/${id}`, {
      method: "DELETE",
    });
    if (res.ok) fetchSavedServices();
  };

  const handleBookNow = (service) => {
    // Navigate to booking page with query params
    router.push(
      `/book?customServiceId=${service.id}&companyId=${service.bikeCompanyId}&modelId=${service.bikeModelId}`
    );
  };

  const getCompanyName = (id) => companies.find((c) => c.id == id)?.name || id;

  return (
    <main className="max-w-4xl mx-auto py-16 px-6">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-10">
        Build Your Customized Bike Service
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-xl rounded-3xl p-10 border border-gray-100"
      >
        {/* Company */}
        <div className="mb-6">
          <label className="font-semibold">Select Bike Company</label>
          <select
            className="w-full mt-2 p-3 border rounded-lg"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
          >
            <option value="">-- Select Company --</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Model */}
        <div className="mb-6">
          <label className="font-semibold">Select Bike Model</label>
          <select
            className="w-full mt-2 p-3 border rounded-lg"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            <option value="">-- Select Model --</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.modelName}
              </option>
            ))}
          </select>
        </div>

        {/* CC */}
        <div className="mb-6">
          <label className="font-semibold">Engine CC</label>
          <input
            disabled
            value={cc || ""}
            className="w-full mt-2 p-3 border rounded-lg bg-gray-100 text-gray-600"
          />
        </div>

        {/* Services */}
        <h2 className="text-xl font-semibold mt-6 mb-3">Select Services</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: "wash", label: "Bike Wash" },
            { key: "oilChange", label: "Oil Change" },
            { key: "chainLube", label: "Chain Lube" },
            { key: "engineTuneUp", label: "Engine Tune-up" },
            { key: "breakCheck", label: "Break Check" },
            { key: "fullbodyPolishing", label: "Full-body Polishing" },
            { key: "generalInspection", label: "General Inspection" },
          ].map((s) => (
            <label key={s.key} className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={services[s.key]}
                onChange={(e) =>
                  setServices({ ...services, [s.key]: e.target.checked })
                }
              />
              <span>{s.label}</span>
            </label>
          ))}
        </div>

        {/* Price */}
        {price !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-center bg-blue-50 py-4 rounded-lg border border-blue-100"
          >
            <h3 className="text-2xl font-bold text-blue-700">
              Total Price: ₹{price}
            </h3>
            <button
              onClick={handleSave}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {editingId ? "Update Service" : "Save Service"}
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Saved Services */}
     <div className="grid md:grid-cols-2 gap-6 mt-9">
  {savedServices.map((s) => (
    <motion.div
      key={s.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-white rounded-3xl shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition"
      onClick={() =>
        window.location.href = `/book?customServiceId=${s.id}&companyId=${s.bikeCompany}&modelId=${s.bikeModel}`
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
            e.stopPropagation(); // prevent card click
            handleEdit(s);
          }}
          className="px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Edit
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation(); // prevent card click
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

          {/* )}
        </section>
      )} */}
    </main>
  );
}
