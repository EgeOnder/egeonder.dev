import type { NextConfig } from "next";
import path from "node:path";
import createMDX from "@next/mdx";

const stripYamlFrontmatterPluginPath = path.join(process.cwd(), "src/lib/mdx/strip-yaml-frontmatter.mjs");

const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm", stripYamlFrontmatterPluginPath],
  },
});

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],

  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
    viewTransition: true,
  },
};

export default withMDX(nextConfig);
