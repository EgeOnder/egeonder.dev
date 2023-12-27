import Link from "next/link";
import { env } from "~/env.mjs";
import { calculateDate } from "~/lib/calculate-date";
import { getPostsMeta } from "~/lib/get-posts-meta";

export const revalidate = env.NODE_ENV === "development" ? 0 : 86400;

export default async function Writings() {
  const posts = await getPostsMeta();

  if (!posts) {
    return (
      <section className="flex flex-col space-y-4 py-4 text-muted-foreground">
        <p>No writings found.</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col space-y-4 py-4">
      {posts.map((post) => {
        const publishDate = new Date(post.date);
        const calculatedDate = calculateDate(publishDate);

        return (
          <div key={post.id} className="space-y-1">
            <div className="md:flex md:items-center md:justify-between">
              <div>
                <Link href={"blog/" + post.id} className="font-bold underline">
                  {post.title}
                </Link>
              </div>
              <span className="text-sm text-muted-foreground">
                {calculatedDate}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{post.description}</p>
          </div>
        );
      })}
      <Link href="blog" className="text-sm hover:underline">
        See all posts {"->"}
      </Link>
    </section>
  );
}
