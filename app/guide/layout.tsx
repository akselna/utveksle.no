import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Interaktiv Utvekslingsguide | utveksle.no",
  description: "Ta deg gjennom hele utvekslingsprosessen steg for steg med vår interaktive guide.",
}

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
