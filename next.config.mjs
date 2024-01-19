import "./src/env.mjs";

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds and Linting.
 */
// !process.env.SKIP_ENV_VALIDATION && (await import("./src/env.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: !!process.env.CI },
  typescript: { ignoreBuildErrors: !!process.env.CI },
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],

  /**
   * The redirection documentation tells us
   * to use `async` here.
   *
   * @see https://nextjs.org/docs/app/api-reference/next-config-js/redirects
   */

  // eslint-disable-next-line @typescript-eslint/require-await
  async redirects() {
    return [
      {
        source: "/meet",
        destination: "https://calendar.amie.so/s/ege",
        permanent: true,
      },
      {
        source: "/github",
        destination: "https://github.com/EgeOnder/",
        permanent: true,
      },
    ];
  },
};

export default config;
