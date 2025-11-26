"use client";

import { useState, useMemo } from "react";
import { Course } from "@/types/course";
import approvedCoursesData from "@/data/approved_courses.json";
import { Search, Filter, X } from "lucide-react";

export default function FagbankPage() {
  const courses: Course[] = approvedCoursesData as Course[];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedECTS, setSelectedECTS] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Get unique values for filters
  const universities = useMemo(() => {
    const uniqueUniversities = Array.from(new Set(courses.map(c => c.University))).sort();
    return uniqueUniversities;
  }, [courses]);

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

  // Filter and search courses
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
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

      return matchesSearch && matchesUniversity && matchesCountry && matchesECTS;
    });
  }, [courses, searchQuery, selectedUniversity, selectedCountry, selectedECTS]);

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedUniversity("all");
    setSelectedCountry("all");
    setSelectedECTS("all");
  };

  const hasActiveFilters = searchQuery || selectedUniversity !== "all" || selectedCountry !== "all" || selectedECTS !== "all";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Fagbank</h1>
          <p className="text-lg text-gray-600">
            Søk blant {courses.length} godkjente utvekslingskurs
          </p>
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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
              {/* Country Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Land
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  onChange={(e) => setSelectedECTS(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Alle studiepoeng</option>
                  {ectsOptions.map(ects => (
                    <option key={ects} value={ects}>{ects} ECTS</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-600">
          Viser {filteredCourses.length} av {courses.length} kurs
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
            filteredCourses.map((course, index) => {
              const foreignCode = course.Bologna_Emnekode || course.Foreign_Emnekode;
              const foreignName = course.Bologna_Fagnavn || course.Foreign_Fagnavn;

              return (
                <div
                  key={`${course.NTNU_Emnekode}-${foreignCode}-${index}`}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
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
                      <div className="mb-3">
                        <span className="inline-flex items-center gap-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded mb-2">
                          {course.Country}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-green-600 uppercase mb-2">
                        Utvekslingskurs
                      </h3>
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
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
