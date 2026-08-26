# Clear Cart — tanıtım sitesi

Clear Cart'ın iki dilli (Türkçe + İngilizce) statik tanıtım sitesi.
Astro + Tailwind CSS ile kurulmuştur; arkasında veritabanı, kullanıcı girişi veya
yönetim paneli yoktur.

Sayfalar:

| Adres | İçerik |
|---|---|
| `/tr/` — `/en/` | Ana sayfa (yedi bölüm) |
| `/tr/hakkimizda/` — `/en/about/` | Hakkımızda + ekip |
| `/` | `/tr/`'ye yönlendirir |

Yayında: <https://clear-cart.vercel.app>

---

## Kurulum

```bash
npm install
npm run dev      # http://localhost:4321
```

| Komut             | Ne yapar                                      |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Geliştirme sunucusunu başlatır                |
| `npm run build`   | Statik siteyi `dist/` klasörüne derler        |
| `npm run preview` | Derlenmiş siteyi yerelde açar (build sonrası) |

**Node 22.12 veya üzeri gerekir.** (Astro 7'nin kendi gereksinimi budur; sürüm
`package.json` içindeki `engines` alanında da yazılıdır.)

---

## Metinleri düzenleme

Sayfadaki **hiçbir metin bileşenlerin içine yazılmaz.** Tamamı şu iki dosyada yaşar:

- `src/i18n/tr.json` — Türkçe metinlerin tamamı
- `src/i18n/en.json` — İngilizce metinlerin tamamı

İki dosyanın **anahtarları birebir aynı olmak zorundadır.** Birine yeni bir anahtar
eklerseniz diğerine de ekleyin; eksik anahtar derleme sırasında hata verir.

> **Tek istisna: çevrilmeyen bilgiler.** E-posta, sosyal hesap adresleri ve ekip isimleri
> `src/config.ts` içindedir. Bunlar dile göre değişmediği için iki JSON'a kopyalanmaları
> gereksiz tekrar ve ayrışma riski olurdu.

Anahtar parite kontrolü:

```bash
node -e "const a=require('./src/i18n/tr.json'),b=require('./src/i18n/en.json');const w=(o,p='')=>Object.entries(o).flatMap(([k,v])=>{const K=p?p+'.'+k:k;return v&&typeof v==='object'?w(v,K):[K]});const A=w(a),B=w(b);console.log(A.filter(k=>!B.includes(k)),B.filter(k=>!A.includes(k)))"
```

---

## Ekran görüntüleri

Hero bölümünde `src/img/mockup.png` (kendi mor zeminiyle gelen 3B telefon görseli),
"Uygulamadan görüntüler" bölümünde ise `src/img/screens/` altındaki üç ekran
görüntüsü kullanılır: `home.png`, `allergens.png`, `scan-result.png`.

Görseller `src/img/` altında durur ve `astro:assets` içindeki `<Image />` ile
sunulur; boyutlandırma, WebP dönüşümü ve `srcset` üretimini Astro kendisi yapar.
Bu yüzden `public/` değil `src/` altında olmaları gerekir.

**Yeni ekran görüntüsü eklemek / değiştirmek:**

1. Ham görüntüyü `src/img/` içine koyun.
2. Galeri kutuları `9 / 19.5` oranındadır (`.screen-frame`, `object-fit: cover`).
   Mevcut üç görüntü bu orana getirilmiştir; farklı oranda bir görsel kenarlarından
   kırpılır. Gerekirse `sharp` ile kırpın ya da kenar pikselini kopyalayarak uzatın:

   ```bash
   node --input-type=module -e "
   import sharp from 'sharp';
   await sharp('src/img/ham.png')
     .extract({ left: 0, top: 0, width: 1067, height: 2074 })
     .extend({ top: 200, bottom: 38, extendWith: 'copy' })
     .png().toFile('src/img/screens/yeni.png');
   "
   ```

3. `src/components/Screenshots.astro` içinde import edip `sources` dizisine ekleyin.
4. Başlığı ve `alt` metnini **iki dilde** `src/i18n/tr.json` ve `src/i18n/en.json`
   içindeki `screens.items` dizisine yazın (`caption` + `alt`). Anahtar eksikse
   derleme hata verir, böylece iki dil ayrışmaz.
5. Hero görseli `loading="eager"` ile yüklenir (ilk ekranda görünüyor),
   galerideki görseller `lazy`.

Kutu stili `src/styles/global.css` içindeki `.screen-frame` sınıfındadır.

---

## Ekip (Hakkımızda sayfası)

Ekip iki parçadan oluşur ve **ikisi ayrı yerde durur:**

