import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Fagbank - Søk godkjente utvekslingskurs | utveksle.no",
  description: "Søk i fagbanken etter godkjente utvekslingskurs ved NTNU. Finn hvilke kurs som kan godkjennes ved ulike universiteter.",
  keywords: ["fagbank utveksling", "utvekslingskurs", "godkjente kurs", "utveksling fag", "bologna kurs"],
}

export default function FagbankLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

