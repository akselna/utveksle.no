"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  X,
  CheckCircle,
  Search,
  ArrowRight,
  Trash2,
  BookOpen,
  ArrowLeft,
  Save,
  MapPin,
  School,
  GraduationCap,
  Calendar,
  Info,
  ShieldCheck,
  AlertTriangle,
  Share2,
  ArrowLeftRight,
  AlertCircle,
  Users,
  Loader2,
} from "lucide-react";
import UniversitySearchSelect from "@/components/UniversitySearchSelect";
import { STUDY_PROGRAMS } from "@/lib/study-programs";
import {
  saveExchangePlan,
  updateExchangePlan,
  getUserPlans,
  deletePlan,
} from "@/lib/exchange-plans";

// --- TYPER ---
type Subject = {
  id: string;
  code: string;
  name: string;
  credits: number;
  matchedWith: AbroadSubject[];
  isElective?: boolean; // Om faget er valgfritt
  electiveGroup?: string; // Gruppe for valgfrie fag (velg ett av gruppen)
  isSelected?: boolean; // Om valgfrie fag er valgt av bruker (default: true for obligatoriske)
};

type AbroadSubject = {
  id: string;
  code: string;
  name: string;
  university: string;
  country: string;
  matchesHomeSubjectCode?: string;
  ects?: string;
  behandlingsdato?: string;
  isVerified?: boolean;
  wikiUrl?: string;
  addedBy?: string;
  semester?: string;
};

type ExchangePlan = {
  id: string;
  planName?: string; // Custom name for the plan
  university: string; // Home university
  exchangeUniversity: string; // New field for exchange university
  program: string;
  technologyDirection?: string; // Teknologiretning (for Indøk)
  specialization?: string; // Spesialisering
  studyYear: number;
  semesterChoice: string;
  subjects: Subject[];
};

// --- DATA ---
// Teknologiretninger for Indøk
const TECHNOLOGY_DIRECTIONS: Record<string, string[]> = {
  Indøk: [
    "Ingen retning",
    "Datateknologi",
    "Maskin- og energiteknikk",
    "Energi og miljø",
    "Marin teknikk",
  ],
};

// Spesialiseringer (Fagretninger) per studieprogram/teknologiretning
const SPECIALIZATIONS: Record<string, string[]> = {
  Datateknologi: [
    "Ingen fagretning",
    "Databaser og søk",
    "Kunstig intelligens",
    "Programvaresystemer",
    "Visuell databehandling",
    "Effektive datasystemer",
  ],
  Kybernetikk: [
    "Ingen fagretning",
    "Prosessregulering",
    "Styring av smarte nett og fornybar energi",
    "Havbiokybernetikk",
    "Biomedisinsk kybernetikk",
    "Medisinsk billeddannelse",
    "Innvevde datasystemer",
  ],
  Indøk_Datateknologi: [
    "Ingen fagretning",
    "Kunstig intelligens",
    "Programvaresystemer",
  ],
  "Indøk_Maskin- og energiteknikk": [
    "Ingen fagretning",
    "Ledelse og systemfag",
    "Energi- og prosessteknikk",
  ],
  "Indøk_Energi og miljø": [
    "Ingen fagretning",
    "Energi- og prosessteknikk",
    "Elektrisk energiteknikk og smarte nett",
  ],
  "Indøk_Marin teknikk": [
    "Ingen fagretning",
    "Marin prosjektering og logistikk",
  ],
  "Økonomi og administrasjon": [
    "Ingen fagretning",
    "Markedføring",
    "Organisasjon og endring",
    "Regnskap",
    "Samfunnsøkonomi",
    "Økonomistyring",
    "Business Analytics",
    "Finansiell styring",
  ],
  "Maskin- og energiteknologi": [
    "Ingen fagretning",
    "Energi og klima i bygninger",
    "Energisystemer",
    "Miljøanalyse for maskin og energiteknologi",
    "Termo og fluiddynamikk",
  ],
};

const COMMON_COMPLEMENTARY_COURSES = [
  { code: "AAR4250", name: "Arkitektur som teknologisk praksis" },
  { code: "FI3107", name: "Bioteknologi og etikk" },
  { code: "FY3201", name: "Atmosfærefysikk og klimaendringer" },
  { code: "HIST3500", name: "Miljø- og bærekraftshistorie" },
  { code: "IØ1003", name: "Ledelse i frivillige organisasjoner" },
  { code: "KULT3025", name: "Bærekraft og samfunnsmessig transformasjon" },
  { code: "MFEL3010", name: "Medisin for realfag- og teknologistudenter" },
  { code: "SPRÅK3501", name: "Vitenskapelig kommunikasjon for ingeniører" },
  { code: "SØK1151", name: "Makroøkonomi for ledere" },
  { code: "SØK2012", name: "Adferdsøkonomi" },
  { code: "TEP4223", name: "Livsløpsvurdering" },
  { code: "TEP4285", name: "Materialstrømanalyse (MFA1)" },
  { code: "TEP4400", name: "Kjerneenergi" },
  {
    code: "TIØ4120",
    name: "Optimering og kvantitativ analyse for beslutningstaking",
  },
  { code: "TIØ4146", name: "Finans for teknisk-naturvitenskapelige studenter" },
  { code: "TIØ4201", name: "Samfunnssikkerhet og risikohåndtering" },
  { code: "TIØ4215", name: "Kontraktsrett og kontraktsforhandlinger" },
  { code: "TIØ4295", name: "Bedriftsøkonomi" },
  { code: "TMM4220", name: "Innovasjon ved Design Thinking" },
  { code: "TPD4114", name: "Visuell formidling" },
  { code: "TPK4120", name: "Industriell sikkerhet og pålitelighet" },
  { code: "TPK5100", name: "Praktisk prosjektledelse" },
  { code: "TSOL425", name: "Teamledelse og teknologi" },
  { code: "TTM4165", name: "Digital økonomi" },
];

const COMMON_ENGINEERING_COURSES = [
  { code: "MEDT4165", name: "Signalbehandling i ultralyd-avbildning" },
  { code: "TET4120", name: "Elektriske motordrifter" },
  { code: "TFY4220", name: "Faste stoffers fysikk" },
  { code: "TTK4130", name: "Modellering og simulering" },
  { code: "TTK4135", name: "Optimalisering og regulering" },
  { code: "TTK4175", name: "Instrumenteringssystemer og sikkerhet" },
  { code: "TTM4115", name: "Design av kommuniserende systemer" },
  { code: "TTM4135", name: "Anvendt kryptografi og nettverksikkerhet" },
];

