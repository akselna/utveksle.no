# Auth.js Setup Instruksjoner

Auth.js (NextAuth) er nå installert og konfigurert! Her er hva du trenger å gjøre for å få det til å fungere.

## 📋 Hva er implementert

✅ Auth.js (NextAuth v5) installert
✅ Email/password autentisering
✅ Google OAuth (krever setup)
✅ Login/registrering side (`/auth/signin`)
✅ Session management
✅ Navbar med innloggingsstatus

## 🔑 Generere AUTH_SECRET

Først må du generere en sikker secret key:

```bash
npx auth secret
```

Eller manuelt:

```bash
openssl rand -base64 32
```

Kopier resultatet og erstatt `your-super-secret-key-change-this-in-production` i `.env.local`

## 🔐 Sette opp Google OAuth (Valgfritt)

### Steg 1: Gå til Google Cloud Console

1. Gå til [Google Cloud Console](https://console.cloud.google.com/)
2. Opprett et nytt prosjekt eller velg et eksisterende

### Steg 2: Aktiver Google+ API

1. Søk etter "Google+ API" i API Library
2. Klikk "Enable"

### Steg 3: Opprett OAuth credentials

1. Gå til **APIs & Services** > **Credentials**
2. Klikk **Create Credentials** > **OAuth client ID**
3. Velg **Web application**
4. Legg til disse authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for lokal utvikling)
   - `https://yourdomain.com/api/auth/callback/google` (for produksjon)

### Steg 4: Kopier credentials

1. Kopier **Client ID** og **Client secret**
2. Lim inn i `.env.local`:

```env
AUTH_GOOGLE_ID=your-google-client-id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=your-google-client-secret
```

## 🚀 Start applikasjonen

```bash
npm run dev
```

## 📍 Viktige URL-er

- **Login/Register**: `http://localhost:3000/auth/signin`
- **Fagplan**: `http://localhost:3000/fagplan`

## 🧪 Test autentisering

### Test Email/Password:

1. Gå til `/auth/signin`
2. Klikk "Har du ikke konto? Registrer deg"
3. Fyll ut navn, epost og passord (min 6 tegn)
4. Klikk "Opprett konto"
5. Du blir automatisk logget inn og redirected til `/fagplan`

### Test Google OAuth:

1. Sett opp Google credentials (se over)
2. Gå til `/auth/signin`
3. Klikk "Fortsett med Google"
4. Velg Google-konto
5. Du blir redirected til `/fagplan`

## ⚠️ VIKTIG - Database

**MERK:** Akkurat nå bruker appen en **in-memory array** for å lagre brukere. Dette betyr:

- ✅ Fungerer for testing
- ❌ Alle brukere forsvinner når serveren restarter
- ❌ Ikke egnet for produksjon

### Oppgradere til ekte database

For produksjon bør du bruke en ekte database. Forslag:

1. **Supabase** (PostgreSQL) - Gratis tier, enkelt å sette opp
2. **MongoDB** med Mongoose
3. **Prisma** med PostgreSQL/MySQL
4. **PlanetScale** (MySQL)

Eksempel med Prisma:

```bash
npm install @prisma/client @auth/prisma-adapter
npx prisma init
```

## 🛡️ Sikkerhet

- ✅ Passord hashet med bcrypt
- ✅ HTTPS i produksjon (anbefalt)
- ✅ CSRF beskyttelse (innebygd i Auth.js)
- ⚠️ Husk å endre `AUTH_SECRET` til en sikker verdi

## 📝 Neste steg

1. [ ] Generere AUTH_SECRET
2. [ ] (Valgfritt) Sette opp Google OAuth
3. [ ] Teste innlogging/registrering
4. [ ] Oppgradere til ekte database før produksjon
5. [ ] Koble brukerplaner til autentiserte brukere

## 🐛 Feilsøking

### "Invalid credentials" ved innlogging
- Sjekk at epost og passord er riktig
- Sørg for at brukeren er registrert først

### Google OAuth fungerer ikke
- Sjekk at `AUTH_GOOGLE_ID` og `AUTH_GOOGLE_SECRET` er riktige
- Verifiser redirect URIs i Google Cloud Console
- Sørg for at Google+ API er aktivert

### "AUTH_SECRET is not set"
- Generer en secret med `npx auth secret`
- Legg til i `.env.local`
- Restart dev server

## 📚 Ressurser

- [Auth.js Dokumentasjon](https://authjs.dev/)
- [Google OAuth Setup](https://authjs.dev/guides/providers/google)
- [Prisma Adapter](https://authjs.dev/reference/adapter/prisma)
