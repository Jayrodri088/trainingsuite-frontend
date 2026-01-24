"use client";

import { useTranslation } from '@/contexts/translation-context';
import { ElementType, ComponentPropsWithoutRef } from 'react';

interface TProps<C extends ElementType = 'span'> {
  children: string;
  as?: C;
  className?: string;
}

/**
 * Translation component - wraps text for automatic translation
 * 
 * Usage:
 *   <T>Welcome to our platform</T>
 *   <T as="h1" className="text-2xl">Page Title</T>
 */
export function T<C extends ElementType = 'span'>({ 
  children, 
  as, 
  className 
}: TProps<C>) {
  const { t } = useTranslation();
  const Component = as || 'span';
  
  return <Component className={className}>{t(children)}</Component>;
}

/**
 * Hook for translating multiple texts at once
 * Useful for translating page content on load
 */
export { useTranslation, usePageTranslation } from '@/contexts/translation-context';