// Mock data som simulerer API-kall basert på studie, år og spesialisering
type StudyPlanKey = string; // Format: "Program_TechDir_Year_Semester_Specialization"
const MOCK_STUDY_PLANS: Record<StudyPlanKey, Subject[]> = {
  // === INDØK - DATATEKNOLOGI - KUNSTIG INTELLIGENS ===

  // 1. år Høst
  Indøk_Datateknologi_1_Høst_default: [
    {
      id: "i1h1",
      code: "EXPH0300",
      name: "Examen philosophicum for naturvitenskap og teknologi",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "i1h2",
      code: "TDT4109",
      name: "Informasjonsteknologi, grunnkurs",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "i1h3",
      code: "TMA4100",
      name: "Matematikk 1",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "i1h4",
      code: "TMA4140",
      name: "Diskret matematikk",
      credits: 7.5,
      matchedWith: [],
    },
  ],

  // 1. år Vår
  Indøk_Datateknologi_1_Vår_default: [
    {
      id: "i1v1",
      code: "TDT4100",
      name: "Objektorientert programmering",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "i1v2",
      code: "TIØ4101",
      name: "Organisasjonsteori og selskapsrett",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "i1v3",
      code: "TMA4115",
      name: "Matematikk 3",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "i1v4",
      code: "TTM4100",
      name: "Kommunikasjon - Tjenester og nett",
      credits: 7.5,
      matchedWith: [],
    },
  ],

  // 2. år Høst
  Indøk_Datateknologi_2_Høst_default: [
    {
      id: "i2h1",
      code: "TDT4120",
      name: "Algoritmer og datastrukturer",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "i2h2",
      code: "TDT4160",
      name: "Datamaskiner og digitalteknikk",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "i2h3",
      code: "TFY4107",
      name: "Fysikk",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "i2h4",
      code: "TMA4135",
      name: "Matematikk 4D",
      credits: 7.5,
      matchedWith: [],
    },
  ],

  // 2. år Vår
  Indøk_Datateknologi_2_Vår_default: [
    {
      id: "i2v1",
      code: "TDT4140",
      name: "Programvareutvikling",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "i2v2",
      code: "TDT4145",
      name: "Datamodellering og databasesystemer",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "i2v3",
      code: "TDT4180",
      name: "Menneske-maskin-interaksjon",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "i2v4",
      code: "TIØ4105",
      name: "Industriell økonomisk styring",
      credits: 7.5,
      matchedWith: [],
    },
  ],

  // 3. år Høst - Kunstig intelligens
  "Indøk_Datateknologi_3_Høst_Kunstig intelligens": [
    {
      id: "i3h1",
      code: "TDT4136",
      name: "Introduksjon til kunstig intelligens",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "i3h2",
      code: "TIØ4118",
      name: "Industriell økonomisk analyse",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "i3h3",
      code: "TIØ4162",
      name: "Organisasjon og teknologi 2",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "i3h4",
      code: "TMA4240",
      name: "Statistikk",
      credits: 7.5,
      matchedWith: [],
    },
  ],

  // 3. år Vår - Kunstig intelligens
  "Indøk_Datateknologi_3_Vår_Kunstig intelligens": [
    {
      id: "i3v1",
      code: "TDT4171",
      name: "Metoder i kunstig intelligens",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "i3v2",
      code: "TIØ4126",
      name: "Optimering og beslutningsstøtte for teknisk-økonomisk planlegging",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "i3v3a",
      code: "TIØ4165",
      name: "Markedsføringsledelse for teknologibedrifter",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "3vår_valg",
      isSelected: false,
    },
    {
      id: "i3v3b",
      code: "TDT4237",
      name: "Programvaresikkerhet og personvern",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "3vår_valg",
      isSelected: false,
    },
    {
      id: "i3v3c",
      code: "TDT4300",
      name: "Datavarehus og datagruvedrift",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "3vår_valg",
      isSelected: false,
    },
  ],

  // 4. år Høst - Kunstig intelligens
  "Indøk_Datateknologi_4_Høst_Kunstig intelligens": [
    // Gruppe A - Velg minst 2
    {
      id: "i4h1a",
      code: "TIØ4130",
      name: "Optimeringsmetoder med teknisk-økonomiske anvendelser",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "4høst_gruppeA",
      isSelected: false,
    },
    {
      id: "i4h1b",
      code: "TIØ4145",
      name: "Finansstyring for foretak",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "4høst_gruppeA",
      isSelected: false,
    },
    {
      id: "i4h1c",
      code: "TIØ4265",
      name: "Strategisk ledelse",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "4høst_gruppeA",
      isSelected: false,
    },

    // Valgbare teknologiemner
    {
      id: "i4h2a",
      code: "TDT4173",
      name: "Moderne maskinlæring i praksis",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "4høst_tek",
      isSelected: false,
    },
    {
      id: "i4h2b",
      code: "TDT4137",
      name: "Kognitive systemer",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "4høst_tek",
      isSelected: false,
    },
    {
      id: "i4h2c",
      code: "TDT4259",
      name: "Anvendt data science",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "4høst_tek",
      isSelected: false,
    },
    {
      id: "i4h2d",
      code: "TIØ4180",
      name: "Innovasjonsledelse og strategi",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "4høst_tek",
      isSelected: false,
    },
    {
      id: "i4h2e",
      code: "TIØ4195",
      name: "Miljøledelse og bedriftsstrategi",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "4høst_tek",
      isSelected: false,
    },
    {
      id: "i4h2f",
      code: "TIØ4282",
      name: "Digital strategi og forretningsmodeller",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "4høst_tek",
      isSelected: false,
    },
    {
      id: "i4h2g",
      code: "TIØ4300",
      name: "Miljøkunnskap, økosystemtjenester og bærekraft",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "4høst_tek",
      isSelected: false,
    },
    {
      id: "i4h2h",
      code: "TIØ4306",
      name: "Strategier for industriell bærekraft",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "4høst_tek",
      isSelected: false,
    },
    {
      id: "i4h2i",
      code: "TIØ4345",
      name: "Ledelse av bedriftsrelasjoner og -nettverk",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "4høst_tek",
      isSelected: false,
    },
  ],

  // 4. år Vår - Kunstig intelligens
  "Indøk_Datateknologi_4_Vår_Kunstig intelligens": [
    {
      id: "i4v1",
      code: "EiT",
      name: "Eksperter i team",
      credits: 7.5,
      matchedWith: [],
    },

    // Gruppe A - Velg minst 1
    {
      id: "i4v2a",
      code: "TIØ4140",
      name: "Finansielle derivater og realopsjoner",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "4vår_gruppeA",
      isSelected: false,
    },
    {
      id: "i4v2b",
      code: "TIØ4150",
      name: "Industriell optimering og beslutningsstøtte",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "4vår_gruppeA",
      isSelected: false,
    },
    {
      id: "i4v2c",
      code: "TIØ4170",
      name: "Teknologibasert forretningsutvikling",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "4vår_gruppeA",
      isSelected: false,
    },
    {
      id: "i4v2d",
      code: "TIØ4175",
      name: "Innkjøps- og logistikkledelse",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "4vår_gruppeA",
      isSelected: false,
    },
    {
      id: "i4v2e",
      code: "TIØ4235",
      name: "Industriell markedsføring og internasjonal handel",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "4vår_gruppeA",
      isSelected: false,
    },
    {
      id: "i4v2f",
      code: "TIØ4276",
      name: "Endringsledelse",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "4vår_gruppeA",
      isSelected: false,
    },
    {
      id: "i4v2g",
      code: "TIØ4285",
      name: "Modellering og analyse av industrielle verdikjeder",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "4vår_gruppeA",
      isSelected: false,
    },
    {
      id: "i4v2h",
      code: "TIØ4317",
      name: "Empiriske og kvantitative metoder i finans",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "4vår_gruppeA",
      isSelected: false,
    },

    // Valgbare teknologiemner
    {
      id: "i4v3a",
      code: "IT3105",
      name: "Kunstig intelligens programmering",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "4vår_tek",
      isSelected: false,
    },
    {
      id: "i4v3b",
      code: "IT3708",
      name: "Bio-inspirert Kunstig Intelligens",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "4vår_tek",
      isSelected: false,
    },
    {
      id: "i4v3c",
      code: "TDT4215",
      name: "Anbefalingssystemer",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "4vår_tek",
      isSelected: false,
    },
    {
      id: "i4v3d",
      code: "TDT4300",
      name: "Datavarehus og datagruvedrift",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "4vår_tek",
      isSelected: false,
    },
    {
      id: "i4v3e",
      code: "TDT4305",
      name: "Big Data-arkitektur",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "4vår_tek",
      isSelected: false,
    },
  ],

  // === DATATEKNOLOGI ===

  // 1. år Høst (Felles)
  Datateknologi_default_1_Høst_default: [
    {
      id: "dt1h1",
      code: "EXPH0300",
      name: "Examen philosophicum for naturvitenskap og teknologi",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dt1h2",
      code: "TDT4109",
      name: "Informasjonsteknologi, grunnkurs",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dt1h3",
      code: "TMA4100",
      name: "Matematikk 1",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dt1h4",
      code: "TMA4140",
      name: "Diskret matematikk",
      credits: 7.5,
      matchedWith: [],
    },
  ],

  // 1. år Vår (Felles)
  Datateknologi_default_1_Vår_default: [
    {
      id: "dt1v1",
      code: "TDT4100",
      name: "Objektorientert programmering",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dt1v2",
      code: "TDT4180",
      name: "Menneske-maskin-interaksjon",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dt1v3",
      code: "TMA4115",
      name: "Matematikk 3",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dt1v4",
      code: "TTT4203",
      name: "Innføring i analog og digital elektronikk",
      credits: 7.5,
      matchedWith: [],
    },
  ],

  // 2. år Høst (Felles)
  Datateknologi_default_2_Høst_default: [
    {
      id: "dt2h1",
      code: "IT1901",
      name: "Informatikk prosjektarbeid I",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dt2h2",
      code: "TDT4120",
      name: "Algoritmer og datastrukturer",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dt2h3",
      code: "TDT4160",
      name: "Datamaskiner og digitalteknikk",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dt2h4",
      code: "TMA4240",
      name: "Statistikk",
      credits: 7.5,
      matchedWith: [],
    },
  ],

  // 2. år Vår (Felles)
  Datateknologi_default_2_Vår_default: [
    {
      id: "dt2v1",
      code: "TDT4140",
      name: "Programvareutvikling",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dt2v2",
      code: "TDT4145",
      name: "Datamodellering og databasesystemer",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dt2v3",
      code: "TDT4186",
      name: "Operativsystemer",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dt2v4",
      code: "TTM4100",
      name: "Kommunikasjon - Tjenester og nett",
      credits: 7.5,
      matchedWith: [],
    },
  ],

  // --- Retning A: Databaser og søk ---
  "Datateknologi_default_3_Høst_Databaser og søk": [
    {
      id: "dtA3h1",
      code: "TDT4117",
      name: "Informasjonsgjenfinning",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtA3h2",
      code: "TDT4136",
      name: "Introduksjon til kunstig intelligens",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtA3h3",
      code: "TMA4135",
      name: "Matematikk 4D",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtA3h4a",
      code: "IT2810",
      name: "Webutvikling",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtA3h_valg",
      isSelected: false,
    },
    {
      id: "dtA3h4b",
      code: "IT3212",
      name: "Datadrevet Programvare",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtA3h_valg",
      isSelected: false,
    },
    {
      id: "dtA3h4c",
      code: "TDT4137",
      name: "Kognitive arkitekturer",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtA3h_valg",
      isSelected: false,
    },
    {
      id: "dtA3h4d",
      code: "TDT4165",
      name: "Programmeringsspråk",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtA3h_valg",
      isSelected: false,
    },
    {
      id: "dtA3h4e",
      code: "TDT4175",
      name: "Informasjonssystemer",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtA3h_valg",
      isSelected: false,
    },
  ],
  "Datateknologi_default_3_Vår_Databaser og søk": [
    {
      id: "dtA3v1",
      code: "TDT4237",
      name: "Programvaresikkerhet og personvern",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtA3v2",
      code: "TDT4300",
      name: "Datavarehus og datagruvedrift",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtA3v3",
      code: "TFY4125",
      name: "Fysikk",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtA3v4",
      code: "TIØ4252",
      name: "Teknologiledelse",
      credits: 7.5,
      matchedWith: [],
    },
  ],
  "Datateknologi_default_4_Høst_Databaser og søk": [
    {
      id: "dtA4h1",
      code: "TDT4225",
      name: "Store, distribuerte datamengder",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtA4h2",
      code: "TDT4290",
      name: "Kundestyrt prosjekt",
      credits: 15,
      matchedWith: [],
    },
    ...COMMON_COMPLEMENTARY_COURSES.map((c, i) => ({
      id: `dtA4h_komp_${i}`,
      code: c.code,
      name: c.name,
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtA4h_komp",
      isSelected: false,
    })),
  ],
  "Datateknologi_default_4_Vår_Databaser og søk": [
    {
      id: "dtA4v1",
      code: "TDT4305",
      name: "Big Data-arkitektur",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtA4v2",
      code: "EiT",
      name: "Eksperter i Team",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtA4v3a",
      code: "TDT4150",
      name: "Avanserte databasesystemer",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtA4v_valg",
      isSelected: false,
    },
    {
      id: "dtA4v3b",
      code: "TDT4215",
      name: "Anbefalingssystemer",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtA4v_valg",
      isSelected: false,
    },
    {
      id: "dtA4v3c",
      code: "TDT4265",
      name: "Datasyn og dyp læring",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtA4v_valg",
      isSelected: false,
    },
    {
      id: "dtA4v3d",
      code: "TDT4310",
      name: "Intelligent tekstanalyse og språkforståelse",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtA4v_valg",
      isSelected: false,
    },
    {
      id: "dtA4v3e",
      code: "TTM4135",
      name: "Anvendt kryptografi og nettverksikkerhet",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtA4v_valg",
      isSelected: false,
    },
    ...COMMON_ENGINEERING_COURSES.map((c, i) => ({
      id: `dtA4v_ing_${i}`,
      code: c.code,
      name: c.name,
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtA4v_ing",
      isSelected: false,
    })),
  ],

  // --- Retning B: Kunstig intelligens ---
  "Datateknologi_default_3_Høst_Kunstig intelligens": [
    {
      id: "dtB3h1",
      code: "TDT4136",
      name: "Introduksjon til kunstig intelligens",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtB3h2",
      code: "TDT4172",
      name: "Introduksjon til maskinlæring",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtB3h3",
      code: "TMA4135",
      name: "Matematikk 4D",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtB3h4a",
      code: "IT2810",
      name: "Webutvikling",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtB3h_valg",
      isSelected: false,
    },
    {
      id: "dtB3h4b",
      code: "IT3212",
      name: "Datadrevet Programvare",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtB3h_valg",
      isSelected: false,
    },
    {
      id: "dtB3h4c",
      code: "TDT4117",
      name: "Informasjonsgjenfinning",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtB3h_valg",
      isSelected: false,
    },
    {
      id: "dtB3h4d",
      code: "TDT4165",
      name: "Programmeringsspråk",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtB3h_valg",
      isSelected: false,
    },
    {
      id: "dtB3h4e",
      code: "TDT4175",
      name: "Informasjonssystemer",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtB3h_valg",
      isSelected: false,
    },
  ],
  "Datateknologi_default_3_Vår_Kunstig intelligens": [
    {
      id: "dtB3v1",
      code: "TDT4171",
      name: "Metoder i kunstig intelligens",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtB3v2",
      code: "TDT4237",
      name: "Programvaresikkerhet og personvern",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtB3v3",
      code: "TFY4125",
      name: "Fysikk",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtB3v4",
      code: "TIØ4252",
      name: "Teknologiledelse",
      credits: 7.5,
      matchedWith: [],
    },
  ],
  "Datateknologi_default_4_Høst_Kunstig intelligens": [
    {
      id: "dtB4h1",
      code: "TDT4173",
      name: "Moderne maskinlæring i praksis",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtB4h2",
      code: "TDT4290",
      name: "Kundestyrt prosjekt",
      credits: 15,
      matchedWith: [],
    },
    ...COMMON_COMPLEMENTARY_COURSES.map((c, i) => ({
      id: `dtB4h_komp_${i}`,
      code: c.code,
      name: c.name,
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtB4h_komp",
      isSelected: false,
    })),
  ],
  "Datateknologi_default_4_Vår_Kunstig intelligens": [
    {
      id: "dtB4v1",
      code: "IT3105",
      name: "Kunstig intelligens programmering",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtB4v2",
      code: "EiT",
      name: "Eksperter i Team",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtB4v3a",
      code: "IT3708",
      name: "Bio-inspirert Kunstig Intelligens",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtB4v_valg",
      isSelected: false,
    },
    {
      id: "dtB4v3b",
      code: "TDT4215",
      name: "Anbefalingssystemer",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtB4v_valg",
      isSelected: false,
    },
    {
      id: "dtB4v3c",
      code: "TDT4310",
      name: "Intelligent tekstanalyse og språkforståelse",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtB4v_valg",
      isSelected: false,
    },
    {
      id: "dtB4v3d",
      code: "TDT4265",
      name: "Datasyn og dyp læring",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtB4v_valg",
      isSelected: false,
    },
    {
      id: "dtB4v3e",
      code: "TDT4305",
      name: "Big Data-arkitektur",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtB4v_valg",
      isSelected: false,
    },
    {
      id: "dtB4v3f",
      code: "TTM4135",
      name: "Anvendt kryptografi og nettverksikkerhet",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtB4v_valg",
      isSelected: false,
    },
    ...COMMON_ENGINEERING_COURSES.map((c, i) => ({
      id: `dtB4v_ing_${i}`,
      code: c.code,
      name: c.name,
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtB4v_ing",
      isSelected: false,
    })),
  ],

  // --- Retning C: Programvaresystemer ---
  Datateknologi_default_3_Høst_Programvaresystemer: [
    {
      id: "dtC3h1",
      code: "TDT4136",
      name: "Introduksjon til kunstig intelligens",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtC3h2",
      code: "TDT4175",
      name: "Informasjonssystemer",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtC3h3",
      code: "TMA4135",
      name: "Matematikk 4D",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtC3h4a",
      code: "IT2810",
      name: "Webutvikling",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtC3h_valg",
      isSelected: false,
    },
    {
      id: "dtC3h4b",
      code: "IT3212",
      name: "Datadrevet Programvare",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtC3h_valg",
      isSelected: false,
    },
    {
      id: "dtC3h4c",
      code: "TDT4117",
      name: "Informasjonsgjenfinning",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtC3h_valg",
      isSelected: false,
    },
    {
      id: "dtC3h4d",
      code: "TDT4137",
      name: "Kognitive arkitekturer",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtC3h_valg",
      isSelected: false,
    },
    {
      id: "dtC3h4e",
      code: "TDT4165",
      name: "Programmeringsspråk",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtC3h_valg",
      isSelected: false,
    },
  ],
  Datateknologi_default_3_Vår_Programvaresystemer: [
    {
      id: "dtC3v1",
      code: "TDT4237",
      name: "Programvaresikkerhet og personvern",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtC3v2",
      code: "TDT4240",
      name: "Programvarearkitektur",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtC3v3",
      code: "TFY4125",
      name: "Fysikk",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtC3v4",
      code: "TIØ4252",
      name: "Teknologiledelse",
      credits: 7.5,
      matchedWith: [],
    },
  ],
  Datateknologi_default_4_Høst_Programvaresystemer: [
    {
      id: "dtC4h1",
      code: "TDT4290",
      name: "Kundestyrt prosjekt",
      credits: 15,
      matchedWith: [],
    },
    ...COMMON_COMPLEMENTARY_COURSES.map((c, i) => ({
      id: `dtC4h_komp_${i}`,
      code: c.code,
      name: c.name,
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtC4h_komp",
      isSelected: false,
    })),
    {
      id: "dtC4h3a",
      code: "IT3402",
      name: "Design av grafiske brukergrensesnitt",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtC4h_valg",
      isSelected: false,
    },
    {
      id: "dtC4h3b",
      code: "TDT4165",
      name: "Programmeringsspråk",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtC4h_valg",
      isSelected: false,
    },
    {
      id: "dtC4h3c",
      code: "TDT4250",
      name: "Modelldrevet programvareutvikling",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtC4h_valg",
      isSelected: false,
    },
    {
      id: "dtC4h3d",
      code: "TDT4252",
      name: "Virksomhetsarkitektur og -innovasjon",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtC4h_valg",
      isSelected: false,
    },
    {
      id: "dtC4h3e",
      code: "TDT4259",
      name: "Anvendt data science",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtC4h_valg",
      isSelected: false,
    },
    {
      id: "dtC4h3f",
      code: "IT3212",
      name: "Datadrevet Programvare",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtC4h_valg",
      isSelected: false,
    },
  ],
  Datateknologi_default_4_Vår_Programvaresystemer: [
    {
      id: "dtC4v1",
      code: "EiT",
      name: "Eksperter i Team",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtC4v2a",
      code: "IT3022",
      name: "Deltagende design",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtC4v_valg",
      isSelected: false,
    },
    {
      id: "dtC4v2b",
      code: "TDT4242",
      name: "Avansert programvareutvikling",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtC4v_valg",
      isSelected: false,
    },
    {
      id: "dtC4v2c",
      code: "TDT4245",
      name: "Samhandlingsteknologi og sosiale medier",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtC4v_valg",
      isSelected: false,
    },
    {
      id: "dtC4v2d",
      code: "TDT4257",
      name: "Digitale plattformer og tjenesteinnovasjon",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtC4v_valg",
      isSelected: false,
    },
    {
      id: "dtC4v3a",
      code: "IT3026",
      name: "Digital Tjenestedesign",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtC4v_ing",
      isSelected: false,
    },
    {
      id: "dtC4v3b",
      code: "TDT4215",
      name: "Anbefalingssystemer",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtC4v_ing",
      isSelected: false,
    },
    ...COMMON_ENGINEERING_COURSES.map((c, i) => ({
      id: `dtC4v_ing_${i}`,
      code: c.code,
      name: c.name,
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtC4v_ing",
      isSelected: false,
    })),
  ],

  // --- Retning D: Visuell databehandling ---
  "Datateknologi_default_3_Høst_Visuell databehandling": [
    {
      id: "dtD3h1",
      code: "TDT4136",
      name: "Introduksjon til kunstig intelligens",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtD3h2",
      code: "TDT4195",
      name: "Grunnleggende visuell databehandling",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtD3h3",
      code: "TMA4135",
      name: "Matematikk 4D",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtD3h4a",
      code: "IT2810",
      name: "Webutvikling",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtD3h_valg",
      isSelected: false,
    },
    {
      id: "dtD3h4b",
      code: "TDT4172",
      name: "Introduksjon til maskinlæring",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtD3h_valg",
      isSelected: false,
    },
    {
      id: "dtD3h4c",
      code: "TDT4200",
      name: "Parallelle beregninger",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtD3h_valg",
      isSelected: false,
    },
    {
      id: "dtD3h4d",
      code: "TDT4255",
      name: "Datamaskinkonstruksjon",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtD3h_valg",
      isSelected: false,
    },
    {
      id: "dtD3h4e",
      code: "TDT4258",
      name: "Maskinnær programmering",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtD3h_valg",
      isSelected: false,
    },
    {
      id: "dtD3h4f",
      code: "TDT4287",
      name: "Algoritmer for bioinformatikk",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtD3h_valg",
      isSelected: false,
    },
  ],
  "Datateknologi_default_3_Vår_Visuell databehandling": [
    {
      id: "dtD3v1",
      code: "TDT4237",
      name: "Programvaresikkerhet og personvern",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtD3v2",
      code: "TFY4125",
      name: "Fysikk",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtD3v3",
      code: "TIØ4252",
      name: "Teknologiledelse",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtD3v4a",
      code: "IT3105",
      name: "Kunstig intelligens programmering",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtD3v_valg",
      isSelected: false,
    },
    {
      id: "dtD3v4b",
      code: "TDT4125",
      name: "Algoritmekonstruksjon",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtD3v_valg",
      isSelected: false,
    },
    {
      id: "dtD3v4c",
      code: "TDT4171",
      name: "Metoder i kunstig intelligens",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtD3v_valg",
      isSelected: false,
    },
    {
      id: "dtD3v4d",
      code: "TDT4240",
      name: "Programvarearkitektur",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtD3v_valg",
      isSelected: false,
    },
  ],
  "Datateknologi_default_4_Høst_Visuell databehandling": [
    {
      id: "dtD4h1a",
      code: "TDT4290",
      name: "Kundestyrt prosjekt",
      credits: 15,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtD4h_prosjekt",
      isSelected: false,
    },
    {
      id: "dtD4h1b",
      code: "TDT4295",
      name: "Datamaskinprosjekt",
      credits: 15,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtD4h_prosjekt",
      isSelected: false,
    },
    ...COMMON_COMPLEMENTARY_COURSES.map((c, i) => ({
      id: `dtD4h_komp_${i}`,
      code: c.code,
      name: c.name,
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtD4h_komp",
      isSelected: false,
    })),
    {
      id: "dtD4h3a",
      code: "IT3402",
      name: "Design av grafiske brukergrensesnitt",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtD4h_valg",
      isSelected: false,
    },
    {
      id: "dtD4h3b",
      code: "TDT4137",
      name: "Kognitive systemer",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtD4h_valg",
      isSelected: false,
    },
    {
      id: "dtD4h3c",
      code: "TDT4165",
      name: "Programmeringsspråk",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtD4h_valg",
      isSelected: false,
    },
    {
      id: "dtD4h3d",
      code: "TDT4173",
      name: "Moderne maskinlæring i praksis",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtD4h_valg",
      isSelected: false,
    },
    {
      id: "dtD4h3e",
      code: "TDT4200",
      name: "Parallelle beregninger",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtD4h_valg",
      isSelected: false,
    },
    {
      id: "dtD4h3f",
      code: "TDT4225",
      name: "Store, distribuerte datamengder",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtD4h_valg",
      isSelected: false,
    },
    {
      id: "dtD4h3g",
      code: "TDT4258",
      name: "Maskinnær programmering",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtD4h_valg",
      isSelected: false,
    },
    {
      id: "dtD4h3h",
      code: "TDT4259",
      name: "Anvendt data science",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtD4h_valg",
      isSelected: false,
    },
    {
      id: "dtD4h3i",
      code: "TDT4255",
      name: "Datamaskinkonstruksjon",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtD4h_valg",
      isSelected: false,
    },
    {
      id: "dtD4h3j",
      code: "TDT4287",
      name: "Algoritmer for bioinformatikk",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtD4h_valg",
      isSelected: false,
    },
  ],
  "Datateknologi_default_4_Vår_Visuell databehandling": [
    {
      id: "dtD4v1",
      code: "TDT4230",
      name: "Grafikk og visualisering",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtD4v2",
      code: "TDT4265",
      name: "Datasyn og dyp læring",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtD4v3",
      code: "EiT",
      name: "Eksperter i Team",
      credits: 7.5,
      matchedWith: [],
    },
    ...COMMON_ENGINEERING_COURSES.map((c, i) => ({
      id: `dtD4v_ing_${i}`,
      code: c.code,
      name: c.name,
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtD4v_ing",
      isSelected: false,
    })),
  ],

  // --- Retning E: Effektive datasystemer ---
  "Datateknologi_default_3_Høst_Effektive datasystemer": [
    {
      id: "dtE3h1",
      code: "TDT4136",
      name: "Introduksjon til kunstig intelligens",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtE3h2",
      code: "TMA4135",
      name: "Matematikk 4D",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtE3h3a",
      code: "TDT4200",
      name: "Parallelle beregninger",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtE3h_valg",
      isSelected: false,
    },
    {
      id: "dtE3h3b",
      code: "TDT4255",
      name: "Datamaskinkonstruksjon",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtE3h_valg",
      isSelected: false,
    },
    {
      id: "dtE3h3c",
      code: "TDT4258",
      name: "Maskinnær programmering",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtE3h_valg",
      isSelected: false,
    },
    {
      id: "dtE3h3d",
      code: "TDT4287",
      name: "Algoritmer for bioinformatikk",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtE3h_valg",
      isSelected: false,
    },
    {
      id: "dtE3h3e",
      code: "TDT4165",
      name: "Programmeringsspråk",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtE3h_valg",
      isSelected: false,
    },
  ],
  "Datateknologi_default_3_Vår_Effektive datasystemer": [
    {
      id: "dtE3v1",
      code: "TDT4237",
      name: "Programvaresikkerhet og personvern",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtE3v2",
      code: "TFY4125",
      name: "Fysikk",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtE3v3",
      code: "TIØ4252",
      name: "Teknologiledelse",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtE3v4a",
      code: "TDT4125",
      name: "Algoritmekonstruksjon",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtE3v_valg",
      isSelected: false,
    },
    {
      id: "dtE3v4b",
      code: "TDT4205",
      name: "Kompilatorteknikk",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtE3v_valg",
      isSelected: false,
    },
    {
      id: "dtE3v4c",
      code: "TDT4260",
      name: "Datamaskinarkitektur",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtE3v_valg",
      isSelected: false,
    },
  ],
  "Datateknologi_default_4_Høst_Effektive datasystemer": [
    {
      id: "dtE4h1a",
      code: "TDT4290",
      name: "Kundestyrt prosjekt",
      credits: 15,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtE4h_prosjekt",
      isSelected: false,
    },
    {
      id: "dtE4h1b",
      code: "TDT4295",
      name: "Datamaskinprosjekt",
      credits: 15,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtE4h_prosjekt",
      isSelected: false,
    },
    ...COMMON_COMPLEMENTARY_COURSES.map((c, i) => ({
      id: `dtE4h_komp_${i}`,
      code: c.code,
      name: c.name,
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtE4h_komp",
      isSelected: false,
    })),
    {
      id: "dtE4h3a",
      code: "TDT4200",
      name: "Parallelle beregninger",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtE4h_valg",
      isSelected: false,
    },
    {
      id: "dtE4h3b",
      code: "TDT4255",
      name: "Datamaskinkonstruksjon",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtE4h_valg",
      isSelected: false,
    },
    {
      id: "dtE4h3c",
      code: "TDT4287",
      name: "Algoritmer for bioinformatikk",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtE4h_valg",
      isSelected: false,
    },
    {
      id: "dtE4h3d",
      code: "TDT4165",
      name: "Programmeringsspråk",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtE4h_valg",
      isSelected: false,
    },
  ],
  "Datateknologi_default_4_Vår_Effektive datasystemer": [
    {
      id: "dtE4v1",
      code: "EiT",
      name: "Eksperter i Team",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "dtE4v2a",
      code: "TDT4125",
      name: "Algoritmekonstruksjon",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtE4v_valg",
      isSelected: false,
    },
    {
      id: "dtE4v2b",
      code: "TDT4205",
      name: "Kompilatorteknikk",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtE4v_valg",
      isSelected: false,
    },
    {
      id: "dtE4v2c",
      code: "TDT4260",
      name: "Datamaskinarkitektur",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtE4v_valg",
      isSelected: false,
    },
    ...COMMON_ENGINEERING_COURSES.map((c, i) => ({
      id: `dtE4v_ing_${i}`,
      code: c.code,
      name: c.name,
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "dtE4v_ing",
      isSelected: false,
    })),
  ],

  // === KYBERNETIKK OG ROBOTIKK ===

  // 1. år Høst (Felles)
  Kybernetikk_default_1_Høst_default: [
    {
      id: "kyb1h1",
      code: "HMS0002",
      name: "HMS-kurs for 1. årsstudenter",
      credits: 0,
      matchedWith: [],
    },
    {
      id: "kyb1h2",
      code: "TDT4110",
      name: "Informasjonsteknologi, grunnkurs",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kyb1h3",
      code: "TMA4101",
      name: "Matematikk 1",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kyb1h4",
      code: "TTK4100",
      name: "Kybernetikk, introduksjon",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kyb1h5",
      code: "TTT4203",
      name: "Innføring i analog og digital elektronikk",
      credits: 7.5,
      matchedWith: [],
    },
  ],

  // 1. år Vår (Felles)
  Kybernetikk_default_1_Vår_default: [
    {
      id: "kyb1v1",
      code: "TDT4102",
      name: "Prosedyre- og objektorientert programmering",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kyb1v2",
      code: "TMA4106",
      name: "Matematikk 2",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kyb1v3",
      code: "TMA4245",
      name: "Statistikk",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kyb1v4",
      code: "TTK4101",
      name: "Instrumentering og måleteknikk",
      credits: 7.5,
      matchedWith: [],
    },
  ],

  // 2. år Høst (Felles)
  Kybernetikk_default_2_Høst_default: [
    {
      id: "kyb2h1",
      code: "TDT4160",
      name: "Datamaskiner og digitalteknikk",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kyb2h2",
      code: "TFY4115",
      name: "Fysikk",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kyb2h3",
      code: "TMA4111",
      name: "Matematikk 3",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kyb2h4",
      code: "TTK4111",
      name: "Reguleringsteknikk",
      credits: 7.5,
      matchedWith: [],
    },
  ],

  // 2. år Vår (Felles)
  Kybernetikk_default_2_Vår_default: [
    {
      id: "kyb2v1",
      code: "EXPH0300",
      name: "Examen philosophicum for naturvitenskap og teknologi",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kyb2v2",
      code: "TMA4121",
      name: "Matematikk 4",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kyb2v3",
      code: "TTK4235",
      name: "Tilpassede datasystemer",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kyb2v4",
      code: "TTK4240",
      name: "Industriell elektroteknikk",
      credits: 7.5,
      matchedWith: [],
    },
  ],

  // 3. år Høst (Felles)
  Kybernetikk_default_3_Høst_default: [
    {
      id: "kyb3h1",
      code: "TDT4120",
      name: "Algoritmer og datastrukturer",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kyb3h2",
      code: "TIØ4252",
      name: "Teknologiledelse",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kyb3h3",
      code: "TTK4115",
      name: "Lineær systemteori",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kyb3h4",
      code: "Valgbart emne",
      name: "Valgbart emne",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "kyb3h_valg",
    },
  ],

  // 3. år Vår (Felles)
  Kybernetikk_default_3_Vår_default: [
    {
      id: "kyb3v1",
      code: "TTK4130",
      name: "Modellering og simulering",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kyb3v2",
      code: "TTK4135",
      name: "Optimalisering og regulering",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kyb3v3",
      code: "TTK4145",
      name: "Sanntidsprogrammering",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kyb3v4",
      code: "Valgbart emne",
      name: "Valgbart emne",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "kyb3v_valg",
    },
  ],

  // --- 4. år Spesialiseringer ---

  // Prosessregulering
  Kybernetikk_default_4_Høst_Prosessregulering: [
    {
      id: "kybPR4h1",
      code: "TTK4150",
      name: "Ulineære systemer",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kybPR4h2",
      code: "TTK4215",
      name: "Adaptiv regulering",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kybPR4h3",
      code: "Valgbart emne (Teknisk)",
      name: "Valgbart emne (Teknisk)",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "kybPR4h_tek",
    },
    {
      id: "kybPR4h4",
      code: "Valgbart emne (Annet)",
      name: "Valgbart emne (Annet)",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "kybPR4h_annet",
    },
  ],
  Kybernetikk_default_4_Vår_Prosessregulering: [
    {
      id: "kybPR4v1",
      code: "TTK4210",
      name: "Avansert regulering av industrielle prosesser",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kybPR4v2",
      code: "EiT",
      name: "Eksperter i team",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kybPR4v3a",
      code: "Valgbart emne 1",
      name: "Valgbart emne",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "kybPR4v_valg",
    },
    {
      id: "kybPR4v3b",
      code: "Valgbart emne 2",
      name: "Valgbart emne",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "kybPR4v_valg",
    },
  ],

  // Styring av smarte nett og fornybar energi
  "Kybernetikk_default_4_Høst_Styring av smarte nett og fornybar energi": [
    {
      id: "kybSN4h1",
      code: "TTK4150",
      name: "Ulineære systemer",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kybSN4h2",
      code: "Valgbart emne (Teknisk 1)",
      name: "Valgbart emne (Teknisk)",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "kybSN4h_tek",
    },
    {
      id: "kybSN4h3",
      code: "Valgbart emne (Teknisk 2)",
      name: "Valgbart emne (Teknisk)",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "kybSN4h_tek",
    },
    {
      id: "kybSN4h4",
      code: "Valgbart emne (Annet)",
      name: "Valgbart emne (Annet)",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "kybSN4h_annet",
    },
  ],
  "Kybernetikk_default_4_Vår_Styring av smarte nett og fornybar energi": [
    {
      id: "kybSN4v1",
      code: "TTK4210",
      name: "Avansert regulering av industrielle prosesser",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kybSN4v2",
      code: "EiT",
      name: "Eksperter i team",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kybSN4v3a",
      code: "Valgbart emne 1",
      name: "Valgbart emne",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "kybSN4v_valg",
    },
    {
      id: "kybSN4v3b",
      code: "Valgbart emne 2",
      name: "Valgbart emne",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "kybSN4v_valg",
    },
  ],

  // Havbiokybernetikk
  Kybernetikk_default_4_Høst_Havbiokybernetikk: [
    {
      id: "kybHB4h1a",
      code: "BI2065",
      name: "Akvakultur",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "kybHB4h_bio",
      isSelected: false,
    },
    {
      id: "kybHB4h1b",
      code: "BI3061",
      name: "Biologisk oseanografi",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "kybHB4h_bio",
      isSelected: false,
    },
    {
      id: "kybHB4h1c",
      code: "BI3067",
      name: "Akvakulturøkologi",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "kybHB4h_bio",
      isSelected: false,
    },
    {
      id: "kybHB4h2",
      code: "Valgbart emne (Teknisk 1)",
      name: "Valgbart emne (Teknisk)",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "kybHB4h_tek",
    },
    {
      id: "kybHB4h3",
      code: "Valgbart emne (Teknisk 2)",
      name: "Valgbart emne (Teknisk)",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "kybHB4h_tek",
    },
  ],
  Kybernetikk_default_4_Vår_Havbiokybernetikk: [
    {
      id: "kybHB4v1",
      code: "EiT",
      name: "Eksperter i team",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kybHB4v2a",
      code: "Valgbart emne 1",
      name: "Valgbart emne",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "kybHB4v_valg",
    },
    {
      id: "kybHB4v2b",
      code: "Valgbart emne 2",
      name: "Valgbart emne",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "kybHB4v_valg",
    },
    {
      id: "kybHB4v2c",
      code: "Valgbart emne 3",
      name: "Valgbart emne",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "kybHB4v_valg",
    },
  ],

  // Biomedisinsk kybernetikk
  "Kybernetikk_default_4_Høst_Biomedisinsk kybernetikk": [
    {
      id: "kybBM4h1",
      code: "FI3107",
      name: "Bioteknologi og etikk",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kybBM4h2",
      code: "TTK4270",
      name: "Biomedisinsk instrumentering og regulering",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kybBM4h3",
      code: "TTT4120",
      name: "Digital signalbehandling",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kybBM4h4",
      code: "Valgbart emne (Teknisk)",
      name: "Valgbart emne (Teknisk)",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "kybBM4h_tek",
    },
  ],
  "Kybernetikk_default_4_Vår_Biomedisinsk kybernetikk": [
    {
      id: "kybBM4v1",
      code: "TTK4260",
      name: "Multivariat dataanalyse og maskinlæring",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kybBM4v2",
      code: "EiT",
      name: "Eksperter i team",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kybBM4v3a",
      code: "Valgbart emne 1",
      name: "Valgbart emne",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "kybBM4v_valg",
    },
    {
      id: "kybBM4v3b",
      code: "Valgbart emne 2",
      name: "Valgbart emne",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "kybBM4v_valg",
    },
  ],

  // Medisinsk billeddannelse
  "Kybernetikk_default_4_Høst_Medisinsk billeddannelse": [
    {
      id: "kybMB4h1",
      code: "MEDT4161",
      name: "Medisinsk Ultralydavbildning",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kybMB4h2",
      code: "TTT4120",
      name: "Digital signalbehandling",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kybMB4h3",
      code: "MFEL3010",
      name: "Medisin for realfag- og teknologistudenter",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kybMB4h4",
      code: "Valgbart emne (Teknisk)",
      name: "Valgbart emne (Teknisk)",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "kybMB4h_tek",
    },
  ],
  "Kybernetikk_default_4_Vår_Medisinsk billeddannelse": [
    {
      id: "kybMB4v1",
      code: "MEDT4165",
      name: "Signalbehandling i ultralyd-avbildning",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kybMB4v2",
      code: "EiT",
      name: "Eksperter i team",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kybMB4v3a",
      code: "Valgbart emne 1",
      name: "Valgbart emne",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "kybMB4v_valg",
    },
    {
      id: "kybMB4v3b",
      code: "Valgbart emne 2",
      name: "Valgbart emne",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "kybMB4v_valg",
    },
  ],

  // Innvevde datasystemer
  "Kybernetikk_default_4_Høst_Innvevde datasystemer": [
    {
      id: "kybID4h1",
      code: "TTK4147",
      name: "Sanntidssystemer",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kybID4h2",
      code: "TTK4155",
      name: "Industrielle og innbygde datasystemers konstruksjon",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kybID4h3",
      code: "Valgbart emne (Teknisk)",
      name: "Valgbart emne (Teknisk)",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "kybID4h_tek",
    },
    {
      id: "kybID4h4",
      code: "Valgbart emne (Annet)",
      name: "Valgbart emne (Annet)",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "kybID4h_annet",
    },
  ],
  "Kybernetikk_default_4_Vår_Innvevde datasystemer": [
    {
      id: "kybID4v1",
      code: "TTK4175",
      name: "Instrumenteringssystemer og sikkerhet",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kybID4v2",
      code: "EiT",
      name: "Eksperter i team",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "kybID4v3a",
      code: "Valgbart emne 1",
      name: "Valgbart emne",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "kybID4v_valg",
    },
    {
      id: "kybID4v3b",
      code: "Valgbart emne 2",
      name: "Valgbart emne",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "kybID4v_valg",
    },
  ],

  // === ØKONOMI OG ADMINISTRASJON - MARKEDFØRING ===

  // 3. år Høst
  "Økonomi og administrasjon_default_3_Høst_Markedføring": [
    {
      id: "oa_mf3h1",
      code: "AF3030",
      name: "Bacheloroppgave i markedsføring - del 1 av 2",
      credits: 0,
      matchedWith: [],
    },
    {
      id: "oa_mf3h2",
      code: "BMRK3012",
      name: "Serviceledelse og relasjonsmarkedsføring",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "oa_mf3h3",
      code: "MRK2015",
      name: "Managing Business Relationships",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "oa_mf3h4",
      code: "MRK3015",
      name: "Consumer Behaviour",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "oa_mf3h5a",
      code: "BBAN3001",
      name: "Essentials of Business Analytics",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_mf3h_valg",
      isSelected: false,
    },
    {
      id: "oa_mf3h5b",
      code: "BBOA2010",
      name: "Innføring i skatterett",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_mf3h_valg",
      isSelected: false,
    },
    {
      id: "oa_mf3h5c",
      code: "BBOA3005",
      name: "Digitale regnskapsprosesser",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_mf3h_valg",
      isSelected: false,
    },
    {
      id: "oa_mf3h5d",
      code: "BBOA3010",
      name: "Corporate Finance",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_mf3h_valg",
      isSelected: false,
    },
    {
      id: "oa_mf3h5e",
      code: "BBOA3015",
      name: "Bærekraftsrapportering – Introduksjon",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_mf3h_valg",
      isSelected: false,
    },
    {
      id: "oa_mf3h5f",
      code: "BFIN1001",
      name: "Personlig økonomi",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_mf3h_valg",
      isSelected: false,
    },
    {
      id: "oa_mf3h5g",
      code: "BSMØ3005",
      name: "Økonomi og bærekraft",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_mf3h_valg",
      isSelected: false,
    },
    {
      id: "oa_mf3h5h",
      code: "BØA2033",
      name: "Årsregnskap",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_mf3h_valg",
      isSelected: false,
    },
    {
      id: "oa_mf3h5i",
      code: "BØA3050",
      name: "Sentrale verktøy i økonomistyring",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_mf3h_valg",
      isSelected: false,
    },
    {
      id: "oa_mf3h5j",
      code: "MET2010",
      name: "Anvendt statistikk",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_mf3h_valg",
      isSelected: false,
    },
    {
      id: "oa_mf3h5k",
      code: "MRK2010",
      name: "Markedskommunikasjon og merkevarebygging",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_mf3h_valg",
      isSelected: false,
    },
    {
      id: "oa_mf3h5l",
      code: "ORG3021",
      name: "Endringsledelse",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_mf3h_valg",
      isSelected: false,
    },
    {
      id: "oa_mf3h5m",
      code: "SMØ2020",
      name: "Welfare Economics",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_mf3h_valg",
      isSelected: false,
    },
  ],

  // 3. år Vår
  "Økonomi og administrasjon_default_3_Vår_Markedføring": [
    {
      id: "oa_mf3v1",
      code: "AF3030",
      name: "Bacheloroppgave i markedsføring - del 2 av 2",
      credits: 0,
      matchedWith: [],
    },
    {
      id: "oa_mf3v2a",
      code: "BBOA2020",
      name: "Videregående skatte- og avgiftsrett",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_mf3v_valg",
      isSelected: false,
    },
    {
      id: "oa_mf3v2b",
      code: "BBOA3020",
      name: "Finansielle institusjoner, markeder og reguleringer",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_mf3v_valg",
      isSelected: false,
    },
    {
      id: "oa_mf3v2c",
      code: "BBOA3030",
      name: "Videregående finansregnskap",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_mf3v_valg",
      isSelected: false,
    },
    {
      id: "oa_mf3v2d",
      code: "BINT3005",
      name: "Internship i økonomi og ledelse",
      credits: 15,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_mf3v_valg",
      isSelected: false,
    },
    {
      id: "oa_mf3v2e",
      code: "BØA2020",
      name: "Decision Modelling and Optimization",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_mf3v_valg",
      isSelected: false,
    },
    {
      id: "oa_mf3v2f",
      code: "BØA2042",
      name: "Financial Modeling using Excel",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_mf3v_valg",
      isSelected: false,
    },
    {
      id: "oa_mf3v2g",
      code: "BØA3020",
      name: "Økonomistyringssystemer",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_mf3v_valg",
      isSelected: false,
    },
    {
      id: "oa_mf3v2h",
      code: "MET3003",
      name: "Prosjektstyring",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_mf3v_valg",
      isSelected: false,
    },
    {
      id: "oa_mf3v2i",
      code: "MRK3025",
      name: "Innovation and Business Development",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_mf3v_valg",
      isSelected: false,
    },
    {
      id: "oa_mf3v2j",
      code: "ORG3030",
      name: "Strategic Leadership",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_mf3v_valg",
      isSelected: false,
    },
  ],

  // === ØKONOMI OG ADMINISTRASJON - ORGANISASJON OG ENDRING ===

  // 3. år Høst
  "Økonomi og administrasjon_default_3_Høst_Organisasjon og endring": [
    {
      id: "oa_oe3h1",
      code: "ORG3021",
      name: "Endringsledelse",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "oa_oe3h2",
      code: "SOL3000",
      name: "Fordypningsoppgave i strategi og ledelse - del 1 av 2",
      credits: 0,
      matchedWith: [],
    },
    {
      id: "oa_oe3h3a",
      code: "BBAN3001",
      name: "Essentials of Business Analytics",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_oe3h_valg",
      isSelected: false,
    },
    {
      id: "oa_oe3h3b",
      code: "BBOA2010",
      name: "Innføring i skatterett",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_oe3h_valg",
      isSelected: false,
    },
    {
      id: "oa_oe3h3c",
      code: "BBOA3005",
      name: "Digitale regnskapsprosesser",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_oe3h_valg",
      isSelected: false,
    },
    {
      id: "oa_oe3h3d",
      code: "BBOA3010",
      name: "Corporate Finance",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_oe3h_valg",
      isSelected: false,
    },
    {
      id: "oa_oe3h3e",
      code: "BBOA3015",
      name: "Bærekraftsrapportering – Introduksjon",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_oe3h_valg",
      isSelected: false,
    },
    {
      id: "oa_oe3h3f",
      code: "BFIN1001",
      name: "Personlig økonomi",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_oe3h_valg",
      isSelected: false,
    },
    {
      id: "oa_oe3h3g",
      code: "BMRK3012",
      name: "Serviceledelse og relasjonsmarkedsføring",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_oe3h_valg",
      isSelected: false,
    },
    {
      id: "oa_oe3h3h",
      code: "BSMØ3005",
      name: "Økonomi og bærekraft",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_oe3h_valg",
      isSelected: false,
    },
    {
      id: "oa_oe3h3i",
      code: "BØA2033",
      name: "Årsregnskap",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_oe3h_valg",
      isSelected: false,
    },
    {
      id: "oa_oe3h3j",
      code: "BØA3050",
      name: "Sentrale verktøy i økonomistyring",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_oe3h_valg",
      isSelected: false,
    },
    {
      id: "oa_oe3h3k",
      code: "MET2010",
      name: "Anvendt statistikk",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_oe3h_valg",
      isSelected: false,
    },
    {
      id: "oa_oe3h3l",
      code: "MRK2010",
      name: "Markedskommunikasjon og merkevarebygging",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_oe3h_valg",
      isSelected: false,
    },
    {
      id: "oa_oe3h3m",
      code: "MRK2015",
      name: "Managing Business Relationships",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_oe3h_valg",
      isSelected: false,
    },
    {
      id: "oa_oe3h3n",
      code: "MRK3015",
      name: "Consumer Behaviour",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_oe3h_valg",
      isSelected: false,
    },
    {
      id: "oa_oe3h3o",
      code: "SMØ2020",
      name: "Welfare Economics",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_oe3h_valg",
      isSelected: false,
    },
  ],

  // 3. år Vår
  "Økonomi og administrasjon_default_3_Vår_Organisasjon og endring": [
    {
      id: "oa_oe3v1a",
      code: "BSOL2200",
      name: "Organisasjonspsykologi og ledelse",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_oe3v_obligatorisk",
      isSelected: false,
    },
    {
      id: "oa_oe3v1b",
      code: "ORG3030",
      name: "Strategic Leadership",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_oe3v_obligatorisk",
      isSelected: false,
    },
    {
      id: "oa_oe3v2",
      code: "SOL3000",
      name: "Fordypningsoppgave i strategi og ledelse - del 2 av 2",
      credits: 15,
      matchedWith: [],
    },
    {
      id: "oa_oe3v3a",
      code: "BBOA2020",
      name: "Videregående skatte- og avgiftsrett",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_oe3v_valg",
      isSelected: false,
    },
    {
      id: "oa_oe3v3b",
      code: "BBOA3020",
      name: "Finansielle institusjoner, markeder og reguleringer",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_oe3v_valg",
      isSelected: false,
    },
    {
      id: "oa_oe3v3c",
      code: "BBOA3030",
      name: "Videregående finansregnskap",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_oe3v_valg",
      isSelected: false,
    },
    {
      id: "oa_oe3v3d",
      code: "BINT3005",
      name: "Internship i økonomi og ledelse",
      credits: 15,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_oe3v_valg",
      isSelected: false,
    },
    {
      id: "oa_oe3v3e",
      code: "BØA2020",
      name: "Decision Modelling and Optimization",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_oe3v_valg",
      isSelected: false,
    },
    {
      id: "oa_oe3v3f",
      code: "BØA2042",
      name: "Financial Modeling using Excel",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_oe3v_valg",
      isSelected: false,
    },
    {
      id: "oa_oe3v3g",
      code: "BØA3020",
      name: "Økonomistyringssystemer",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_oe3v_valg",
      isSelected: false,
    },
    {
      id: "oa_oe3v3h",
      code: "MET3003",
      name: "Prosjektstyring",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_oe3v_valg",
      isSelected: false,
    },
    {
      id: "oa_oe3v3i",
      code: "MRK3025",
      name: "Innovation and Business Development",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_oe3v_valg",
      isSelected: false,
    },
  ],

  // === ØKONOMI OG ADMINISTRASJON - REGNSKAP ===

  // 3. år Høst
  "Økonomi og administrasjon_default_3_Høst_Regnskap": [
    {
      id: "oa_rs3h1a",
      code: "BBOA3015",
      name: "Bærekraftsrapportering – Introduksjon",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_rs3h_m1a",
      isSelected: false,
    },
    {
      id: "oa_rs3h1b",
      code: "BØA3050",
      name: "Sentrale verktøy i økonomistyring",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_rs3h_m1a",
      isSelected: false,
    },
    {
      id: "oa_rs3h2",
      code: "AF3040",
      name: "Bacheloroppgave i regnskap - del 1 av 2",
      credits: 0,
      matchedWith: [],
    },
    {
      id: "oa_rs3h3",
      code: "BBOA2010",
      name: "Innføring i skatterett",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "oa_rs3h4",
      code: "BBOA3005",
      name: "Digitale regnskapsprosesser",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "oa_rs3h5",
      code: "BØA2033",
      name: "Årsregnskap",
      credits: 7.5,
      matchedWith: [],
    },
  ],

  // 3. år Vår
  "Økonomi og administrasjon_default_3_Vår_Regnskap": [
    {
      id: "oa_rs3v1",
      code: "AF3040",
      name: "Bacheloroppgave i regnskap - del 2 av 2",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "oa_rs3v2",
      code: "BBOA2020",
      name: "Videregående skatte- og avgiftsrett",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "oa_rs3v3",
      code: "BBOA3030",
      name: "Videregående finansregnskap",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "oa_rs3v4",
      code: "BØA3020",
      name: "Økonomistyringssystemer",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "oa_rs3v5",
      code: "BINT3005",
      name: "Internship i økonomi og ledelse",
      credits: 15,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_rs3v_valg",
      isSelected: false,
    },
  ],

  // === ØKONOMI OG ADMINISTRASJON - SAMFUNNSØKONOMI ===

  // 3. år Høst
  "Økonomi og administrasjon_default_3_Høst_Samfunnsøkonomi": [
    {
      id: "oa_so3h1",
      code: "SØK2011",
      name: "Offentlig økonomi og økonomisk politikk",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "oa_so3h2",
      code: "SØK2012",
      name: "Adferdsøkonomi",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "oa_so3h3a",
      code: "BBAN3001",
      name: "Essentials of Business Analytics",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_so3h_valg",
      isSelected: false,
    },
    {
      id: "oa_so3h3b",
      code: "BBOA2010",
      name: "Innføring i skatterett",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_so3h_valg",
      isSelected: false,
    },
    {
      id: "oa_so3h3c",
      code: "BBOA3005",
      name: "Digitale regnskapsprosesser",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_so3h_valg",
      isSelected: false,
    },
    {
      id: "oa_so3h3d",
      code: "BBOA3010",
      name: "Corporate Finance",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_so3h_valg",
      isSelected: false,
    },
    {
      id: "oa_so3h3e",
      code: "BBOA3015",
      name: "Bærekraftsrapportering – Introduksjon",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_so3h_valg",
      isSelected: false,
    },
    {
      id: "oa_so3h3f",
      code: "BFIN1001",
      name: "Personlig økonomi",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_so3h_valg",
      isSelected: false,
    },
    {
      id: "oa_so3h3g",
      code: "BMRK3012",
      name: "Serviceledelse og relasjonsmarkedsføring",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_so3h_valg",
      isSelected: false,
    },
    {
      id: "oa_so3h3h",
      code: "BSMØ3005",
      name: "Økonomi og bærekraft",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_so3h_valg",
      isSelected: false,
    },
    {
      id: "oa_so3h3i",
      code: "BØA2033",
      name: "Årsregnskap",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_so3h_valg",
      isSelected: false,
    },
    {
      id: "oa_so3h3j",
      code: "BØA3050",
      name: "Sentrale verktøy i økonomistyring",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_so3h_valg",
      isSelected: false,
    },
    {
      id: "oa_so3h3k",
      code: "MET2010",
      name: "Anvendt statistikk",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_so3h_valg",
      isSelected: false,
    },
    {
      id: "oa_so3h3l",
      code: "MRK2010",
      name: "Markedskommunikasjon og merkevarebygging",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_so3h_valg",
      isSelected: false,
    },
    {
      id: "oa_so3h3m",
      code: "MRK2015",
      name: "Managing Business Relationships",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_so3h_valg",
      isSelected: false,
    },
    {
      id: "oa_so3h3n",
      code: "MRK3015",
      name: "Consumer Behaviour",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_so3h_valg",
      isSelected: false,
    },
    {
      id: "oa_so3h3o",
      code: "ORG3021",
      name: "Endringsledelse",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_so3h_valg",
      isSelected: false,
    },
    {
      id: "oa_so3h3p",
      code: "SMØ2020",
      name: "Welfare Economics",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_so3h_valg",
      isSelected: false,
    },
  ],

  // 3. år Vår
  "Økonomi og administrasjon_default_3_Vår_Samfunnsøkonomi": [
    {
      id: "oa_so3v1",
      code: "SØK1025",
      name: "Makroøkonomi II",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "oa_so3v2",
      code: "SØK1026",
      name: "Arbeidsmarkedsøkonomi",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "oa_so3v3",
      code: "SØK2013",
      name: "Bacheloroppgave i samfunnsøkonomi",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "oa_so3v4a",
      code: "BBOA2020",
      name: "Videregående skatte- og avgiftsrett",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_so3v_valg",
      isSelected: false,
    },
    {
      id: "oa_so3v4b",
      code: "BBOA3020",
      name: "Finansielle institusjoner, markeder og reguleringer",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_so3v_valg",
      isSelected: false,
    },
    {
      id: "oa_so3v4c",
      code: "BBOA3030",
      name: "Videregående finansregnskap",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_so3v_valg",
      isSelected: false,
    },
    {
      id: "oa_so3v4d",
      code: "BINT3005",
      name: "Internship i økonomi og ledelse",
      credits: 15,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_so3v_valg",
      isSelected: false,
    },
    {
      id: "oa_so3v4e",
      code: "BSOL2200",
      name: "Organisasjonspsykologi og ledelse",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_so3v_valg",
      isSelected: false,
    },
    {
      id: "oa_so3v4f",
      code: "BØA2020",
      name: "Decision Modelling and Optimization",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_so3v_valg",
      isSelected: false,
    },
    {
      id: "oa_so3v4g",
      code: "BØA2042",
      name: "Financial Modeling using Excel",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_so3v_valg",
      isSelected: false,
    },
    {
      id: "oa_so3v4h",
      code: "BØA3020",
      name: "Økonomistyringssystemer",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_so3v_valg",
      isSelected: false,
    },
    {
      id: "oa_so3v4i",
      code: "MET3003",
      name: "Prosjektstyring",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_so3v_valg",
      isSelected: false,
    },
    {
      id: "oa_so3v4j",
      code: "MRK3025",
      name: "Innovation and Business Development",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_so3v_valg",
      isSelected: false,
    },
    {
      id: "oa_so3v4k",
      code: "ORG3030",
      name: "Strategic Leadership",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_so3v_valg",
      isSelected: false,
    },
  ],

  // === ØKONOMI OG ADMINISTRASJON - ØKONOMISTYRING ===

  // 3. år Høst
  "Økonomi og administrasjon_default_3_Høst_Økonomistyring": [
    {
      id: "oa_øs3h1",
      code: "AF3020",
      name: "Bacheloroppgave i økonomistyring - del 1 av 2",
      credits: 0,
      matchedWith: [],
    },
    {
      id: "oa_øs3h2",
      code: "BØA3050",
      name: "Sentrale verktøy i økonomistyring",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "oa_øs3h3a",
      code: "BBAN3001",
      name: "Essentials of Business Analytics",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_øs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_øs3h3b",
      code: "BBOA2010",
      name: "Innføring i skatterett",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_øs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_øs3h3c",
      code: "BBOA3005",
      name: "Digitale regnskapsprosesser",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_øs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_øs3h3d",
      code: "BBOA3010",
      name: "Corporate Finance",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_øs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_øs3h3e",
      code: "BBOA3015",
      name: "Bærekraftsrapportering – Introduksjon",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_øs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_øs3h3f",
      code: "BFIN1001",
      name: "Personlig økonomi",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_øs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_øs3h3g",
      code: "BMRK3012",
      name: "Serviceledelse og relasjonsmarkedsføring",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_øs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_øs3h3h",
      code: "BSMØ3005",
      name: "Økonomi og bærekraft",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_øs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_øs3h3i",
      code: "BØA2033",
      name: "Årsregnskap",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_øs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_øs3h3j",
      code: "FIN1001",
      name: "Personlig økonomi",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_øs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_øs3h3k",
      code: "MET2010",
      name: "Anvendt statistikk",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_øs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_øs3h3l",
      code: "MRK2010",
      name: "Markedskommunikasjon og merkevarebygging",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_øs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_øs3h3m",
      code: "MRK2015",
      name: "Managing Business Relationships",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_øs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_øs3h3n",
      code: "MRK3015",
      name: "Consumer Behaviour",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_øs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_øs3h3o",
      code: "ORG3021",
      name: "Endringsledelse",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_øs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_øs3h3p",
      code: "SMØ2020",
      name: "Welfare Economics",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_øs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_øs3h3q",
      code: "SPR2010",
      name: "Business and Management English",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_øs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_øs3h3r",
      code: "SØK2011",
      name: "Offentlig økonomi og økonomisk politikk",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_øs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_øs3h3s",
      code: "SØK2012",
      name: "Adferdsøkonomi",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_øs3h_valg",
      isSelected: false,
    },
  ],

  // 3. år Vår
  "Økonomi og administrasjon_default_3_Vår_Økonomistyring": [
    {
      id: "oa_øs3v1",
      code: "AF3020",
      name: "Bacheloroppgave i økonomistyring - del 2 av 2",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "oa_øs3v2",
      code: "BØA2020",
      name: "Decision Modelling and Optimization",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "oa_øs3v3",
      code: "BØA3020",
      name: "Økonomistyringssystemer",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "oa_øs3v4a",
      code: "BBOA2020",
      name: "Videregående skatte- og avgiftsrett",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_øs3v_valg",
      isSelected: false,
    },
    {
      id: "oa_øs3v4b",
      code: "BBOA3020",
      name: "Finansielle institusjoner, markeder og reguleringer",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_øs3v_valg",
      isSelected: false,
    },
    {
      id: "oa_øs3v4c",
      code: "BBOA3030",
      name: "Videregående finansregnskap",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_øs3v_valg",
      isSelected: false,
    },
    {
      id: "oa_øs3v4d",
      code: "BINT3005",
      name: "Internship i økonomi og ledelse",
      credits: 15,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_øs3v_valg",
      isSelected: false,
    },
    {
      id: "oa_øs3v4e",
      code: "BSOL2200",
      name: "Organisasjonspsykologi og ledelse",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_øs3v_valg",
      isSelected: false,
    },
    {
      id: "oa_øs3v4f",
      code: "BØA2042",
      name: "Financial Modeling using Excel",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_øs3v_valg",
      isSelected: false,
    },
    {
      id: "oa_øs3v4g",
      code: "MET3003",
      name: "Prosjektstyring",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_øs3v_valg",
      isSelected: false,
    },
    {
      id: "oa_øs3v4h",
      code: "MRK3025",
      name: "Innovation and Business Development",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_øs3v_valg",
      isSelected: false,
    },
    {
      id: "oa_øs3v4i",
      code: "ORG3030",
      name: "Strategic Leadership",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_øs3v_valg",
      isSelected: false,
    },
  ],

  // === ØKONOMI OG ADMINISTRASJON - BUSINESS ANALYTICS ===

  // 3. år Høst
  "Økonomi og administrasjon_default_3_Høst_Business Analytics": [
    {
      id: "oa_ba3h1",
      code: "AF3035",
      name: "Bacheloroppgave i Business Analytics - del 1 av 2",
      credits: 0,
      matchedWith: [],
    },
    {
      id: "oa_ba3h2",
      code: "BBAN3001",
      name: "Essentials of Business Analytics",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "oa_ba3h3a",
      code: "BBOA2010",
      name: "Innføring i skatterett",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_ba3h_valg",
      isSelected: false,
    },
    {
      id: "oa_ba3h3b",
      code: "BBOA3005",
      name: "Digitale regnskapsprosesser",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_ba3h_valg",
      isSelected: false,
    },
    {
      id: "oa_ba3h3c",
      code: "BBOA3010",
      name: "Corporate Finance",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_ba3h_valg",
      isSelected: false,
    },
    {
      id: "oa_ba3h3d",
      code: "BBOA3015",
      name: "Bærekraftsrapportering – Introduksjon",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_ba3h_valg",
      isSelected: false,
    },
    {
      id: "oa_ba3h3e",
      code: "BFIN1001",
      name: "Personlig økonomi",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_ba3h_valg",
      isSelected: false,
    },
    {
      id: "oa_ba3h3f",
      code: "BMRK3012",
      name: "Serviceledelse og relasjonsmarkedsføring",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_ba3h_valg",
      isSelected: false,
    },
    {
      id: "oa_ba3h3g",
      code: "BSMØ3005",
      name: "Økonomi og bærekraft",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_ba3h_valg",
      isSelected: false,
    },
    {
      id: "oa_ba3h3h",
      code: "BØA2033",
      name: "Årsregnskap",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_ba3h_valg",
      isSelected: false,
    },
    {
      id: "oa_ba3h3i",
      code: "BØA3050",
      name: "Sentrale verktøy i økonomistyring",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_ba3h_valg",
      isSelected: false,
    },
    {
      id: "oa_ba3h3j",
      code: "MET2010",
      name: "Anvendt statistikk",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_ba3h_valg",
      isSelected: false,
    },
    {
      id: "oa_ba3h3k",
      code: "MRK2010",
      name: "Markedskommunikasjon og merkevarebygging",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_ba3h_valg",
      isSelected: false,
    },
    {
      id: "oa_ba3h3l",
      code: "MRK2015",
      name: "Managing Business Relationships",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_ba3h_valg",
      isSelected: false,
    },
    {
      id: "oa_ba3h3m",
      code: "MRK3015",
      name: "Consumer Behaviour",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_ba3h_valg",
      isSelected: false,
    },
    {
      id: "oa_ba3h3n",
      code: "ORG3021",
      name: "Endringsledelse",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_ba3h_valg",
      isSelected: false,
    },
    {
      id: "oa_ba3h3o",
      code: "SMØ2020",
      name: "Welfare Economics",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_ba3h_valg",
      isSelected: false,
    },
  ],

  // 3. år Vår
  "Økonomi og administrasjon_default_3_Vår_Business Analytics": [
    {
      id: "oa_ba3v1",
      code: "AF3035",
      name: "Bacheloroppgave i Business Analytics - del 2 av 2",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "oa_ba3v2",
      code: "BØA2020",
      name: "Decision Modelling and Optimization",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "oa_ba3v3",
      code: "BØA2042",
      name: "Financial Modeling using Excel",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "oa_ba3v4a",
      code: "BBOA2020",
      name: "Videregående skatte- og avgiftsrett",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_ba3v_valg",
      isSelected: false,
    },
    {
      id: "oa_ba3v4b",
      code: "BBOA3020",
      name: "Finansielle institusjoner, markeder og reguleringer",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_ba3v_valg",
      isSelected: false,
    },
    {
      id: "oa_ba3v4c",
      code: "BBOA3030",
      name: "Videregående finansregnskap",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_ba3v_valg",
      isSelected: false,
    },
    {
      id: "oa_ba3v4d",
      code: "BINT3005",
      name: "Internship i økonomi og ledelse",
      credits: 15,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_ba3v_valg",
      isSelected: false,
    },
    {
      id: "oa_ba3v4e",
      code: "BSOL2200",
      name: "Organisasjonspsykologi og ledelse",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_ba3v_valg",
      isSelected: false,
    },
    {
      id: "oa_ba3v4f",
      code: "BØA3020",
      name: "Økonomistyringssystemer",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_ba3v_valg",
      isSelected: false,
    },
    {
      id: "oa_ba3v4g",
      code: "MET3003",
      name: "Prosjektstyring",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_ba3v_valg",
      isSelected: false,
    },
    {
      id: "oa_ba3v4h",
      code: "MRK3025",
      name: "Innovation and Business Development",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_ba3v_valg",
      isSelected: false,
    },
    {
      id: "oa_ba3v4i",
      code: "ORG3030",
      name: "Strategic Leadership",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_ba3v_valg",
      isSelected: false,
    },
  ],

  // === ØKONOMI OG ADMINISTRASJON - FINANSIELL STYRING ===

  // 3. år Høst
  "Økonomi og administrasjon_default_3_Høst_Finansiell styring": [
    {
      id: "oa_fs3h1",
      code: "AF3015",
      name: "Bacheloroppgave i finansiell styring - del 1 av 2",
      credits: 0,
      matchedWith: [],
    },
    {
      id: "oa_fs3h2",
      code: "BBOA3010",
      name: "Corporate Finance",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "oa_fs3h3a",
      code: "BBAN3001",
      name: "Essentials of Business Analytics",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_fs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_fs3h3b",
      code: "BBOA2010",
      name: "Innføring i skatterett",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_fs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_fs3h3c",
      code: "BBOA3005",
      name: "Digitale regnskapsprosesser",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_fs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_fs3h3d",
      code: "BBOA3015",
      name: "Bærekraftsrapportering – Introduksjon",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_fs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_fs3h3e",
      code: "BFIN1001",
      name: "Personlig økonomi",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_fs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_fs3h3f",
      code: "BMRK3012",
      name: "Serviceledelse og relasjonsmarkedsføring",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_fs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_fs3h3g",
      code: "BSMØ3005",
      name: "Økonomi og bærekraft",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_fs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_fs3h3h",
      code: "BØA2033",
      name: "Årsregnskap",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_fs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_fs3h3i",
      code: "BØA3050",
      name: "Sentrale verktøy i økonomistyring",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_fs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_fs3h3j",
      code: "MET2010",
      name: "Anvendt statistikk",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_fs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_fs3h3k",
      code: "MRK2010",
      name: "Markedskommunikasjon og merkevarebygging",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_fs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_fs3h3l",
      code: "MRK2015",
      name: "Managing Business Relationships",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_fs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_fs3h3m",
      code: "MRK3015",
      name: "Consumer Behaviour",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_fs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_fs3h3n",
      code: "ORG3021",
      name: "Endringsledelse",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_fs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_fs3h3o",
      code: "SMØ2020",
      name: "Welfare Economics",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_fs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_fs3h3p",
      code: "SØK2011",
      name: "Offentlig økonomi og økonomisk politikk",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_fs3h_valg",
      isSelected: false,
    },
    {
      id: "oa_fs3h3q",
      code: "SØK2012",
      name: "Adferdsøkonomi",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_fs3h_valg",
      isSelected: false,
    },
  ],

  // 3. år Vår
  "Økonomi og administrasjon_default_3_Vår_Finansiell styring": [
    {
      id: "oa_fs3v1",
      code: "AF3015",
      name: "Bacheloroppgave i finansiell styring - del 2 av 2",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "oa_fs3v2",
      code: "BBOA3020",
      name: "Finansielle institusjoner, markeder og reguleringer",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "oa_fs3v3",
      code: "BØA2042",
      name: "Financial Modeling using Excel",
      credits: 7.5,
      matchedWith: [],
    },
    {
      id: "oa_fs3v4a",
      code: "BBOA2020",
      name: "Videregående skatte- og avgiftsrett",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_fs3v_valg",
      isSelected: false,
    },
    {
      id: "oa_fs3v4b",
      code: "BBOA3030",
      name: "Videregående finansregnskap",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_fs3v_valg",
      isSelected: false,
    },
    {
      id: "oa_fs3v4c",
      code: "BINT3005",
      name: "Internship i økonomi og ledelse",
      credits: 15,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_fs3v_valg",
      isSelected: false,
    },
    {
      id: "oa_fs3v4d",
      code: "BSOL2200",
      name: "Organisasjonspsykologi og ledelse",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_fs3v_valg",
      isSelected: false,
    },
    {
      id: "oa_fs3v4e",
      code: "BØA2020",
      name: "Decision Modelling and Optimization",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_fs3v_valg",
      isSelected: false,
    },
    {
      id: "oa_fs3v4f",
      code: "BØA3020",
      name: "Økonomistyringssystemer",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_fs3v_valg",
      isSelected: false,
    },
    {
      id: "oa_fs3v4g",
      code: "MET3003",
      name: "Prosjektstyring",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_fs3v_valg",
      isSelected: false,
    },
    {
      id: "oa_fs3v4h",
      code: "MRK3025",
      name: "Innovation and Business Development",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_fs3v_valg",
      isSelected: false,
    },
    {
      id: "oa_fs3v4i",
      code: "ORG3030",
      name: "Strategic Leadership",
      credits: 7.5,
      matchedWith: [],
      isElective: true,
      electiveGroup: "oa_fs3v_valg",
      isSelected: false,
    },
  ],

  // === MASKIN- OG ENERGITEKNOLOGI ===

  // 4. år Vår - Alle retninger
  "Maskin- og energiteknologi_default_4_Vår_Energi og klima i bygninger": [
    {
      id: "met_ekb4v1",
      code: "EiT",
      name: "Eksperter i team",
      credits: 7.5,
      matchedWith: [],
    },
  ],

  "Maskin- og energiteknologi_default_4_Vår_Energisystemer": [
    {
      id: "met_es4v1",
      code: "EiT",
      name: "Eksperter i team",
      credits: 7.5,
      matchedWith: [],
    },
  ],

  "Maskin- og energiteknologi_default_4_Vår_Miljøanalyse for maskin og energiteknologi":
    [
      {
        id: "met_mme4v1",
        code: "EiT",
        name: "Eksperter i team",
        credits: 7.5,
        matchedWith: [],
      },
    ],

  "Maskin- og energiteknologi_default_4_Vår_Termo og fluiddynamikk": [
    {
      id: "met_tf4v1",
      code: "EiT",
      name: "Eksperter i team",
      credits: 7.5,
      matchedWith: [],
    },
  ],
};

