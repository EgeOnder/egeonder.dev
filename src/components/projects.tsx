import { ArrowUpRight } from "lucide-react";
import { Suspense } from "react";
import { Spinner } from "./ui/spinner";
import { env } from "~/env.mjs";
import type { Project } from "~/db/schema";
import Link from "next/link";

async function getData(): Promise<Project[] | null> {
  const projects = await fetch(env.BASE_URL + "/api/projects");

  if (!projects) {
    return null;
  }

  return projects.json() as Promise<Project[]>;
}

export default async function Projects() {
  const projects = await getData();

  return (
    <section className="flex flex-col space-y-4 py-4">
      <Suspense fallback={<Spinner />}>
        {!!projects && projects.length > 0 ? (
          projects.map((project) => (
            <div key={project.id} className="group space-y-1">
              <div className="flex items-center">
                <Link
                  href={project.href}
                  target="_blank"
                  className="text-md flex font-semibold underline"
                >
                  {project.name}
                </Link>
                <ArrowUpRight className="ml-2 hidden h-4 w-4 group-hover:block" />
              </div>
              <p className="text-sm text-muted-foreground">
                {project.description}
              </p>
            </div>
          ))
        ) : (
          <p>No projects found.</p>
        )}
      </Suspense>
    </section>
  );
}
