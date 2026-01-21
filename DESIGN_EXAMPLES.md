/**
 * DESIGN SYSTEM EKSEMPLER
 *
 * Dette er eksempler på hvordan du bruker de standardiserte fargene.
 * Kopier og lim inn kode-snippets herfra når du lager nye komponenter.
 */

// =====================================
// KNAPPER - Bruk disse i stedet for custom styling
// =====================================

// Primary knapp (Mørk grå - bruk for hovedhandlinger)
<button className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
  Lagre plan
</button>

// Eller bruk utility class:
<button className="btn-primary">
  Lagre plan
</button>

// Success knapp (Grønn - bruk når krav er oppfylt)
<button className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
  Gå videre
</button>

// Eller bruk utility class:
<button className="btn-success">
  Gå videre
</button>

// Danger knapp (Rød - bruk for sletting)
<button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
  Slett erfaring
</button>

// Sekundær knapp (Grå outline)
<button className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
  Avbryt
</button>

// =====================================
// BADGES - Små labels/tags
// =====================================

// Primary badge (brukes for studieprogram, universitet, etc.)
<span className="bg-gray-100 text-gray-900 px-3 py-1 rounded-full text-xs font-medium">
  Industriell økonomi
</span>

// Eller bruk utility class:
<span className="badge-primary">
  Industriell økonomi
</span>

// Success badge (brukes for "Godkjent", "Fullført", etc.)
<span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-medium">
  Godkjent
</span>

// Warning badge
<span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium">
  Mangler match
</span>

// Danger badge
<span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-medium">
  Avvist
</span>

// =====================================
// ALERTS/VARSLER - Informasjonsbokser
// =====================================

// Warning alert (brukes for advarsler om manglende krav)
<div className="border-2 border-dashed border-yellow-300 bg-yellow-50 p-4 rounded-lg">
  <div className="flex items-center gap-2 text-yellow-700">
    <AlertTriangle size={16} />
    <span className="font-medium">Mangler 6 studiepoeng</span>
  </div>
</div>

// Eller bruk utility class:
<div className="alert-warning">
  <div className="flex items-center gap-2">
    <AlertTriangle size={16} />
    <span className="font-medium">Mangler 6 studiepoeng</span>
  </div>
</div>

// Success alert
<div className="bg-green-50 border border-green-200 text-green-600 p-4 rounded-lg">
  <div className="flex items-center gap-2">
    <CheckCircle size={16} />
    <span className="font-medium">Alle krav er oppfylt!</span>
  </div>
</div>

// Danger/Error alert
<div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
  <div className="flex items-center gap-2">
    <AlertCircle size={16} />
    <span className="font-medium">Kunne ikke lagre endringer</span>
  </div>
</div>

// =====================================
// KORT/CARDS - Større containere
// =====================================

// Standard kort
<div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
  <h3 className="text-lg font-bold text-gray-900 mb-2">Tittel</h3>
  <p className="text-gray-600">Innhold her...</p>
</div>

// Kort med hover effekt (for klikkbare elementer)
<div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-gray-300 hover:shadow-md transition-all cursor-pointer">
  <h3 className="text-lg font-bold text-gray-900 mb-2">Klikkbar tittel</h3>
  <p className="text-gray-600">Klikk for mer info...</p>
</div>

// =====================================
// INPUT FELTER
// =====================================

// Standard input
<input
  type="text"
  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
  placeholder="Skriv her..."
/>

// Disabled input
<input
  type="text"
  disabled
  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
  placeholder="Deaktivert..."
/>

// =====================================
// PROGRESS BARS
// =====================================

// Progress bar (grå til grønn når fullført)
<div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden">
  <div
    className={`absolute top-0 left-0 h-full transition-all duration-500 rounded-full ${
      totalECTS >= 30 ? "bg-green-500" : "bg-gray-800"
    }`}
    style={{ width: `${Math.min((totalECTS / 30) * 100, 100)}%` }}
  />
</div>

// =====================================
// LOADING SPINNERS
// =====================================

// Primary spinner (mørk grå)
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>

// Med tekst
<div className="flex flex-col items-center gap-4">
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  <p className="text-gray-600">Laster...</p>
</div>

// =====================================
// STEP INDICATORS - Fremdriftsvisning
// =====================================

