import Link from "next/link";
import { Suspense } from "react";
import Back from "~/components/back";
import Breadcrumbs from "~/components/breadcrumbs";
import { Skeleton } from "~/components/ui/skeleton";
import { env } from "~/env.mjs";
import { calculateDate } from "~/lib/calculate-date";
import { projects } from "~/lib/projects";

export const metadata = {
  title: "Projects - egeonder.dev",
  description: "This is where I have fun writing about stuff about the web.",
};

export const revalidate = env.NODE_ENV === "development" ? 0 : 24000;

export default function ProjectsPage() {
  const sortedProjects = projects.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <>
      <Suspense fallback={<Skeleton className="h-4 w-32" />}>
        <Back />
      </Suspense>
      <Breadcrumbs
        paths={[
          {
            path: "/",
            name: "Home",
          },
          {
            path: "/projects",
            name: "Projects",
          },
        ]}
        className="mt-4"
      />
      <div className="mb-8 mt-4 space-y-1">
        <h1 className="text-2xl font-bold">All projects</h1>
        <p className="text-md text-muted-foreground">
          A list of all projects I&apos;ve worked on.
        </p>
      </div>
      {!sortedProjects || sortedProjects.length == 0 ? (
        <section className="flex flex-col space-y-4 py-4 text-muted-foreground">
          <p>No projects found.</p>
        </section>
      ) : (
        <div className="space-y-4">
          {sortedProjects.map((project) => {
            const publishDate = new Date(project.date);
            const calculatedDate = calculateDate(publishDate);

            return (
              <div key={project.name} className="space-y-2">
                <div className="md:flex md:items-center md:justify-between">
                  <div>
                    <Link
                      href={project.href}
                      className="text-xl font-bold underline"
                    >
                      {project.name}
                    </Link>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {calculatedDate}
                  </span>
                </div>
                <p className="text-md text-muted-foreground">
                  {project.description}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
