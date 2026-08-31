/**
 * Sitenin tek yapılandırma noktası.
 * Hiçbir adres, e-posta veya endpoint bileşenlerin içine sabit yazılmaz.
 */
export const SITE = {
  name: 'Clear Cart',
  instagram: 'https://instagram.com/clear_cart',
  linkedin: 'https://www.linkedin.com/company/clear1cart/',
  email: 'clearcart.app@gmail.com',
  formEndpoint: 'https://formspree.io/f/mzepkbew',

  /**
   * Hakkımızda sayfasındaki ekip. İsimler çevrilmediği için i18n dosyalarında
   * değil burada durur — iki JSON'a yazılsalardı bir düzeltme iki dosya
   * değiştirmeyi gerektirir ve diller ayrışabilirdi. Rol ve tanıtım ise çevrilir,
   * onlar i18n'dedir: `about.team.<key>.role` ve `.bio`.
   * Diziye eleman ekleyip çıkarmak yeterli; About.astro kaç kişi varsa o kadar basar.
   *
   * `key`, About.astro içindeki `photos` nesnesinin anahtarlarından biri olmalıdır;
   * fotoğraf bu anahtarla bulunur. Eşleşmeyen bir anahtar yazılırsa About.astro
   * build'i kişinin adını vererek düşürür (ui.ts'teki t() ile aynı mantık).
   *
   * Sıra önemsizdir — diziyi serbestçe yeniden dizebilirsiniz, yalnızca ekrandaki
   * sıra değişir.
   */
  team: [
    { key: 'ahmet', name: 'Ahmet Talha Yaman' },
    { key: 'asli', name: 'Aslınur Bakmaz' },
    { key: 'tolga', name: 'Tolga Duy' },
  ],

  /**
   * Sitenin yayınlandığı adres. Boş bırakılırsa canonical, hreflang, og:url
   * ve sitemap üretilmez. Kendi alan adınız olduğunda sadece bu satırı değiştirin.
   */
  siteUrl: 'https://clear-cart.vercel.app',
} as const;

/** siteUrl doldurulmuş mu? */
export const hasSiteUrl = SITE.siteUrl.trim().length > 0;

/** Sondaki eğik çizgi olmadan site adresi ('' ise boş döner). */
export const siteOrigin = SITE.siteUrl.trim().replace(/\/+$/, '');
