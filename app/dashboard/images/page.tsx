import { ContentCard, ContentCardHeader, ContentCardBody } from "@/components/dashboard/content-card";
import { NewProjectDialog } from "@/components/images/new-project-dialog";
import { ProjectCard } from "@/components/images/project-card";
import { getImageProjects } from "@/app/actions/image-projects";
import { Image as ImageIcon } from "@phosphor-icons/react/dist/ssr"

export const metadata = {
  title: "AI Images",
  description: "AI-powered image enhancement",
};

export default async function ImagesPage() {
  const result = await getImageProjects();
  const projects = result.success ? result.data || [] : [];

  return (
    <ContentCard>
      <ContentCardHeader title="Images" actions={<NewProjectDialog />} />
      <ContentCardBody className="p-4">
        {projects.length === 0 ? (
          <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed">
            <ImageIcon className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">No projects yet</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Create your first project to start enhancing images with AI
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
