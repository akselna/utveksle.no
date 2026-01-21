// Liste over alle studieprogrammer ved NTNU
// Denne listen brukes i både "Min utveksling" og "Erfaringer" for å sikre konsistent data

export interface StudyProgram {
  value: string;
  label: string;
  category: string;
}

export const STUDY_PROGRAMS: StudyProgram[] = [
  // Bachelor og Årsstudium
  {
    value: "Allmenn litteraturvitenskap",
    label: "Allmenn litteraturvitenskap (Bachelor og Årsstudium)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Antikkens kultur",
    label: "Antikkens kultur og klassiske fag (Bachelor)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Arkeologi",
    label: "Arkeologi (Bachelor)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Arkiv, museum og dokumentasjonsforvaltning",
    label: "Arkiv, museum og dokumentasjonsforvaltning (Bachelor)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Audiologi",
    label: "Audiologi (Bachelor)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Automatisering og intelligente systemer",
    label: "Automatisering og intelligente systemer - Ingeniørfag (Bachelor)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Barnevern",
    label: "Barnevern (Bachelor)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Bevegelsesvitenskap",
    label: "Bevegelsesvitenskap (Bachelor og Årsstudium)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Billedkunst",
    label: "Billedkunst (Bachelor)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Bioingeniørfag",
    label: "Bioingeniørfag (Bachelor)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Biologi",
    label: "Biologi (Bachelor)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Biologi og kjemi",
    label: "Biologi og kjemi (Årsstudium)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Bygg - Ingeniørfag",
    label: "Bygg - Ingeniørfag (Bachelor)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Digital forretningsutvikling",
    label: "Digital forretningsutvikling",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Digital infrastruktur og cybersikkerhet",
    label: "Digital infrastruktur og cybersikkerhet",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Drama og teater",
    label: "Drama og teater (Bachelor og Årsstudium)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Elektrifisering og digitalisering",
    label: "Elektrifisering og digitalisering (Bachelor og Ingeniørfag)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Elektronisk systemingeniør",
    label: "Elektronisk systemingeniør - Ingeniørfag",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Engelsk",
    label: "Engelsk (Bachelor og Årsstudium)",
    category: "Bachelor/Årsstudium",
  },
  { value: "Ergoterapi", label: "Ergoterapi", category: "Bachelor/Årsstudium" },
  {
    value: "Etikk",
    label: "Etikk (Årsstudium)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Europastudier",
    label: "Europastudier",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Film- og videoproduksjon",
    label: "Film- og videoproduksjon",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Filmvitenskap",
    label: "Filmvitenskap (Bachelor og Årsstudium)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Filosofi",
    label: "Filosofi (Årsstudium)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Filosofi og etikk",
    label: "Filosofi og etikk",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Flyingeniør - Ingeniørfag",
    label: "Flyingeniør - Ingeniørfag",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Fornybar energi - Ingeniørfag",
    label: "Fornybar energi - Ingeniørfag",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Fransk",
    label: "Fransk (Bachelor og Årsstudium)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Fremmedspråk",
    label: "Fremmedspråk",
    category: "Bachelor/Årsstudium",
  },
  { value: "Fysikk", label: "Fysikk", category: "Bachelor/Årsstudium" },
  {
    value: "Fysioterapi",
    label: "Fysioterapi",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Geografi",
    label: "Geografi (Bachelor og Årsstudium)",
    category: "Bachelor/Årsstudium",
  },
  { value: "Geologi", label: "Geologi", category: "Bachelor/Årsstudium" },
  {
    value: "Havbruk - Ingeniørfag",
    label: "Havbruk - Ingeniørfag",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Historie",
    label: "Historie (Bachelor og Årsstudium)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Informatikk",
    label: "Informatikk",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Kjemi",
    label: "Kjemi (Bachelor og Ingeniørfag)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Kjemi og materialteknologi",
    label: "Kjemi og materialteknologi - Ingeniørfag",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Kulturminneforvaltning og museum",
    label: "Kulturminneforvaltning og museum",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Kunnskap, teknologi og samfunn",
    label: "Kunnskap, teknologi og samfunn (STS) (Årsstudium)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Kunsthistorie",
    label: "Kunsthistorie (Bachelor og Årsstudium)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Latin",
    label: "Latin (Årsstudium)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Maskin - Ingeniørfag",
    label: "Maskin - Ingeniørfag",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Matvitenskap, teknologi og bærekraft",
    label: "Matvitenskap, teknologi og bærekraft",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Medievitenskap",
    label: "Medievitenskap (Bachelor og Årsstudium)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Musikk, utøvende",
    label: "Musikk, utøvende (inkl. jazz)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Musikkteknologi",
    label: "Musikkteknologi",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Musikkvitenskap",
    label: "Musikkvitenskap (Bachelor og Årsstudium)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Nordisk språk og litteratur",
    label: "Nordisk språk og litteratur (Bachelor og Årsstudium)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Norsk tegnspråk",
    label: "Norsk tegnspråk (Bachelor og Årsstudium)",
    category: "Bachelor/Årsstudium",
  },
  { value: "Radiografi", label: "Radiografi", category: "Bachelor/Årsstudium" },
  {
    value: "Religionsvitenskap",
    label: "Religionsvitenskap (Årsstudium)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Samfunns- og idrettsvitenskap",
    label: "Samfunns- og idrettsvitenskap",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Samfunnsøkonomi",
    label: "Samfunnsøkonomi (Bachelor og Årsstudium)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Sosialantropologi",
    label: "Sosialantropologi (Bachelor og Årsstudium)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Sosiologi",
    label: "Sosiologi (Årsstudium)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Spansk",
    label: "Spansk (Bachelor og Årsstudium)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Vernepleie",
    label: "Vernepleie (Bachelor)",
    category: "Bachelor/Årsstudium",
  },
  {
    value: "Yrkesfaglærerutdanning",
    label: "Yrkesfaglærerutdanning (Bachelor)",
    category: "Bachelor/Årsstudium",
  },

  // Master (2 og 5 år)
  {
    value: "Allmenn litteraturvitenskap - Master",
    label: "Allmenn litteraturvitenskap (Master)",
    category: "Master",
  },
  {
    value: "Anvendt teater og dramaturgi",
    label: "Anvendt teater og dramaturgi (Master)",
    category: "Master",
  },
  {
    value: "Arbeids- og organisasjonspsykologi",
    label: "Arbeids- og organisasjonspsykologi (Master)",
    category: "Master",
  },
  {
    value: "Arkeologi - Master",
    label: "Arkeologi (Master)",
    category: "Master",
  },
  { value: "Arkitektur", label: "Arkitektur (Master)", category: "Master" },
  {
    value: "Arkiv og dokumentasjonsforvaltning",
    label: "Arkiv og dokumentasjonsforvaltning (Master)",
    category: "Master",
  },
  {
    value: "Barnevern - Master",
    label: "Barnevern (Master)",
    category: "Master",
  },
  {
    value: "Biology",
    label: "Biology / Biology and Sustainability (Master)",
    category: "Master",
  },
  {
    value: "Biotechnology",
    label: "Biotechnology / Bioteknologi (Master)",
    category: "Master",
  },
  {
    value: "Bygg og infrastruktur",
    label: "Bygg og infrastruktur / Byplanlegging (Master)",
    category: "Master",
  },
  {
    value: "Bærekrafts-, arbeidsmiljø- og sikkerhetsledelse",
    label: "Bærekrafts-, arbeidsmiljø- og sikkerhetsledelse (Master)",
    category: "Master",
  },
  {
    value: "Chemistry",
    label: "Chemistry / Chemistry and Ecotoxicology (Master)",
    category: "Master",
  },
  {
    value: "Childhood Studies",
    label: "Childhood Studies (Master)",
    category: "Master",
  },
  {
    value: "Coastal and Marine Engineering",
    label: "Coastal and Marine Engineering / Cold Climate Engineering (Master)",
    category: "Master",
  },
  {
    value: "Cybersikkerhet - Master",
    label: "Cybersikkerhet / Digital Infrastructure / Cybersecurity (Master)",
    category: "Master",
  },
  {
    value: "Datateknologi",
    label: "Datateknologi (Master)",
    category: "Master",
  },
  {
    value: "Digital transformasjon",
    label: "Digital transformasjon (Master)",
    category: "Master",
  },
  {
    value: "Eiendomsutvikling og -forvaltning",
    label: "Eiendomsutvikling og -forvaltning (Master)",
    category: "Master",
  },
  {
    value: "Electric Power Engineering",
    label: "Electric Power Engineering / Electronic Systems Design (Master)",
    category: "Master",
  },
  {
    value: "Elektronisk systemdesign og innovasjon",
    label: "Elektronisk systemdesign og innovasjon (Master)",
    category: "Master",
  },
  {
    value: "Energi og miljø",
    label: "Energi og miljø (Master)",
    category: "Master",
  },
  { value: "Engelsk - Master", label: "Engelsk (Master)", category: "Master" },
  {
    value: "English Linguistics",
    label: "English Linguistics and Language Acquisition (Master)",
    category: "Master",
  },
  {
    value: "Entrepreneurship",
    label: "Entrepreneurship / Entreprenørskap (Master)",
    category: "Master",
  },
  {
    value: "Environmental Engineering",
    label: "Environmental Engineering / Toxicology (Master)",
    category: "Master",
  },
  { value: "Etikk - Master", label: "Etikk (Master)", category: "Master" },
  {
    value: "European Studies - Master",
    label: "European Studies (Master)",
    category: "Master",
  },
  { value: "Fagdidaktikk", label: "Fagdidaktikk (Master)", category: "Master" },
  { value: "Farmasi", label: "Farmasi (Master)", category: "Master" },
  {
    value: "Film- og medievitenskap",
    label: "Film- og medievitenskap / Videoproduksjon (Master)",
    category: "Master",
  },
  {
    value: "Filosofi - Master",
    label: "Filosofi / Filosofi og etikk (Master)",
    category: "Master",
  },
  {
    value: "Finansiell økonomi",
    label: "Finansiell økonomi (Master)",
    category: "Master",
  },
  { value: "Fine Art", label: "Fine Art (Master)", category: "Master" },
  { value: "Folkehelse", label: "Folkehelse (Master)", category: "Master" },
  { value: "Fransk - Master", label: "Fransk (Master)", category: "Master" },
  {
    value: "Funksjonshemming og samfunn",
    label: "Funksjonshemming og samfunn (Master)",
    category: "Master",
  },
  {
    value: "Fysikk og matematikk",
    label: "Fysikk og matematikk (Master)",
    category: "Master",
  },
  {
    value: "Geografi - Master",
    label: "Geografi (Master)",
    category: "Master",
  },
  {
    value: "Geologi - Master",
    label: "Geologi / Georessurser / Geotechnics (Master)",
    category: "Master",
  },
  {
    value: "Global Health",
    label: "Global Health / Global Manufacturing / Globalisation (Master)",
    category: "Master",
  },
  {
    value: "Grunnskolelærerutdanning",
    label: "Grunnskolelærerutdanning 1-7 og 5-10 (Master)",
    category: "Master",
  },
  {
    value: "Health Management in Aquaculture",
    label: "Health Management in Aquaculture (Master)",
    category: "Master",
  },
  {
    value: "Helsesykepleie",
    label: "Helsesykepleie (Master)",
    category: "Master",
  },
  {
    value: "Historie - Master",
    label: "Historie (Master)",
    category: "Master",
  },
  {
    value: "Hydrogen Systems",
    label: "Hydrogen Systems / Hydropower Development (Master)",
    category: "Master",
  },
  {
    value: "Idrettsvitenskap",
    label: "Idrettsvitenskap (Master)",
    category: "Master",
  },
  {
    value: "Industrial Design",
    label: "Industrial Design / Industriell design (Master)",
    category: "Master",
  },
  {
    value: "Industriell kjemi og bioteknologi",
    label: "Industriell kjemi og bioteknologi / Materialer (Master)",
    category: "Master",
  },
  {
    value: "Industriell kybernetikk",
    label: "Industriell kybernetikk (Master)",
    category: "Master",
  },
  {
    value: "Industriell økonomi og teknologiledelse",
    label: "Industriell økonomi og teknologiledelse (Master)",
    category: "Master",
  },
  { value: "Informatics", label: "Informatics (Master)", category: "Master" },
  {
    value: "Ingeniørgeologi",
    label: "Ingeniørgeologi (Master)",
    category: "Master",
  },
  {
    value: "Ingeniørvitenskap og IKT",
    label: "Ingeniørvitenskap og IKT (Master)",
    category: "Master",
  },
  {
    value: "Innovasjon og bærekraftig samfunnsutvikling",
    label: "Innovasjon og bærekraftig samfunnsutvikling (Master)",
    category: "Master",
  },
  {
    value: "Klassiske fag",
    label: "Klassiske fag (Master)",
    category: "Master",
  },
  {
    value: "Klinisk helsevitenskap",
    label: "Klinisk helsevitenskap (Master)",
    category: "Master",
  },
  {
    value: "Krig og samfunn",
    label: "Krig og samfunn (Master)",
    category: "Master",
  },
  {
    value: "Kulturminneforvaltning - Master",
    label: "Kulturminneforvaltning (Master)",
    category: "Master",
  },
  {
    value: "Kunnskap, teknologi og samfunn - Master",
    label: "Kunnskap, teknologi og samfunn (STS) (Master)",
    category: "Master",
  },
  {
    value: "Kunsthistorie - Master",
    label: "Kunsthistorie (Master)",
    category: "Master",
  },
  {
    value: "Kybernetikk",
    label: "Kybernetikk og robotikk (Master)",
    category: "Master",
  },
  {
    value: "Ledelse av teknologi",
    label: "Ledelse av teknologi (Master)",
    category: "Master",
  },
  {
    value: "Lektorutdanning",
    label: "Lektorutdanning (ulike fagområder) (Master)",
    category: "Master",
  },
  {
    value: "Marin teknikk",
    label: "Marin teknikk / Marine Technology (Master)",
    category: "Master",
  },
  {
    value: "Maskin- og energiteknologi",
    label: "Maskin- og energiteknologi (Master)",
    category: "Master",
  },
  {
    value: "Spesialsykepleie",
    label: "Master i spesialsykepleie (Master)",
    category: "Master",
  },
  {
    value: "Materials Science",
    label: "Materials Science / Materialteknologi (Master)",
    category: "Master",
  },
  {
    value: "Mathematical Sciences",
    label: "Mathematical Sciences (Master)",
    category: "Master",
  },
  {
    value: "Matvitenskap - Master",
    label: "Matvitenskap, teknologi og bærekraft (Master)",
    category: "Master",
  },
  {
    value: "Medier, kommunikasjon og informasjonsteknologi",
    label: "Medier, kommunikasjon og informasjonsteknologi (Master)",
    category: "Master",
  },
  {
    value: "Music Performance",
    label: "Music Performance (Master)",
    category: "Master",
  },
  {
    value: "Musikkvitenskap - Master",
    label: "Musikkvitenskap (Master)",
    category: "Master",
  },
  {
    value: "Nanoteknologi",
    label: "Nanoteknologi (Master)",
    category: "Master",
  },
  {
    value: "Natural Resources Management",
    label: "Natural Resources Management (Master)",
    category: "Master",
  },
  {
    value: "Nordisk språk og litteratur - Master",
    label: "Nordisk språk og litteratur (Master)",
    category: "Master",
  },
  {
    value: "Ocean Resources",
    label: "Ocean Resources (Master)",
    category: "Master",
  },
  {
    value: "Petroleum Engineering",
    label: "Petroleum Engineering / Petroleumsfag (Master)",
    category: "Master",
  },
  {
    value: "Physical Activity and Health",
    label: "Physical Activity and Health (Master)",
    category: "Master",
  },
  { value: "Physics", label: "Physics (Master)", category: "Master" },
  {
    value: "Produktutvikling og produksjon",
    label: "Produktutvikling og produksjon (Master)",
    category: "Master",
  },
  {
    value: "Project Management",
    label: "Project Management (Master)",
    category: "Master",
  },
  {
    value: "Psykologisk vitenskap og teknologi",
    label: "Psykologisk vitenskap og teknologi (Master)",
    category: "Master",
  },
  {
    value: "Regnskap og revisjon",
    label: "Regnskap og revisjon (Master)",
    category: "Master",
  },
  {
    value: "RAMS",
    label:
      "Reliability, Availability, Maintainability and Safety (RAMS) (Master)",
    category: "Master",
  },
  {
    value: "Religionsvitenskap - Master",
    label: "Religionsvitenskap (Master)",
    category: "Master",
  },
  {
    value: "Rådgivningsvitenskap",
    label: "Rådgivningsvitenskap (Master)",
    category: "Master",
  },
  {
    value: "Samfunns-, helse- og miljøpsykologi",
    label: "Samfunns-, helse- og miljøpsykologi (Master)",
    category: "Master",
  },
  {
    value: "Samfunnsøkonomi - Master",
    label: "Samfunnsøkonomi (Master)",
    category: "Master",
  },
  {
    value: "Sosialantropologi - Master",
    label: "Sosialantropologi (Master)",
    category: "Master",
  },
  {
    value: "Sosiologi - Master",
    label: "Sosiologi (Master)",
    category: "Master",
  },
  {
    value: "Sound and Vibration",
    label: "Sound and Vibration (Master)",
    category: "Master",
  },
  {
    value: "Spesialpedagogikk",
    label: "Spesialpedagogikk (Master)",
    category: "Master",
  },
  {
    value: "Økonomi og administrasjon",
    label: "Økonomi og administrasjon",
    category: "Master",
  },
  {
    value: "Dataingeniør",
    label: "Dataingeniør (Bachelor)",
    category: "Bachelor/Årsstudium",
  },
];
