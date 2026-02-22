"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { CourseFilters } from "@/types";
import { T, useT } from "@/components/t";
import { REGISTRATION_NETWORKS } from "@/lib/validations/auth";

export const COURSE_NETWORKS = [...REGISTRATION_NETWORKS];

export const COURSE_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "pt", name: "Portuguese" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "it", name: "Italian" },
  { code: "nl", name: "Dutch" },
  { code: "pl", name: "Polish" },
  { code: "tr", name: "Turkish" },
  { code: "vi", name: "Vietnamese" },
  { code: "th", name: "Thai" },
  { code: "id", name: "Indonesian" },
  { code: "ms", name: "Malay" },
  { code: "sw", name: "Swahili" },
];

export function CoursesFilterSidebar({
  filters,
  setFilters,
  categories,
}: {
  filters: CourseFilters;
  setFilters: (filters: CourseFilters) => void;
  categories: { _id: string; name: string }[];
}) {
  const { t } = useT();

  return (
    <div className="space-y-6 pb-4">
      {categories.length > 0 && (
        <div>
          <h4 className="font-sans font-semibold text-sm text-black mb-3"><T>Category</T></h4>
          <div className="space-y-3">
            {categories.map((category) => (
              <label
                key={category._id}
                className="flex items-center gap-3 cursor-pointer py-1"
              >
                <Checkbox
                  checked={filters.category === category._id}
                  onCheckedChange={(checked) => {
                    setFilters({
                      ...filters,
                      category: checked ? category._id : undefined,
                    });
                  }}
                />
                <span className="text-sm font-sans text-gray-600">{t(category.name)}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="font-sans font-semibold text-sm text-black mb-3"><T>Network</T></h4>
        <div className="space-y-3">
          {COURSE_NETWORKS.map((network) => (
            <label
              key={network}
              className="flex items-center gap-3 cursor-pointer py-1"
            >
              <Checkbox
                checked={filters.network === network}
                onCheckedChange={(checked) => {
                  setFilters({
                    ...filters,
                    network: checked ? network : undefined,
                  });
                }}
              />
              <span className="text-sm font-sans text-gray-600">{t(network)}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-sans font-semibold text-sm text-black mb-3"><T>Language</T></h4>
        <div className="space-y-3 max-h-52 overflow-y-auto pr-2">
          {COURSE_LANGUAGES.slice(0, 10).map((lang) => (
            <label
              key={lang.code}
              className="flex items-center gap-3 cursor-pointer py-1"
            >
              <Checkbox
                checked={filters.language === lang.code}
                onCheckedChange={(checked) => {
                  setFilters({
                    ...filters,
                    language: checked ? lang.code : undefined,
                  });
                }}
              />
              <span className="text-sm font-sans text-gray-600">{lang.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <Button
          variant="outline"
          size="default"
          className="w-full rounded-[10px] border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-sans font-medium"
          onClick={() => setFilters({ status: "published" })}
        >
          <X className="h-4 w-4 mr-2" />
          <T>Clear Filters</T>
        </Button>
      </div>
    </div>
  );
}
