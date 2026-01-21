"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import {
  Star,
  MapPin,
  Calendar,
  BookOpen,
  TrendingUp,
  Beer,
  UtensilsCrossed,
  Home,
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Plus,
  ThumbsUp,
  ThumbsDown,
  LogIn,
  Trash2,
  AlertTriangle,
  Edit,
  Save,
} from "lucide-react";
import UniversitySearchSelect from "@/components/UniversitySearchSelect";
import { STUDY_PROGRAMS } from "@/lib/study-programs";

interface Exchange {
  id: string;
  university: string;
  country: string;
  study: string;
  specialization?: string;
  studyYear: string;
  numSemesters: number;
  semester?: string;
  year: string;
  studentName?: string;
  review?: string;
  imageUrl?: string;
  images?: string[];
  beerPrice?: string;
  mealPrice?: string;
  rentPrice?: string;
  rating?: number;
  pros?: string[];
  cons?: string[];
  userId?: number;
}

export default function ErfaringerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [filteredExchanges, setFilteredExchanges] = useState<Exchange[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedUniversity, setSelectedUniversity] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(
    null
  );
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [experienceToDelete, setExperienceToDelete] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [experienceToEdit, setExperienceToEdit] = useState<Exchange | null>(null);
  const [editFormData, setEditFormData] = useState({
    review: "",
    rating: 5,
    pros: [""],
    cons: [""],
    beerPrice: "",
    mealPrice: "",
    rentPrice: "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [isLoadingExperiences, setIsLoadingExperiences] =
    useState<boolean>(true);
  const [universityCoordinates, setUniversityCoordinates] = useState<
    Record<string, { country: string; city?: string }>
  >({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Form state for adding new experience
  const [formData, setFormData] = useState({
    university: "",
    country: "",
    study: "Industriell økonomi",
    studyYear: "",
    semester: "Høst",
    year: new Date().getFullYear().toString(),
    studentName: "",
    isAnonymous: false, // New state for anonymity
    review: "",
    beerPrice: "",
    mealPrice: "",
    rentPrice: "",
    rating: 5,
    pros: [""],
    cons: [""],
  });

  // Load experiences from database
  const loadExperiences = async () => {
    try {
      // Try to load from cache first for instant display
      try {
        const cachedData = sessionStorage.getItem("cached_experiences_full");
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          console.log("Using cached experiences:", parsed.length);

          // Sort cached data
          const sorted = parsed.sort((a: Exchange, b: Exchange) => {
            const aIsOwn =
              session?.user?.id && a.userId === parseInt(session.user.id);
            const bIsOwn =
              session?.user?.id && b.userId === parseInt(session.user.id);
            if (aIsOwn && !bIsOwn) return -1;
            if (!aIsOwn && bIsOwn) return 1;
            return 0;
          });

          setExchanges(sorted);
          setFilteredExchanges(sorted);
          setIsLoadingExperiences(false); // Show content immediately
        }
      } catch (e) {
        console.error("Failed to load cached experiences:", e);
      }

      // Then fetch fresh data in background
      const res = await fetch("/api/experiences");
      const data = await res.json();

      if (data.success) {
        // Convert database experiences to Exchange format
        const dbExperiences: Exchange[] = data.experiences.map((exp: any) => {
          const userImages = Array.isArray(exp.images) ? exp.images : undefined;

          return {
            id: `db-${exp.id}`,
            university: exp.university_name,
            country: exp.country,
            study: exp.study_program,
            specialization: exp.specialization,
            studyYear: exp.study_year.toString(),
            numSemesters: exp.semester === "Høst + Vår" ? 2 : 1,
            semester: exp.semester,
            year: exp.year.toString(),
            studentName: exp.student_name,
            review: exp.review,
            rating: exp.rating,
            // PostgreSQL JSONB returns as objects, not strings
            pros: Array.isArray(exp.pros)
              ? exp.pros
              : exp.pros
              ? [exp.pros]
              : [],
            cons: Array.isArray(exp.cons)
              ? exp.cons
              : exp.cons
              ? [exp.cons]
              : [],
            beerPrice: exp.beer_price,
            mealPrice: exp.meal_price,
            rentPrice: exp.rent_price,
            imageUrl: exp.university_image_url, // Always use university image only
            images: userImages,
            userId: exp.user_id, // Store user_id for ownership check
          };
        });

        // Sort: User's own experiences first, then by date
        const sorted = dbExperiences.sort((a, b) => {
          const aIsOwn =
            session?.user?.id && a.userId === parseInt(session.user.id);
          const bIsOwn =
            session?.user?.id && b.userId === parseInt(session.user.id);

          if (aIsOwn && !bIsOwn) return -1;
          if (!aIsOwn && bIsOwn) return 1;
          return 0; // Keep original order for rest
        });

        console.log("Loaded experiences from database:", sorted);
        setExchanges(sorted);
        setFilteredExchanges(sorted);
        setIsLoadingExperiences(false);

        // Update cache for Erfaringer page (full data)
        try {
          sessionStorage.setItem(
            "cached_experiences_full",
            JSON.stringify(sorted)
          );
        } catch (e) {
          console.error("Failed to update full cache:", e);
        }

        // Update cache for MapChart (minimal data)
        try {
          const mapExchanges = dbExperiences.map((exp) => ({
            id: exp.id,
            university: exp.university,
            country: exp.country,
            study: exp.study,
            year: exp.year,
            numSemesters: exp.numSemesters,
          }));
          sessionStorage.setItem(
            "cached_experiences",
            JSON.stringify(mapExchanges)
          );
        } catch (e) {
          console.error("Failed to update map cache:", e);
        }
      }
    } catch (err) {
      console.error("Failed to load experiences:", err);
      setIsLoadingExperiences(false);
    }
  };

  useEffect(() => {
    // Check if there's a university filter in URL params
    const params = new URLSearchParams(window.location.search);
    const universityParam = params.get("university");
    if (universityParam) {
      setSelectedUniversity(universityParam);
    }

    // Load experiences from database
    loadExperiences();

    // Load university coordinates
    fetch("/extracted-data/university-coordinates.json")
      .then((res) => res.json())
      .then((data) => {
        setUniversityCoordinates(data);
      })
      .catch((err) =>
        console.error("Failed to load university coordinates:", err)
      );
  }, []);

  // Filter exchanges
  useEffect(() => {
    let filtered = exchanges;

    if (selectedCountry !== "all") {
      filtered = filtered.filter((ex) => ex.country === selectedCountry);
    }

    if (selectedYear !== "all") {
      filtered = filtered.filter((ex) => ex.year === selectedYear);
    }

    if (selectedUniversity !== "all") {
      filtered = filtered.filter((ex) => ex.university === selectedUniversity);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ex) =>
          ex.university.toLowerCase().includes(query) ||
          ex.country.toLowerCase().includes(query) ||
          ex.study.toLowerCase().includes(query) ||
          ex.review?.toLowerCase().includes(query)
      );
    }

    setFilteredExchanges(filtered);
    setCurrentPage(1);
  }, [
    selectedCountry,
    selectedYear,
    selectedUniversity,
    searchQuery,
    exchanges,
  ]);

  // Get unique countries, years, universities, and studies
  const countries = Array.from(
    new Set(exchanges.map((ex) => ex.country))
  ).sort();
  const years = Array.from(new Set(exchanges.map((ex) => ex.year)))
    .sort()
    .reverse();
  const universities = Array.from(
    new Set(exchanges.map((ex) => ex.university))
  ).sort();
  const studies = Array.from(new Set(exchanges.map((ex) => ex.study))).sort();

  // Get all universities from coordinates for the form, sorted by country then university name
  const allUniversities = Object.keys(universityCoordinates).sort((a, b) => {
    const countryA = universityCoordinates[a]?.country || "";
    const countryB = universityCoordinates[b]?.country || "";

    // First sort by country
    if (countryA !== countryB) {
      return countryA.localeCompare(countryB);
    }

    // If same country, sort by university name
    return a.localeCompare(b);
  });

  // Prepare options for UniversitySearchSelect
  const universityOptions = useMemo(() => {
    return [
      { value: "", label: "Velg universitet" },
      ...allUniversities.map((uni) => {
        const country = universityCoordinates[uni]?.country || "";
        const city = universityCoordinates[uni]?.city || "";
        return {
          value: uni,
          label: `${country} - ${uni}`,
          country: country,
          university: uni,
          city: city,
        };
      }),
    ];
  }, [allUniversities, universityCoordinates]);

  // Generate year options for the form (current year and 10 years back)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - i);

  // Delete experience
  const handleDeleteExperience = (experienceId: string) => {
    setExperienceToDelete(experienceId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteExperience = async () => {
    if (!experienceToDelete) return;

    try {
      const dbId = experienceToDelete.replace("db-", "");
      const res = await fetch(`/api/experiences?id=${dbId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete experience");
      }

      // Reload experiences
      await loadExperiences();
      toast.success("Erfaring slettet");
    } catch (error: any) {
      toast.error(`Kunne ikke slette erfaring: ${error.message}`);
    } finally {
      setShowDeleteConfirm(false);
      setExperienceToDelete(null);
    }
  };

  // Edit experience (admin only)
  const handleEditExperience = (exchange: Exchange) => {
    setExperienceToEdit(exchange);
    setEditFormData({
      review: exchange.review || "",
      rating: exchange.rating || 5,
      pros: exchange.pros && exchange.pros.length > 0 ? exchange.pros : [""],
      cons: exchange.cons && exchange.cons.length > 0 ? exchange.cons : [""],
      beerPrice: exchange.beerPrice?.replace(" kr", "") || "",
      mealPrice: exchange.mealPrice?.replace(" kr", "") || "",
      rentPrice: exchange.rentPrice?.replace(" kr", "") || "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!experienceToEdit) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const dbId = experienceToEdit.id.replace("db-", "");
      const response = await fetch(`/api/experiences?id=${dbId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          review: editFormData.review,
          rating: editFormData.rating,
          pros: editFormData.pros.filter((p) => p.trim() !== ""),
          cons: editFormData.cons.filter((c) => c.trim() !== ""),
          beer_price: editFormData.beerPrice ? `${editFormData.beerPrice} kr` : null,
          meal_price: editFormData.mealPrice ? `${editFormData.mealPrice} kr` : null,
          rent_price: editFormData.rentPrice ? `${editFormData.rentPrice} kr` : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update experience");
      }

      // Reload experiences
      await loadExperiences();
      toast.success("Erfaring oppdatert");
      setShowEditModal(false);
      setExperienceToEdit(null);
    } catch (error: any) {
      setSubmitError(error.message || "Kunne ikke oppdatere erfaring");
      toast.error(`Kunne ikke oppdatere erfaring: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredExchanges.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredExchanges.length);
  const paginatedExchanges = filteredExchanges.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-16">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <div className="mb-6 md:mb-8">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-3 md:mb-4">
              Erfaringer fra utveksling
            </h1>
            <p className="text-base md:text-lg text-gray-600">
              Les om andre studenters opplevelser fra utveksling over hele
              verden
            </p>
          </div>
          
          {/* Action Button - Now inside the page container */}
          <div className="mb-6 md:mb-0">
            <button
              onClick={() => {
                if (!session) {
                  setShowLoginPrompt(true);
                } else {
                  // Auto-fill study program from user profile
                  setFormData((prev) => ({
                    ...prev,
                    study: session.user?.study_program || "",
                    studentName: session.user?.name || "",
                    isAnonymous: false, // Reset anonymity
                  }));
                  setShowAddModal(true);
                }
              }}
              className="w-full sm:w-auto bg-primary text-white py-3 px-6 rounded-md font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={20} /> Legg til erfaring
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Søk
              </label>
              <input
                type="text"
                placeholder="Søk etter universitet, land..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none bg-white text-gray-900"
              />
            </div>

            {/* University Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Universitet
              </label>
              <select
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none bg-white text-gray-900"
              >
                <option value="all">Alle universiteter</option>
                {universities.map((university) => (
                  <option key={university} value={university}>
                    {university}
                  </option>
                ))}
              </select>
            </div>

            {/* Country Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Land
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none bg-white text-gray-900"
              >
                <option value="all">Alle land</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                År
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none bg-white text-gray-900"
              >
                <option value="all">Alle år</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        {!isLoadingExperiences && filteredExchanges.length > 0 && (
          <div className="mb-4 text-gray-600">
            Viser {startIndex + 1}-{endIndex} av {filteredExchanges.length} erfaringer
          </div>
        )}

        {/* Experience Cards */}
        <div className="space-y-6">
          {isLoadingExperiences ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                <p className="text-gray-600 text-lg font-medium">
                  Laster erfaringer...
                </p>
              </div>
            </div>
          ) : filteredExchanges.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-lg">Ingen erfaringer funnet</p>
            </div>
          ) : (
            paginatedExchanges.map((exchange) => (
              <div
                key={exchange.id}
                className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                  {/* Image Section */}
                  <div className="relative h-64 md:h-full md:min-h-[400px] overflow-hidden">
                    {exchange.imageUrl ? (
                      <img
                        src={exchange.imageUrl}
                        alt={exchange.university}
                        className="w-full h-full object-cover object-center"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-4xl font-bold">
                          {exchange.university.charAt(0)}
                        </span>
                      </div>
                    )}
                    {/* Rating Badge */}
                    {exchange.rating && (
                      <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-2 shadow-lg flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold text-gray-900">
                          {exchange.rating}/5
                        </span>
                      </div>
                    )}
                    {/* Image count badge */}
                    {exchange.images && exchange.images.length > 1 && (
                      <div className="absolute bottom-4 left-4 bg-black/70 text-white rounded-full px-3 py-1 text-sm flex items-center gap-1">
                        <ImageIcon className="w-4 h-4" />
                        {exchange.images.length}
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="md:col-span-2 p-6">
                    {/* Header */}
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {exchange.university}
                        </h2>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-sm bg-primary text-white px-3 py-1 rounded-full">
                            <MapPin size={14} />
                            {exchange.country}
                          </span>
                          {/* Admin actions */}
                          {session?.user?.role === "admin" && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditExperience(exchange);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Rediger erfaring (Admin)"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteExperience(exchange.id);
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Slett erfaring (Admin)"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          )}
                          {/* Delete button for own experiences (non-admin) */}
                          {session?.user?.id &&
                            session.user.role !== "admin" &&
                            exchange.userId === parseInt(session.user.id) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteExperience(exchange.id);
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Slett erfaring"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <BookOpen size={16} />
                          {exchange.study}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={16} />
                          {exchange.year}
                        </span>
                        {exchange.studentName && (
                          <span className="flex items-center gap-1">
                            <span className="font-medium">
                              av{" "}
                              {session?.user?.id &&
                              exchange.userId === parseInt(session.user.id)
                                ? "Deg"
                                : exchange.studentName}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Review Text */}
                    {exchange.review && (
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {exchange.review}
                      </p>
                    )}

                    {/* Pros and Cons */}
                    <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Pros */}
                      {exchange.pros && exchange.pros.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1">
                            <ThumbsUp size={14} />
                            Fordeler
                          </h4>
                          <div className="space-y-1">
                            {exchange.pros.map((pro, index) => (
                              <div
                                key={index}
                                className="text-xs bg-green-50 text-green-700 px-3 py-2 rounded-lg border border-green-200"
                              >
                                {pro}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Cons */}
                      {exchange.cons && exchange.cons.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-1">
                            <ThumbsDown size={14} />
                            Ulemper
                          </h4>
                          <div className="space-y-1">
                            {exchange.cons.map((con, index) => (
                              <div
                                key={index}
                                className="text-xs bg-red-50 text-red-700 px-3 py-2 rounded-lg border border-red-200"
                              >
                                {con}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Price Info */}
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Prisestimat
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        {exchange.beerPrice && (
                          <div className="flex items-center gap-2">
                            <div className="bg-amber-100 p-2 rounded-lg">
                              <Beer className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Øl (0.5L)</p>
                              <p className="font-semibold text-gray-900 text-sm">
                                {exchange.beerPrice}
                              </p>
                            </div>
                          </div>
                        )}
                        {exchange.mealPrice && (
                          <div className="flex items-center gap-2">
                            <div className="bg-orange-100 p-2 rounded-lg">
                              <UtensilsCrossed className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Måltid</p>
                              <p className="font-semibold text-gray-900 text-sm">
                                {exchange.mealPrice}
                              </p>
                            </div>
                          </div>
                        )}
                        {exchange.rentPrice && (
                          <div className="flex items-center gap-2">
                            <div className="bg-purple-100 p-2 rounded-lg">
                              <Home className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Husleie</p>
                              <p className="font-semibold text-gray-900 text-sm">
                                {exchange.rentPrice}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {!isLoadingExperiences && filteredExchanges.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Forrige side"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first, last, current, and adjacent pages
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-md font-medium transition-colors ${
                        currentPage === page
                          ? "bg-primary text-white"
                          : "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return <span key={page} className="px-1 text-gray-400">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Neste side"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedExchange && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedExchange(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedExchange(null)}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>

            {/* Image Gallery */}
            {selectedExchange.images && selectedExchange.images.length > 0 ? (
              <div className="relative h-96 bg-gray-900 overflow-hidden">
                <img
                  src={selectedExchange.images[currentImageIndex]}
                  alt={`${selectedExchange.university} - Image ${
                    currentImageIndex + 1
                  }`}
                  className="w-full h-full object-contain"
                />

                {/* Image Navigation */}
                {selectedExchange.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((prev) =>
                          prev === 0
                            ? selectedExchange.images!.length - 1
                            : prev - 1
                        );
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-900" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((prev) =>
                          prev === selectedExchange.images!.length - 1
                            ? 0
                            : prev + 1
                        );
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-900" />
                    </button>

                    {/* Image Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {selectedExchange.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(index);
                          }}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentImageIndex
                              ? "bg-white w-8"
                              : "bg-white/50 hover:bg-white/75"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Image Counter */}
                    <div className="absolute top-4 left-4 bg-black/70 text-white rounded-full px-3 py-1 text-sm">
                      {currentImageIndex + 1} / {selectedExchange.images.length}
                    </div>
                  </>
                )}

                {/* Rating Badge */}
                {selectedExchange.rating && (
                  <div className="absolute top-4 right-16 bg-white rounded-full px-3 py-2 shadow-lg flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-gray-900">
                      {selectedExchange.rating}/5
                    </span>
                  </div>
                )}
              </div>
            ) : selectedExchange.imageUrl ? (
              <div className="relative h-96 overflow-hidden">
                <img
                  src={selectedExchange.imageUrl}
                  alt={selectedExchange.university}
                  className="w-full h-full object-cover object-center"
                />
                {selectedExchange.rating && (
                  <div className="absolute top-4 right-16 bg-white rounded-full px-3 py-2 shadow-lg flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-gray-900">
                      {selectedExchange.rating}/5
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative h-96 bg-gradient-to-br from-gray-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-6xl font-bold">
                  {selectedExchange.university.charAt(0)}
                </span>
              </div>
            )}

            {/* Content */}
            <div className="p-8">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {selectedExchange.university}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-sm bg-primary text-white px-3 py-1 rounded-full">
                      <MapPin size={14} />
                      {selectedExchange.country}
                    </span>
                    {/* Admin actions */}
                    {session?.user?.role === "admin" && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            handleEditExperience(selectedExchange);
                            setSelectedExchange(null);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Rediger erfaring (Admin)"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={async () => {
                            await handleDeleteExperience(selectedExchange.id);
                            setSelectedExchange(null);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Slett erfaring (Admin)"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                    {/* Delete button for own experiences (non-admin) */}
                    {session?.user?.id &&
                      session.user.role !== "admin" &&
                      selectedExchange.userId === parseInt(session.user.id) && (
                        <button
                          onClick={async () => {
                            await handleDeleteExperience(selectedExchange.id);
                            setSelectedExchange(null);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Slett erfaring"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <BookOpen size={16} />
                    {selectedExchange.study}
                  </span>
                  {selectedExchange.specialization &&
                    selectedExchange.specialization !== "Ingen" && (
                      <span>• {selectedExchange.specialization}</span>
                    )}
                  <span className="flex items-center gap-1">
                    <Calendar size={16} />
                    {selectedExchange.year}
                  </span>
                  {selectedExchange.studentName && (
                    <span className="flex items-center gap-1">
                      <span className="font-medium">
                        av{" "}
                        {session?.user?.id &&
                        selectedExchange.userId === parseInt(session.user.id)
                          ? "Deg"
                          : selectedExchange.studentName}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Review Text */}
              {selectedExchange.review && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Erfaring
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-base">
                    {selectedExchange.review}
                  </p>
                </div>
              )}

              {/* Pros and Cons */}
              {((selectedExchange.pros && selectedExchange.pros.length > 0) ||
                (selectedExchange.cons &&
                  selectedExchange.cons.length > 0)) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Fordeler og ulemper
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pros */}
                    {selectedExchange.pros &&
                      selectedExchange.pros.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-1">
                            <ThumbsUp size={16} />
                            Fordeler
                          </h4>
                          <div className="space-y-2">
                            {selectedExchange.pros.map((pro, index) => (
                              <div
                                key={index}
                                className="text-sm bg-green-50 text-green-700 px-4 py-3 rounded-lg border border-green-200"
                              >
                                {pro}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    {/* Cons */}
                    {selectedExchange.cons &&
                      selectedExchange.cons.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-1">
                            <ThumbsDown size={16} />
                            Ulemper
                          </h4>
                          <div className="space-y-2">
                            {selectedExchange.cons.map((con, index) => (
                              <div
                                key={index}
                                className="text-sm bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200"
                              >
                                {con}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Price Info */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Prisestimat
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {selectedExchange.beerPrice && (
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-100 p-3 rounded-lg">
                        <Beer className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Øl (0.5L)</p>
                        <p className="font-bold text-gray-900 text-lg">
                          {selectedExchange.beerPrice}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedExchange.mealPrice && (
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <UtensilsCrossed className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Måltid</p>
                        <p className="font-bold text-gray-900 text-lg">
                          {selectedExchange.mealPrice}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedExchange.rentPrice && (
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <Home className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Husleie</p>
                        <p className="font-bold text-gray-900 text-lg">
                          {selectedExchange.rentPrice}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Study Details */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Studieinformasjon
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Studieår</p>
                    <p className="font-semibold text-gray-900">
                      {selectedExchange.studyYear}. år
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Semester</p>
                    <p className="font-semibold text-gray-900">
                      {selectedExchange.semester ||
                        `${selectedExchange.numSemesters} semester`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Experience Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-24 md:pt-28"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-5xl w-full max-h-[calc(95vh-6rem)] overflow-hidden shadow-2xl mt-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Sticky */}
            <div className="sticky top-0 bg-gradient-to-br from-gray-900 to-gray-800 px-4 sm:px-6 md:px-10 py-4 sm:py-5 md:py-7 z-10">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-3 sm:top-4 md:top-5 right-3 sm:right-4 md:right-5 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-2 sm:p-2.5 transition-all"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
                Del din erfaring
              </h2>
              <p className="text-gray-100 text-sm sm:text-base md:text-lg">
                Hjelp andre studenter ved å dele dine opplevelser fra utveksling
              </p>
            </div>

            {/* Form - Scrollable */}
            <div className="overflow-y-auto max-h-[calc(95vh-200px)] px-4 sm:px-6 md:px-10 py-4 sm:py-6 md:py-8">
              {submitError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {submitError}
                </div>
              )}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();

                  // Check if user is logged in
                  if (!session?.user) {
                    setSubmitError(
                      "Du må være logget inn for å legge til erfaringer."
                    );
                    setShowAddModal(false);
                    router.push("/auth/signin");
                    return;
                  }

                  setSubmitError("");
                  setIsSubmitting(true);

                  try {
                    // Find university_id from coordinates
                    const university_id = null; // We don't have this mapping yet, will add later

                    const studentNameToSend = formData.isAnonymous
                      ? "Anonym student"
                      : formData.studentName;

                    const response = await fetch("/api/experiences", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        university_id,
                        university_name: formData.university,
                        country: formData.country,
                        study_program: formData.study,
                        specialization: null,
                        study_year: parseInt(formData.studyYear),
                        semester: formData.semester,
                        year: parseInt(formData.year),
                        student_name: studentNameToSend,
                        review: formData.review,
                        rating: formData.rating,
                        pros: formData.pros,
                        cons: formData.cons,
                        beer_price: formData.beerPrice
                          ? `${formData.beerPrice} kr`
                          : null,
                        meal_price: formData.mealPrice
                          ? `${formData.mealPrice} kr`
                          : null,
                        rent_price: formData.rentPrice
                          ? `${formData.rentPrice} kr`
                          : null,
                      }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                      throw new Error(data.error || "Failed to add experience");
                    }

                    // Reset form
                    setFormData({
                      university: "",
                      country: "",
                      study: "Industriell økonomi",
                      studyYear: "",
                      semester: "Høst",
                      year: new Date().getFullYear().toString(),
                      studentName: "",
                      isAnonymous: false,
                      review: "",
                      beerPrice: "",
                      mealPrice: "",
                      rentPrice: "",
                      rating: 5,
                      pros: [""],
                      cons: [""],
                    });

                    // Reload experiences
                    await loadExperiences();

                    setShowAddModal(false);
                  } catch (error: any) {
                    setSubmitError(error.message);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                {/* Section: Grunnleggende informasjon */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-900" />
                    Grunnleggende informasjon
                  </h3>
                  <div className="space-y-4">
                    {/* University */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Universitet *
                      </label>
                      <UniversitySearchSelect
                        options={universityOptions}
                        value={formData.university}
                        onChange={(selectedUni) => {
                          const country =
                            universityCoordinates[selectedUni]?.country || "";
                          setFormData({
                            ...formData,
                            university: selectedUni,
                            country,
                          });
                        }}
                        placeholder="Søk etter universitet, land eller by..."
                        className="w-full"
                        required
                      />
                    </div>

                    {/* Study */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Studieprogram *
                      </label>
                      <UniversitySearchSelect
                        options={[
                          { value: "", label: "Velg studieprogram" },
                          ...STUDY_PROGRAMS.map((prog) => ({
                            value: prog.value,
                            label: prog.label,
                            country: prog.category,
                          })),
                        ]}
                        value={formData.study}
                        onChange={(value) =>
                          setFormData({ ...formData, study: value })
                        }
                        placeholder="Søk etter studieprogram..."
                        required
                        className="w-full"
                      />
                    </div>

                    {/* Year, Semester, and Study Year */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          År *
                        </label>
                        <select
                          required
                          value={formData.year}
                          onChange={(e) =>
                            setFormData({ ...formData, year: e.target.value })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none bg-white text-gray-900 transition-all"
                        >
                          {yearOptions.map((year) => (
                            <option key={year} value={year.toString()}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Semester *
                        </label>
                        <select
                          required
                          value={formData.semester}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              semester: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none bg-white text-gray-900 transition-all"
                        >
                          <option value="Høst">Høst</option>
                          <option value="Vår">Vår</option>
                          <option value="Høst + Vår">Høst + Vår</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Studieår *
                        </label>
                        <select
                          required
                          value={formData.studyYear}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              studyYear: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none bg-white text-gray-900 transition-all"
                        >
                          <option value="">Velg år</option>
                          <option value="3">3. år</option>
                          <option value="4">4. år</option>
                          <option value="5">5. år</option>
                        </select>
                      </div>
                    </div>

                    {/* Student Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ditt navn *
                      </label>
                      <input
                        type="text"
                        required={!formData.isAnonymous}
                        value={formData.studentName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            studentName: e.target.value,
                          })
                        }
                        disabled={formData.isAnonymous}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                        placeholder="F.eks. Maria L."
                      />
                    </div>

                    {/* Anonymity Checkbox */}
                    <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                      <input
                        type="checkbox"
                        id="isAnonymous"
                        checked={formData.isAnonymous}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            isAnonymous: e.target.checked,
                          });
                        }}
                        className="h-5 w-5 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                      />
                      <label
                        htmlFor="isAnonymous"
                        className="ml-3 block text-sm font-medium text-gray-900"
                      >
                        Vær anonym (vises som "Anonym student")
                      </label>
                    </div>
                  </div>
                </div>

                {/* Section: Din vurdering */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-gray-900" />
                    Din vurdering
                  </h3>
                  <div className="space-y-4">
                    {/* Rating */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Totalvurdering *
                      </label>
                      <div className="flex gap-2 p-4 bg-gray-50 rounded-xl justify-center">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => setFormData({ ...formData, rating })}
                            className={`p-2 rounded-xl transition-all ${
                              formData.rating >= rating
                                ? "text-yellow-500 scale-110"
                                : "text-gray-300 hover:text-yellow-300 hover:scale-105"
                            }`}
                          >
                            <Star
                              className={`w-10 h-10 ${
                                formData.rating >= rating
                                  ? "fill-yellow-500"
                                  : ""
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <p className="text-center text-sm text-gray-600 mt-2">
                        {formData.rating === 1 && "Veldig dårlig"}
                        {formData.rating === 2 && "Dårlig"}
                        {formData.rating === 3 && "Middels"}
                        {formData.rating === 4 && "Bra"}
                        {formData.rating === 5 && "Utmerket"}
                      </p>
                    </div>

                    {/* Review */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Beskriv din erfaring *
                      </label>
                      <textarea
                        required
                        value={formData.review}
                        onChange={(e) =>
                          setFormData({ ...formData, review: e.target.value })
                        }
                        rows={5}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none bg-white text-gray-900 transition-all resize-none"
                        placeholder="Fortell om din opplevelse fra utvekslingen. Hva var bra? Hva kunne vært bedre? Hva bør andre studenter vite?"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.review.length} tegn
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section: Fordeler og ulemper */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ThumbsUp className="w-5 h-5 text-gray-900" />
                    Fordeler og ulemper
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pros */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600">
                          <ThumbsUp size={14} />
                        </span>
                        Fordeler (valgfritt, maks 3)
                      </label>
                      <div className="space-y-2">
                        {formData.pros.map((pro, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={pro}
                              onChange={(e) => {
                                const newPros = [...formData.pros];
                                newPros[index] = e.target.value;
                                setFormData({ ...formData, pros: newPros });
                              }}
                              className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-900 text-sm transition-all"
                              placeholder={`F.eks. Flott studiemiljø`}
                            />
                            {formData.pros.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newPros = formData.pros.filter(
                                    (_, i) => i !== index
                                  );
                                  setFormData({ ...formData, pros: newPros });
                                }}
                                className="px-2 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        {formData.pros.length < 3 && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                pros: [...formData.pros, ""],
                              });
                            }}
                            className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1 px-2 py-1.5 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <Plus size={14} />
                            Legg til fordel
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Cons */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600">
                          <ThumbsDown size={14} />
                        </span>
                        Ulemper (valgfritt, maks 3)
                      </label>
                      <div className="space-y-2">
                        {formData.cons.map((con, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={con}
                              onChange={(e) => {
                                const newCons = [...formData.cons];
                                newCons[index] = e.target.value;
                                setFormData({ ...formData, cons: newCons });
                              }}
                              className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-gray-900 text-sm transition-all"
                              placeholder={`F.eks. Dyrt å bo`}
                            />
                            {formData.cons.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newCons = formData.cons.filter(
                                    (_, i) => i !== index
                                  );
                                  setFormData({ ...formData, cons: newCons });
                                }}
                                className="px-2 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        {formData.cons.length < 3 && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                cons: [...formData.cons, ""],
                              });
                            }}
                            className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 px-2 py-1.5 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Plus size={14} />
                            Legg til ulempe
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Prisestimat */}
                <div className="mb-8 pb-8 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-gray-900" />
                    Prisestimat (valgfritt)
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Hjelp andre studenter ved å oppgi omtrentlige priser i NOK
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-amber-50 rounded-xl p-4 border-2 border-amber-100">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Beer size={16} className="text-amber-600" />
                        Øl (0.5L på utested)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={formData.beerPrice}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              beerPrice: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white text-gray-900 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="85"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                          kr
                        </span>
                      </div>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-100">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <UtensilsCrossed
                          size={16}
                          className="text-orange-600"
                        />
                        Måltid (restaurant)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={formData.mealPrice}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              mealPrice: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white text-gray-900 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="180"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                          kr
                        </span>
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-100">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Home size={16} className="text-purple-600" />
                        Husleie per måned
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={formData.rentPrice}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              rentPrice: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white text-gray-900 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="8500"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                          kr
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button - Sticky at bottom */}
                <div className="sticky bottom-0 bg-white pt-6 pb-2 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setSubmitError("");
                    }}
                    disabled={isSubmitting}
                    className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl font-semibold hover:from-gray-800 hover:to-gray-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Lagrer...
                      </>
                    ) : (
                      <>
                        <Plus size={20} />
                        Publiser erfaring
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowLoginPrompt(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <LogIn className="w-8 h-8 text-gray-900" />
              </div>
            </div>

            {/* Content */}
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Logg inn for å dele din erfaring
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Du må være logget inn for å kunne legge til dine erfaringer fra
              utveksling.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={() => router.push("/auth/signin")}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
              >
                <LogIn size={18} />
                Logg inn
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
              Slett erfaring
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Er du sikker på at du vil slette denne erfaringen? Dette kan ikke angres.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setExperienceToDelete(null);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={confirmDeleteExperience}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                Slett
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Experience Modal (Admin only) */}
      {showEditModal && experienceToEdit && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-24 md:pt-28"
          onClick={() => {
            setShowEditModal(false);
            setExperienceToEdit(null);
          }}
        >
          <div
            className="bg-white rounded-3xl max-w-5xl w-full max-h-[calc(95vh-6rem)] overflow-hidden shadow-2xl mt-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-br from-blue-900 to-blue-800 px-4 sm:px-6 md:px-10 py-4 sm:py-5 md:py-7 z-10">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setExperienceToEdit(null);
                }}
                className="absolute top-3 sm:top-4 md:top-5 right-3 sm:right-4 md:right-5 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-2 sm:p-2.5 transition-all"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
                Rediger erfaring
              </h2>
              <p className="text-gray-100 text-sm sm:text-base md:text-lg">
                {experienceToEdit.university} - {experienceToEdit.country}
              </p>
    </div>

            {/* Form - Scrollable */}
            <div className="overflow-y-auto max-h-[calc(95vh-200px)] px-4 sm:px-6 md:px-10 py-4 sm:py-6 md:py-8">
              {submitError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {submitError}
                </div>
              )}

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Totalvurdering *
                </label>
                <div className="flex gap-2 p-4 bg-gray-50 rounded-xl justify-center">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() =>
                        setEditFormData({ ...editFormData, rating })
                      }
                      className={`p-2 rounded-xl transition-all ${
                        editFormData.rating >= rating
                          ? "text-yellow-500 scale-110"
                          : "text-gray-300 hover:text-yellow-300 hover:scale-105"
                      }`}
                    >
                      <Star
                        className={`w-10 h-10 ${
                          editFormData.rating >= rating ? "fill-yellow-500" : ""
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Beskrivelse *
                </label>
                <textarea
                  required
                  value={editFormData.review}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, review: e.target.value })
                  }
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none bg-white text-gray-900 transition-all resize-none"
                />
              </div>

              {/* Pros and Cons */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pros */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600">
                      <ThumbsUp size={14} />
                    </span>
                    Fordeler
                  </label>
                  <div className="space-y-2">
                    {editFormData.pros.map((pro, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={pro}
                          onChange={(e) => {
                            const newPros = [...editFormData.pros];
                            newPros[index] = e.target.value;
                            setEditFormData({ ...editFormData, pros: newPros });
                          }}
                          className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-900 text-sm"
                          placeholder={`Fordel ${index + 1}`}
                        />
                        {editFormData.pros.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newPros = editFormData.pros.filter(
                                (_, i) => i !== index
                              );
                              setEditFormData({
                                ...editFormData,
                                pros: newPros,
                              });
                            }}
                            className="px-2 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    {editFormData.pros.length < 3 && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditFormData({
                            ...editFormData,
                            pros: [...editFormData.pros, ""],
                          });
                        }}
                        className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                      >
                        <Plus size={14} />
                        Legg til fordel
                      </button>
                    )}
                  </div>
                </div>

                {/* Cons */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600">
                      <ThumbsDown size={14} />
                    </span>
                    Ulemper
                  </label>
                  <div className="space-y-2">
                    {editFormData.cons.map((con, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={con}
                          onChange={(e) => {
                            const newCons = [...editFormData.cons];
                            newCons[index] = e.target.value;
                            setEditFormData({ ...editFormData, cons: newCons });
                          }}
                          className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-gray-900 text-sm"
                          placeholder={`Ulempe ${index + 1}`}
                        />
                        {editFormData.cons.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newCons = editFormData.cons.filter(
                                (_, i) => i !== index
                              );
                              setEditFormData({
                                ...editFormData,
                                cons: newCons,
                              });
                            }}
                            className="px-2 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    {editFormData.cons.length < 3 && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditFormData({
                            ...editFormData,
                            cons: [...editFormData.cons, ""],
                          });
                        }}
                        className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                      >
                        <Plus size={14} />
                        Legg til ulempe
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Info */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-amber-50 rounded-xl p-4 border-2 border-amber-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Beer size={16} className="text-amber-600" />
                    Øl (0.5L)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={editFormData.beerPrice}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          beerPrice: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none bg-white text-gray-900"
                      placeholder="85"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                      kr
                    </span>
                  </div>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <UtensilsCrossed size={16} className="text-orange-600" />
                    Måltid
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={editFormData.mealPrice}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          mealPrice: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-white text-gray-900"
                      placeholder="180"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                      kr
                    </span>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Home size={16} className="text-purple-600" />
                    Husleie
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={editFormData.rentPrice}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          rentPrice: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white text-gray-900"
                      placeholder="8500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                      kr
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="sticky bottom-0 bg-white pt-6 pb-2 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setExperienceToEdit(null);
                    setSubmitError("");
                  }}
                  disabled={isSubmitting}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  Avbryt
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Lagrer...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Lagre endringer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
