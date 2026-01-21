import { PopularDestination } from '../lib/types';
import Image from 'next/image';

interface DestinationCardProps {
  destination: PopularDestination;
  index: number;
}

/**
 * BILDEKONFIGURASJON
 * 
 * Spesialiserte bilder basert på universitet og by.
 * Systemet sjekker først universitet-navn, deretter by, og til slutt landet.
 * 
 * For å endre bilder:
 * 1. Universitet-spesifikke bilder: Legg til i `universityImages` objektet
 * 2. By-spesifikke bilder: Legg til i `cityImages` objektet  
 * 3. Land-spesifikke bilder: Legg til i `countryImages` objektet
 */
const getPlaceholderImage = (country: string, university?: string): string => {
  /**
   * FOKUS: Tre spesifikke bilder for hjemmesiden
   * 1. Padova, Italia - Historisk sentrum med arkitektur
   * 2. Brisbane, Australia - Moderne bylandskap med elv
   * 3. Berkeley, USA - UC Berkeley campus med San Francisco Bay
   */
  
  // University-specific images (most specific)
  const universityImages: Record<string, string> = {
    // Padova, Italia - Bilde av Stefano Segato (lokalt bilde)
    'Università degli Studi di Padova': '/padova.jpg',
    
    // Brisbane, Australia - Bilde av Delphine Ducaruge (lokalt bilde)
    'The University of Queensland': '/brisbane.jpg',
    
    // Berkeley, USA - UC Berkeley campus
    'University of California, Berkeley': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&q=90&auto=format',
  };
  
  // City-specific images (fallback - matches by city name in university)
  const cityImages: Record<string, string> = {
    'Padova': '/padova.jpg', // Lokalt bilde av Stefano Segato
    'Padua': '/padova.jpg', // Lokalt bilde av Stefano Segato
    'Brisbane': '/brisbane.jpg', // Lokalt bilde av Delphine Ducaruge
    'Berkeley': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&q=90&auto=format',
  };
  
  // Country-specific images (fallback)
  const countryImages: Record<string, string> = {
    USA: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&q=90&auto=format', // Berkeley/SF Bay
    Italy: '/padova.jpg', // Padova - lokalt bilde av Stefano Segato
    Australia: '/brisbane.jpg', // Brisbane - lokalt bilde av Delphine Ducaruge
  };
  
  // Check university first (most specific)
  if (university && universityImages[university]) {
    return universityImages[university];
  }
  
  // Check if university name contains city name
  if (university) {
    for (const [city, image] of Object.entries(cityImages)) {
      if (university.toLowerCase().includes(city.toLowerCase())) {
        return image;
      }
    }
  }
  
  // Fallback to country
  return countryImages[country] || 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=90&auto=format';
};

export default function DestinationCard({ destination, index }: DestinationCardProps) {
  const imageUrl = destination.imageUrl || getPlaceholderImage(destination.country, destination.university);
  
  return (
    <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imageUrl}
          alt={`${destination.university}, ${destination.country}`}
          fill
          className="object-cover"
          priority={index === 0}
          quality={90}
          sizes="100vw"
        />
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-8 max-w-5xl mx-auto animate-fade-in-up">
        <div className="mb-6">
          <span className="inline-block px-5 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-medium border border-white/20">
            {destination.country}
          </span>
        </div>
        
        <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight tracking-tight">
          {destination.university}
        </h2>
        
        <p className="text-xl sm:text-2xl md:text-3xl text-white/95 mb-10 font-light">
          {destination.exchangeCount} {destination.exchangeCount === 1 ? 'utveksling' : 'utvekslinger'} tilgjengelig
        </p>
        
        <button className="px-10 py-5 bg-white text-gray-900 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all shadow-2xl hover:shadow-white/20 hover:scale-105 active:scale-95">
          Utforsk destinasjonen
        </button>
      </div>
      
      {/* Scroll indicator */}
      {index < 2 && (
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <div className="flex flex-col items-center gap-2">
            <span className="text-white/80 text-sm font-medium">Scroll</span>
            <svg
              className="w-6 h-6 text-white/80"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

