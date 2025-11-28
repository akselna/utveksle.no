"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import approvedCoursesData from "../../data/approved_courses.json";
import { saveExchangePlan, updateExchangePlan, getUserPlans, deletePlan } from "@/lib/exchange-plans";

// --- TYPER ---
type Subject = {
  id: string;
  code: string;
  name: string;
  credits: number;
  matchedWith: AbroadSubject | null;
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
    "Algoritmer og datamaskiner",
    "Databaser og søk",
    "Kunstig intelligens",
    "Programvaresystemer",
  ],
  Kybernetikk: [
    "Ingen fagretning",
    "Autonome systemer",
    "Modellering og optimering",
    "Robotikk",
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
};

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
      matchedWith: null,
    },
    {
      id: "i1h2",
      code: "TDT4109",
      name: "Informasjonsteknologi, grunnkurs",
      credits: 7.5,
      matchedWith: null,
    },
    {
      id: "i1h3",
      code: "TMA4100",
      name: "Matematikk 1",
      credits: 7.5,
      matchedWith: null,
    },
    {
      id: "i1h4",
      code: "TMA4140",
      name: "Diskret matematikk",
      credits: 7.5,
      matchedWith: null,
    },
  ],

  // 1. år Vår
  Indøk_Datateknologi_1_Vår_default: [
    {
      id: "i1v1",
      code: "TDT4100",
      name: "Objektorientert programmering",
      credits: 7.5,
      matchedWith: null,
    },
    {
      id: "i1v2",
      code: "TIØ4101",
      name: "Organisasjonsteori og selskapsrett",
      credits: 7.5,
      matchedWith: null,
    },
    {
      id: "i1v3",
      code: "TMA4115",
      name: "Matematikk 3",
      credits: 7.5,
      matchedWith: null,
    },
    {
      id: "i1v4",
      code: "TTM4100",
      name: "Kommunikasjon - Tjenester og nett",
      credits: 7.5,
      matchedWith: null,
    },
  ],

  // 2. år Høst
  Indøk_Datateknologi_2_Høst_default: [
    {
      id: "i2h1",
      code: "TDT4120",
      name: "Algoritmer og datastrukturer",
      credits: 7.5,
      matchedWith: null,
    },
    {
      id: "i2h2",
      code: "TDT4160",
      name: "Datamaskiner og digitalteknikk",
      credits: 7.5,
      matchedWith: null,
    },
    {
      id: "i2h3",
      code: "TFY4107",
      name: "Fysikk",
      credits: 7.5,
      matchedWith: null,
    },
    {
      id: "i2h4",
      code: "TMA4135",
      name: "Matematikk 4D",
      credits: 7.5,
      matchedWith: null,
    },
  ],

  // 2. år Vår
  Indøk_Datateknologi_2_Vår_default: [
    {
      id: "i2v1",
      code: "TDT4140",
      name: "Programvareutvikling",
      credits: 7.5,
      matchedWith: null,
    },
    {
      id: "i2v2",
      code: "TDT4145",
      name: "Datamodellering og databasesystemer",
      credits: 7.5,
      matchedWith: null,
    },
    {
      id: "i2v3",
      code: "TDT4180",
      name: "Menneske-maskin-interaksjon",
      credits: 7.5,
      matchedWith: null,
    },
    {
      id: "i2v4",
      code: "TIØ4105",
      name: "Industriell økonomisk styring",
      credits: 7.5,
      matchedWith: null,
    },
  ],

  // 3. år Høst - Kunstig intelligens
  "Indøk_Datateknologi_3_Høst_Kunstig intelligens": [
    {
      id: "i3h1",
      code: "TDT4136",
      name: "Introduksjon til kunstig intelligens",
      credits: 7.5,
      matchedWith: null,
    },
    {
      id: "i3h2",
      code: "TIØ4118",
      name: "Industriell økonomisk analyse",
      credits: 7.5,
      matchedWith: null,
    },
    {
      id: "i3h3",
      code: "TIØ4162",
      name: "Organisasjon og teknologi 2",
      credits: 7.5,
      matchedWith: null,
    },
    {
      id: "i3h4",
      code: "TMA4240",
      name: "Statistikk",
      credits: 7.5,
      matchedWith: null,
    },
  ],

  // 3. år Vår - Kunstig intelligens
  "Indøk_Datateknologi_3_Vår_Kunstig intelligens": [
    {
      id: "i3v1",
      code: "TDT4171",
      name: "Metoder i kunstig intelligens",
      credits: 7.5,
      matchedWith: null,
    },
    {
      id: "i3v2",
      code: "TIØ4126",
      name: "Optimering og beslutningsstøtte for teknisk-økonomisk planlegging",
      credits: 7.5,
      matchedWith: null,
    },
    {
      id: "i3v3a",
      code: "TIØ4165",
      name: "Markedsføringsledelse for teknologibedrifter",
      credits: 7.5,
      matchedWith: null,
      isElective: true,
      electiveGroup: "3vår_valg",
      isSelected: false,
    },
    {
      id: "i3v3b",
      code: "TDT4237",
      name: "Programvaresikkerhet og personvern",
      credits: 7.5,
      matchedWith: null,
      isElective: true,
      electiveGroup: "3vår_valg",
      isSelected: false,
    },
    {
      id: "i3v3c",
      code: "TDT4300",
      name: "Datavarehus og datagruvedrift",
      credits: 7.5,
      matchedWith: null,
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
      matchedWith: null,
      isElective: true,
      electiveGroup: "4høst_gruppeA",
      isSelected: false,
    },
    {
      id: "i4h1b",
      code: "TIØ4145",
      name: "Finansstyring for foretak",
      credits: 7.5,
      matchedWith: null,
      isElective: true,
      electiveGroup: "4høst_gruppeA",
      isSelected: false,
    },
    {
      id: "i4h1c",
      code: "TIØ4265",
      name: "Strategisk ledelse",
      credits: 7.5,
      matchedWith: null,
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
      matchedWith: null,
      isElective: true,
      electiveGroup: "4høst_tek",
      isSelected: false,
    },
    {
      id: "i4h2b",
      code: "TDT4137",
      name: "Kognitive systemer",
      credits: 7.5,
      matchedWith: null,
      isElective: true,
      electiveGroup: "4høst_tek",
      isSelected: false,
    },
    {
      id: "i4h2c",
      code: "TDT4259",
      name: "Anvendt data science",
      credits: 7.5,
      matchedWith: null,
      isElective: true,
      electiveGroup: "4høst_tek",
      isSelected: false,
    },
    {
      id: "i4h2d",
      code: "TIØ4180",
      name: "Innovasjonsledelse og strategi",
      credits: 7.5,
      matchedWith: null,
      isElective: true,
      electiveGroup: "4høst_tek",
      isSelected: false,
    },
    {
      id: "i4h2e",
      code: "TIØ4195",
      name: "Miljøledelse og bedriftsstrategi",
      credits: 7.5,
      matchedWith: null,
      isElective: true,
      electiveGroup: "4høst_tek",
      isSelected: false,
    },
    {
      id: "i4h2f",
      code: "TIØ4282",
      name: "Digital strategi og forretningsmodeller",
      credits: 7.5,
      matchedWith: null,
      isElective: true,
      electiveGroup: "4høst_tek",
      isSelected: false,
    },
    {
      id: "i4h2g",
      code: "TIØ4300",
      name: "Miljøkunnskap, økosystemtjenester og bærekraft",
      credits: 7.5,
      matchedWith: null,
      isElective: true,
      electiveGroup: "4høst_tek",
      isSelected: false,
    },
    {
      id: "i4h2h",
      code: "TIØ4306",
      name: "Strategier for industriell bærekraft",
      credits: 7.5,
      matchedWith: null,
      isElective: true,
      electiveGroup: "4høst_tek",
      isSelected: false,
    },
    {
      id: "i4h2i",
      code: "TIØ4345",
      name: "Ledelse av bedriftsrelasjoner og -nettverk",
      credits: 7.5,
      matchedWith: null,
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
      matchedWith: null,
    },

    // Gruppe A - Velg minst 1
    {
      id: "i4v2a",
      code: "TIØ4140",
      name: "Finansielle derivater og realopsjoner",
      credits: 7.5,
      matchedWith: null,
      isElective: true,
      electiveGroup: "4vår_gruppeA",
      isSelected: false,
    },
    {
      id: "i4v2b",
      code: "TIØ4150",
      name: "Industriell optimering og beslutningsstøtte",
      credits: 7.5,
      matchedWith: null,
      isElective: true,
      electiveGroup: "4vår_gruppeA",
      isSelected: false,
    },
    {
      id: "i4v2c",
      code: "TIØ4170",
      name: "Teknologibasert forretningsutvikling",
      credits: 7.5,
      matchedWith: null,
      isElective: true,
      electiveGroup: "4vår_gruppeA",
      isSelected: false,
    },
    {
      id: "i4v2d",
      code: "TIØ4175",
      name: "Innkjøps- og logistikkledelse",
      credits: 7.5,
      matchedWith: null,
      isElective: true,
      electiveGroup: "4vår_gruppeA",
      isSelected: false,
    },
    {
      id: "i4v2e",
      code: "TIØ4235",
      name: "Industriell markedsføring og internasjonal handel",
      credits: 7.5,
      matchedWith: null,
      isElective: true,
      electiveGroup: "4vår_gruppeA",
      isSelected: false,
    },
    {
      id: "i4v2f",
      code: "TIØ4276",
      name: "Endringsledelse",
      credits: 7.5,
      matchedWith: null,
      isElective: true,
      electiveGroup: "4vår_gruppeA",
      isSelected: false,
    },
    {
      id: "i4v2g",
      code: "TIØ4285",
      name: "Modellering og analyse av industrielle verdikjeder",
      credits: 7.5,
      matchedWith: null,
      isElective: true,
      electiveGroup: "4vår_gruppeA",
      isSelected: false,
    },
    {
      id: "i4v2h",
      code: "TIØ4317",
      name: "Empiriske og kvantitative metoder i finans",
      credits: 7.5,
      matchedWith: null,
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
      matchedWith: null,
      isElective: true,
      electiveGroup: "4vår_tek",
      isSelected: false,
    },
    {
      id: "i4v3b",
      code: "IT3708",
      name: "Bio-inspirert Kunstig Intelligens",
      credits: 7.5,
      matchedWith: null,
      isElective: true,
      electiveGroup: "4vår_tek",
      isSelected: false,
    },
    {
      id: "i4v3c",
      code: "TDT4215",
      name: "Anbefalingssystemer",
      credits: 7.5,
      matchedWith: null,
      isElective: true,
      electiveGroup: "4vår_tek",
      isSelected: false,
    },
    {
      id: "i4v3d",
      code: "TDT4300",
      name: "Datavarehus og datagruvedrift",
      credits: 7.5,
      matchedWith: null,
      isElective: true,
      electiveGroup: "4vår_tek",
      isSelected: false,
    },
    {
      id: "i4v3e",
      code: "TDT4305",
      name: "Big Data-arkitektur",
      credits: 7.5,
      matchedWith: null,
      isElective: true,
      electiveGroup: "4vår_tek",
      isSelected: false,
    },
  ],

  // === ANDRE STUDIEPROGRAM (tidligere eksempler) ===

  // Datateknologi - 4. klasse høst
  Datateknologi_default_4_Høst_default: [
    {
      id: "dt4h1",
      code: "TDT4120",
      name: "Algoritmer og Datastrukturer",
      credits: 7.5,
      matchedWith: null,
    },
    {
      id: "dt4h2",
      code: "TDT4145",
      name: "Datamodellering og Databasesystemer",
      credits: 7.5,
      matchedWith: null,
    },
    {
      id: "dt4h3",
      code: "TDT4200",
      name: "Parallell Databehandling",
      credits: 7.5,
      matchedWith: null,
    },
    {
      id: "dt4h4",
      code: "EiT",
      name: "Eksperter i Team",
      credits: 7.5,
      matchedWith: null,
    },
  ],

  // Kybernetikk - 4. klasse vår
  Kybernetikk_default_4_Vår_default: [
    {
      id: "kyb4v1",
      code: "TTK4105",
      name: "Reguleringsteknikk",
      credits: 7.5,
      matchedWith: null,
    },
    {
      id: "kyb4v2",
      code: "TTK4115",
      name: "Lineær Systemteori",
      credits: 7.5,
      matchedWith: null,
    },
    {
      id: "kyb4v3",
      code: "TMA4135",
      name: "Matematikk 4D",
      credits: 7.5,
      matchedWith: null,
    },
    {
      id: "kyb4v4",
      code: "Valgfag",
      name: "Valgbart emne",
      credits: 7.5,
      matchedWith: null,
      isElective: true,
      isSelected: false,
    },
  ],
};

