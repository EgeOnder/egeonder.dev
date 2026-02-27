import { getBrandLogoSvgMarkup } from "@/components/brand-logo";

export const runtime = "nodejs";
export const contentType = "image/svg+xml";
export const size = {
  width: 64,
  height: 64,
};

export default function IconDark() {
  const svg = getBrandLogoSvgMarkup({ color: "#ffffff", size: size.width });

  return new Response(svg, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
