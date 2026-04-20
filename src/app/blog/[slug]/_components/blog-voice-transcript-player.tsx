"use client";

import { PauseIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

import {
  BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS,
  BLOG_VOICE_PLAYER_SEEK_SECONDS,
  formatBlogVoiceTime,
  useBlogVoicePlayer,
} from "@/components/blog-voice-player-provider";
import { PlayIcon, type PlayIconHandle } from "@/components/ui/play";
import { RotateCCWIcon, type RotateCCWIconHandle } from "@/components/ui/rotate-ccw";
import { RotateCWIcon, type RotateCWIconHandle } from "@/components/ui/rotate-cw";
import { cn } from "@/lib/utils";

type BlogVoiceTranscriptPlayerProps = {
  src?: string | null;
  title: string;
};

export function BlogVoiceTranscriptPlayer({ src, title }: BlogVoiceTranscriptPlayerProps) {
  const inlinePlayerRef = useRef<HTMLDivElement>(null);
  const playIconRef = useRef<PlayIconHandle>(null);
  const rotateCcwIconRef = useRef<RotateCCWIconHandle>(null);
  const rotateCwIconRef = useRef<RotateCWIconHandle>(null);
  const [metadata, setMetadata] = useState<{ duration: number; src: string | null }>({
    duration: 0,
    src: null,
  });
  const {
    activeSrc,
    currentTime,
    duration,
    playbackRate,
    status,
    cyclePlaybackRate,
    seekBy,
    seekToPercent,
    setInlinePlayerElement,
    togglePlayback,
  } = useBlogVoicePlayer();

  const hasAudio = Boolean(src);
  const isCurrentTrack = Boolean(src) && activeSrc === src;
  const displayTitle = title.trim() || "Voice version";
  const displayCurrentTime = isCurrentTrack ? currentTime : 0;
  const displayDuration = isCurrentTrack && duration > 0 ? duration : metadata.src === (src ?? null) ? metadata.duration : 0;
  const displayStatus = isCurrentTrack ? status : "idle";
  const progressPercent = isCurrentTrack && duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    if (!isCurrentTrack) {
      setInlinePlayerElement(null);
      return;
    }

    setInlinePlayerElement(inlinePlayerRef.current);

    return () => {
      setInlinePlayerElement(null);
    };
  }, [isCurrentTrack, setInlinePlayerElement]);

  const handleTogglePlayback = () => {
    if (!hasAudio) {
      return;
    }

    togglePlayback(src, title);
  };

  const handleProgressChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isCurrentTrack || duration <= 0) {
      return;
    }

    seekToPercent(Number(event.target.value));
  };

  return (
    <div ref={inlinePlayerRef} className="relative w-full overflow-hidden rounded-radius">
      <audio
        key={src ?? "no-audio"}
        src={src ?? undefined}
        preload="metadata"
        onLoadedMetadata={(event) => {
          setMetadata({
            duration: event.currentTarget.duration || 0,
            src: src ?? null,
          });
        }}
      />

      <div className="relative mb-3 h-5">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-black/8 dark:bg-white/10" />
        <div
          className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-l-full bg-foreground"
          style={{ width: `${progressPercent}%` }}
        />
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={progressPercent}
          onChange={handleProgressChange}
          aria-label="Narration progress"
          disabled={!isCurrentTrack || duration <= 0}
          className={cn(
            "absolute inset-0 h-full w-full appearance-none bg-transparent",
            "disabled:cursor-not-allowed",
            "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-foreground",
            "[&::-webkit-slider-thumb]:mt-[-6px] [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground",
            "[&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-transparent",
          )}
        />
      </div>

      <div className="relative flex items-center gap-3">
        <motion.button
          type="button"
          onClick={handleTogglePlayback}
          aria-label={hasAudio ? (displayStatus === "playing" ? "Pause audio narration" : "Play audio narration") : "Audio narration unavailable"}
          disabled={!hasAudio}
          whileHover={!hasAudio ? undefined : BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.whileHover}
          whileTap={!hasAudio ? undefined : BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.whileTap}
          transition={BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.transition}
          onMouseEnter={() => {
            if (displayStatus !== "playing") {
              playIconRef.current?.startAnimation();
            }
          }}
          onMouseLeave={() => {
            if (displayStatus !== "playing") {
              playIconRef.current?.stopAnimation();
            }
          }}
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition hover:bg-foreground/90 disabled:cursor-not-allowed disabled:bg-foreground/30 disabled:text-background/80 disabled:shadow-none"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={displayStatus === "playing" ? "pause" : "play"}
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
              {displayStatus === "playing" ? <PauseIcon className="size-5" /> : <PlayIcon ref={playIconRef} size={20} className="translate-x-[1px]" />}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        <div className="hidden h-9 w-px shrink-0 bg-black/8 sm:block dark:bg-white/10" />

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold tracking-tight text-foreground">
            {displayTitle}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {hasAudio
              ? `${displayStatus === "playing" ? "Now playing" : displayStatus === "paused" ? "Paused" : "Ready to play"} • ${formatBlogVoiceTime(displayCurrentTime)} / ${formatBlogVoiceTime(displayDuration)}`
              : "Audio file not attached yet"}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <motion.button
            type="button"
            onClick={() => {
              seekBy(-BLOG_VOICE_PLAYER_SEEK_SECONDS);
            }}
            aria-label="Go back 15 seconds"
            disabled={!isCurrentTrack}
            whileHover={!isCurrentTrack ? undefined : BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.whileHover}
            whileTap={!isCurrentTrack ? undefined : BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.whileTap}
            transition={BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.transition}
            onMouseEnter={() => {
              rotateCcwIconRef.current?.startAnimation();
            }}
            onMouseLeave={() => {
              rotateCcwIconRef.current?.stopAnimation();
            }}
            className="flex size-9 items-center justify-center rounded-2xl bg-black/5 text-muted-foreground transition hover:bg-black/8 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white/6 dark:hover:bg-white/10"
          >
            <RotateCCWIcon ref={rotateCcwIconRef} size={18} />
          </motion.button>
          <motion.button
            type="button"
            onClick={() => {
              seekBy(BLOG_VOICE_PLAYER_SEEK_SECONDS);
            }}
            aria-label="Skip forward 15 seconds"
            disabled={!isCurrentTrack}
            whileHover={!isCurrentTrack ? undefined : BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.whileHover}
            whileTap={!isCurrentTrack ? undefined : BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.whileTap}
            transition={BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.transition}
            onMouseEnter={() => {
              rotateCwIconRef.current?.startAnimation();
            }}
            onMouseLeave={() => {
              rotateCwIconRef.current?.stopAnimation();
            }}
            className="flex size-9 items-center justify-center rounded-2xl bg-black/5 text-muted-foreground transition hover:bg-black/8 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white/6 dark:hover:bg-white/10"
          >
            <RotateCWIcon ref={rotateCwIconRef} size={18} />
          </motion.button>
          <motion.button
            type="button"
            onClick={cyclePlaybackRate}
            aria-label={`Change playback speed. Current speed ${playbackRate}x`}
            disabled={!hasAudio}
            whileHover={!hasAudio ? undefined : BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.whileHover}
            whileTap={!hasAudio ? undefined : BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.whileTap}
            transition={BLOG_VOICE_PLAYER_BUTTON_MOTION_PROPS.transition}
            className="relative inline-grid place-items-center rounded-2xl bg-black/5 px-2.5 py-1.5 text-sm font-semibold tracking-tight text-foreground transition hover:bg-black/8 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white/6 dark:hover:bg-white/10"
          >
            <span className="invisible">1.25x</span>
            <span className="absolute inset-0 flex items-center justify-center">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={playbackRate}
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
        </div>
      </div>
    </div>
  );
}
