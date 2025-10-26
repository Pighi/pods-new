"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function TeacherPage() {
  const [students, setStudents] = useState([]);
  const [plants, setPlants] = useState([]);
  const [newPlant, setNewPlant] = useState({ name: "", species: "", assigned_to: "" });
  const [loading, setLoading] = useState(true);
  const [teacherId, setTeacherId] = useState(null);

  useEffect(() => {
    const fetchTeacherAndData = async () => {
      const { data: user } = await supabase.auth.getUser();
      const id = user?.user?.id;
      setTeacherId(id);

      const { data: studentData } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student");

      const { data: plantData } = await supabase
        .from("plants")
        .select("*, assigned_to(full_name)")
        .eq("assigned_by", id);

      setStudents(studentData || []);
      setPlants(plantData || []);
      setLoading(false);
    };

    fetchTeacherAndData();
  }, []);

  const assignPlant = async () => {
    if (!newPlant.name || !newPlant.species || !newPlant.assigned_to) {
      alert("Please fill all fields.");
      return;
    }

    const { error } = await supabase.from("plants").insert([
      {
        name: newPlant.name,
        species: newPlant.species,
        assigned_to: newPlant.assigned_to,
        assigned_by: teacherId,
      },
    ]);

    if (!error) {
      alert("Plant assigned successfully!");
      setNewPlant({ name: "", species: "", assigned_to: "" });
      const { data: plantData } = await supabase
        .from("plants")
        .select("*, assigned_to(full_name)")
        .eq("assigned_by", teacherId);
      setPlants(plantData || []);
    }
  };

  if (loading) return <div className="p-6 text-lg">Loading teacher panel...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-200 p-10">
      <h1 className="text-4xl font-bold text-green-800 mb-6 text-center">
        🌼 Teacher Dashboard
      </h1>

      {/* Assign Plant Form */}
      <div className="bg-white shadow-lg rounded-2xl p-6 mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-4">Assign New Plant</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Plant Name"
            value={newPlant.name}
            onChange={(e) => setNewPlant({ ...newPlant, name: e.target.value })}
            className="p-2 border rounded-lg placeholder-black text-black"
          />
          <input
            type="text"
            placeholder="Species"
            value={newPlant.species}
            onChange={(e) => setNewPlant({ ...newPlant, species: e.target.value })}
            className="p-2 border rounded-lg placeholder-black text-black"
          />
          <select
            value={newPlant.assigned_to}
            onChange={(e) => setNewPlant({ ...newPlant, assigned_to: e.target.value })}
            className="p-2 border rounded-lg text-black"
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={assignPlant}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl"
        >
          Assign Plant
        </button>
      </div>

      {/* Assigned Plants */}
      <div className="bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-2xl font-semibold text-green-700 mb-4">Your Assigned Plants</h2>
        <table className="w-full border">
          <thead className="bg-green-100">
            <tr>
              <th className="p-2 text-left">Plant Name</th>
              <th className="p-2 text-left">Species</th>
              <th className="p-2 text-left">Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {plants.map((p) => (
              <tr key={p.id} className="border-t hover:bg-green-50 transition">
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.species}</td>
                <td className="p-2">{p.assigned_to?.full_name || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
