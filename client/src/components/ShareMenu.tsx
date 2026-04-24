import React, { useState, useRef, useEffect } from "react";
import { Share2, X, Copy, Check, MessageCircle, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const tg = window.Telegram?.WebApp;

export const SHARE_ORIGIN = "https://jet-up.ai";

function openExternalUrl(url: string) {
  if (tg?.openLink) {
    tg.openLink(url);
  } else {
    window.open(url, "_blank");
  }
}

function openTelegramUrl(url: string) {
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(url);
  } else {
    window.open(url, "_blank");
  }
}

interface ShareMenuProps {
  title?: string;
  text?: string;
  url?: string;
  shareBody?: string;
  shareUrl?: string;
  className?: string;
  testId?: string;
}

const LABELS: Record<string, { share: string; telegram: string; whatsapp: string; copy: string; copied: string }> = {
  de: { share: "Teilen", telegram: "Telegram", whatsapp: "WhatsApp", copy: "Link kopieren", copied: "Kopiert!" },
  en: { share: "Share", telegram: "Telegram", whatsapp: "WhatsApp", copy: "Copy link", copied: "Copied!" },
  ru: { share: "Поделиться", telegram: "Telegram", whatsapp: "WhatsApp", copy: "Скопировать", copied: "Скопировано!" },
};

export default function ShareMenu({ title, text, url, shareBody, shareUrl, className = "", testId }: ShareMenuProps) {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const labels = LABELS[language] || LABELS.de;

  const resolvedShareUrl = shareUrl || url || window.location.href;
  const resolvedBody = shareBody || `${title || ""}\n\n${text || ""}`;
  const resolvedBodyWithUrl = `${resolvedBody}\n\n👉 ${resolvedShareUrl}`;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [open]);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: title || "", text: resolvedBody, url: resolvedShareUrl });
      } catch {}
    }
    setOpen(false);
  };

  const handleTelegram = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(resolvedShareUrl)}&text=${encodeURIComponent(resolvedBody)}`;
    openTelegramUrl(tgUrl);
    setOpen(false);
  };

  const handleWhatsApp = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(resolvedBodyWithUrl)}`;
    openExternalUrl(waUrl);
    setOpen(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resolvedShareUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 1200);
    } catch {
      setOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors active:scale-95"
        data-testid={testId || "button-share"}
        aria-label={labels.share}
      >
        {open ? <X size={14} className="text-gray-500" /> : <Share2 size={14} className="text-gray-500" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 z-50 bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-gray-100 py-1.5 min-w-[180px]"
          >
            <button
              onClick={handleTelegram}
              className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
              data-testid="share-telegram"
            >
              <Send size={15} className="text-[#2AABEE]" />
              <span className="text-[13px] font-medium text-gray-700">{labels.telegram}</span>
            </button>

            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
              data-testid="share-whatsapp"
            >
              <MessageCircle size={15} className="text-[#25D366]" />
              <span className="text-[13px] font-medium text-gray-700">{labels.whatsapp}</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
              data-testid="share-copy"
            >
              {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} className="text-gray-400" />}
              <span className="text-[13px] font-medium text-gray-700">{copied ? labels.copied : labels.copy}</span>
            </button>

            {typeof navigator.share === "function" && (
              <>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={handleNativeShare}
                  className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                  data-testid="share-native"
                >
                  <Share2 size={15} className="text-purple-500" />
                  <span className="text-[13px] font-medium text-gray-700">{labels.share}…</span>
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
