import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import React from "react";

const IconButton = ({
  url,
  children,
}: {
  url: string;
  children: React.ReactNode;
}) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="ml-4 text-gray-500 hover:text-gray-600"
    >
      {children}
    </a>
  );
};

const Footer = () => {
  const icons = [
    {
      url: "https://x.com/EgeOnder23",
      icon: <Twitter className="h-4 w-4" />,
    },
    {
      url: "https://github.com/EgeOnder",
      icon: <Github className="h-4 w-4" />,
    },
    {
      url: "mailto:me@egeonder.dev",
      icon: <Mail className="h-4 w-4" />,
    },
    {
      url: "https://www.linkedin.com/in/egeonder",
      icon: <Linkedin className="h-4 w-4" />,
    },
  ];

  return (
    <footer className="absolute bottom-0 left-0 flex h-12 w-full items-center justify-center border-t-2 py-3 text-center">
      <p className="text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Ege Onder
      </p>
      {icons.map((icon) => (
        <IconButton key={icon.url} url={icon.url}>
          {icon.icon}
        </IconButton>
      ))}
    </footer>
  );
};

export default Footer;
