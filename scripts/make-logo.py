"""
Marka işaretini orijinal logodan yeniden üretir.

Kaynak : src/img/clear_cart_logo.png  (pembe zemin + sepet + üç yuvarlak + "CLEAR CART" yazısı)
Çıktı  : public/logo.png, apple-touch-icon.png, favicon-32.png, favicon-16.png
         ve src/img/og-image.svg içine gömülü marka işareti.

Yalnızca sepet ve arkasındaki üç kesişen yuvarlak alınır; alttaki yazı ve
dış zemin kırpılır, köşeler yuvarlatılır.

Kullanım:  python scripts/make-logo.py
Gereksinim: Pillow  (pip install pillow)

Logo dosyası değişirse SRC_BOX değerlerini yeniden ölçün — betik bunu
otomatik yapmaz, kutu koordinatları mevcut logoya göre sabittir.
"""

import base64
import io
import os
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'src' / 'img' / 'clear_cart_logo.png'
PUBLIC = ROOT / 'public'

BG = (171, 138, 191)  # #ab8abf — logonun kendi zemin rengi
SRC_BOX = (326, 153, 4439, 3796)  # sepet + üç yuvarlak; "CLEAR CART" yazısı hariç
CORNER = 0.22  # köşe yarıçapı, kenarın oranı olarak
PADDING = 1.09  # kare kenar = en uzun kenar * bu oran

SIZES = {
    'logo.png': 512,
    'apple-touch-icon.png': 180,
    'favicon-32.png': 32,
    'favicon-16.png': 16,
}


def build_tile() -> Image.Image:
    mark = Image.open(SRC).convert('RGB').crop(SRC_BOX)
    mw, mh = mark.size
    side = int(max(mw, mh) * PADDING)

    tile = Image.new('RGB', (side, side), BG)
    tile.paste(mark, ((side - mw) // 2, (side - mh) // 2))

    mask = Image.new('L', (side, side), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, side - 1, side - 1], radius=int(side * CORNER), fill=255
    )
    tile = tile.convert('RGBA')
    tile.putalpha(mask)
    return tile


def embed_in_og(tile: Image.Image) -> None:
    """og-image.svg içindeki <image> etiketini güncel logoyla değiştirir.

    Harici dosya referansı (href="logo.png") SVG -> PNG dönüşümünde
    çözülmediği için logo data URI olarak gömülür.
    """
    buf = io.BytesIO()
    tile.resize((256, 256), Image.LANCZOS).save(buf, format='PNG')
    b64 = base64.b64encode(buf.getvalue()).decode()

    path = ROOT / 'src' / 'img' / 'og-image.svg'
    svg = path.read_text(encoding='utf-8')
    start = svg.index('<image ')
    end = svg.index('/>', start) + 2
    svg = (
        svg[:start]
        + f'<image x="96" y="140" width="104" height="104" '
        + f'xlink:href="data:image/png;base64,{b64}" />'
        + svg[end:]
    )
    path.write_text(svg, encoding='utf-8', newline='\n')


def main() -> None:
    tile = build_tile()
    for name, size in SIZES.items():
        tile.resize((size, size), Image.LANCZOS).save(PUBLIC / name)
        print(f'{name}: {size}x{size}')

    embed_in_og(tile)
    print('src/img/og-image.svg güncellendi — PNG için:')
    print('  npx -y sharp-cli --input src/img/og-image.svg '
          '--output public/og-image.png resize 1200 630')


if __name__ == '__main__':
    main()
