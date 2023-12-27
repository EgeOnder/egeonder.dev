import Link from "next/link";
import { env } from "~/env.mjs";
import { calculateDate } from "~/lib/calculate-date";
import { getPostsMeta } from "~/lib/get-posts-meta";
import tagSelectColor from "~/lib/tag-select-color";

export const metadata = {
  title: "Blog - egeonder.dev",
  description: "This is where I have fun writing about stuff about the web.",
};

export const revalidate = env.NODE_ENV === "development" ? 0 : 86400;

export default async function Blog() {
  const posts = await getPostsMeta();

  if (!posts) {
    return (
      <section className="flex flex-col space-y-4 py-4 text-muted-foreground">
        <p>No writings found.</p>
      </section>
    );
  }

  return (
    <div>
      <Link href="/" className="text-sm text-muted-foreground">
        {"<-"} Back to home
      </Link>
      <div className="mb-8 mt-6 space-y-1">
        <h1 className="text-2xl font-bold">Recent blog posts</h1>
        <p className="text-md text-muted-foreground">
          I write about things I learn, things I use, and things I like.
        </p>
      </div>
      <div className="space-y-4">
        {posts.map((post) => {
          const publishDate = new Date(post.date);
          const calculatedDate = calculateDate(publishDate);

          return (
            <div key={post.id} className="space-y-4">
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
                  {post.tags.map((tag) => {
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
        })}
      </div>
    </div>
  );
}
