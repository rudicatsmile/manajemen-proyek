import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manajemen Anggota Tim",
  description: "Daftar personil tim internal dan pengaturan peran hak akses.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
