"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import RegisterModal from "@/components/RegisterModal";
import SignInModal from "@/components/SignInModal";
import { supabase } from "@/lib/supabaseClient";

// ---------- Floating Leaf Component ----------
const Leaf = ({ size, left, top, duration, rotate }) => (
  <motion.div
    className="absolute"
    style={{ width: size, height: size, left, top }}
    animate={{
      y: ["0%", "-30%", "0%"],
      x: ["0%", "20%", "0%"],
      rotate: [0, rotate, 0],
    }}
    transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
  >
    <svg viewBox="0 0 24 24" fill="#5bcd32ff" className="w-full h-full">
      <path d="M12 2C8 5 2 12 12 22C22 12 16 5 12 2Z" />
    </svg>
  </motion.div>
);

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Home = () => {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchUserAndRole = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", currentUser.id)
          .single();

        if (!error && profileData) setRole(profileData.role);
      }
    };

    fetchUserAndRole();

    supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", currentUser.id)
          .single()
          .then(({ data, error }) => {
            if (!error && data) setRole(data.role);
          });
      } else {
        setRole(null);
      }
    });
  }, []);

  const leaves = [
    { size: 40, left: "5%", top: "10%", duration: 12, rotate: 20 },
    { size: 50, left: "80%", top: "20%", duration: 16, rotate: -15 },
    { size: 35, left: "50%", top: "60%", duration: 8, rotate: 30 },
    { size: 30, left: "25%", top: "40%", duration: 14, rotate: 45 },
    { size: 25, left: "70%", top: "70%", duration: 10, rotate: -30 },
  ];

  const features = [
    { title: "Add Observations", desc: "Students can add detailed observations with photos for each assigned plant." },
    { title: "View Trends", desc: "Track plant growth over time and visualize trends through charts and statistics." },
    { title: "Teacher Management", desc: "Teachers can assign plants, review submissions, and manage student progress efficiently." },
  ];

  const galleryImages = [
    "https://images.unsplash.com/photo-1601576025022-6a2c1d92c489?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1596204970096-14245fd48b9e?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1623181746891-c0281f7e0fa4?auto=format&w=600&q=80",
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  return (
    <div className="font-sans text-gray-800 relative overflow-x-hidden">

      {/* Floating Leaves */}
      <div className="absolute top-0 left-0 w-full h-screen overflow-hidden pointer-events-none z-0">
        {leaves.map((leaf, i) => <Leaf key={i} {...leaf} />)}
      </div>

      {/* Navbar */}
      <nav className="w-full fixed top-0 left-0 bg-gradient-to-r from-green-200 via-green-300 to-green-200 shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-4xl">🌿</span>
            <span className="text-xl font-bold text-green-900">PODS</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="font-semibold text-green-900">{user.email}</span>
                <button onClick={handleLogout} className="px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 transition">
                  Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setIsSignInOpen(true)} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">Sign In</button>
                <button onClick={() => setIsRegisterOpen(true)} className="px-4 py-2 bg-green-300 text-green-900 rounded-lg hover:bg-green-400 transition">Register</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 min-h-screen bg-gradient-to-b from-green-100 via-green-200 to-green-100 flex flex-col justify-center items-center text-center p-4 relative z-10">
        <motion.h2 className="text-2xl md:text-3xl font-semibold mb-2 text-green-700" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          Department of Floriculture
        </motion.h2>
        <motion.h1 className="text-5xl md:text-6xl font-bold mb-4 text-green-900 leading-tight" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }}>
          Plant Observation & <br /> Data System
        </motion.h1>
        <motion.p className="text-lg md:text-xl mb-8 max-w-2xl text-green-800" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4 }}>
          A web platform for floriculture students to record plant observations, track trends, and enhance learning through hands-on plant data management.
        </motion.p>

        {/* Role-Based Hero Buttons */}
        {user ? (
          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <a
              href={role === "teacher" ? "/teacher" : "#"}
              onClick={(e) => role !== "teacher" && e.preventDefault()}
              className={`px-6 py-3 rounded-lg transition ${role === "teacher" ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-300 text-gray-600 cursor-not-allowed"}`}
            >
              Teacher Access
            </a>

            <a
              href={role === "student" ? "/student" : "#"}
              onClick={(e) => role !== "student" && e.preventDefault()}
              className={`px-6 py-3 rounded-lg transition ${role === "student" ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-300 text-gray-600 cursor-not-allowed"}`}
            >
              Student Access
            </a>

            <a
              href={role === "admin" ? "/admin" : "#"}
              onClick={(e) => role !== "admin" && e.preventDefault()}
              className={`px-6 py-3 rounded-lg transition ${role === "admin" ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-300 text-gray-600 cursor-not-allowed"}`}
            >
              Admin Access
            </a>
          </div>
        ) : (
          <p className="text-green-700 mt-4">Sign in to access your role-specific panel.</p>
        )}
      </section>

      {/* Features Section */}
      <motion.section className="py-16 px-4 bg-gradient-to-r from-green-50 via-green-100 to-green-50 text-center" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.2 } } }}>
        <h2 className="text-4xl font-semibold mb-10 text-green-900">Features</h2>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div key={i} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition transform hover:-translate-y-2" variants={fadeUp}>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Gallery Section */}
      <motion.section className="py-16 px-4 bg-gradient-to-r from-green-100 via-green-200 to-green-100 text-center" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.2 } } }}>
        <h2 className="text-4xl font-semibold mb-10 text-green-900">Gallery</h2>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {galleryImages.map((url, i) => (
            <motion.img key={i} src={url} alt={`Flower ${i + 1}`} className="w-full h-48 object-cover rounded-lg shadow hover:scale-105 transition-transform duration-500" variants={fadeUp} />
          ))}
        </div>
      </motion.section>

      {/* Info Section */}
      <motion.section className="py-16 px-4 bg-gradient-to-r from-green-50 via-green-100 to-green-50 text-center" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
        <h2 className="text-4xl font-semibold mb-6 text-green-900">About This Project</h2>
        <p className="max-w-3xl mx-auto text-lg text-green-800">
          PODS (Plant Observation & Data System) helps floriculture students systematically record plant observations. Upload photos, take notes, track trends, and let teachers manage learning efficiently.
        </p>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-green-200 via-green-300 to-green-200 py-6 text-center text-green-900">
        <p>© 2025 PODS - Plant Observation System | Department of Floriculture</p>
        <p>Contact: floriculture@university.edu</p>
      </footer>

      {/* Modals */}
      <SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
    </div>
  );
};

export default Home;
