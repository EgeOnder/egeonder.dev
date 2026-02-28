import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GithubLogoIcon, LinkedinLogoIcon, MailboxIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";

export function SocialsSection() {
  const socialButtonClass =
    "focus-visible:border-ring focus-visible:ring-ring/50 rounded-xl border border-transparent bg-clip-padding text-sm font-medium focus-visible:ring-[3px] inline-flex items-center justify-center whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none group/button select-none cursor-pointer hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground size-9";

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
          <TooltipTrigger render={<Link href={social.href} target="_blank" rel="noopener noreferrer" />} className={socialButtonClass} aria-label={social.name}>
            {social.icon}
          </TooltipTrigger>
          <TooltipContent>{social.name}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
