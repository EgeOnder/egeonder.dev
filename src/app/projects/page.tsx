import Link from "next/link";
import Back from "~/components/back";
import Breadcrumbs from "~/components/breadcrumbs";
import { env } from "~/env.mjs";
import { calculateDate } from "~/lib/calculate-date";

export const metadata = {
  title: "Projects - egeonder.dev",
  description: "This is where I have fun writing about stuff about the web.",
};

export const revalidate = env.NODE_ENV === "development" ? 0 : 24000;

export type Project = {
  name: string;
  description: string;
  href: string;
  date: string;
};

export const projects: Project[] = [
  {
    name: "kafeasist",
    description:
      "kafeasist is a café/restaurant/bar management software as a service. kafeasist makes managing your business much more simpler with easy-to-use dashboard. With kafeasist, you won't need any other software to run your business.",
    href: "https://kafeasist.com",
    date: "2023-08-01",
  },
  {
    name: "vue-paho-mqtt",
    description:
      "Easy-to-use Paho MQTT client for Vue 3 with centralized subscription management, type support, and built-in optional alert notification library.",
    href: "https://github.com/kaandesu/vue-paho-mqtt/",
    date: "2023-03-30",
  },
  {
    name: "istasyoncikolata",
    description:
      "istasyoncikolata is a website for a restaurant/café built with Astro.",
    href: "https://github.com/EgeOnder/istasyoncikolata/",
    date: "2022-10-26",
  },
  {
    name: "egeonder.dev",
    description:
      "My personal portfolio and blog website built with Next.js and Tailwind CSS.",
    href: "https://github.com/EgeOnder/egeonder.dev/",
    date: "2023-12-20",
  },
];

export default function ProjectsPage() {
  const sortedProjects = projects.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <>
      <Back />
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