| Ne | Nerede | Neden |
|---|---|---|
| İsimler | `src/config.ts` → `SITE.team` | İsimler çevrilmez; iki JSON'a yazılsalardı bir düzeltme iki dosya değiştirmeyi gerektirirdi |
| Fotoğraflar | `src/img/team/` + `About.astro` → `photos` | `astro:assets` görselleri koddan import edilmek zorundadır |

> **Sıra kuralı:** `SITE.team` ile `About.astro`'daki `photos` dizisi **aynı sırada**
> olmalıdır. Birinde sırayı değiştirip diğerinde değiştirmezseniz fotoğraf yanlış isme
> düşer — ve build bunu **yakalamaz**, sessizce yanlış sayfa yayınlanır.

**Kişi eklemek / değiştirmek:**

1. Fotoğrafı `src/img/team/` içine koyun. **Kare (1:1)** olması idealdir; değilse
   `object-fit: cover` kenarlarından kırpar.
2. `About.astro`'da import edip `photos` dizisine ekleyin.
3. `src/config.ts` → `SITE.team` dizisine ismi **aynı sıraya** yazın.
4. Başlık ve giriş metni `src/i18n/*.json` → `about` altındadır (iki dilde de).

Fotoğraflar `.avatar-frame` içinde yuvarlak gösterilir. `alt=""` bilinçlidir: isim hemen
altta yazdığı için fotoğraf dekoratiftir, ekran okuyucu iki kez okumaz.

`<Image />` çağrısında **`widths` değil `densities` kullanın.** Daire sabit 160px olduğu
için `width={160} height={160} densities={[1, 2]}` doğrudur. `widths` verirseniz Astro
`src` yedeği olarak orijinal boyutu üretir — 3000px'lik bir fotoğrafta bu, hiç
kullanılmayan yüzlerce KB demektir.

---

## Logo ve favicon

Kaynak logo: **`src/img/clear_cart_logo.png`** (pembe zemin + sepet + üç kesişen
yuvarlak + "CLEAR CART" yazısı).

Sitede yalnızca **sepet ve arkasındaki üç yuvarlak** kullanılır; alttaki yazı ve dış
zemin kırpılır, köşeler yuvarlatılır. Üretilen dosyalar:

| Dosya                          | Nerede kullanılıyor            |
| ------------------------------ | ------------------------------ |
| `public/logo.png` (512px)      | Header ve footer'daki işaret   |
| `public/apple-touch-icon.png`  | iOS ana ekran ikonu            |
| `public/favicon-32.png`        | Tarayıcı sekmesi               |
| `public/favicon-16.png`        | Tarayıcı sekmesi (küçük)       |

Logo değişirse tek komutla hepsi yeniden üretilir:

```bash
python scripts/make-logo.py
npx -y sharp-cli --input src/img/og-image.svg --output public/og-image.png resize 1200 630
```

Betik `Pillow` ister (`pip install pillow`) ve bilerek `package.json`'a bağımlılık
olarak eklenmemiştir — yalnızca logo değişince, elle çalıştırılır.

> Yeni logonun oranları farklıysa `scripts/make-logo.py` içindeki `SRC_BOX`
> koordinatlarını yeniden ölçün; betik kırpma kutusunu otomatik bulmaz.

---

## Sosyal medya görseli (og-image)

`src/img/og-image.svg` marka renkleriyle hazırlanmış kaynak dosyadır (yayınlanmaz, sadece PNG üretmek için); marka işareti
içine **data URI olarak gömülüdür** (harici dosya referansı SVG → PNG dönüşümünde
çözülmüyor). `scripts/make-logo.py` bu gömülü hâli de günceller.

**Sosyal medya botları SVG işlemez**, bu yüzden yayınlanan dosya PNG olmalıdır.
Kaynağı değiştirdiğinizde PNG'yi şu komutla yeniden üretin:

```bash
npx -y sharp-cli --input src/img/og-image.svg --output public/og-image.png resize 1200 630
```

`sharp-cli` bilerek projeye bağımlılık olarak eklenmemiştir; `npx` ile tek seferlik
çalışır. `public/og-image.png` yoksa `og:image` etiketi hiç üretilmez.

---

## Bekleme listesi formu

