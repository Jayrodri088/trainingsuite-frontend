"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ChevronDown, Search, Smile, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Theme, type EmojiClickData } from "emoji-picker-react";
import { CategoryIconGlyph, CATEGORY_LUCIDE_OPTIONS } from "@/components/admin/category-icon";
import { cn } from "@/lib/utils";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[380px] w-[320px] max-w-full items-center justify-center rounded-lg border border-gray-200 bg-muted/20 text-sm text-gray-500">
      Loading emoji picker…
    </div>
  ),
});

export function CategoryIconField({
  id,
  value,
  onChange,
}: {
  id?: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [lucideQuery, setLucideQuery] = useState("");

  const filteredLucide = useMemo(() => {
    const q = lucideQuery.trim().toLowerCase();
    if (!q) return CATEGORY_LUCIDE_OPTIONS;
    return CATEGORY_LUCIDE_OPTIONS.filter(
      (o) => o.slug.includes(q) || o.label.toLowerCase().includes(q)
    );
  }, [lucideQuery]);

  const looksLucideSlug = /^[a-z][a-z0-9-]*$/i.test(value.trim());

  return (
    <div className="grid gap-3">
      <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Icon</span>

      <div className="flex flex-wrap items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-muted/30"
          aria-hidden
        >
          <CategoryIconGlyph icon={value} />
        </div>

        {value ? (
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-left sm:flex-row sm:items-center sm:gap-2">
            <span className="truncate font-mono text-xs text-gray-600" title={value}>
              {value}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-gray-400">
              {looksLucideSlug ? "Line icon" : "Emoji / custom"}
            </span>
          </div>
        ) : (
          <span className="text-sm text-gray-500">No icon selected</span>
        )}

        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 rounded-lg text-gray-600"
            onClick={() => onChange("")}
          >
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        ) : null}
      </div>

      <Collapsible open={emojiOpen} onOpenChange={setEmojiOpen}>
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between rounded-xl border-gray-200 sm:w-auto sm:min-w-[200px]"
            aria-expanded={emojiOpen}
          >
            <span className="inline-flex items-center gap-2">
              <Smile className="h-4 w-4 text-[#0052CC]" />
              Emoji picker
            </span>
            <ChevronDown
              className={cn("h-4 w-4 shrink-0 opacity-60 transition-transform", emojiOpen && "rotate-180")}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
          <div className="mx-auto max-w-[min(100%,360px)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <EmojiPicker
              width="100%"
              height={380}
              theme={Theme.LIGHT}
              searchPlaceHolder="Search emojis…"
              previewConfig={{ showPreview: false }}
              onEmojiClick={(emojiData: EmojiClickData) => {
                onChange(emojiData.emoji);
                setEmojiOpen(false);
              }}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="grid gap-2">
        <Label className="text-xs font-semibold text-gray-600">Line icons</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            id={id ? `${id}-lucide-search` : undefined}
            value={lucideQuery}
            onChange={(e) => setLucideQuery(e.target.value)}
            placeholder="Search by name (e.g. home, star)…"
            className="rounded-xl border-gray-200 bg-white pl-9 shadow-sm"
            autoComplete="off"
          />
        </div>
        <ScrollArea className="h-[168px] rounded-xl border border-gray-200 bg-muted/10">
          <div className="grid grid-cols-3 gap-2 p-2 sm:grid-cols-4">
            {filteredLucide.length === 0 ? (
              <p className="col-span-full py-6 text-center text-sm text-gray-500">No icons match your search.</p>
            ) : (
              filteredLucide.map((opt) => {
                const active = value === opt.slug;
                return (
                  <button
                    key={opt.slug}
                    type="button"
                    onClick={() => onChange(opt.slug)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border border-transparent bg-white p-2 text-center text-[10px] font-medium text-gray-700 transition-colors hover:bg-gray-50",
                      active && "border-[#0052CC] bg-[#0052CC]/5 ring-1 ring-[#0052CC]/30"
                    )}
                  >
                    <span className="flex h-8 w-8 items-center justify-center">
                      <CategoryIconGlyph icon={opt.slug} />
                    </span>
                    <span className="line-clamp-2 w-full leading-tight">{opt.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="grid gap-1">
        <Label htmlFor={id} className="text-[10px] font-normal uppercase tracking-wide text-gray-500">
          Custom value (optional)
        </Label>
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste emoji or type Lucide slug"
          maxLength={48}
          className="rounded-xl border-gray-200 bg-white font-mono text-sm shadow-sm"
        />
      </div>
    </div>
  );
}
