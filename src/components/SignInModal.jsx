"use client";
import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignInModal({ isOpen, onClose }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    setLoading(true);
    setError("");

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Fetch user role
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();

      if (profile?.role === "student") router.push("/student");
      else if (profile?.role === "teacher") router.push("/teacher");
      onClose();
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-8 w-96 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">X</button>
        <h2 className="text-2xl font-bold mb-4">Sign In</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <input type="email" placeholder="Email" className="w-full p-2 mb-3 border rounded" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" className="w-full p-2 mb-3 border rounded" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={handleSignIn} className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </div>
    </div>
  );
}