Form [Formspree](https://formspree.io)'ye düz `fetch` ile POST atar — ek paket yoktur.
Endpoint `src/config.ts` içindeki `formEndpoint` değerinden okunur.

- JavaScript açıkken: sayfa yenilenmez, başarı/hata mesajı aynı sayfada gösterilir.
- JavaScript kapalıyken: `<form action method="POST">` klasik yoldan çalışır,
  kullanıcı Formspree'nin kendi teşekkür sayfasına düşer.
- Ücretsiz plan sınırı **ayda 50 gönderim**. Aşılırsa Formspree isteği reddeder ve
  kullanıcıya hata mesajı gösterilir.

Gelen kayıtlar `clearcart.app@gmail.com` adresine düşer.

---

## Deploy

### Vercel — asıl yayın yolu

Ayar gerekmez; Astro otomatik algılanır, `npm run build` çalışır ve `dist/` yayınlanır.
Repo Vercel'e bağlı olduğu için `main` dalına yapılan push otomatik yayına gider.
`PAGES_BASE` ortam değişkenini Vercel'de **tanımlamayın** — tanımlanırsa bütün linkler
gereksiz bir alt klasöre kayar.

### GitHub Pages — opsiyonel, şu an kullanılmıyor

`.github/workflows/deploy.yml` hazır durumda ama **yalnızca elle** çalışır
(Actions sekmesi → Run workflow); otomatik tetikleyicisi yorum satırına alınmıştır.
Kullanmak isterseniz o `push` bloğunu yorumdan çıkarın ve repo ayarlarında
**Settings → Pages → Build and deployment → Source: GitHub Actions** seçin.

Site repo adı altında yayınlanacağı için build sırasında `PAGES_BASE=/<repo-adi>`
verilir; workflow bunu repo adından otomatik alır. Yerelde aynı çıktıyı denemek için:

```bash
PAGES_BASE=/clearcart-website npm run build && npm run preview
```

`public/.nojekyll` dosyası, Jekyll'in `_astro/` klasörünü yok saymaması için vardır;
silmeyin.

---

## Doldurulması / güncellenmesi gereken değerler

Hepsi tek dosyada: **`src/config.ts`**. Hiçbiri bileşenlerin içine sabit yazılmaz.

| Alan           | Şu anki değer                     | Ne zaman değişir                       |
| -------------- | --------------------------------- | -------------------------------------- |
| `siteUrl`      | `https://clear-cart.vercel.app`   | Kendi alan adınız alındığında          |
| `email`        | `clearcart.app@gmail.com`         | Kurumsal e-posta adresine geçildiğinde |
| `instagram`    | `instagram.com/clear_cart`        | Hesap adı değişirse                    |
| `linkedin`     | `linkedin.com/company/clear1cart` | Sayfa adresi değişirse                 |
| `formEndpoint` | `formspree.io/f/mzepkbew`         | Formspree formu değişirse              |
| `team`         | Üç kişi                           | Ekip değişirse (yukarıdaki bölüme bakın) |

`siteUrl` boş bırakılırsa `canonical`, `hreflang`, `og:url` ve `sitemap.xml`
**hiç üretilmez** — yanlış alan adı vermektense hiç vermemek tercih edilmiştir.

Gerçek ekran görüntüleri ve hero mockup’ı eklendi (yukarıdaki bölüme bakın).
Logo ve favicon `src/img/clear_cart_logo.png` dosyasından üretilmiş durumda.

---

## Yeni sayfa eklemek

`src/pages/` içine dosya koymak adres oluşturur; ama alt sayfalarda **üç şeyi elle
vermeniz gerekir**, yoksa sessizce yanlış metadata üretilir (build hata vermez):

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { aboutPath, useTranslations } from '../../i18n/ui.ts';

const lang = 'tr' as const;
const t = useTranslations(lang);
const paths = { tr: aboutPath('tr'), en: aboutPath('en') };
---

<BaseLayout
  lang={lang}
  paths={paths}
  title={t('about.metaTitle')}
  description={t('about.metaDescription')}
>
```

| Prop | Vermezseniz ne olur |
| --- | --- |
| `paths` | `canonical`, `hreflang` ve `og:url` dilin **kökünü** gösterir. Header'daki dil değiştirici de ana sayfaya atar. |
| `title` | Sayfa, ana sayfanın `<title>`'ını alır |
| `description` | Aynısı açıklama için |

Sayfa yolu iki dilde farklıysa (`hakkimizda` / `about`) `src/i18n/ui.ts` içindeki
`aboutPath()` kalıbını kopyalayın — slug'ları `Record<Lang, string>` ile tutun ki bir
dil eklendiğinde TypeScript eksik slug'ı bildirsin.

Bölüm çapaları **çevrilmez** ve `Header.astro` bunları `langPath(lang)` ile mutlak yazar
(`/tr/#ozellikler`), böylece alt sayfalardan tıklanınca ana sayfaya gidip doğru bölüme
kayarlar. Ana sayfada davranış değişmez.

---

## Telif

© 2026 Clear Cart. Tüm hakları saklıdır.
Bu depo şeffaflık için herkese açıktır; içeriği yeniden kullanım için lisanslanmamıştır.

© 2026 Clear Cart. All rights reserved.
This repository is public for transparency; its contents are not licensed for reuse.