// Helper to get default plan
const getDefaultStudyPlan = (
  prog: string,
  techDir: string,
  spec: string,
  year: number,
  semester: string
) => {
  const _techDir = techDir === "Ingen retning" ? "default" : techDir;
  const _spec = spec === "Ingen fagretning" ? "default" : spec;

  const key = `${prog}_${_techDir}_${year}_${semester}_${_spec}`;
  const fallbackKey1 = `${prog}_${_techDir}_${year}_${semester}_default`;
  const fallbackKey2 = `${prog}_default_${year}_${semester}_default`;

  return (
    MOCK_STUDY_PLANS[key] ||
    MOCK_STUDY_PLANS[fallbackKey1] ||
    MOCK_STUDY_PLANS[fallbackKey2] ||
    []
  );
};

const MOCK_EXCHANGE_PLANS: ExchangePlan[] = [
  {
    id: "plan-1",
    university: "NTNU",
    exchangeUniversity: "Italy - The University of Bologna",
    program: "Datateknologi",
    studyYear: 4,
    semesterChoice: "Høst",
    subjects: [
      {
        id: "h1",
        code: "TDT4120",
        name: "Algoritmer og Datastrukturer",
        credits: 7.5,
        matchedWith: [],
      },
      {
        id: "h2",
        code: "TDT4145",
        name: "Datamodellering og Databasesystemer",
        credits: 7.5,
        matchedWith: [],
      },
      {
        id: "h3",
        code: "TDT4200",
        name: "Parallell Databehandling",
        credits: 7.5,
        matchedWith: [],
      },
    ],
  },
];

