import { z } from "zod";
import { getProjects } from "~/db/lib/get-projects";
import { postProject } from "~/db/lib/post-project";
import { removeProject } from "~/db/lib/remove-project";

export const runtime = "edge";

export async function GET() {
  const result = await getProjects();

  return new Response(JSON.stringify(result), {
    headers: {
      "content-type": "application/json",
    },
  });
}

const projectSchema = z.object({
  name: z.string(),
  description: z.string(),
  href: z.string().url(),
});

export async function POST(request: Request) {
  const body: unknown = await request.json();

  const payload = projectSchema.safeParse(body);

  if (!payload.success) {
    return new Response(
      JSON.stringify({
        message: "Invalid payload",
        errors: payload.error,
      }),
      {
        headers: {
          "content-type": "application/json",
        },
        status: 400,
      },
    );
  }

  await postProject(payload.data);

  return new Response(
    JSON.stringify({
      message: "Project created!",
    }),
    {
      headers: {
        "content-type": "application/json",
      },
      status: 200,
    },
  );
}

const projectRemoveSchema = z.object({
  id: z.number(),
});

export async function DELETE(request: Request) {
  const body: unknown = await request.json();

  const payload = projectRemoveSchema.safeParse(body);

  if (!payload.success) {
    return new Response(
      JSON.stringify({
        message: "Invalid payload",
        errors: payload.error,
      }),
      {
        headers: {
          "content-type": "application/json",
        },
        status: 400,
      },
    );
  }

  await removeProject(payload.data);

  return new Response(
    JSON.stringify({
      message: "Project removed!",
    }),
    {
      headers: {
        "content-type": "application/json",
      },
      status: 200,
    },
  );
}
