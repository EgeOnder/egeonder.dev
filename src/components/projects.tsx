import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { projects } from "~/lib/projects";
import { calculateDate } from "~/lib/calculate-date";

export default function Projects() {
  const sortedProjects = projects.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  sortedProjects.splice(3);

  if (!sortedProjects) {
    return (
      <section className="flex flex-col space-y-4 text-muted-foreground">
        <p>No projects found.</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col space-y-4">
      {sortedProjects.map((project) => (
        <div key={project.name} className="group space-y-1">
          <div className="md:flex md:justify-between">
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
            <span className="text-sm text-muted-foreground">
              {calculateDate(new Date(project.date))}
            </span>
          </div>
          <p className="text-md text-muted-foreground">{project.description}</p>
        </div>
      ))}
      <Link href="projects" className="text-sm hover:underline">
        See all projects {"->"}
      </Link>
    </section>
  );
}
