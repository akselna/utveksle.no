"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";

// --- TYPER ---
type Subject = {
  id: string;
  code: string;
  name: string;
  credits: number;
  matchedWith: AbroadSubject | null;
};

type AbroadSubject = {
  id: string;
  code: string;
  name: string;
  university: string;
  country: string;
  matchesHomeSubjectCode?: string;
};

// --- DATA ---
// Mock data som simulerer API-kall basert på studie
const MOCK_STUDY_PLANS: Record<string, Subject[]> = {
  Datateknologi: [
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
    {
      id: "h4",
      code: "EiT",
      name: "Eksperter i Team",
      credits: 7.5,
      matchedWith: null,
    },
  ],
  Kybernetikk: [
    {
      id: "k1",
      code: "TTK4105",
      name: "Reguleringsteknikk",
      credits: 7.5,
      matchedWith: null,
    },
    {
      id: "k2",
      code: "TTK4115",
      name: "Lineær Systemteori",
      credits: 7.5,
      matchedWith: null,
    },
    {
      id: "k3",
      code: "TMA4135",
      name: "Matematikk 4D",
      credits: 7.5,
      matchedWith: null,
    },
    {
      id: "k4",
      code: "Valgfag",
      name: "Valgbart emne",
      credits: 7.5,
      matchedWith: null,
    },
  ],
};

const ABROAD_OPTIONS: AbroadSubject[] = [
  {
    id: "a1",
    code: "COMP3121",
    name: "Algorithms & Programming",
    university: "UNSW",
    country: "Australia",
    matchesHomeSubjectCode: "TDT4120",
  },
  {
    id: "a2",
    code: "CS106B",
    name: "Programming Abstractions",
    university: "Stanford",
    country: "USA",
    matchesHomeSubjectCode: "TDT4120",
  },
  {
    id: "a3",
    code: "COMP3311",
    name: "Database Systems",
    university: "UNSW",
    country: "Australia",
    matchesHomeSubjectCode: "TDT4145",
  },
  {
    id: "a4",
    code: "CSE 100",
    name: "Control Systems",
    university: "UCSD",
    country: "USA",
    matchesHomeSubjectCode: "TTK4105",
  },
  {
    id: "a99",
    code: "SURF101",
    name: "Introduction to Surfing",
    university: "UNSW",
    country: "Australia",
    matchesHomeSubjectCode: "Valgfag",
  },
];

