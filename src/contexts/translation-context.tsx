"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getApiBaseUrl } from '@/lib/api/base-url';

// Supported languages - comprehensive list
export const SUPPORTED_LANGUAGES = [
  // Major World Languages
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  
  // European Languages
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'bg', name: 'Български', flag: '🇧🇬' },
  { code: 'hr', name: 'Hrvatski', flag: '🇭🇷' },
  { code: 'sr', name: 'Српски', flag: '🇷🇸' },
  { code: 'sl', name: 'Slovenščina', flag: '🇸🇮' },
  { code: 'lt', name: 'Lietuvių', flag: '🇱🇹' },
  { code: 'lv', name: 'Latviešu', flag: '🇱🇻' },
  { code: 'et', name: 'Eesti', flag: '🇪🇪' },
  { code: 'is', name: 'Íslenska', flag: '🇮🇸' },
  { code: 'ga', name: 'Gaeilge', flag: '🇮🇪' },
  { code: 'cy', name: 'Cymraeg', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  { code: 'mt', name: 'Malti', flag: '🇲🇹' },
  { code: 'sq', name: 'Shqip', flag: '🇦🇱' },
  { code: 'mk', name: 'Македонски', flag: '🇲🇰' },
  { code: 'bs', name: 'Bosanski', flag: '🇧🇦' },
  { code: 'lb', name: 'Lëtzebuergesch', flag: '🇱🇺' },
  { code: 'ca', name: 'Català', flag: '🇪🇸' },
  { code: 'gl', name: 'Galego', flag: '🇪🇸' },
  { code: 'eu', name: 'Euskara', flag: '🇪🇸' },
  
  // Asian Languages
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'tl', name: 'Tagalog', flag: '🇵🇭' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
  { code: 'or', name: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'si', name: 'සිංහල', flag: '🇱🇰' },
  { code: 'ne', name: 'नेपाली', flag: '🇳🇵' },
  { code: 'my', name: 'မြန်မာ', flag: '🇲🇲' },
  { code: 'km', name: 'ខ្មែរ', flag: '🇰🇭' },
  { code: 'lo', name: 'ລາວ', flag: '🇱🇦' },
  { code: 'mn', name: 'Монгол', flag: '🇲🇳' },
  { code: 'ka', name: 'ქართული', flag: '🇬🇪' },
  { code: 'hy', name: 'Հdelays', flag: '🇦🇲' },
  { code: 'az', name: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'kk', name: 'Қазақ', flag: '🇰🇿' },
  { code: 'uz', name: 'Oʻzbek', flag: '🇺🇿' },
  { code: 'ky', name: 'Кыргызча', flag: '🇰🇬' },
  { code: 'tg', name: 'Тоҷикӣ', flag: '🇹🇯' },
  { code: 'tk', name: 'Türkmen', flag: '🇹🇲' },
  
  // Middle Eastern Languages
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
  { code: 'he', name: 'עברית', flag: '🇮🇱' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
  { code: 'ps', name: 'پښتو', flag: '🇦🇫' },
  { code: 'ku', name: 'کوردی', flag: '🇮🇶' },
  
  // African Languages
  { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
  { code: 'am', name: 'አማርኛ', flag: '🇪🇹' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
  { code: 'yo', name: 'Yorùbá', flag: '🇳🇬' },
  { code: 'ig', name: 'Igbo', flag: '🇳🇬' },
  { code: 'zu', name: 'isiZulu', flag: '🇿🇦' },
  { code: 'xh', name: 'isiXhosa', flag: '🇿🇦' },
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'st', name: 'Sesotho', flag: '🇱🇸' },
  { code: 'sn', name: 'chiShona', flag: '🇿🇼' },
  { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
  { code: 'so', name: 'Soomaali', flag: '🇸🇴' },
  { code: 'mg', name: 'Malagasy', flag: '🇲🇬' },
  { code: 'ny', name: 'Chichewa', flag: '🇲🇼' },
  { code: 'lg', name: 'Luganda', flag: '🇺🇬' },
  { code: 'ti', name: 'ትግርኛ', flag: '🇪🇷' },
  { code: 'om', name: 'Oromoo', flag: '🇪🇹' },
  { code: 'wo', name: 'Wolof', flag: '🇸🇳' },
  { code: 'ee', name: 'Eʋegbe', flag: '🇬🇭' },
  { code: 'tw', name: 'Twi', flag: '🇬🇭' },
  { code: 'ak', name: 'Akan', flag: '🇬🇭' },
  { code: 'bm', name: 'Bamanankan', flag: '🇲🇱' },
  { code: 'ln', name: 'Lingála', flag: '🇨🇩' },
  { code: 'kg', name: 'Kikongo', flag: '🇨🇩' },
  { code: 'rn', name: 'Ikirundi', flag: '🇧🇮' },
  
  // Other Languages
  { code: 'eo', name: 'Esperanto', flag: '🌍' },
  { code: 'la', name: 'Latina', flag: '🏛️' },
  { code: 'jv', name: 'Basa Jawa', flag: '🇮🇩' },
  { code: 'su', name: 'Basa Sunda', flag: '🇮🇩' },
  { code: 'ceb', name: 'Cebuano', flag: '🇵🇭' },
  { code: 'ht', name: 'Kreyòl Ayisyen', flag: '🇭🇹' },
  { code: 'haw', name: 'ʻŌlelo Hawaiʻi', flag: '🇺🇸' },
  { code: 'mi', name: 'Te Reo Māori', flag: '🇳🇿' },
  { code: 'sm', name: 'Gagana Samoa', flag: '🇼🇸' },
  { code: 'gd', name: 'Gàidhlig', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { code: 'yi', name: 'ייִדיש', flag: '🇮🇱' },
  { code: 'hmn', name: 'Hmoob', flag: '🇱🇦' },
  { code: 'co', name: 'Corsu', flag: '🇫🇷' },
  { code: 'fy', name: 'Frysk', flag: '🇳🇱' },
];

const STORAGE_KEY = 'preferred-language';
const CACHE_KEY = 'translation-cache';

function normalizeText(text: string): string {
  return text
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

interface TranslationContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (text: string) => string;
  isTranslating: boolean;
  translateBatch: (texts: string[]) => Promise<void>;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
  translationVersion: number;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

// Local cache for translations (in-memory + localStorage)
const translationCache = new Map<string, string>();

// Load cache from localStorage
function loadCache(): void {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      Object.entries(parsed).forEach(([key, value]) => {
        translationCache.set(key, value as string);
      });
    }
  } catch {
    // Ignore errors
  }
}

// Save cache to localStorage (debounced)
let saveTimeout: ReturnType<typeof setTimeout>;
function saveCache(): void {
  if (typeof window === 'undefined') return;
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      const obj: Record<string, string> = {};
      translationCache.forEach((value, key) => {
        obj[key] = value;
      });
      localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
    } catch {
      // Ignore errors (quota exceeded, etc.)
    }
  }, 1000);
}

