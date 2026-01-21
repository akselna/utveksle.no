# Design System - Utveksling App

Dette dokumentet beskriver de standardiserte fargene og stilene som brukes i hele applikasjonen.

## Fargepalett

### Primary (Logo-farge #1a3a51 - Mørk blågrønn)
- **Bruk:** Hovedknapper, viktige elementer, navigasjon
- **Farge:** `#1a3a51` (samme som logoen)
- **Tailwind:** `bg-gray-900`, `text-gray-900` (overstyrt til å bruke logo-fargen)
- **CSS Variable:** `var(--primary)`
- **Hover:** `bg-gray-800` eller `var(--primary-hover)` (#143044)
- **Light variant:** `bg-gray-100` eller `var(--primary-light)` (#e8eef3) for badges

**VIKTIG:** Vi bruker Tailwind-klassene `gray-900`, `gray-800` og `gray-100`, men de er overstyrt i globals.css til å bruke logo-fargen for konsistens.

**Eksempler:**
```tsx
// Hovedknapp
<button className="bg-gray-900 text-white hover:bg-gray-800 px-6 py-3 rounded-lg font-medium">
  Lagre
</button>

// Eller bruk utility class
<button className="btn-primary">
  Lagre
</button>

// Badge
<span className="bg-gray-100 text-gray-900 px-3 py-1 rounded-full text-xs font-medium">
  Industriell økonomi
</span>

// Eller bruk utility class
<span className="badge-primary">
  Industriell økonomi
</span>
```

### Success (Grønn)
- **Bruk:** Suksessmeldinger, fullførte elementer, positive tilstander
- **Tailwind:** `bg-green-600`, `text-green-600`
- **CSS Variable:** `var(--success)`
- **Hover:** `bg-green-700` eller `var(--success-hover)`
- **Light variant:** `bg-green-50` eller `var(--success-light)`

**Eksempler:**
```tsx
// Suksessknapp
<button className="bg-green-600 text-white hover:bg-green-700 px-6 py-3 rounded-lg font-medium">
  Fullfør
</button>

// Eller bruk utility class
<button className="btn-success">
  Fullfør
</button>

// Suksessmelding
<div className="bg-green-50 text-green-600 border border-green-200 px-4 py-3 rounded-lg">
  Krav oppfylt!
</div>
```

### Warning (Gul/Oransje)
- **Bruk:** Advarsler, manglende krav
- **Tailwind:** `text-yellow-700`, `bg-yellow-50`, `border-yellow-300`
- **CSS Variable:** `var(--warning)`
- **Light variant:** `var(--warning-light)`
- **Border:** `var(--warning-border)`

**Eksempler:**
```tsx
// Advarselsboks
<div className="border-2 border-dashed border-yellow-300 bg-yellow-50 p-4 rounded-lg">
  <span className="text-yellow-700 font-medium">⚠️ Mangler 6 poeng</span>
</div>

// Eller bruk utility class
<div className="alert-warning">
  <span>⚠️ Mangler 6 poeng</span>
</div>

// Advarsel badge
<span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium">
  Mangler match
</span>
```

### Danger (Rød)
- **Bruk:** Feilmeldinger, sletting, destruktive handlinger
- **Tailwind:** `bg-red-600`, `text-red-600`
- **CSS Variable:** `var(--danger)`
- **Hover:** `bg-red-700` eller `var(--danger-hover)`
- **Light variant:** `bg-red-50` eller `var(--danger-light)`

**Eksempler:**
```tsx
// Slette-knapp
<button className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg">
  Slett
</button>

// Feilmelding
<div className="bg-red-50 text-red-600 border border-red-200 px-4 py-3 rounded-lg">
  Kunne ikke lagre endringer
</div>
```

### Neutral/Gray (Grå nyanser)
- **Bruk:** Sekundær tekst, borders, bakgrunner
- **Tailwind:** `text-gray-500`, `bg-gray-50`, `border-gray-200`
- **CSS Variable:** `var(--neutral)`, `var(--border)`

## Utility Classes

Bruk disse ferdige klassene for konsistent styling:

### Knapper
- `.btn-primary` - Hovedknapp (mørk grå)
- `.btn-success` - Suksessknapp (grønn)
- `.btn-danger` - Farlig handling (rød)

### Badges
- `.badge-primary` - Hovedbadge (lys grå)
- `.badge-success` - Suksessbadge (lys grønn)
- `.badge-warning` - Advarselsbadge (lys gul)
- `.badge-danger` - Farlig badge (lys rød)

### Alerts/Varsler
- `.alert-warning` - Advarselsboks (gul)
- `.alert-success` - Suksessboks (grønn)
- `.alert-danger` - Feilboks (rød)

## Retningslinjer

### Når skal du bruke hver farge?

**Primary (Gray-900):**
- Alle hovedknapper ("Lagre", "Fortsett", "Legg til", etc.)
- Viktige UI-elementer som skal trekke oppmerksomhet
- Navigasjonselementer
- Ikoner og tekst som skal være fremtredende

**Success (Green):**
- "Fullført" eller "Godkjent" indikatorer
- Positive tilbakemeldinger til brukeren
- Progress bars som er fullført
- "Gå videre" knapper når krav er oppfylt

**Warning (Yellow):**
- Advarsler om manglende krav (f.eks. "Mangler 6 poeng")
- Elementer som krever brukerens oppmerksomhet
- Midlertidige tilstander som bør fikses

**Danger (Red):**
- Slette-knapper
- Feilmeldinger
- Destruktive handlinger som ikke kan angres

**Neutral (Gray):**
- Sekundær tekst
- Inaktive elementer
- Borders og skillelinjer
- Bakgrunner

## Migrering av eksisterende kode

Erstatt blue farger med de nye standardene:

```tsx
// ❌ Gammelt (blått)
<button className="bg-blue-600 text-white hover:bg-blue-700">

// ✅ Nytt (mørk grå)
<button className="bg-gray-900 text-white hover:bg-gray-800">
// Eller
<button className="btn-primary">

// ❌ Gammelt (blå badge)
<span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full">

// ✅ Nytt (grå badge)
<span className="bg-gray-100 text-gray-900 px-3 py-1 rounded-full">
// Eller
<span className="badge-primary">
```

## CSS Variables

Du kan også bruke CSS variables direkte i inline styles eller custom CSS:

```tsx
<div style={{ backgroundColor: 'var(--primary)' }}>
  Innhold
</div>
```

Tilgjengelige variables:
- `--primary`, `--primary-hover`, `--primary-light`
- `--success`, `--success-hover`, `--success-light`
- `--warning`, `--warning-light`, `--warning-border`
- `--danger`, `--danger-hover`, `--danger-light`
- `--neutral`, `--neutral-light`, `--border`