export default function ExchangePlannerFull() {
  const [step, setStep] = useState(1);
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  // State: Steg 1
  const [university, setUniversity] = useState("NTNU");
  const [program, setProgram] = useState("Datateknologi");
  const [studyYear, setStudyYear] = useState<number>(4); // F.eks. 4. klasse
  const [semesterChoice, setSemesterChoice] = useState("Høst"); // Høst eller Vår

  // State: Steg 2 & 3 (Faglisten)
  const [mySubjects, setMySubjects] = useState<Subject[]>([]);

  // State: Legge til manuelt fag
  const [newSubjectCode, setNewSubjectCode] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");

  // --- HJELPEFUNKSJONER ---

  // Beregn hvilket semester-nummer det er basert på år (F.eks. 4. år Høst = 7. semester)
  const calculatedSemester =
    semesterChoice === "Høst" ? studyYear * 2 - 1 : studyYear * 2;

  const handleFetchSubjects = () => {
    // I en ekte app ville vi brukt `calculatedSemester` for å hente riktig fagpakke
    const defaultPlan = MOCK_STUDY_PLANS[program] || [];
    setMySubjects(defaultPlan);
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
    };
    setMySubjects([...mySubjects, newSub]);
    setNewSubjectCode("");
    setNewSubjectName("");
  };

  const handleSavePlan = () => {
    // Her ville du lagret til databasen
    console.log("Lagrer plan til DB:", mySubjects);

    // Vis feedback til brukeren
    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 3000);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-slate-800 font-sans overflow-hidden">
      {/* --- GLOBAL HEADER MED PROGRESS BAR --- */}
      <header className="bg-white border-b border-gray-200 shadow-sm z-30 shrink-0">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center mb-4">

            {step === 3 && (
              <button
                onClick={handleSavePlan}
                className="text-sm font-medium text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Save size={16} /> Lagre utkast
              </button>
            )}
          </div>

          {/* Progress Bar Visual */}
          <div className="flex items-center justify-between w-full max-w-4xl mx-auto relative">
            {/* Linje bak */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 rounded"></div>
            <div
              className="absolute top-1/2 left-0 h-1 bg-blue-600 -z-10 rounded transition-all duration-500"
              style={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" }}
            ></div>

            {/* Steg 1 */}
            <div className="flex flex-col items-center bg-white px-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  step >= 1
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 text-gray-400"
                }`}
              >
                1
              </div>
              <span
                className={`text-xs mt-1 font-medium ${
                  step >= 1 ? "text-blue-700" : "text-gray-400"
                }`}
              >
                Profil
              </span>
            </div>

            {/* Steg 2 */}
            <div className="flex flex-col items-center bg-white px-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  step >= 2
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 text-gray-400"
                }`}
              >
                2
              </div>
              <span
                className={`text-xs mt-1 font-medium ${
                  step >= 2 ? "text-blue-700" : "text-gray-400"
                }`}
              >
                Dine fag
              </span>
            </div>

            {/* Steg 3 */}
            <div className="flex flex-col items-center bg-white px-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  step >= 3
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 text-gray-400"
                }`}
              >
                3
              </div>
              <span
                className={`text-xs mt-1 font-medium ${
                  step >= 3 ? "text-blue-700" : "text-gray-400"
                }`}
              >
                Planlegger
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 overflow-y-auto relative">
        {/* --- TOAST NOTIFICATION (Når man lagrer) --- */}
        {showSaveNotification && (
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-in slide-in-from-top fade-in z-50">
            <CheckCircle className="text-green-400" size={20} />
            <span className="font-medium">
              Planen er lagret! Du kan fortsette senere.
            </span>
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
                {/* Universitet */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                    <School size={14} /> Universitet
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

                {/* Studieprogram */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                    <GraduationCap size={14} /> Studieprogram
                  </label>
                  <select
                    className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                  >
                    <option value="Datateknologi">
                      Datateknologi (5-årig)
                    </option>
                    <option value="Kybernetikk">Kybernetikk og Robotikk</option>
                    <option value="Indøk">Industriell Økonomi</option>
                  </select>
                </div>

                {/* Studieår og Semester */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                      <Calendar size={14} /> Studieår
                    </label>
                    <select
                      className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
                      value={studyYear}
                      onChange={(e) => setStudyYear(Number(e.target.value))}
                    >
                      <option value={1}>1. klasse</option>
                      <option value={2}>2. klasse</option>
                      <option value={3}>3. klasse</option>
                      <option value={4}>4. klasse</option>
                      <option value={5}>5. klasse</option>
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
                        Høst ({studyYear * 2 - 1}. sem)
                      </option>
                      <option value="Vår">Vår ({studyYear * 2}. sem)</option>
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

        {/* --- STEG 2: SJEKKLISTE (Edit Mode) --- */}
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
                  {mySubjects.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-4 bg-slate-50 border border-gray-200 rounded-xl group hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-white p-2 rounded-lg border border-gray-200 text-slate-600">
                          <BookOpen size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">
                            {sub.code}
                          </div>
                          <div className="text-sm text-slate-500">
                            {sub.name}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setMySubjects(
                            mySubjects.filter((s) => s.id !== sub.id)
                          )
                        }
                        className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Fjern fag"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}

                  {/* Manuell input */}
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
                    onClick={() => setStep(3)}
                    className="bg-green-600 text-white py-3 px-8 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center gap-2"
                  >
                    Alt ser riktig ut <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- STEG 3: PLANLEGGER (Split Screen) --- */}
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
              />
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
}: {
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  program: string;
  semesterLabel: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");

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

  const availableOptions = ABROAD_OPTIONS.filter(
    (opt) =>
      opt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opt.university.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full animate-in fade-in duration-700">
      {/* Venstre side (Sticky) */}
      <aside className="w-1/3 bg-white border-r border-gray-200 p-6 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 overflow-hidden">
        <div className="mb-6 shrink-0">
          <h3 className="text-lg font-bold text-slate-800 mb-1">Dine krav</h3>
          <p className="text-sm text-slate-500 mb-4">{semesterLabel}</p>

          {/* Progress Bar inside Panel */}
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${
                  (subjects.filter((s) => s.matchedWith).length /
                    subjects.length) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </div>

        <div className="space-y-4 overflow-y-auto pb-20 pr-2">
          {subjects.map((sub) => (
            <div key={sub.id} className="relative group">
              {!sub.matchedWith ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50/50 flex flex-col justify-center items-center text-center h-28 transition-colors hover:border-blue-300 hover:bg-blue-50/30">
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
                  <button
                    onClick={() => handleRemoveMatch(sub.id)}
                    className="absolute top-2 right-2 p-1 text-green-700 hover:bg-green-200 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X size={14} />
                  </button>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={14} className="text-green-600" />
                    <span className="text-xs font-bold text-green-800 uppercase">
                      Dekket
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">
                    {sub.matchedWith.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {sub.matchedWith.university}
                  </p>
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

          <div className="grid grid-cols-1 gap-4">
            {availableOptions.map((opt) => {
              const matchingHomeSub = subjects.find(
                (s) => s.code === opt.matchesHomeSubjectCode
              );
              const isCompatible = !!matchingHomeSub;
              const isAlreadyMatched = matchingHomeSub?.matchedWith !== null;

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
                    </div>
                    <h3 className="font-bold text-slate-800">{opt.name}</h3>
                    <p className="text-sm text-slate-500">{opt.code}</p>

                    {isCompatible && (
                      <div className="mt-2 inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-0.5 rounded text-[10px] font-medium">
                        <CheckCircle size={10} /> Passer med{" "}
                        {matchingHomeSub?.code}
                      </div>
                    )}
                  </div>

                  <div>
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
    </div>
  );
}
