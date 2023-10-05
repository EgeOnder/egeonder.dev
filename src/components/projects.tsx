import { data as projects } from "../db/data/projects.json";
import { ArrowUpRight } from "lucide-react";

const Projects = () => {
  // TODO: Get projects from DB
  return (
    <section className="flex flex-col space-y-4 py-4 text-gray-400">
      {!!projects ? (
        projects.map((project) => (
          <div key={project.id}>
            <div className="group flex items-center text-black dark:text-white">
              <a
                href={project.href}
                target="_blank"
                className="text-md flex font-semibold underline"
              >
                {project.name}
              </a>
              <ArrowUpRight className="ml-2 hidden h-4 w-4 group-hover:block" />
            </div>
            <p className="text-sm">{project.description}</p>
          </div>
        ))
      ) : (
        <p>No projects found.</p>
      )}
    </section>
  );
};

export default Projects;
