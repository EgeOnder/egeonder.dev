import { db } from "../connection";
import { type NewProject, projects } from "../schema";

export const postProject = async (project: NewProject) => {
  return db.insert(projects).values(project);
};