// Step indicator med grå farge
<div className="flex items-center gap-4">
  {[1, 2, 3, 4].map((stepNum) => (
    <div key={stepNum} className="flex flex-col items-center">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
          currentStep >= stepNum
            ? "border-gray-900 bg-gray-900 text-white"
            : "border-gray-300 text-gray-400"
        }`}
      >
        {stepNum}
      </div>
      <span
        className={`text-xs mt-1 font-medium ${
          currentStep >= stepNum ? "text-gray-900" : "text-gray-400"
        }`}
      >
        Steg {stepNum}
      </span>
    </div>
  ))}
</div>

// =====================================
// FARGE KOMBINASJONER SOM FUNGERER GODT
// =====================================

/**
 * GODE KOMBINASJONER:
 *
 * Primary (Grå):
 * - bg-gray-900 + text-white (knapper)
 * - bg-gray-100 + text-gray-900 (badges, light variant)
 * - border-gray-200 (borders)
 *
 * Success (Grønn):
 * - bg-green-600 + text-white (knapper)
 * - bg-green-50 + text-green-600 (alerts, badges)
 * - border-green-200 (borders)
 *
 * Warning (Gul):
 * - bg-yellow-50 + text-yellow-700 (alerts)
 * - border-yellow-300 (borders, spesielt dashed)
 *
 * Danger (Rød):
 * - bg-red-600 + text-white (knapper)
 * - bg-red-50 + text-red-600 (alerts, badges)
 * - border-red-200 (borders)
 */

// =====================================
// IKONER MED FARGER
// =====================================

// Success ikon
<CheckCircle className="text-green-600" size={20} />

// Warning ikon
<AlertTriangle className="text-yellow-700" size={20} />

// Danger/Error ikon
<AlertCircle className="text-red-600" size={20} />

// Info ikon
<Info className="text-gray-900" size={20} />

// =====================================
// KOMPLETTE EKSEMPLER
// =====================================

// Eksempel 1: "Dine krav" seksjon
<div className="bg-white border-r border-gray-200 p-6">
  <div className="flex justify-between items-end mb-4">
    <div>
      <h3 className="text-lg font-bold text-gray-900">Dine krav</h3>
      <p className="text-sm text-gray-500">Høst 2024</p>
    </div>
    <div className="text-right">
      <div className={`text-2xl font-bold ${totalECTS >= 30 ? "text-green-600" : "text-gray-900"}`}>
        {totalECTS}
        <span className="text-sm font-medium text-gray-400">/30</span>
      </div>
      <div className="text-xs font-medium text-gray-400">Studiepoeng</div>
    </div>
  </div>

  {/* Progress bar */}
  <div className="relative h-2 w-full bg-gray-100 rounded-full mb-2">
    <div
      className={`absolute top-0 left-0 h-full transition-all duration-500 rounded-full ${
        totalECTS >= 30 ? "bg-green-500" : "bg-gray-800"
      }`}
      style={{ width: `${Math.min((totalECTS / 30) * 100, 100)}%` }}
    />
  </div>

  {/* Status */}
  {totalECTS < 30 ? (
    <div className="flex items-center gap-1.5 text-yellow-700 text-xs font-medium">
      <AlertTriangle size={12} />
      <span>Mangler {30 - totalECTS} poeng</span>
    </div>
  ) : (
    <div className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
      <CheckCircle size={12} />
      <span>Krav oppfylt</span>
    </div>
  )}

  {/* Next button */}
  <button
    disabled={!allMatched}
    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm ${
      allMatched
        ? "bg-green-600 text-white hover:bg-green-700 shadow-md"
        : "bg-gray-100 text-gray-400 cursor-not-allowed"
    }`}
  >
    {allMatched ? (
      <>
        <CheckCircle size={16} /> Gå videre
      </>
    ) : (
      "Ikke ferdig"
    )}
  </button>
</div>

// Eksempel 2: Advarselsboks når du mangler studiepoeng
{allMatched && totalECTS < 30 && (
  <div className="border-2 border-dashed border-yellow-300 rounded-xl p-4 bg-yellow-50 text-center">
    <span className="font-bold text-yellow-700 text-sm mb-1 block">
      Mangler studiepoeng?
    </span>
    <p className="text-xs text-yellow-700 mb-3">
      Du har matchet alle fagene, men mangler fortsatt {30 - totalECTS} poeng.
    </p>
    <button className="bg-yellow-100 text-yellow-700 border border-yellow-200 px-4 py-2 rounded-lg text-xs font-bold hover:bg-yellow-200 transition-colors">
      Legg til fyllfag
    </button>
  </div>
)}
