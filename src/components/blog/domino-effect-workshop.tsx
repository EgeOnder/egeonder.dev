"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";

type Choice = {
  label: string;
  consequence: string;
  terminalLine: string;
  risk: 0 | 1 | 2;
};

type Step = {
  title: string;
  description: string;
  choices: [Choice, Choice, Choice];
};

const UPDATE_COMMAND = "pnpm install tailwindcss@latest";
const TRANSITION_MS = 5000;

const STEPS: Step[] = [
  {
    title: "NativeWind mismatch",
    description: "Tailwind v4 is live on web. Mobile style sharing now needs a NativeWind-compatible update.",
    choices: [
      {
        label: "Upgrade NativeWind to a compatible version",
        consequence: "Correct move. Mobile is now in the upgrade chain.",
        terminalLine: "NativeWind upgraded -> Expo SDK compatibility check required.",
        risk: 0,
      },
      {
        label: "Keep NativeWind pinned and ignore style drift",
        consequence: "Short-term escape. Shared UI starts drifting between web and mobile.",
        terminalLine: "NativeWind pinned -> design tokens diverging across apps.",
        risk: 1,
      },
      {
        label: "Remove shared styles from mobile immediately",
        consequence: "Heavy rewrite. Migration scope explodes beyond this upgrade.",
        terminalLine: "Shared styling removed -> mobile rewrite workload increased.",
        risk: 2,
      },
    ],
  },
  {
    title: "Expo requirement appears",
    description: "Latest NativeWind requires Expo SDK 54.",
    choices: [
      {
        label: "Upgrade Expo SDK and continue validation",
        consequence: "Correct move. Platform constraints move forward.",
        terminalLine: "Expo SDK 54 installed -> React Native version gate opened.",
        risk: 0,
      },
      {
        label: "Delay Expo upgrade and continue anyway",
        consequence: "Incompatible versions linger and block stable releases later.",
        terminalLine: "Expo upgrade skipped -> unresolved compatibility debt detected.",
        risk: 1,
      },
      {
        label: "Fork NativeWind to avoid Expo upgrade",
        consequence: "Now your team owns long-term framework maintenance.",
        terminalLine: "Fork created -> internal maintenance burden increased.",
        risk: 2,
      },
    ],
  },
  {
    title: "React conflict",
    description: "Web wants a security-patched React while mobile tooling expects a stricter target.",
    choices: [
      {
        label: "Add scoped overrides and isolate platform boundaries",
        consequence: "Correct move. Conflict is managed, but complexity increases.",
        terminalLine: "Scoped overrides applied -> dependency graph complexity increased.",
        risk: 0,
      },
      {
        label: "Downgrade web React patch to match mobile",
        consequence: "Security posture regresses and introduces risk in production.",
        terminalLine: "Web downgraded -> vulnerability exposure reopened.",
        risk: 2,
      },
      {
        label: "Ignore warnings and keep shipping",
        consequence: "Hidden mismatch likely fails in CI or release builds.",
        terminalLine: "Warnings ignored -> unstable lockfile state detected.",
        risk: 1,
      },
    ],
  },
  {
    title: "Metro breaks",
    description: "React Native 0.81 changes Metro behavior and existing config fails.",
    choices: [
      {
        label: "Update Metro config and re-run clean builds",
        consequence: "Correct move. Mobile builds recover after tooling fixes.",
        terminalLine: "Metro config patched -> bundler restored.",
        risk: 0,
      },
      {
        label: "Keep old config and rely on local caches",
        consequence: "Builds appear flaky and fail across environments.",
        terminalLine: "Legacy config retained -> non-deterministic bundling persists.",
        risk: 1,
      },
      {
        label: "Disable custom Metro config entirely",
        consequence: "Workspace module resolution can break in edge cases.",
        terminalLine: "Custom config removed -> package resolution regressions found.",
        risk: 2,
      },
    ],
  },
  {
    title: "Release decision",
    description: "You now have cross-stack changes from a single Tailwind update.",
    choices: [
      {
        label: "Run full regression and staged deployment",
        consequence: "Correct move. You absorb the cost, but reduce release risk.",
        terminalLine: "Cross-platform regression complete -> staged rollout ready.",
        risk: 0,
      },
      {
        label: "Deploy immediately to save time",
        consequence: "Unvetted coupling raises production incident probability.",
        terminalLine: "Fast deploy attempted -> elevated release risk flagged.",
        risk: 2,
      },
      {
        label: "Split release without coordinated checks",
        consequence: "Version drift causes support and debugging overhead.",
        terminalLine: "Partial rollout -> clients drifted out of sync.",
        risk: 1,
      },
    ],
  },
];

type Phase = "idle" | "terminal" | "question" | "done";

