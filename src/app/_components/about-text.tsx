import TextHighlighter from "@/components/ui/text-highlighter";
import { Transition } from "motion";
import { Online } from "./online";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cacheLife } from "next/cache";
import { calculateAge } from "@/lib/calculate-age";

export async function AboutText() {
  "use cache";
  cacheLife("days");

  const highlightColorClassName = "rounded-[0.3em] px-px text-black/75";
  const highlightTransition = {
    type: "spring",
    duration: 1,
    delay: 0.4,
    bounce: 0,
  };
  const highlightColor = "var(--accent-highlight)";
  const highlightUseInViewOptions = { once: true, initial: true, amount: 0.1 };
  return (
    <div className="space-y-4">
      <Suspense fallback={<Skeleton className="w-48 h-5" />}>
        <Online />
      </Suspense>
      <p className="text-xl">
        A {calculateAge()} year old curious developer. Currently working on{" "}
        <TextHighlighter className={highlightColorClassName} transition={highlightTransition as Transition} highlightColor={highlightColor} useInViewOptions={highlightUseInViewOptions}>
          kafeasist
        </TextHighlighter>
        , a dashboard that helps you manage your restaurant. Loves writing about things they learn, things they use, and things they like. Also loves to build things that they find exciting.
      </p>
      <p className="text-xl">
        Has 8 years of experience in full-stack development. Mostly tries to make awesome looking web applications with{" "}
        <TextHighlighter className={highlightColorClassName} transition={highlightTransition as Transition} highlightColor={highlightColor} useInViewOptions={highlightUseInViewOptions}>
          Next, Tailwind, and TypeScript
        </TextHighlighter>
        . Currently learning Go.
      </p>
    </div>
  );
}
