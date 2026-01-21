# Hvordan legge til universitetsbilder

## Oversikt

Universitetsbilder vises automatisk når:

1. En bruker legger til en "Erfaring" for et universitet
2. På "Utforsk"-siden under Anmeldelser når man klikker på en anmeldelse

Hvis brukeren har lastet opp egne bilder, vil det første brukerbildet vises. Hvis ikke, vises universitetets bilde.

## Steg 1: Kjør database-migrasjonen

Først må du legge til `image_url`-feltet i universities-tabellen:

```bash
# Koble til databasen og kjør:
psql -h <database-host> -U <database-user> -d <database-name> -f db/add-university-images.sql
```

Eller hvis du bruker en lokal PostgreSQL:

```bash
psql -d utveksling_app -f db/add-university-images.sql
```

## Steg 2: Finn universitetene i databasen

Først må du se hvilke universiteter som finnes i databasen:

```sql
SELECT id, name, country
FROM universities
ORDER BY name;
```

## Steg 3: Oppdater bildene

Det finnes to måter å legge til bildene på:

### Metode 1: Bruk SQL-scriptet

1. Åpne filen `db/update-university-images.sql`
2. Legg til UPDATE-statements for hvert universitet:

```sql
UPDATE universities
SET image_url = 'https://example.com/ditt-bilde.jpg'
WHERE name = 'Universitetsnavnet';
```

3. Kjør scriptet:

```bash
psql -d utveksling_app -f db/update-university-images.sql
```

### Metode 2: Direkte SQL-kommandoer

Du kan også kjøre UPDATE-kommandoer direkte i psql eller din database-klient:

```sql
UPDATE universities
SET image_url = 'https://example.com/stanford.jpg'
WHERE name = 'Stanford University';

UPDATE universities
SET image_url = 'https://example.com/oxford.jpg'
WHERE name = 'University of Oxford';
```

## Tips for bildekilder

- Bruk høykvalitetsbilder (minimum 800x600px)
- Foretrekk bilder i landskap-orientering (16:9 eller 4:3)
- Bruk stabile URL-er (f.eks. Cloudinary, Imgur, eller din egen server)
- Vurder å bruke Unsplash eller Wikimedia Commons for gratis bilder

## Verifiser at bildene fungerer

1. Start applikasjonen
2. Gå til "Erfaringer"-siden
3. Se at universitetsbildet vises for erfaringer uten brukerbilder
4. Eller gå til "Utforsk"-siden og klikk på en anmeldelse

## Eksempel på batch-update

Hvis du har mange universiteter, kan du bruke en batch-update:

```sql
-- Oppdater alle norske universiteter
UPDATE universities
SET image_url = CASE name
    WHEN 'Norwegian University of Science and Technology' THEN 'https://example.com/ntnu.jpg'
    WHEN 'University of Oslo' THEN 'https://example.com/uio.jpg'
    WHEN 'University of Bergen' THEN 'https://example.com/uib.jpg'
    ELSE image_url
END
WHERE country = 'Norway';
```

## Sjekk hvilke universiteter som mangler bilder

```sql
SELECT name, country
FROM universities
WHERE image_url IS NULL
ORDER BY country, name;
```
