"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

// Convert file to Base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = error => reject(error);
  });
}

// Add Observation API call
async function addObservation(data, file) {
  let base64 = null;
  if (file) base64 = await fileToBase64(file);

  const res = await fetch("/api/observations/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, photo_base64: base64 })
  });

  return await res.json();
}

// Fetch assigned plants
async function fetchPlants() {
  const res = await fetch("/api/plants/fetch");
  const data = await res.json();
  if (data.success) return data.plants;
  return [];
}

// Fetch student observations
async function fetchObservations() {
  const res = await fetch("/api/observations/fetch");
  const data = await res.json();
  if (data.success) return data.observations;
  return [];
}

export default function StudentDashboard() {
  const router = useRouter();
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [plants, setPlants] = useState([]);
  const [observations, setObservations] = useState([]);
  const [form, setForm] = useState({ plant_id: "", flower_color: "", flower_size: "", petals_count: "", notes: "" });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check authentication & role
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/"); // redirect if not logged in

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (!profile || profile.role !== "student") return router.push("/"); // redirect if not student

      // Load plants and observations
      fetchPlants().then(setPlants);
      fetchObservations().then(setObservations);
      setLoadingAuth(false);
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.plant_id) return alert("Select a plant!");
    setLoading(true);
    const result = await addObservation(form, photo);
    setLoading(false);

    if (result.success) {
      alert("Observation added successfully!");
      setForm({ plant_id: "", flower_color: "", flower_size: "", petals_count: "", notes: "" });
      setPhoto(null);
      fetchObservations().then(setObservations);
    } else {
      alert("Error: " + result.message);
    }
  };

  if (loadingAuth) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Student Dashboard</h1>

      {/* Add Observation Form */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Add Observation</h2>
        <form onSubmit={handleSubmit} className="space-y-2">
          <select value={form.plant_id} onChange={e => setForm({ ...form, plant_id: e.target.value })} className="border p-2 w-full">
            <option value="">Select Plant</option>
            {plants.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
          </select>
          <input type="text" placeholder="Flower color" value={form.flower_color} onChange={e => setForm({ ...form, flower_color: e.target.value })} className="border p-2 w-full" />
          <input type="text" placeholder="Flower size" value={form.flower_size} onChange={e => setForm({ ...form, flower_size: e.target.value })} className="border p-2 w-full" />
          <input type="number" placeholder="Petals count" value={form.petals_count} onChange={e => setForm({ ...form, petals_count: parseInt(e.target.value) })} className="border p-2 w-full" />
          <textarea placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="border p-2 w-full" />
          <input type="file" onChange={e => setPhoto(e.target.files[0])} className="border p-2 w-full" />
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded" disabled={loading}>{loading ? "Adding..." : "Add Observation"}</button>
        </form>
      </div>

      {/* Observations List */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Your Observations</h2>
        {observations.length === 0 ? (<p>No observations yet.</p>) : (
          <ul className="space-y-2">
            {observations.map(obs => (
              <li key={obs.id} className="border p-2 rounded flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <p><strong>Plant:</strong> {obs.plant_id}</p>
                  <p><strong>Color:</strong> {obs.flower_color}, <strong>Size:</strong> {obs.flower_size}, <strong>Petals:</strong> {obs.petals_count}</p>
                  <p><strong>Notes:</strong> {obs.notes}</p>
                </div>
                {obs.photo_url && <img src={obs.photo_url} alt="flower" className="h-20 w-20 object-cover mt-2 md:mt-0" />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
