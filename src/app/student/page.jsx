"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  ScatterChart,
  Scatter,
} from "recharts";

export default function StudentPage() {
  const [plants, setPlants] = useState([]);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    plant_id: "",
    plant_name: "",
    plant_height: "",
    plant_spread: "",
    branch_number: "",
    node_number: "",
    leaf_number: "",
    leaf_area: "",
    flower_count: "",
    flower_diameter: "",
    plant_age: "",
    photo: null,
  });

  // Fetch assigned plants and observations
  useEffect(() => {
    const fetchPlants = async () => {
      const { data } = await supabase.from("plants").select("*");
      if (data) setPlants(data);
    };
    const fetchObservations = async () => {
      const { data } = await supabase.from("observations").select("*");
      if (data) setObservations(data);
    };
    fetchPlants();
    fetchObservations();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let photo_url = null;
    if (form.photo) {
      const fileName = `${Date.now()}_${form.photo.name}`;
      const { error: uploadError } = await supabase.storage
        .from("plant_photos")
        .upload(fileName, form.photo);

      if (!uploadError) {
        const { data } = supabase.storage
          .from("plant_photos")
          .getPublicUrl(fileName);
        photo_url = data.publicUrl;
      }
    }

    const { error } = await supabase.from("observations").insert([
      {
        plant_id: form.plant_id,
        plant_name: form.plant_name,
        plant_height: parseFloat(form.plant_height),
        plant_spread: parseFloat(form.plant_spread),
        branch_number: parseInt(form.branch_number),
        node_number: parseInt(form.node_number),
        leaf_number: parseInt(form.leaf_number),
        leaf_area: parseFloat(form.leaf_area),
        flower_count: parseInt(form.flower_count),
        flower_diameter: parseFloat(form.flower_diameter),
        plant_age: parseInt(form.plant_age),
        photo_url,
      },
    ]);

    if (error) alert("Error adding observation");
    else {
      alert("Observation added!");
      setForm({
        plant_id: "",
        plant_name: "",
        plant_height: "",
        plant_spread: "",
        branch_number: "",
        node_number: "",
        leaf_number: "",
        leaf_area: "",
        flower_count: "",
        flower_diameter: "",
        plant_age: "",
        photo: null,
      });
      const { data } = await supabase.from("observations").select("*");
      setObservations(data);
    }
    setLoading(false);
  };

  // Simple statistics
  const calcStats = (param) => {
    if (!observations.length) return {};
    const values = observations.map((o) => o[param]).filter((v) => v);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    return { avg: avg.toFixed(2), max, min };
  };

  // 🌱 Correlation
  const correlation = (xArr, yArr) => {
    if (xArr.length < 2) return 0;
    const meanX = xArr.reduce((a, b) => a + b, 0) / xArr.length;
    const meanY = yArr.reduce((a, b) => a + b, 0) / yArr.length;
    const numerator = xArr.reduce(
      (sum, xi, i) => sum + (xi - meanX) * (yArr[i] - meanY),
      0
    );
    const denominator = Math.sqrt(
      xArr.reduce((sum, xi) => sum + (xi - meanX) ** 2, 0) *
        yArr.reduce((sum, yi) => sum + (yi - meanY) ** 2, 0)
    );
    return numerator / denominator;
  };

  const corrHeightSpread = correlation(
    observations.map((o) => o.plant_height || 0),
    observations.map((o) => o.plant_spread || 0)
  );
  const corrHeightLeaf = correlation(
    observations.map((o) => o.plant_height || 0),
    observations.map((o) => o.leaf_area || 0)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-200 to-green-300 p-6">
      <div className="max-w-6xl mx-auto backdrop-blur-xl bg-white/60 rounded-2xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-green-900 mb-6 text-center animate-fade-in">
          🌿 Student Observation Dashboard
        </h1>

        {/* Add Observation Form */}
        <div className="bg-white/80 rounded-xl shadow-lg p-6 mb-10">
          <h2 className="text-xl font-semibold mb-4 text-green-700">
            Add New Observation
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <select
              value={form.plant_id}
              onChange={(e) => setForm({ ...form, plant_id: e.target.value })}
              className="border p-2 rounded placeholder-black text-black"
            >
              <option value="">Select Plant</option>
              {plants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {Object.keys(form)
              .filter((f) => f !== "plant_id" && f !== "photo")
              .map((key) => (
                <input
                  key={key}
                  type="number"
                  placeholder={key.replace("_", " ")}
                  value={form[key]}
                  onChange={(e) =>
                    setForm({ ...form, [key]: e.target.value })
                  }
                  className="border p-2 rounded placeholder-black text-black"
                />
              ))}
            <input
              type="file"
              onChange={(e) =>
                setForm({ ...form, photo: e.target.files[0] })
              }
              className="border p-2 rounded md:col-span-2 placeholder-black text-black"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-green-700 text-white py-2 rounded md:col-span-2 hover:bg-green-800 transition-transform hover:scale-105"
            >
              {loading ? "Adding..." : "Add Observation"}
            </button>
          </form>
        </div>

        {/* Growth Trend Chart */}
        <div className="bg-white/80 p-6 rounded-xl shadow mb-10">
          <h2 className="text-xl font-semibold mb-4 text-green-700">
            Growth Trends
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={observations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="plant_age" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line dataKey="plant_height" stroke="#16a34a" name="Height" />
              <Line dataKey="plant_spread" stroke="#2563eb" name="Spread" />
              <Line dataKey="leaf_area" stroke="#ca8a04" name="Leaf Area" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Statistical Summary */}
        <div className="bg-white/80 p-6 rounded-xl shadow mb-10">
          <h2 className="text-xl font-semibold mb-4 text-green-700">
            Statistical Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {["plant_height", "leaf_area", "plant_spread"].map((param) => {
              const s = calcStats(param);
              return (
                <div
                  key={param}
                  className="bg-green-50 p-4 rounded-lg shadow hover:scale-105 transition-transform"
                >
                  <h3 className="font-semibold text-green-800 capitalize">
                    {param.replace("_", " ")}
                  </h3>
                  <p>Average: {s.avg}</p>
                  <p>Max: {s.max}</p>
                  <p>Min: {s.min}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 🌱 Split Design Statistical Model */}
        <div className="bg-white/80 p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-6 text-green-700">
            Split Design Statistical Model (Parameter Correlations)
          </h2>
          <p className="text-gray-700 mb-6">
            Visualizes correlations between parameters — for example, how
            spread or leaf area changes with height.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart data={observations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="plant_height" name="Height" />
                <YAxis dataKey="plant_spread" name="Spread" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter data={observations} fill="#16a34a" />
              </ScatterChart>
            </ResponsiveContainer>

            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart data={observations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="plant_height" name="Height" />
                <YAxis dataKey="leaf_area" name="Leaf Area" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter data={observations} fill="#2563eb" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 text-center">
            <div className="bg-green-50 inline-block px-6 py-4 rounded-lg shadow">
              <p className="font-semibold text-green-800">
                Correlation (Height ↔ Spread): {corrHeightSpread.toFixed(3)}
              </p>
              <p className="font-semibold text-green-800 mt-2">
                Correlation (Height ↔ Leaf Area): {corrHeightLeaf.toFixed(3)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
