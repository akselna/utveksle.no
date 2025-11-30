export default function OmOssPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">
          Om oss
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Vi er studenter ved NTNU som ønsker å gjøre utveksling enklere for alle
        </p>
      </div>

      <div className="space-y-12">
        {/* Hvorfor vi laget denne siden */}
        <section>
          <h2 className="text-3xl font-light text-gray-900 mb-4">
            Hvorfor laget vi denne siden?
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Som studenter ved NTNU opplevde vi selv hvor vanskelig det var å finne informasjon om utveksling. 
            Informasjonen lå spredt på flere steder - NTNU sin utvekslingsportal, Confluence-sider, og ulike 
            Facebook-grupper. Det var vanskelig å få oversikt over hvilke fag som var godkjent hvor, og å finne 
            erfaringer fra tidligere studenter.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Vi ønsket å samle alt på ett sted, strukturert og søkbart, slik at fremtidige studenter kan spare 
            tid og ta mer informerte beslutninger om sin utveksling.
          </p>
        </section>

        {/* Hva vi tilbyr */}
        <section>
          <h2 className="text-3xl font-light text-gray-900 mb-4">
            Hva tilbyr vi?
          </h2>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Utforsk destinasjoner
              </h3>
              <p className="text-gray-600">
                Interaktivt kart som viser alle utvekslingssteder med antall utvekslinger per universitet. 
                Klikk deg gjennom land og universiteter for å se detaljer.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Fagbank
              </h3>
              <p className="text-gray-600">
                Søkbar database over alle godkjente utvekslingskurs. Finn raskt hvilke fag som er godkjent 
                ved ulike universiteter, og se detaljer om ECTS-poeng, semester og behandlingsdato.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Planlegg din utveksling
              </h3>
              <p className="text-gray-600">
                Verktøy for å planlegge hvilke fag du vil ta på utveksling. Match dine NTNU-fag med 
                godkjente utvekslingskurs og se om du oppfyller kravene.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Erfaringer fra studenter
              </h3>
              <p className="text-gray-600">
                Les om andre studenters opplevelser fra utveksling. Få innsikt i hva som venter deg, 
                fra studiehverdagen til sosiale aktiviteter og levekostnader.
              </p>
            </div>
          </div>
        </section>

        {/* Hvem er vi */}
        <section>
          <h2 className="text-3xl font-light text-gray-900 mb-4">
            Hvem er vi?
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Vi er en gruppe studenter ved NTNU som har erfaring med utveksling eller planlegger å dra. 
            Vi er ikke tilknyttet NTNU offisielt, men har laget denne siden som et studentprosjekt for 
            å hjelpe andre studenter.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Siden er bygget med Next.js og React, og all kode er åpen kildekode. Vi oppdaterer siden 
            kontinuerlig basert på tilbakemeldinger fra brukere.
          </p>
        </section>

        {/* Bidra */}
        <section>
          <h2 className="text-3xl font-light text-gray-900 mb-4">
            Vil du bidra?
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Vi setter stor pris på alle bidrag! Du kan hjelpe til ved å:
          </p>
          <ul className="space-y-2 text-gray-600 list-disc list-inside">
            <li>Legge til dine egne erfaringer fra utveksling</li>
            <li>Legge til nye godkjente fag i fagbanken</li>
            <li>Gi tilbakemelding på hvordan vi kan forbedre siden</li>
            <li>Rapportere feil eller manglende informasjon</li>
          </ul>
        </section>

        {/* Kontakt */}
        <section className="bg-gray-50 rounded-lg p-8 border border-gray-200">
          <h2 className="text-3xl font-light text-gray-900 mb-4">
            Kontakt oss
          </h2>
          <p className="text-gray-600 mb-6">
            Har du spørsmål, tilbakemeldinger eller ønsker å bidra? Ta gjerne kontakt!
          </p>
          <a
            href="mailto:kontakt@ntnuutveksling.no"
            className="inline-block px-6 py-3 bg-gray-900 text-white rounded-md font-medium hover:bg-gray-800 transition-colors"
          >
            Send oss en e-post
          </a>
        </section>
      </div>
      </div>
    </div>
  );
}

