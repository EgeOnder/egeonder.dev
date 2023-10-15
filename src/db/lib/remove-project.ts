import { eq } from "drizzle-orm";
import { db } from "../connection";
import { projects } from "../schema";

export const removeProject = async ({ id }: { id: number }) => {
  return db.delete(projects).where(eq(projects.id, id));
};
