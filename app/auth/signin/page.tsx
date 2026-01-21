"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, User, Chrome, Search } from "lucide-react";
import { STUDY_PROGRAMS } from "@/lib/study-programs";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Check if mode=register is in URL
  const [isRegistering, setIsRegistering] = useState(() => {
    return searchParams.get("mode") === "register";
  });

  // Update when URL changes
  useEffect(() => {
    const shouldBeRegistering = searchParams.get("mode") === "register";
    if (shouldBeRegistering !== isRegistering) {
      setIsRegistering(shouldBeRegistering);
      // Reset form data when URL changes
      setFormData({
        email: "",
        password: "",
        name: "",
        study_program: "",
        specialization: "",
        study_year: "",
      });
    }
  }, [searchParams, isRegistering]);

  // Handle click outside to close study program dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        studyProgramRef.current &&
        !studyProgramRef.current.contains(event.target as Node)
      ) {
        setShowStudyProgramDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    study_program: "",
    specialization: "",
    study_year: "",
  });

  // State for searchable study program dropdown
  const [studyProgramSearch, setStudyProgramSearch] = useState("");
  const [showStudyProgramDropdown, setShowStudyProgramDropdown] = useState(false);
  const studyProgramRef = useRef<HTMLDivElement>(null);

  // Filter study programs based on search (limit to 10 results)
  const filteredStudyPrograms = STUDY_PROGRAMS.filter((program) =>
    program.label.toLowerCase().includes(studyProgramSearch.toLowerCase()) ||
    program.value.toLowerCase().includes(studyProgramSearch.toLowerCase())
  ).slice(0, 10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegistering) {
        // Register new user
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Registration failed");
        }

        // After successful registration, sign in
        const signInResult = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (signInResult?.error) {
          throw new Error("Login failed after registration");
        }

        router.push("/fagplan");
      } else {
        // Sign in existing user
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          throw new Error("Invalid email or password");
        }

        router.push("/fagplan");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/fagplan" });
    } catch (err) {
      setError("Google sign in failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 p-4 pt-20">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {isRegistering ? "Opprett konto" : "Logg inn"}
            </h1>
            <p className="text-slate-600">
              {isRegistering
                ? "Registrer deg for å lagre dine utvekslingsplaner"
                : "Velkommen tilbake!"}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full mb-6 bg-white border-2 border-gray-200 text-slate-700 py-3 px-4 rounded-md font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Chrome size={20} />
            Fortsett med Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">
                Eller med epost
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Navn
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all"
                    placeholder="Ola Nordmann"
                  />
                </div>
              </div>
            )}

            {isRegistering && (
              <>
                <div className="relative" ref={studyProgramRef}>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Studieprogram
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      value={
                        formData.study_program
                          ? STUDY_PROGRAMS.find(
                              (p) => p.value === formData.study_program
                            )?.label || formData.study_program
                          : studyProgramSearch
                      }
                      onChange={(e) => {
                        setStudyProgramSearch(e.target.value);
                        setFormData({
                          ...formData,
                          study_program: "",
                        });
                        setShowStudyProgramDropdown(true);
                      }}
                      onFocus={() => setShowStudyProgramDropdown(true)}
                      placeholder="Søk etter studieprogram (valgfritt)"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all"
                    />
                  </div>

                  {/* Dropdown */}
                  {showStudyProgramDropdown && filteredStudyPrograms.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {filteredStudyPrograms.map((program) => (
                        <button
                          key={program.value}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              study_program: program.value,
                            });
                            setStudyProgramSearch("");
                            setShowStudyProgramDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                        >
                          {program.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Show "Ingen resultater" if no matches */}
                  {showStudyProgramDropdown &&
                    studyProgramSearch &&
                    filteredStudyPrograms.length === 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg px-4 py-3 text-gray-500 text-sm">
                        Ingen treff
                      </div>
                    )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Årstrinn
                  </label>
                  <select
                    value={formData.study_year}
                    onChange={(e) =>
                      setFormData({ ...formData, study_year: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all"
                  >
                    <option value="">Velg årstrinn (valgfritt)</option>
                    <option value="1">1. klasse</option>
                    <option value="2">2. klasse</option>
                    <option value="3">3. klasse</option>
                    <option value="4">4. klasse</option>
                    <option value="5">5. klasse</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Epost
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all"
                  placeholder="ola@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Passord
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              {isRegistering && (
                <p className="mt-1 text-xs text-slate-500">Minimum 6 tegn</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 px-4 rounded-md font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading
                ? "Laster..."
                : isRegistering
                ? "Opprett konto"
                : "Logg inn"}
            </button>
          </form>

          {/* Toggle between login and register */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                const newMode = !isRegistering;
                setIsRegistering(newMode);
                setError("");
                // Reset form data when switching modes
                setFormData({
                  email: "",
                  password: "",
                  name: "",
                  study_program: "",
                  specialization: "",
                  study_year: "",
                });
                // Reset search state
                setStudyProgramSearch("");
                setShowStudyProgramDropdown(false);
                // Update URL without page reload
                const newUrl = newMode
                  ? "/auth/signin?mode=register"
                  : "/auth/signin";
                window.history.pushState({}, "", newUrl);
              }}
              className="text-gray-900 hover:text-gray-700 font-medium text-sm cursor-pointer"
            >
              {isRegistering
                ? "Har du allerede en konto? Logg inn"
                : "Har du ikke konto? Registrer deg"}
            </button>
          </div>
        </div>

        {/* Continue without login */}
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push("/fagplan")}
            className="text-slate-600 hover:text-slate-800 text-sm cursor-pointer"
          >
            Fortsett uten å logge inn
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 p-4 pt-20 flex items-center justify-center">
        <div className="text-slate-600">Laster...</div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
