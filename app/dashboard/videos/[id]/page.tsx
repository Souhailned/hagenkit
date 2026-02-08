import { notFound } from "next/navigation";
import { getVideoProject } from "@/app/actions/video-projects";
import { VideoProjectDetailClient } from "@/components/videos/video-project-detail-client";

export const metadata = {
  title: "Video Project",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VideoProjectPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getVideoProject(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return <VideoProjectDetailClient projectId={id} initialProject={result.data} />;
}
