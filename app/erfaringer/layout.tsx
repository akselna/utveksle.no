import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Erfaringer fra utveksling - Les studenters opplevelser | utveksle.no",
  description: "Les om andre NTNU-studenter sine erfaringer fra utveksling over hele verden. Finn ut om universiteter, byer og studiemiljø.",
  keywords: ["utvekslingserfaringer", "utveksling erfaringer", "utveksling anmeldelser", "utveksling ntnu"],
}

export default function ErfaringerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

