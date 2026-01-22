"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Course } from "@/types/course";
import {
  Search,
  Filter,
  X,
  Info,
  ShieldCheck,
  Plus,
  ChevronLeft,
  ChevronRight,
  Lock,
  Edit2,
  Trash2,
  Upload,
  FileText,
  AlertTriangle,
} from "lucide-react";
import UniversitySearchSelect from "@/components/UniversitySearchSelect";

export default function FagbankPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const isAdmin = session?.user?.role === "admin";

  // Data state
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // Filter options state
  const [filterOptions, setFilterOptions] = useState<{
    universities: string[];
    countries: string[];
    ects: number[];
    university_country_pairs: { university: string; country: string }[];
  }>({
    universities: [],
    countries: [],
    ects: [],
    university_country_pairs: [],
  });

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedECTS, setSelectedECTS] = useState<string>("all");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // UI state
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [isSubmittingCourse, setIsSubmittingCourse] = useState(false);

  // PDF Upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null);
  const [uploadedPdfDownloadUrl, setUploadedPdfDownloadUrl] = useState<
    string | null
  >(null);
  const [userUploadCount, setUserUploadCount] = useState<number>(0);
  const [checkingUploadLimit, setCheckingUploadLimit] = useState(false);

  // Edit course state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<{
    id: number;
    ntnuEmnekode: string;
    ntnuFagnavn: string;
    foreignEmnekode: string;
    foreignFagnavn: string;
    semester: string;
    ects: string;
  } | null>(null);

  // Add course form state
  const [exchangeUniversity, setExchangeUniversity] = useState("Ingen valgt");
  const [courseEntries, setCourseEntries] = useState(() => [
    {
      id: new Date().getTime(),
      ntnuEmnekode: "",
      ntnuFagnavn: "",
      foreignEmnekode: "",
      foreignFagnavn: "",
      semester: "Høst",
      ects: "",
    },
  ]);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeSearchField, setActiveSearchField] = useState<{
    id: number;
    field: "code" | "name";
  } | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Fetch filter options on mount
  useEffect(() => {
    async function fetchFilters() {
      try {
        const res = await fetch("/api/approved-courses/filters");
        if (res.ok) {
          const data = await res.json();
          setFilterOptions(data);
        }
      } catch (error) {
        console.error("Failed to fetch filter options", error);
      }
    }
    fetchFilters();
  }, []);

  // Fetch courses when filters change
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("page", pagination.page.toString());
        params.append("limit", pagination.limit.toString());
        if (searchQuery) params.append("search", searchQuery);
        if (selectedUniversity !== "all")
          params.append("university", selectedUniversity);
        if (selectedCountry !== "all")
          params.append("country", selectedCountry);
        if (selectedECTS !== "all") params.append("ects", selectedECTS);
        if (showVerifiedOnly) params.append("verified", "true");

        const res = await fetch(`/api/approved-courses?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setCourses(data.courses);
          setPagination((prev) => ({ ...prev, ...data.pagination }));
        }
      } catch (error) {
        console.error("Failed to fetch courses", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchCourses();
    }, 300); // Debounce

    return () => clearTimeout(timeoutId);
  }, [
    pagination.page,
    searchQuery,
    selectedUniversity,
    selectedCountry,
    selectedECTS,
    showVerifiedOnly,
  ]);

  // Reset page when filters change (except page itself)
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [
    searchQuery,
    selectedUniversity,
    selectedCountry,
    selectedECTS,
    showVerifiedOnly,
  ]);

  // Check upload limit when modal opens
  useEffect(() => {
    if (showUploadModal && session && !isAdmin) {
      checkUploadLimit();
    }
  }, [showUploadModal, session, isAdmin]);

  const performSearch = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `/api/ntnu-courses/search?q=${encodeURIComponent(query)}`
      );
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.courses);
      }
    } catch (error) {
      console.error("Failed to search courses", error);
    }
  };

  const handleInputChange = (id: number, field: string, value: string) => {
    updateCourseEntry(id, field, value);

    if (field === "ntnuEmnekode" || field === "ntnuFagnavn") {
      setActiveSearchField({
        id,
        field: field === "ntnuEmnekode" ? "code" : "name",
      });

      if (searchTimeout) clearTimeout(searchTimeout);
      const timeout = setTimeout(() => {
        performSearch(value);
      }, 300);
      setSearchTimeout(timeout);
    }
  };

  const selectSuggestion = (entryID: number, course: any) => {
    setCourseEntries((prev) =>
      prev.map((entry) => {
        if (entry.id === entryID) {
          return {
            ...entry,
            ntnuEmnekode: course.code,
            ntnuFagnavn: course.name,
            ects: course.credits ? String(course.credits) : entry.ects,
          };
        }
        return entry;
      })
    );
    setActiveSearchField(null);
    setSuggestions([]);
  };

  // Derived options for "Add Course" modal
  const EXCHANGE_UNIVERSITIES = useMemo(() => {
    return [
      "Ingen valgt",
      ...filterOptions.university_country_pairs.map(
        (pair) => `${pair.country} - ${pair.university}`
      ),
    ];
  }, [filterOptions.university_country_pairs]);

  // Prepare options for UniversitySearchSelect
  const universityOptions = useMemo(() => {
    return [
      { value: "Ingen valgt", label: "Ingen valgt" },
      ...filterOptions.university_country_pairs.map((pair) => ({
        value: `${pair.country} - ${pair.university}`,
        label: `${pair.country} - ${pair.university}`,
        country: pair.country,
        university: pair.university,
      })),
    ];
  }, [filterOptions.university_country_pairs]);

  const hasActiveFilters =
    searchQuery ||
    selectedUniversity !== "all" ||
    selectedCountry !== "all" ||
    selectedECTS !== "all" ||
    showVerifiedOnly;

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedUniversity("all");
    setSelectedCountry("all");
    setSelectedECTS("all");
    setShowVerifiedOnly(false);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Add new course entry
  const addCourseEntry = useCallback(() => {
    setCourseEntries((prev) => [
      ...prev,
      {
        id: Date.now(),
        ntnuEmnekode: "",
        ntnuFagnavn: "",
        foreignEmnekode: "",
        foreignFagnavn: "",
        semester: "Høst",
        ects: "",
      },
    ]);
  }, []);

  // Remove course entry
  const removeCourseEntry = useCallback((id: number) => {
    setCourseEntries((prev) => {
      if (prev.length > 1) {
        return prev.filter((entry) => entry.id !== id);
      }
      return prev;
    });
  }, []);

  // Update course entry - optimized with useCallback to prevent re-renders
  const updateCourseEntry = useCallback(
    (id: number, field: string, value: string) => {
      setCourseEntries((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, [field]: value } : entry
        )
      );
    },
    []
  );

  // Handle add course form submission
  const handleAddCourse = async () => {
    // Validate university selection
    if (exchangeUniversity === "Ingen valgt") {
      toast.warning("Vennligst velg et utvekslingsuniversitet");
      return;
    }

    // Validate that at least one course has required fields
    const validEntries = courseEntries.filter(
      (entry) => entry.ntnuEmnekode && entry.foreignEmnekode && entry.semester
    );

    if (validEntries.length === 0) {
      toast.warning(
        "Vennligst fyll ut minst ett fag med NTNU emnekode, utvekslings emnekode og semester"
      );
      return;
    }

    // Check if any entry is missing semester
    const entriesWithData = courseEntries.filter(
      (entry) => entry.ntnuEmnekode || entry.foreignEmnekode
    );
    const missingFields = entriesWithData.filter((entry) => !entry.semester);
    if (missingFields.length > 0) {
      toast.warning("Alle fag må ha semester valgt (Høst eller Vår)");
      return;
    }

    // Extract university and country from selection
    const [country, university] = exchangeUniversity.includes(" - ")
      ? exchangeUniversity.split(" - ")
      : ["", exchangeUniversity];

    // Send to backend/API
    setIsSubmittingCourse(true);
    try {
      const promises = validEntries.map((entry) =>
        fetch("/api/approved-courses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ntnu_course_code: entry.ntnuEmnekode,
            ntnu_course_name: entry.ntnuFagnavn,
            exchange_university: university,
            exchange_country: country,
            exchange_course_code: entry.foreignEmnekode,
            exchange_course_name: entry.foreignFagnavn,
            ects: entry.ects || "7.5",
            semester: entry.semester,
          }),
        })
      );

      const results = await Promise.all(promises);
      const errors: string[] = [];

      for (const res of results) {
        if (!res.ok) {
          const data = await res.json();
          errors.push(data.error || "Failed to save course");
        }
      }

      if (errors.length > 0) {
        toast.error(`Noen kurs ble ikke lagret:\n${errors.join("\n")}`);
      } else {
        toast.success(
          `${validEntries.length} kurs er sendt inn! De vil bli gjennomgått og lagt til i fagbanken.`
        );
      }

      // Refresh the current page (or go to page 1) to see the new course
      setPagination((prev) => ({ ...prev, page: 1 }));
      // Trigger a re-fetch by resetting to page 1 (already triggers effect)

      // Reset form and close modal
      setExchangeUniversity("Ingen valgt");
      setCourseEntries([
        {
          id: Date.now(),
          ntnuEmnekode: "",
          ntnuFagnavn: "",
          foreignEmnekode: "",
          foreignFagnavn: "",
          semester: "Høst",
          ects: "",
        },
      ]);
      setShowAddCourseModal(false);
    } catch (error) {
      console.error("Error submitting courses:", error);
      toast.error("En uventet feil oppstod. Prøv igjen senere.");
    } finally {
      setIsSubmittingCourse(false);
    }
  };

  const handleEditClick = (course: Course) => {
    if (!course.id) return;

    setEditingCourse({
      id: course.id,
      ntnuEmnekode: course.NTNU_Emnekode || "",
      ntnuFagnavn: course.NTNU_Fagnavn || "",
      foreignEmnekode: course.Bologna_Emnekode || course.Foreign_Emnekode || "",
      foreignFagnavn: course.Bologna_Fagnavn || course.Foreign_Fagnavn || "",
      semester:
        course.Semester && course.Semester !== "null" ? course.Semester : "",
      ects: course.ECTS || "",
    });
    setShowEditModal(true);
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse) return;

    try {
      const res = await fetch("/api/approved-courses", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingCourse.id,
          ntnu_course_code: editingCourse.ntnuEmnekode,
          ntnu_course_name: editingCourse.ntnuFagnavn,
          exchange_course_code: editingCourse.foreignEmnekode,
          exchange_course_name: editingCourse.foreignFagnavn,
          ects: editingCourse.ects,
          semester: editingCourse.semester,
        }),
      });

      if (res.ok) {
        toast.success("Kurset ble oppdatert!");
        setShowEditModal(false);
        setEditingCourse(null);
        // Refresh list
        setPagination((prev) => ({ ...prev, page: 1 }));
        window.location.reload();
      } else {
        const data = await res.json();
        toast.error(`Feil ved oppdatering: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error("En feil oppstod ved oppdatering.");
    }
  };

  const handleDeleteCourse = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCourse = async () => {
    if (!editingCourse) return;

    try {
      const res = await fetch(`/api/approved-courses?id=${editingCourse.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Kurset ble slettet.");
        setShowEditModal(false);
        setEditingCourse(null);
        setShowDeleteConfirm(false);
        window.location.reload();
      } else {
        const data = await res.json();
        toast.error(`Feil ved sletting: ${data.error}`);
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("En feil oppstod ved sletting.");
    }
  };

  const checkUploadLimit = async () => {
    if (!session || isAdmin) return; // Admins har ingen begrensning

    setCheckingUploadLimit(true);
    try {
      const res = await fetch("/api/upload-learning-agreement");
      if (res.ok) {
        const data = await res.json();
        setUserUploadCount(data.count);
      }
    } catch (error) {
      console.error("Error checking upload limit:", error);
    } finally {
      setCheckingUploadLimit(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-learning-agreement", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setUploadedPdfUrl(data.url);
        setUploadedPdfDownloadUrl(data.downloadUrl);
        setUserUploadCount((prev) => prev + 1);
        // Don't show alert here, we'll show it in the modal
      } else {
        toast.error(`Feil: ${data.error}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("En feil oppstod under opplasting");
    } finally {
      setUploadingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-16">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <div className="mb-6 md:mb-8">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-3 md:mb-4">
              Fagbank
            </h1>
            <p className="text-base md:text-lg text-gray-600">
              {loading ? (
                "Laster inn kurs..."
              ) : (
                <>Søk blant {pagination.total} godkjente utvekslingskurs</>
              )}
            </p>
          </div>

          {/* Action Buttons - Now inside the page container */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 md:mb-0">
            <button
              onClick={() => setShowUploadModal(true)}
              className="w-full sm:w-auto bg-primary text-white py-3 px-6 rounded-md font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
            >
              <Upload size={20} />
              <span className="hidden sm:inline">
                Last opp Learning Agreement
              </span>
              <span className="sm:hidden">Last opp LA</span>
            </button>
            <button
              onClick={() => setShowAddCourseModal(true)}
              className="w-full sm:w-auto bg-primary text-white py-3 px-6 rounded-md font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={20} /> Legg til kurs
            </button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 md:p-6 mb-6 md:mb-8">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Søk etter emnekode, emnenavn, universitet eller land..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none bg-white text-gray-900"
            />
          </div>

          {/* Filter Toggle Button */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
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
                    }}
                    className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                  />
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-gray-900" />
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
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
                  >
                    <option value="all">Alle land</option>
                    {filterOptions.countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                {/* University Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Universitet
                  </label>
                  <UniversitySearchSelect
                    options={[
                      { value: "all", label: "Alle universiteter" },
                      ...filterOptions.universities.map((uni) => ({
                        value: uni,
                        label: uni,
                      })),
                    ]}
                    value={selectedUniversity}
                    onChange={setSelectedUniversity}
                    placeholder="Søk etter universitet..."
                    className="w-full"
                  />
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
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
                  >
                    <option value="all">Alle studiepoeng</option>
                    {filterOptions.ects.map((ects) => (
                      <option key={ects} value={ects.toString()}>
                        {ects} ECTS
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-600">
          Viser{" "}
          {courses.length > 0
            ? (pagination.page - 1) * pagination.limit + 1
            : 0}
          -{Math.min(pagination.page * pagination.limit, pagination.total)} av{" "}
          {pagination.total} kurs
        </div>

        {/* Course List */}
        <div className="space-y-4">
          {courses.length === 0 && !loading ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-lg">
                Ingen kurs funnet med gjeldende filtre
              </p>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="mt-4 text-gray-700 hover:text-gray-900 font-medium"
                >
                  Tilbakestill filtre
                </button>
              )}
            </div>
          ) : (
            courses.map((course, index) => {
              const foreignCode =
                course.Bologna_Emnekode || course.Foreign_Emnekode;
              const foreignName =
                course.Bologna_Fagnavn || course.Foreign_Fagnavn;
              const isVerified = course.verified === true;

              // Use global index from the current display list (shuffled or original)
              const globalIndex =
                (pagination.page - 1) * pagination.limit + index;
              const isBlurred =
                !session && (!!hasActiveFilters || globalIndex >= 10);

              return (
                <div
                  key={`${course.NTNU_Emnekode}-${foreignCode}-${
                    course.id || index
                  }`}
                  className={`relative bg-white rounded-lg shadow-sm border border-gray-200 transition-all
                    ${
                      !isBlurred ? "hover:shadow-md" : "overflow-hidden group"
                    }`}
                >
                  <div
                    className={`relative p-4 sm:p-6 ${
                      isBlurred ? "blur-md select-none" : ""
                    }`}
                  >
                    {/* Top right badges and buttons - absolutely positioned */}
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1.5 sm:gap-2 items-center z-10">
                      {course.Semester && course.Semester !== "null" && (
                        <span className="inline-flex items-center justify-center text-[10px] sm:text-xs bg-slate-700 text-slate-100 px-2 sm:px-2.5 py-1 rounded-full font-medium h-6 sm:h-7">
                          {course.Semester}
                        </span>
                      )}
                      {isVerified && (
                        <span className="inline-flex items-center justify-center gap-1 text-[10px] sm:text-xs text-gray-700 font-medium bg-white/80 px-1.5 sm:px-2 py-1 rounded-full h-6 sm:h-7">
                          <ShieldCheck
                            size={12}
                            className="sm:w-[14px] sm:h-[14px] text-gray-900"
                          />
                          <span className="hidden sm:inline">Verifisert</span>
                        </span>
                      )}
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(course);
                          }}
                          className="bg-gray-100 text-gray-900 p-1.5 rounded-full hover:bg-gray-200 transition-colors w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center"
                          title="Rediger kurs"
                        >
                          <Edit2
                            size={12}
                            className="sm:w-[14px] sm:h-[14px]"
                          />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (!isBlurred) {
                            setSelectedCourse(course);
                            setShowInfoModal(true);
                          }
                        }}
                        className="bg-gray-100 text-gray-600 p-1.5 rounded-full hover:bg-gray-200 transition-colors w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center"
                        title="Vis informasjon"
                        disabled={isBlurred}
                      >
                        <Info size={12} className="sm:w-[14px] sm:h-[14px]" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      {/* NTNU Course */}
                      <div className="border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0 md:pr-6">
                        <h3 className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">
                          NTNU Kurs
                        </h3>
                        <p className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                          {course.NTNU_Emnekode}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {course.NTNU_Fagnavn}
                        </p>
                      </div>

                      {/* Exchange Course */}
                      <div className="relative">
                        <h3 className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">
                          Utvekslingskurs
                        </h3>
                        <p className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                          {foreignCode}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">
                          {foreignName}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 mb-2">
                          {course.University}, {course.Country}
                        </p>
                        <div className="flex items-end justify-between">
                          <span className="text-[10px] sm:text-xs text-gray-500">
                            {course.ECTS} ECTS
                          </span>
                          <span className="text-[10px] sm:text-xs text-gray-400">
                            {course.Wiki_URL ? "Godkjent" : "Lagt til"}{" "}
                            {course.Behandlingsdato
                              ? new Date(
                                  course.Behandlingsdato + "T12:00:00"
                                ).toLocaleDateString("nb-NO")
                              : "ukjent dato"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Login Overlay for Blurred Items */}
                  {isBlurred && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 z-10">
                      <Link
                        href="/auth/signin"
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-primary-hover transform transition-transform hover:scale-105"
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
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-4">
            <button
              onClick={() =>
                setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))
              }
              disabled={pagination.page === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Side {pagination.page} av {pagination.totalPages}
              </span>
            </div>

            <button
              onClick={() =>
                setPagination((p) => ({
                  ...p,
                  page: Math.min(p.totalPages, p.page + 1),
                }))
              }
              disabled={pagination.page === pagination.totalPages}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Info Modal */}
      {showInfoModal && selectedCourse && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowInfoModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <Info className="text-gray-900" size={24} />
                <h3 className="text-xl font-bold text-slate-900">
                  Kursinformasjon
                </h3>
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
                  {selectedCourse.Bologna_Fagnavn ||
                    selectedCourse.Foreign_Fagnavn}
                </h4>
                <p className="text-sm text-slate-500">
                  {selectedCourse.Bologna_Emnekode ||
                    selectedCourse.Foreign_Emnekode}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  {selectedCourse.University}
                </p>
              </div>

              {selectedCourse.verified === true ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="text-gray-900" size={20} />
                    <span className="font-semibold text-gray-900">
                      Verifisert erstatning
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 mb-3">
                    {selectedCourse.Wiki_URL
                      ? "Bekreftet gjennom NTNU sine wikisider for utveksling."
                      : "Verifisert av administrator"}
                  </p>
                  {selectedCourse.Wiki_URL && (
                    <a
                      href={selectedCourse.Wiki_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-900 hover:text-gray-700 underline break-all"
                    >
                      {selectedCourse.Wiki_URL}
                    </a>
                  )}
                  {selectedCourse.Behandlingsdato && (
                    <p className="text-xs text-slate-500 mt-2">
                      Behandlingsdato:{" "}
                      {new Date(
                        selectedCourse.Behandlingsdato
                      ).toLocaleDateString("nb-NO")}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="text-amber-600" size={20} />
                    <span className="font-semibold text-amber-900">
                      Brukerlagt kurs
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">
                    Lagt til av:{" "}
                    <span className="font-medium">Ukjent bruker</span>
                  </p>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  <strong>Matcher NTNU-kurs:</strong>{" "}
                  {selectedCourse.NTNU_Emnekode} - {selectedCourse.NTNU_Fagnavn}
                </p>
                <p className="text-xs text-green-700 mt-1">
                  <strong>ECTS:</strong> {selectedCourse.ECTS}
                </p>
                {selectedCourse.Semester &&
                  selectedCourse.Semester !== "null" && (
                    <p className="text-xs text-green-700 mt-1">
                      <strong>Semester:</strong> {selectedCourse.Semester}
                    </p>
                  )}
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full mt-6 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-hover transition-colors"
            >
              Lukk
            </button>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-20 sm:pt-24 overflow-y-auto"
          onClick={() => setShowAddCourseModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <Plus className="text-gray-900" size={24} />
                <h3 className="text-2xl font-bold text-slate-900">
                  Legg til godkjente kurs
                </h3>
              </div>
              <button
                onClick={() => setShowAddCourseModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <p className="text-sm text-gray-600">
                Bidra til fagbanken ved å dele kurs du har fått godkjent på
                utveksling!
              </p>

              {/* University Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Utvekslingsuniversitet <span className="text-red-500">*</span>
                </label>
                <UniversitySearchSelect
                  options={universityOptions}
                  value={exchangeUniversity}
                  onChange={setExchangeUniversity}
                  placeholder="Søk etter universitet, land eller by..."
                  className="w-full"
                  required
                />
              </div>

              {/* Course Entries */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Fag
                </h4>

                <div className="space-y-6">
                  {courseEntries.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="bg-gray-50 rounded-lg p-4 relative"
                    >
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
                        <span className="text-sm font-semibold text-gray-700">
                          Fag {index + 1}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        {/* NTNU Course Code */}
                        <div className="relative">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Emnekode (NTNU){" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="F.eks. TDT4120"
                            value={entry.ntnuEmnekode}
                            onChange={(e) =>
                              handleInputChange(
                                entry.id,
                                "ntnuEmnekode",
                                e.target.value.toUpperCase()
                              )
                            }
                            onFocus={() => {
                              if (entry.ntnuEmnekode.length >= 2) {
                                performSearch(entry.ntnuEmnekode);
                                setActiveSearchField({
                                  id: entry.id,
                                  field: "code",
                                });
                              }
                            }}
                            onBlur={() => {
                              setTimeout(() => setActiveSearchField(null), 200);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm text-gray-900"
                          />
                          {activeSearchField?.id === entry.id &&
                            activeSearchField?.field === "code" &&
                            suggestions.length > 0 && (
                              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                                {suggestions.map((s) => (
                                  <li
                                    key={s.code}
                                    onClick={() =>
                                      selectSuggestion(entry.id, s)
                                    }
                                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                                  >
                                    <div className="font-bold text-sm text-gray-900">
                                      {s.code}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {s.name}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                        </div>

                        {/* NTNU Course Name */}
                        <div className="relative">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Emnenavn (NTNU)
                          </label>
                          <input
                            type="text"
                            placeholder="F.eks. Algoritmer og datastrukturer"
                            value={entry.ntnuFagnavn}
                            onChange={(e) =>
                              handleInputChange(
                                entry.id,
                                "ntnuFagnavn",
                                e.target.value
                              )
                            }
                            onFocus={() => {
                              if (entry.ntnuFagnavn.length >= 2) {
                                performSearch(entry.ntnuFagnavn);
                                setActiveSearchField({
                                  id: entry.id,
                                  field: "name",
                                });
                              }
                            }}
                            onBlur={() => {
                              setTimeout(() => setActiveSearchField(null), 200);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm text-gray-900"
                          />
                          {activeSearchField?.id === entry.id &&
                            activeSearchField?.field === "name" &&
                            suggestions.length > 0 && (
                              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                                {suggestions.map((s) => (
                                  <li
                                    key={s.code}
                                    onClick={() =>
                                      selectSuggestion(entry.id, s)
                                    }
                                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                                  >
                                    <div className="font-bold text-sm text-gray-900">
                                      {s.name}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {s.code}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                        </div>

                        {/* Exchange Course Code */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Emnekode (utveksling){" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="F.eks. CS101"
                            value={entry.foreignEmnekode}
                            onChange={(e) =>
                              updateCourseEntry(
                                entry.id,
                                "foreignEmnekode",
                                e.target.value.toUpperCase()
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm text-gray-900"
                          />
                        </div>

                        {/* Exchange Course Name */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Emnenavn (utveksling)
                          </label>
                          <input
                            type="text"
                            placeholder="F.eks. Algorithms and Data Structures"
                            value={entry.foreignFagnavn}
                            onChange={(e) =>
                              updateCourseEntry(
                                entry.id,
                                "foreignFagnavn",
                                e.target.value.toUpperCase()
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm text-gray-900"
                          />
                        </div>

                        {/* Semester */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Semester <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={entry.semester}
                            onChange={(e) =>
                              updateCourseEntry(
                                entry.id,
                                "semester",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm text-gray-900"
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
                              const sanitizedValue = value
                                .replace(/[^0-9.]/g, "")
                                .replace(/(\..*)\./g, "$1");
                              updateCourseEntry(
                                entry.id,
                                "ects",
                                sanitizedValue
                              );
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm text-gray-900"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add More Button */}
                <button
                  onClick={addCourseEntry}
                  className="mt-4 w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Plus size={20} /> Legg til flere fag
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddCourseModal(false)}
                disabled={isSubmittingCourse}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Avbryt
              </button>
              <button
                onClick={handleAddCourse}
                disabled={isSubmittingCourse}
                className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmittingCourse ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sender inn...
                  </>
                ) : (
                  <>
                    Send inn{" "}
                    {courseEntries.length > 1
                      ? `${courseEntries.length} kurs`
                      : "kurs"}
                  </>
                )}
              </button>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Learning Agreement Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowUploadModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2">
                <Upload className="text-gray-900" size={24} />
                <h3 className="text-2xl font-bold text-slate-900">
                  Last opp Learning Agreement
                </h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {!isAdmin && userUploadCount >= 2 ? (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="text-orange-600" size={24} />
                    <span className="font-bold text-orange-900 text-lg">
                      Maksimalt antall nådd
                    </span>
                  </div>
                  <p className="text-sm text-orange-800">
                    Du har lastet opp maksimalt antall Learning Agreements (2
                    stk). Takk for dine bidrag!
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600">
                    Last opp ditt godkjente Learning Agreement (PDF-format, maks
                    10MB)
                    {!isAdmin && (
                      <span className="block mt-1 text-xs text-gray-500">
                        Du kan laste opp maks 2 Learning Agreements (
                        {userUploadCount}/2)
                      </span>
                    )}
                  </p>

                  {/* File Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfUpload}
                      disabled={uploadingPdf}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <label
                      htmlFor="pdf-upload"
                      className="cursor-pointer flex flex-col items-center gap-3"
                    >
                      <FileText className="text-gray-400" size={48} />
                      <div>
                        <p className="text-gray-700 font-medium">
                          {uploadingPdf
                            ? "Laster opp..."
                            : "Klikk for å velge fil"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF, maks 10MB
                        </p>
                      </div>
                    </label>
                  </div>

                  {uploadingPdf && (
                    <div className="flex items-center justify-center gap-2 text-gray-700">
                      <div className="w-5 h-5 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Laster opp...</span>
                    </div>
                  )}

                  {uploadedPdfUrl && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <ShieldCheck className="text-green-600" size={24} />
                        <span className="font-bold text-green-900 text-lg">
                          Takk for ditt bidrag!
                        </span>
                      </div>
                      <p className="text-sm text-green-800">
                        Din Learning Agreement er lastet opp og vil bli
                        gjennomgått av admin. Dette hjelper andre studenter med
                        å finne relevante utvekslingskurs!
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            <button
              onClick={() => {
                setShowUploadModal(false);
                setUploadedPdfUrl(null);
                setUploadedPdfDownloadUrl(null);
              }}
              className="w-full mt-6 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-hover transition-colors"
            >
              Lukk
            </button>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditModal && editingCourse && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2">
                <Edit2 className="text-gray-900" size={24} />
                <h3 className="text-2xl font-bold text-slate-900">
                  Rediger kurs
                </h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* NTNU Course Code */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Emnekode (NTNU)
                </label>
                <input
                  type="text"
                  value={editingCourse.ntnuEmnekode}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      ntnuEmnekode: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm text-gray-900"
                />
              </div>

              {/* NTNU Course Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Emnenavn (NTNU)
                </label>
                <input
                  type="text"
                  value={editingCourse.ntnuFagnavn}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      ntnuFagnavn: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm text-gray-900"
                />
              </div>

              {/* Exchange Course Code */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Emnekode (utveksling)
                </label>
                <input
                  type="text"
                  value={editingCourse.foreignEmnekode}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      foreignEmnekode: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm text-gray-900"
                />
              </div>

              {/* Exchange Course Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Emnenavn (utveksling)
                </label>
                <input
                  type="text"
                  value={editingCourse.foreignFagnavn}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      foreignFagnavn: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm text-gray-900"
                />
              </div>

              {/* Semester */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Semester
                </label>
                <select
                  value={editingCourse.semester}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      semester: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm text-gray-900"
                >
                  <option value="">Ikke spesifisert</option>
                  <option value="Høst">Høst</option>
                  <option value="Vår">Vår</option>
                </select>
              </div>

              {/* ECTS */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  ECTS
                </label>
                <input
                  type="text"
                  value={editingCourse.ects}
                  onChange={(e) => {
                    const value = e.target.value;
                    const sanitizedValue = value
                      .replace(/[^0-9.]/g, "")
                      .replace(/(\..*)\./g, "$1");
                    setEditingCourse({
                      ...editingCourse,
                      ects: sanitizedValue,
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm text-gray-900"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleDeleteCourse}
                className="px-4 bg-red-100 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-200 transition-colors flex items-center justify-center"
                title="Slett kurs"
              >
                <Trash2 size={20} />
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={handleUpdateCourse}
                className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-hover transition-colors"
              >
                Lagre endringer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Content */}
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Slett kurs
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Er du sikker på at du vil slette dette kurset? Dette kan ikke
              angres.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={confirmDeleteCourse}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                Slett
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
