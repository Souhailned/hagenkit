import prisma from "@/lib/prisma";
import type { ImageStatus, ProjectStatus } from "@prisma/client";

interface ImageProjectCounters {
  imageCount: number;
  completedCount: number;
  status: ProjectStatus;
}

function deriveProjectStatus(statuses: ImageStatus[]): ProjectStatus {
  if (statuses.length === 0) {
    return "PENDING";
  }

  if (statuses.every((status) => status === "FAILED")) {
    return "FAILED";
  }

  if (statuses.every((status) => status === "COMPLETED")) {
    return "COMPLETED";
  }

  if (statuses.some((status) => status === "PROCESSING")) {
    return "PROCESSING";
  }

  return "PENDING";
}

export async function recomputeImageProjectCounters(
  projectId: string
): Promise<ImageProjectCounters> {
  const rootImages = await prisma.image.findMany({
    where: {
      projectId,
      parentId: null,
    },
    select: {
      status: true,
    },
  });

  const statuses = rootImages.map((img) => img.status);
  const imageCount = rootImages.length;
  const completedCount = statuses.filter((status) => status === "COMPLETED").length;
  const status = deriveProjectStatus(statuses);

  await prisma.imageProject.update({
    where: { id: projectId },
    data: {
      imageCount,
      completedCount,
      status,
    },
  });

  return { imageCount, completedCount, status };
}
