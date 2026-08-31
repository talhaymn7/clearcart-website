import tr from './tr.json';
import en from './en.json';

export const languages = {
  tr: 'Türkçe',
  en: 'English',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'tr';

const dictionaries: Record<Lang, unknown> = { tr, en };

export function isLang(value: string): value is Lang {
  return value in languages;
}

/**
 * Nokta ile ayrılmış anahtar yolunu sözlükte arar: t('hero.title').
 * Anahtar bulunamazsa derleme sırasında hata verir — böylece iki dil ayrışmaz.
 */
export function useTranslations(lang: Lang) {
  const dict = dictionaries[lang];

  return function t<T = string>(path: string): T {
    const value = path.split('.').reduce<unknown>((acc, key) => {
      if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
        return (acc as Record<string, unknown>)[key];
      }
      return undefined;
    }, dict);

    if (value === undefined) {
      throw new Error(`[i18n] "${path}" anahtarı ${lang}.json içinde yok.`);
    }

    return value as T;
  };
}

/** Astro base yolunu koruyan link üretici. */
export function withBase(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const clean = path.replace(/^\/+/, '');
  return clean ? `${base}/${clean}` : `${base}/`;
}

/** Bir dilin ana sayfa yolu: /tr/ ya da /en/ (base dahil). */
export function langPath(lang: Lang): string {
  return withBase(`${lang}/`);
}

/**
 * Hakkımızda sayfasının yolu. Bölüm çapalarının aksine sayfa adresi çevrilir,
 * çünkü adres çubuğunda İngilizce ziyaretçiye görünür: /tr/hakkimizda/ — /en/about/
 */
const aboutSlugs: Record<Lang, string> = { tr: 'hakkimizda', en: 'about' };

export function aboutPath(lang: Lang): string {
  return withBase(`${lang}/${aboutSlugs[lang]}/`);
}

/** Vizyon-Misyon sayfasının yolu: /tr/vizyon/ — /en/vision/ */
const visionSlugs: Record<Lang, string> = { tr: 'vizyon', en: 'vision' };

export function visionPath(lang: Lang): string {
  return withBase(`${lang}/${visionSlugs[lang]}/`);
}
