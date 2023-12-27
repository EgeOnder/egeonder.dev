import Projects from "~/components/projects";
import { Separator } from "~/components/ui/separator";
import Writings from "~/components/writings";

export default function Home() {
  return (
    <div>
      <div className="space-y-1">
        <h1 className="text-xl font-bold">Writings</h1>
        <p className="mb-2 text-sm text-muted-foreground">
          I write about software development and design.
        </p>
      </div>

      <Writings />

      <Separator className="my-4" />

      <div className="space-y-1">
        <h1 className="text-xl font-bold">Projects</h1>
        <p className="mb-2 text-sm text-muted-foreground">
          I make things for the web.
        </p>
      </div>

      <Projects />

      <Separator className="my-4" />

      <div className="space-y-1">
        <h1 className="text-xl font-bold">Contact</h1>
        <p className="pb-24 text-sm text-muted-foreground">
          You can reach me via{" "}
          <a
            href="mailto:me@egeonder.dev"
            className="text-gray-600 hover:underline dark:text-gray-300"
            rel="noopener noreferrer"
          >
            e-mail
          </a>{" "}
          or{" "}
          <a
            href="https://twitter.com/EgeOnder23"
            className="text-gray-600 hover:underline dark:text-gray-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            X (formerly Twitter)
          </a>
          .
        </p>
      </div>
    </div>
  );
}
