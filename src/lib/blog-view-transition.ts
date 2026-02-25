export function getBlogViewTransitionNames(slug: string) {
  const prefix = `blog-${slug}`;
  return {
    image: `${prefix}-image`,
    title: `${prefix}-title`,
    description: `${prefix}-description`,
    meta: `${prefix}-meta`,
    author: `${prefix}-author`,
  };
}
