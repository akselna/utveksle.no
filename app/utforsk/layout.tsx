import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Utforsk - Utvekslingsdestinasjoner | utveksle.no",
  description: "Utforsk utvekslingsdestinasjoner på et interaktivt kart. Se hvor NTNU-studenter har vært på utveksling.",
}

export default function UtforskLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
