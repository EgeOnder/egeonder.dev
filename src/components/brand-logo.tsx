import type { ComponentPropsWithoutRef } from "react";

type BrandLogoProps = ComponentPropsWithoutRef<"svg"> & {
  color?: string;
  size?: number;
};

const BRAND_LOGO_VIEWBOX = "0 0 200 200";
const BRAND_LOGO_PETAL_PATH = "M 100,100 C 90,60 70,30 100,10 C 130,30 110,60 100,100 Z";
const BRAND_LOGO_ROTATIONS = [60, 120, 180, 240, 300] as const;

type BrandLogoMarkupOptions = {
  color?: string;
  size?: number;
};

export function getBrandLogoSvgMarkup({ color = "#ca3500", size = 35 }: BrandLogoMarkupOptions = {}) {
  const rotatedPetals = BRAND_LOGO_ROTATIONS.map((rotation) => `<use href="#petal" transform="rotate(${rotation}, 100, 100)" />`).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${BRAND_LOGO_VIEWBOX}" width="${size}" height="${size}"><defs><path id="petal" d="${BRAND_LOGO_PETAL_PATH}" fill="${color}" /></defs><use href="#petal" />${rotatedPetals}</svg>`;
}

export function BrandLogo({ color = "var(--accent-logo, #ca3500)", size = 35, width, height, ...props }: BrandLogoProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={BRAND_LOGO_VIEWBOX} width={width ?? size} height={height ?? size} {...props}>
      <defs>
        <path id="petal" d={BRAND_LOGO_PETAL_PATH} fill={color} />
      </defs>

      <use href="#petal" />
      {BRAND_LOGO_ROTATIONS.map((rotation) => (
        <use key={rotation} href="#petal" transform={`rotate(${rotation}, 100, 100)`} />
      ))}
    </svg>
  );
}
