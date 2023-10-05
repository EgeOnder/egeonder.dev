import Footer from "~/components/footer";
import Navbar from "~/components/navbar";
import Projects from "~/components/projects";
import { Separator } from "~/components/ui/separator";
import Writings from "~/components/writings";

const Home = () => {
  return (
    <main>
      <Navbar />
      <Separator className="mb-4" />
      <h1 className="text-xl font-bold">Writings</h1>
      <p className="mb-2 text-sm text-gray-500">
        I write about software development and design
      </p>

      <Writings />

      <Separator className="my-4" />

      <h1 className="text-xl font-bold">Projects</h1>
      <p className="mb-2 text-sm text-gray-500">I make things for the web</p>

      <Projects />

      <Separator className="my-4" />

      <h1 className="text-xl font-bold">Contact</h1>
      <p className="text-sm text-gray-500">
        You can reach me via{" "}
        <a
          href="mailto:me@egeonder.dev"
          className="text-gray-400 hover:underline"
          rel="noopener noreferrer"
        >
          e-mail
        </a>{" "}
        or{" "}
        <a
          href="https://twitter.com/EgeOnder23"
          className="text-gray-400 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Twitter
        </a>
      </p>
      <Footer />
    </main>
  );
};

export default Home;
