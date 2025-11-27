# Database Setup

## Oversikt

Databasen er nå konfigurert og koblet til Heroku Postgres! 🎉

### Tabeller

1. **universities** - Alle universiteter med koordinater
2. **reviews** - Brukeranmeldelser av universiteter
3. **courses** - Kurs tilgjengelig ved hvert universitet
4. **exchange_agreements** - Utvekslingsavtaler
5. **course_mappings** - Hvilke kurs som erstatter NTNU-kurs
6. **university_stats** - Aggregert statistikk per universitet

### Kommandoer

```bash
# Kjør database-migrering (importer JSON-data)
npm run db:migrate

# Start dev-server
npm run dev
```

### API Endpoints

- `GET /api/test-db` - Test database-tilkobling
- `GET /api/universities` - Hent alle universiteter
- `GET /api/universities?continent=Europe` - Filtrer på kontinent
- `GET /api/universities?country=Norway` - Filtrer på land

### Database Statistikk

**Etter siste migrering:**
- 148 universiteter
- 72 utvekslingsavtaler
- 296 unike kurs
- 408 kurs-mappings

### Bruk i kode

```typescript
import { query } from '@/lib/db';

// Hent universiteter
const result = await query('SELECT * FROM universities WHERE country = $1', ['Norway']);

// Med transaction
import { getClient } from '@/lib/db';
const client = await getClient();
try {
  await client.query('BEGIN');
  // ... queries
  await client.query('COMMIT');
} finally {
  client.release();
}
```

### Neste steg

1. Legg til API for anmeldelser
2. Implementer brukerautentisering for anmeldelser
3. Lag aggregeringslogikk for rating-statistikk
4. Migrer frontend til å bruke database istedenfor JSON-filer
