"use client";

import React from 'react';
import { useTranslation } from '@/contexts/translation-context';

type HTMLElementTag = 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label' | 'strong' | 'em' | 'small' | 'a' | 'button';

interface TProps {
  children: string;
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
  // Include translationVersion to force re-render when translations arrive
  const { t, translationVersion } = useTranslation();
  
  // Use React.createElement to avoid JSX polymorphic component type issues
  // The translationVersion is used implicitly (via data-tv) to trigger re-renders
  // when new translations are fetched from the API
  return React.createElement(
    as || 'span',
    { className, 'data-tv': translationVersion, ...rest },
    t(children)
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
  
  // Return translate function and useful state
  // Components using this hook will re-render when translationVersion changes
  return {
    translate: t,
    t, // alias
    isTranslating,
    language,
    translationVersion,
  };
}

/**
 * Hook for translating multiple texts at once
 * Useful for translating page content on load
 */
export { useTranslation, usePageTranslation } from '@/contexts/translation-context';
