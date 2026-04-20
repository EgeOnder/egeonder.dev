"use client";

import { ClaudeIcon } from "@/components/icons/claude";
import { T3ChatIcon } from "@/components/icons/t3-chat";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { PlayIcon, type PlayIconHandle } from "@/components/ui/play";
import { RotateCCWIcon, type RotateCCWIconHandle } from "@/components/ui/rotate-ccw";
import { RotateCWIcon, type RotateCWIconHandle } from "@/components/ui/rotate-cw";
import { SparklesIcon } from "@/components/ui/sparkles";
import { cn } from "@/lib/utils";
import { OpenAiLogoIcon } from "@phosphor-icons/react";
import { MessageSquareIcon, PauseIcon, XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

const DOCK_CORNER_RADIUS = 22;
const DOCK_DISMISS_OFFSET = 96;
const DOCK_DISMISS_VELOCITY = 650;
const PLAYBACK_RATES = [1, 1.25, 1.5, 2] as const;

export const BLOG_VOICE_PLAYER_SEEK_SECONDS = 15;
export const BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS = {
  whileHover: { scale: 1.00 },
  whileTap: { scale: 0.99 },
  transition: { type: "spring", stiffness: 320, damping: 24 },
} as const;

type BlogVoicePlayerStatus = "idle" | "playing" | "paused";
type BlogDockMode = "voice" | "summary";

type BlogSummaryDockState = {
  provider: string | null;
  summary: string;
  title: string | null;
};

type BlogVoicePlayerContextValue = {
  activeSrc: string | null;
  activeTitle: string | null;
  currentTime: number;
  duration: number;
  isSummaryDockOpen: boolean;
  playbackRate: number;
  status: BlogVoicePlayerStatus;
  cyclePlaybackRate: () => void;
  dismiss: () => void;
  showSummaryDock: (payload: { provider?: string | null; summary: string; title?: string | null }) => void;
  seekBy: (delta: number) => void;
  seekToPercent: (percent: number) => void;
  setInlinePlayerElement: (element: HTMLDivElement | null) => void;
  togglePlayback: (src?: string | null, title?: string | null) => void;
};

const BlogVoicePlayerContext = createContext<BlogVoicePlayerContextValue | null>(null);

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function getSummaryProviderIcon(provider: string | null) {
  switch (provider) {
    case "ChatGPT":
      return <OpenAiLogoIcon className="size-3.5" />;
    case "Claude":
      return <ClaudeIcon className="size-3.5" />;
    case "T3 Chat":
      return <T3ChatIcon width={14} height={14} />;
    default:
      return <MessageSquareIcon className="size-3.5" />;
  }
}

export const formatBlogVoiceTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

type BlogVoicePlayerProviderProps = {
  children: React.ReactNode;
};

export function BlogVoicePlayerProvider({ children }: BlogVoicePlayerProviderProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const playIconRef = useRef<PlayIconHandle>(null);
  const rotateCcwIconRef = useRef<RotateCCWIconHandle>(null);
  const rotateCwIconRef = useRef<RotateCWIconHandle>(null);
  const isClearingTrackRef = useRef(false);
  const [activeSrc, setActiveSrc] = useState<string | null>(null);
  const [activeTitle, setActiveTitle] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [inlinePlayerElement, setInlinePlayerElement] = useState<HTMLDivElement | null>(null);
  const [isDockVisible, setIsDockVisible] = useState(false);
  const [isDockDismissed, setIsDockDismissed] = useState(false);
  const [playbackRateIndex, setPlaybackRateIndex] = useState(0);
  const [status, setStatus] = useState<BlogVoicePlayerStatus>("idle");
  const [dockMode, setDockMode] = useState<BlogDockMode | null>(null);
  const [summaryDock, setSummaryDock] = useState<BlogSummaryDockState | null>(null);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  const playbackRate = PLAYBACK_RATES[playbackRateIndex];
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const hasActiveSession = Boolean(activeSrc) && status !== "idle";
  const showVoiceDock = dockMode === "voice" && hasActiveSession && isDockVisible;
  const showSummaryDock = dockMode === "summary" && Boolean(summaryDock);
  const showDock = (showVoiceDock || showSummaryDock) && !isDockDismissed;

  const clearTrack = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    isClearingTrackRef.current = true;
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    setActiveSrc(null);
    setActiveTitle(null);
    setCurrentTime(0);
    setDuration(0);
    setStatus("idle");
    setIsDockVisible(false);
    window.setTimeout(() => {
      isClearingTrackRef.current = false;
    }, 0);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    if (!hasActiveSession) {
      return;
    }

    let frameId: number | null = null;

    const updateDockVisibility = () => {
      if (!inlinePlayerElement) {
        setIsDockVisible(true);
        return;
      }

      const { bottom } = inlinePlayerElement.getBoundingClientRect();
      setIsDockVisible(bottom <= 24);
    };

    const scheduleDockVisibilityUpdate = () => {
      if (frameId !== null) {
        return;
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        updateDockVisibility();
      });
    };

    updateDockVisibility();
    window.addEventListener("scroll", scheduleDockVisibilityUpdate, { passive: true });
    window.addEventListener("resize", scheduleDockVisibilityUpdate);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", scheduleDockVisibilityUpdate);
      window.removeEventListener("resize", scheduleDockVisibilityUpdate);
    };
  }, [hasActiveSession, inlinePlayerElement]);

  const startPlayback = useCallback(
    async (src: string, title?: string | null) => {
      const audio = audioRef.current;
      if (!audio) {
        return;
      }

      if (audio.getAttribute("src") !== src) {
        audio.src = src;
        audio.load();
        setActiveSrc(src);
        setCurrentTime(0);
        setDuration(0);
      }
      setActiveTitle(title?.trim() || null);
      setDockMode("voice");
      setSummaryDock(null);
      setIsSummaryExpanded(false);
      setIsDockDismissed(false);

      try {
        await audio.play();
      } catch {
        setStatus((previous) => (previous === "playing" ? "paused" : previous));
      }
    },
    [],
  );

  const togglePlayback = useCallback(
    (src?: string | null, title?: string | null) => {
      if (!src) {
        return;
      }

      const audio = audioRef.current;
      if (!audio) {
        return;
      }

      if (activeSrc === src && status === "playing") {
        audio.pause();
        return;
      }

      void startPlayback(src, title);
    },
    [activeSrc, startPlayback, status],
  );

  const showSummaryDockInPortal = useCallback(
    ({ provider, summary, title }: { provider?: string | null; summary: string; title?: string | null }) => {
      const normalizedSummary = summary.trim();
      if (!normalizedSummary) {
        return;
      }

      clearTrack();
      setSummaryDock({
        provider: provider?.trim() || null,
        summary: normalizedSummary,
        title: title?.trim() || null,
      });
      setDockMode("summary");
      setIsSummaryExpanded(false);
      setIsDockDismissed(false);
    },
    [clearTrack],
  );

  const dismiss = useCallback(() => {
    setIsDockDismissed(true);
    clearTrack();
    setSummaryDock(null);
    setIsSummaryExpanded(false);
    setDockMode(null);
  }, [clearTrack]);

  const seekBy = useCallback((delta: number) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.currentTime = clamp(audio.currentTime + delta, 0, audio.duration || 0);
    setCurrentTime(audio.currentTime);
  }, []);

  const seekToPercent = useCallback((percent: number) => {
    const audio = audioRef.current;
    if (!audio || audio.duration <= 0) {
      return;
    }

    const nextTime = (percent / 100) * audio.duration;
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  }, []);

  const cyclePlaybackRate = useCallback(() => {
    setPlaybackRateIndex((currentIndex) => (currentIndex + 1) % PLAYBACK_RATES.length);
  }, []);

  const value = useMemo<BlogVoicePlayerContextValue>(
    () => ({
      activeSrc,
      activeTitle,
      currentTime,
      duration,
      isSummaryDockOpen: showSummaryDock,
      playbackRate,
      status,
      cyclePlaybackRate,
      dismiss,
      showSummaryDock: showSummaryDockInPortal,
      seekBy,
      seekToPercent,
      setInlinePlayerElement,
      togglePlayback,
    }),
    [activeSrc, activeTitle, currentTime, cyclePlaybackRate, dismiss, duration, playbackRate, seekBy, seekToPercent, showSummaryDock, showSummaryDockInPortal, status, togglePlayback],
  );

  const dock =
    typeof document === "undefined"
      ? null
      : createPortal(
        <AnimatePresence>
          {showDock ? (
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 28, scale: 0.97 }}
              transition={{
                opacity: { duration: 0.18, ease: "easeOut" },
                default: { type: "spring", stiffness: 340, damping: 30, mass: 0.8 },
              }}
              className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-2 pb-2"
            >
              <div className="mx-auto max-w-3xl">
                <motion.div
                  drag={status === "playing" ? false : "y"}
                  dragDirectionLock
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0, bottom: 0.2 }}
                  whileDrag={status === "playing" ? undefined : { scale: 0.985 }}
                  onDragEnd={(_, info) => {
                    if (status === "playing") {
                      return;
                    }

                    if (info.offset.y >= DOCK_DISMISS_OFFSET || info.velocity.y >= DOCK_DISMISS_VELOCITY) {
                      dismiss();
                    }
                  }}
                  className="pointer-events-auto"
                >
                  <LiquidGlass
                    cornerRadius={DOCK_CORNER_RADIUS}
                    bezelWidth={20}
                    glassThickness={28}
                    blurAmount={3}
                    fallbackBlur={28}
                    saturation={1.6}
                    className="overflow-hidden border border-white/40 bg-white/35 shadow-[0_24px_80px_-30px_rgba(15,23,42,0.42)] ring-1 ring-black/6 dark:border-white/12 dark:bg-neutral-950/40 dark:ring-white/8"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0"
                      style={{ borderRadius: DOCK_CORNER_RADIUS }}
                    >
                      <div
                        className="absolute inset-0"
                        style={{
                          borderRadius: DOCK_CORNER_RADIUS,
                          boxShadow:
                            "inset 0 1px 0 0 rgba(255,255,255,0.6), inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 -1px 0 0 rgba(0,0,0,0.06)",
                        }}
                      />
                      <div
                        className="absolute inset-x-0 top-0 h-px"
                        style={{
                          background: "linear-gradient(to right, transparent, rgba(255,255,255,0.85), transparent)",
                        }}
                      />
                    </div>
                    <div className="relative px-3 py-3 sm:px-4">
                      {showVoiceDock && activeSrc ? (
                        <>
                          <div className="mb-3 flex items-center gap-2 sm:gap-3">
                            <motion.button
                              type="button"
                              onClick={() => {
                                togglePlayback(activeSrc, activeTitle);
                              }}
                              aria-label={status === "playing" ? "Pause audio narration" : "Play audio narration"}
                              whileHover={BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.whileHover}
                              whileTap={BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.whileTap}
                              transition={BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.transition}
                              onMouseEnter={() => {
                                if (status !== "playing") {
                                  playIconRef.current?.startAnimation();
                                }
                              }}
                              onMouseLeave={() => {
                                if (status !== "playing") {
                                  playIconRef.current?.stopAnimation();
                                }
                              }}
                              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-foreground text-background shadow-[0_12px_30px_-18px_rgba(0,0,0,0.9)]"
                            >
                              <AnimatePresence mode="popLayout" initial={false}>
                                <motion.div
                                  key={`dock-${status === "playing" ? "pause" : "play"}`}
                                  initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                  exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                                  transition={{
                                    type: "spring",
                                    duration: 0.3,
                                    bounce: 0,
                                  }}
                                  className="flex items-center justify-center"
                                >
                                  {status === "playing" ? <PauseIcon className="size-5" /> : <PlayIcon ref={playIconRef} size={18} className="translate-x-[1px]" />}
                                </motion.div>
                              </AnimatePresence>
                            </motion.button>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-base">
                                {activeTitle || "Voice version"}
                              </p>
                              <p className="truncate text-xs text-muted-foreground sm:text-sm">
                                {status === "playing" ? "Now playing" : "Paused"} • {formatBlogVoiceTime(currentTime)} / {formatBlogVoiceTime(duration)}
                              </p>
                            </div>

                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <motion.button
                                type="button"
                                onClick={() => {
                                  seekBy(-BLOG_VOICE_PLAYER_SEEK_SECONDS);
                                }}
                                aria-label="Go back 15 seconds"
                                whileHover={BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.whileHover}
                                whileTap={BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.whileTap}
                                transition={BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.transition}
                                onMouseEnter={() => {
                                  rotateCcwIconRef.current?.startAnimation();
                                }}
                                onMouseLeave={() => {
                                  rotateCcwIconRef.current?.stopAnimation();
                                }}
                                className="flex size-8 items-center justify-center rounded-2xl bg-black/5 text-muted-foreground transition hover:bg-black/8 hover:text-foreground sm:size-9 dark:bg-white/6 dark:hover:bg-white/10"
                              >
                                <RotateCCWIcon ref={rotateCcwIconRef} size={16} className="sm:size-[18px]" />
                              </motion.button>
                              <motion.button
                                type="button"
                                onClick={() => {
                                  seekBy(BLOG_VOICE_PLAYER_SEEK_SECONDS);
                                }}
                                aria-label="Skip forward 15 seconds"
                                whileHover={BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.whileHover}
                                whileTap={BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.whileTap}
                                transition={BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.transition}
                                onMouseEnter={() => {
                                  rotateCwIconRef.current?.startAnimation();
                                }}
                                onMouseLeave={() => {
                                  rotateCwIconRef.current?.stopAnimation();
                                }}
                                className="flex size-8 items-center justify-center rounded-2xl bg-black/5 text-muted-foreground transition hover:bg-black/8 hover:text-foreground sm:size-9 dark:bg-white/6 dark:hover:bg-white/10"
                              >
                                <RotateCWIcon ref={rotateCwIconRef} size={16} className="sm:size-[18px]" />
                              </motion.button>
                              <motion.button
                                type="button"
                                onClick={cyclePlaybackRate}
                                aria-label={`Change playback speed. Current speed ${playbackRate}x`}
                                whileHover={BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.whileHover}
                                whileTap={BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.whileTap}
                                transition={BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.transition}
                                className="relative inline-grid h-8 min-w-12 place-items-center rounded-2xl bg-black/5 px-2 py-1.5 text-xs font-semibold tracking-tight text-foreground transition hover:bg-black/8 sm:h-auto sm:min-w-0 sm:px-3 sm:py-2 sm:text-sm dark:bg-white/6 dark:hover:bg-white/10"
                              >
                                <span className="invisible">1.25x</span>
                                <span className="absolute inset-0 flex items-center justify-center">
                                  <AnimatePresence mode="popLayout" initial={false}>
                                    <motion.div
                                      key={`dock-rate-${playbackRate}`}
                                      initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                      exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                                      transition={{
                                        type: "spring",
                                        duration: 0.3,
                                        bounce: 0,
                                      }}
                                    >
                                      {playbackRate}x
                                    </motion.div>
                                  </AnimatePresence>
                                </span>
                              </motion.button>
                              <motion.button
                                type="button"
                                onClick={dismiss}
                                aria-label="Close audio dock"
                                whileHover={BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.whileHover}
                                whileTap={BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.whileTap}
                                transition={BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.transition}
                                className="flex size-8 items-center justify-center rounded-2xl bg-black/5 text-muted-foreground transition hover:bg-black/8 hover:text-foreground sm:size-9 dark:bg-white/6 dark:hover:bg-white/10"
                              >
                                <XIcon size={16} className="sm:size-[18px]" />
                              </motion.button>
                            </div>
                          </div>

                          <div className="relative h-4">
                            <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-black/8 dark:bg-white/10" />
                            <div
                              className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-foreground"
                              style={{ width: `${progressPercent}%` }}
                            />
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={1}
                              value={progressPercent}
                              onChange={(event) => {
                                seekToPercent(Number(event.target.value));
                              }}
                              aria-label="Narration progress"
                              disabled={duration <= 0}
                              className={cn(
                                "absolute inset-0 h-full w-full appearance-none bg-transparent",
                                "disabled:cursor-not-allowed",
                                "[&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-foreground",
                                "[&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground",
                                "[&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-transparent",
                              )}
                            />
                          </div>
                        </>
                      ) : summaryDock ? (
                        <motion.div
                          layout
                          role={isSummaryExpanded ? undefined : "button"}
                          tabIndex={isSummaryExpanded ? -1 : 0}
                          aria-expanded={isSummaryExpanded}
                          whileHover={!isSummaryExpanded ? BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.whileHover : undefined}
                          whileTap={!isSummaryExpanded ? BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.whileTap : undefined}
                          transition={BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.transition}
                          onClick={() => {
                            if (!isSummaryExpanded) {
                              setIsSummaryExpanded(true);
                            }
                          }}
                          onKeyDown={(event) => {
                            if (isSummaryExpanded) {
                              return;
                            }

                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setIsSummaryExpanded(true);
                            }
                          }}
                          className={cn(
                            "space-y-3 rounded-[20px] outline-none",
                            !isSummaryExpanded && "cursor-pointer",
                          )}
                        >
                          <div className="flex items-start gap-2 sm:gap-2">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-foreground text-background shadow-[0_12px_30px_-18px_rgba(0,0,0,0.9)]">
                              <SparklesIcon size={18} className="text-background" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-base">
                                {summaryDock.title ? `${summaryDock.title} summary` : "AI summary"}
                              </p>
                              <div className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
                                by
                                {getSummaryProviderIcon(summaryDock.provider)}
                                <span>{summaryDock.provider ?? "AI"}</span>
                              </div>
                            </div>

                            <motion.button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                dismiss();
                              }}
                              aria-label="Close AI summary dock"
                              whileHover={BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.whileHover}
                              whileTap={BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.whileTap}
                              transition={BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.transition}
                              className="flex size-8 shrink-0 items-center justify-center rounded-2xl bg-black/5 text-muted-foreground transition hover:bg-black/8 hover:text-foreground sm:size-9 dark:bg-white/6 dark:hover:bg-white/10"
                            >
                              <XIcon size={16} className="sm:size-[18px]" />
                            </motion.button>
                          </div>

                          <motion.div layout className="overflow-hidden">
                            <div className={cn("pr-1", isSummaryExpanded && "max-h-[min(52vh,22rem)] overflow-y-auto")}>
                              <AnimatePresence initial={false} mode="wait">
                                {isSummaryExpanded ? (
                                  <motion.div
                                    key="summary-expanded"
                                    layout
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="space-y-3 text-sm leading-6 sm:text-[15px] sm:leading-7"
                                  >
                                    {summaryDock.summary
                                      .split(/\n\s*\n/)
                                      .map((paragraph) => paragraph.trim())
                                      .filter(Boolean)
                                      .map((paragraph) => (
                                        <p key={paragraph}>{paragraph}</p>
                                      ))}
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key="summary-collapsed"
                                    layout
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 8 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="space-y-2"
                                  >
                                    <p className="line-clamp-2 text-sm leading-6 sm:text-[15px] sm:leading-7">
                                      {summaryDock.summary.replace(/\s+/g, " ").trim()}
                                    </p>
                                    <p className="text-xs font-medium tracking-tight text-muted-foreground">Tap to expand</p>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        </motion.div>
                      ) : null}
                    </div>
                  </LiquidGlass>
                </motion.div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>,
        document.body,
      );

  return (
    <BlogVoicePlayerContext value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="metadata"
        onDurationChange={(event) => {
          setDuration(event.currentTarget.duration || 0);
        }}
        onEnded={() => {
          setIsDockDismissed(false);
          clearTrack();
          setIsSummaryExpanded(false);
          setDockMode(null);
        }}
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration || 0);
        }}
        onPause={(event) => {
          if (isClearingTrackRef.current) {
            return;
          }

          setStatus(event.currentTarget.currentTime > 0 ? "paused" : "idle");
        }}
        onPlay={() => {
          setStatus("playing");
          setIsDockDismissed(false);
        }}
        onTimeUpdate={(event) => {
          setCurrentTime(event.currentTarget.currentTime);
        }}
      />
      {dock}
    </BlogVoicePlayerContext>
  );
}

export function useBlogVoicePlayer() {
  const context = useContext(BlogVoicePlayerContext);

  if (!context) {
    throw new Error("useBlogVoicePlayer must be used inside BlogVoicePlayerProvider.");
  }

  return context;
}
