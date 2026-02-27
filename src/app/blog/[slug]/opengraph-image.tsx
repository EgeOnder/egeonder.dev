import { notFound } from "next/navigation";

import { getBlogPostModule } from "@/lib/blog";
import { BlogPostOgBody, createOgImageResponse, OG_IMAGE_SIZE } from "@/lib/og-image";
import { formatDate } from "@/lib/utils";

export const runtime = "nodejs";
export const alt = "egeonder.dev blog post preview";
export const contentType = "image/png";
export const size = OG_IMAGE_SIZE;

type OpenGraphImageProps = {
  params: Promise<{ slug: string }>;
};

export default async function OpenGraphImage({ params }: OpenGraphImageProps) {
  const { slug } = await params;
  const blogPost = await getBlogPostModule(slug);

  if (!blogPost) {
    notFound();
  }

  const publishedDate = formatDate(blogPost.metadata.date);
  const dateAndReadTime = blogPost.metadata.readingTime ? `${publishedDate} • ${blogPost.metadata.readingTime}` : publishedDate;

  return createOgImageResponse({
    bodyPaddingTop: 18,
    body: <BlogPostOgBody title={blogPost.metadata.title} dateAndReadTime={dateAndReadTime} />,
  });
}
