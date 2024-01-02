import { getPostByName } from "~/lib/get-post-by-name";
import { env } from "~/env.mjs";
import Link from "next/link";
import type { Metadata } from "next";
import { calculateDate } from "~/lib/calculate-date";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "~/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import Tag from "~/components/tag";
import Back from "~/components/back";
import Breadcrumbs from "~/components/breadcrumbs";
import { Skeleton } from "~/components/ui/skeleton";

export async function generateMetadata({
  params: { id },
}: Props): Promise<Metadata> {
  const post = await getPostByName(`${id}.mdx`);

  if (!post) {
    return {
      title: "Not found - egeonder.dev",
    };
  }

  const { meta } = post;

  return {
    title: `${meta.title} - egeonder.dev`,
    description: meta.description,
    authors: {
      name: "Ege Onder",
      url: "https://egeonder.dev",
    },
  };
}

export const revalidate = env.NODE_ENV === "development" ? 0 : 24000;

type Props = {
  params: {
    id: string;
  };
};

export default async function Post({ params: { id } }: Props) {
  const post = await getPostByName(`${id}.mdx`);

  if (!post) {
    return (
      <div className="space-y-4">
        <Link href="/blog" className="text-sm text-muted-foreground">
          {"<-"} Back to posts
        </Link>
        <h1 className="text-xl font-bold">
          Not here, but there is a lot of other stuff to read!
        </h1>
        <p className="text-sm text-muted-foreground">
          I couldn&apos;t find the post you are looking for, but there is a lot
          of other stuff to read! You can check out the blog page to see all the
          posts.
        </p>
      </div>
    );
  }

  const { meta, content } = post;
  const publishDate = new Date(meta.date);
  const formattedDate = publishDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const calculatedDate = calculateDate(publishDate);

  return (
    <div className="space-y-4">
      <Back href="/blog" />
      <Breadcrumbs
        paths={[
          {
            path: "/",
            name: "Home",
          },
          {
            path: "/blog",
            name: "Blog",
          },
          {
            path: `/blog/${id}`,
            name: meta.title,
          },
        ]}
        className="mt-4"
      />
      <div className="md:flex md:items-center md:justify-between">
        <h2 className="text-2xl font-bold">{meta.title}</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm text-muted-foreground">
                {formattedDate}
              </span>
            </TooltipTrigger>
            <TooltipContent>{calculatedDate}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="space-y-4 truncate md:flex md:items-center md:justify-between md:space-x-12 md:space-y-0">
        <div className="hide-scroll-bar flex space-x-3 overflow-x-scroll rounded-md md:max-w-[60%]">
          {meta.tags.map((tag) => (
            <Tag tag={tag} key={tag} />
          ))}
        </div>
        <Link
          target="_blank"
          href="https://github.com/EgeOnder/"
          className="flex cursor-pointer rounded-lg py-2 duration-150 hover:bg-secondary md:px-4"
        >
          <Avatar>
            <AvatarImage src="/images/profile-pic.jpg" alt="Ege Onder" />
            <AvatarFallback>
              <Skeleton />
            </AvatarFallback>
          </Avatar>
          <div className="ml-2">
            <p className="text-sm font-bold">Ege Onder</p>
            <p className="text-sm text-muted-foreground">Software Engineer</p>
          </div>
        </Link>
      </div>
      <article className="prose dark:prose-invert prose-headings:font-bold prose-h1:text-xl prose-h2:text-lg prose-a:font-normal prose-a:text-blue-600 prose-a:duration-150 hover:prose-a:text-blue-500 prose-img:mx-auto">
        {content}
      </article>
    </div>
  );
}
