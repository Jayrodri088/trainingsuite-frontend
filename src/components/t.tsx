"use client";

import React, { isValidElement } from "react";
import { useTranslation } from "@/contexts/translation-context";

type HTMLElementTag = "span" | "div" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "label" | "strong" | "em" | "small" | "a" | "button";

function flattenTranslatableText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) {
    return node.map(flattenTranslatableText).join("");
  }
  if (isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    return flattenTranslatableText(props.children);
  }
  return "";
}

interface TProps {
  /** Plain text only (may be multiline JSX); nested elements are flattened for translation. */
  children: React.ReactNode;
  as?: HTMLElementTag;
  className?: string;
  [key: string]: unknown;
}

/**
 * Translation component - wraps text for automatic translation
 *
 * Usage:
 *   <T>Welcome to our platform</T>
 *   <T as="h1" className="text-2xl">Page Title</T>
 */
export function T({
  children,
  as,
  className,
  ...rest
}: TProps) {
  const { t, translationVersion } = useTranslation();
  const raw = flattenTranslatableText(children);

  return React.createElement(
    as || "span",
    { className, "data-tv": translationVersion, ...rest },
    t(raw)
  );
}

/**
 * Hook for translating text with automatic re-renders
 * Use this when you need to translate text in JSX attributes or variables
 *
 * Usage:
 *   const { translate } = useT();
 *   return <img alt={translate("Profile picture")} />
 */
export function useT() {
  const { t, translationVersion, isTranslating, language } = useTranslation();

  return {
    translate: t,
    t,
    isTranslating,
    language,
    translationVersion,
  };
}

/**
 * Hook for translating multiple texts at once
 * Useful for translating page content on load
 */
export { useTranslation, usePageTranslation } from "@/contexts/translation-context";
