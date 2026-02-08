import { ContentCard, ContentCardHeader, ContentCardBody } from "@/components/dashboard/content-card";
import { NewProjectDialog } from "@/components/videos/new-project-dialog";
import { ProjectCard } from "@/components/videos/project-card";
import { getVideoProjects } from "@/app/actions/video-projects";
import { VideoCamera } from "@phosphor-icons/react/dist/ssr"

export const metadata = {
  title: "AI Videos",
  description: "AI-powered video generation",
};

export default async function VideosPage() {
  const result = await getVideoProjects();
  const projects = result.success ? result.data || [] : [];

  return (
    <ContentCard>
      <ContentCardHeader title="Videos" actions={<NewProjectDialog />} />
      <ContentCardBody className="p-4">
        {projects.length === 0 ? (
          <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed">
            <VideoCamera className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">No video projects yet</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Create your first video project to start generating videos with AI
            </p>
            <NewProjectDialog />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </ContentCardBody>
    </ContentCard>
  );
}
