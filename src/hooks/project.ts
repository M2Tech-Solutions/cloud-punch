import type { ProjectType } from "@db/schema";
import { GET as getAllProjects } from "@api/projects";
import {
  GET as getProjectById,
  POST as createProject,
} from "@api/admin/project";
import { useCache } from "./cache";

export function useProjects() {
  const { data, loading, refresh } = useCache<Array<ProjectType>>(
    "projects",
    getAllProjects,
  );
  return { projects: data ?? [], loading, refresh };
}

export function useProject(id: number) {
  const { data, loading, refresh } = useCache<ProjectType | Error>(
    `project-${id}`,
    () =>
      getProjectById(id).then((res) => res ?? new Error("Project not found")),
  );

  return { project: data, loading, refresh };
}

export async function addProject(
  project: Omit<ProjectType, "id" | "createdAt">,
) {
  try {
    const newProject = await createProject({
      ...project,
      createdAt: Date.now() as any,
    });
    return newProject;
  } catch (err) {
    console.error("Error creating project:", err);
    throw err;
  }
}
