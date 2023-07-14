import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_HOST: z.string(),
    DATABASE_USERNAME: z.string(),
    DATABASE_PASSWORD: z.string(),
  },
  client: {},
  experimental__runtimeEnv: process.env,
});
