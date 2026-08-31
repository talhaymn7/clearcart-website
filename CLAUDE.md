# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Depo dili Türkçedir: kod yorumları, commit mesajları ve README Türkçe yazılır. Aynı dili sürdürün.

## Komutlar

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ üretir
npm run preview  # build sonrası yerel önizleme
```

Node **≥ 22.12** gerekir (Astro 7 şartı, `package.json` → `engines`).

**Test altyapısı, linter veya formatter yok.** Doğrulamanın tek yolu `npm run build`'in
hatasız tamamlanmasıdır: eksik i18n anahtarı ve bozuk görsel importu build'i düşürür.
Değişiklikten sonra mutlaka build alın. (`astro build` tip denetimi yapmaz; gerekirse
`npx astro check` ayrıca çalıştırılır.)

i18n anahtar paritesini ayrıca kontrol etmek için:

```bash
node -e "const a=require('./src/i18n/tr.json'),b=require('./src/i18n/en.json');const w=(o,p='')=>Object.entries(o).flatMap(([k,v])=>{const K=p?p+'.'+k:k;return v&&typeof v==='object'?w(v,K):[K]});const A=w(a),B=w(b);console.log(A.filter(k=>!B.includes(k)),B.filter(k=>!A.includes(k)))"
```

GitHub Pages çıktısını yerelde denemek (Vercel'de bu değişken **tanımlanmaz**):

```bash
PAGES_BASE=/clearcart-website npm run build && npm run preview
```

## Mimari

Astro 7 (`output: 'static'`) + Tailwind 4. Sunucu, veritabanı, kullanıcı girişi yok;
her şey build sırasında HTML'e dönüşür. Bileşenlerin `---` bloğu build makinesinde
Node olarak çalışır, ziyaretçi isteğinde değil — `BaseLayout.astro` içindeki
`fs.existsSync` çağrısı bu yüzden mümkündür.

### İçerik/kod ayrımı — en önemli kural

**Bileşenlerin içine hiçbir kullanıcı metni yazılmaz.** Tamamı `src/i18n/tr.json` ve
`src/i18n/en.json` içinde yaşar, `useTranslations(lang)` ile okunur.

`src/i18n/ui.ts` içindeki `t()` anahtarı bulamazsa **throw eder**. Astro bu fonksiyonu
build sırasında çalıştırdığı için, bir dilde eksik anahtar derlemeyi düşürür — iki
dilin sessizce ayrışması böyle engellenir. Bir dile anahtar eklerken diğerine de ekleyin.

Diziler de JSON'da tutulur (`problem.cards`, `screens.items` gibi) ve bileşende
`t<{...}[]>('...')` ile tiplenir.

### Tek yapılandırma noktası ve koşullu metadata

Adres, e-posta, sosyal hesap, form endpoint'i ve ekip isimleri yalnızca `src/config.ts`
içindedir; bileşenlere sabit yazılmaz. Ekip isimleri (`SITE.team`) bilerek i18n'de değil
burada durur: isimler çevrilmez, iki JSON'a yazılsalardı bir düzeltme iki dosya
değiştirmeyi gerektirirdi.

Her kişinin `key` alanı, `About.astro` içindeki `photos` **nesnesinin** anahtarlarından
biri olmalıdır; fotoğraf bu anahtarla bulunur. `About.astro`'daki bekçi döngüsü eşleşmeyen
anahtarda **throw eder**, yani build kişinin adını vererek düşer — `t()`'nin eksik i18n
anahtarında yaptığının aynısı. **Sıra önemsizdir**, dizi serbestçe yeniden dizilebilir.

Aynı `key` kişinin çevrilen metinlerini de bulur: `about.team.<key>.role` ve `.bio`
her iki JSON'da bulunmak zorundadır, yoksa `t()` build'i düşürür. Bölüşüm şudur —
**`name` çevrilmez → `config.ts`; `role` ve `bio` çevrilir → i18n.** İkisi de boş metin
(`''`) olabilir: o zaman kartta o satır (ve `bio` için üstündeki çizgi) hiç basılmaz,
böylece içerik hazır değilken sayfa yer tutucu göstermeden yayınlanabilir.



Metadata üretimi bu değerlere **koşulludur**:

- `siteUrl` boşsa → canonical, hreflang, `og:url` ve sitemap entegrasyonu hiç üretilmez
  (`astro.config.mjs` sitemap'i `hasSiteUrl` ile şarta bağlar).
- `public/og-image.png` diskte yoksa → `og:image` etiketleri basılmaz, `twitter:card`
  `summary_large_image` yerine `summary` olur.

Prensip: yanlış metadata vermektense hiç vermemek. Bu koşulları kaldırmayın.

### Yönlendirme ve base yolu

Dört gerçek sayfa var, her dilde iki tane:

| Yol | Dosya | İçerik |
|---|---|---|
| `/tr/` — `/en/` | `pages/<lang>/index.astro` | Yedi bileşenli ana sayfa |
| `/tr/hakkimizda/` — `/en/about/` | `pages/tr/hakkimizda.astro`, `pages/en/about.astro` | `About.astro` |

- `/` → `noindex` + `<meta http-equiv="refresh">` ile `/tr/`'ye gider (JS'siz de çalışsın diye).
- Sayfa dosyaları ince tutulur: içlerinde markup yok, yalnızca bileşen dizerler.
- **Sayfa yolları çevrilir** (`hakkimizda` / `about`) ama **bölüm çapaları çevrilmez**:
  `#nasil-calisir`, `#ozellikler`, `#ekranlar`, `#bekleme-listesi`, `#iletisim` her iki
  dilde de Türkçedir. Ayrım şu: çapa adres çubuğunda ikincil, sayfa yolu birincildir.
  Yeni sayfa yolları için `ui.ts` içindeki `aboutPath()` kalıbını izleyin.

