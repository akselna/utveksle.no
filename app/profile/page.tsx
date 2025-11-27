"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, BookOpen, GraduationCap, Calendar, Building2, Save, Edit2 } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    study_program: "",
    specialization: "",
    study_year: "",
    university: "NTNU",
  });

  // Load user data when session is available
  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        study_program: session.user.study_program || "",
        specialization: session.user.specialization || "",
        study_year: session.user.study_year || "",
        university: session.user.university || "NTNU",
      });
    }
  }, [session]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Only submit if in editing mode
    if (!editing) {
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setSuccess("Profil oppdatert!");
      setEditing(false);

      // Update session with new data
      await update();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Laster...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Min profil</h1>
          <p className="text-slate-600">
            Administrer dine personlige opplysninger og studieinformasjon
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
            {success}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header with avatar */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <User size={40} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{formData.name || "Bruker"}</h2>
                <p className="text-blue-100">{session.user?.email}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <User size={18} />
                Navn
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!editing}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-600"
                placeholder="Ditt navn"
              />
            </div>

            {/* Study Program */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <BookOpen size={18} />
                Studieprogram
              </label>
              <select
                value={formData.study_program}
                onChange={(e) => setFormData({ ...formData, study_program: e.target.value })}
                disabled={!editing}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-600"
              >
                <option value="">Velg studieprogram</option>
                <option value="Kybernetikk og robotikk">Kybernetikk og robotikk</option>
                <option value="Datateknologi">Datateknologi</option>
                <option value="Elektronisk systemdesign">Elektronisk systemdesign</option>
                <option value="Industriell økonomi">Industriell økonomi</option>
                <option value="Energi og miljø">Energi og miljø</option>
                <option value="Kommunikasjonsteknologi">Kommunikasjonsteknologi</option>
                <option value="Annet">Annet</option>
              </select>
            </div>

            {/* Specialization */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <GraduationCap size={18} />
                Spesialisering
              </label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                disabled={!editing}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-600"
                placeholder="F.eks. Autonome systemer"
              />
            </div>

            {/* Study Year */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Calendar size={18} />
                Årstrinn
              </label>
              <select
                value={formData.study_year}
                onChange={(e) => setFormData({ ...formData, study_year: e.target.value })}
                disabled={!editing}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-600"
              >
                <option value="">Velg årstrinn</option>
                <option value="1">1. klasse</option>
                <option value="2">2. klasse</option>
                <option value="3">3. klasse</option>
                <option value="4">4. klasse</option>
                <option value="5">5. klasse</option>
              </select>
            </div>

            {/* University */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Building2 size={18} />
                Universitet
              </label>
              <input
                type="text"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                disabled={!editing}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-600"
                placeholder="NTNU"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              {editing ? (
                <>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Save size={20} />
                    {loading ? "Lagrer..." : "Lagre endringer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setError("");
                      setSuccess("");
                      // Reset form to session data
                      if (session?.user) {
                        setFormData({
                          name: session.user.name || "",
                          study_program: session.user.study_program || "",
                          specialization: session.user.specialization || "",
                          study_year: session.user.study_year || "",
                          university: session.user.university || "NTNU",
                        });
                      }
                    }}
                    className="px-6 bg-gray-200 text-slate-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Avbryt
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setEditing(true);
                  }}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 size={20} />
                  Rediger profil
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Back button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-slate-600 hover:text-slate-800 font-medium"
          >
            ← Tilbake til hjem
          </button>
        </div>
      </div>
    </div>
  );
}
