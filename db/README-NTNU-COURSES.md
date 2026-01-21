# NTNU Kursdatabase

## Oversikt

Du har allerede en fungerende **`ntnu_courses`** tabell som inneholder standardiserte NTNU-kurs med:
- **code** - Kurskode (PRIMARY KEY)
- **name** - Kursnavn
- **credits** - Studiepoeng
- **created_at** - Tidsstempel

## Tabellstruktur

```sql
CREATE TABLE IF NOT EXISTS ntnu_courses (
  code VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  credits DECIMAL(4, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Hvordan det fungerer

### 1. Approved Courses refererer til NTNU Courses

`approved_courses` tabellen bruker FOREIGN KEY til `ntnu_courses`:

```sql
ntnu_course_code VARCHAR(50) NOT NULL REFERENCES ntnu_courses(code) ON DELETE CASCADE
```

Dette sikrer at:
- Du kun kan legge til godkjente kurs for NTNU-kurs som finnes
- Kursnavn og studiepoeng er standardiserte
- Data er normalisert (ingen duplisering av NTNU-kursinformasjon)

### 2. Fordeler med denne strukturen

✅ **Konsistens**: Alle NTNU-kurs har én definisjon
✅ **Dataintegritet**: Foreign key sikrer at kun gyldige NTNU-kurs kan brukes
✅ **Mindre lagringsplass**: Navnet lagres kun én gang
✅ **Enklere oppdateringer**: Endre kursnavn på ett sted

## Legge til nye NTNU-kurs

### Metode 1: Manuelt via SQL

```sql
INSERT INTO ntnu_courses (code, name, credits)
VALUES ('TDT4999', 'Eksempel emne', 7.5)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  credits = EXCLUDED.credits;
```

### Metode 2: Bruk oppdateringsskriptet

Jeg har laget et script som legger til manglende kurs fra fagplan-dataene:

```bash
npm run db:update-ntnu-courses
```

Dette skriptet:
- Sjekker hvilke kurs som finnes i fagplan-dataene (MOCK_STUDY_PLANS)
- Legger til nye kurs som mangler
- Oppdaterer eksisterende kurs hvis navn/studiepoeng har endret seg
- Gir en rapport over hva som ble lagt til/oppdatert

### Metode 3: Utvid add-ntnu-courses.sql

Legg til nye kurs i `db/add-ntnu-courses.sql`, deretter kjør:

```bash
npm run db:add-approved-courses
```

## Eksempel på bruk i kode

### Hente NTNU-kurs informasjon

```typescript
const result = await pool.query(
  'SELECT code, name, credits FROM ntnu_courses WHERE code = $1',
  ['TDT4100']
);

console.log(result.rows[0]);
// { code: 'TDT4100', name: 'Objektorientert programmering', credits: 7.5 }
```

### Legge til approved course med validering

```typescript
// Foreign key sikrer at dette feiler hvis TDT4100 ikke finnes i ntnu_courses
await pool.query(
  `INSERT INTO approved_courses (
    ntnu_course_code,
    ntnu_course_name,
    exchange_university,
    exchange_course_code,
    exchange_course_name,
    ects
  ) VALUES ($1, $2, $3, $4, $5, $6)`,
  [
    'TDT4100',
    'Objektorientert programmering', // Dette kan hentes fra ntnu_courses
    'University of Bologna',
    'CS101',
    'Object-Oriented Programming',
    6
  ]
);
```

## Oppdatere eksisterende data

Hvis du har eksisterende approved_courses som ikke bruker ntnu_courses ennå, kan du migrere dem:

```sql
-- Legg til alle unike NTNU-kurs fra approved_courses til ntnu_courses
INSERT INTO ntnu_courses (code, name, credits)
SELECT DISTINCT
  ntnu_course_code,
  ntnu_course_name,
  7.5 -- Default studiepoeng
FROM approved_courses
WHERE ntnu_course_code NOT IN (SELECT code FROM ntnu_courses)
ON CONFLICT (code) DO NOTHING;
```

## Status

✅ Tabell opprettet og seed data lagt til
✅ Foreign key constraint på approved_courses
✅ Oppdateringsskript laget for å legge til manglende kurs
✅ Integration med eksisterende system

## Neste steg

Hvis du vil utvide systemet:

1. **Legg til flere felter** - f.eks. `study_program`, `semester`, `level`, etc.
2. **Lag API endpoint** - for å søke/hente NTNU-kurs
3. **Integrer med fagplan** - bruk ntnu_courses som datakilde i stedet for MOCK_STUDY_PLANS
4. **Automatisk synkronisering** - hent kurs fra NTNU sine API-er

## Feilsøking

### "Foreign key constraint violation"

Hvis du får denne feilen når du legger til i approved_courses:
```
ERROR: insert or update on table "approved_courses" violates foreign key constraint
```

Det betyr at NTNU-kurskoden ikke finnes i `ntnu_courses`. Løsning:
1. Kjør `npm run db:update-ntnu-courses` for å legge til manglende kurs
2. Eller legg til kurset manuelt i ntnu_courses først

### Se alle kurs i databasen

```sql
SELECT code, name, credits
FROM ntnu_courses
ORDER BY code;
```

### Sjekk om et kurs eksisterer

```sql
SELECT EXISTS(
  SELECT 1 FROM ntnu_courses WHERE code = 'TDT4100'
) AS exists;
```
