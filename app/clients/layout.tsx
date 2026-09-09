import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Master Data Klien",
  description: "Manajemen kontak instansi dan klien pemilik proyek.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ClientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
