# egeonder.dev

![egeonder.dev](https://www.egeonder.dev/opengraph-image)

Personal website and engineering blog of [Ege Onder](https://egeonder.dev). Built with Next.js, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework** -- [Next.js](https://nextjs.org) (App Router)
- **Language** -- [TypeScript](https://www.typescriptlang.org)
- **Styling** -- [TailwindCSS](https://tailwindcss.com)
- **Content** -- [MDX](https://mdxjs.com) with frontmatter

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- [Bun](https://bun.sh) (recommended) or any Node-compatible package manager
- An [Upstash Redis](https://upstash.com) instance (for the view counter)

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable                   | Description                        |
| -------------------------- | ---------------------------------- |
| `UPSTASH_REDIS_REST_URL`   | Upstash Redis REST endpoint        |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token           |
| `TIMEZONE_DB_API_KEY`      | TimeZoneDB API key (online status) |

### Install Dependencies

```bash
bun install
```

### Run Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Build for Production

```bash
bun run build
bun start
```

### Lint

```bash
bun lint
```
