"use client";

import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { useMediaQuery } from "~/hooks/use-media-query";
import { Skeleton } from "./ui/skeleton";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Github, Home, Linkedin, PanelsTopLeft, Twitter } from "lucide-react";
import { PenLine } from "lucide-react";
import { useRouter } from "next/navigation";

function CommandMenuInner({
  setOpen,
}: {
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();

  const runCommand = useCallback((command: () => unknown) => {
    setOpen(false);
    command();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>
          <span className="text-muted-foreground">No results found.</span>
        </CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => {
              runCommand(() => router.push("/"));
            }}
          >
            <Home className="mr-2 h-3 w-3" />
            <span>Home</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              runCommand(() => router.push("/blog"));
            }}
          >
            <PenLine className="mr-2 h-3 w-3" />
            <span>Blog</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              runCommand(() => router.push("/projects"));
            }}
          >
            <PanelsTopLeft className="mr-2 h-3 w-3" />
            <span>Projects</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Socials">
          <CommandItem
            onSelect={() => {
              runCommand(() => router.push("https://x.com/EgeOnder23/"));
            }}
          >
            <Twitter className="mr-2 h-3 w-3" />
            <span>X (formerly Twitter)</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              runCommand(() => router.push("https://github.com/EgeOnder/"));
            }}
          >
            <Github className="mr-2 h-3 w-3" />
            <span>GitHub</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              runCommand(() =>
                router.push("https://linkedin.com/in/egeonder/"),
              );
            }}
          >
            <Linkedin className="mr-2 h-3 w-3" />
            <span>LinkedIn</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </>
  );
}

export function CommandMenu(props: React.HTMLAttributes<HTMLDivElement>) {
  const [open, setOpen] = useState(false);

  const { value: isDesktop, isLoading } = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (isLoading)
    return (
      <div className={props.className}>
        <Skeleton className="h-5 w-52" />
      </div>
    );

  if (isDesktop)
    return (
      <div className={props.className}>
        <p className="text-sm text-muted-foreground">
          Press{" "}
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>J
          </kbd>{" "}
          to open the command menu.
        </p>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandMenuInner setOpen={setOpen} />
        </CommandDialog>
      </div>
    );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <div className={props.className}>
          <p className="text-sm text-muted-foreground">
            Press to open the command menu.
          </p>
        </div>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Command menu</DrawerTitle>
          <DrawerDescription>
            Press anywhere outside the drawer to close it.
          </DrawerDescription>
        </DrawerHeader>
        <Command>
          <CommandMenuInner setOpen={setOpen} />
        </Command>
      </DrawerContent>
    </Drawer>
  );
}
