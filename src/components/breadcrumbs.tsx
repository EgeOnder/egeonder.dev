import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { HTMLAttributes } from "react";
import { cn } from "~/lib/utils";

interface BreadcrumbsProps extends HTMLAttributes<HTMLDivElement> {
  paths: {
    path: string;
    name: string;
    description?: string;
  }[];
}

export default function Breadcrumbs({ paths, className }: BreadcrumbsProps) {
  return (
    <div
      className={cn(
        "flex space-x-1 truncate text-sm text-muted-foreground",
        className,
      )}
    >
      {paths.map((path, index) => (
        <div key={index} className="flex items-center">
          <Link href={path.path} className="hover:underline">
            {path.name}
          </Link>
          {index < paths.length - 1 && (
            <ChevronRight className="mx-1 h-4 w-4" />
          )}
        </div>
      ))}
    </div>
  );
}
