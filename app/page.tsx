'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const destinations = [
  {
    id: 1,
    university: 'Università degli Studi di Padova',
    country: 'Italia',
    image: '/padova.jpg',
    exchanges: 12
  },
  {
    id: 2,
    university: 'The University of Queensland',
    country: 'Australia',
    image: '/brisbane.jpg',
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

  // Auto-rotate destinations every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % destinations.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
        {destinations.map((dest, index) => (
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
              className="object-cover"
              priority={index === 0}
              quality={90}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-light text-white mb-6 tracking-tight">
            Utforsk utvekslingsmuligheter
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-12 font-light">
            Finn perfekt destinasjon for din utveksling ved NTNU
          </p>
          <Link
            href="/utforsk"
            className="inline-block px-8 py-4 bg-white text-gray-900 rounded-md text-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Utforsk destinasjoner
          </Link>
        </div>

        {/* Navigation dots */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10 flex gap-3">
          {destinations.map((_, index) => (
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

        {/* Auto-rotate destinations */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex flex-col items-center gap-2 text-white/70 text-sm">
            <span>Scroll</span>
            <svg
              className="w-5 h-5 animate-bounce"
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
      </section>

      {/* Destinations Grid */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              Populære destinasjoner
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Utforsk de mest populære utvekslingsstedene for NTNU-studenter
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {destinations.map((dest) => (
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
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="text-sm font-medium text-white/90 mb-1">
                    {dest.country}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {dest.university}
                  </h3>
                  <p className="text-sm text-white/80">
                    {dest.exchanges} utvekslinger
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">
            Klar til å starte?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Begynn å planlegge din utveksling i dag
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/utforsk"
              className="px-8 py-4 bg-gray-900 text-white rounded-md text-lg font-medium hover:bg-gray-800 transition-colors"
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