// PDF Generation Function
async function generateExchangePlanPDF(
  subjects: Subject[],
  metadata: {
    program: string;
    exchangeUniversity: string;
    university: string;
    studyYear: number;
    semesterChoice: string;
    exchangeYear: number;
    technologyDirection?: string;
    specialization?: string;
    userName: string;
  }
) {
  const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");

  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();
  const margin = 50;
  let yPosition = height - margin;

  // Title
  page.drawText("Utvekslingsplan", {
    x: margin,
    y: yPosition,
    size: 24,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  yPosition -= 40;

  // Student info
  page.drawText(`Student: ${metadata.userName}`, {
    x: margin,
    y: yPosition,
    size: 12,
    font: helveticaFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  yPosition -= 20;

  page.drawText(`Dato: ${new Date().toLocaleDateString("nb-NO")}`, {
    x: margin,
    y: yPosition,
    size: 12,
    font: helveticaFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  yPosition -= 35;

  // Divider line
  page.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: width - margin, y: yPosition },
    thickness: 1,
    color: rgb(0.7, 0.7, 0.7),
  });
  yPosition -= 25;

  // Plan details section
  page.drawText("Plandetaljer", {
    x: margin,
    y: yPosition,
    size: 16,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  yPosition -= 25;

  const details = [
    { label: "Hjemmeuniversitet:", value: metadata.university },
    { label: "Utvekslingsuniversitet:", value: metadata.exchangeUniversity },
    { label: "Studieprogram:", value: metadata.program },
  ];

  if (
    metadata.technologyDirection &&
    metadata.technologyDirection !== "Ingen retning"
  ) {
    details.push({
      label: "Teknologiretning:",
      value: metadata.technologyDirection,
    });
  }

  if (
    metadata.specialization &&
    metadata.specialization !== "Ingen fagretning"
  ) {
    details.push({ label: "Fagretning:", value: metadata.specialization });
  }

  details.push(
    { label: "Årstrinn:", value: `${metadata.studyYear}. klasse` },
    { label: "Semester:", value: metadata.semesterChoice },
    { label: "Utvekslingsår:", value: metadata.exchangeYear.toString() }
  );

  for (const detail of details) {
    page.drawText(detail.label, {
      x: margin,
      y: yPosition,
      size: 11,
      font: helveticaBold,
      color: rgb(0.3, 0.3, 0.3),
    });
    page.drawText(detail.value, {
      x: margin + 160,
      y: yPosition,
      size: 11,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 18;
  }

  yPosition -= 15;

  // Divider line
  page.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: width - margin, y: yPosition },
    thickness: 1,
    color: rgb(0.7, 0.7, 0.7),
  });
  yPosition -= 25;

  // Courses section
  page.drawText("Fagmatchinger", {
    x: margin,
    y: yPosition,
    size: 16,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  yPosition -= 25;

  // Calculate total ECTS
  const totalECTS = subjects.reduce((total, sub) => {
    const subECTS = sub.matchedWith.reduce((subTotal, match) => {
      return subTotal + (parseFloat(match.ects || "0") || 0);
    }, 0);
    return total + subECTS;
  }, 0);

  page.drawText(`Totalt ${totalECTS} ECTS`, {
    x: margin,
    y: yPosition,
    size: 11,
    font: helveticaFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  yPosition -= 30;

  // List each course
  for (let i = 0; i < subjects.length; i++) {
    const subject = subjects[i];

    // Check if we need a new page
    if (yPosition < 150) {
      page = pdfDoc.addPage([595, 842]);
      yPosition = height - margin;
    }

    // NTNU Course (Home)
    page.drawText(`${i + 1}. NTNU-fag:`, {
      x: margin,
      y: yPosition,
      size: 11,
      font: helveticaBold,
      color: rgb(0, 0.3, 0.6),
    });
    yPosition -= 18;

    page.drawText(`${subject.code} - ${subject.name}`, {
      x: margin + 10,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
      maxWidth: width - 2 * margin - 10,
    });
    yPosition -= 15;

    page.drawText(`Studiepoeng: ${subject.credits} ECTS`, {
      x: margin + 10,
      y: yPosition,
      size: 9,
      font: helveticaFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPosition -= 20;

    // Exchange courses that replace it
    if (subject.matchedWith.length > 0) {
      page.drawText(`   Erstattes av:`, {
        x: margin,
        y: yPosition,
        size: 10,
        font: helveticaBold,
        color: rgb(0, 0.5, 0),
      });
      yPosition -= 15;

      for (const match of subject.matchedWith) {
        // Check if we need a new page
        if (yPosition < 100) {
          page = pdfDoc.addPage([595, 842]);
          yPosition = height - margin;
        }

        page.drawText(`   • ${match.code} - ${match.name}`, {
          x: margin + 10,
          y: yPosition,
          size: 9,
          font: helveticaFont,
          color: rgb(0, 0, 0),
          maxWidth: width - 2 * margin - 20,
        });
        yPosition -= 14;

        const matchDetails = [];
        if (match.university) matchDetails.push(match.university);
        if (match.ects) matchDetails.push(`${match.ects} ECTS`);
        if (match.semester && match.semester !== "null")
          matchDetails.push(match.semester);

        if (matchDetails.length > 0) {
          page.drawText(`     ${matchDetails.join(" • ")}`, {
            x: margin + 10,
            y: yPosition,
            size: 8,
            font: helveticaFont,
            color: rgb(0.4, 0.4, 0.4),
          });
          yPosition -= 12;
        }

        if (match.isVerified === false && match.addedBy) {
          page.drawText(`     Lagt til av: ${match.addedBy}`, {
            x: margin + 10,
            y: yPosition,
            size: 7,
            font: helveticaFont,
            color: rgb(0.5, 0.5, 0.5),
          });
          yPosition -= 10;
        }

        yPosition -= 5;
      }
    } else {
      page.drawText(`   ⚠ Ikke matchet`, {
        x: margin,
        y: yPosition,
        size: 10,
        font: helveticaBold,
        color: rgb(0.8, 0.3, 0),
      });
      yPosition -= 15;
    }

    yPosition -= 15;

    // Separator line between subjects
    if (i < subjects.length - 1) {
      page.drawLine({
        start: { x: margin + 10, y: yPosition },
        end: { x: width - margin - 10, y: yPosition },
        thickness: 0.5,
        color: rgb(0.85, 0.85, 0.85),
      });
      yPosition -= 20;
    }
  }

  // Add footer to all pages
  const pages = pdfDoc.getPages();
  pages.forEach((p, index) => {
    p.drawText(
      `Side ${index + 1} av ${
        pages.length
      } • Generert ${new Date().toLocaleDateString("nb-NO")}`,
      {
        x: margin,
        y: 30,
        size: 8,
        font: helveticaFont,
        color: rgb(0.5, 0.5, 0.5),
      }
    );
  });

  // Save and download
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([new Uint8Array(pdfBytes)], {
    type: "application/pdf",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Utvekslingsplan_${metadata.exchangeUniversity.replace(
    /[^a-zA-Z0-9]/g,
    "_"
  )}_${metadata.semesterChoice}${metadata.exchangeYear}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ExchangePlannerFull() {
  const { data: session } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(0); // 0: Dashboard, 1: Profil, 2: Fag, 3: Planlegger, 4: Last ned PDF
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  // State for plans
  const [myPlans, setMyPlans] = useState<ExchangePlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editingPlanName, setEditingPlanName] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // State: Steg 1
  const [university, setUniversity] = useState("NTNU"); // Home university
  const [exchangeUniversity, setExchangeUniversity] = useState("Ingen valgt"); // Exchange university
  const [program, setProgram] = useState("");
  const [technologyDirection, setTechnologyDirection] =
    useState("Ingen retning");
  const [specialization, setSpecialization] = useState("Ingen fagretning");
  const [studyYear, setStudyYear] = useState<number>(4);
  const [exchangeYear, setExchangeYear] = useState<number>(
    new Date().getFullYear() + 1
  );
  const [semesterChoice, setSemesterChoice] = useState("Høst");

  // State: Steg 2 & 3
  const [mySubjects, setMySubjects] = useState<Subject[]>([]);
  const [planName, setPlanName] = useState("");

  // State: Legge til manuelt fag
  const [newSubjectCode, setNewSubjectCode] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectCredits, setNewSubjectCredits] = useState("7.5");
  const [courseSearchResults, setCourseSearchResults] = useState<
    Array<{
      code: string;
      name: string;
      credits: number;
    }>
  >([]);
  const [showCodeDropdown, setShowCodeDropdown] = useState(false);
  const [showNameDropdown, setShowNameDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeField, setActiveField] = useState<"code" | "name" | null>(null);

  // State: Approved courses from API
  const [approvedCourses, setApprovedCourses] = useState<AbroadSubject[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [universityCountryPairs, setUniversityCountryPairs] = useState<
    { university: string; country: string }[]
  >([]);

  // Fetch filters on mount
  useEffect(() => {
    fetch("/api/approved-courses/filters")
      .then((res) => res.json())
      .then((data) => {
        if (data.university_country_pairs) {
          setUniversityCountryPairs(data.university_country_pairs);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch filters:", error);
      });
  }, []);

  // Auto-fill study program from user profile when creating new plan
  useEffect(() => {
    if (session?.user?.study_program && step === 1 && !program) {
      setProgram(session.user.study_program);
    }
  }, [session, step, program]);

  // Fetch approved courses when university changes
  useEffect(() => {
    const uniName = exchangeUniversity.includes(" - ")
      ? exchangeUniversity.split(" - ")[1]
      : exchangeUniversity;

    if (uniName === "Ingen valgt") {
      setApprovedCourses([]);
      setCoursesLoading(false);
      return;
    }

    setCoursesLoading(true);
    fetch(
      `/api/approved-courses?university=${encodeURIComponent(
        uniName
      )}&limit=500`
    )
      .then((res) => res.json())
      .then((data) => {
        // Handle new response structure { courses: [], pagination: {} }
        const coursesList = data.courses || [];
        const courses = coursesList.map((course: any, index: number) => {
          const isVerified = course.verified === true;
          return {
            id: `abroad-${course.id || index}`,
            code: course.Bologna_Emnekode || course.Foreign_Emnekode || "",
            name: course.Bologna_Fagnavn || course.Foreign_Fagnavn || "",
            university: course.University || "",
            country: course.Country || "",
            matchesHomeSubjectCode: course.NTNU_Emnekode || "",
            ects: course.ECTS || "",
            behandlingsdato: course.Behandlingsdato || "",
            isVerified,
            wikiUrl: course.Wiki_URL || undefined,
            addedBy: isVerified ? undefined : course.addedBy || "Ukjent bruker",
            semester: course.Semester || undefined,
          };
        });
        setApprovedCourses(courses);
        setCoursesLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch approved courses:", error);
        setCoursesLoading(false);
      });
  }, [exchangeUniversity]);

  // Restore progress if saved
  useEffect(() => {
    const savedProgress = localStorage.getItem("unsaved_plan_progress");
    if (savedProgress) {
      if (session) {
        try {
          const parsed = JSON.parse(savedProgress);
          setUniversity(parsed.university);
          setExchangeUniversity(parsed.exchangeUniversity);

          // Handle program restoration
          if (parsed.program) {
            setProgram(parsed.program);
          }

          setTechnologyDirection(parsed.technologyDirection);
          setSpecialization(parsed.specialization);
          setStudyYear(parsed.studyYear);
          setSemesterChoice(parsed.semesterChoice);
          setMySubjects(parsed.mySubjects);
          setStep(4); // Go to the download step
          localStorage.removeItem("unsaved_plan_progress");
        } catch (e) {
          console.error("Failed to parse saved progress", e);
          localStorage.removeItem("unsaved_plan_progress");
        }
      }
    }

    // Load plans from database when logged in
    if (session) {
      // Try to load from cache first for instant display
      try {
        const cached = sessionStorage.getItem("cached_plans");
        if (cached) {
          const cachedPlans = JSON.parse(cached);
          setMyPlans(cachedPlans);
          setPlansLoading(false);
        }
      } catch (e) {
        console.error("Failed to load cached plans:", e);
      }

      // Then fetch fresh data in background
      getUserPlans()
        .then((response) => {
          if (response.success && response.plans) {
            // Convert database plans to local format
            const dbPlans = response.plans.map((dbPlan: any) => {
              // Parse notes to get extra metadata
              let parsedNotes = {
                program: "",
                technologyDirection: "",
                specialization: "",
                studyYear: 4,
              };

              try {
                if (dbPlan.notes && dbPlan.notes.startsWith("{")) {
                  parsedNotes = JSON.parse(dbPlan.notes);
                } else {
                  // Fallback for legacy notes "Program - Specialization"
                  const parts = (dbPlan.notes || "").split(" - ");
                  if (parts.length > 0) parsedNotes.program = parts[0];
                  if (parts.length > 1) parsedNotes.specialization = parts[1];
                }
              } catch (e) {
                console.error("Failed to parse plan notes", e);
              }

              // Group courses by replaces_course_code to handle 1:N matching
              const groupedCourses = (dbPlan.courses || []).reduce(
                (acc: any, course: any) => {
                  const homeCode =
                    course.replaces_course_code || `unknown-${course.id}`;

                  if (!acc[homeCode]) {
                    acc[homeCode] = {
                      homeCode: homeCode,
                      homeName: course.replaces_course_name,
                      matches: [],
                    };
                  }

                  if (course.course_code) {
                    acc[homeCode].matches.push({
                      id: `abroad-${course.id}`,
                      code: course.course_code,
                      name: course.course_name || "",
                      university: dbPlan.university_name,
                      country: dbPlan.country || "",
                      matchesHomeSubjectCode: course.replaces_course_code,
                      ects: course.ects_points?.toString() || "",
                    });
                  }
                  return acc;
                },
                {}
              );

              // Convert grouped courses to Subject format
              const subjects: Subject[] = Object.values(groupedCourses).map(
                (group: any) => ({
                  id: `db-sub-${group.homeCode}`,
                  code: group.homeCode,
                  name: group.homeName || "",
                  credits: 7.5, // Default, will be overwritten by openPlan merging
                  isSelected: true,
                  matchedWith: group.matches,
                })
              );

              return {
                id: `db-${dbPlan.id}`,
                planName: dbPlan.plan_name,
                university: "NTNU",
                exchangeUniversity: dbPlan.country
                  ? `${dbPlan.country} - ${dbPlan.university_name}`
                  : dbPlan.university_name,
                program: parsedNotes.program || "",
                technologyDirection: parsedNotes.technologyDirection || "",
                specialization: parsedNotes.specialization || "",
                studyYear: parsedNotes.studyYear || 4,
                semesterChoice: dbPlan.semester || "Høst",
                subjects,
              };
            });
            setMyPlans(dbPlans);
            // Cache the plans for next time
            try {
              sessionStorage.setItem("cached_plans", JSON.stringify(dbPlans));
            } catch (e) {
              console.error("Failed to cache plans:", e);
            }
          }
        })
        .catch((error) => {
          console.error("Failed to load plans from database:", error);
        })
        .finally(() => {
          setPlansLoading(false);
        });
    } else {
      setPlansLoading(false);
    }
  }, [session]);

  // Autocomplete search for NTNU courses
  useEffect(() => {
    const searchCourses = async () => {
      const searchQuery =
        activeField === "code" ? newSubjectCode : newSubjectName;

      if (!searchQuery || searchQuery.trim().length < 1) {
        setCourseSearchResults([]);
        setShowCodeDropdown(false);
        setShowNameDropdown(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/ntnu-courses?q=${encodeURIComponent(searchQuery)}&limit=8`
        );
        const data = await response.json();
        setCourseSearchResults(data.courses || []);

        if (activeField === "code") {
          setShowCodeDropdown(data.courses?.length > 0);
          setShowNameDropdown(false);
        } else if (activeField === "name") {
          setShowNameDropdown(data.courses?.length > 0);
          setShowCodeDropdown(false);
        }
      } catch (error) {
        console.error("Failed to search courses:", error);
        setCourseSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    if (activeField) {
      const debounceTimer = setTimeout(searchCourses, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [newSubjectCode, newSubjectName, activeField]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".course-input-container")) {
        setShowCodeDropdown(false);
        setShowNameDropdown(false);
      }
    };

    if (showCodeDropdown || showNameDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showCodeDropdown, showNameDropdown]);

  // --- HJELPEFUNKSJONER ---
  // Helper to update cache whenever plans change
  const updatePlansCache = (plans: ExchangePlan[]) => {
    try {
      sessionStorage.setItem("cached_plans", JSON.stringify(plans));
    } catch (e) {
      console.error("Failed to update cache:", e);
    }
  };

  const calculatedSemester =
    semesterChoice === "Høst" ? studyYear * 2 - 1 : studyYear * 2;

  const handleFetchSubjects = () => {
    // Valider at utvekslingsuniversitet og studieprogram er valgt
    if (exchangeUniversity === "Ingen valgt" || !exchangeUniversity) {
      toast.error("Vennligst velg et utvekslingsuniversitet først");
      return;
    }
    if (!program || program === "") {
      toast.error("Vennligst velg et studieprogram først");
      return;
    }

    // Map program name to key used in MOCK_STUDY_PLANS
    const programKey = program === "Industriell økonomi og teknologiledelse" ? "Indøk" : program;

    // Bygg nøkkel basert på program, teknologiretning, år, semester og spesialisering
    const techDir =
      technologyDirection === "Ingen retning" ? "default" : technologyDirection;
    const spec =
      specialization === "Ingen fagretning" ? "default" : specialization;

    // For Indøk: Program_TechDir_Year_Semester_Spec
    // For andre: Program_default_Year_Semester_Spec
    const key = `${programKey}_${techDir}_${studyYear}_${semesterChoice}_${spec}`;
    const fallbackKey1 = `${programKey}_${techDir}_${studyYear}_${semesterChoice}_default`;
    const fallbackKey2 = `${programKey}_default_${studyYear}_${semesterChoice}_default`;

    const defaultPlan =
      MOCK_STUDY_PLANS[key] ||
      MOCK_STUDY_PLANS[fallbackKey1] ||
      MOCK_STUDY_PLANS[fallbackKey2] ||
      [];

    // Only set subjects if they're empty (first time loading)
    // This preserves user selections when navigating back
    if (mySubjects.length === 0) {
      setMySubjects(defaultPlan);
    }
    setStep(2);
  };

  const handleSelectCourse = (course: {
    code: string;
    name: string;
    credits: number;
  }) => {
    setNewSubjectCode(course.code);
    setNewSubjectName(course.name);
    setNewSubjectCredits(course.credits.toString());
    setShowCodeDropdown(false);
    setShowNameDropdown(false);
    setCourseSearchResults([]);
    setActiveField(null);
  };

  const handleAddSubject = () => {
    if (!newSubjectCode || !newSubjectName) return;
    const credits = parseFloat(newSubjectCredits) || 7.5;
    const newSub: Subject = {
      id: Math.random().toString(),
      code: newSubjectCode,
      name: newSubjectName,
      credits,
      matchedWith: [],
      isSelected: true, // Manuelt lagt til fag er alltid valgt
    };
    setMySubjects([...mySubjects, newSub]);
    setNewSubjectCode("");
    setNewSubjectName("");
    setNewSubjectCredits("7.5");
    setCourseSearchResults([]);
    setShowCodeDropdown(false);
    setShowNameDropdown(false);
    setActiveField(null);
  };

  const handleToggleSubjectSelection = (subjectId: string) => {
    setMySubjects((prev) =>
      prev.map((sub) =>
        sub.id === subjectId ? { ...sub, isSelected: !sub.isSelected } : sub
      )
    );
  };

  const resetCreatorForm = () => {
    setUniversity("NTNU");
    setExchangeUniversity("Ingen valgt");
    setProgram(session?.user?.study_program || "");
    setTechnologyDirection("Ingen retning");
    setSpecialization("Ingen fagretning");
    setStudyYear(4);
    setExchangeYear(new Date().getFullYear() + 1);
    setSemesterChoice("Høst");
    setMySubjects([]);
    setEditingPlanId(null);
  };

  const handleSavePlan = async () => {
    // Prevent double-clicking
    if (isSaving) return;

    // Check if user is logged in
    if (!session) {
      const progressToSave = {
        university,
        exchangeUniversity,
        program,
        technologyDirection,
        specialization,
        studyYear,
        semesterChoice,
        mySubjects,
      };
      localStorage.setItem(
        "unsaved_plan_progress",
        JSON.stringify(progressToSave)
      );
      router.push("/auth/signin");
      return;
    }

    setIsSaving(true);

    // Filtrer ut ikke-valgte valgfrie fag før lagring
    const selectedSubjects = mySubjects.filter(
      (sub) => !sub.isElective || sub.isSelected === true
    );

    // Prepare courses for database
    const courses = selectedSubjects.flatMap((sub) => {
      if (sub.matchedWith.length > 0) {
        return sub.matchedWith.map((match) => ({
          course_code: match.code,
          course_name: match.name,
          ects_points: match.ects ? parseFloat(match.ects) : undefined,
          semester: semesterChoice,
          replaces_course_code: sub.code,
          replaces_course_name: sub.name,
        }));
      }
      return [];
    });

    try {
      // Split "Country - University" string
      const parts = exchangeUniversity.split(" - ");
      const countryName = parts.length > 1 ? parts[0] : "";
      const universityName =
        parts.length > 1 ? parts.slice(1).join(" - ") : exchangeUniversity;

      if (editingPlanId && editingPlanId.startsWith("db-")) {
        // Update existing database plan
        const dbId = parseInt(editingPlanId.replace("db-", ""));
        const updatedPlan: ExchangePlan = {
          id: editingPlanId,
          university,
          exchangeUniversity,
          program,
          technologyDirection,
          specialization,
          studyYear,
          semesterChoice,
          subjects: selectedSubjects,
        };

        // Optimistic update - oppdater UI med en gang
        const previousPlans = myPlans;
        const newPlans = myPlans.map((p) =>
          p.id === editingPlanId ? updatedPlan : p
        );
        setMyPlans(newPlans);
        updatePlansCache(newPlans);

        try {
          await updateExchangePlan(dbId, {
            university_name: universityName,
            country: countryName,
            semester: semesterChoice,
            exchange_year: exchangeYear,
            duration: 1,
            selected_courses: courses,
            notes: JSON.stringify({
              program,
              specialization,
              studyYear,
              technologyDirection,
            }),
            status: "draft",
          });
        } catch (error: any) {
          // Rollback hvis det feiler
          setMyPlans(previousPlans);
          updatePlansCache(previousPlans);
          throw error;
        }
      } else {
        // Save new plan to database
        const defaultPlanName =
          planName ||
          `${exchangeUniversity} - ${semesterChoice} ${exchangeYear}`;

        // Opprett midlertidig plan med en gang
        const tempId = `temp-${Date.now()}`;
        const tempPlan: ExchangePlan = {
          id: tempId,
          planName: defaultPlanName,
          university,
          exchangeUniversity,
          program,
          technologyDirection,
          specialization,
          studyYear,
          semesterChoice,
          subjects: selectedSubjects,
        };

        // Optimistic update - legg til plan i UI med en gang
        setMyPlans((prevPlans) => {
          const newPlans = [tempPlan, ...prevPlans];
          updatePlansCache(newPlans);
          return newPlans;
        });

        try {
          const result = await saveExchangePlan({
            plan_name: defaultPlanName,
            university_name: universityName,
            country: countryName,
            semester: semesterChoice,
            exchange_year: exchangeYear,
            duration: 1,
            selected_courses: courses,
            notes: JSON.stringify({
              program,
              specialization,
              studyYear,
              technologyDirection,
            }),
            status: "draft",
          });

          // Erstatt midlertidig ID med ekte database ID
          setMyPlans((prevPlans) => {
            const updatedPlans = prevPlans.map((p) =>
              p.id === tempId ? { ...p, id: `db-${result.plan.id}` } : p
            );
            updatePlansCache(updatedPlans);
            return updatedPlans;
          });
        } catch (error: any) {
          // Fjern midlertidig plan hvis det feiler
          setMyPlans((prevPlans) => {
            const filteredPlans = prevPlans.filter((p) => p.id !== tempId);
            updatePlansCache(filteredPlans);
            return filteredPlans;
          });
          throw error;
        }
      }

      // Gå tilbake til dashboard først
        setIsSaving(false);
        setStep(0);
        resetCreatorForm();

      // Vis suksess-varslingen etter kort delay
      setTimeout(() => {
        setShowSaveNotification(true);

        // Skjul varslingen etter 3 sekunder
        setTimeout(() => {
      setShowSaveNotification(false);
        }, 1000);
      }, 100);
    } catch (error: any) {
      setIsSaving(false);
      toast.error(`Kunne ikke lagre plan: ${error.message}`);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    // Optimistic update - fjern plan fra UI med en gang
    const previousPlans = myPlans;
    const newPlans = myPlans.filter((p) => p.id !== planId);
    setMyPlans(newPlans);
    updatePlansCache(newPlans);

    if (planId.startsWith("db-")) {
      // Delete from database
      const dbId = parseInt(planId.replace("db-", ""));
      try {
        await deletePlan(dbId);
      } catch (error: any) {
        // Rollback hvis det feiler
        setMyPlans(previousPlans);
        updatePlansCache(previousPlans);
        toast.error(`Kunne ikke slette plan: ${error.message}`);
      }
    }
  };

  const handleOpenPlan = (planId: string) => {
    const planToOpen = myPlans.find((p) => p.id === planId);
    if (planToOpen) {
      setUniversity(planToOpen.university);
      setExchangeUniversity(planToOpen.exchangeUniversity);
        setProgram(planToOpen.program);
      setTechnologyDirection(planToOpen.technologyDirection || "Ingen retning");
      setSpecialization(planToOpen.specialization || "Ingen fagretning");
      setStudyYear(planToOpen.studyYear);
      setSemesterChoice(planToOpen.semesterChoice);

      // Hent standard fagplan for å gjenopprette valgmuligheter
      const techDir =
        (planToOpen.technologyDirection || "Ingen retning") === "Ingen retning"
          ? "default"
          : planToOpen.technologyDirection;
      const spec =
        (planToOpen.specialization || "Ingen fagretning") === "Ingen fagretning"
          ? "default"
          : planToOpen.specialization;

      const key = `${planToOpen.program}_${techDir}_${planToOpen.studyYear}_${planToOpen.semesterChoice}_${spec}`;
      const fallbackKey1 = `${planToOpen.program}_${techDir}_${planToOpen.studyYear}_${planToOpen.semesterChoice}_default`;
      const fallbackKey2 = `${planToOpen.program}_default_${planToOpen.studyYear}_${planToOpen.semesterChoice}_default`;

      const defaultPlan =
        MOCK_STUDY_PLANS[key] ||
        MOCK_STUDY_PLANS[fallbackKey1] ||
        MOCK_STUDY_PLANS[fallbackKey2] ||
        [];

      // Flett sammen lagrede fag med standardvalg
      const savedSubjectsMap = new Map(
        planToOpen.subjects.map((s) => [s.code, s])
      );
      const mergedSubjects: Subject[] = [];

      // 1. Legg til fag fra standardplanen (behold rekkefølge)
      defaultPlan.forEach((defSub) => {
        if (savedSubjectsMap.has(defSub.code)) {
          const saved = savedSubjectsMap.get(defSub.code)!;
          // Bruk lagret versjon (med matching/status), men behold metadata fra default plan
          // Dette sikrer at f.eks. studiepoeng er korrekte selv om databasen mangler dem
          mergedSubjects.push({
            ...defSub,
            matchedWith: saved.matchedWith,
            isSelected: true,
          });
          savedSubjectsMap.delete(defSub.code);
        } else {
          // Legg til fag som ikke var valgt (gjenopprett som ikke-valgt)
          const restoredSub = { ...defSub };
          if (restoredSub.isElective) {
            restoredSub.isSelected = false;
          }
          // Hvis obligatorisk fag mangler (slettet), legges det til igjen
          mergedSubjects.push(restoredSub);
        }
      });

      // 2. Legg til gjenværende fag (manuelt lagt til)
      savedSubjectsMap.forEach((sub) => {
        mergedSubjects.push(sub);
      });

      setMySubjects(mergedSubjects);
      setEditingPlanId(planId);
      setStep(3); // Gå direkte til planleggeren
    }
  };

  // Generer universitetsvalg dynamisk fra data
  const EXCHANGE_UNIVERSITIES = [
    "Velg universitet",
    ...universityCountryPairs.map(
      (pair) => `${pair.country} - ${pair.university}`
    ),
  ] as string[];

  // Prepare options for UniversitySearchSelect
  const universityOptions = useMemo(() => {
    return [
      { value: "Ingen valgt", label: "Velg universitet" },
      ...universityCountryPairs.map((pair) => ({
        value: `${pair.country} - ${pair.university}`,
        label: `${pair.country} - ${pair.university}`,
        country: pair.country,
        university: pair.university,
      })),
    ];
  }, [universityCountryPairs]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-slate-800 font-sans">
      {/* --- GLOBAL HEADER (Vises kun under oppretting) --- */}
      {step > 0 && (
        <header className="bg-white border-b border-gray-200 shadow-sm z-30 shrink-0">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                {editingPlanId ? "Endre plan" : "Opprett ny plan"}
              </h2>
              {step === 3 && (
                <button
                  onClick={handleSavePlan}
                  disabled={isSaving}
                  className={`text-xs sm:text-sm font-medium px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors flex items-center gap-1 sm:gap-2 ${
                    isSaving
                      ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                      : "text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-600"></div>
                      <span className="hidden sm:inline">Lagrer...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} className="sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">
                        {editingPlanId ? "Lagre endringer" : "Lagre utkast"}
                      </span>
                      <span className="sm:hidden">Lagre</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="flex items-center justify-between w-full max-w-5xl mx-auto relative px-2 sm:px-0">
              <div className="absolute top-1/2 left-2 sm:left-0 right-2 sm:right-0 h-1 bg-gray-200 -z-10 rounded"></div>
              <div
                className="absolute top-1/2 left-2 sm:left-0 h-1 bg-primary -z-10 rounded transition-all duration-500"
                style={{
                  width:
                    step === 1
                      ? "calc(0% - 0px)"
                      : step === 2
                      ? "calc(33% - 16px)"
                      : step === 3
                      ? "calc(66% - 16px)"
                      : "calc(100% - 32px)",
                }}
              ></div>
              {[
                { num: 1, title: "Profil" },
                { num: 2, title: "Dine fag" },
                { num: 3, title: "Planlegger" },
                { num: 4, title: "Last ned PDF" },
              ].map((item) => (
                <div
                  key={item.num}
                  className="flex flex-col items-center bg-white px-1 sm:px-2"
                >
                  <div
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-sm font-bold border-2 transition-all ${
                      step >= item.num
                        ? "border-primary bg-primary text-white"
                        : "border-gray-300 text-gray-400"
                    }`}
                  >
                    {item.num}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs mt-1 font-medium hidden sm:inline ${
                      step >= item.num ? "text-primary" : "text-gray-400"
                    }`}
                  >
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </header>
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 relative">
        {/* Loading Screen */}
        {isSaving && (
          <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary"></div>
            <p className="mt-6 text-lg font-medium text-gray-900">
              Lagrer plan...
            </p>
            <p className="mt-2 text-sm text-gray-500">Vennligst vent</p>
          </div>
        )}

        {/* Success Notification */}
        {showSaveNotification && (
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white px-6 py-4 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-3 animate-in slide-in-from-top fade-in z-50">
            <div className="bg-primary/10 p-2 rounded-full">
              <CheckCircle className="text-primary" size={20} />
            </div>
            <span className="font-semibold text-gray-900">
              {editingPlanId ? "Planen er oppdatert!" : "Planen er lagret!"}
            </span>
          </div>
        )}

        {/* --- STEG 0: DASHBOARD / OVERSIKT --- */}
        {step === 0 && (
          <div className="p-6 sm:p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 md:mb-10">
              <div className="mb-6 md:mb-0">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-3 md:mb-4">
                  Min utveksling
                </h1>
                <p className="text-base md:text-lg text-gray-600">
                  Se, endre eller opprett nye utvekslingsplaner.
                </p>
              </div>
              <button
                onClick={() => {
                  resetCreatorForm();
                  setStep(1);
                }}
                className="mt-4 sm:mt-0 bg-primary text-white py-3 px-6 rounded-md font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={20} /> Opprett ny plan
              </button>
            </header>

            {plansLoading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                <p className="mt-4 text-slate-500">Laster planer...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {myPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-full">
                          {plan.program}
                        </span>
                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      {editingPlanName?.id === plan.id ? (
                        <div className="mt-3 flex gap-2">
                          <input
                            type="text"
                            value={editingPlanName.name}
                            onChange={(e) =>
                              setEditingPlanName({
                                id: plan.id,
                                name: e.target.value,
                              })
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm font-bold"
                            autoFocus
                          />
                          <button
                            onClick={async () => {
                              if (plan.id.startsWith("db-")) {
                                const dbId = parseInt(
                                  plan.id.replace("db-", "")
                                );
                                const newName = editingPlanName.name;
                                const oldName = plan.planName;

                                // Optimistic update - oppdater UI med en gang
                                setMyPlans((prev) => {
                                  const updated = prev.map((p) =>
                                    p.id === plan.id
                                      ? { ...p, planName: newName }
                                      : p
                                  );
                                  updatePlansCache(updated);
                                  return updated;
                                });
                                setEditingPlanName(null);

                                try {
                                  await updateExchangePlan(dbId, {
                                    plan_name: newName,
                                  });
                                } catch (error) {
                                  // Rollback hvis det feiler
                                  setMyPlans((prev) => {
                                    const rolledBack = prev.map((p) =>
                                      p.id === plan.id
                                        ? { ...p, planName: oldName }
                                        : p
                                    );
                                    updatePlansCache(rolledBack);
                                    return rolledBack;
                                  });
                                  toast.error("Kunne ikke oppdatere plannavn");
                                  console.error(
                                    "Failed to update plan name:",
                                    error
                                  );
                                }
                              }
                            }}
                            className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => setEditingPlanName(null)}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <h3
                          className="font-bold text-slate-800 mt-3 text-lg cursor-pointer hover:text-gray-700 transition-colors"
                          onClick={() =>
                            setEditingPlanName({
                              id: plan.id,
                              name: plan.planName || plan.exchangeUniversity,
                            })
                          }
                        >
                          {plan.planName || plan.exchangeUniversity}
                        </h3>
                      )}
                      <p className="text-sm text-slate-500">
                        {plan.exchangeUniversity} | {plan.university} |{" "}
                        {plan.studyYear}. klasse - {plan.semesterChoice}
                      </p>
                    </div>
                    <div className="mt-6">
                      <p className="text-sm font-medium text-slate-600 mb-2">
                        Fag ({plan.subjects.length})
                      </p>
                      <div className="space-y-2">
                        {plan.subjects.slice(0, 3).map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center gap-3 text-xs"
                          >
                            <div className="flex-shrink-0">
                              {sub.matchedWith ? (
                                <CheckCircle
                                  size={14}
                                  className="text-green-500"
                                />
                              ) : (
                                <div className="w-3.5 h-3.5 border-2 border-gray-300 rounded-full" />
                              )}
                            </div>
                            <span className="text-slate-600 font-medium">
                              {sub.code}
                            </span>
                            <span className="text-slate-400 truncate">
                              {sub.name}
                            </span>
                          </div>
                        ))}
                        {plan.subjects.length > 3 && (
                          <p className="text-xs text-slate-400 mt-1">
                            + {plan.subjects.length - 3} til...
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenPlan(plan.id)}
                      className="w-full mt-6 bg-slate-100 text-slate-700 py-2 rounded-lg font-semibold hover:bg-slate-200 transition-colors text-sm"
                    >
                      Åpne plan
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!plansLoading && myPlans.length === 0 && (
              <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl mt-6">
                <GraduationCap size={40} className="mx-auto text-gray-300" />
                <h3 className="mt-4 text-lg font-semibold text-slate-700">
                  Ingen planer ennå
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Trykk på "Opprett ny plan" for å starte.
                </p>
              </div>
            )}
          </div>
        )}

        {/* --- STEG 1: ONBOARDING --- */}
        {step === 1 && (
          <div className="flex flex-col items-center justify-center min-h-full p-4 sm:p-6 animate-in fade-in duration-500 overflow-y-auto">
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 text-center mb-4 sm:mb-6">
                Start planleggingen
              </h1>
              <div className="space-y-4 sm:space-y-5">
                {/* Hjemmeuniversitet */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                    <School size={14} /> Hjemmeuniversitet
                  </label>
                  <select
                    className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 outline-none focus:ring-2 focus:ring-gray-900"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                  >
                    <option value="NTNU">NTNU</option>
                  </select>
                </div>

                {/* Utvekslingsuniversitet */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                    <MapPin size={14} /> Utvekslingsuniversitet
                  </label>
                  <UniversitySearchSelect
                    options={universityOptions}
                    value={exchangeUniversity}
                    onChange={setExchangeUniversity}
                    placeholder="Søk etter universitet, land eller by..."
                    className="w-full"
                  />
                </div>

                {/* Studieprogram */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                    <GraduationCap size={14} /> Studieprogram
                  </label>
                  <UniversitySearchSelect
                    options={[
                      { value: "", label: "Ingen valgt" },
                      ...STUDY_PROGRAMS.map((prog) => ({
                        value: prog.value,
                        label: prog.label,
                        country: prog.category,
                      })),
                    ]}
                    value={program}
                    onChange={async (value) => {
                      setProgram(value);
                      setTechnologyDirection("Ingen retning");
                      setSpecialization("Ingen fagretning");
                      setMySubjects([]);

                      // Auto-save study program to user profile if not set
                      if (
                        session &&
                        !session.user?.study_program &&
                        value &&
                        value !== ""
                      ) {
                        try {
                          await fetch("/api/user/profile", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              study_program: value,
                            }),
                          });
                          // Session will be updated on next page load
                        } catch (error) {
                          console.error(
                            "Failed to auto-save study program:",
                            error
                          );
                        }
                      }
                    }}
                    placeholder="Søk etter studieprogram..."
                    className="w-full"
                    />
                  </div>

                {/* Teknologiretning (kun for Indøk) */}
                {TECHNOLOGY_DIRECTIONS[program === "Industriell økonomi og teknologiledelse" ? "Indøk" : program] && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                      <School size={14} /> Teknologiretning
                    </label>
                    <select
                      className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 outline-none focus:ring-2 focus:ring-gray-900"
                      value={technologyDirection}
                      onChange={(e) => {
                        setTechnologyDirection(e.target.value);
                        setSpecialization("Ingen fagretning");
                        setMySubjects([]);
                      }}
                    >
                      {TECHNOLOGY_DIRECTIONS[program === "Industriell økonomi og teknologiledelse" ? "Indøk" : program].map((tech) => (
                        <option key={tech} value={tech}>
                          {tech}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Spesialisering */}
                {(() => {
                  // Bestem hvilken nøkkel vi skal bruke for å finne spesialiseringer
                  let specKey = program;
                  if (
                    program === "Industriell økonomi og teknologiledelse" &&
                    technologyDirection !== "Ingen retning"
                  ) {
                    specKey = `Indøk_${technologyDirection}`;
                  }
                  const availableSpecs = SPECIALIZATIONS[specKey] || [];

                  return availableSpecs.length > 1 ? (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                        <BookOpen size={14} /> Fagretning
                      </label>
                      <select
                        className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 outline-none focus:ring-2 focus:ring-gray-900"
                        value={specialization}
                        onChange={(e) => {
                          setSpecialization(e.target.value);
                          setMySubjects([]);
                        }}
                      >
                        {availableSpecs.map((spec) => (
                          <option key={spec} value={spec}>
                            {spec}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null;
                })()}

                {/* Studieår og Semester */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                      <GraduationCap size={14} /> Årstrinn
                    </label>
                    <select
                      className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 outline-none focus:ring-2 focus:ring-gray-900"
                      value={studyYear}
                      onChange={(e) => {
                        setStudyYear(Number(e.target.value));
                        setMySubjects([]);
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((year) => (
                        <option key={year} value={year}>
                          {year}. klasse
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                      <Calendar size={14} /> Utvekslingsår
                    </label>
                    <select
                      className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 outline-none focus:ring-2 focus:ring-gray-900"
                      value={exchangeYear}
                      onChange={(e) => setExchangeYear(Number(e.target.value))}
                    >
                      {Array.from(
                        { length: 5 },
                        (_, i) => new Date().getFullYear() + i
                      ).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Semester
                    </label>
                    <select
                      className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 outline-none focus:ring-2 focus:ring-gray-900"
                      value={semesterChoice}
                      onChange={(e) => {
                        setSemesterChoice(e.target.value);
                        setMySubjects([]);
                      }}
                    >
                      <option value="Høst">Høst</option>
                      <option value="Vår">Vår</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4">
                  <button
                    onClick={handleFetchSubjects}
                    className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
                  >
                    Hent fagplan <ArrowRight size={20} />
                  </button>
                  <p className="text-xs text-center text-gray-400 mt-3">
                    Vi henter standard fagplan for deg, som du kan endre i neste
                    steg.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- STEG 2: SJEKKLISTE --- */}
        {step === 2 && (
          <div className="flex flex-col items-center justify-start pt-4 sm:pt-6 md:pt-10 min-h-full p-4 sm:p-6 animate-in slide-in-from-right duration-500 overflow-y-auto">
            <div className="max-w-3xl w-full">
              <button
                onClick={() => setStep(1)}
                className="text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-4 sm:mb-6 text-sm"
              >
                <ArrowLeft size={16} /> Tilbake til profil
              </button>
              <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="mb-4 sm:mb-6 border-b border-gray-100 pb-3 sm:pb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                    Bekreft dine fag
                  </h2>
                  <p className="text-sm sm:text-base text-slate-500 mt-1">
                    Dette er fagene vi forventer at du tar i{" "}
                    <strong>
                      {studyYear}. klasse ({semesterChoice.toLowerCase()})
                    </strong>
                    . Stemmer dette?
                  </p>
                </div>
                <div className="space-y-3 mb-8">
                  {/* Grupper fag basert på valgfrie grupper */}
                  {(() => {
                    const grouped: Record<string, Subject[]> = {};
                    const obligatory: Subject[] = [];

                    mySubjects.forEach((sub) => {
                      if (sub.isElective && sub.electiveGroup) {
                        if (!grouped[sub.electiveGroup])
                          grouped[sub.electiveGroup] = [];
                        grouped[sub.electiveGroup].push(sub);
                      } else if (sub.isElective) {
                        obligatory.push(sub); // Valgfrie uten gruppe
                      } else {
                        obligatory.push(sub); // Obligatoriske
                      }
                    });

                    // Calculate missing subjects from default plan
                    const defaultPlan = getDefaultStudyPlan(
                      program,
                      technologyDirection,
                      specialization,
                      studyYear,
                      semesterChoice
                    );

                    const missingSubjects = defaultPlan.filter(
                      (defSub) =>
                        !mySubjects.some((s) => s.code === defSub.code)
                    );

                    return (
                      <>
                        {/* Vis obligatoriske fag */}
                        {obligatory.map((sub) => {
                          const isSelected = sub.isElective
                            ? sub.isSelected === true
                            : true; // default false for electives, true for obligatory
                          const isObligatory = !sub.isElective;

                          return (
                            <div
                              key={sub.id}
                              onClick={() => {
                                if (sub.isElective) {
                                  handleToggleSubjectSelection(sub.id);
                                }
                              }}
                              className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                                isObligatory
                                  ? "bg-slate-50 border border-gray-200"
                                  : isSelected
                                  ? "bg-primary/5 border-2 border-primary cursor-pointer hover:border-primary-hover hover:bg-primary/10"
                                  : "bg-white border border-gray-200 cursor-pointer hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <div
                                  className={`p-2 rounded-lg border ${
                                    isObligatory
                                      ? "bg-white border-gray-200 text-slate-600"
                                      : isSelected
                                      ? "bg-primary/10 border-primary/20 text-primary"
                                      : "bg-white border-gray-200 text-slate-600"
                                  }`}
                                >
                                  <BookOpen size={20} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`font-bold ${
                                        isObligatory || !isSelected
                                          ? "text-slate-800"
                                          : "text-primary"
                                      }`}
                                    >
                                      {sub.code}
                                    </div>
                                    {sub.isElective && (
                                      <span
                                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                          isSelected
                                            ? "bg-primary/10 text-primary"
                                            : "bg-gray-100 text-gray-900"
                                        }`}
                                      >
                                        {isSelected
                                          ? "Valgt"
                                          : "Klikk for å velge"}
                                      </span>
                                    )}
                                  </div>
                                  <div
                                    className={`text-sm ${
                                      isObligatory || !isSelected
                                        ? "text-slate-500"
                                        : "text-primary"
                                    }`}
                                  >
                                    {sub.name}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMySubjects(
                                    mySubjects.filter((s) => s.id !== sub.id)
                                  );
                                }}
                                className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                title="Fjern fag"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          );
                        })}

                        {/* Vis valgfrie grupper */}
                        {Object.entries(grouped).map(([groupKey, subs]) => {
                          // Generer bedre gruppenavn
                          const groupName = groupKey.includes("gruppeA")
                            ? "Gruppe A (Velg minst 1-2 emner)"
                            : groupKey.includes("tek")
                            ? "Valgbare teknologiemner"
                            : "Velg ett av følgende fag";

                          return (
                            <div
                              key={groupKey}
                              className="border-2 border-dashed border-purple-200 bg-purple-50/30 rounded-xl p-4"
                            >
                              <div className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-2">
                                <CheckCircle size={14} /> {groupName}
                              </div>
                              <div className="space-y-2">
                                {subs.map((sub) => {
                                  const isSelected = sub.isSelected === true; // default false
                                  return (
                                    <div
                                      key={sub.id}
                                      onClick={() =>
                                        handleToggleSubjectSelection(sub.id)
                                      }
                                      className={`flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer ${
                                        isSelected
                                          ? "bg-primary/5 border-2 border-primary hover:border-primary-hover hover:bg-primary/10"
                                          : "bg-white border border-gray-200 hover:border-gray-300"
                                      }`}
                                    >
                                      <div className="flex items-center gap-3 flex-1">
                                        <div
                                          className={`p-1.5 rounded-lg border ${
                                            isSelected
                                              ? "bg-primary/10 border-primary/20 text-primary"
                                              : "bg-white border-gray-200 text-slate-600"
                                          }`}
                                        >
                                          <BookOpen size={16} />
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <div
                                              className={`font-bold text-sm ${
                                                isSelected
                                                  ? "text-primary"
                                                  : "text-slate-800"
                                              }`}
                                            >
                                              {sub.code}
                                            </div>
                                            <span
                                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                                isSelected
                                                  ? "bg-primary/10 text-primary"
                                                  : "bg-gray-100 text-gray-900"
                                              }`}
                                            >
                                              {isSelected
                                                ? "Valgt"
                                                : "Klikk for å velge"}
                                            </span>
                                          </div>
                                          <div
                                            className={`text-xs ${
                                              isSelected
                                                ? "text-primary"
                                                : "text-slate-500"
                                            }`}
                                          >
                                            {sub.name}
                                          </div>
                                        </div>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setMySubjects(
                                            mySubjects.filter(
                                              (s) => s.id !== sub.id
                                            )
                                          );
                                        }}
                                        className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                        title="Fjern fag"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}

                        {/* Vis fjernede fag fra studieplanen */}
                        {missingSubjects.length > 0 && (
                          <div className="border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl p-4">
                            <div className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-2">
                              <Trash2 size={14} /> Fjernede fag fra studieplanen
                            </div>
                            <div className="space-y-2">
                              {missingSubjects.map((sub) => (
                                <div
                                  key={sub.id}
                                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg opacity-75 hover:opacity-100 transition-opacity"
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="p-1.5 rounded-lg border bg-gray-100 border-gray-200 text-gray-400">
                                      <BookOpen size={16} />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-bold text-sm text-gray-700">
                                        {sub.code}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {sub.name}
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => {
                                      // Legg til faget tilbake i listen
                                      // Vi bruker en kopi for å unngå referanseproblemer, men beholder ID
                                      const restoredSub = { ...sub };
                                      // Hvis det er valgfritt, sett det som ikke valgt som standard
                                      if (restoredSub.isElective) {
                                        restoredSub.isSelected = false;
                                      }
                                      setMySubjects((prev) => [
                                        ...prev,
                                        restoredSub,
                                      ]);
                                    }}
                                    className="text-gray-900 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                                  >
                                    <Plus size={14} /> Legg til
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                  <div className="flex flex-col gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-dashed border-gray-200 course-input-container">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-stretch">
                      {/* Kurskode med autocomplete */}
                      <div className="relative w-full sm:w-40">
                    <input
                          placeholder="Kurskode"
                          className="p-3 rounded-lg border border-gray-300 bg-white text-sm w-full outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      value={newSubjectCode}
                          onChange={(e) => {
                            setNewSubjectCode(e.target.value);
                            setActiveField("code");
                          }}
                          onFocus={() => setActiveField("code")}
                    />
                        {activeField === "code" && isSearching && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2
                              size={14}
                              className="animate-spin text-gray-400"
                            />
                          </div>
                        )}

                        {/* Dropdown for kurskode */}
                        {showCodeDropdown && courseSearchResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                            {courseSearchResults.map((course) => (
                              <button
                                key={course.code}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleSelectCourse(course);
                                }}
                                className="w-full text-left px-3 py-2.5 hover:bg-primary/5 border-b border-gray-100 last:border-b-0 transition-colors"
                              >
                                <div className="font-bold text-sm text-slate-900">
                                  {course.code}
                                </div>
                                <div className="text-xs text-slate-600 truncate">
                                  {course.name}
                                </div>
                                <div className="text-xs font-medium text-slate-500 mt-0.5">
                                  {course.credits} sp
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Kursnavn med autocomplete */}
                      <div className="relative flex-1">
                    <input
                          placeholder="Kursnavn"
                          className="p-3 rounded-lg border border-gray-300 bg-white text-sm w-full outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      value={newSubjectName}
                          onChange={(e) => {
                            setNewSubjectName(e.target.value);
                            setActiveField("name");
                          }}
                          onFocus={() => setActiveField("name")}
                    />
                        {activeField === "name" && isSearching && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2
                              size={14}
                              className="animate-spin text-gray-400"
                            />
                          </div>
                        )}

                        {/* Dropdown for kursnavn */}
                        {showNameDropdown && courseSearchResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                            {courseSearchResults.map((course) => (
                              <button
                                key={course.code}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleSelectCourse(course);
                                }}
                                className="w-full text-left px-3 py-2.5 hover:bg-primary/5 border-b border-gray-100 last:border-b-0 transition-colors"
                              >
                                <div className="font-bold text-sm text-slate-900">
                                  {course.code}
                                </div>
                                <div className="text-xs text-slate-600">
                                  {course.name}
                                </div>
                                <div className="text-xs font-medium text-slate-500 mt-0.5">
                                  {course.credits} sp
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Studiepoeng */}
                      <div className="w-full sm:w-28">
                        <input
                          type="number"
                          step="0.5"
                          placeholder="Studiepoeng"
                          className="p-3 rounded-lg border border-gray-300 bg-white text-sm w-full outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          value={newSubjectCredits}
                          onChange={(e) => setNewSubjectCredits(e.target.value)}
                        />
                      </div>

                      {/* Legg til knapp */}
                    <button
                      onClick={handleAddSubject}
                        disabled={!newSubjectCode || !newSubjectName}
                        className="bg-primary/10 text-primary font-medium px-4 py-3 rounded-lg hover:bg-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      <Plus size={18} /> Legg til
                    </button>
                  </div>
                    <p className="text-xs text-gray-500">
                      Skriv kurskode eller kursnavn for å søke. Velg fra listen
                      eller fyll ut manuelt hvis kurset ikke finnes.
                    </p>
                </div>
                </div>

                {/* Studiepoeng-teller */}
                <div className="mt-6 mb-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                        {mySubjects
                          .filter((s) => !s.isElective || s.isSelected)
                          .reduce((sum, s) => sum + s.credits, 0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">
                          Totalt studiepoeng
                        </div>
                        <div className="text-sm text-slate-600">
                          {mySubjects.filter((s) => !s.isElective || s.isSelected).length} fag valgt
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        {mySubjects
                          .filter((s) => !s.isElective || s.isSelected)
                          .reduce((sum, s) => sum + s.credits, 0)}
                      </div>
                      <div className="text-xs text-slate-600 font-medium">
                        ECTS
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      // Gå videre uten å filtrere - alle fag beholdes
                      setStep(3);
                    }}
                    className="w-full sm:w-auto bg-primary text-white py-3 px-6 sm:px-8 rounded-xl font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/10 flex items-center justify-center gap-2"
                  >
                    Alt ser riktig ut <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- STEG 3: PLANLEGGER --- */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-start pt-4 sm:pt-6 md:pt-10 min-h-full p-4 sm:p-6 animate-in slide-in-from-right duration-500 overflow-y-auto">
            <div className="max-w-6xl w-full">
              <button
                onClick={() => setStep(2)}
                className="text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-4 sm:mb-6 text-sm"
              >
                <ArrowLeft size={16} /> Tilbake til dine fag
              </button>
              <PlannerInterface
                subjects={mySubjects}
                setSubjects={setMySubjects}
                program={program}
                semesterLabel={`${studyYear}. klasse - ${semesterChoice}`}
                semester={semesterChoice}
                exchangeUniversity={exchangeUniversity}
                onNext={() => setStep(4)}
                approvedCourses={approvedCourses}
              />
            </div>
          </div>
        )}

        {/* --- STEG 4: LAST NED PDF --- */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-start pt-4 sm:pt-6 md:pt-10 min-h-full p-4 sm:p-6 animate-in slide-in-from-right duration-500 overflow-y-auto">
            <div className="max-w-4xl w-full">
              <button
                onClick={() => setStep(3)}
                className="text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-4 sm:mb-6 text-sm"
              >
                <ArrowLeft size={16} /> Tilbake til planlegger
              </button>
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="text-green-600" size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Planen din er klar!
                  </h2>
                  <p className="text-slate-600">
                    Du har matchet alle fagene dine. Last ned planen som PDF.
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <h3 className="font-semibold text-slate-800 mb-2">
                      Plandetaljer
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Studieprogram:</span>
                        <span className="font-medium text-slate-800">
                          {program}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">
                          Utvekslingsuniversitet:
                        </span>
                        <span className="font-medium text-slate-800">
                          {exchangeUniversity}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Periode:</span>
                        <span className="font-medium text-slate-800">
                          {studyYear}. klasse - {semesterChoice}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Antall fag:</span>
                        <span className="font-medium text-slate-800">
                          {
                            mySubjects.filter(
                              (s) => !s.isElective || s.isSelected
                            ).length
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      if (!session) {
                        const progressToSave = {
                          university,
                          exchangeUniversity,
                          program,
                          technologyDirection,
                          specialization,
                          studyYear,
                          semesterChoice,
                          mySubjects,
                        };
                        localStorage.setItem(
                          "unsaved_plan_progress",
                          JSON.stringify(progressToSave)
                        );
                        router.push("/auth/signin");
                        return;
                      }

                      // Generate PDF
                      await generateExchangePlanPDF(
                        mySubjects.filter((s) => !s.isElective || s.isSelected),
                        {
                          program,
                          exchangeUniversity,
                          university,
                          studyYear,
                          semesterChoice,
                          exchangeYear,
                          technologyDirection,
                          specialization,
                          userName: session.user.name || "Bruker",
                        }
                      );
                    }}
                    className="flex-1 bg-primary text-white py-3 px-6 rounded-xl font-bold hover:bg-primary-hover transition-all shadow-lg shadow-gray-100 flex items-center justify-center gap-2"
                  >
                    <Save size={20} /> Last ned PDF
                  </button>
                  <button
                    onClick={handleSavePlan}
                    disabled={isSaving}
                    className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                      isSaving
                        ? "bg-slate-700 cursor-not-allowed"
                        : "bg-slate-900 hover:bg-slate-800"
                    } text-white`}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Lagrer...
                      </>
                    ) : (
                      <>
                        <Save size={20} /> Lagre plan
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- KOMPONENT: SELVE PLANLEGGEREN ---
function PlannerInterface({
  subjects,
  setSubjects,
  program,
  semesterLabel,
  semester,
  exchangeUniversity,
  onNext,
  approvedCourses,
}: {
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  program: string;
  semesterLabel: string;
  semester: string;
  exchangeUniversity: string;
  onNext: () => void;
  approvedCourses: AbroadSubject[];
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedCourseInfo, setSelectedCourseInfo] =
    useState<AbroadSubject | null>(null);

  // State for allowing multiple matches for a specific subject
  const [subjectsAllowingMultipleMatches, setSubjectsAllowingMultipleMatches] =
    useState<Set<string>>(new Set());

  // Calculate total ECTS
  const totalPlanECTS = subjects.reduce((total, sub) => {
    const subECTS = sub.matchedWith.reduce((subTotal, match) => {
      return subTotal + (parseFloat(match.ects || "0") || 0);
    }, 0);
    return total + subECTS;
  }, 0);

  // Equivalence map
  const EQUIVALENT_CODES: Record<string, string[]> = {
    TMA4240: ["TMA4245"],
    TMA4245: ["TMA4240"],
    TFY4107: ["TFY4115"],
    TFY4115: ["TFY4107"],
  };

  // Check if two codes are compatible (either exact match or equivalent)
  const areCodesCompatible = (homeCode: string, matchCode: string) => {
    if (homeCode === matchCode) return true;
    if (EQUIVALENT_CODES[homeCode]?.includes(matchCode)) return true;
    return false;
  };

  // State for manuell match
  const [showManualMatchForm, setShowManualMatchForm] = useState(false);
  const [manualNtnuCode, setManualNtnuCode] = useState("");
  const [manualExchangeCode, setManualExchangeCode] = useState("");
  const [manualExchangeName, setManualExchangeName] = useState("");
  const [manualECTS, setManualECTS] = useState("");
  const manualMatchFormRef = React.useRef<HTMLDivElement>(null);

  // State for course sharing modal
  const [showShareModal, setShowShareModal] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [pendingManualMatch, setPendingManualMatch] = useState<{
    ntnuCode: string;
    ntnuName: string;
    exchangeCode: string;
    exchangeName: string;
    ects: string;
    university: string;
    country: string;
  } | null>(null);
  const [manualMatches, setManualMatches] = useState<AbroadSubject[]>([]);

  const selectedSubjects = subjects.filter(
    (sub) => !sub.isElective || sub.isSelected === true
  );

  const allMatched = selectedSubjects.every(
    (sub) => sub.matchedWith.length > 0
  );

  const handleMatch = (abroadSubject: AbroadSubject, homeSubjectId: string) => {
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === homeSubjectId
          ? { ...s, matchedWith: [...s.matchedWith, abroadSubject] }
          : s
      )
    );
  };

  const handleRemoveMatch = (
    homeSubjectId: string,
    abroadSubjectId: string
  ) => {
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === homeSubjectId
          ? {
              ...s,
              matchedWith: s.matchedWith.filter(
                (m) => m.id !== abroadSubjectId
              ),
            }
          : s
      )
    );
  };

  const softDeleteSubject = (sub: Subject) => {
    if (sub.isElective) {
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === sub.id ? { ...s, isSelected: false } : s
        )
      );
    } else {
      setSubjects((prev) => prev.filter((s) => s.id !== sub.id));
    }
  };

  const addManualMatchToList = (
    ntnuCode: string,
    exchangeCode: string,
    exchangeName: string,
    ects: string,
    uniName: string,
    country: string
  ) => {
    const newManualMatch: AbroadSubject = {
      id: `manual-${Date.now()}`,
      code: exchangeCode,
      name: exchangeName,
      university: uniName !== "Ingen valgt" ? uniName : "Manuelt lagt til",
      country: country,
      matchesHomeSubjectCode: ntnuCode,
      ects: ects || "7.5",
      isVerified: false,
      addedBy: "Deg (manuelt)",
    };

    setManualMatches((prev) => [...prev, newManualMatch]);
    setManualNtnuCode("");
    setManualExchangeCode("");
    setManualExchangeName("");
    setManualECTS("");
    setShowManualMatchForm(false);

    // Automatisk match mot faget hvis koden stemmer
    const homeSubject = subjects.find(
      (s) => s.code.toUpperCase() === ntnuCode.toUpperCase()
    );
    if (homeSubject) {
      handleMatch(newManualMatch, homeSubject.id);
    }
  };

  const handleAddFillerSubject = () => {
    const newSub: Subject = {
      id: `filler-${Date.now()}`,
      code: "FYLLFAG",
      name: "Valgfritt emne / Fyllfag",
      credits: 7.5,
      matchedWith: [],
      isSelected: true,
      isElective: true,
    };
    setSubjects((prev) => [newSub, ...prev]);
  };

  const handleAddManualMatch = async () => {
    if (!manualNtnuCode || !manualExchangeCode || !manualExchangeName) {
      toast.warning("Vennligst fyll ut alle feltene");
      return;
    }

    const uniName = exchangeUniversity.includes(" - ")
      ? exchangeUniversity.split(" - ")[1]
      : exchangeUniversity;

    const country = exchangeUniversity.includes(" - ")
      ? exchangeUniversity.split(" - ")[0]
      : "";

    // Check if this match already exists in the database
    try {
      const checkResponse = await fetch(
        `/api/approved-courses/check?ntnu_code=${encodeURIComponent(
          manualNtnuCode.toUpperCase()
        )}&exchange_code=${encodeURIComponent(
          manualExchangeCode.toUpperCase()
        )}&university=${encodeURIComponent(uniName)}`
      );

      if (checkResponse.ok) {
        const { exists } = await checkResponse.json();

        // If it doesn't exist, show modal to ask if user wants to share it
        if (
          !exists &&
          uniName !== "Ingen valgt" &&
          uniName !== "Manuelt lagt til"
        ) {
          // Find NTNU course name
          const ntnuCourse = subjects.find(
            (s) =>
              s.code.trim().toUpperCase() ===
              manualNtnuCode.trim().toUpperCase()
          );
          const ntnuCourseName = ntnuCourse?.name || manualNtnuCode;

          // Store the pending match and show modal
          setPendingManualMatch({
            ntnuCode: manualNtnuCode.trim().toUpperCase(),
            ntnuName: ntnuCourseName,
            exchangeCode: manualExchangeCode.toUpperCase(),
            exchangeName: manualExchangeName,
            ects: manualECTS || "7.5",
            university: uniName,
            country: country,
          });
          setShowShareModal(true);
          return; // Don't add to list yet, wait for user decision
        }
      }
    } catch (error) {
      console.error("Error checking course match:", error);
      // Continue anyway - don't block the user if check fails
    }

    // If match already exists or check failed, add directly to list
    addManualMatchToList(
      manualNtnuCode.trim().toUpperCase(),
      manualExchangeCode.toUpperCase(),
      manualExchangeName,
      manualECTS || "7.5",
      uniName,
      country
    );
  };

  const handleShareToFagbank = async () => {
    if (!pendingManualMatch) return;

    // Check if user is logged in
    if (!session?.user) {
      router.push("/auth/signin");
      return;
    }

    setIsSharing(true);
    try {
      const submitResponse = await fetch("/api/approved-courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ntnu_course_code: pendingManualMatch.ntnuCode,
          ntnu_course_name: pendingManualMatch.ntnuName,
          exchange_university: pendingManualMatch.university,
          exchange_country: pendingManualMatch.country,
          exchange_course_code: pendingManualMatch.exchangeCode,
          exchange_course_name: pendingManualMatch.exchangeName,
          ects: parseFloat(pendingManualMatch.ects),
          semester: semester || undefined,
        }),
      });

      if (submitResponse.ok) {
        // Success - show success message
        setShareSuccess(true);

        // Add to manual matches after a brief delay to show success message
        setTimeout(() => {
          addManualMatchToList(
            pendingManualMatch.ntnuCode,
            pendingManualMatch.exchangeCode,
            pendingManualMatch.exchangeName,
            pendingManualMatch.ects,
            pendingManualMatch.university,
            pendingManualMatch.country
          );
          setShowShareModal(false);
          setPendingManualMatch(null);
          setShareSuccess(false);
          setIsSharing(false);
        }, 1500);
      } else {
        const error = await submitResponse.json();
        setIsSharing(false);
        toast.error(
          `Kunne ikke dele til fagbanken: ${error.error || "Ukjent feil"}`
        );
      }
    } catch (error) {
      console.error("Error sharing to fagbank:", error);
      setIsSharing(false);
      toast.error("En feil oppstod ved deling til fagbanken");
    }
  };

  const handleSkipSharing = () => {
    if (!pendingManualMatch) return;

    // Add to manual matches without sharing
    addManualMatchToList(
      pendingManualMatch.ntnuCode,
      pendingManualMatch.exchangeCode,
      pendingManualMatch.exchangeName,
      pendingManualMatch.ects,
      pendingManualMatch.university,
      pendingManualMatch.country
    );
    setShowShareModal(false);
    setPendingManualMatch(null);
  };

  const uniName = exchangeUniversity.includes(" - ")
    ? exchangeUniversity.split(" - ")[1]
    : exchangeUniversity;

  // Kombiner approved courses med manuelle matcher
  const allOptions = [...approvedCourses, ...manualMatches];

  // Filtrer basert på universitet og søk
  const filteredOptions = allOptions.filter((opt) => {
    // Manuelle matcher skal alltid vises
    const isManual = opt.id.toString().startsWith("manual-");

    const isFromSelectedUniversity =
      isManual ||
      uniName === "Ingen valgt" ||
      opt.university === uniName ||
      opt.university === "Manuelt lagt til";

    if (!isFromSelectedUniversity) {
      return false;
    }

    const matchesSearch =
      opt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opt.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opt.code.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Sorter og filtrer: Prioriter kompatible fag
  const sortedOptions = filteredOptions.sort((a, b) => {
    const aIsCompatible = selectedSubjects.some((s) =>
      areCodesCompatible(s.code, a.matchesHomeSubjectCode || "")
    );
    const bIsCompatible = selectedSubjects.some((s) =>
      areCodesCompatible(s.code, b.matchesHomeSubjectCode || "")
    );

    // Kompatible først
    if (aIsCompatible && !bIsCompatible) return -1;
    if (!aIsCompatible && bIsCompatible) return 1;

    // Deretter alfabetisk på navn
    return a.name.localeCompare(b.name);
  });

  // Filtrer bort fag som allerede er matchet
  const notYetMatchedOptions = sortedOptions.filter((opt) => {
    return !selectedSubjects.some((s) =>
      s.matchedWith.some((m) => m.id === opt.id)
    );
  });

  // Vis kun kompatible fag først, deretter begrens ikke-kompatible fag
  const compatibleOptions = notYetMatchedOptions.filter((opt) =>
    selectedSubjects.some((s) =>
      areCodesCompatible(s.code, opt.matchesHomeSubjectCode || "")
    )
  );
  const nonCompatibleOptions = notYetMatchedOptions.filter(
    (opt) =>
      !selectedSubjects.some((s) =>
        areCodesCompatible(s.code, opt.matchesHomeSubjectCode || "")
      )
  );

  // Bestem total limit basert på om det finnes kompatible fag
  let availableOptions: typeof notYetMatchedOptions = [];

  if (compatibleOptions.length > 0) {
    // Det finnes tilgjengelige (kompatible) fag
    const totalAvailable =
      compatibleOptions.length + nonCompatibleOptions.length;
    const maxTotal = totalAvailable <= 10 ? 10 : 20;

    // Vis alle kompatible først, fyll opp til max limit med ikke-kompatible
    const remainingSlots = maxTotal - compatibleOptions.length;
    availableOptions = [
    ...compatibleOptions,
      ...nonCompatibleOptions.slice(0, Math.max(0, remainingSlots)),
  ];
  } else {
    // Ingen kompatible fag, vis maks 10 ikke-kompatible
    availableOptions = nonCompatibleOptions.slice(0, 10);
  }

  return (
    <div className="flex flex-col lg:flex-row h-full animate-in fade-in duration-700">
      {/* Venstre side (Sticky) */}
      <aside className="w-full lg:w-1/3 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 p-4 sm:p-6 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 overflow-hidden">
        <div className="mb-4 sm:mb-6 lg:mb-8 shrink-0">
          <div className="flex justify-between items-end mb-3 sm:mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                Dine krav
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                {semesterLabel}
              </p>
            </div>
            <div className="text-right">
              <div
                className={`text-xl sm:text-2xl font-bold leading-none ${
                  totalPlanECTS >= 30 ? "text-green-600" : "text-slate-800"
                }`}
              >
                {totalPlanECTS}
                <span className="text-xs sm:text-sm font-medium text-slate-400">
                  /30
                </span>
              </div>
              <div className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider text-slate-400 mt-1">
                Studiepoeng
              </div>
            </div>
          </div>

          {/* ECTS Progress Bar */}
          <div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
            <div
              className={`absolute top-0 left-0 h-full transition-all duration-500 rounded-full ${
                totalPlanECTS >= 30 ? "bg-green-500" : "bg-slate-800"
              }`}
              style={{ width: `${Math.min((totalPlanECTS / 30) * 100, 100)}%` }}
            />
          </div>

          {/* Status Text & Subject Count */}
          <div className="flex justify-between items-start mb-4 sm:mb-6">
            {totalPlanECTS < 30 ? (
              <div className="flex items-center gap-1 sm:gap-1.5 text-yellow-700 text-[10px] sm:text-xs font-medium animate-in fade-in">
                <AlertTriangle size={11} className="sm:w-3 sm:h-3" />
                <span>Mangler {30 - totalPlanECTS} poeng</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-1.5 text-green-600 text-[10px] sm:text-xs font-medium animate-in fade-in">
                <CheckCircle size={11} className="sm:w-3 sm:h-3" />
                <span>Krav oppfylt</span>
              </div>
            )}

            <div className="text-[10px] sm:text-xs text-slate-400 font-medium">
              {selectedSubjects.filter((s) => s.matchedWith.length > 0).length}/
              {selectedSubjects.length} fag
            </div>
          </div>

          {/* Next button - kompakt versjon */}
          <button
            onClick={onNext}
            disabled={!allMatched}
            className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-xs sm:text-sm ${
              allMatched
                ? "bg-primary text-white hover:bg-primary-hover shadow-md"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            title={
              allMatched
                ? "Gå videre til PDF-nedlasting"
                : "Du må matche alle fag før du kan gå videre"
            }
          >
            {allMatched ? (
              <>
                <CheckCircle size={16} /> Gå til PDF-nedlasting
              </>
            ) : (
              <>
                {
                  selectedSubjects.filter((s) => s.matchedWith.length > 0)
                    .length
                }
                /{selectedSubjects.length} matchet
              </>
            )}
          </button>
        </div>

        <div className="space-y-3 sm:space-y-4 overflow-y-auto pb-12 sm:pb-20 pr-1 sm:pr-2">
          {allMatched && totalPlanECTS < 30 && (
            <div className="border-2 border-dashed border-yellow-300 rounded-xl p-3 sm:p-4 bg-yellow-50/50 flex flex-col justify-center items-center text-center transition-colors hover:border-yellow-400 hover:bg-yellow-100/50 animate-in fade-in mb-3 sm:mb-4">
              <span className="font-bold text-yellow-700 text-xs sm:text-sm mb-1">
                Mangler studiepoeng?
              </span>
              <p className="text-[10px] sm:text-xs text-yellow-700 mb-2 sm:mb-3">
                Du har matchet alle fagene, men mangler fortsatt{" "}
                {30 - totalPlanECTS} poeng.
              </p>
              <button
                onClick={handleAddFillerSubject}
                className="bg-yellow-100 text-yellow-700 border border-yellow-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold hover:bg-yellow-200 transition-colors flex items-center gap-1.5"
              >
                <Plus size={12} className="sm:w-[14px] sm:h-[14px]" /> Legg til
                fyllfag
              </button>
            </div>
          )}

          {selectedSubjects.map((sub) => (
            <div key={sub.id} className="relative group">
              {sub.matchedWith.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-3 sm:p-4 bg-gray-50/50 flex flex-col justify-center items-center text-center transition-colors hover:border-gray-400 hover:bg-gray-100/30">
                  <button
                    onClick={() => softDeleteSubject(sub)}
                    className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                    title="Fjern fag"
                  >
                    <Trash2 size={12} className="sm:w-[14px] sm:h-[14px]" />
                  </button>
                  <span className="font-bold text-slate-700 text-xs sm:text-sm">
                    {sub.code}
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-500 line-clamp-1 mb-2">
                    {sub.name}
                  </span>
                  <div className="flex flex-col gap-1.5 sm:gap-2 w-full">
                    <div className="text-[9px] sm:text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-medium self-center">
                      Mangler match
                    </div>

                    {/* Knapp for å legge til manuelt fag for dette kravet */}
                    <button
                      onClick={() => {
                        setManualNtnuCode(sub.code);
                        setShowManualMatchForm(true);
                        // Scroll til skjemaet etter en liten forsinkelse
                        setTimeout(() => {
                          if (manualMatchFormRef.current) {
                            const element = manualMatchFormRef.current;
                            const elementPosition =
                              element.getBoundingClientRect().top;
                            const offsetPosition =
                              elementPosition + window.pageYOffset - 100; // 100px offset fra toppen

                            window.scrollTo({
                              top: offsetPosition,
                              behavior: "smooth",
                            });
                          }
                        }, 100);
                      }}
                      className="text-[9px] sm:text-[10px] flex items-center justify-center gap-1 text-gray-900 hover:text-gray-700 hover:underline mt-1"
                    >
                      <Plus size={9} className="sm:w-[10px] sm:h-[10px]" /> Legg
                      til manuelt
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border border-green-200 bg-green-50 rounded-xl p-3 sm:p-4 shadow-sm relative">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                    <CheckCircle
                      size={12}
                      className="sm:w-[14px] sm:h-[14px] text-green-600"
                    />
                    <span className="text-[10px] sm:text-xs font-bold text-green-800 uppercase">
                      Dekket (
                      {sub.matchedWith.reduce(
                        (acc, curr) =>
                          acc + (parseFloat(curr.ects || "0") || 0),
                        0
                      )}{" "}
                      / {sub.credits} ECTS)
                    </span>
                  </div>

                  {/* NTNU-fag som dekkes */}
                  <div className="mb-2 pb-2 border-b border-green-200">
                    <p className="text-[9px] sm:text-[10px] text-green-700 font-medium mb-0.5">
                      NTNU-fag:
                    </p>
                    <p className="font-bold text-[11px] sm:text-xs text-slate-800">
                      {sub.code}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-slate-600 line-clamp-1">
                      {sub.name}
                    </p>
                  </div>

                  {/* Utvekslingsfag - Liste */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <p className="text-[9px] sm:text-[10px] text-green-700 font-medium">
                      Dekkes av:
                    </p>
                    {sub.matchedWith.map((match) => (
                      <div
                        key={match.id}
                        className="bg-white/50 p-1.5 sm:p-2 rounded border border-green-100 relative group/match"
                      >
                        <button
                          onClick={() => handleRemoveMatch(sub.id, match.id)}
                          className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1 p-0.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded opacity-100 transition-all"
                          title="Fjern denne matchen"
                        >
                          <X size={10} className="sm:w-3 sm:h-3" />
                        </button>
                        <h4 className="font-bold text-[11px] sm:text-xs text-slate-800 pr-4">
                          {match.code}
                        </h4>
                        <p className="text-[9px] sm:text-[10px] text-slate-600 line-clamp-1">
                          {match.name}
                        </p>
                        <div className="flex justify-between items-center mt-0.5 sm:mt-1">
                          <p className="text-[9px] sm:text-[10px] text-slate-500 line-clamp-1">
                            {match.university}
                          </p>
                          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0 ml-1">
                            {match.ects && (
                              <span className="text-[8px] sm:text-[10px] font-medium bg-green-100 text-green-800 px-1 sm:px-1.5 rounded whitespace-nowrap">
                                {match.ects} ECTS
                              </span>
                            )}
                            {match.semester && match.semester !== "null" && (
                              <span className="text-[8px] sm:text-[10px] font-medium bg-slate-700 text-slate-100 px-1 sm:px-1.5 rounded whitespace-nowrap">
                                {match.semester}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {!subjectsAllowingMultipleMatches.has(sub.id) && (
                    <div className="mt-2 pt-2 border-t border-green-200 flex justify-center">
                      <button
                        onClick={() =>
                          setSubjectsAllowingMultipleMatches((prev) => {
                            const newSet = new Set(prev);
                            newSet.add(sub.id);
                            return newSet;
                          })
                        }
                        className="text-[9px] sm:text-[10px] text-green-700 hover:text-green-900 font-medium flex items-center gap-1 hover:bg-green-100 px-2 py-1 rounded transition-colors"
                      >
                        <Plus size={10} className="sm:w-3 sm:h-3" /> Legg til
                        enda et fag
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Høyre side (Scrollable) */}
      <main className="w-full lg:w-2/3 bg-slate-50 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto pb-20">
          <div className="relative mb-4 sm:mb-6 lg:mb-8 sticky top-0 z-20">
            <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm -z-10 -m-4 rounded-xl"></div>
            <Search
              className="absolute left-3 sm:left-4 top-2.5 sm:top-3.5 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Søk etter fag..."
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Manuell match knapp og form */}
          <div className="mb-4 sm:mb-6">
            {!showManualMatchForm ? (
              <button
                onClick={() => {
                  setShowManualMatchForm(true);
                  // Scroll til skjemaet etter en liten forsinkelse slik at DOM-en har tid til å oppdatere
                  setTimeout(() => {
                    if (manualMatchFormRef.current) {
                      const element = manualMatchFormRef.current;
                      const elementPosition =
                        element.getBoundingClientRect().top;
                      const offsetPosition =
                        elementPosition + window.pageYOffset - 50; // 100px offset fra toppen

                      window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth",
                      });
                    }
                  }, 100);
                }}
                className="w-full bg-gray-100 border-2 border-dashed border-gray-300 text-gray-900 py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} className="sm:w-[18px] sm:h-[18px]" /> Legg til
                match manuelt
              </button>
            ) : (
              <div
                ref={manualMatchFormRef}
                className="bg-white p-4 sm:p-5 rounded-xl border-2 border-gray-300 shadow-sm"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-slate-800">
                    Legg til match manuelt
                  </h4>
                  <button
                    onClick={() => {
                      setShowManualMatchForm(false);
                      setManualNtnuCode("");
                      setManualExchangeCode("");
                      setManualExchangeName("");
                      setManualECTS("");
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Emnekode (NTNU)
                    </label>
                    <input
                      type="text"
                      placeholder="eks: EiT"
                      className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                      value={manualNtnuCode}
                      onChange={(e) => setManualNtnuCode(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1 min-h-[2rem] flex items-end">
                        Emnekode (utveksling)
                      </label>
                      <input
                        type="text"
                        placeholder="eks: COMP3900"
                        className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                        value={manualExchangeCode}
                        onChange={(e) => setManualExchangeCode(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1 min-h-[2rem] flex items-end">
                        ECTS (utveksling)
                      </label>
                      <input
                        type="text"
                        placeholder="eks: 7.5"
                        className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                        value={manualECTS}
                        onChange={(e) => setManualECTS(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Emnenavn (utveksling)
                    </label>
                    <input
                      type="text"
                      placeholder="eks: Computer Science Project"
                      className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                      value={manualExchangeName}
                      onChange={(e) => setManualExchangeName(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={handleAddManualMatch}
                    className="w-full bg-primary text-white py-2.5 px-4 rounded-lg font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Legg til match
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {availableOptions.map((opt) => {
              const matchingHomeSub = selectedSubjects.find((s) =>
                areCodesCompatible(s.code, opt.matchesHomeSubjectCode || "")
              );
              const isCompatible = !!matchingHomeSub;

              // Check if we can add more matches to this home subject
              const isHomeSubFull =
                matchingHomeSub && matchingHomeSub.matchedWith.length > 0;
              const canAddMore =
                matchingHomeSub &&
                subjectsAllowingMultipleMatches.has(matchingHomeSub.id);
              const showMatchButton =
                isCompatible && (!isHomeSubFull || canAddMore);

              // Sjekk om kurset ble godkjent for mer enn 4 år siden
              let isOldApproval = false;
              if (opt.behandlingsdato) {
                try {
                  const approvalDate = new Date(opt.behandlingsdato);
                  const currentDate = new Date();
                  const yearsDiff =
                    (currentDate.getTime() - approvalDate.getTime()) /
                    (1000 * 60 * 60 * 24 * 365.25);
                  isOldApproval = yearsDiff > 5;
                } catch (e) {
                  // Ignorer hvis dato er ugyldig
                }
              }

              return (
                <div
                  key={opt.id}
                  className={`bg-white rounded-lg shadow-sm border transition-all ${
                    isCompatible
                      ? "border-gray-200 hover:shadow-md"
                      : "border-gray-100 opacity-70"
                  }`}
                >
                  <div className="p-4 sm:p-5 lg:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
                      {/* NTNU Course - Venstre side */}
                      <div className="border-b lg:border-b-0 lg:border-r border-gray-200 pb-4 lg:pb-0 lg:pr-6">
                        <h3 className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">
                          NTNU Kurs
                        </h3>
                        <p className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                          {matchingHomeSub?.code || "—"}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {matchingHomeSub?.name || "Ikke kompatibel"}
                        </p>
                        {isCompatible && (
                          <div className="mt-2 sm:mt-3 inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                            <CheckCircle size={12} /> Kompatibel
                          </div>
                        )}
                      </div>

                      {/* Exchange Course - Høyre side */}
                      <div className="relative">
                        {/* Icons in top right corner on mobile */}
                        <div className="absolute top-0 right-0 flex gap-1.5 sm:hidden">
                          {opt.isVerified && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-gray-700 font-medium">
                              <ShieldCheck
                                size={14}
                                className="text-gray-900"
                              />
                            </span>
                          )}
                          <button
                            onClick={() => {
                              setSelectedCourseInfo(opt);
                              setShowInfoModal(true);
                            }}
                            className="bg-gray-100 text-gray-600 p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                            title="Vis informasjon"
                          >
                            <Info size={14} />
                          </button>
                          {showMatchButton && (
                            <button
                              onClick={() =>
                                matchingHomeSub &&
                                handleMatch(opt, matchingHomeSub.id)
                              }
                              className="bg-slate-900 text-white p-1.5 rounded-full hover:bg-slate-700 transition-colors shadow-md hover:scale-105 transform active:scale-95"
                              title="Match med NTNU-fag"
                            >
                              <Plus size={14} />
                            </button>
                          )}
                        </div>

                        {/* Desktop/Tablet header */}
                        <div className="flex flex-col sm:flex-row items-start justify-between mb-2 sm:mb-3 gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Utvekslingskurs
                            </h3>
                            {opt.semester && opt.semester !== "null" && (
                              <span className="inline-flex items-center text-[10px] sm:text-xs bg-slate-700 text-slate-100 px-2 sm:px-2.5 py-0.5 rounded-full font-medium">
                                {opt.semester}
                              </span>
                            )}
                          </div>
                          {/* Icons on desktop/tablet */}
                          <div className="hidden sm:flex gap-1.5 sm:gap-2 items-center">
                            {opt.isVerified && (
                              <span className="inline-flex items-center gap-1 text-xs text-gray-700 font-medium">
                                <ShieldCheck
                                  size={14}
                                  className="text-gray-900"
                                />{" "}
                                <span>Verifisert</span>
                              </span>
                            )}
                            <button
                              onClick={() => {
                                setSelectedCourseInfo(opt);
                                setShowInfoModal(true);
                              }}
                              className="bg-gray-100 text-gray-600 p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                              title="Vis informasjon"
                            >
                              <Info size={16} />
                            </button>
                            {showMatchButton && (
                              <button
                                onClick={() =>
                                  matchingHomeSub &&
                                  handleMatch(opt, matchingHomeSub.id)
                                }
                                className="bg-slate-900 text-white p-1.5 rounded-full hover:bg-slate-700 transition-colors shadow-md hover:scale-105 transform active:scale-95"
                                title="Match med NTNU-fag"
                              >
                                <Plus size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                          {opt.code}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">
                          {opt.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 mb-2">
                          {opt.university}, {opt.country}
                        </p>
                        <div className="flex items-end justify-between">
                          <span className="text-[10px] sm:text-xs text-gray-500">
                            {opt.ects} ECTS
                          </span>
                          {isOldApproval && (
                            <span className="text-[10px] sm:text-xs text-amber-600 flex items-center gap-1">
                              <AlertTriangle size={12} /> Over 5 år gammel
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {nonCompatibleOptions.length > 50 && (
              <div className="text-center py-4 text-slate-500 text-xs font-medium">
                Viser 50 av {nonCompatibleOptions.length} andre fag. Bruk
                søkefeltet for å finne flere.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Info Modal */}
      {showInfoModal && selectedCourseInfo && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowInfoModal(false)}
        >
          <div
            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-lg w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <Info className="text-gray-900" size={20} />
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Fagsinformasjon
                </h3>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-800 text-lg">
                  {selectedCourseInfo.name}
                </h4>
                <p className="text-sm text-slate-500">
                  {selectedCourseInfo.code}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  {selectedCourseInfo.university}
                </p>
              </div>

              {selectedCourseInfo.isVerified ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="text-gray-900" size={20} />
                    <span className="font-semibold text-gray-900">
                      Verifisert fag
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 mb-3">
                    {selectedCourseInfo.wikiUrl
                      ? "Bekreftet gjennom NTNU sine wikisider for utveksling."
                      : "Verifisert av administrator."}
                  </p>
                  {selectedCourseInfo.wikiUrl && (
                    <a
                      href={selectedCourseInfo.wikiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-900 hover:text-gray-700 underline break-all"
                    >
                      {selectedCourseInfo.wikiUrl}
                    </a>
                  )}
                  {selectedCourseInfo.behandlingsdato && (
                    <p className="text-xs text-slate-500 mt-2">
                      Behandlingsdato: {selectedCourseInfo.behandlingsdato}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="text-amber-600" size={20} />
                    <span className="font-semibold text-amber-900">
                      Brukerlagt fag
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">
                    Lagt til av:{" "}
                    <span className="font-medium">
                      {selectedCourseInfo.addedBy || "Ukjent bruker"}
                    </span>
                  </p>
                </div>
              )}

              {selectedCourseInfo.matchesHomeSubjectCode && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    <strong>Matcher:</strong>{" "}
                    {selectedCourseInfo.matchesHomeSubjectCode}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full mt-6 bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
            >
              Lukk
            </button>
          </div>
        </div>
      )}

      {/* Share to Fagbank Modal */}
      {showShareModal && pendingManualMatch && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowShareModal(false);
            handleSkipSharing();
          }}
        >
          <div
            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-lg w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <Share2 className="text-gray-900" size={20} />
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Del med fagbanken?
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowShareModal(false);
                  handleSkipSharing();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Info about the course match */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-slate-700 mb-3">
                  Dette faget ligger ikke i fagbanken ennå.
                </p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">
                      NTNU-fag
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {pendingManualMatch.ntnuCode}
                    </p>
                    <p className="text-sm text-slate-700">
                      {pendingManualMatch.ntnuName}
                    </p>
                  </div>
                  <div className="flex items-center justify-center py-1">
                    <ArrowLeftRight className="text-gray-900" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">
                      Utvekslingsfag
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {pendingManualMatch.exchangeCode}
                    </p>
                    <p className="text-sm text-slate-700">
                      {pendingManualMatch.exchangeName}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {pendingManualMatch.university} •{" "}
                      {pendingManualMatch.ects} ECTS
                    </p>
                  </div>
                </div>
              </div>

              {/* Explanation about sharing */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle
                    className="text-amber-600 flex-shrink-0 mt-0.5"
                    size={18}
                  />
                  <div className="text-sm text-slate-700">
                    <p className="font-semibold text-amber-900 mb-1">
                      Viktig informasjon
                    </p>
                    <p className="mb-2">
                      Faget må være <strong>bekreftet godkjent</strong> av ditt
                      institutt før du sender det inn.
                    </p>
                    <p>
                      Kurset vil bli gjennomgått av admin før det publiseres i
                      fagbanken for andre studenter.
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefits of sharing */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-2">
                  <Users className="text-green-600 flex-shrink-0" size={18} />
                  <p className="text-sm font-semibold text-green-900">
                    Hjelp andre studenter
                  </p>
                </div>
                <p className="text-sm text-slate-700">
                  Ved å dele denne matchen hjelper du andre studenter som skal
                  på utveksling til {pendingManualMatch.university}.
                </p>
              </div>
            </div>

            {/* Success message */}
            {shareSuccess && (
              <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={24} />
                  <div>
                    <p className="font-semibold text-green-900">
                      Kurset er sendt inn!
                    </p>
                    <p className="text-sm text-green-700">
                      Kurset vil bli gjennomgått og publisert i fagbanken snart.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSkipSharing}
                disabled={isSharing}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ikke del
              </button>
              <button
                onClick={handleShareToFagbank}
                disabled={isSharing}
                className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSharing ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Sender inn...
                  </>
                ) : (
                  "Del til fagbanken"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
