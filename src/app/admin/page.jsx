"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name", { ascending: true });

      const { data: plantData, error: plantError } = await supabase
        .from("plants")
        .select("*, assigned_to(full_name), assigned_by(full_name)")
        .order("created_at", { ascending: false });

      if (!userError) setUsers(userData || []);
      if (!plantError) setPlants(plantData || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  const updateRole = async (id, newRole) => {
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", id);
    if (!error) {
      alert(`Role updated to ${newRole}`);
      setUsers(users.map(u => (u.id === id ? { ...u, role: newRole } : u)));
    }
  };

  if (loading) return <div className="p-6 text-lg">Loading admin panel...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-200 p-10">
      <h1 className="text-4xl font-bold text-green-800 mb-6 text-center">
        🌿 Admin Dashboard
      </h1>

      {/* USERS */}
      <div className="bg-white shadow-lg rounded-2xl p-6 mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-4">👥 User Management</h2>

        <table className="w-full border">
          <thead className="bg-green-100">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t hover:bg-green-50 transition">
                <td className="p-2">{user.full_name || "No name"}</td>
                <td className="p-2 capitalize">{user.role}</td>
                <td className="p-2 text-center">
                  <button
                    onClick={() =>
                      updateRole(user.id, user.role === "teacher" ? "student" : "teacher")
                    }
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg mr-2"
                  >
                    {user.role === "teacher" ? "Demote to Student" : "Promote to Teacher"}
                  </button>
                  <button
                    onClick={() => updateRole(user.id, "admin")}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-lg"
                  >
                    Make Admin
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PLANTS */}
      <div className="bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-2xl font-semibold text-green-700 mb-4">🌱 Assigned Plants</h2>
        <table className="w-full border">
          <thead className="bg-green-100">
            <tr>
              <th className="p-2 text-left">Plant Name</th>
              <th className="p-2 text-left">Assigned To</th>
              <th className="p-2 text-left">Assigned By</th>
              <th className="p-2 text-left">Created At</th>
            </tr>
          </thead>
          <tbody>
            {plants.map((p) => (
              <tr key={p.id} className="border-t hover:bg-green-50 transition">
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.assigned_to?.full_name || "N/A"}</td>
                <td className="p-2">{p.assigned_by?.full_name || "N/A"}</td>
                <td className="p-2">{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
