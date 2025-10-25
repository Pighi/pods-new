"use client";
import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setLoading(true);
    setError("");

    // Sign up user
    const { data: userData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Add profile in 'profiles' table
    if (userData.user) {
      await supabase.from("profiles").insert([{ id: userData.user.id, role }]);
      alert("Registration successful! You can now log in.");
      onClose();
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-8 w-96 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">X</button>
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <input type="email" placeholder="Email" className="w-full p-2 mb-3 border rounded" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" className="w-full p-2 mb-3 border rounded" value={password} onChange={e => setPassword(e.target.value)} />
        <select className="w-full p-2 mb-3 border rounded" value={role} onChange={e => setRole(e.target.value)}>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>
        <button onClick={handleRegister} className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </div>
    </div>
  );
}
