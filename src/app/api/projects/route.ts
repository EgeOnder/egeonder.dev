import { getProjects } from "~/db/lib/get-projects";
import { postProject } from "~/db/lib/post-project";
import type { Project } from "~/db/schema";

export const runtime = "edge";

export async function GET() {
  const result = await getProjects();

  return new Response(JSON.stringify(result), {
    headers: {
      "content-type": "application/json",
    },
  });
}

export async function POST(request: Request) {
  const body: unknown = await request.json();

  // TODO: Validate body
  await postProject(body as Project);

  return new Response(
    JSON.stringify({
      message: "Project created!",
    }),
    {
      headers: {
        "content-type": "application/json",
      },
    },
  );
}