#### Alt sayfa eklerken üç zorunluluk

`BaseLayout` başlangıçta "her dilde tek sayfa" varsayımıyla yazılmıştı; alt sayfalar bu
varsayımı üç yerde kırar. Üçü de opsiyonel prop'larla çözülmüştür — **vermezseniz sessizce
yanlış çıktı üretilir, build hata vermez**:

- `paths={{ tr: …, en: … }}` → verilmezse canonical, `hreflang` ve `og:url` dilin **kökünü**
  gösterir. `BaseLayout` bu değeri `Header`'a da geçirir; dil değiştirici onu kullanır,
  böylece alt sayfada dil değiştirmek ana sayfaya atmaz.
- `title` / `description` → verilmezse sayfa ana sayfanın `<title>`'ını alır.
- Sitemap filtresi (`astro.config.mjs`) `/\/(tr|en)\//` — **sondaki `$` bilerek yoktur**,
  olsaydı alt sayfalar sitemap'e girmezdi.

`Header.astro` her sayfada göründüğü için bölüm çapalarını `langPath(lang)` ile **mutlak**
yazar (`/tr/#ozellikler`). Düz `#ozellikler` yazılsaydı alt sayfalarda ölü link olurdu.
Ana sayfada davranış aynıdır — aynı belge içi çapa gezinmesi, kaydırma değişmez.
`Hero.astro` göreli çapa kullanmaya devam eder; o bileşen yalnızca ana sayfada görünür.

`PAGES_BASE` ortam değişkeni Astro `base`'ini belirler. Bu yüzden `public/` altındaki
her varlığa ve her iç bağlantıya **`withBase()` / `langPath()` / `aboutPath()` üzerinden**
erişilir; `/logo.png` gibi kök yollar elle yazılmaz.

### Görseller — iki ayrı yol

| Konum | İşlem |
|---|---|
| `src/img/` | `astro:assets` `<Image />` ile; WebP + `srcset` Astro tarafından üretilir |
| `public/` | Dokunulmadan kopyalanır (favicon, logo, og-image, `.nojekyll`) |

`public/` altındaki logo/favicon/og-image **build'in parçası değildir**; `scripts/make-logo.py`
(Pillow) ve `npx sharp-cli` ile elle üretilip commit'lenir. Bu araçlar bilerek
`package.json`'a bağımlılık olarak eklenmemiştir. Yeniden üretim komutları ve
`SRC_BOX` uyarısı README'nin "Logo ve favicon" bölümündedir.

