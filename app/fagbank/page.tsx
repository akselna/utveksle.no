"use client";

import { useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Course } from "@/types/course";
import approvedCoursesData from "@/data/approved_courses.json";
import { Search, Filter, X, Info, ShieldCheck, Plus, ChevronLeft, ChevronRight, Lock } from "lucide-react";

export default function FagbankPage() {
  const { data: session } = useSession();
  const courses: Course[] = approvedCoursesData as Course[];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedECTS, setSelectedECTS] = useState<string>("all");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Add course form state
  const [exchangeUniversity, setExchangeUniversity] = useState("None selected");
  const [courseEntries, setCourseEntries] = useState(() => [
    {
      id: new Date().getTime(),
      ntnuEmnekode: "",
      ntnuFagnavn: "",
      foreignEmnekode: "",
      foreignFagnavn: "",
      semester: "Høst",
      ects: "",
    }
  ]);

  // Get unique values for filters
  const universities = useMemo(() => {
    const uniqueUniversities = Array.from(new Set(courses.map(c => c.University))).sort();
    return uniqueUniversities;
  }, [courses]);

  // Get exchange universities with country prefix (same as in fagplan)
  const EXCHANGE_UNIVERSITIES = useMemo(() => {
    return [
      "None selected",
      ...Array.from(new Set((approvedCoursesData as Course[]).map(course =>
        course.Country && course.University ? `${course.Country} - ${course.University}` : null
      ).filter(Boolean))).sort()
    ] as string[];
  }, []);

  const countries = useMemo(() => {
    const uniqueCountries = Array.from(new Set(courses.map(c => c.Country))).sort();
    return uniqueCountries;
  }, [courses]);

  const ectsOptions = useMemo(() => {
    const uniqueECTS = Array.from(new Set(courses.map(c => c.ECTS)))
      .filter(ects => ects != null && ects !== '')
      .sort((a, b) => {
        const strA = String(a);
        const strB = String(b);
        const numA = parseFloat(strA.replace(',', '.'));
        const numB = parseFloat(strB.replace(',', '.'));
        return numA - numB;
      });
    return uniqueECTS;
  }, [courses]);

  const hasActiveFilters = searchQuery || selectedUniversity !== "all" || selectedCountry !== "all" || selectedECTS !== "all" || showVerifiedOnly;

  // Filter and search courses - only recalculate when filter dependencies change
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      // Verified filter
      const isVerified = !!(course.Bologna_Emnekode || course.Foreign_Emnekode);
      const matchesVerified = !showVerifiedOnly || isVerified;

      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery ||
        course.NTNU_Emnekode?.toLowerCase().includes(searchLower) ||
        course.NTNU_Fagnavn?.toLowerCase().includes(searchLower) ||
        course.Bologna_Emnekode?.toLowerCase().includes(searchLower) ||
        course.Bologna_Fagnavn?.toLowerCase().includes(searchLower) ||
        course.Foreign_Emnekode?.toLowerCase().includes(searchLower) ||
        course.Foreign_Fagnavn?.toLowerCase().includes(searchLower) ||
        course.University?.toLowerCase().includes(searchLower) ||
        course.Country?.toLowerCase().includes(searchLower);

      // University filter
      const matchesUniversity = selectedUniversity === "all" || course.University === selectedUniversity;

      // Country filter
      const matchesCountry = selectedCountry === "all" || course.Country === selectedCountry;

      // ECTS filter
      const matchesECTS = selectedECTS === "all" || course.ECTS === selectedECTS;

      return matchesVerified && matchesSearch && matchesUniversity && matchesCountry && matchesECTS;
    });
  }, [courses, searchQuery, selectedUniversity, selectedCountry, selectedECTS, showVerifiedOnly]);

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedUniversity("all");
    setSelectedCountry("all");
    setSelectedECTS("all");
    setShowVerifiedOnly(false);
    setCurrentPage(1);
  };

  // Add new course entry
  const addCourseEntry = useCallback(() => {
    setCourseEntries(prev => [...prev, {
      id: Date.now(),
      ntnuEmnekode: "",
      ntnuFagnavn: "",
      foreignEmnekode: "",
      foreignFagnavn: "",
      semester: "Høst",
      ects: "",
    }]);
  }, []);

  // Remove course entry
  const removeCourseEntry = useCallback((id: number) => {
    setCourseEntries(prev => {
      if (prev.length > 1) {
        return prev.filter(entry => entry.id !== id);
      }
      return prev;
    });
  }, []);

  // Update course entry - optimized with useCallback to prevent re-renders
  const updateCourseEntry = useCallback((id: number, field: string, value: string) => {
    setCourseEntries(prev => prev.map(entry =>
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  }, []);

  // Handle add course form submission
  const handleAddCourse = () => {
    // Validate university selection
    if (exchangeUniversity === "None selected") {
      alert("Vennligst velg et utvekslingsuniversitet");
      return;
    }

    // Validate that at least one course has required fields
    const validEntries = courseEntries.filter(entry =>
      entry.ntnuEmnekode && entry.foreignEmnekode
    );

    if (validEntries.length === 0) {
      alert("Vennligst fyll ut minst ett fag med NTNU emnekode og utvekslings emnekode");
      return;
    }

    // Extract university and country from selection
    const [country, university] = exchangeUniversity.includes(" - ")
      ? exchangeUniversity.split(" - ")
      : ["", exchangeUniversity];

    // Create course objects for each valid entry
    const coursesToAdd = validEntries.map(entry => ({
      University: university,
      Country: country,
      NTNU_Emnekode: entry.ntnuEmnekode,
      NTNU_Fagnavn: entry.ntnuFagnavn || "",
      Foreign_Emnekode: entry.foreignEmnekode,
      Foreign_Fagnavn: entry.foreignFagnavn || "",
      ECTS: entry.ects || "7.5",
      Behandlingsdato: new Date().toISOString().split('T')[0],
      Semester: entry.semester,
    }));

    console.log("Nye kurs:", coursesToAdd);

    // TODO: Send to backend/API to save
    // For now, just show success message
    alert(`${validEntries.length} kurs er sendt inn! De vil bli gjennomgått og lagt til i fagbanken.`);

    // Reset form and close modal
    setExchangeUniversity("None selected");
    setCourseEntries([{
      id: Date.now(),
      ntnuEmnekode: "",
      ntnuFagnavn: "",
      foreignEmnekode: "",
      foreignFagnavn: "",
      semester: "Høst",
      ects: "",
    }]);
    setShowAddCourseModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Fagbank</h1>
            <p className="text-lg text-gray-600">
              Søk blant {courses.length} godkjente utvekslingskurs
            </p>
          </div>
          <button
            onClick={() => setShowAddCourseModal(true)}
            className="bg-blue-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <Plus size={20} /> Legg til kurs
          </button>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Søk etter emnekode, emnenavn, universitet eller land..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          {/* Filter Toggle Button */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span className="font-medium">
                {showFilters ? "Skjul filtre" : "Vis filtre"}
              </span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
                Tilbakestill filtre
              </button>
            )}
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              {/* Verified Checkbox */}
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showVerifiedOnly}
                    onChange={(e) => {
                      setShowVerifiedOnly(e.target.checked);
                      setCurrentPage(1);
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Vis kun verifiserte kurs
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Country Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Land
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => {
                      setSelectedCountry(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="all">Alle land</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                {/* University Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Universitet
                  </label>
                  <select
                    value={selectedUniversity}
                    onChange={(e) => {
                      setSelectedUniversity(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="all">Alle universiteter</option>
                    {universities.map(uni => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                  </select>
                </div>

                {/* ECTS Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ECTS
                  </label>
                  <select
                    value={selectedECTS}
                    onChange={(e) => {
                      setSelectedECTS(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="all">Alle studiepoeng</option>
                    {ectsOptions.map(ects => (
                      <option key={ects} value={ects}>{ects} ECTS</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-600">
          Viser {Math.min((currentPage - 1) * itemsPerPage + 1, filteredCourses.length)}-
          {Math.min(currentPage * itemsPerPage, filteredCourses.length)} av {filteredCourses.length} kurs
        </div>

        {/* Course List */}
        <div className="space-y-4">
          {filteredCourses.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-lg">Ingen kurs funnet med gjeldende filtre</p>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Tilbakestill filtre
                </button>
              )}
            </div>
          ) : (
            paginatedCourses.map((course, index) => {
              const foreignCode = course.Bologna_Emnekode || course.Foreign_Emnekode;
              const foreignName = course.Bologna_Fagnavn || course.Foreign_Fagnavn;
              const isVerified = !!(course.Bologna_Emnekode || course.Foreign_Emnekode);
              
              // Use original index from the full dataset to ensure search results outside the top 10 are also blurred
              const originalIndex = courses.indexOf(course);
              const isBlurred = !session && originalIndex >= 10;

              return (
                <div
                  key={`${course.NTNU_Emnekode}-${foreignCode}-${index}`}
                  className={`relative bg-white rounded-lg shadow-sm border border-gray-200 transition-all
                    ${!isBlurred ? 'hover:shadow-md' : 'overflow-hidden group'}`}
                >
                  <div className={`p-6 ${isBlurred ? 'blur-md select-none' : ''}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* NTNU Course */}
                      <div className="border-r-0 md:border-r border-gray-200 pr-0 md:pr-6">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-sm font-semibold text-blue-600 uppercase">
                            NTNU Kurs
                          </h3>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {course.ECTS} ECTS
                          </span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 mb-1">
                          {course.NTNU_Emnekode}
                        </p>
                        <p className="text-gray-700">{course.NTNU_Fagnavn}</p>
                      </div>

                      {/* Exchange Course */}
                      <div>
                        <div className="mb-3 flex items-center gap-2">
                          <span className="inline-flex items-center gap-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {course.Country}
                          </span>
                          {isVerified && (
                            <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              <ShieldCheck size={12} /> Verifisert
                            </span>
                          )}
                        </div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-sm font-semibold text-green-600 uppercase">
                            Utvekslingskurs
                          </h3>
                          <button
                            onClick={() => {
                              if (!isBlurred) {
                                setSelectedCourse(course);
                                setShowInfoModal(true);
                              }
                            }}
                            className="bg-gray-100 text-gray-600 p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                            title="Vis informasjon"
                            disabled={isBlurred}
                          >
                            <Info size={16} />
                          </button>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 mb-1">
                          {foreignCode}
                        </p>
                        <p className="text-gray-700 mb-2">{foreignName}</p>
                        <p className="text-sm text-gray-600">{course.University}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Godkjent: {new Date(course.Behandlingsdato).toLocaleDateString('nb-NO')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Login Overlay for Blurred Items */}
                  {isBlurred && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 z-10">
                      <Link 
                        href="/auth/signin"
                        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 transform transition-transform hover:scale-105"
                      >
                        <Lock size={18} />
                        Logg inn for å se faget
                      </Link>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {filteredCourses.length > itemsPerPage && (
          <div className="mt-8 flex justify-center items-center gap-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Side {currentPage} av {totalPages}
              </span>
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Info Modal */}
      {showInfoModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowInfoModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <Info className="text-blue-600" size={24} />
                <h3 className="text-xl font-bold text-slate-900">Kursinformasjon</h3>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-800 text-lg">
                  {selectedCourse.Bologna_Fagnavn || selectedCourse.Foreign_Fagnavn}
                </h4>
                <p className="text-sm text-slate-500">
                  {selectedCourse.Bologna_Emnekode || selectedCourse.Foreign_Emnekode}
                </p>
                <p className="text-sm text-slate-600 mt-1">{selectedCourse.University}</p>
              </div>

              {!!(selectedCourse.Bologna_Emnekode || selectedCourse.Foreign_Emnekode) ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="text-blue-600" size={20} />
                    <span className="font-semibold text-blue-900">Verifisert kurs</span>
                  </div>
                  <p className="text-sm text-slate-700 mb-3">
                    Bekreftet gjennom NTNU sine wikisider for utveksling.
                  </p>
                  {selectedCourse.Wiki_URL && (
                    <a
                      href={selectedCourse.Wiki_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      {selectedCourse.Wiki_URL}
                    </a>
                  )}
                  {selectedCourse.Behandlingsdato && (
                    <p className="text-xs text-slate-500 mt-2">
                      Behandlingsdato: {new Date(selectedCourse.Behandlingsdato).toLocaleDateString('nb-NO')}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="text-amber-600" size={20} />
                    <span className="font-semibold text-amber-900">Brukerlagt kurs</span>
                  </div>
                  <p className="text-sm text-slate-700">
                    Lagt til av: <span className="font-medium">Ukjent bruker</span>
                  </p>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  <strong>Matcher NTNU-kurs:</strong> {selectedCourse.NTNU_Emnekode} - {selectedCourse.NTNU_Fagnavn}
                </p>
                <p className="text-xs text-green-700 mt-1">
                  <strong>ECTS:</strong> {selectedCourse.ECTS}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full mt-6 bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
            >
              Lukk
            </button>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowAddCourseModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2">
                <Plus className="text-blue-600" size={24} />
                <h3 className="text-2xl font-bold text-slate-900">Legg til godkjente kurs</h3>
              </div>
              <button
                onClick={() => setShowAddCourseModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <p className="text-sm text-gray-600">
                Bidra til fagbanken ved å dele kurs du har fått godkjent på utveksling!
              </p>

              {/* University Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Utvekslingsuniversitet <span className="text-red-500">*</span>
                </label>
                <select
                  value={exchangeUniversity}
                  onChange={(e) => setExchangeUniversity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  {EXCHANGE_UNIVERSITIES.map(uni => (
                    <option key={uni} value={uni}>{uni}</option>
                  ))}
                </select>
              </div>

              {/* Course Entries */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Fag</h4>

                <div className="space-y-6">
                  {courseEntries.map((entry, index) => (
                    <div key={entry.id} className="bg-gray-50 rounded-lg p-4 relative">
                      {/* Remove button (only show if more than 1 entry) */}
                      {courseEntries.length > 1 && (
                        <button
                          onClick={() => removeCourseEntry(entry.id)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Fjern fag"
                        >
                          <X size={20} />
                        </button>
                      )}

                      <div className="mb-3">
                        <span className="text-sm font-semibold text-gray-700">Fag {index + 1}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* NTNU Course Code */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            NTNU Emnekode <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="F.eks. TDT4120"
                            value={entry.ntnuEmnekode}
                            onChange={(e) => updateCourseEntry(entry.id, "ntnuEmnekode", e.target.value.toUpperCase())}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
                          />
                        </div>

                        {/* NTNU Course Name */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            NTNU Emnenavn
                          </label>
                          <input
                            type="text"
                            placeholder="F.eks. Algoritmer og datastrukturer"
                            value={entry.ntnuFagnavn}
                            onChange={(e) => updateCourseEntry(entry.id, "ntnuFagnavn", e.target.value.toUpperCase())}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
                          />
                        </div>

                        {/* Exchange Course Code */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Utvekslings Emnekode <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="F.eks. CS101"
                            value={entry.foreignEmnekode}
                            onChange={(e) => updateCourseEntry(entry.id, "foreignEmnekode", e.target.value.toUpperCase())}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
                          />
                        </div>

                        {/* Exchange Course Name */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Utvekslings Emnenavn
                          </label>
                          <input
                            type="text"
                            placeholder="F.eks. Algorithms and Data Structures"
                            value={entry.foreignFagnavn}
                            onChange={(e) => updateCourseEntry(entry.id, "foreignFagnavn", e.target.value.toUpperCase())}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
                          />
                        </div>

                        {/* Semester */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Semester
                          </label>
                          <select
                            value={entry.semester}
                            onChange={(e) => updateCourseEntry(entry.id, "semester", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
                          >
                            <option value="Høst">Høst</option>
                            <option value="Vår">Vår</option>
                          </select>
                        </div>

                        {/* ECTS */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Tilsvarende stp.
                          </label>
                          <input
                            type="text"
                            placeholder="F.eks. 7.5"
                            value={entry.ects}
                            onChange={(e) => {
                              const value = e.target.value;
                              const sanitizedValue = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                              updateCourseEntry(entry.id, "ects", sanitizedValue);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add More Button */}
                <button
                  onClick={addCourseEntry}
                  className="mt-4 w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Plus size={20} /> Legg til flere fag
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddCourseModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={handleAddCourse}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Send inn {courseEntries.length > 1 ? `${courseEntries.length} kurs` : "kurs"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
