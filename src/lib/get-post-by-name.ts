import { compileMDX } from "next-mdx-remote/rsc";
import { env } from "~/env.mjs";
import type { JSXElementConstructor, ReactElement } from "react";
import type { Meta } from "./get-posts-meta";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";

type BlogPost = {
  meta: Meta;
  content: ReactElement<unknown, string | JSXElementConstructor<unknown>>;
};

export async function getPostByName(fileName: string) {
  const res = await fetch(
    `https://raw.githubusercontent.com/EgeOnder/blog/main/${fileName}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  if (!res.ok) return;

  const rawMDX = await res.text();

  if (rawMDX === "404: Not Found") return;

  const { frontmatter, content } = await compileMDX<{
    title: string;
    date: string;
    description: string;
    tags: string[];
  }>({
    source: rawMDX,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        rehypePlugins: [
          [
            // @ts-expect-error this version of the plugin is not correctly typed
            rehypePrettyCode,
            {
              theme: "poimandres",
            },
          ],
          rehypeSlug,
        ],
      },
    },
  });

  const id = fileName.replace(/\.mdx$/, "");

  const blogPost: BlogPost = {
    meta: {
      id,
      title: frontmatter.title,
      description: frontmatter.description,
      date: frontmatter.date,
      tags: frontmatter.tags,
    },
    content,
  };

  return blogPost;
}
