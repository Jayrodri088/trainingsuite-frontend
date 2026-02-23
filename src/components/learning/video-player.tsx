"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Video } from "lucide-react";
import { getVideoEmbedUrl, getVideoThumbnail, saveVideoProgress, getSavedVideoProgress } from "@/lib/utils/video";
import type { Lesson } from "@/types";
import { T } from "@/components/t";

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        config: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: { onStateChange?: (event: { data: number }) => void };
        }
      ) => unknown;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export function LearningVideoPlayer({
  lesson,
  onVideoEnd,
  lessonId,
}: {
  lesson: Lesson | null;
  onVideoEnd?: () => void;
  lessonId?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubePlayerRef = useRef<unknown>(null);
  const [ytApiLoaded, setYtApiLoaded] = useState(false);
  const [videoPoster, setVideoPoster] = useState<string | undefined>(undefined);
  const lastSaveRef = useRef(0);

  // Derive video poster from lesson URL
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (lesson?.videoUrl) {
      setVideoPoster(getVideoThumbnail(lesson.videoUrl));
    } else {
      setVideoPoster(undefined);
    }
  }, [lessonId, lesson?.videoUrl]);

  // Load YouTube API script
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const first = document.getElementsByTagName("script")[0];
      first?.parentNode?.insertBefore(tag, first);
      window.onYouTubeIframeAPIReady = () => setYtApiLoaded(true);
    } else {
      setYtApiLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!lesson?.videoUrl || !ytApiLoaded) return;
    const { type, embedUrl } = getVideoEmbedUrl(lesson.videoUrl);
    if (type !== "youtube") return;
    const videoIdMatch = embedUrl.match(/embed\/([^?]+)/);
    if (!videoIdMatch) return;
    const videoId = videoIdMatch[1];
    const containerId = `youtube-player-${lessonId || "default"}`;
    youtubePlayerRef.current = null;
    const t = setTimeout(() => {
      if (!document.getElementById(containerId) || !window.YT?.Player) return;
      youtubePlayerRef.current = new window.YT!.Player(containerId, {
        videoId,
        playerVars: { rel: 0, modestbranding: 1, autoplay: 1, controls: 1, fs: 1 },
        events: {
          onStateChange: (event: { data: number }) => {
            if (event.data === 0 && onVideoEnd) onVideoEnd();
          },
        },
      });
    }, 100);
    return () => {
      clearTimeout(t);
      youtubePlayerRef.current = null;
    };
  }, [lesson?.videoUrl, ytApiLoaded, onVideoEnd, lessonId]);

  const handleVideoEnd = useCallback(() => {
    if (onVideoEnd) onVideoEnd();
  }, [onVideoEnd]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && lessonId) {
      const v = videoRef.current;
      if (v.currentTime - lastSaveRef.current >= 5) {
        lastSaveRef.current = v.currentTime;
        saveVideoProgress(lessonId, v.currentTime, v.duration);
      }
    }
  }, [lessonId]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current && lessonId) {
      const v = videoRef.current;
      const saved = getSavedVideoProgress(lessonId);
      if (saved != null && saved < v.duration - 5) {
        v.currentTime = saved;
      }
    }
  }, [lessonId]);

  const handleLoadedData = useCallback(() => {
    if (!videoRef.current || videoPoster) return;
    const v = videoRef.current;
    const embedUrl = lesson?.videoUrl ? getVideoEmbedUrl(lesson.videoUrl).embedUrl : "";
    const temp = document.createElement("video");
    temp.crossOrigin = "anonymous";
    temp.src = v.currentSrc || embedUrl;
    temp.currentTime = Math.min(1, v.duration * 0.1);
    temp.addEventListener(
      "seeked",
      () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = temp.videoWidth || 1280;
          canvas.height = temp.videoHeight || 720;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(temp, 0, 0, canvas.width, canvas.height);
            setVideoPoster(canvas.toDataURL("image/jpeg", 0.8));
          }
        } catch {
          // ignore
        }
        temp.remove();
      },
      { once: true }
    );
    temp.addEventListener("error", () => temp.remove(), { once: true });
  }, [lesson?.videoUrl, videoPoster]);

  if (!lesson) {
    return (
      <div className="aspect-video bg-gray-800 flex items-center justify-center rounded-[12px]">
        <p className="text-gray-400 font-sans"><T>Select a lesson to start learning</T></p>
      </div>
    );
  }

  if (!lesson.videoUrl) {
    return (
      <div className="aspect-video bg-gray-800 flex items-center justify-center rounded-[12px]">
        <div className="text-center">
          <Video className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 font-sans"><T>No video for this lesson</T></p>
          {lesson.type === "text" && (
            <p className="text-gray-500 text-sm mt-2 font-sans"><T>This is a text-based lesson. See content below.</T></p>
          )}
        </div>
      </div>
    );
  }

  const { type, embedUrl } = getVideoEmbedUrl(lesson.videoUrl);

  if (type === "youtube") {
    const containerId = `youtube-player-${lessonId || "default"}`;
    return (
      <div className="aspect-video bg-gray-900 rounded-[12px] overflow-hidden">
        <div id={containerId} className="w-full h-full" />
      </div>
    );
  }

  if (type === "vimeo") {
    return (
      <div className="aspect-video bg-gray-900 rounded-[12px] overflow-hidden">
        <iframe
          src={`${embedUrl}?api=1&autoplay=1`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title={lesson.title}
        />
      </div>
    );
  }

  if (embedUrl.includes("drive.google.com") || embedUrl.includes("loom.com")) {
    return (
      <div className="aspect-video bg-gray-900 rounded-[12px] overflow-hidden">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title={lesson.title}
        />
      </div>
    );
  }

  return (
    <div className="aspect-video bg-gray-900 relative group rounded-[12px] overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        controlsList="nodownload"
        playsInline
        autoPlay
        onEnded={handleVideoEnd}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onLoadedData={handleLoadedData}
        onPause={() => {
          if (lessonId && videoRef.current) {
            saveVideoProgress(lessonId, videoRef.current.currentTime, videoRef.current.duration);
          }
        }}
        poster={videoPoster}
      >
        <source src={embedUrl} type="video/mp4" />
        <source src={embedUrl} type="video/webm" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
