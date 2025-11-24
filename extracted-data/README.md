# Ekstrahert Data fra Utvekslingsportalen

Dette mappen inneholder all offentlig informasjon om utvekslingssteder, fag og kurs som er hentet fra Firebase-databasen.

## 📊 Oppsummering

- **Totalt antall utvekslinger**: 119
- **Totalt antall universiteter**: 61
- **Totalt antall land**: 24
- **Totalt antall studieretninger**: 44
- **Totalt antall spesialiseringer**: 30
- **Totalt antall kurs**: 612

## 📄 Eksporterte Filer

### ⭐ `master-data.json` (ANBEFALT)

**Alle data i én fil!** Denne filen inneholder alt i en strukturert format:

- `summary` - Oppsummering og statistikk
- `countries` - Liste over alle land
- `universities` - Liste over alle universiteter
- `universitiesByCountry` - Universiteter gruppert etter land
- `studies` - Liste over alle studieretninger
- `specializations` - Liste over alle spesialiseringer
- `studiesByUniversity` - Studieretninger gruppert etter universitet
- `coursesByStudy` - Kurs gruppert etter studieretning
- `exchanges` - Alle utvekslinger med full informasjon
- `courses` - Alle kurs med full informasjon

### 1. `all-exchanges.json`

Komplett liste over alle utvekslinger med:

- Universitet og land
- Studieretning og spesialisering
- Studieår og antall semestre
- Alle kurs (Høst og Vår) med detaljer

### 2. `universities-list.json`

Alfabetisk liste over alle unike universiteter (61 stk)

### 3. `universities-by-country.json`

Universiteter gruppert etter land. Struktur:

```json
{
  "Country": ["University 1", "University 2", ...]
}
```

### 4. `countries-list.json`

Liste over alle land hvor det finnes utvekslingssteder (24 land)

### 5. `studies-list.json`

Liste over alle studieretninger (fag) som er representert i databasen (44 stk)

### 6. `specializations-list.json`

Liste over alle spesialiseringer innen studieretningene (30 stk)

### 7. `all-courses.json`

Komplett liste over alle kurs med:

- Kurskode og kursnavn
- Erstattet kurskode og kursnavn (NTNU-kurs)
- Institut/departement
- ECTS-poeng
- Semester (Høst/Vår)
- Kommentarer
- Tilhørende universitet, land, studieretning

### 8. `courses-by-study.json`

Kurs gruppert etter studieretning. Struktur:

```json
{
  "Studieretning": [
    {
      "courseCode": "...",
      "courseName": "...",
      ...
    }
  ]
}
```

### 9. `studies-by-university.json`

Studieretninger gruppert etter universitet. Viser hvilke studieretninger som er tilgjengelige ved hvert universitet.

### 10. `summary.json`

Oppsummering og statistikk over ekstrahert data, inkludert ekstraksjonsdato.

## 🔍 Eksempel på Data

### Land med flest universiteter:

- Tyskland: 4 universiteter
- Italia: 4 universiteter
- USA: 4 universiteter
- Danmark: 3 universiteter

### Populære studieretninger:

- Datateknologi
- Kybernetikk og robotikk
- Bygg- og miljøteknikk
- Energi og miljø

## ⚠️ Viktig

- **Ingen sensitiv informasjon** er inkludert (ingen brukerdata, e-postadresser, personlige opplysninger)
- Kun offentlig tilgjengelig informasjon om utvekslinger, universiteter, fag og kurs
- Dataene er hentet fra Firebase Realtime Database

## 📅 Ekstraksjonsdato

Dataene ble ekstrahert: 2025-11-24

## 🔄 Oppdatere Data

For å oppdatere dataene, kjør:

```bash
node extract-data.js
```

Dette vil overskrive filene i denne mappen med nyeste data fra databasen.
