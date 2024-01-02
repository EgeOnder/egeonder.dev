"use client";

import Link from "next/link";

import { calculateDate } from "~/lib/calculate-date";
import { type Meta } from "~/lib/get-posts-meta";
import { useSearchParams } from "next/navigation";
import Tag from "./tag";

export default function BlogPosts({ posts }: { posts: Meta[] | undefined }) {
  const searchParams = useSearchParams();

  const tags = searchParams.get("tags");

  const tagsArray = tags
    ? tags.split(",").filter((tag, index, self) => self.indexOf(tag) === index)
    : null;

  if (tags && tagsArray) {
    if (!posts) posts = [];

    const filteredPosts = posts.filter((post) => {
      return tagsArray.every((tag) => post.tags.includes(tag));
    });

    posts = filteredPosts;
  }

  return (
    <div className="space-y-4">
      {tagsArray && (
        <div className="space-y-2">
          <h1 className="text-xl font-bold">Showing results for:</h1>
          <div className="hide-scroll-bar flex max-w-full items-center space-x-2 overflow-y-scroll">
            {tagsArray.map((tag) => (
              <Tag tag={tag} key={tag} />
            ))}
          </div>
        </div>
      )}
      {!posts || posts.length == 0 ? (
        <section className="flex flex-col space-y-4 py-4 text-muted-foreground">
          <p>No writings found.</p>
        </section>
      ) : (
        posts.map((post) => {
          const publishDate = new Date(post.date);
          const calculatedDate = calculateDate(publishDate);

          return (
            <div key={post.id} className="space-y-2">
              <div className="md:flex md:items-center md:justify-between">
                <div>
                  <Link
                    href={"blog/" + post.id}
                    className="text-xl font-bold underline"
                  >
                    {post.title}
                  </Link>
                </div>
                <span className="text-sm text-muted-foreground">
                  {calculatedDate}
                </span>
              </div>
              <p className="text-md text-muted-foreground">
                {post.description}
              </p>
              <div className="space-y-2 md:flex md:items-center md:justify-between md:space-y-0">
                <div className="hide-scroll-bar flex space-x-3 overflow-x-scroll rounded-md md:max-w-[60%]">
                  {post.tags.map((tag) => (
                    <Tag tag={tag} key={tag} />
                  ))}
                </div>
                <div>
                  <Link
                    href={"blog/" + post.id}
                    className="text-sm hover:underline"
                  >
                    Read more {"->"}
                  </Link>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
