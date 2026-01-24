"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  BookOpen,
  FileText,
  Globe,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Search,
  Users,
  Calendar,
} from "lucide-react";
import { getUniversityImage } from "@/lib/university-images";

interface Destination {
  id: number;
  name: string;
  country: string;
  city: string;
  image_url?: string;
  review_count?: number;
}

export default function GuidePage() {
  const [currentStep, setCurrentStep] = useState(0); // 0 = intro, 1-5 = steps
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [topDestinations, setTopDestinations] = useState<Destination[]>([]);
  const [loadingDestinations, setLoadingDestinations] = useState(false);

  // Load top destinations when step 1 is reached
  useEffect(() => {
    if (currentStep === 1 && topDestinations.length === 0) {
      loadTopDestinations();
    }
  }, [currentStep]);

  const loadTopDestinations = async () => {
    setLoadingDestinations(true);
    try {
      const response = await fetch("/api/universities");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.universities) {
          // Sort by review count and take top 6
          const sorted = [...data.universities]
            .sort((a: any, b: any) => (b.review_count || 0) - (a.review_count || 0))
            .slice(0, 6);
          setTopDestinations(sorted);
        }
      }
    } catch (error) {
      console.error("Failed to load destinations:", error);
    } finally {
      setLoadingDestinations(false);
    }
  };

  const handleNextStep = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
      setIsTransitioning(false);
    }, 300);
  };

  const handleOpenFagbank = () => {
    window.open("/fagbank", "_blank");
  };

  const steps = [
    {
      id: 1,
      title: "Finn ut hvor du kan reise",
      icon: MapPin,
      description: "Utforsk mulige destinasjoner og vurder hva som passer deg",
    },
    {
      id: 2,
      title: "Søk forhåndsgodkjenning av emner",
      icon: BookOpen,
      description: "Finn og søk om godkjenning for fag ved vertsuniversitetet",
    },
    {
      id: 3,
      title: "Søk om utveksling via NTNU",
      icon: FileText,
      description: "Send inn din søknad i Mobility-Online",
    },
    {
      id: 4,
      title: "Søk til det utenlandske lærestedet",
      icon: Globe,
      description: "Etter nominasjon fra NTNU",
    },
    {
      id: 5,
      title: "Etter at du har søkt",
      icon: CheckCircle,
      description: "Forbered deg for avreise",
    },
  ];

  // Intro Screen
  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4">
        <div
          className={`max-w-3xl mx-auto text-center transition-all duration-500 ${
            isTransitioning ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0"
          }`}
        >
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-4">
              Utvekslingsguide
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-2">
              Ta deg gjennom hele utvekslingsprosessen steg for steg
            </p>
            <p className="text-base text-gray-500 max-w-xl mx-auto">
              Vi guider deg gjennom hele prosessen fra å finne destinasjon til
              du er klar for avreise
            </p>
          </div>

          <button
            onClick={handleNextStep}
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-lg font-medium text-lg hover:bg-primary-hover transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Kom i gang
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep - 1];
  const Icon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-16">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Steg {currentStep} av {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / steps.length) * 100)}% fullført
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div
          className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-500 ${
            isTransitioning
              ? "opacity-0 translate-x-8"
              : "opacity-100 translate-x-0"
          }`}
        >
          {/* Step Header */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-white p-6 md:p-8 border-b border-gray-200">
            <div className="flex items-start gap-4 md:gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center font-bold text-2xl">
                  {currentStep}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="w-7 h-7 text-primary" />
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-900">
                    {currentStepData.title}
                  </h2>
                </div>
                <p className="text-base md:text-lg text-gray-600">
                  {currentStepData.description}
                </p>
              </div>
            </div>
          </div>

          {/* Step Content Body */}
          <div className="p-6 md:p-8">
            {currentStep === 1 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Populære destinasjoner
                </h3>
                <p className="text-gray-600 mb-6">
                  Her er noen av de mest populære utvekslingsstedene for
                  NTNU-studenter:
                </p>

                {loadingDestinations ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {topDestinations.map((dest, index) => {
                      // Check if database image is from allowed source
                      const isAllowedSource = dest.image_url && (
                        dest.image_url.includes('images.unsplash.com') ||
                        dest.image_url.includes('source.unsplash.com')
                      );
                      
                      // Only use database image if it's from allowed source, otherwise use fallback
                      const imageUrl = getUniversityImage(
                        dest.name,
                        isAllowedSource ? dest.image_url : null
                      );
                      
                      return (
                        <div
                          key={dest.id}
                          className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100 border border-gray-200 hover:border-primary transition-all hover:shadow-lg"
                          style={{
                            animationDelay: `${index * 100}ms`,
                          }}
                        >
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={`${dest.name}, ${dest.country}`}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                              <MapPin className="w-12 h-12 text-primary/50" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <div className="text-sm font-medium text-white/90 mb-1">
                              {dest.country}
                            </div>
                            <h4 className="text-lg font-semibold mb-1">
                              {dest.name}
                            </h4>
                            {dest.review_count && dest.review_count > 0 && (
                              <div className="text-xs text-white/80 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {dest.review_count} erfaringer
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Tips:</strong> Gå til{" "}
                    <Link
                      href="/utforsk"
                      className="underline font-medium hover:text-blue-900"
                    >
                      Utforsk-siden
                    </Link>{" "}
                    for å se alle destinasjoner på et interaktivt kart og lese
                    erfaringer fra andre studenter.
                  </p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Finn godkjente fag
                </h3>
                <p className="text-gray-600 mb-6">
                  Før du søker om utveksling, må du finne ut hvilke fag som kan
                  godkjennes ved ditt valgte universitet. Bruk Fagbanken for å
                  søke etter allerede godkjente fag.
                </p>

                <div className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-xl p-8 text-center mb-6">
                  <BookOpen className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h4 className="text-2xl font-semibold text-gray-900 mb-2">
                    Utforsk Fagbanken
                  </h4>
                  <p className="text-gray-600 mb-6">
                    Se alle godkjente fag ved ulike universiteter og finn ut
                    hvilke NTNU-fag som kan erstattes
                  </p>
                  <button
                    onClick={handleOpenFagbank}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-all transform hover:scale-105 shadow-md"
                  >
                    <Search className="w-5 h-5" />
                    Åpne Fagbanken i ny fane
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-gray-700">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p>
                      Søk etter fag ved ditt valgte universitet i Fagbanken
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p>
                      Se hvilke NTNU-fag som kan erstattes med utvekslingsfag
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p>
                      Sjekk ECTS-poeng, semester og behandlingsdato for hvert
                      fag
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p>
                      Bruk{" "}
                      <Link
                        href="/fagplan"
                        className="text-primary underline hover:text-primary-hover"
                      >
                        Min utveksling
                      </Link>{" "}
                      for å planlegge hvilke fag du vil ta
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Send søknad i Mobility-Online
                </h3>
                <p className="text-gray-600 mb-6">
                  Når du har funnet destinasjon og planlagt fag, er det på
                  tide å søke om utveksling via NTNU.
                </p>

                <div className="space-y-4 mb-6">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          Send søknad i Mobility-Online
                        </h4>
                        <p className="text-sm text-gray-600">
                          Logg inn på Mobility-Online og fyll ut søknaden
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          Legg inn ønskede læresteder
                        </h4>
                        <p className="text-sm text-gray-600">
                          Prioriter rekkefølgen på destinasjonene du ønsker
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Viktige frister:
                        </h4>
                        <ul className="space-y-1 text-sm text-gray-700">
                          <li>• 20. januar / 1. september (tidlige frister – enkelte land)</li>
                          <li>• 1. februar (høst / helt år)</li>
                          <li>• 12. september (kun vår)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Tips:</strong> Bruk{" "}
                    <Link
                      href="/fagplan"
                      className="underline font-medium hover:text-blue-900"
                    >
                      planleggeren
                    </Link>{" "}
                    i Min utveksling for å ha en klar oversikt over hvilke fag du
                    vil ta før du søker.
                  </p>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Søk til vertsuniversitetet
                </h3>
                <p className="text-gray-600 mb-6">
                  Etter at NTNU har nominert deg, må du søke direkte til det
                  utenlandske lærestedet.
                </p>

                <div className="space-y-4 mb-6">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          Du får instruksjoner
                        </h4>
                        <p className="text-sm text-gray-600">
                          Etter nominasjon fra NTNU får du instruksjoner om
                          søknad direkte til vertsuniversitetet
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Søknaden kan inkludere:
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        Karakterutskrift
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        Språkkrav
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        Motivasjonsbrev
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Tips:</strong> Les{" "}
                    <Link
                      href="/erfaringer"
                      className="underline font-medium hover:text-blue-900"
                    >
                      erfaringer
                    </Link>{" "}
                    fra studenter som har vært på samme universitet for å få
                    tips om søknadsprosessen.
                  </p>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Forbered deg for avreise
                </h3>
                <p className="text-gray-600 mb-6">
                  Når du har fått endelig opptak, er det på tide å forberede
                  deg for avreise!
                </p>

                <div className="space-y-4 mb-6">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          Vent på endelig opptak
                        </h4>
                        <p className="text-sm text-gray-600">
                          Vertsuniversitetet sender deg endelig opptak når
                          søknaden er behandlet
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Ordne følgende:
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        Bolig
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        Lånekassen
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        Forsikring og visum (hvis aktuelt)
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        Fullfør eventuelle siste godkjenninger hos NTNU
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm text-gray-800">
                    <strong>Etter utvekslingen:</strong> Husk å legge til din
                    egen erfaring på{" "}
                    <Link
                      href="/erfaringer"
                      className="text-primary underline font-medium hover:text-primary-hover"
                    >
                      Erfaringer-siden
                    </Link>{" "}
                    for å hjelpe fremtidige studenter!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-4">
            {currentStep > 1 && (
              <button
                onClick={() => {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setCurrentStep((prev) => prev - 1);
                    setIsTransitioning(false);
                  }, 300);
                }}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Tilbake
              </button>
            )}
            <div className="flex-1" />
            {currentStep < steps.length ? (
              <button
                onClick={handleNextStep}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-all transform hover:scale-105"
              >
                Neste steg
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <Link
                href="/utforsk"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-all transform hover:scale-105"
              >
                Start utforskning
                <MapPin className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
