import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ExternalLink,
  MessageCircle,
  Play,
  Video,
  Youtube,
} from "lucide-react";
import { useAppNavigation } from "@/hooks/use-app-navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import ShareMenu, { SHARE_ORIGIN } from "@/components/ShareMenu";

type CategoryTab = "all" | "bonuses" | "strategies" | "partner-program" | "getting-started";

interface Tutorial {
  id: number;
  title: string;
  description: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  category: string;
  topicTags: string[];
  language: string;
  sortOrder: number;
  isActive: boolean;
}

function YouTubeShortsEmbed({ videoId, title }: { videoId: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  if (!playing) {
    return (
      <button
        onClick={() => setPlaying(true)}
        className="relative w-full rounded-xl overflow-hidden bg-black group"
        style={{ aspectRatio: "9/16", maxHeight: "400px" }}
        data-testid={`video-thumb-${videoId}`}
      >
        <img
          src={`https://img.youtube.com/vi/${videoId}/0.jpg`}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <Play size={20} className="text-purple-600 ml-0.5" />
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ aspectRatio: "9/16", maxHeight: "400px" }}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1&modestbranding=1&disablekb=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
        data-testid={`video-embed-${videoId}`}
      />
    </div>
  );
}

const TutorialsPage: React.FC = () => {
  const [, setLocation] = useAppNavigation();
  const { language, t } = useLanguage();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CategoryTab>("all");

  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        const res = await fetch(`/api/tutorials?language=${language}`);
        if (res.ok) {
          setTutorials(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch tutorials:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTutorials();
  }, [language]);

  useEffect(() => {
    if (loading || tutorials.length === 0) return;
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
    }
  }, [loading, tutorials]);

  const categoryTabs: { key: CategoryTab; label: string }[] = [
    { key: "all", label: t("tutorials.all") },
    { key: "bonuses", label: t("tutorials.bonuses") },
    { key: "strategies", label: t("tutorials.strategies") },
    { key: "partner-program", label: t("tutorials.partnerProgram") },
    { key: "getting-started", label: t("tutorials.gettingStarted") },
  ];

  const filtered = activeCategory === "all"
    ? tutorials
    : tutorials.filter((tut) => tut.category === activeCategory);

  const hubShareUrl = `${SHARE_ORIGIN}/tutorials`;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="purple-top-bar" />
      <div className="flex items-center gap-3 px-5 pt-4 pb-2 flex-shrink-0">
        <button
          onClick={() => setLocation("/")}
          className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
          data-testid="button-back-tutorials"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h1 className="text-[17px] font-extrabold text-gray-900 flex-1 tracking-tight">
          {t("tutorials.title")}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
            {t("tutorials.subtitle")}
          </p>

          <a
            href="https://www.youtube.com/@JetUP_official"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] active:scale-[0.98] transition-transform"
            data-testid="link-webinar-youtube"
          >
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <Youtube size={20} className="text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-gray-900 leading-tight">{t("tutorials.webinarYoutube")}</p>
              <p className="text-[11px] font-normal text-gray-500 mt-1 leading-snug">{t("tutorials.webinarYoutubeSubtitle")}</p>
            </div>
            <ExternalLink size={16} className="text-gray-300 flex-shrink-0" />
          </a>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categoryTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveCategory(tab.key)}
                className={`px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all whitespace-nowrap ${
                  activeCategory === tab.key
                    ? "jetup-gradient text-white btn-glow"
                    : "bg-gray-100 text-gray-500"
                }`}
                data-testid={`tab-tutorials-${tab.key}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12" data-testid="tutorials-empty">
              <Video size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-[14px] text-gray-400 font-medium">{t("tutorials.empty")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((tutorial) => (
                <div
                  key={tutorial.id}
                  id={`video-${tutorial.id}`}
                  className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
                  data-testid={`tutorial-${tutorial.id}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-[14px] font-bold text-gray-900 leading-tight flex-1">
                      {tutorial.title}
                    </h3>
                    <ShareMenu
                      title={tutorial.title}
                      text={tutorial.description || tutorial.title}
                      shareUrl={`${hubShareUrl}#video-${tutorial.id}`}
                      testId={`share-tutorial-${tutorial.id}`}
                    />
                  </div>
                  {tutorial.description && (
                    <p className="text-[12px] text-gray-500 mb-3 leading-snug font-medium">
                      {tutorial.description}
                    </p>
                  )}
                  <YouTubeShortsEmbed videoId={tutorial.youtubeVideoId} title={tutorial.title} />
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2.5 pt-2">
            <button
              onClick={() => setLocation("/")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 text-[13px] font-semibold text-gray-600 active:scale-[0.97] transition-transform"
              data-testid="button-back-hub-tutorials"
            >
              <ArrowLeft size={16} />
              {t("common.backToHub")}
            </button>
            <button
              onClick={() => setLocation("/maria")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl jetup-gradient-glow text-[13px] font-semibold text-white active:scale-[0.97] transition-transform"
              data-testid="button-frag-maria-tutorials"
            >
              <MessageCircle size={16} />
              {t("common.askMaria")}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TutorialsPage;
