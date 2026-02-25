import fs from "node:fs/promises";
import path from "node:path";
import type { ComponentType } from "react";

const BLOG_CONTENT_DIR = path.join(process.cwd(), "src/content/blog");
const SLUG_REGEX = /^[a-z0-9-]+$/;
const FRONTMATTER_REGEX = /^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

export type BlogMetadata = {
  title: string;
  description: string;
  date: string;
  tags?: string[];
  readingTime?: string;
  author?: string;
  authorRole?: string;
  authorAvatar?: string;
  image?: string;
  imageAlt?: string;
};

export type BlogPostModule = {
  default: ComponentType;
  metadata: BlogMetadata;
};

export type BlogPostSummary = {
  slug: string;
  metadata: BlogMetadata;
};

function assertBlogMetadata(metadata: unknown, slug: string): asserts metadata is BlogMetadata {
  if (!metadata || typeof metadata !== "object") {
    throw new Error(`Invalid blog metadata for "${slug}": expected a frontmatter object.`);
  }

  const record = metadata as Record<string, unknown>;
  const requiredFields: Array<keyof BlogMetadata> = ["title", "description", "date"];

  for (const field of requiredFields) {
    if (typeof record[field] !== "string" || record[field].trim().length === 0) {
      throw new Error(`Invalid blog metadata for "${slug}": "${field}" must be a non-empty string.`);
    }
  }

  if (record.readingTime !== undefined && typeof record.readingTime !== "string") {
    throw new Error(`Invalid blog metadata for "${slug}": "readingTime" must be a string when provided.`);
  }

  if (
    record.tags !== undefined &&
    (!Array.isArray(record.tags) || record.tags.some((tag) => typeof tag !== "string" || tag.trim().length === 0))
  ) {
    throw new Error(`Invalid blog metadata for "${slug}": "tags" must be an array of non-empty strings when provided.`);
  }

  const optionalStringFields: Array<keyof Pick<
    BlogMetadata,
    "author" | "authorRole" | "authorAvatar" | "image" | "imageAlt"
  >> = ["author", "authorRole", "authorAvatar", "image", "imageAlt"];

  for (const field of optionalStringFields) {
    if (record[field] !== undefined && typeof record[field] !== "string") {
      throw new Error(`Invalid blog metadata for "${slug}": "${field}" must be a string when provided.`);
    }
  }
}

function parseQuotedString(value: string, slug: string, field: string): string {
  const quote = value.at(0);

  if (!quote || (quote !== "'" && quote !== '"') || value.length < 2 || value.at(-1) !== quote) {
    throw new Error(`Invalid blog metadata for "${slug}": "${field}" must be a properly quoted string.`);
  }

  const inner = value.slice(1, -1);

  if (quote === "'") {
    return inner.replaceAll("''", "'");
  }

  try {
    return JSON.parse(value) as string;
  } catch {
    throw new Error(`Invalid blog metadata for "${slug}": "${field}" contains an invalid quoted string value.`);
  }
}

function parseStringArray(value: string, slug: string, field: string): string[] {
  const trimmed = value.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) {
    throw new Error(`Invalid blog metadata for "${slug}": "${field}" must be an array wrapped with [] .`);
  }

  const inner = trimmed.slice(1, -1).trim();
  if (!inner) {
    return [];
  }

  const parts = inner.split(",").map((part) => part.trim());

  return parts.map((part) => {
    if ((part.startsWith("'") && part.endsWith("'")) || (part.startsWith('"') && part.endsWith('"'))) {
      return parseQuotedString(part, slug, field);
    }

    throw new Error(
      `Invalid blog metadata for "${slug}": "${field}" items must be quoted strings (for example ['redis', 'backend']).`,
    );
  });
}

function parseFrontmatterValue(value: string, slug: string, field: string): unknown {
  if (!value) {
    throw new Error(`Invalid blog metadata for "${slug}": "${field}" cannot be empty.`);
  }

  if (value.startsWith("[") && value.endsWith("]")) {
    return parseStringArray(value, slug, field);
  }

  if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
    return parseQuotedString(value, slug, field);
  }

  return value;
}

function parseFrontmatter(content: string, slug: string): BlogMetadata {
  const match = content.match(FRONTMATTER_REGEX);
  if (!match) {
    throw new Error(`Invalid blog metadata for "${slug}": missing frontmatter block (--- ... ---).`);
  }

  const rawFrontmatter = match[1];
  const metadata: Record<string, unknown> = {};

  for (const line of rawFrontmatter.split(/\r?\n/)) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf(":");
    if (separatorIndex <= 0) {
      throw new Error(`Invalid blog metadata for "${slug}": line "${line}" is not a valid "key: value" pair.`);
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim();
    metadata[key] = parseFrontmatterValue(value, slug, key);
  }

  assertBlogMetadata(metadata, slug);
  return metadata;
}

async function getBlogPostMetadata(slug: string): Promise<BlogMetadata | null> {
  if (!SLUG_REGEX.test(slug)) {
    return null;
  }

  const blogPostPath = path.join(BLOG_CONTENT_DIR, `${slug}.mdx`);

  try {
    const blogContent = await fs.readFile(blogPostPath, "utf8");
    return parseFrontmatter(blogContent, slug);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

export async function getBlogSlugs(): Promise<string[]> {
  try {
    const entries = await fs.readdir(BLOG_CONTENT_DIR, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
      .map((entry) => entry.name.replace(/\.mdx$/, ""))
      .sort((a, b) => a.localeCompare(b));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

export async function getBlogPostModule(slug: string): Promise<BlogPostModule | null> {
  const metadata = await getBlogPostMetadata(slug);
  if (!metadata) {
    return null;
  }

  const blogPost = (await import(`@/content/blog/${slug}.mdx`)) as Partial<Pick<BlogPostModule, "default">>;

  if (typeof blogPost.default !== "function") {
    throw new Error(`Invalid blog module for "${slug}": expected a default MDX component export.`);
  }

  return {
    default: blogPost.default,
    metadata,
  };
}

export async function getAllBlogPostSummaries(): Promise<BlogPostSummary[]> {
  const slugs = await getBlogSlugs();

  const posts = await Promise.all(
    slugs.map(async (slug): Promise<BlogPostSummary> => {
      const metadata = await getBlogPostMetadata(slug);
      if (!metadata) {
        throw new Error(`Unable to load blog post for known slug "${slug}".`);
      }

      return {
        slug,
        metadata,
      };
    }),
  );

  return posts.sort((a, b) => b.metadata.date.localeCompare(a.metadata.date));
}
