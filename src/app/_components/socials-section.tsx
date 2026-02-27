import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GithubLogoIcon, LinkedinLogoIcon, MailboxIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";

export function SocialsSection() {
  const SOCIALS = [
    {
      name: "GitHub",
      href: "https://github.com/EgeOnder",
      icon: <GithubLogoIcon />,
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/egeonder/",
      icon: <LinkedinLogoIcon />,
    },
    {
      name: "Email",
      href: "mailto:me@egeonder.dev",
      icon: <MailboxIcon />,
    },
  ];

  return (
    <div className="flex items-center space-x-4">
      {SOCIALS.map((social) => (
        <Tooltip key={social.name}>
          <TooltipTrigger>
            <Link href={social.href} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon">
                {social.icon}
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>{social.name}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
