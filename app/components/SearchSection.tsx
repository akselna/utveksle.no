'use client';

import { useState, useMemo, useEffect } from 'react';
import { Exchange, Country, Study } from '../lib/types';
import { filterExchanges, getAllCountries, getAllStudies } from '../lib/data';

interface SearchSectionProps {
  onFilterChange?: (exchanges: Exchange[]) => void;
}

export default function SearchSection({ onFilterChange }: SearchSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedStudy, setSelectedStudy] = useState<string>('');

  const countries = getAllCountries();
  const studies = getAllStudies();

  const filteredExchanges = useMemo(() => {
    return filterExchanges({
      searchQuery: searchQuery || undefined,
      country: selectedCountry || undefined,
      study: selectedStudy || undefined,
    });
  }, [searchQuery, selectedCountry, selectedStudy]);

  // Use useEffect to call onFilterChange after render, not during
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filteredExchanges);
    }
  }, [filteredExchanges, onFilterChange]);

  return (
    <div className="bg-white py-16 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Utforsk utvekslingsmuligheter
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Finn perfekt utvekslingssted basert på ditt studieprogram, destinasjon eller universitet
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 mb-12 shadow-lg border border-gray-200/50">
          {/* Search Bar */}
          <div className="mb-8">
            <label htmlFor="search" className="block text-base font-semibold text-gray-800 mb-3">
              Søk etter universitet, land eller studieretning
            </label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="F.eks. MIT, USA, Datateknologi..."
              className="w-full px-6 py-4 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-lg bg-white shadow-sm"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Country Filter */}
            <div>
              <label htmlFor="country" className="block text-base font-semibold text-gray-800 mb-3">
                Land
              </label>
              <select
                id="country"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-6 py-4 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none bg-white shadow-sm text-lg"
              >
                <option value="">Alle land</option>
                {countries.map((country) => (
                  <option key={country.name} value={country.name}>
                    {country.name} ({country.exchangeCount})
                  </option>
                ))}
              </select>
            </div>

            {/* Study Filter */}
            <div>
              <label htmlFor="study" className="block text-base font-semibold text-gray-800 mb-3">
                Studieretning
              </label>
              <select
                id="study"
                value={selectedStudy}
                onChange={(e) => setSelectedStudy(e.target.value)}
                className="w-full px-6 py-4 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none bg-white shadow-sm text-lg"
              >
                <option value="">Alle studieretninger</option>
                {studies.map((study) => (
                  <option key={study.name} value={study.name}>
                    {study.name} ({study.exchangeCount})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-8 pt-8 border-t-2 border-gray-300/50">
            <p className="text-lg text-gray-700">
              Viser <span className="font-bold text-gray-900 text-xl">{filteredExchanges.length}</span>{' '}
              {filteredExchanges.length === 1 ? 'utveksling' : 'utvekslinger'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