function getCacheKey(text: string, from: string, to: string): string {
  return `${from}:${to}:${normalizeText(text)}`;
}

// Detect user's preferred language
function detectLanguage(): string {
  if (typeof window === 'undefined') return 'en';
  
  // Check localStorage first
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LANGUAGES.find(l => l.code === stored)) {
    return stored;
  }
  
  // Check browser language
  const browserLang = navigator.language.split('-')[0];
  if (SUPPORTED_LANGUAGES.find(l => l.code === browserLang)) {
    return browserLang;
  }
  
  return 'en';
}

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [translationVersion, setTranslationVersion] = useState(0);
  const pendingTranslations = useRef<Set<string>>(new Set());
  const batchQueue = useRef<string[]>([]);
  const batchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize on mount
  useEffect(() => {
    loadCache();
    const detected = detectLanguage();
    setLanguageState(detected);
    setIsInitialized(true);
  }, []);

  // Set language and persist
  const setLanguage = useCallback((lang: string) => {
    if (!SUPPORTED_LANGUAGES.find(l => l.code === lang)) return;
    setLanguageState(lang);
    // Force re-render with new language
    setTranslationVersion(v => v + 1);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang);
    }
  }, []);

  // Translate batch of texts via API with retry logic
  const translateBatch = useCallback(async (texts: string[], retryCount = 0) => {
    if (language === 'en' || texts.length === 0) return;

    const normalizedTexts = [...new Set(texts.map(normalizeText).filter(Boolean))];

    // Filter out already cached/pending texts
    const toTranslate = normalizedTexts.filter(text => {
      const cacheKey = getCacheKey(text, 'en', language);
      return !translationCache.has(cacheKey) && !pendingTranslations.current.has(text);
    });

    if (toTranslate.length === 0) return;

    // Mark as pending
    toTranslate.forEach(text => pendingTranslations.current.add(text));
    setIsTranslating(true);

    // API limit is 50 texts per request - chunk into smaller batches
    const BATCH_SIZE = 50;
    const chunks: string[][] = [];
    for (let i = 0; i < toTranslate.length; i += BATCH_SIZE) {
      chunks.push(toTranslate.slice(i, i + BATCH_SIZE));
    }

    try {
      // Process chunks sequentially to reduce rate limiting / flaky partial failures when many
      // long strings are translated together (parallel bursts were easy to overload).
      const rateLimitedChunks: string[] = [];
      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        const chunk = chunks[chunkIndex];

        const response = await fetch(`${getApiBaseUrl()}/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            texts: chunk,
            from: 'en',
            to: language,
          }),
        });

        let data: {
          success?: boolean;
          error?: string;
          message?: string;
          data?: { translations?: Record<string, string> };
        } = {};
        try {
          data = await response.json();
        } catch {
          /* non-JSON response */
        }

        if (response.ok && data.success && data.data?.translations) {
          const translations = data.data.translations;
          Object.entries(translations).forEach(([original, translated]) => {
            const normalizedOriginal = normalizeText(String(original));
            const cacheKey = getCacheKey(normalizedOriginal, 'en', language);
            translationCache.set(cacheKey, String(translated));
          });
        } else if (response.status === 429) {
          rateLimitedChunks.push(...chunk);
        } else {
          console.error('Translation failed:', data.error || 'Unknown error');
        }
      }

      if (rateLimitedChunks.length > 0 && retryCount < 3) {
        console.warn('Translation rate limited, retrying in 2s...');
        rateLimitedChunks.forEach(text => pendingTranslations.current.delete(text));
        setTimeout(() => {
          translateBatch(rateLimitedChunks, retryCount + 1);
        }, 2000 * (retryCount + 1)); // Exponential backoff
      }

      saveCache();
      // Force re-render after translations arrive
      setTranslationVersion(v => v + 1);
    } catch (error) {
      console.error('Translation batch failed:', error);
    } finally {
      toTranslate.forEach(text => pendingTranslations.current.delete(text));
      setIsTranslating(false);
    }
  }, [language]);

  // Queue text for batch translation
  const queueForTranslation = useCallback((text: string) => {
    const normalized = normalizeText(text);
    if (!normalized || language === 'en') return;
    
    const cacheKey = getCacheKey(normalized, 'en', language);
    if (translationCache.has(cacheKey) || pendingTranslations.current.has(normalized)) return;

    // Avoid duplicates in the queue
    if (!batchQueue.current.includes(normalized)) {
      batchQueue.current.push(normalized);
    }
    
    // Debounce batch requests - wait 300ms to collect more texts
    if (batchTimeout.current) clearTimeout(batchTimeout.current);
    batchTimeout.current = setTimeout(() => {
      const batch = [...new Set(batchQueue.current)];
      batchQueue.current = [];
      if (batch.length > 0) {
        translateBatch(batch);
      }
    }, 300);
  }, [language, translateBatch]);

  // Get translation (sync - returns cached or original)
  // Note: We intentionally include translationVersion in deps to get fresh cache reads
  const t = useCallback((text: string): string => {
    if (!text || language === 'en') return text;

    const normalized = normalizeText(text);
    if (!normalized) return text;

    const cacheKey = getCacheKey(normalized, 'en', language);
    const cached = translationCache.get(cacheKey);
    
    if (cached) return cached;
    
    // Queue for translation if not cached
    queueForTranslation(normalized);
    
    return text; // Return original while translating
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, queueForTranslation, translationVersion]);

  // Don't render until initialized to avoid hydration mismatch
  if (!isInitialized) {
    return <>{children}</>;
  }

  return (
    <TranslationContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isTranslating,
        translateBatch,
        supportedLanguages: SUPPORTED_LANGUAGES,
        translationVersion,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  
  // Return safe defaults during SSR/build time when context is not available
  if (!context) {
    return {
      language: 'en',
      setLanguage: () => {},
      t: (text: string) => text,
      isTranslating: false,
      translateBatch: async () => {},
      supportedLanguages: SUPPORTED_LANGUAGES,
      translationVersion: 0,
    };
  }
  return context;
}

// Hook for translating page content on mount
export function usePageTranslation(texts: string[]) {
  const { translateBatch, language } = useTranslation();
  // Callers often pass a fresh array literal each render; depend on serialized content instead
  // of array identity so we don't constantly re-trigger batch translation work.
  const textsKey = JSON.stringify(texts);

  useEffect(() => {
    if (language === 'en') return;
    let parsed: string[] = [];
    try {
      parsed = JSON.parse(textsKey) as string[];
    } catch {
      return;
    }
    if (!Array.isArray(parsed) || parsed.length === 0) return;
    translateBatch(parsed);
  }, [language, textsKey, translateBatch]);
}
