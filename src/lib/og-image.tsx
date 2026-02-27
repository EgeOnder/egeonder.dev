import fs from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;

const serifFontDataPromise = fs.readFile(path.join(process.cwd(), "public/fonts/calendas_plus-webfont.ttf"));
const sansFontDataPromise = fs.readFile(path.join(process.cwd(), "public/fonts/OverusedGrotesk-Roman.ttf")).catch(() => null);

type OgImageFrameProps = {
  children: ReactNode;
  bodyPaddingTop?: number;
  hasSansFont: boolean;
};

function OgImageFrame({ children, bodyPaddingTop = 0, hasSansFont }: OgImageFrameProps) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "linear-gradient(145deg, #ffffff 0%, #fff7ed 100%)",
        color: "#18181b",
        fontFamily: hasSansFont ? "Overused Grotesk" : "ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          flexDirection: "column",
          padding: "44px 68px 54px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: 76,
          }}
        >
          <BrandLogo color="#ca3500" />
          <span style={{ marginLeft: 12, fontSize: 34, letterSpacing: -0.6 }}>egeonder.dev</span>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            paddingTop: bodyPaddingTop,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

type CreateOgImageResponseOptions = {
  body: ReactNode;
  bodyPaddingTop?: number;
};

export async function createOgImageResponse({ body, bodyPaddingTop }: CreateOgImageResponseOptions) {
  const [serifFont, sansFont] = await Promise.all([serifFontDataPromise, sansFontDataPromise]);

  return new ImageResponse(
    <OgImageFrame bodyPaddingTop={bodyPaddingTop} hasSansFont={Boolean(sansFont)}>
      {body}
    </OgImageFrame>,
    {
      ...OG_IMAGE_SIZE,
      fonts: [
        ...(sansFont
          ? [
              {
                name: "Overused Grotesk",
                data: sansFont,
                style: "normal" as const,
                weight: 400 as const,
              },
            ]
          : []),
        {
          name: "Calendas Plus",
          data: serifFont,
          style: "normal" as const,
          weight: 400 as const,
        },
      ],
    },
  );
}

type ProfileOgBodyProps = {
  description: string;
};

export function ProfileOgBody({ description }: ProfileOgBodyProps) {
  return (
    <p
      style={{
        fontSize: 40,
        letterSpacing: -0.4,
      }}
    >
      {description}
    </p>
  );
}

function getBlogPostTitleFontSize(title: string) {
  if (title.length > 120) return 54;
  if (title.length > 90) return 62;
  return 72;
}

type BlogPostOgBodyProps = {
  title: string;
  dateAndReadTime: string;
};

export function BlogPostOgBody({ title, dateAndReadTime }: BlogPostOgBodyProps) {
  const titleFontSize = getBlogPostTitleFontSize(title);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h1
        style={{
          margin: 0,
          maxWidth: "100%",
          maxHeight: 360,
          overflow: "hidden",
          color: "#18181b",
          fontFamily: "Calendas Plus",
          fontSize: titleFontSize,
          fontWeight: 400,
          letterSpacing: -1.2,
        }}
      >
        {title}
      </h1>

      <p
        style={{
          margin: "30px 0 0",
          color: "#71717a",
          fontSize: 32,
          letterSpacing: -0.2,
        }}
      >
        {dateAndReadTime}
      </p>
    </div>
  );
}
