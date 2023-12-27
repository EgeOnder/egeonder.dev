import { getPostByName } from "~/lib/get-post-by-name";
import { env } from "~/env.mjs";
import Link from "next/link";
import Image from "next/image";
import tagSelectColor from "~/lib/tag-select-color";
import type { Metadata } from "next";

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

export const revalidate = env.NODE_ENV === "development" ? 0 : 86400;

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

  return (
    <div className="space-y-4">
      <Link href="/blog" className="text-sm text-muted-foreground">
        {"<-"} Back to posts
      </Link>
      <div className="md:flex md:items-center md:justify-between">
        <h2 className="text-2xl font-bold">{meta.title}</h2>
        <span className="text-sm text-muted-foreground">{formattedDate}</span>
      </div>
      <div className="space-y-4 truncate md:flex md:items-center md:justify-between md:space-x-12 md:space-y-0">
        <div className="hide-scroll-bar flex space-x-3 overflow-x-scroll rounded-md md:max-w-[60%]">
          {meta.tags.map((tag) => {
            const colors = tagSelectColor(tag);

            return (
              <button
                key={tag}
                className={`rounded-lg px-2 py-1 text-sm ${colors.text.lightMode} dark:${colors.text.darkMode} ${colors.background.lightMode} dark:${colors.background.darkMode}`}
              >
                {tag}
              </button>
            );
          })}
        </div>
        <Link
          target="_blank"
          href="https://github.com/EgeOnder/"
          className="flex cursor-pointer rounded-lg px-4 py-2 duration-150 hover:bg-secondary"
        >
          <Image
            src="/images/profile-pic.jpg"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full"
            alt="Ege Onder"
          />
          <div className="ml-2">
            <p className="text-sm font-bold">Ege Onder</p>
            <p className="text-sm text-muted-foreground">Software Engineer</p>
          </div>
        </Link>
      </div>
      <article className="prose pb-20 dark:prose-invert prose-headings:font-bold prose-h1:text-xl prose-h2:text-lg prose-a:font-normal prose-a:text-blue-600 prose-img:mx-auto">
        {content}
      </article>
    </div>
  );
}
