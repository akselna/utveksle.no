'use client';

import { PopularDestination } from '../lib/types';
import DestinationCard from './DestinationCard';
import { useEffect, useState } from 'react';

interface HeroSectionProps {
  destinations: PopularDestination[];
}

export default function HeroSection({ destinations }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const index = Math.round(scrollPosition / windowHeight);
      setCurrentIndex(Math.min(index, destinations.length - 1));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [destinations.length]);

  return (
    <section className="relative">
      {destinations.map((destination, index) => (
        <DestinationCard
          key={`${destination.university}-${destination.country}`}
          destination={destination}
          index={index}
        />
      ))}
      
      {/* Progress dots indicator */}
      <div className="fixed right-4 sm:right-8 top-1/2 transform -translate-y-1/2 z-20 flex flex-col gap-3">
        {destinations.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              window.scrollTo({
                top: index * window.innerHeight,
                behavior: 'smooth',
              });
            }}
            className={`w-3 h-3 rounded-full transition-all ${
              currentIndex === index
                ? 'bg-white scale-125 shadow-lg'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Gå til destinasjon ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

