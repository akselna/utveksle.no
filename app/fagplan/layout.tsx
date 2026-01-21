import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Min utveksling - Planlegg din utveksling | utveksle.no",
  description: "Planlegg din utveksling ved NTNU. Lag utvekslingsplaner, match fag og se hvilke kurs som kan godkjennes.",
  keywords: ["utvekslingsplanlegger", "utveksling plan", "utveksling fagplan", "utveksling ntnu"],
}

export default function FagplanLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

