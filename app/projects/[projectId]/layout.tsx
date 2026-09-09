import type { Metadata } from "next";
import { getProjectByIdAction } from "@/actions/projects";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}): Promise<Metadata> {
  const unwrapped = await params;
  const project = await getProjectByIdAction(unwrapped.projectId);

  if (!project) {
    return {
      title: "Proyek Tidak Ditemukan",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${project.name} | Dokumentasi Proyek`,
    description: `Dokumentasi teknis proyek ${project.name} untuk klien ${project.client.companyName}.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function ProjectDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
