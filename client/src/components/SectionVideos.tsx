import React, { useState, useEffect } from "react";
import { Play } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import ShareMenu, { SHARE_ORIGIN } from "@/components/ShareMenu";

interface Tutorial {
  id: number;
  title: string;
  description: string;
  youtubeVideoId: string;
  category: string;
  topicTags: string[];
  language: string;
}

function YouTubeShortsEmbed({ videoId, title }: { videoId: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  if (!playing) {
    return (
      <button
        onClick={() => setPlaying(true)}
        className="relative w-full rounded-xl overflow-hidden bg-black group"
        style={{ aspectRatio: "9/16", maxHeight: "320px" }}
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
    <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ aspectRatio: "9/16", maxHeight: "320px" }}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1&modestbranding=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
        data-testid={`video-embed-${videoId}`}
      />
    </div>
  );
}

interface SectionVideosProps {
  topicTag: string;
  hubPath?: string;
}

export default function SectionVideos({ topicTag, hubPath }: SectionVideosProps) {
  const { language } = useLanguage();
  const [videos, setVideos] = useState<Tutorial[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch(`/api/tutorials?language=${language}&topicTag=${encodeURIComponent(topicTag)}`);
        if (res.ok) {
          const data = await res.json();
          setVideos(data);
        }
      } catch (err) {
        console.error("Failed to fetch section videos:", err);
      }
    };
    fetchVideos();
  }, [language, topicTag]);

  if (videos.length === 0) return null;

  const shareUrl = `${SHARE_ORIGIN}${hubPath || "/tutorials"}`;

  return (
    <div className="mt-3 space-y-3" data-testid={`section-videos-${topicTag}`}>
      {videos.map((video) => (
        <div key={video.id} id={`video-${video.id}`} className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[12px] font-semibold text-purple-600 flex-1">{video.title}</p>
            <ShareMenu
              title={video.title}
              text={video.description || video.title}
              shareUrl={`${SHARE_ORIGIN}/tutorials#video-${video.id}`}
              testId={`share-section-video-${video.id}`}
            />
          </div>
          <YouTubeShortsEmbed videoId={video.youtubeVideoId} title={video.title} />
        </div>
      ))}
    </div>
  );
}
