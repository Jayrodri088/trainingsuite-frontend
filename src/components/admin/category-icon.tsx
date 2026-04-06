"use client";

import type { LucideIcon } from "lucide-react";
import {
  FolderTree,
  Home,
  Megaphone,
  Award,
  Users,
  User,
  Star,
  BookOpen,
  Globe,
  Heart,
  Zap,
  Target,
  Briefcase,
  GraduationCap,
  Lightbulb,
  LayoutGrid,
  Layers,
  Video,
  Mic,
  Radio,
  Sparkles,
  Shield,
  Flag,
  MapPin,
  Calendar,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Explicit map so bundlers always include these icons (namespace import from lucide-react
 * is unreliable with tree-shaking — icon names were rendering as plain text).
 */
const LUCIDE_BY_SLUG: Record<string, LucideIcon> = {
  home: Home,
  house: Home,
  megaphone: Megaphone,
  award: Award,
  users: Users,
  user: User,
  star: Star,
  "book-open": BookOpen,
  bookopen: BookOpen,
  book: BookOpen,
  globe: Globe,
  world: Globe,
  heart: Heart,
  zap: Zap,
  target: Target,
  briefcase: Briefcase,
  graduation: GraduationCap,
  "graduation-cap": GraduationCap,
  lightbulb: Lightbulb,
  layout: LayoutGrid,
  grid: LayoutGrid,
  layers: Layers,
  video: Video,
  mic: Mic,
  radio: Radio,
  sparkles: Sparkles,
  shield: Shield,
  flag: Flag,
  "map-pin": MapPin,
  mappin: MapPin,
  calendar: Calendar,
  image: ImageIcon,
  photo: ImageIcon,
  folder: FolderTree,
  "folder-tree": FolderTree,
  foldertree: FolderTree,
};

/** Unique Lucide slugs for admin search + grid (labels for display). */
export const CATEGORY_LUCIDE_OPTIONS: { slug: string; label: string }[] = [
  { slug: "home", label: "Home" },
  { slug: "megaphone", label: "Megaphone" },
  { slug: "award", label: "Award" },
  { slug: "users", label: "Users" },
  { slug: "user", label: "User" },
  { slug: "star", label: "Star" },
  { slug: "book-open", label: "Book" },
  { slug: "globe", label: "Globe" },
  { slug: "heart", label: "Heart" },
  { slug: "zap", label: "Zap" },
  { slug: "target", label: "Target" },
  { slug: "briefcase", label: "Briefcase" },
  { slug: "graduation-cap", label: "Graduation" },
  { slug: "lightbulb", label: "Lightbulb" },
  { slug: "layout", label: "Layout" },
  { slug: "layers", label: "Layers" },
  { slug: "video", label: "Video" },
  { slug: "mic", label: "Mic" },
  { slug: "radio", label: "Radio" },
  { slug: "sparkles", label: "Sparkles" },
  { slug: "shield", label: "Shield" },
  { slug: "flag", label: "Flag" },
  { slug: "map-pin", label: "Map pin" },
  { slug: "calendar", label: "Calendar" },
  { slug: "image", label: "Image" },
  { slug: "folder", label: "Folder" },
];

function slugifyIconKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/_/g, "-");
}

/**
 * Renders a category icon: known Lucide slugs (e.g. home, megaphone) or emoji.
 * Unknown ASCII names fall back to FolderTree (avoids huge overlapping text).
 */
export function CategoryIconGlyph({
  icon,
  className,
}: {
  icon?: string | null;
  className?: string;
}) {
  const box = "h-5 w-5 shrink-0 text-gray-700";

  if (!icon?.trim()) {
    return <FolderTree className={cn(box, "text-gray-600", className)} aria-hidden />;
  }

  const raw = icon.trim();
  const key = slugifyIconKey(raw);
  const LucideCmp = LUCIDE_BY_SLUG[key];

  if (LucideCmp) {
    return <LucideCmp className={cn(box, className)} aria-hidden />;
  }

  // Non-ASCII: treat as emoji / symbol (short display)
  if (/[^\u0000-\u007f]/.test(raw)) {
    return (
      <span className={cn("text-lg leading-none select-none", className)} title={raw}>
        {raw}
      </span>
    );
  }

  // Unknown name — fallback icon; tooltip on wrapper (Lucide SVG typings omit title)
  return (
    <span className="inline-flex items-center justify-center" title={raw}>
      <FolderTree className={cn(box, "text-gray-600 opacity-90", className)} aria-hidden />
    </span>
  );
}
