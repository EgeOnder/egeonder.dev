import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string(),
    NODE_ENV: z.enum(["development", "production", "test"]),
    BASE_URL: z.string(),
    GITHUB_TOKEN: z.string(),
  },
  client: {},
  experimental__runtimeEnv: process.env,
});
