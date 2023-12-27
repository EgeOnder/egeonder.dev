import Back from "~/components/back";
import Breadcrumbs from "~/components/breadcrumbs";
import Projects from "~/components/projects";
import { env } from "~/env.mjs";

export const metadata = {
  title: "Projects - egeonder.dev",
  description: "This is where I have fun writing about stuff about the web.",
};

export const revalidate = env.NODE_ENV === "development" ? 0 : 86400;

export default function ProjectsPage() {
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
      <Projects />
    </>
  );
}
