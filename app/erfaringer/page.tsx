"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

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
}

export default function ErfaringerPage() {
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
  const [universityCoordinates, setUniversityCoordinates] = useState<
    Record<string, { country: string }>
  >({});

  // Form state for adding new experience
  const [formData, setFormData] = useState({
    university: "",
    country: "",
    study: "",
    studyYear: "",
    semester: "Høst",
    year: new Date().getFullYear().toString(),
    studentName: "",
    review: "",
    beerPrice: "",
    mealPrice: "",
    rentPrice: "",
    rating: 5,
    pros: [""],
    cons: [""],
  });

  useEffect(() => {
    // Check if there's a university filter in URL params
    const params = new URLSearchParams(window.location.search);
    const universityParam = params.get("university");
    if (universityParam) {
      setSelectedUniversity(universityParam);
    }

    // Load exchanges
    fetch("/extracted-data/all-exchanges.json")
      .then((res) => res.json())
      .then((data) => {
        // Only show exchanges with reviews
        const withReviews = data.filter((ex: Exchange) => ex.review);
        setExchanges(withReviews);
        setFilteredExchanges(withReviews);
      })
      .catch((err) => console.error("Failed to load exchanges:", err));

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

  // Generate year options for the form (current year and 10 years back)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Erfaringer fra utveksling
            </h1>
            <p className="text-lg text-gray-600">
              Les om andre studenters opplevelser fra utveksling over hele
              verden
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <Plus size={20} /> Legg til erfaring
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
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
        <div className="mb-4 text-gray-600">
          Viser {filteredExchanges.length} av {exchanges.length} erfaringer
        </div>

        {/* Experience Cards */}
        <div className="space-y-6">
          {filteredExchanges.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-lg">Ingen erfaringer funnet</p>
            </div>
          ) : (
            filteredExchanges.map((exchange) => (
              <div
                key={exchange.id}
                className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedExchange(exchange);
                  setCurrentImageIndex(0);
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                  {/* Image Section */}
                  <div className="relative h-64 md:h-auto">
                    {exchange.imageUrl ? (
                      <img
                        src={exchange.imageUrl}
                        alt={exchange.university}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
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
                        <span className="inline-flex items-center gap-1 text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                          <MapPin size={14} />
                          {exchange.country}
                        </span>
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
                              av {exchange.studentName}
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
              <div className="relative h-96 bg-gray-900">
                <img
                  src={selectedExchange.images[currentImageIndex]}
                  alt={`${selectedExchange.university} - Image ${
                    currentImageIndex + 1
                  }`}
                  className="w-full h-full object-cover"
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
              <div className="relative h-96">
                <img
                  src={selectedExchange.imageUrl}
                  alt={selectedExchange.university}
                  className="w-full h-full object-cover"
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
              <div className="relative h-96 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
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
                  <span className="inline-flex items-center gap-1 text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    <MapPin size={14} />
                    {selectedExchange.country}
                  </span>
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
                        av {selectedExchange.studentName}
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
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>

            {/* Header */}
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Legg til din erfaring
              </h2>
              <p className="text-gray-600">
                Del din utvekslingsopplevelse med andre studenter
              </p>
            </div>

            {/* Form */}
            <div className="p-8">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // Handle form submission
                  console.log("Form data:", formData);
                  setShowAddModal(false);
                }}
              >
                {/* University */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Universitet *
                  </label>
                  <select
                    required
                    value={formData.university}
                    onChange={(e) => {
                      const selectedUni = e.target.value;
                      const country =
                        universityCoordinates[selectedUni]?.country || "";
                      setFormData({
                        ...formData,
                        university: selectedUni,
                        country,
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Velg universitet</option>
                    {allUniversities.map((uni) => {
                      const country = universityCoordinates[uni]?.country || "";
                      return (
                        <option key={uni} value={uni}>
                          {country} - {uni}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Study */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Studie *
                  </label>
                  <select
                    required
                    value={formData.study}
                    onChange={(e) =>
                      setFormData({ ...formData, study: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Velg studie</option>
                    {studies.map((study) => (
                      <option key={study} value={study}>
                        {study}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year, Semester, and Study Year */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      År *
                    </label>
                    <select
                      required
                      value={formData.year}
                      onChange={(e) =>
                        setFormData({ ...formData, year: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    >
                      {yearOptions.map((year) => (
                        <option key={year} value={year.toString()}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Semester *
                    </label>
                    <select
                      required
                      value={formData.semester}
                      onChange={(e) =>
                        setFormData({ ...formData, semester: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    >
                      <option value="Høst">Høst</option>
                      <option value="Vår">Vår</option>
                      <option value="Høst + Vår">Høst + Vår</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Studieår *
                    </label>
                    <select
                      required
                      value={formData.studyYear}
                      onChange={(e) =>
                        setFormData({ ...formData, studyYear: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    >
                      <option value="">Velg år</option>
                      <option value="3">3. år</option>
                      <option value="4">4. år</option>
                      <option value="5">5. år</option>
                    </select>
                  </div>
                </div>

                {/* Student Name */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ditt navn *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studentName}
                    onChange={(e) =>
                      setFormData({ ...formData, studentName: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="F.eks. Maria L."
                  />
                </div>

                {/* Review */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Din erfaring *
                  </label>
                  <textarea
                    required
                    value={formData.review}
                    onChange={(e) =>
                      setFormData({ ...formData, review: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Fortell om din opplevelse fra utvekslingen..."
                  />
                </div>

                {/* Rating */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vurdering *
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating })}
                        className={`p-1 rounded-lg transition-colors ${
                          formData.rating >= rating
                            ? "text-yellow-500"
                            : "text-gray-300 hover:text-yellow-300"
                        }`}
                      >
                        <Star
                          className={`w-7 h-7 ${
                            formData.rating >= rating ? "fill-yellow-500" : ""
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pros (max 3) */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <ThumbsUp size={16} className="text-green-600" />
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
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                          placeholder={`Fordel ${index + 1}`}
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
                            className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
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
                        className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                      >
                        <Plus size={16} />
                        Legg til fordel
                      </button>
                    )}
                  </div>
                </div>

                {/* Cons (max 3) */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <ThumbsDown size={16} className="text-red-600" />
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
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                          placeholder={`Ulempe ${index + 1}`}
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
                            className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
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
                        className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <Plus size={16} />
                        Legg til ulempe
                      </button>
                    )}
                  </div>
                </div>

                {/* Price Information */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Prisestimat (valgfritt)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-2 flex items-center gap-1">
                        <Beer size={14} className="text-amber-600" />
                        Øl (0.5L)
                      </label>
                      <input
                        type="text"
                        value={formData.beerPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            beerPrice: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder="F.eks. 85 kr"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-2 flex items-center gap-1">
                        <UtensilsCrossed
                          size={14}
                          className="text-orange-600"
                        />
                        Måltid
                      </label>
                      <input
                        type="text"
                        value={formData.mealPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            mealPrice: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder="F.eks. 180 kr"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-2 flex items-center gap-1">
                        <Home size={14} className="text-purple-600" />
                        Husleie per måned
                      </label>
                      <input
                        type="text"
                        value={formData.rentPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rentPrice: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder="F.eks. 8500 kr/mnd"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Legg til erfaring
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
