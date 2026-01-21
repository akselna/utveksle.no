"use client";

import Link from "next/link";
import {
  MapPin,
  BookOpen,
  FileText,
  Globe,
  CheckCircle,
  Users,
  Search,
  MessageCircle,
  ArrowRight,
  Calendar,
} from "lucide-react";

export default function SoknadsprosessPage() {
  const steps = [
    {
      number: 1,
      title: "Finn ut hvor du kan reise",
      icon: MapPin,
      description: "Utforsk mulige destinasjoner og vurder hva som passer deg",
      details: [
        "Sjekk hvilke partneruniversiteter som er tilgjengelige for ditt studieprogram",
        "Vurder språk, fagtilbud, semesterstruktur og land",
        "Les erfaringer fra tidligere studenter for å få innsikt i hva som venter deg",
      ],
      utveksleNo: {
        title: "Bruk utveksle.no til å utforske",
        items: [
          "Gå til Utforsk-siden for å se alle tilgjengelige destinasjoner på et interaktivt kart",
          "Se hvor mange studenter som har vært på utveksling ved hvert universitet",
          "Les erfaringer fra andre studenter for å få et realistisk bilde av hva som venter deg",
          "Se hvilke planlagte utvekslinger andre studenter har, og kontakt dem hvis du har spørsmål",
        ],
      },
    },
    {
      number: 2,
      title: "Søk forhåndsgodkjenning av emner",
      icon: BookOpen,
      description: "Sikre at emnene kan inngå i graden din",
      details: [
        "Velg emner ved vertsuniversitetet",
        "Søk om forhåndsgodkjenning i NTNU-systemet",
        "Sikrer at emnene kan inngå i graden din",
      ],
      utveksleNo: {
        title: "Finn godkjente fag på utveksle.no",
        items: [
          "Bruk Fagbanken for å søke etter allerede godkjente fag ved ditt valgte universitet",
          "Se hvilke NTNU-fag som kan erstattes med utvekslingsfag",
          "Sjekk ECTS-poeng, semester og behandlingsdato for hvert fag",
          "Bruk Min utveksling for å planlegge hvilke fag du vil ta og se om du oppfyller kravene",
        ],
      },
    },
    {
      number: 3,
      title: "Søk om utveksling via NTNU",
      icon: FileText,
      description: "Send inn din søknad i Mobility-Online",
      details: [
        "Send søknad i Mobility-Online",
        "Legg inn ønskede læresteder (prioritert rekkefølge)",
        {
          type: "nested",
          title: "Frister:",
          items: [
            "20. januar / 1. september (tidlige frister – enkelte land)",
            "1. februar (høst / helt år)",
            "12. september (kun vår)",
          ],
        },
      ],
      utveksleNo: {
        title: "Forbered deg med utveksle.no",
        items: [
          "Bruk planleggeren i Min utveksling for å ha en klar oversikt over hvilke fag du vil ta",
          "Se hvor andre studenter planlegger å søke for å få innsikt i populære destinasjoner",
          "Kontakt andre studenter som planlegger samme destinasjon for å dele erfaringer og tips",
        ],
      },
    },
    {
      number: 4,
      title: "Søk til det utenlandske lærestedet",
      icon: Globe,
      description: "Etter nominasjon fra NTNU",
      details: [
        "Etter nominasjon fra NTNU",
        "Du får instruksjoner om søknad direkte til vertsuniversitetet",
        {
          type: "nested",
          title: "Kan inkludere:",
          items: [
            "Karakterutskrift",
            "Språkkrav",
            "Motivasjonsbrev",
          ],
        },
      ],
      utveksleNo: {
        title: "Få hjelp fra andre studenter",
        items: [
          "Les erfaringer fra studenter som har vært på samme universitet",
          "Kontakt studenter som har planlagt utveksling samme sted for å få tips om søknadsprosessen",
          "Se hvilke fag andre har tatt ved samme universitet for inspirasjon",
        ],
      },
    },
    {
      number: 5,
      title: "Etter at du har søkt",
      icon: CheckCircle,
      description: "Forbered deg for avreise",
      details: [
        "Vent på endelig opptak fra vertsuniversitetet",
        {
          type: "nested",
          title: "Ordne:",
          items: [
            "Bolig",
            "Lånekassen",
            "Forsikring og visum (hvis aktuelt)",
            "Fullfør eventuelle siste godkjenninger hos NTNU",
          ],
        },
      ],
      utveksleNo: {
        title: "Del din erfaring",
        items: [
          "Etter utvekslingen, legg til din egen erfaring på Erfaringer-siden",
          "Hjelp fremtidige studenter ved å dele tips om bolig, levekostnader og studiemiljø",
          "Legg til nye godkjente fag i Fagbanken hvis du tok fag som ikke allerede er registrert",
        ],
      },
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-16">
        {/* Header */}
        <div className="mb-8 md:mb-12 text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-3 md:mb-4">
            Utvekslingssøknad ved NTNU
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            En steg-for-steg guide til hele utvekslingssøknadsprosessen, og hvordan
            utveksle.no kan hjelpe deg gjennom hvert steg
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8 md:space-y-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Step Header */}
                <div className="bg-gradient-to-r from-gray-50 to-white p-6 md:p-8 border-b border-gray-200">
                  <div className="flex items-start gap-4 md:gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg md:text-xl">
                        {step.number}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                        <h2 className="text-xl md:text-2xl lg:text-3xl font-light text-gray-900">
                          {step.title}
                        </h2>
                      </div>
                      <p className="text-sm md:text-base text-gray-600">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step Content */}
                <div className="p-6 md:p-8">
                  {/* Standard Details */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                      Hva du må gjøre:
                    </h3>
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => {
                        if (typeof detail === "object" && detail.type === "nested") {
                          return (
                            <li key={idx} className="text-gray-700">
                              <span className="font-medium">{detail.title}</span>
                              <ul className="mt-2 ml-4 space-y-1">
                                {detail.items.map((item: string, itemIdx: number) => (
                                  <li
                                    key={itemIdx}
                                    className="flex items-start gap-2"
                                  >
                                    <span className="text-primary mt-1.5">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </li>
                          );
                        }
                        return (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-gray-700"
                          >
                            <span className="text-primary mt-1.5">•</span>
                            <span>{typeof detail === 'string' ? detail : ''}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Utveksle.no Section */}
                  <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-4 md:p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Search className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                          {step.utveksleNo.title}
                        </h3>
                        <ul className="space-y-2">
                          {step.utveksleNo.items.map((item, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-sm md:text-base text-gray-700"
                            >
                              <ArrowRight className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-12 md:mt-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 md:p-8 border border-gray-200">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-3 md:mb-4">
              Klar til å starte?
            </h2>
            <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto">
              Bruk utveksle.no for å utforske destinasjoner, finne fag og planlegge
              din utveksling
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Link
                href="/utforsk"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-md font-medium hover:bg-primary-hover transition-colors"
              >
                <MapPin size={20} />
                Utforsk destinasjoner
              </Link>
              <Link
                href="/fagbank"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-900 border border-gray-300 rounded-md font-medium hover:bg-gray-50 transition-colors"
              >
                <BookOpen size={20} />
                Se fagbank
              </Link>
              <Link
                href="/fagplan"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-900 border border-gray-300 rounded-md font-medium hover:bg-gray-50 transition-colors"
              >
                <FileText size={20} />
                Planlegg utveksling
              </Link>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 md:mt-12 p-6 md:p-8 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start gap-4">
            <MessageCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-blue-900 mb-2">
                Trenger du hjelp?
              </h3>
              <p className="text-sm md:text-base text-blue-800 mb-4">
                Kontakt andre studenter som planlegger samme destinasjon, eller les
                erfaringer fra tidligere utvekslingsstudenter.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/erfaringer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <Users size={18} />
                  Se erfaringer
                </Link>
                <Link
                  href="/utforsk"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 border border-blue-300 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  <Search size={18} />
                  Kontakt andre studenter
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

