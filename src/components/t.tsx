"use client";

import { useTranslation } from '@/contexts/translation-context';

interface TProps {
  children: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

/**
 * Translation component - wraps text for automatic translation
 * 
 * Usage:
 *   <T>Welcome to our platform</T>
 *   <T as="h1" className="text-2xl">Page Title</T>
 */
export function T({ children, as: Component = 'span', className }: TProps) {
  const { t } = useTranslation();
  
  return <Component className={className}>{t(children)}</Component>;
}

/**
 * Hook for translating multiple texts at once
 * Useful for translating page content on load
 */
export { useTranslation, usePageTranslation } from '@/contexts/translation-context';
