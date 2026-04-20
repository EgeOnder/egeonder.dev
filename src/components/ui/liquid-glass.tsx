"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

/**
 * Convex squircle bezel profile from
 * https://kube.io/blog/liquid-glass-css-svg/
 *
 *   y = (1 - (1 - x)^4)^(1/4)
 *
 * x is the normalized distance from the outer edge into the bezel (0 at the
 * border, 1 at the start of the flat interior). y is the normalized glass
 * height at that point.
 */
function squircleHeight(x: number): number {
  const u = Math.max(0, 1 - (1 - x) ** 4);
  return u ** 0.25;
}

function squircleSlope(x: number): number {
  const delta = 1e-3;
  const a = Math.max(0, x - delta);
  const b = Math.min(1, x + delta);
  return (squircleHeight(b) - squircleHeight(a)) / (b - a);
}

type BoundaryInfo = {
  distance: number;
  // Inward unit normal at the closest boundary point. Points from the boundary
  // toward the glass interior.
  inwardX: number;
  inwardY: number;
};

function sampleBoundary(
  x: number,
  y: number,
  W: number,
  H: number,
  R: number,
): BoundaryInfo {
  const cornerCx = x < R ? R : x > W - R ? W - R : x;
  const cornerCy = y < R ? R : y > H - R ? H - R : y;
  const inCorner = cornerCx !== x || cornerCy !== y;

  if (inCorner) {
    const ox = x - cornerCx;
    const oy = y - cornerCy;
    const radial = Math.hypot(ox, oy);
    const distance = R - radial;
    if (radial > 0) {
      return {
        distance,
        inwardX: -ox / radial,
        inwardY: -oy / radial,
      };
    }
    return { distance, inwardX: 0, inwardY: 0 };
  }

  const left = x;
  const right = W - x;
  const top = y;
  const bottom = H - y;
  const distance = Math.min(left, right, top, bottom);
  if (distance === left) return { distance, inwardX: 1, inwardY: 0 };
  if (distance === right) return { distance, inwardX: -1, inwardY: 0 };
  if (distance === top) return { distance, inwardX: 0, inwardY: 1 };
  return { distance, inwardX: 0, inwardY: -1 };
}

type DisplacementMap = {
  url: string;
  max: number;
  width: number;
  height: number;
};

/**
 * Detects whether the current engine can render an SVG filter referenced via
 * `backdrop-filter: url(#id)`. As of 2026, only Chromium-based browsers do.
 * Safari and Firefox silently drop the whole `backdrop-filter` declaration
 * when the value contains `url(...)`, so we must fall back to a pure blur
 * glassmorphism for them instead of the refractive effect.
 */
function detectSvgBackdropFilterSupport(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }
  const ua = navigator.userAgent;
  // Safari (desktop + iOS WebKit). Excludes Chrome/Edge/Firefox on iOS which
  // all ship with "CriOS"/"FxiOS"/"EdgiOS" tokens but still use WebKit under
  // the hood — they inherit the same limitation.
  const isWebKit =
    /^((?!chrome|android).)*safari/i.test(ua) ||
    /\b(crios|fxios|edgios)\b/i.test(ua);
  if (isWebKit) return false;
  if (/firefox/i.test(ua)) return false;
  return true;
}

function buildDisplacementMap(
  width: number,
  height: number,
  cornerRadius: number,
  bezelWidth: number,
  glassThickness: number,
  ior: number,
): DisplacementMap | null {
  const W = Math.max(1, Math.round(width));
  const H = Math.max(1, Math.round(height));
  const R = Math.min(cornerRadius, W / 2, H / 2);
  const B = Math.max(1, Math.min(bezelWidth, R));

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const image = ctx.createImageData(W, H);
  const pixels = image.data;
  const dxField = new Float32Array(W * H);
  const dyField = new Float32Array(W * H);
  let maxDisplacement = 0;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const { distance, inwardX, inwardY } = sampleBoundary(x, y, W, H, R);

      let displacementMagnitude = 0;
      if (distance > 0 && distance < B) {
        const xn = distance / B;
        const h = glassThickness * squircleHeight(xn);
        const slope = (glassThickness / B) * squircleSlope(xn);
        const L = Math.sqrt(1 + slope * slope);
        // Vertical incoming ray; surface normal in cross-section is (-slope, 1)/L.
        const cosTheta1 = 1 / L;
        const sinTheta1 = slope / L;
        const sinTheta2 = sinTheta1 / ior;
        const cosTheta2 = Math.sqrt(Math.max(0, 1 - sinTheta2 * sinTheta2));
        const factor = (1 / ior) * cosTheta1 - cosTheta2;
        const refractedTangential = (-factor * slope) / L;
        const refractedVertical = -(1 / ior) + factor / L;
        if (refractedVertical !== 0) {
          displacementMagnitude =
            (-h * refractedTangential) / refractedVertical;
        }
      }

      const dx = inwardX * displacementMagnitude;
      const dy = inwardY * displacementMagnitude;
      const idx = y * W + x;
      dxField[idx] = dx;
      dyField[idx] = dy;
      const mag = Math.hypot(dx, dy);
      if (mag > maxDisplacement) maxDisplacement = mag;
    }
  }

  const denominator = maxDisplacement > 0 ? maxDisplacement : 1;
  for (let i = 0; i < W * H; i++) {
    const nx = dxField[i] / denominator;
    const ny = dyField[i] / denominator;
    pixels[i * 4] = Math.round(128 + nx * 127);
    pixels[i * 4 + 1] = Math.round(128 + ny * 127);
    pixels[i * 4 + 2] = 128;
    pixels[i * 4 + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);

  return {
    url: canvas.toDataURL(),
    max: maxDisplacement,
    width: W,
    height: H,
  };
}