// Konverter JSON-data til AbroadSubject format
const ABROAD_OPTIONS: AbroadSubject[] = (approvedCoursesData as any[]).map(
  (course, index) => {
    // Hvis kurset har Bologna eller Foreign emnekode, er det verifisert fra wiki/manuell input
    const isBologna = !!course.Bologna_Emnekode;
    const isForeign = !!course.Foreign_Emnekode;
    const isVerified = isBologna || isForeign;

    return {
      id: `abroad-${index}`,
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
    };
  }
);

// Generer universitetsvalg dynamisk fra data
const EXCHANGE_UNIVERSITIES = [
  "None selected",
  ...Array.from(
    new Set(
      (approvedCoursesData as any[])
        .map((course) =>
          course.Country && course.University
            ? `${course.Country} - ${course.University}`
            : null
        )
        .filter(Boolean)
    )
  ).sort(),
] as string[];

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
        matchedWith: null,
      },
      {
        id: "h2",
        code: "TDT4145",
        name: "Datamodellering og Databasesystemer",
        credits: 7.5,
        matchedWith: null,
      },
      {
        id: "h3",
        code: "TDT4200",
        name: "Parallell Databehandling",
        credits: 7.5,
        matchedWith: null,
      },
    ],
  },
];

export default function ExchangePlannerFull() {
  const { data: session } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(0); // 0: Dashboard, 1: Profil, 2: Fag, 3: Planlegger, 4: Last ned PDF
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  // State for plans
  const [myPlans, setMyPlans] = useState<ExchangePlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editingPlanName, setEditingPlanName] = useState<{id: string, name: string} | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // State: Steg 1
  const [university, setUniversity] = useState("NTNU"); // Home university
  const [exchangeUniversity, setExchangeUniversity] = useState("None selected"); // Exchange university
  const [program, setProgram] = useState("Datateknologi");
  const [technologyDirection, setTechnologyDirection] =
    useState("Ingen retning");
  const [specialization, setSpecialization] = useState("Ingen fagretning");
  const [studyYear, setStudyYear] = useState<number>(4);
  const [exchangeYear, setExchangeYear] = useState<number>(new Date().getFullYear() + 1);
  const [semesterChoice, setSemesterChoice] = useState("Høst");

  // State: Steg 2 & 3
  const [mySubjects, setMySubjects] = useState<Subject[]>([]);
  const [planName, setPlanName] = useState("");

  // State: Legge til manuelt fag
  const [newSubjectCode, setNewSubjectCode] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");

  // Restore progress if saved
  useEffect(() => {
    const savedProgress = localStorage.getItem("unsaved_plan_progress");
    if (savedProgress) {
      if (session) {
        try {
          const parsed = JSON.parse(savedProgress);
          setUniversity(parsed.university);
          setExchangeUniversity(parsed.exchangeUniversity);
          setProgram(parsed.program);
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
        const cached = sessionStorage.getItem('cached_plans');
        if (cached) {
          const cachedPlans = JSON.parse(cached);
          setMyPlans(cachedPlans);
          setPlansLoading(false);
        }
      } catch (e) {
        console.error('Failed to load cached plans:', e);
      }

      // Then fetch fresh data in background
      getUserPlans()
        .then((response) => {
          if (response.success && response.plans) {
            // Convert database plans to local format
            const dbPlans = response.plans.map((dbPlan: any) => {
              // Convert database courses to Subject format
              const subjects: Subject[] = (dbPlan.courses || []).map((course: any) => ({
                id: `${course.course_code}-${course.id}`,
                code: course.course_code,
                name: course.course_name,
                credits: course.ects_points || 0,
                isSelected: true,
                matchedWith: course.replaces_course_code ? {
                  id: `abroad-${course.id}`,
                  code: course.replaces_course_code,
                  name: course.replaces_course_name || '',
                  university: dbPlan.university_name,
                  country: dbPlan.country || '',
                  matchesHomeSubjectCode: course.course_code,
                  ects: course.ects_points?.toString() || '',
                } : null
              }));

              return {
                id: `db-${dbPlan.id}`,
                planName: dbPlan.plan_name,
                university: 'NTNU',
                exchangeUniversity: dbPlan.university_name,
                program: '',
                technologyDirection: '',
                specialization: '',
                studyYear: 4,
                semesterChoice: dbPlan.semester || 'Høst',
                subjects,
              };
            });
            setMyPlans(dbPlans);
            // Cache the plans for next time
            try {
              sessionStorage.setItem('cached_plans', JSON.stringify(dbPlans));
            } catch (e) {
              console.error('Failed to cache plans:', e);
            }
          }
        })
        .catch((error) => {
          console.error('Failed to load plans from database:', error);
        })
        .finally(() => {
          setPlansLoading(false);
        });
    } else {
      setPlansLoading(false);
    }
  }, [session]);

  // --- HJELPEFUNKSJONER ---
  // Helper to update cache whenever plans change
  const updatePlansCache = (plans: ExchangePlan[]) => {
    try {
      sessionStorage.setItem('cached_plans', JSON.stringify(plans));
    } catch (e) {
      console.error('Failed to update cache:', e);
    }
  };

  const calculatedSemester =
    semesterChoice === "Høst" ? studyYear * 2 - 1 : studyYear * 2;

  const handleFetchSubjects = () => {
    // Bygg nøkkel basert på program, teknologiretning, år, semester og spesialisering
    const techDir =
      technologyDirection === "Ingen retning" ? "default" : technologyDirection;
    const spec =
      specialization === "Ingen fagretning" ? "default" : specialization;

    // For Indøk: Program_TechDir_Year_Semester_Spec
    // For andre: Program_default_Year_Semester_Spec
    const key = `${program}_${techDir}_${studyYear}_${semesterChoice}_${spec}`;
    const fallbackKey1 = `${program}_${techDir}_${studyYear}_${semesterChoice}_default`;
    const fallbackKey2 = `${program}_default_${studyYear}_${semesterChoice}_default`;

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

  const handleAddSubject = () => {
    if (!newSubjectCode || !newSubjectName) return;
    const newSub: Subject = {
      id: Math.random().toString(),
      code: newSubjectCode,
      name: newSubjectName,
      credits: 7.5,
      matchedWith: null,
      isSelected: true, // Manuelt lagt til fag er alltid valgt
    };
    setMySubjects([...mySubjects, newSub]);
    setNewSubjectCode("");
    setNewSubjectName("");
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
    setExchangeUniversity("None selected");
    setProgram("Datateknologi");
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
    const courses = selectedSubjects.map(sub => ({
      course_code: sub.matchedWith?.code || '',
      course_name: sub.matchedWith?.name || '',
      ects_points: sub.matchedWith?.ects ? parseFloat(sub.matchedWith.ects) : undefined,
      semester: semesterChoice,
      replaces_course_code: sub.code,
      replaces_course_name: sub.name,
    })).filter(c => c.course_code); // Only include matched courses

    // Vis notifikasjon med en gang
    setShowSaveNotification(true);

    try {
      // Split "Country - University" string
      const parts = exchangeUniversity.split(' - ');
      const countryName = parts.length > 1 ? parts[0] : '';
      const universityName = parts.length > 1 ? parts.slice(1).join(' - ') : exchangeUniversity;

      if (editingPlanId && editingPlanId.startsWith('db-')) {
        // Update existing database plan
        const dbId = parseInt(editingPlanId.replace('db-', ''));
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
        const newPlans = myPlans.map((p) => (p.id === editingPlanId ? updatedPlan : p));
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
            notes: `${program} - ${specialization}`,
            status: 'draft'
          });
        } catch (error: any) {
          // Rollback hvis det feiler
          setMyPlans(previousPlans);
          updatePlansCache(previousPlans);
          throw error;
        }
      } else {
        // Save new plan to database
        const defaultPlanName = planName || `${exchangeUniversity} - ${semesterChoice} ${exchangeYear}`;

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
            notes: `${program} - ${specialization}`,
            status: 'draft'
          });

          // Erstatt midlertidig ID med ekte database ID
          setMyPlans((prevPlans) => {
            const updatedPlans = prevPlans.map(p => p.id === tempId
              ? {...p, id: `db-${result.plan.id}`}
              : p
            );
            updatePlansCache(updatedPlans);
            return updatedPlans;
          });
        } catch (error: any) {
          // Fjern midlertidig plan hvis det feiler
          setMyPlans((prevPlans) => {
            const filteredPlans = prevPlans.filter(p => p.id !== tempId);
            updatePlansCache(filteredPlans);
            return filteredPlans;
          });
          throw error;
        }
      }

      setTimeout(() => {
        setShowSaveNotification(false);
        setIsSaving(false);
        setStep(0);
        resetCreatorForm();
      }, 1500);
    } catch (error: any) {
      setShowSaveNotification(false);
      setIsSaving(false);
      alert(`Kunne ikke lagre plan: ${error.message}`);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    // Optimistic update - fjern plan fra UI med en gang
    const previousPlans = myPlans;
    const newPlans = myPlans.filter((p) => p.id !== planId);
    setMyPlans(newPlans);
    updatePlansCache(newPlans);

    if (planId.startsWith('db-')) {
      // Delete from database
      const dbId = parseInt(planId.replace('db-', ''));
      try {
        await deletePlan(dbId);
      } catch (error: any) {
        // Rollback hvis det feiler
        setMyPlans(previousPlans);
        updatePlansCache(previousPlans);
        alert(`Kunne ikke slette plan: ${error.message}`);
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
      const savedSubjectsMap = new Map(planToOpen.subjects.map(s => [s.code, s]));
      const mergedSubjects: Subject[] = [];

      // 1. Legg til fag fra standardplanen (behold rekkefølge)
      defaultPlan.forEach(defSub => {
        if (savedSubjectsMap.has(defSub.code)) {
          // Bruk lagret versjon (med matching/status)
          mergedSubjects.push(savedSubjectsMap.get(defSub.code)!);
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
      savedSubjectsMap.forEach(sub => {
        mergedSubjects.push(sub);
      });

      setMySubjects(mergedSubjects);
      setEditingPlanId(planId);
      setStep(3); // Gå direkte til planleggeren
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-slate-800 font-sans overflow-hidden">
      {/* --- GLOBAL HEADER (Vises kun under oppretting) --- */}
      {step > 0 && (
        <header className="bg-white border-b border-gray-200 shadow-sm z-30 shrink-0">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingPlanId ? "Endre plan" : "Opprett ny plan"}
              </h2>
              {step === 3 && (
                <button
                  onClick={handleSavePlan}
                  disabled={isSaving}
                  className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    isSaving
                      ? 'text-blue-400 bg-blue-50 cursor-not-allowed'
                      : 'text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      Lagrer...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {editingPlanId ? "Lagre endringer" : "Lagre utkast"}
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="flex items-center justify-between w-full max-w-5xl mx-auto relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 rounded"></div>
              <div
                className="absolute top-1/2 left-0 h-1 bg-blue-600 -z-10 rounded transition-all duration-500"
                style={{
                  width:
                    step === 1
                      ? "0%"
                      : step === 2
                      ? "33%"
                      : step === 3
                      ? "66%"
                      : "100%",
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
                  className="flex flex-col items-center bg-white px-2"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                      step >= item.num
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-300 text-gray-400"
                    }`}
                  >
                    {item.num}
                  </div>
                  <span
                    className={`text-xs mt-1 font-medium ${
                      step >= item.num ? "text-blue-700" : "text-gray-400"
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
      <div className="flex-1 overflow-y-auto relative">
        {showSaveNotification && (
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-in slide-in-from-top fade-in z-50">
            <CheckCircle className="text-green-400" size={20} />
            <span className="font-medium">
              {editingPlanId ? "Planen er oppdatert!" : "Planen er lagret!"}
            </span>
          </div>
        )}

        {/* --- STEG 0: DASHBOARD / OVERSIKT --- */}
        {step === 0 && (
          <div className="p-6 sm:p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Mine utvekslinger
                </h1>
                <p className="text-slate-500 mt-1">
                  Se, endre eller opprett nye utvekslingsplaner.
                </p>
              </div>
              <button
                onClick={() => {
                  resetCreatorForm();
                  setStep(1);
                }}
                className="mt-4 sm:mt-0 bg-blue-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <Plus size={20} /> Opprett ny plan
              </button>
            </header>

            {plansLoading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-slate-500">Laster planer...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
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
                            onChange={(e) => setEditingPlanName({id: plan.id, name: e.target.value})}
                            className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold"
                            autoFocus
                          />
                          <button
                            onClick={async () => {
                              if (plan.id.startsWith('db-')) {
                                const dbId = parseInt(plan.id.replace('db-', ''));
                                const newName = editingPlanName.name;
                                const oldName = plan.planName;

                                // Optimistic update - oppdater UI med en gang
                                setMyPlans(prev => {
                                  const updated = prev.map(p =>
                                    p.id === plan.id ? {...p, planName: newName} : p
                                  );
                                  updatePlansCache(updated);
                                  return updated;
                                });
                                setEditingPlanName(null);

                                try {
                                  await updateExchangePlan(dbId, { plan_name: newName });
                                } catch (error) {
                                  // Rollback hvis det feiler
                                  setMyPlans(prev => {
                                    const rolledBack = prev.map(p =>
                                      p.id === plan.id ? {...p, planName: oldName} : p
                                    );
                                    updatePlansCache(rolledBack);
                                    return rolledBack;
                                  });
                                  alert('Kunne ikke oppdatere plannavn');
                                  console.error('Failed to update plan name:', error);
                                }
                              }
                            }}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                          className="font-bold text-slate-800 mt-3 text-lg cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => setEditingPlanName({id: plan.id, name: plan.planName || plan.exchangeUniversity})}
                        >
                          {plan.planName || plan.exchangeUniversity}
                        </h3>
                      )}
                      <p className="text-sm text-slate-500">
                        {plan.exchangeUniversity} | {plan.university} | {plan.studyYear}. klasse -{" "}
                        {plan.semesterChoice}
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
          <div className="flex flex-col items-center justify-center min-h-full p-6 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
              <h1 className="text-2xl font-bold text-slate-900 text-center mb-6">
                Start planleggingen
              </h1>
              <div className="space-y-5">
                {/* Hjemmeuniversitet */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                    <School size={14} /> Hjemmeuniversitet
                  </label>
                  <select
                    className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                  >
                    <option value="NTNU">NTNU</option>
                    <option value="UiO">UiO</option>
                  </select>
                </div>

                {/* Utvekslingsuniversitet */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                    <MapPin size={14} /> Utvekslingsuniversitet
                  </label>
                  <select
                    className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
                    value={exchangeUniversity}
                    onChange={(e) => setExchangeUniversity(e.target.value)}
                  >
                    {EXCHANGE_UNIVERSITIES.map((uni) => (
                      <option key={uni} value={uni}>
                        {uni}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Studieprogram */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                    <GraduationCap size={14} /> Studieprogram
                  </label>
                  <select
                    className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
                    value={program}
                    onChange={(e) => {
                      setProgram(e.target.value);
                      setTechnologyDirection("Ingen retning");
                      setSpecialization("Ingen fagretning");
                    }}
                  >
                    <option value="Datateknologi">Datateknologi</option>
                    <option value="Kybernetikk">Kybernetikk og Robotikk</option>
                    <option value="Indøk">Indøk</option>
                  </select>
                </div>

                {/* Teknologiretning (kun for Indøk) */}
                {TECHNOLOGY_DIRECTIONS[program] && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                      <School size={14} /> Teknologiretning
                    </label>
                    <select
                      className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
                      value={technologyDirection}
                      onChange={(e) => {
                        setTechnologyDirection(e.target.value);
                        setSpecialization("Ingen fagretning");
                      }}
                    >
                      {TECHNOLOGY_DIRECTIONS[program].map((tech) => (
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
                    program === "Indøk" &&
                    technologyDirection !== "Ingen retning"
                  ) {
                    specKey = `${program}_${technologyDirection}`;
                  }
                  const availableSpecs = SPECIALIZATIONS[specKey] || [];

                  return availableSpecs.length > 1 ? (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                        <BookOpen size={14} /> Fagretning
                      </label>
                      <select
                        className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                      <GraduationCap size={14} /> Årstrinn
                    </label>
                    <select
                      className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
                      value={studyYear}
                      onChange={(e) => setStudyYear(Number(e.target.value))}
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
                      className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
                      value={exchangeYear}
                      onChange={(e) => setExchangeYear(Number(e.target.value))}
                    >
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + 1 + i).map((year) => (
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
                      className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
                      value={semesterChoice}
                      onChange={(e) => setSemesterChoice(e.target.value)}
                    >
                      <option value="Høst">
                        Høst
                      </option>
                      <option value="Vår">Vår</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4">
                  <button
                    onClick={handleFetchSubjects}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg"
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
          <div className="flex flex-col items-center justify-start pt-10 min-h-full p-6 animate-in slide-in-from-right duration-500">
            <div className="max-w-3xl w-full">
              <button
                onClick={() => setStep(1)}
                className="text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-6 text-sm"
              >
                <ArrowLeft size={16} /> Tilbake til profil
              </button>
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="mb-6 border-b border-gray-100 pb-4">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Bekreft dine fag
                  </h2>
                  <p className="text-slate-500 mt-1">
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
                                  ? "bg-green-50 border-2 border-green-400 cursor-pointer hover:border-green-500 hover:bg-green-100"
                                  : "bg-white border border-gray-200 cursor-pointer hover:border-blue-300"
                              }`}
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <div
                                  className={`p-2 rounded-lg border ${
                                    isObligatory
                                      ? "bg-white border-gray-200 text-slate-600"
                                      : isSelected
                                      ? "bg-green-100 border-green-200 text-green-700"
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
                                          : "text-green-900"
                                      }`}
                                    >
                                      {sub.code}
                                    </div>
                                    {sub.isElective && (
                                      <span
                                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                          isSelected
                                            ? "bg-green-100 text-green-700"
                                            : "bg-blue-50 text-blue-600"
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
                                        : "text-green-700"
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
                                          ? "bg-green-50 border-2 border-green-400 hover:border-green-500 hover:bg-green-100"
                                          : "bg-white border border-gray-200 hover:border-blue-300"
                                      }`}
                                    >
                                      <div className="flex items-center gap-3 flex-1">
                                        <div
                                          className={`p-1.5 rounded-lg border ${
                                            isSelected
                                              ? "bg-green-100 border-green-200 text-green-700"
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
                                                  ? "text-green-900"
                                                  : "text-slate-800"
                                              }`}
                                            >
                                              {sub.code}
                                            </div>
                                            <span
                                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                                isSelected
                                                  ? "bg-green-100 text-green-700"
                                                  : "bg-blue-50 text-blue-600"
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
                                                ? "text-green-700"
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
                      </>
                    );
                  })()}
                  <div className="flex gap-3 items-center mt-6 pt-6 border-t border-dashed border-gray-200">
                    <input
                      placeholder="Kode (eks: TDT4100)"
                      className="p-3 rounded-lg border border-gray-300 bg-white text-sm w-32 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      value={newSubjectCode}
                      onChange={(e) => setNewSubjectCode(e.target.value)}
                    />
                    <input
                      placeholder="Navn (eks: Objektorientert...)"
                      className="p-3 rounded-lg border border-gray-300 bg-white text-sm flex-1 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                    />
                    <button
                      onClick={handleAddSubject}
                      className="bg-blue-50 text-blue-600 font-medium px-4 py-3 rounded-lg hover:bg-blue-100 flex items-center gap-2"
                    >
                      <Plus size={18} /> Legg til
                    </button>
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      // Gå videre uten å filtrere - alle fag beholdes
                      setStep(3);
                    }}
                    className="bg-green-600 text-white py-3 px-8 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center gap-2"
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
          <div className="flex flex-col items-center justify-start pt-10 min-h-full p-6 animate-in slide-in-from-right duration-500">
            <div className="max-w-6xl w-full">
              <button
                onClick={() => setStep(2)}
                className="text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-6 text-sm"
              >
                <ArrowLeft size={16} /> Tilbake til dine fag
              </button>
              <PlannerInterface
                subjects={mySubjects}
                setSubjects={setMySubjects}
                program={program}
                semesterLabel={`${studyYear}. klasse - ${semesterChoice}`}
                exchangeUniversity={exchangeUniversity}
                onNext={() => setStep(4)}
              />
            </div>
          </div>
        )}

        {/* --- STEG 4: LAST NED PDF --- */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-start pt-10 min-h-full p-6 animate-in slide-in-from-right duration-500">
            <div className="max-w-4xl w-full">
              <button
                onClick={() => setStep(3)}
                className="text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-6 text-sm"
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
                    onClick={() => {
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
                      // TODO: Implementer PDF-nedlasting
                      alert("PDF-nedlasting kommer snart!");
                    }}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                  >
                    <Save size={20} /> Last ned PDF
                  </button>
                  <button
                    onClick={handleSavePlan}
                    disabled={isSaving}
                    className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                      isSaving
                        ? 'bg-slate-700 cursor-not-allowed'
                        : 'bg-slate-900 hover:bg-slate-800'
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
  exchangeUniversity,
  onNext,
}: {
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  program: string;
  semesterLabel: string;
  exchangeUniversity: string;
  onNext: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedCourseInfo, setSelectedCourseInfo] =
    useState<AbroadSubject | null>(null);

  // State for manuell match
  const [showManualMatchForm, setShowManualMatchForm] = useState(false);
  const [manualNtnuCode, setManualNtnuCode] = useState("");
  const [manualExchangeCode, setManualExchangeCode] = useState("");
  const [manualExchangeName, setManualExchangeName] = useState("");
  const [manualMatches, setManualMatches] = useState<AbroadSubject[]>([]);

  // Filtrer til kun valgte fag for visning
  const selectedSubjects = subjects.filter(
    (sub) => !sub.isElective || sub.isSelected === true
  );

  const handleMatch = (abroadSubject: AbroadSubject, homeSubjectId: string) => {
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === homeSubjectId ? { ...s, matchedWith: abroadSubject } : s
      )
    );
  };

  const handleRemoveMatch = (homeSubjectId: string) => {
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === homeSubjectId ? { ...s, matchedWith: null } : s
      )
    );
  };

  const handleAddManualMatch = () => {
    if (!manualNtnuCode || !manualExchangeCode || !manualExchangeName) {
      alert("Vennligst fyll ut alle feltene");
      return;
    }

    const uniName = exchangeUniversity.includes(" - ")
      ? exchangeUniversity.split(" - ")[1]
      : exchangeUniversity;

    const newManualMatch: AbroadSubject = {
      id: `manual-${Date.now()}`,
      code: manualExchangeCode,
      name: manualExchangeName,
      university: uniName !== "None selected" ? uniName : "Manuelt lagt til",
      country: exchangeUniversity.includes(" - ")
        ? exchangeUniversity.split(" - ")[0]
        : "",
      matchesHomeSubjectCode: manualNtnuCode,
      isVerified: false,
      addedBy: "Deg (manuelt)",
    };

    setManualMatches((prev) => [...prev, newManualMatch]);
    setManualNtnuCode("");
    setManualExchangeCode("");
    setManualExchangeName("");
    setShowManualMatchForm(false);
  };

  const uniName = exchangeUniversity.includes(" - ")
    ? exchangeUniversity.split(" - ")[1]
    : exchangeUniversity;

  // Kombiner ABROAD_OPTIONS med manuelle matcher
  const allOptions = [...ABROAD_OPTIONS, ...manualMatches];

  // Filtrer basert på universitet og søk
  const filteredOptions = allOptions.filter((opt) => {
    // Manuelle matcher skal alltid vises
    const isManual = opt.id.toString().startsWith("manual-");

    const isFromSelectedUniversity =
      isManual ||
      uniName === "None selected" ||
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
    const aIsCompatible = selectedSubjects.some(
      (s) => s.code === a.matchesHomeSubjectCode
    );
    const bIsCompatible = selectedSubjects.some(
      (s) => s.code === b.matchesHomeSubjectCode
    );

    // Kompatible først
    if (aIsCompatible && !bIsCompatible) return -1;
    if (!aIsCompatible && bIsCompatible) return 1;

    // Deretter alfabetisk på navn
    return a.name.localeCompare(b.name);
  });

  // Filtrer bort fag som allerede er matchet
  const notYetMatchedOptions = sortedOptions.filter((opt) => {
    return !selectedSubjects.some(
      (s) => s.matchedWith && s.matchedWith.id === opt.id
    );
  });

  // Vis kun kompatible fag først, deretter maks 10 ikke-kompatible
  const compatibleOptions = notYetMatchedOptions.filter((opt) =>
    selectedSubjects.some((s) => s.code === opt.matchesHomeSubjectCode)
  );
  const nonCompatibleOptions = notYetMatchedOptions.filter(
    (opt) =>
      !selectedSubjects.some((s) => s.code === opt.matchesHomeSubjectCode)
  );

  const availableOptions = [
    ...compatibleOptions,
    ...nonCompatibleOptions.slice(0, 10),
  ];

  return (
    <div className="flex h-full animate-in fade-in duration-700">
      {/* Venstre side (Sticky) */}
      <aside className="w-1/3 bg-white border-r border-gray-200 p-6 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 overflow-hidden">
        <div className="mb-6 shrink-0">
          <h3 className="text-lg font-bold text-slate-800 mb-1">Dine krav</h3>
          <p className="text-sm text-slate-500 mb-4">{semesterLabel}</p>

          {/* Progress Bar inside Panel */}
          <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{
                width:
                  selectedSubjects.length > 0
                    ? `${
                        (selectedSubjects.filter((s) => s.matchedWith).length /
                          selectedSubjects.length) *
                        100
                      }%`
                    : "0%",
              }}
            ></div>
          </div>

          {/* Next button - kompakt versjon */}
          {(() => {
            const allMatched = selectedSubjects.every(
              (sub) => sub.matchedWith !== null
            );
            return (
              <button
                onClick={onNext}
                disabled={!allMatched}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm ${
                  allMatched
                    ? "bg-green-600 text-white hover:bg-green-700 shadow-md"
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
                    {selectedSubjects.filter((s) => s.matchedWith).length}/
                    {selectedSubjects.length} matchet
                  </>
                )}
              </button>
            );
          })()}
        </div>

        <div className="space-y-4 overflow-y-auto pb-20 pr-2">
          {selectedSubjects.map((sub) => (
            <div key={sub.id} className="relative group">
              {!sub.matchedWith ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50/50 flex flex-col justify-center items-center text-center h-28 transition-colors hover:border-blue-300 hover:bg-blue-50/30">
                  <button
                    onClick={() => {
                      setSubjects((prev) =>
                        prev.filter((s) => s.id !== sub.id)
                      );
                    }}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                    title="Fjern fag"
                  >
                    <Trash2 size={14} />
                  </button>
                  <span className="font-bold text-slate-700 text-sm">
                    {sub.code}
                  </span>
                  <span className="text-xs text-slate-500 line-clamp-1">
                    {sub.name}
                  </span>
                  <div className="mt-2 text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-medium">
                    Mangler match
                  </div>
                </div>
              ) : (
                <div className="border border-green-200 bg-green-50 rounded-xl p-4 shadow-sm relative">
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => handleRemoveMatch(sub.id)}
                      className="p-1 text-green-700 hover:bg-green-200 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                      title="Fjern match"
                    >
                      <X size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setSubjects((prev) =>
                          prev.filter((s) => s.id !== sub.id)
                        );
                      }}
                      className="p-1 text-green-700 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                      title="Fjern fag"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={14} className="text-green-600" />
                    <span className="text-xs font-bold text-green-800 uppercase">
                      Dekket
                    </span>
                  </div>

                  {/* NTNU-fag som dekkes */}
                  <div className="mb-2 pb-2 border-b border-green-200">
                    <p className="text-[10px] text-green-700 font-medium mb-0.5">
                      NTNU-fag:
                    </p>
                    <p className="font-bold text-xs text-slate-800">
                      {sub.code}
                    </p>
                    <p className="text-[10px] text-slate-600 line-clamp-1">
                      {sub.name}
                    </p>
                  </div>

                  {/* Utvekslingsfag */}
                  <div>
                    <p className="text-[10px] text-green-700 font-medium mb-0.5">
                      Dekkes av:
                    </p>
                    <h4 className="font-bold text-xs text-slate-800">
                      {sub.matchedWith.code}
                    </h4>
                    <p className="text-[10px] text-slate-600 line-clamp-1">
                      {sub.matchedWith.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {sub.matchedWith.university}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Høyre side (Scrollable) */}
      <main className="w-2/3 bg-slate-50 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto pb-20">
          <div className="relative mb-8 sticky top-0 z-20">
            <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm -z-10 -m-4 rounded-xl"></div>
            <Search
              className="absolute left-4 top-3.5 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Søk etter fag i utlandet (skriv f.eks 'UNSW')..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Manuell match knapp og form */}
          <div className="mb-6">
            {!showManualMatchForm ? (
              <button
                onClick={() => setShowManualMatchForm(true)}
                className="w-full bg-blue-50 border-2 border-dashed border-blue-200 text-blue-600 py-3 px-4 rounded-xl font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Legg til match manuelt
              </button>
            ) : (
              <div className="bg-white p-5 rounded-xl border-2 border-blue-200 shadow-sm">
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
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      NTNU emnekode
                    </label>
                    <input
                      type="text"
                      placeholder="eks: EiT"
                      className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      value={manualNtnuCode}
                      onChange={(e) => setManualNtnuCode(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Utvekslingsfag emnekode
                    </label>
                    <input
                      type="text"
                      placeholder="eks: COMP3900"
                      className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      value={manualExchangeCode}
                      onChange={(e) => setManualExchangeCode(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Utvekslingsfag navn
                    </label>
                    <input
                      type="text"
                      placeholder="eks: Computer Science Project"
                      className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      value={manualExchangeName}
                      onChange={(e) => setManualExchangeName(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={handleAddManualMatch}
                    className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Legg til match
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {availableOptions.map((opt) => {
              const matchingHomeSub = selectedSubjects.find(
                (s) => s.code === opt.matchesHomeSubjectCode
              );
              const isCompatible = !!matchingHomeSub;
              const isAlreadyMatched = matchingHomeSub?.matchedWith !== null;

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
                  className={`bg-white p-5 rounded-xl border transition-all flex justify-between items-center ${
                    isCompatible
                      ? "border-blue-100 shadow-sm hover:shadow-md"
                      : "border-gray-100 opacity-70"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {opt.university}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <MapPin size={10} /> {opt.country}
                      </span>
                      {opt.ects && (
                        <span className="text-xs text-gray-500">
                          {opt.ects} ECTS
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-800">{opt.name}</h3>
                    <p className="text-sm text-slate-500">{opt.code}</p>

                    {isCompatible && (
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-0.5 rounded text-[10px] font-medium">
                          <CheckCircle size={10} /> Passer med{" "}
                          {matchingHomeSub?.code}
                        </div>
                        {opt.isVerified && (
                          <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-medium">
                            <ShieldCheck size={10} /> Verifisert
                          </div>
                        )}
                        {isOldApproval && (
                          <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-medium">
                            <AlertTriangle size={10} /> Behandlet for over 5 år
                            siden
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedCourseInfo(opt);
                        setShowInfoModal(true);
                      }}
                      className="bg-gray-100 text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors"
                      title="Vis informasjon"
                    >
                      <Info size={18} />
                    </button>
                    {isCompatible && !isAlreadyMatched && (
                      <button
                        onClick={() =>
                          matchingHomeSub &&
                          handleMatch(opt, matchingHomeSub.id)
                        }
                        className="bg-slate-900 text-white p-2 rounded-full hover:bg-blue-600 transition-colors shadow-md hover:scale-105 transform active:scale-95"
                      >
                        <Plus size={20} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <Info className="text-blue-600" size={24} />
                <h3 className="text-xl font-bold text-slate-900">
                  Fagsinformasjon
                </h3>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
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
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="text-blue-600" size={20} />
                    <span className="font-semibold text-blue-900">
                      Verifisert fag
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 mb-3">
                    Bekreftet gjennom NTNU sine wikisider for utveksling.
                  </p>
                  {selectedCourseInfo.wikiUrl && (
                    <a
                      href={selectedCourseInfo.wikiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
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
    </div>
  );
}