export function DominoEffectWorkshop() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [riskScore, setRiskScore] = useState(0);
  const [lastConsequence, setLastConsequence] = useState<string | null>(null);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);

  useEffect(() => {
    if (phase !== "terminal") {
      return;
    }

    const timer = window.setTimeout(() => {
      if (stepIndex >= STEPS.length) {
        setPhase("done");
        return;
      }

      setPhase("question");
    }, TRANSITION_MS);

    return () => window.clearTimeout(timer);
  }, [phase, stepIndex]);

  const currentStep = phase === "question" ? STEPS[stepIndex] : null;
  const completedSteps = Math.min(stepIndex, STEPS.length);
  const progress = (completedSteps / STEPS.length) * 100;

  const riskLabel = useMemo(() => {
    if (riskScore <= 1) return "Low";
    if (riskScore <= 4) return "Medium";
    return "High";
  }, [riskScore]);

  function startDemo() {
    setStepIndex(0);
    setRiskScore(0);
    setLastConsequence(null);
    setTerminalLines([`$ ${UPDATE_COMMAND}`, "[web] Tailwind v4 update started.", "[workspace] Shared dependency graph recalculating..."]);
    setPhase("terminal");
  }

  function chooseOption(choice: Choice) {
    setRiskScore((value) => value + choice.risk);
    setLastConsequence(choice.consequence);
    setTerminalLines((lines) => [`[impact] ${choice.terminalLine}`, ...lines].slice(0, 5));
    setStepIndex((value) => value + 1);
    setPhase("terminal");
  }

  function resetDemo() {
    setPhase("idle");
    setStepIndex(0);
    setRiskScore(0);
    setLastConsequence(null);
    setTerminalLines([]);
  }

  return (
    <section
      className="relative my-8 overflow-hidden rounded-xl border p-4 sm:p-5"
      style={{
        backgroundColor: "var(--background)",
        backgroundImage: "linear-gradient(135deg, color-mix(in oklab, var(--accent-highlight) 12%, var(--background)), color-mix(in oklab, var(--accent-highlight) 28%, var(--background)))",
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="theme-glow-primary absolute -right-14 top-2 h-36 w-36 rounded-full" />
        <div className="theme-glow-secondary absolute -right-10 top-10 h-24 w-24 rounded-full" />
      </div>

      <div className="relative z-10 space-y-3">
        {(phase === "idle" || phase === "done") && (
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-serif text-xl sm:text-2xl">Let&apos;s update Tailwind CSS</h3>
            {phase === "idle" ? (
              <Button onClick={startDemo} variant="outline">
                Run command
              </Button>
            ) : null}
            {phase === "done" ? (
              <Button onClick={resetDemo} variant="outline">
                Replay
              </Button>
            ) : null}
          </div>
        )}

        <div className="relative min-h-40 overflow-hidden">
          <AnimatePresence mode="wait">
            {phase === "idle" ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 8, filter: "blur(3px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(3px)" }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="space-y-2"
              >
                <p className="text-xs uppercase tracking-[0.16em] text-foreground/60">Terminal</p>
                <div className="rounded-xl border dark:bg-black px-3 py-2 font-mono text-xs dark:text-amber-300 text-amber-900">$ {UPDATE_COMMAND}</div>
                <p className="text-sm text-foreground/70">Run the command to upgrade your &quot;tailwindcss&quot; dependency.</p>
              </motion.div>
            ) : null}

            {phase === "terminal" ? (
              <motion.div
                key={`terminal-${stepIndex}`}
                initial={{ opacity: 0, y: 8, filter: "blur(3px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(3px)" }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="space-y-2"
              >
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Terminal</p>
                <div className="rounded-xl border dark:bg-black px-3 py-2 font-mono text-xs dark:text-amber-300 text-amber-900">
                  {terminalLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                  <p className="dark:text-amber-300 text-amber-900">[system] Preparing next dependency checkpoint...</p>
                </div>
                {lastConsequence ? <p className="text-muted-foreground">{lastConsequence}</p> : null}
              </motion.div>
            ) : null}

            {phase === "question" && currentStep ? (
              <motion.div
                key={`question-${stepIndex}`}
                initial={{ opacity: 0, y: 8, filter: "blur(3px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(3px)" }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="space-y-3"
              >
                <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">
                  Step {stepIndex + 1} of {STEPS.length}
                </p>
                <div>
                  <p className="text-lg font-medium">{currentStep.title}</p>
                  <p className="text-muted-foreground">{currentStep.description}</p>
                </div>
                <div className="grid gap-2">
                  {currentStep.choices.map((choice) => (
                    <Button noHover key={choice.label} onClick={() => chooseOption(choice)} variant="outline">
                      {choice.label}
                    </Button>
                  ))}
                </div>
              </motion.div>
            ) : null}

            {phase === "done" ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 8, filter: "blur(3px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(3px)" }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="space-y-2"
              >
                <p className="text-xs uppercase tracking-[0.16em] text-foreground/60">Result</p>
                <p className="font-serif text-xl">One Tailwind command touched the whole stack.</p>
                <p className="text-muted-foreground">Risk path: {riskLabel}.</p>
                <p className="text-muted-foreground">This is the domino effect of a shared dependency graph.</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-foreground/15">
          <motion.div className="h-full bg-[linear-gradient(90deg,oklch(0.68_0.17_68),oklch(0.78_0.12_86))]" animate={{ width: `${progress}%` }} transition={{ duration: 0.2 }} />
        </div>
      </div>
    </section>
  );
}
