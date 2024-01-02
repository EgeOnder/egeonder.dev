import Link from "next/link";
import Projects from "~/components/projects";
import Writings from "~/components/writings";

export default function Home() {
  return (
    <div className="space-y-12">
      <div className="space-y-3">
        <h1 className="text-xl font-bold">About</h1>
        <p className="text-md text-muted-foreground">
          I&apos;m a 20 year old curious developer. I&apos;m currently working
          on{" "}
          <Link
            target="_blank"
            href="https://kafeasist.com/"
            className="underline hover:opacity-75"
          >
            kafeasist
          </Link>
          , a web dashboard that helps you to manage your restaurant. I love
          writing about things I learn, things I use, and things I like. I also
          love to build things that I find exciting.
        </p>
        <p className="text-md text-muted-foreground">
          I have more or less 6 years of experience in web development. I mostly
          try to make awesome looking web applications with{" "}
          <Link
            target="_blank"
            href="https://nextjs.org/"
            className="underline hover:opacity-75"
          >
            Next
          </Link>
          ,{" "}
          <Link
            target="_blank"
            href="https://tailwindcss.com/"
            className="underline hover:opacity-75"
          >
            Tailwind
          </Link>
          , and{" "}
          <Link
            target="_blank"
            href="https://www.typescriptlang.org/"
            className="underline hover:opacity-75"
          >
            TypeScript
          </Link>
          . I&apos;m currently learning{" "}
          <Link
            href="https://go.dev/"
            target="_blank"
            className="underline hover:opacity-75"
          >
            Go
          </Link>
          .
        </p>
      </div>

      <div className="space-y-3">
        <h1 className="text-xl font-bold">Writings</h1>
        <Writings />
      </div>

      <div className="space-y-3">
        <h1 className="text-xl font-bold">Projects</h1>
        <Projects />
      </div>
    </div>
  );
}
