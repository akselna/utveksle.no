# Database Setup

## Oversikt

Databasen er nå konfigurert og koblet til Heroku Postgres! 🎉

### Tabeller

1. **users** - Brukerkontoer med studieinformasjon
2. **universities** - Alle universiteter med koordinater
3. **reviews** - Brukeranmeldelser av universiteter (krever innlogging)
4. **courses** - Kurs tilgjengelig ved hvert universitet
5. **exchange_agreements** - Utvekslingsavtaler
6. **course_mappings** - Hvilke kurs som erstatter NTNU-kurs
7. **university_stats** - Aggregert statistikk per universitet

### Kommandoer

```bash
# Kjør database-migrering (importer JSON-data)
npm run db:migrate

# Legg til users-tabell
npm run db:add-users

# Start dev-server
npm run dev
```

### API Endpoints

**Autentisering:**
- `POST /api/auth/register` - Registrer ny bruker (med studieinfo)
- `GET /api/auth/signin` - Logg inn
- `GET /api/auth/signout` - Logg ut

**Universiteter:**
- `GET /api/test-db` - Test database-tilkobling
- `GET /api/universities` - Hent alle universiteter
- `GET /api/universities?continent=Europe` - Filtrer på kontinent
- `GET /api/universities?country=Norway` - Filtrer på land

**Anmeldelser (krever innlogging):**
- `GET /api/reviews?university_id=1` - Hent anmeldelser for universitet
- `POST /api/reviews` - Opprett anmeldelse (krever autentisering)

### Database Statistikk

**Etter siste migrering:**
- 148 universiteter
- 72 utvekslingsavtaler
- 296 unike kurs
- 408 kurs-mappings

### Autentisering og Brukere

**Registrering:**
Brukere kan registrere seg med:
- Email og passord
- Google OAuth
- Studieinformasjon (program, årstrinn, spesialisering)

**Anmeldelser:**
- Kun innloggede brukere kan skrive anmeldelser
- Én anmeldelse per universitet per bruker
- Ratings: vanskelighetsgrad, prisnivå, sosialt, overall (1-5)
- Anmeldelser viser brukerens studieprogram og årstrinn

### Bruk i kode

```typescript
import { query } from '@/lib/db';
import { auth } from '@/auth';

// Sjekk om bruker er logget inn
const session = await auth();
if (session?.user) {
  console.log('User:', session.user.name);
  console.log('Study program:', session.user.study_program);
}

// Hent universiteter
const result = await query('SELECT * FROM universities WHERE country = $1', ['Norway']);

// Opprett anmeldelse (fra API route)
import { createUser } from '@/lib/users';
const user = await createUser({
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
  study_program: 'Kybernetikk og robotikk',
  study_year: '4',
  provider: 'credentials'
});
```

### Sikkerhet

- ✅ Passord hashet med bcrypt
- ✅ Anmeldelser krever autentisering
- ✅ SQL injection beskyttelse med parametriserte queries
- ✅ Input validering på alle endpoints
