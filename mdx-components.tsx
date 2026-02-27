import { ExternalLinkIcon } from "lucide-react";
import { isValidElement, type ComponentPropsWithoutRef, type ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import { bundledLanguages, type BundledLanguage, codeToHtml, type ThemeRegistrationAny, BundledTheme, StringLiteralUnion } from "shiki";
import Image from "next/image";

const CODE_THEME: ThemeRegistrationAny | StringLiteralUnion<BundledTheme, string> = "github-light";

type CodeElementProps = {
  className?: string;
  children?: ReactNode;
};

type CodeSnippet = {
  code: string;
  language: BundledLanguage | "text";
};

function isBundledLanguage(language: string): language is BundledLanguage {
  return Object.hasOwn(bundledLanguages, language);
}

function parseLanguage(className?: string): CodeSnippet["language"] {
  const match = className?.match(/language-([\w#+-]+)/i);
  if (!match) {
    return "text";
  }

  const language = match[1].toLowerCase();
  return isBundledLanguage(language) ? language : "text";
}

function toPlainText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map((child) => toPlainText(child)).join("");
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return toPlainText(node.props.children);
  }

  return "";
}

function extractCodeSnippet(children: ReactNode): CodeSnippet | null {
  if (!isValidElement<CodeElementProps>(children)) {
    return null;
  }

  return {
    code: toPlainText(children.props.children),
    language: parseLanguage(children.props.className),
  };
}

async function CodeBlock({ children, ...props }: ComponentPropsWithoutRef<"pre">) {
  const codeSnippet = extractCodeSnippet(children);

  if (!codeSnippet) {
    return (
      <pre className="rounded-xl border bg-transparent backdrop-blur-md p-4 overflow-x-auto mb-4" {...props}>
        {children}
      </pre>
    );
  }

  const html = await codeToHtml(codeSnippet.code, {
    lang: codeSnippet.language,
    theme: CODE_THEME,
  });

  return <div className="mb-4 overflow-x-auto rounded-xl border [&_pre]:m-0! [&_pre]:p-4! [&_pre]:text-sm [&_pre]:leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children, ...props }) => (
      <h1 className="text-4xl font-semibold mt-8 mb-4" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 className="text-2xl font-semibold mt-6 mb-3" {...props}>
        {children}
      </h2>
    ),
    p: ({ children, ...props }) => (
      <p className="text-lg text-foreground mb-4" {...props}>
        {children}
      </p>
    ),
    a: ({ children, ...props }) => (
      <a {...props} target="_blank" rel="noopener noreferrer" href={`${props.href}?utm_source=egeonder.dev`} className="hover:text-foreground/60 transition-colors duration-150">
        <span className="underline underline-offset-4 decoration-2">{children}</span>
        <ExternalLinkIcon className="w-4 h-4 inline-block ml-1 mb-0.5" />
      </a>
    ),
    pre: CodeBlock,
    code: ({ children, className, ...props }) => {
      if (parseLanguage(className) !== "text") {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }

      return (
        <code className="bg-muted rounded px-1 py-0.5 text-sm font-mono" {...props}>
          {children}
        </code>
      );
    },
    img: ({ alt, src, ...props }) => <Image src={src} alt={alt} width={1200} height={675} priority className="h-auto w-full object-cover overflow-hidden rounded-2xl border" {...props} />,
    ul: ({ children, ...props }) => (
      <ul className="list-disc list-inside mb-4" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="list-decimal list-inside mb-4" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="mb-1 text-lg" {...props}>
        {children}
      </li>
    ),
    table: ({ children, ...props }) => (
      <div className="mb-6 w-full overflow-x-auto rounded-xl border border-border/80">
        <table className="w-full min-w-xl border-collapse text-left text-base [&_tbody_tr:nth-child(odd)]:bg-muted/20" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }) => (
      <thead className="border-b border-border bg-muted/40" {...props}>
        {children}
      </thead>
    ),
    tbody: ({ children, ...props }) => (
      <tbody className="divide-y divide-border/70" {...props}>
        {children}
      </tbody>
    ),
    tr: ({ children, ...props }) => (
      <tr className="transition-colors hover:bg-muted/35" {...props}>
        {children}
      </tr>
    ),
    th: ({ children, ...props }) => (
      <th className="px-4 py-3 text-sm font-semibold text-foreground" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td className="px-4 py-3 align-top text-foreground/90" {...props}>
        {children}
      </td>
    ),
    ...components,
  };
}
