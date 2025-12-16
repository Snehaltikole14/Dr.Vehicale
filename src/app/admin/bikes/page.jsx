"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API = "http://localhost:8080/api/admin";

export default function AdminBikesPage() {
  const [companies, setCompanies] = useState([]);
  const [models, setModels] = useState([]);

  const [companyName, setCompanyName] = useState("");
  const [modelName, setModelName] = useState("");
  const [engineCc, setEngineCc] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");

  const auth = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  // ===== FETCH =====
  const fetchCompanies = async () => {
    const res = await axios.get(`${API}/companies`, auth());
    setCompanies(res.data);
  };

  const fetchModels = async () => {
    const res = await axios.get(`${API}/models`, auth());
    setModels(res.data);
  };

  useEffect(() => {
    fetchCompanies();
    fetchModels();
  }, []);

  // ===== ADD COMPANY =====
  const addCompany = async () => {
    if (!companyName.trim()) return toast.error("Company name required");

    await axios.post(`${API}/company`, { name: companyName }, auth());
    toast.success("Company added");
    setCompanyName("");
    fetchCompanies();
  };

  // ===== ADD MODEL =====
  const addModel = async () => {
    if (!modelName || !engineCc || !selectedCompany)
      return toast.error("All fields required");

    await axios.post(
      `${API}/model`,
      {
        modelName,
        engineCc: Number(engineCc),
        company: { id: selectedCompany },
      },
      auth()
    );

    toast.success("Model added");
    setModelName("");
    setEngineCc("");
    setSelectedCompany("");
    fetchModels();
  };

  // ===== DELETE =====
  const deleteCompany = async (id) => {
    if (!confirm("Delete company?")) return;
    await axios.delete(`${API}/company/${id}`, auth());
    fetchCompanies();
    fetchModels();
  };

  const deleteModel = async (id) => {
    await axios.delete(`${API}/model/${id}`, auth());
    fetchModels();
  };

  return (
    <div className="p-6 space-y-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold">Bike Management</h1>

      {/* ADD COMPANY */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Add Company</h2>
        <div className="flex gap-2">
          <input
            className="border p-2 rounded w-full"
            placeholder="Company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <button
            onClick={addCompany}
            className="bg-blue-600 text-white px-4 rounded"
          >
            Add
          </button>
        </div>
      </div>

      {/* ADD MODEL */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Add Bike Model</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input
            className="border p-2 rounded"
            placeholder="Model name"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
          />

          <input
            type="number"
            className="border p-2 rounded"
            placeholder="Engine CC"
            value={engineCc}
            onChange={(e) => setEngineCc(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
          >
            <option value="">Select company</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={addModel}
            className="bg-green-600 text-white rounded"
          >
            Add Model
          </button>
        </div>
      </div>

      {/* MODEL LIST */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Bike Models</h2>
        <ul className="space-y-2">
          {models.map((m) => (
            <li key={m.id} className="flex justify-between border p-2 rounded">
              <span>
                {m.modelName} ({m.engineCc}cc) —{" "}
                <span className="text-gray-500">{m.company?.name}</span>
              </span>
              <button
                onClick={() => deleteModel(m.id)}
                className="text-red-600"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
