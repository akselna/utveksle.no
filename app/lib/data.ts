import { Exchange, PopularDestination, University, Country, Study } from './types';
import exchangesData from '../../extracted-data/all-exchanges.json';
import countriesData from '../../extracted-data/countries-list.json';
import universitiesByCountryData from '../../extracted-data/universities-by-country.json';

const exchanges = exchangesData as Exchange[];

// Count exchanges per university
function getExchangeCountByUniversity(): Map<string, number> {
  const counts = new Map<string, number>();
  exchanges.forEach((exchange) => {
    const current = counts.get(exchange.university) || 0;
    counts.set(exchange.university, current + 1);
  });
  return counts;
}

// Get popular destinations (top N by exchange count)
// Prioritizes Italy, Australia, and USA if available
export function getPopularDestinations(count: number = 3): PopularDestination[] {
  const exchangeCounts = getExchangeCountByUniversity();
  
  // Get unique university-country pairs with counts
  const universityMap = new Map<string, { country: string; count: number }>();
  
  exchanges.forEach((exchange) => {
    const key = `${exchange.university}|${exchange.country}`;
    if (!universityMap.has(key)) {
      universityMap.set(key, {
        country: exchange.country,
        count: exchangeCounts.get(exchange.university) || 0,
      });
    }
  });
  
  // Convert to array and sort by count
  const allDestinations: PopularDestination[] = Array.from(universityMap.entries())
    .map(([key, data]) => {
      const [university] = key.split('|');
      return {
        university,
        country: data.country,
        exchangeCount: data.count,
      };
    })
    .sort((a, b) => b.exchangeCount - a.exchangeCount);
  
  // Prioritize Italy, Australia, and USA
  const priorityCountries = ['Italy', 'Australia', 'USA'];
  const prioritized: PopularDestination[] = [];
  const others: PopularDestination[] = [];
  
  // First, collect one from each priority country
  priorityCountries.forEach((country) => {
    const found = allDestinations.find((d) => d.country === country);
    if (found && prioritized.length < count) {
      prioritized.push(found);
    }
  });
  
  // Fill remaining slots with top destinations not already included
  allDestinations.forEach((dest) => {
    if (!prioritized.some((p) => p.university === dest.university) && others.length < count - prioritized.length) {
      others.push(dest);
    }
  });
  
  // Combine and return
  const result = [...prioritized, ...others].slice(0, count);
  
  // If we don't have enough from priority countries, fill with top overall
  if (result.length < count) {
    const remaining = allDestinations
      .filter((d) => !result.some((r) => r.university === d.university))
      .slice(0, count - result.length);
    result.push(...remaining);
  }
  
  return result.slice(0, count);
}

// Get all unique universities
export function getAllUniversities(): University[] {
  const exchangeCounts = getExchangeCountByUniversity();
  const universityMap = new Map<string, { country: string; count: number }>();
  
  exchanges.forEach((exchange) => {
    if (!universityMap.has(exchange.university)) {
      universityMap.set(exchange.university, {
        country: exchange.country,
        count: exchangeCounts.get(exchange.university) || 0,
      });
    }
  });
  
  return Array.from(universityMap.entries()).map(([name, data]) => ({
    name,
    country: data.country,
    exchangeCount: data.count,
  }));
}

// Get all countries with statistics
export function getAllCountries(): Country[] {
  const countryMap = new Map<string, { universities: Set<string>; exchanges: number }>();
  
  exchanges.forEach((exchange) => {
    const existing = countryMap.get(exchange.country) || {
      universities: new Set<string>(),
      exchanges: 0,
    };
    existing.universities.add(exchange.university);
    existing.exchanges += 1;
    countryMap.set(exchange.country, existing);
  });
  
  return Array.from(countryMap.entries()).map(([name, data]) => ({
    name,
    universityCount: data.universities.size,
    exchangeCount: data.exchanges,
  })).sort((a, b) => b.exchangeCount - a.exchangeCount);
}

// Get all studies with statistics
export function getAllStudies(): Study[] {
  const studyMap = new Map<string, number>();
  
  exchanges.forEach((exchange) => {
    const current = studyMap.get(exchange.study) || 0;
    studyMap.set(exchange.study, current + 1);
  });
  
  return Array.from(studyMap.entries()).map(([name, exchangeCount]) => ({
    name,
    exchangeCount,
  })).sort((a, b) => b.exchangeCount - a.exchangeCount);
}

// Filter exchanges by criteria
export function filterExchanges(filters: {
  country?: string;
  university?: string;
  study?: string;
  searchQuery?: string;
}): Exchange[] {
  let filtered = [...exchanges];
  
  if (filters.country) {
    filtered = filtered.filter((e) => e.country === filters.country);
  }
  
  if (filters.university) {
    filtered = filtered.filter((e) => e.university === filters.university);
  }
  
  if (filters.study) {
    filtered = filtered.filter((e) => e.study === filters.study);
  }
  
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        (e.university?.toLowerCase() || '').includes(query) ||
        (e.country?.toLowerCase() || '').includes(query) ||
        (e.study?.toLowerCase() || '').includes(query)
    );
  }
  
  return filtered;
}

// Get exchanges for a specific university
export function getExchangesByUniversity(university: string): Exchange[] {
  return exchanges.filter((e) => e.university === university);
}

// Get unique universities for a country
export function getUniversitiesByCountry(country: string): string[] {
  return Array.from(
    new Set(
      exchanges
        .filter((e) => e.country === country)
        .map((e) => e.university)
    )
  );
}

export { exchanges };

