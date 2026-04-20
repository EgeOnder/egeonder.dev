"use client";

import { ClaudeIcon } from "@/components/icons/claude";
import { T3ChatIcon } from "@/components/icons/t3-chat";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MessageSquareIcon } from "@/components/ui/message-square";
import { SparklesIcon } from "@/components/ui/sparkles";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { UploadIcon } from "@/components/ui/upload";
import { FacebookLogoIcon, LinkedinLogoIcon, MailboxIcon, OpenAiLogoIcon, TwitterLogoIcon, WhatsappLogoIcon } from "@phosphor-icons/react";
import { CheckIcon, ChevronDownIcon, ExternalLinkIcon, Link2Icon, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

import { useBlogVoicePlayer } from "@/components/blog-voice-player-provider";

const BLOG_OPEN_IN_PREFERENCE_STORAGE_KEY = "blog:open-in-preference";
const SHARE_COPIED_RESET_DELAY_MS = 2200;

const OPEN_IN_PROVIDERS = {
  ChatGPT: {
    createUrl: (prompt: string) =>
      `https://chatgpt.com/?${new URLSearchParams({
        hints: "search",
        prompt,
      })}`,
  },
  Claude: {
    createUrl: (q: string) =>
      `https://claude.ai/new?${new URLSearchParams({
        q,
      })}`,
  },
  "T3 Chat": {
    createUrl: (q: string) =>
      `https://t3.chat/new?${new URLSearchParams({
        q,
      })}`,
  },
} as const;

type OpenInOption = keyof typeof OPEN_IN_PROVIDERS;

type ShareTarget = "linkedin" | "twitter" | "facebook" | "whatsapp" | "email" | "copy";

type ShareAction = {
  id: ShareTarget;
  label: string;
  Icon: LucideIcon;
  iconClassName: string;
};

const SHARE_ACTIONS: ShareAction[] = [
  {
    id: "linkedin",
    label: "Share on LinkedIn",
    Icon: LinkedinLogoIcon,
    iconClassName: "bg-[#0a66c2]/15 text-[#0a66c2]",
  },
  {
    id: "twitter",
    label: "Share on Twitter",
    Icon: TwitterLogoIcon,
    iconClassName: "bg-[#1d9bf0]/15 text-[#1d9bf0]",
  },
  {
    id: "facebook",
    label: "Share on Facebook",
    Icon: FacebookLogoIcon,
    iconClassName: "bg-[#1877f2]/15 text-[#1877f2]",
  },
  {
    id: "whatsapp",
    label: "Share on WhatsApp",
    Icon: WhatsappLogoIcon,
    iconClassName: "bg-[#25d366]/15 text-[#25d366]",
  },
  {
    id: "email",
    label: "Share by email",
    Icon: MailboxIcon,
    iconClassName: "bg-muted text-muted-foreground",
  },
  {
    id: "copy",
    label: "Copy link",
    Icon: Link2Icon,
    iconClassName: "bg-muted text-muted-foreground",
  },
];

const isOpenInOption = (value: unknown): value is OpenInOption => typeof value === "string" && value in OPEN_IN_PROVIDERS;

const getOpenInIcon = (option: OpenInOption | null): ReactNode => {
  switch (option) {
    case "ChatGPT":
      return <OpenAiLogoIcon />;
    case "Claude":
      return <ClaudeIcon />;
    case "T3 Chat":
      return <T3ChatIcon width={14} height={14} />;
    default:
      return <MessageSquareIcon />;
  }
};

const getCurrentPostContext = () => {
  const titleFromHeading = document.querySelector("article h1")?.textContent?.trim();
  const title = titleFromHeading && titleFromHeading.length > 0 ? titleFromHeading : document.title;
  const canonicalHref = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
  const url = canonicalHref && /^https?:\/\//i.test(canonicalHref) ? canonicalHref : window.location.href;

  return {
    title,
    path: window.location.pathname,
    url,
  };
};

const normalizePromptText = (value: string) =>
  value
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

const getOpenInPrompt = (title: string, url: string) => {
  const normalizedTitle = normalizePromptText(title);
  return `Read this blog post titled "${normalizedTitle}": ${url}. I will chat with you about it and ask questions afterward.`;
};

const getOpenInUrl = (option: OpenInOption, prompt: string) => OPEN_IN_PROVIDERS[option].createUrl(prompt);

const getShareUrl = (target: Exclude<ShareTarget, "copy">, title: string, url: string) => {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  switch (target) {
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case "twitter":
      return `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
    case "whatsapp":
      return `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`;
    case "email":
      return `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`${title}\n\n${url}`)}`;
  }
};

const copyTextToClipboard = async (text: string): Promise<boolean> => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  textArea.style.top = "0";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  const successful = document.execCommand("copy");
  document.body.removeChild(textArea);

  return successful;
};

type ActionButtonsProps = {
  summary?: string | null;
  summaryProvider?: string | null;
  title: string;
};

export function ActionButtons({ summary, summaryProvider, title }: ActionButtonsProps) {
  const sparklesRef = useRef<React.ElementRef<typeof SparklesIcon>>(null);
  const uploadRef = useRef<React.ElementRef<typeof UploadIcon>>(null);
  const messageSquareRef = useRef<React.ElementRef<typeof MessageSquareIcon>>(null);
  const copyStatusTimeoutRef = useRef<number | null>(null);
  const [isOpenInMenuOpen, setIsOpenInMenuOpen] = useState(false);
  const [savedOpenInOption, setSavedOpenInOption] = useState<OpenInOption | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const { isSummaryDockOpen, showSummaryDock } = useBlogVoicePlayer();

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const savedPreference = window.localStorage.getItem(BLOG_OPEN_IN_PREFERENCE_STORAGE_KEY);
      setSavedOpenInOption(isOpenInOption(savedPreference) ? savedPreference : null);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (copyStatusTimeoutRef.current) {
        window.clearTimeout(copyStatusTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isSummaryDockOpen) {
      sparklesRef.current?.startAnimation();
      return;
    }

    sparklesRef.current?.stopAnimation();
  }, [isSummaryDockOpen]);

  const handleSummaryAction = useCallback(() => {
    const normalizedSummary = summary?.trim();

    if (!normalizedSummary) {
      toast("An AI summary is not attached to this post yet.", {
        icon: <SparklesIcon size={16} className="animate-pulse px-1" />,
      });
      return;
    }

    showSummaryDock({
      provider: summaryProvider,
      summary: normalizedSummary,
      title,
    });
  }, [showSummaryDock, summary, summaryProvider, title]);

  const handleOpenIn = (option: OpenInOption) => {
    const { title, url: postUrl } = getCurrentPostContext();
    const prompt = getOpenInPrompt(title, postUrl);
    const url = getOpenInUrl(option, prompt);
    window.localStorage.setItem(BLOG_OPEN_IN_PREFERENCE_STORAGE_KEY, option);
    setSavedOpenInOption(option);
    setIsOpenInMenuOpen(false);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handlePrimaryOpenInClick = () => {
    if (!savedOpenInOption) {
      setIsOpenInMenuOpen(true);
      return;
    }

    handleOpenIn(savedOpenInOption);
  };

  const handleShareDialogOpen = useCallback(() => {
    uploadRef.current?.startAnimation();
    setIsLinkCopied(false);
    setIsShareDialogOpen(true);
  }, []);

  const handleShareAction = useCallback(async (target: ShareTarget) => {
    const { title, url } = getCurrentPostContext();

    if (target === "copy") {
      const copied = await copyTextToClipboard(url);
      if (!copied) {
        return;
      }

      setIsLinkCopied(true);

      if (copyStatusTimeoutRef.current) {
        window.clearTimeout(copyStatusTimeoutRef.current);
      }

      copyStatusTimeoutRef.current = window.setTimeout(() => {
        setIsLinkCopied(false);
      }, SHARE_COPIED_RESET_DELAY_MS);
      return;
    }

    const shareUrl = getShareUrl(target, title, url);
    if (target === "email") {
      window.location.href = shareUrl;
      return;
    }

    window.open(shareUrl, "_blank", "noopener,noreferrer");
    setIsShareDialogOpen(false);
  }, []);

  return (
    <div className="flex items-center gap-4 flex-col md:flex-row w-full">
      <Button
        onClick={handleSummaryAction}
        onMouseEnter={() => {
          sparklesRef.current?.startAnimation();
        }}
        onMouseLeave={() => {
          if (!isSummaryDockOpen) {
            sparklesRef.current?.stopAnimation();
          }
        }}
        className="flex items-center gap-2 w-full md:w-auto"
      >
        <SparklesIcon ref={sparklesRef} /> Get AI summary
      </Button>
      <div className="w-full flex gap-2">
        <ButtonGroup className="flex-1 md:flex-none">
          <Button
            variant="outline"
            className="flex items-center gap-2 flex-1"
            onClick={handlePrimaryOpenInClick}
            onMouseEnter={() => {
              if (!savedOpenInOption) {
                messageSquareRef.current?.startAnimation();
              }
            }}
            onMouseLeave={() => {
              if (!savedOpenInOption) {
                messageSquareRef.current?.stopAnimation();
              }
            }}
          >
            {savedOpenInOption ? getOpenInIcon(savedOpenInOption) : <MessageSquareIcon ref={messageSquareRef} />}
            {savedOpenInOption ? `Open in ${savedOpenInOption}` : "Open in"}
          </Button>
          <DropdownMenu open={isOpenInMenuOpen} onOpenChange={setIsOpenInMenuOpen}>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="icon" aria-label="Open in options">
                  <ChevronDownIcon />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={handleOpenIn.bind(null, "ChatGPT")}>
                <OpenAiLogoIcon />
                ChatGPT
                <DropdownMenuShortcut>
                  <ExternalLinkIcon />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleOpenIn.bind(null, "Claude")}>
                <ClaudeIcon />
                Claude
                <DropdownMenuShortcut>
                  <ExternalLinkIcon />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleOpenIn.bind(null, "T3 Chat")}>
                <T3ChatIcon width={14} height={14} />
                T3 Chat
                <DropdownMenuShortcut>
                  <ExternalLinkIcon />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
        <div className="flex items-center justify-center gap-4">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Share this blog post"
                  onClick={handleShareDialogOpen}
                  onMouseEnter={() => {
                    uploadRef.current?.startAnimation();
                  }}
                  onMouseLeave={() => {
                    uploadRef.current?.stopAnimation();
                  }}
                >
                  <UploadIcon ref={uploadRef} />
                </Button>
              }
              type="button"
            />
            <TooltipContent>Share</TooltipContent>
          </Tooltip>
          <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
            <DialogContent>
              <DialogHeader className="mb-2 place-items-center">
                <DialogTitle>Share this blog post</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 flex flex-col">
                {SHARE_ACTIONS.map((action) => {
                  const isCopyAction = action.id === "copy";
                  const ActionIcon = isCopyAction && isLinkCopied ? CheckIcon : action.Icon;
                  const label = isCopyAction && isLinkCopied ? "Copied!" : action.label;

                  return (
                    <Button
                      key={action.id}
                      variant="outline"
                      type="button"
                      onClick={() => {
                        void handleShareAction(action.id);
                      }}
                    >
                      <ActionIcon className="size-4 sm:size-5" />
                      {label}
                    </Button>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
