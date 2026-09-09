import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar Proyek",
  description: "Portofolio proyek internal dan kredensial teknis.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