type SpecularMap = {
  url: string;
  width: number;
  height: number;
};

/**
 * Generates a grayscale specular map encoded in the alpha channel. Brightness
 * peaks where the bezel normal faces the virtual light direction, producing
 * Apple-style rim highlights along the glass edge.
 */
function buildSpecularMap(
  width: number,
  height: number,
  cornerRadius: number,
  bezelWidth: number,
  lightAngleDeg: number,
  intensity: number,
): SpecularMap | null {
  const W = Math.max(1, Math.round(width));
  const H = Math.max(1, Math.round(height));
  const R = Math.min(cornerRadius, W / 2, H / 2);
  const B = Math.max(1, Math.min(bezelWidth, R));

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const image = ctx.createImageData(W, H);
  const pixels = image.data;

  const lightRad = (lightAngleDeg * Math.PI) / 180;
  const lightX = Math.cos(lightRad);
  const lightY = Math.sin(lightRad);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const { distance, inwardX, inwardY } = sampleBoundary(x, y, W, H, R);
      const outwardX = -inwardX;
      const outwardY = -inwardY;

      let alpha = 0;
      if (distance > 0 && distance < B) {
        const xn = distance / B;
        // Raw 2D slope of the height profile. Higher near the edge.
        const slope = squircleSlope(xn);
        // Normalize so we get a value roughly in [0, 1] peaking near the edge.
        const slopeFactor = slope / (1 + slope);
        const dotLight = Math.max(
          0,
          outwardX * lightX + outwardY * lightY,
        );
        const shaped = Math.pow(dotLight, 2) * slopeFactor;
        alpha = Math.min(1, shaped * intensity) * 255;
      }

      const idx = (y * W + x) * 4;
      pixels[idx] = 255;
      pixels[idx + 1] = 255;
      pixels[idx + 2] = 255;
      pixels[idx + 3] = Math.round(alpha);
    }
  }
  ctx.putImageData(image, 0, 0);

  return { url: canvas.toDataURL(), width: W, height: H };
}

export type LiquidGlassProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Width of the refractive bezel zone, in pixels. */
  bezelWidth?: number;
  /** Virtual glass thickness controlling the strength of refraction. */
  glassThickness?: number;
  /** Border radius of the rounded rectangle, in pixels. Should match the visual radius. */
  cornerRadius?: number;
  /** Refractive index of the glass (n2). Default 1.5 (typical glass). */
  refractiveIndex?: number;
  /** Multiplier for the displacement map scale. */
  refractionScale?: number;
  /** Background blur applied behind the glass (in pixels) when the filter is active. */
  blurAmount?: number;
  /** Background blur used when the filter isn't ready / supported. */
  fallbackBlur?: number;
  /** Saturation of the refracted backdrop (feColorMatrix values). */
  refractionSaturation?: number;
  /** Overall saturate() boost applied to the backdrop. */
  saturation?: number;
  /** Direction of the virtual light source for the specular highlight, in degrees. */
  specularLightAngle?: number;
  /** 0..1 strength of the specular highlight overlay. */
  specularIntensity?: number;
};

