import { Suspense } from "react";
import Back from "~/components/back";
import BlogPosts from "~/components/blog-posts";
import Breadcrumbs from "~/components/breadcrumbs";
import { Skeleton } from "~/components/ui/skeleton";
import { env } from "~/env.mjs";
import { getPostsMeta } from "~/lib/get-posts-meta";

export const metadata = {
  title: "Blog - egeonder.dev",
  description: "This is where I have fun writing about stuff about the web.",
};

export const revalidate = env.NODE_ENV === "development" ? 0 : 24000;

export default async function Blog() {
  const posts = await getPostsMeta();

  return (
    <>
      <Suspense fallback={<Skeleton className="h-4 w-32" />}>
        <Back />
      </Suspense>
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
        ]}
        className="mt-4"
      />
      <div className="mb-8 mt-4 space-y-1">
        <h1 className="text-2xl font-bold">Recent blog posts</h1>
        <p className="text-md text-muted-foreground">
          I write about things I learn, things I use, and things I like.
        </p>
      </div>
      {!posts || posts.length == 0 ? (
        <section className="flex flex-col space-y-4 py-4 text-muted-foreground">
          <p>No writings found.</p>
        </section>
      ) : (
        <Suspense>
          <BlogPosts posts={posts} />
        </Suspense>
      )}
    </>
  );
}
