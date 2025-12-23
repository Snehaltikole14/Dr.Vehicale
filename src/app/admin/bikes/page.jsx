"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Plus, Trash2, Bike } from "lucide-react";

const API = "https://dr-vehicle-backend.onrender.com/api/admin";

export default function AdminBikesPage() {
  const [companies, setCompanies] = useState([]);
  const [models, setModels] = useState([]);

  const [companyName, setCompanyName] = useState("");
  const [modelName, setModelName] = useState("");
  const [engineCc, setEngineCc] = useState("");
  const [price, setPrice] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");

  const auth = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  useEffect(() => {
    fetchCompanies();
    fetchModels();
  }, []);

  const fetchCompanies = async () => {
    const res = await axios.get(`${API}/companies`, auth());
    setCompanies(res.data);
  };

  const fetchModels = async () => {
    const res = await axios.get(`${API}/models`, auth());
    setModels(res.data);
  };

  const addCompany = async () => {
    if (!companyName.trim()) return toast.error("Company name required");

    await axios.post(`${API}/company`, { name: companyName }, auth());
    toast.success("Company added");
    setCompanyName("");
    fetchCompanies();
  };

  const addModel = async () => {
    if (!modelName || !engineCc || !price || !selectedCompany)
      return toast.error("All fields required");

    await axios.post(
      `${API}/model`,
      {
        modelName,
        engineCc: Number(engineCc),
        price: Number(price),
        company: { id: selectedCompany },
      },
      auth()
    );

    toast.success("Model added");
    setModelName("");
    setEngineCc("");
    setPrice("");
    setSelectedCompany("");
    fetchModels();
  };

  const deleteModel = async (id) => {
    if (!confirm("Delete model?")) return;
    await axios.delete(`${API}/model/${id}`, auth());
    toast.success("Model deleted");
    fetchModels();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <Bike className="text-red-600" size={32} />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Bike Management
          </h1>
        </div>

        {/* ADD COMPANY */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-semibold mb-4">Add Bike Company</h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              className="border rounded-lg p-3 flex-1"
              placeholder="Company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            <button
              onClick={addCompany}
              className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
            >
              <Plus size={18} /> Add
            </button>
          </div>
        </div>

        {/* ADD MODEL */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-semibold mb-4">Add Bike Model</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input
              className="border rounded-lg p-3"
              placeholder="Model name"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
            />

            <input
              type="number"
              className="border rounded-lg p-3"
              placeholder="Engine CC"
              value={engineCc}
              onChange={(e) => setEngineCc(e.target.value)}
            />

            <input
              type="number"
              className="border rounded-lg p-3"
              placeholder="Price (₹)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <select
              className="border rounded-lg p-3"
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

            <button
              onClick={addModel}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              <Plus size={18} /> Add
            </button>
          </div>
        </div>

        {/* MODEL LIST */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-semibold mb-4">Bike Models</h2>

          {models.length === 0 ? (
            <p className="text-gray-500">No models added yet.</p>
          ) : (
            <div className="divide-y">
              {models.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {m.modelName} ({m.engineCc}cc)
                    </p>
                    <p className="text-sm text-gray-500">
                      ₹{m.price} • {m.company?.name}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteModel(m.id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
