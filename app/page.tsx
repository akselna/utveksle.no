'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import StatsCounter from '@/components/StatsCounter';

// Slideshow destinations (6 total)
const slideshowDestinations = [
  {
    id: 1,
    university: 'Università degli Studi di Bologna',
    country: 'Italia',
    image: 'https://images.unsplash.com/photo-1635469019177-7264fc1e013c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    exchanges: 12
  },
  {
    id: 2,
    university: 'The University of Queensland',
    country: 'Australia',
    image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1920&q=90&auto=format',
    exchanges: 8
  },
  {
    id: 3,
    university: 'University of California, Berkeley',
    country: 'USA',
    image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&q=90&auto=format',
    exchanges: 15
  },
  {
    id: 4,
    university: 'Instituto Superior Técnico',
    country: 'Portugal',
    image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1920&q=90&auto=format',
    exchanges: 10
  },
  {
    id: 5,
    university: 'Technische Universität München',
    country: 'Tyskland',
    image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1920&q=90&auto=format',
    exchanges: 9
  },
  {
    id: 6,
    university: 'Technische Universiteit Delft',
    country: 'Nederland',
    image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1920&q=90&auto=format',
    exchanges: 7
  }
];

// Featured destinations for grid (keep the original 3)
const featuredDestinations = [
  {
    id: 1,
    university: 'Università degli Studi di Bologna',
    country: 'Italia',
    image: 'https://images.unsplash.com/photo-1635469019177-7264fc1e013c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    exchanges: 12
  },
  {
    id: 2,
    university: 'The University of Queensland',
    country: 'Australia',
    image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1920&q=90&auto=format',
    exchanges: 8
  },
  {
    id: 3,
    university: 'University of California, Berkeley',
    country: 'USA',
    image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&q=90&auto=format',
    exchanges: 15
  }
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState({
    courses: 0,
    experiences: 0,
    users: 0,
  });

  // Auto-rotate destinations every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideshowDestinations.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Load stats
  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
        }
      })
      .catch((err) => console.error('Failed to load stats:', err));
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] md:min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
        {slideshowDestinations.map((dest, index) => (
          <div
            key={dest.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={dest.image}
              alt={`${dest.university}, ${dest.country}`}
              fill
              className="object-cover scale-110 md:scale-100"
              priority={index === 0}
              quality={90}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-light text-white mb-4 md:mb-6 tracking-tight">
            Utforsk utvekslingsmuligheter
          </h1>
          <p className="text-base md:text-xl lg:text-2xl text-white/90 mb-8 md:mb-12 font-light">
            Finn perfekt destinasjon for din utveksling ved NTNU
          </p>
          <Link
            href="/utforsk"
            className="inline-block px-6 py-3 md:px-8 md:py-4 bg-white text-gray-900 rounded-md text-base md:text-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Utforsk destinasjoner
          </Link>
        </div>

        {/* Navigation dots */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex gap-3">
          {slideshowDestinations.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Gå til destinasjon ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-12 md:py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-3 md:mb-4">
              Populære destinasjoner
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Utforsk de mest populære utvekslingsstedene for NTNU-studenter
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            {featuredDestinations.map((dest) => (
              <Link
                key={dest.id}
                href="/utforsk"
                className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100"
              >
                <Image
                  src={dest.image}
                  alt={`${dest.university}, ${dest.country}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  quality={85}
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="text-sm font-medium text-white/90 mb-1">
                    {dest.country}
                  </div>
                  <h3 className="text-xl font-semibold">
                    {dest.university}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <StatsCounter
        courses={stats.courses}
        experiences={stats.experiences}
        users={stats.users}
      />

      {/* CTA Section */}
      <section className="py-12 md:py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-4 md:mb-6">
            Klar til å starte?
          </h2>
          <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto">
            Begynn å planlegge din utveksling i dag
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/utforsk"
              className="px-8 py-4 bg-primary text-white rounded-md text-lg font-medium hover:bg-primary-hover transition-colors"
            >
              Utforsk destinasjoner
            </Link>
            <Link
              href="/fagplan"
              className="px-8 py-4 bg-white text-gray-900 border border-gray-300 rounded-md text-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Planlegg utveksling
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
