import { env } from "~/env.mjs";
import { getPostByName } from "./get-post-by-name";

type FileTree = {
  tree: [{ path: string }];
};

export type Meta = {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
};

export async function getPostsMeta() {
  const res = await fetch(
    "https://api.github.com/repos/EgeOnder/blog/git/trees/main?recursive=1",
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  if (!res.ok) return;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const repoFileTree: FileTree = await res.json();

  const filesArray = repoFileTree.tree
    .map((obj) => obj.path)
    .filter((path) => path.endsWith(".mdx"));

  const posts: Meta[] = [];

  for (const file of filesArray) {
    const post = await getPostByName(file);
    if (post) posts.push(post.meta);
  }

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}
