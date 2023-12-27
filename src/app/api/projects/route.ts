import { db } from "~/db/connection";
import { projects } from "~/db/schema";

export const runtime = "edge";

export async function GET() {
  const result = await db.select().from(projects);

  return new Response(JSON.stringify(result), {
    headers: {
      "content-type": "application/json",
    },
  });
}
