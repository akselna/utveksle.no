export default function FAQPage() {
  const faqs = [
    {
      question: "Hvorfor skal jeg bruke denne siden?",
      answer: "NTNU Utveksling er laget av studenter, for studenter. Vi samler all informasjon om utvekslingssteder, godkjente fag og studenterfaringer på ett sted, slik at du enkelt kan finne det du trenger uten å lete gjennom flere kilder. Alt er strukturert og søkbart, så du sparer tid og får bedre oversikt."
    },
    {
      question: "Hvordan bruker jeg siden?",
      answer: "Start med å utforske destinasjoner på kartet eller gjennom søkefunksjonen. Når du har funnet et interessant universitet, kan du se hvilke fag som er godkjent i fagbanken. Bruk 'Min utveksling' for å planlegge hvilke fag du vil ta, og les erfaringer fra tidligere studenter for å få et innblikk i hva som venter deg."
    },
    {
      question: "Hvem har skrevet erfaringene?",
      answer: "Erfaringene er skrevet av NTNU-studenter som har vært på utveksling ved de ulike universitetene. Alle kan legge til sine egne erfaringer etter innlogging, og vi oppfordrer alle til å dele både positive og negative opplevelser for å hjelpe fremtidige studenter med å ta informerte valg."
    },
    {
      question: "Hvor kommer informasjonen om godkjente fag fra?",
      answer: "Informasjonen om godkjente fag kommer fra NTNU sin offisielle utvekslingsportal og Confluence-sider. Vi har samlet og strukturert denne informasjonen slik at den er enklere å søke gjennom og bruke. Du kan også legge til nye fag hvis du har informasjon som mangler."
    },
    {
      question: "Hvorfor ble denne siden laget?",
      answer: "Vi laget denne siden fordi vi selv opplevde at det var vanskelig å finne informasjon om utveksling. Informasjonen lå spredt på flere steder, og det var vanskelig å få oversikt over hvilke fag som var godkjent hvor. Vi ønsket å gjøre prosessen enklere for alle NTNU-studenter som vurderer utveksling."
    },
    {
      question: "Er informasjonen pålitelig?",
      answer: "Vi gjør vårt beste for å holde informasjonen oppdatert og nøyaktig. Fagbanken er basert på offisiell informasjon fra NTNU, og erfaringene er skrevet av ekte studenter. Vi anbefaler likevel at du dobbeltsjekker viktig informasjon med NTNU sin utvekslingsavdeling før du tar endelige beslutninger."
    },
    {
      question: "Kan jeg bidra til siden?",
      answer: "Ja! Du kan bidra ved å legge til dine egne erfaringer fra utveksling, legge til nye godkjente fag i fagbanken, eller gi tilbakemelding på hvordan vi kan forbedre siden. Alle bidrag hjelper oss med å gjøre siden bedre for alle NTNU-studenter."
    },
    {
      question: "Er siden kun for NTNU-studenter?",
      answer: "Siden er primært laget for NTNU-studenter, siden informasjonen om godkjente fag er spesifikk for NTNU. Men alle kan lese erfaringene og utforske destinasjonene. Hvis du er student ved et annet universitet, kan informasjonen fortsatt være nyttig som inspirasjon, men du må sjekke med ditt eget universitet om godkjenning av fag."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">
          Ofte stilte spørsmål
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Alt du lurer på om NTNU Utveksling-plattformen
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <details
            key={index}
            className="group bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
          >
            <summary className="flex items-center justify-between cursor-pointer list-none">
              <h3 className="text-lg font-medium text-gray-900 pr-8">
                {faq.question}
              </h3>
              <svg
                className="w-5 h-5 text-gray-500 shrink-0 transition-transform group-open:rotate-180"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <p className="mt-4 text-gray-600 leading-relaxed">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>

      <div className="mt-16 p-8 bg-gray-50 rounded-lg text-center">
        <h2 className="text-2xl font-light text-gray-900 mb-4">
          Har du flere spørsmål?
        </h2>
        <p className="text-gray-600 mb-6">
          Ta kontakt med oss eller legg til dine egne erfaringer for å hjelpe andre studenter
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:kontakt@ntnuutveksling.no"
            className="inline-block px-6 py-3 bg-gray-900 text-white rounded-md font-medium hover:bg-gray-800 transition-colors"
          >
            Kontakt oss
          </a>
          <a
            href="/erfaringer"
            className="inline-block px-6 py-3 bg-white text-gray-900 border border-gray-300 rounded-md font-medium hover:bg-gray-50 transition-colors"
          >
            Del din erfaring
          </a>
        </div>
      </div>
      </div>
    </div>
  );
}
