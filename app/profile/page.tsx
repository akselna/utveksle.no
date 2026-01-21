"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  BookOpen,
  GraduationCap,
  Calendar,
  Building2,
  Save,
  Edit2,
  MapPin,
  Star,
  Plus,
  ExternalLink,
  Search,
} from "lucide-react";
import { STUDY_PROGRAMS } from "@/lib/study-programs";

interface Experience {
  id: string;
  university: string;
  country: string;
  year: string;
  semester: string;
  rating: number;
  review: string;
}

interface Course {
  id: string;
  ntnu_course_code: string;
  ntnu_course_name: string;
  exchange_university: string;
  exchange_country: string;
  exchange_course_code: string;
  exchange_course_name: string;
  ects: string;
  semester: string;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [studyProgramSearch, setStudyProgramSearch] = useState("");
  const [showStudyProgramDropdown, setShowStudyProgramDropdown] = useState(false);
  const studyProgramRef = useRef<HTMLDivElement>(null);

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
      setStudyProgramSearch(session.user.study_program || "");
    }
  }, [session]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (studyProgramRef.current && !studyProgramRef.current.contains(event.target as Node)) {
        setShowStudyProgramDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter study programs based on search
  const filteredStudyPrograms = STUDY_PROGRAMS.filter((program) =>
    program.label.toLowerCase().includes(studyProgramSearch.toLowerCase()) ||
    program.value.toLowerCase().includes(studyProgramSearch.toLowerCase())
  ).slice(0, 10); // Limit to 10 results

  // Load user's experiences and courses
  useEffect(() => {
    if (session?.user?.id) {
      loadUserData();
    }
  }, [session]);

  const loadUserData = async () => {
    setLoadingData(true);
    try {
      // Load experiences
      const expRes = await fetch("/api/experiences");
      if (expRes.ok) {
        const expData = await expRes.json();
        if (expData.success) {
          const userExperiences = expData.experiences
            .filter(
              (exp: any) => exp.user_id === parseInt(session?.user?.id || "0")
            )
            .map((exp: any) => ({
              id: exp.id.toString(),
              university: exp.university_name,
              country: exp.country,
              year: exp.year.toString(),
              semester: exp.semester,
              rating: exp.rating,
              review: exp.review,
            }));
          setExperiences(userExperiences);
        }
      }

      // Load courses
      const coursesRes = await fetch(
        `/api/approved-courses?user_id=${session?.user?.id}&limit=100`
      );
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        const coursesList = coursesData.courses || [];
        const userCourses = coursesList.map((course: any) => ({
          id: course.id?.toString() || course.NTNU_Emnekode,
          ntnu_course_code: course.ntnu_course_code || course.NTNU_Emnekode,
          ntnu_course_name: course.ntnu_course_name || course.NTNU_Fagnavn,
          exchange_university: course.exchange_university || course.University,
          exchange_country: course.exchange_country || course.Country,
          exchange_course_code:
            course.exchange_course_code || course.Bologna_Emnekode,
          exchange_course_name:
            course.exchange_course_name || course.Bologna_Fagnavn,
          ects: course.ects || course.ECTS,
          semester: course.semester || course.Semester,
        }));
        setCourses(userCourses);
      }
    } catch (err) {
      console.error("Error loading user data:", err);
    } finally {
      setLoadingData(false);
    }
  };

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

  if (status === "loading" || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laster...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-4">
            Min profil
          </h1>
          <p className="text-lg text-gray-600">
            Administrer dine personlige opplysninger og se dine bidrag
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="md:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <User size={48} className="text-gray-400" />
                </div>
                <h2 className="text-2xl font-light text-gray-900 mb-1">
                  {formData.name || "Bruker"}
                </h2>
                <p className="text-gray-600 text-sm">{session.user?.email}</p>
              </div>

              {/* Stats */}
              <div className="space-y-4 mb-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Erfaringer</span>
                  <span className="text-gray-900 font-medium">
                    {experiences.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Fag lagt til</span>
                  <span className="text-gray-900 font-medium">
                    {courses.length}
                  </span>
                </div>
              </div>

              {/* Edit Button */}
              {!editing && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setEditing(true);
                  }}
                  className="w-full bg-primary text-white py-3 px-4 rounded-md font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Edit2 size={20} />
                  Rediger profil
                </button>
              )}
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Profile Form */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-2xl font-light text-gray-900 mb-6">
                Personlig informasjon
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Navn
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={!editing}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-600 text-gray-900"
                    placeholder="Ditt navn"
                  />
                </div>

                {/* Study Program */}
                <div ref={studyProgramRef} className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Studieprogram
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={studyProgramSearch}
                      onChange={(e) => {
                        setStudyProgramSearch(e.target.value);
                        setShowStudyProgramDropdown(true);
                      }}
                      onFocus={() => setShowStudyProgramDropdown(true)}
                      disabled={!editing}
                      className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-600 text-gray-900"
                      placeholder="Søk etter studieprogram..."
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                  {editing && showStudyProgramDropdown && studyProgramSearch && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredStudyPrograms.length > 0 ? (
                        filteredStudyPrograms.map((program) => (
                          <div
                            key={program.value}
                            onClick={() => {
                              setFormData({
                                ...formData,
                                study_program: program.value,
                              });
                              setStudyProgramSearch(program.value);
                              setShowStudyProgramDropdown(false);
                            }}
                            className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer transition-colors"
                          >
                            <div className="font-medium text-gray-900">{program.label}</div>
                            <div className="text-sm text-gray-600">{program.value}</div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2.5 text-gray-500 text-sm">
                          Ingen studieprogrammer funnet
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Study Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Årstrinn
                  </label>
                  <select
                    value={formData.study_year}
                    onChange={(e) =>
                      setFormData({ ...formData, study_year: e.target.value })
                    }
                    disabled={!editing}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-600 text-gray-900"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Universitet
                  </label>
                  <input
                    type="text"
                    value={formData.university}
                    onChange={(e) =>
                      setFormData({ ...formData, university: e.target.value })
                    }
                    disabled={!editing}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-600 text-gray-900"
                    placeholder="NTNU"
                  />
                </div>

                {/* Action Buttons */}
                {editing && (
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-primary text-white py-3 px-4 rounded-md font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
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
                          setStudyProgramSearch(session.user.study_program || "");
                        }
                        setShowStudyProgramDropdown(false);
                      }}
                      className="px-6 bg-gray-200 text-gray-700 py-3 rounded-md font-medium hover:bg-gray-300 transition-colors cursor-pointer"
                    >
                      Avbryt
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* My Experiences */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-light text-gray-900">
                  Mine erfaringer
                </h3>
                <Link
                  href="/erfaringer"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer flex items-center gap-1"
                >
                  Se alle <ExternalLink size={14} />
                </Link>
              </div>
              {experiences.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-4">
                    Du har ikke lagt til noen erfaringer ennå.
                  </p>
                  <Link
                    href="/erfaringer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary-hover transition-colors cursor-pointer"
                  >
                    <Plus size={18} />
                    Legg til erfaring
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {experiences.slice(0, 3).map((exp) => (
                    <div
                      key={exp.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {exp.university}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {exp.country} • {exp.year} • {exp.semester}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={
                                i < exp.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {exp.review}
                      </p>
                    </div>
                  ))}
                  {experiences.length > 3 && (
                    <Link
                      href="/erfaringer"
                      className="block text-center text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer py-2"
                    >
                      Se alle {experiences.length} erfaringer →
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* My Courses */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-light text-gray-900">Mine fag</h3>
                <Link
                  href="/fagbank"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer flex items-center gap-1"
                >
                  Se alle <ExternalLink size={14} />
                </Link>
              </div>
              {courses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-4">Du har ikke lagt til noen fag ennå.</p>
                  <Link
                    href="/fagbank"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary-hover transition-colors cursor-pointer"
                  >
                    <Plus size={18} />
                    Legg til fag
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {courses.slice(0, 5).map((course) => (
                    <div
                      key={course.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {course.ntnu_course_code}
                            </span>
                            <span className="text-sm text-gray-500">→</span>
                            <span className="font-medium text-gray-900">
                              {course.exchange_course_code}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {course.ntnu_course_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {course.exchange_university},{" "}
                            {course.exchange_country} • {course.semester} •{" "}
                            {course.ects} ECTS
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {courses.length > 5 && (
                    <Link
                      href="/fagbank"
                      className="block text-center text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer py-2"
                    >
                      Se alle {courses.length} fag →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
