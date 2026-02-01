export type VideoEmbedResult = {
  type: "youtube" | "vimeo" | "direct" | "unknown";
  embedUrl: string;
  videoId?: string;
};

export function getVideoEmbedUrl(url: string): VideoEmbedResult {
  if (!url) return { type: "unknown", embedUrl: "" };

  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&modestbranding=1`,
      videoId: youtubeMatch[1],
    };
  }

  const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return {
      type: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      videoId: vimeoMatch[1],
    };
  }

  if (url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) {
    return { type: "direct", embedUrl: url };
  }

  const driveRegex = /drive\.google\.com\/file\/d\/([^\/]+)/;
  const driveMatch = url.match(driveRegex);
  if (driveMatch) {
    return {
      type: "direct",
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
    };
  }

  const loomRegex = /loom\.com\/share\/([a-zA-Z0-9]+)/;
  const loomMatch = url.match(loomRegex);
  if (loomMatch) {
    return {
      type: "direct",
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`,
    };
  }

  return { type: "direct", embedUrl: url };
}

export function getVideoThumbnail(url: string): string | undefined {
  if (!url) return undefined;
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`;
  }
  return undefined;
}

export function formatVideoTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const VIDEO_PROGRESS_KEY = "video-progress";

export function saveVideoProgress(lessonId: string, currentTime: number, duration: number): void {
  if (!lessonId || !isFinite(currentTime) || !isFinite(duration)) return;
  try {
    const stored = localStorage.getItem(VIDEO_PROGRESS_KEY);
    const progress = stored ? JSON.parse(stored) : {};
    if (duration - currentTime > 5) {
      progress[lessonId] = { currentTime, duration, timestamp: Date.now() };
    } else {
      delete progress[lessonId];
    }
    localStorage.setItem(VIDEO_PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // ignore
  }
}

export function getSavedVideoProgress(lessonId: string): number | null {
  if (!lessonId) return null;
  try {
    const stored = localStorage.getItem(VIDEO_PROGRESS_KEY);
    if (!stored) return null;
    const progress = JSON.parse(stored);
    const saved = progress[lessonId];
    if (saved && saved.currentTime > 0) {
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      if (Date.now() - saved.timestamp < thirtyDays) {
        return saved.currentTime;
      }
    }
  } catch {
    // ignore
  }
  return null;
}
