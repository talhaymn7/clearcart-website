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
   * değil burada durur — iki JSON'a yazılsaydı bir düzeltme iki dosya
   * değiştirmeyi gerektirir ve diller ayrışabilirdi.
   * Diziye eleman ekleyip çıkarmak yeterli; About.astro kaç kişi varsa o kadar basar.
   *
   * DİKKAT: Sıra, About.astro içindeki `photos` dizisinin sırasıyla eşleşmek
   * zorundadır (Screenshots.astro'daki ile aynı kural). Burada sırayı
   * değiştirirseniz orada da değiştirin — yoksa fotoğraf yanlış isme düşer
   * ve build bunu yakalamaz.
   */
  team: [
    { name: 'Ahmet Talha Yaman' },
    { name: 'Aslınur Bakmaz' },
    { name: 'Tolga Duy' },
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
