import { db } from "../connection";
import { type Project, projects } from "../schema";

export const getProjects = async (): Promise<Project[]> => {
  return db.select().from(projects);
};
