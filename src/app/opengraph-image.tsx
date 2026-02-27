import { calculateAge } from "@/lib/calculate-age";
import { createOgImageResponse, OG_IMAGE_SIZE, ProfileOgBody } from "@/lib/og-image";

export const runtime = "nodejs";
export const alt = "egeonder.dev";
export const contentType = "image/png";
export const size = OG_IMAGE_SIZE;

export default async function OpenGraphImage() {
  const description = `A ${calculateAge()} year old curious developer. Currently working on kafeasist. Loves writing about things they learn, things they use, and things they like. Also loves to build things that they find exciting.`;

  return createOgImageResponse({
    body: <ProfileOgBody description={description} />,
  });
}
