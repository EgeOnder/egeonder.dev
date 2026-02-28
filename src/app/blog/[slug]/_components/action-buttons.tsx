"use client";

import { ClaudeIcon } from "@/components/icons/claude";
import { DeepSeekIcon } from "@/components/icons/deepseek";
import { GeminiIcon } from "@/components/icons/gemini";
import { T3ChatIcon } from "@/components/icons/t3-chat";
import { BookmarkIcon } from "@/components/ui/bookmark";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MessageSquareIcon } from "@/components/ui/message-square";
import { SparklesIcon } from "@/components/ui/sparkles";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { UploadIcon } from "@/components/ui/upload";
import { cn } from "@/lib/utils";
import { FacebookLogoIcon, LinkedinLogoIcon, MailboxIcon, OpenAiLogoIcon, TwitterLogoIcon, WhatsappLogoIcon } from "@phosphor-icons/react";
import { CheckIcon, ChevronDownIcon, ExternalLinkIcon, Link2Icon, type LucideIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

const BLOG_BOOKMARKS_STORAGE_KEY = "blog:bookmarks";
const TOOLTIP_RESET_DELAY_MS = 2000;
const OPEN_IN_PROMPT_CONTENT_MAX_CHARS = 12000;
const SHARE_COPIED_RESET_DELAY_MS = 2200;

const OPEN_IN_BASE_URLS = {
  ChatGPT: "https://chat.openai.com/",
  Gemini: "https://gemini.google.com/app",
  Claude: "https://claude.ai/new",
  DeepSeek: "https://chat.deepseek.com/",
  "T3 Chat": "https://t3.chat/",
} as const;

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

type StoredBlogBookmark = {
  title: string;
  path: string;
  url: string;
  createdAt: string;
};

const isStoredBlogBookmark = (value: unknown): value is StoredBlogBookmark => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return typeof candidate.title === "string" && typeof candidate.path === "string" && typeof candidate.url === "string" && typeof candidate.createdAt === "string";
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

const getCurrentPostBodyText = () => {
  const article = document.querySelector("article");
  if (!article) {
    return "";
  }

  const articleClone = article.cloneNode(true) as HTMLElement;
  articleClone.querySelectorAll("header, footer, script, style, noscript").forEach((element) => {
    element.remove();
  });

  return normalizePromptText(articleClone.textContent ?? "");
};

const getOpenInPrompt = (title: string, content: string) => {
  const normalizedTitle = normalizePromptText(title);
  const normalizedContent = normalizePromptText(content);
  const contentToSend =
    normalizedContent.length > OPEN_IN_PROMPT_CONTENT_MAX_CHARS
      ? `${normalizedContent.slice(0, OPEN_IN_PROMPT_CONTENT_MAX_CHARS)}\n\n[The blog content was truncated due to URL length limits.]`
      : normalizedContent;

  return `Here is a blog post titled "${normalizedTitle}". I will ask questions to you about this blog post. Read the post comprehensively and be prepared to answer any questions about this post. Respond with "I understand, you can ask me any question about this blog post.":\n\n${contentToSend}`;
};

const getOpenInUrl = (option: keyof typeof OPEN_IN_BASE_URLS, prompt: string) => {
  const baseUrl = OPEN_IN_BASE_URLS[option];
  const encodedPrompt = encodeURIComponent(prompt);
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}q=${encodedPrompt}`;
};

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

const readBookmarks = (): StoredBlogBookmark[] => {
  const value = window.localStorage.getItem(BLOG_BOOKMARKS_STORAGE_KEY);
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isStoredBlogBookmark);
  } catch {
    return [];
  }
};

const saveBookmarks = (bookmarks: StoredBlogBookmark[]) => {
  window.localStorage.setItem(BLOG_BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
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

export function ActionButtons() {
  const sparklesRef = useRef<React.ElementRef<typeof SparklesIcon>>(null);
  const uploadRef = useRef<React.ElementRef<typeof UploadIcon>>(null);
  const bookmarkRef = useRef<React.ElementRef<typeof BookmarkIcon>>(null);
  const messageSquareRef = useRef<React.ElementRef<typeof MessageSquareIcon>>(null);
  const copyStatusTimeoutRef = useRef<number | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [bookmarkTooltipText, setBookmarkTooltipText] = useState("Bookmark");
  const [isBookmarked, setIsBookmarked] = useState(false);

  type OpenInOption = "ChatGPT" | "Gemini" | "Claude" | "DeepSeek" | "T3 Chat";

  useEffect(() => {
    if (bookmarkTooltipText === "Bookmark") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setBookmarkTooltipText("Bookmark");
    }, TOOLTIP_RESET_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [bookmarkTooltipText]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const { path } = getCurrentPostContext();
      const bookmarks = readBookmarks();
      setIsBookmarked(bookmarks.some((bookmark) => bookmark.path === path));
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

  const handleComingSoonAction = useCallback(() => {
    toast("This feature is coming soon!", {
      icon: <SparklesIcon size={16} className="animate-pulse px-1" />,
    });
  }, []);

  const handleOpenIn = (option: OpenInOption) => {
    return handleComingSoonAction();

    const { title } = getCurrentPostContext();
    const postBodyText = getCurrentPostBodyText();
    const prompt = getOpenInPrompt(title, postBodyText);
    const url = getOpenInUrl(option, prompt);
    window.open(url, "_blank", "noopener,noreferrer");
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

  const handleBookmarkToggle = useCallback(() => {
    bookmarkRef.current?.startAnimation();

    const { title, path, url } = getCurrentPostContext();
    const bookmarks = readBookmarks();
    const alreadyBookmarked = bookmarks.some((bookmark) => bookmark.path === path);

    if (alreadyBookmarked) {
      const updatedBookmarks = bookmarks.filter((bookmark) => bookmark.path !== path);
      saveBookmarks(updatedBookmarks);
      setIsBookmarked(false);
      setBookmarkTooltipText("Removed bookmark");
      return;
    }

    const nextBookmark: StoredBlogBookmark = {
      title,
      path,
      url,
      createdAt: new Date().toISOString(),
    };

    saveBookmarks([nextBookmark, ...bookmarks.filter((bookmark) => bookmark.path !== path)]);
    setIsBookmarked(true);
    setBookmarkTooltipText("Bookmarked");
  }, []);

  return (
    <div className="flex items-center gap-4 flex-col md:flex-row">
      <Button
        onClick={handleComingSoonAction}
        onMouseEnter={() => {
          sparklesRef.current?.startAnimation();
        }}
        onMouseLeave={() => {
          sparklesRef.current?.stopAnimation();
        }}
        className="flex items-center gap-2 w-full md:w-auto"
      >
        <SparklesIcon ref={sparklesRef} /> Get AI summary
      </Button>
      <ButtonGroup className="w-full md:w-auto">
        <Button
          variant="outline"
          className="flex items-center gap-2 flex-1"
          onMouseEnter={() => {
            messageSquareRef.current?.startAnimation();
          }}
          onMouseLeave={() => {
            messageSquareRef.current?.stopAnimation();
          }}
        >
          <MessageSquareIcon ref={messageSquareRef} />
          Open in
        </Button>
        <DropdownMenu>
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
            <DropdownMenuItem onClick={handleOpenIn.bind(null, "Gemini")}>
              <GeminiIcon />
              Gemini
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
            <DropdownMenuItem onClick={handleOpenIn.bind(null, "DeepSeek")}>
              <DeepSeekIcon />
              DeepSeek
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
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this post"}
                aria-pressed={isBookmarked}
                onClick={handleComingSoonAction}
                className={cn(
                  "transition-colors",
                  isBookmarked && "bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 hover:text-amber-800 dark:bg-amber-400/20 dark:text-amber-200 dark:hover:bg-amber-400/30",
                )}
                onMouseEnter={() => {
                  bookmarkRef.current?.startAnimation();
                }}
                onMouseLeave={() => {
                  bookmarkRef.current?.stopAnimation();
                }}
              >
                <BookmarkIcon ref={bookmarkRef} />
              </Button>
            }
            type="button"
          />
          <TooltipContent>{bookmarkTooltipText}</TooltipContent>
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
  );
}
