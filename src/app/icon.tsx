import { getBrandLogoSvgMarkup } from "@/components/brand-logo";

export const runtime = "nodejs";
export const contentType = "image/svg+xml";
export const size = {
  width: 64,
  height: 64,
};

export default function Icon() {
  const svg = getBrandLogoSvgMarkup({ color: "#0a0a0a", size: size.width });

  return new Response(svg, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
