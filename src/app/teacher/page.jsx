"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function TeacherDashboard() {
  const router = useRouter();
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/"); // redirect if not logged in

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (!profile || profile.role !== "teacher") return router.push("/"); // redirect if not teacher

      setLoadingAuth(false);
    };
    checkAuth();
  }, [router]);

  if (loadingAuth) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Teacher Dashboard</h1>
      <p>Manage assigned plants, review student observations, and track progress here.</p>
    </div>
  );
}