export const LiquidGlass = forwardRef<HTMLDivElement, LiquidGlassProps>(function LiquidGlass(
  {
    children,
    className,
    style,
    bezelWidth = 22,
    glassThickness = 32,
    cornerRadius = 22,
    refractiveIndex = 1.5,
    refractionScale = 1,
    blurAmount = 2,
    fallbackBlur = 24,
    refractionSaturation = 1.6,
    saturation = 1.3,
    specularLightAngle = -60,
    specularIntensity = 0.9,
  },
  forwardedRef,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(forwardedRef, () => containerRef.current as HTMLDivElement);

  const rawId = useId();
  const filterId = useMemo(
    () => `liquid-glass-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`,
    [rawId],
  );

  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [maps, setMaps] = useState<{
    displacement: DisplacementMap;
    specular: SpecularMap;
  } | null>(null);
  // Start pessimistic so the initial paint (SSR + first client render) uses the
  // fallback blur. We flip to true on mount in Chromium engines that actually
  // support `backdrop-filter: url(#...)`.
  const [svgBackdropSupported, setSvgBackdropSupported] = useState(false);

  useEffect(() => {
    setSvgBackdropSupported(detectSvgBackdropFilterSupport());
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize((prev) => {
        if (
          prev &&
          Math.abs(prev.width - width) < 0.5 &&
          Math.abs(prev.height - height) < 0.5
        ) {
          return prev;
        }
        return { width, height };
      });
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!svgBackdropSupported) return;
    if (!size || size.width < 4 || size.height < 4) return;

    let cancelled = false;
    let rafId: number | null = null;
    let idleId: number | null = null;

    const compute = () => {
      if (cancelled) return;
      const displacement = buildDisplacementMap(
        size.width,
        size.height,
        cornerRadius,
        bezelWidth,
        glassThickness,
        refractiveIndex,
      );
      const specular = buildSpecularMap(
        size.width,
        size.height,
        cornerRadius,
        bezelWidth,
        specularLightAngle,
        specularIntensity,
      );
      if (cancelled || !displacement || !specular) return;
      setMaps({ displacement, specular });
    };

    const idle = (
      window as Window & {
        requestIdleCallback?: (cb: IdleRequestCallback) => number;
      }
    ).requestIdleCallback;

    if (typeof idle === "function") {
      idleId = idle(compute);
    } else {
      rafId = window.requestAnimationFrame(compute);
    }

    return () => {
      cancelled = true;
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      if (idleId !== null) {
        const cancelIdle = (
          window as Window & {
            cancelIdleCallback?: (handle: number) => void;
          }
        ).cancelIdleCallback;
        cancelIdle?.(idleId);
      }
    };
  }, [
    svgBackdropSupported,
    size,
    cornerRadius,
    bezelWidth,
    glassThickness,
    refractiveIndex,
    specularLightAngle,
    specularIntensity,
  ]);

  const filterReady = svgBackdropSupported && maps !== null;

  // Chromium engines render SVG filters via `backdrop-filter: url(#..)`.
  // Safari and Firefox reject the whole declaration when it contains a
  // `url()`, leaving the element completely un-glassy — so we feed those
  // engines a plain blur+saturate glassmorphism instead (same approach the
  // original kube.io article uses for non-Chromium viewers).
  const activeBackdrop = `url(#${filterId}) saturate(${saturation}) blur(${blurAmount}px)`;
  const fallbackBackdrop = `blur(${fallbackBlur}px) saturate(${saturation})`;
  const backdropValue = filterReady ? activeBackdrop : fallbackBackdrop;

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      style={{
        borderRadius: cornerRadius,
        backdropFilter: backdropValue,
        WebkitBackdropFilter: backdropValue,
        ...style,
      }}
    >
      {filterReady && maps ? (
        <svg
          aria-hidden
          colorInterpolationFilters="sRGB"
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <defs>
            <filter id={filterId}>
              <feImage
                href={maps.displacement.url}
                x="0"
                y="0"
                width={maps.displacement.width}
                height={maps.displacement.height}
                result="displacementMap"
                preserveAspectRatio="none"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="displacementMap"
                scale={maps.displacement.max * refractionScale}
                xChannelSelector="R"
                yChannelSelector="G"
                result="displaced"
              />
              <feColorMatrix
                in="displaced"
                type="saturate"
                values={String(refractionSaturation)}
                result="displacedSaturated"
              />
              <feImage
                href={maps.specular.url}
                x="0"
                y="0"
                width={maps.specular.width}
                height={maps.specular.height}
                result="specularLayer"
                preserveAspectRatio="none"
              />
              {/* Paint the specular highlight over the saturated, refracted backdrop. */}
              <feComposite
                in="specularLayer"
                in2="displacedSaturated"
                operator="over"
              />
            </filter>
          </defs>
        </svg>
      ) : null}

      {children}
    </div>
  );
});