Galeri kutuları `9 / 19.5` oranındadır (`.screen-frame`, `object-fit: cover`); farklı
oranda bir görsel kırpılır. Yeni ekran görüntüsü eklerken README'deki adımları izleyin —
görseli `Screenshots.astro`'daki `sources` dizisine eklemek **ve** `screens.items`'a iki
dilde `caption` + `alt` yazmak birlikte gerekir, aksi halde build düşer.

Ekip fotoğrafları `src/img/team/` altındadır ve `.avatar-frame` (`.screen-frame`'in
yuvarlak kardeşi) içinde, `.card` kutularının tepesinde gösterilir. `alt=""` bilinçlidir:
isim hemen altta metin olarak yazdığı için fotoğraf dekoratiftir — `Logo.astro`'daki
gerekçenin aynısı.

**`widths` yerine `densities` kullanılır** ve bu önemlidir: daire sabit 128px olduğu
için `<Image width={128} height={128} densities={[1, 2]} />` yazılır. `widths` verilseydi
Astro `src` yedeği için **orijinali** üretirdi — 2879px'lik kaynaklarda bu, kullanılmayan
~1,2 MB'lık dosya demekti. Sabit boyutlu her görselde bu kurala uyun; boyutu değiştirirken
`About.astro`'daki `w-32` sınıfını ve `<Image>`'ın `width`/`height` değerini birlikte
güncelleyin.

### İstemci JavaScript — bilinçli olarak asgari

Hiçbir UI framework'ü yok; `client:` direktifi hiç kullanılmaz. Yalnızca iki vanilla
`<script>` vardır: `Header.astro`'da mobil menü, `Waitlist.astro`'da form gönderimi.
İlk commit'in hedefi "sayfa başına ~1.2 KB JS" ve harici CDN/font/analytics kullanmamaktı.

Progressive enhancement her yerde korunur ve bozulmamalıdır:
- Form JS'siz de klasik `<form action method="POST">` olarak çalışır.
- Dil değiştirici gerçek `<a>` linkleridir.
- Kök yönlendirme meta refresh iledir.

Bekleme listesi Formspree'ye düz `fetch` ile POST atar (SDK yok). `name="email"` alanı
Formspree'nin reply-to davranışı için zorunludur; `_gotcha` bot tuzağıdır. Ücretsiz plan
sınırı ayda 50 gönderim.

### Stil

Tailwind 4, CSS-first: **`tailwind.config.js` yoktur.** Marka token'ları
`src/styles/global.css` içindeki `@theme` bloğundadır; oraya `--color-brand-deep`
yazmak `text-brand-deep` / `bg-brand-deep` sınıflarını üretir. Astro entegrasyonu değil,
`@tailwindcss/vite` plugin'i doğrudan Vite'a takılıdır.

Tekrar eden ve kimlik taşıyan görünümler (`wrap`, `section`, `measure`, `card`, `btn`,
`btn-primary`, `screen-frame`, `avatar-frame`, `divider`) `@layer components` altında elle
yazılmış sınıflardır; utility'ler yalnızca o anlık yerleşim kararları için kullanılır. Yeni
paylaşılan bir görünüm eklerken bu ayrımı sürdürün.

Erişilebilirlik kararları kasıtlıdır: `outline: none` hiçbir yerde yoktur,
`prefers-reduced-motion` bloğu vardır, `#ab8abf` (`--brand`) yalnızca dekoratiftir —
kontrastı düşük olduğu için üzerine veya altına metin yazılmaz.

## Deploy

- **Vercel** (asıl yol): `main`'e push otomatik yayına gider, ayar gerekmez.
  `PAGES_BASE`'i Vercel'de **tanımlamayın** — bütün linkler alt klasöre kayar.
- **GitHub Pages** (opsiyonel, kapalı): `.github/workflows/deploy.yml` yalnızca elle
  tetiklenir; `push` tetiği yorum satırındadır. `public/.nojekyll` bu senaryo için
  gereklidir, silmeyin.
