import { Github, Twitter } from "lucide-react";
import React from "react";

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 flex w-full items-center justify-center border-t-2 py-3 text-center">
      <p className="text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Ege Onder
      </p>
      <a
        href="https://twitter.com/EgeOnder23"
        target="_blank"
        rel="noopener noreferrer"
        className="ml-4 text-gray-500 hover:text-accent"
      >
        <Twitter className="h-4 w-4" />
      </a>
      <a
        href="https://github.com/EgeOnder/egeonder.dev"
        target="_blank"
        rel="noopener noreferrer"
        className="ml-4 text-gray-500 hover:text-accent"
      >
        <Github className="h-4 w-4" />
      </a>
    </footer>
  );
};

export default Footer;
