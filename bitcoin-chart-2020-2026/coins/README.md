# Coins — một video cho mỗi đồng (BTC, ETH, SOL, BNB, DOGE, …)

Mỗi đồng là một thư mục `coins/<SYMBOL>/`. Chọn đồng bằng biến môi trường `COIN` (mặc định `BTC`):

```
coins/<SYMBOL>/
  coin.json            tên, cặp ("ETH / USD"), mã TradingView, logo, màu, xáo nhạc
  data/                tradingview/*.csv, events.csv, phases.csv (anchors.csv tùy chọn)   — Bitcoin giữ ở ./data
  logo.png             logo chính thức (nền trong suốt)                                 — Bitcoin: assets/bitcoin-logo.png
  logo-negative.png    logo đảo màu (nền giữa chart)                                    — Bitcoin: assets/bitcoin-logo-negative.png
  chapter-names.json   tên chương YouTube theo ngày sự kiện
```

`coin.json`:

```json
{
  "symbol": "ETH", "name": "Ethereum", "pair": "ETH / USD", "tradingview": "INDEX:ETHUSD",
  "eventsSource": "…",
  "logo": "coins/ETH/logo.png", "logoNegative": "coins/ETH/logo-negative.png", "logoGlow": "#627EEA",
  "colors": { "accent": "#8A92FF", "accent2": "#C3C8FF", "bg1": "#0E1036", "bg0": "#03030E",
              "grid": "rgba(138,146,255,0.09)", "gridMajor": "rgba(138,146,255,0.32)" },
  "special": "#FFC93C"
}
```

- `colors` ghi đè màu của look `hologram` (`film.js`): vẫn phong cách glow tech, chỉ đổi tông. Nến tăng/giảm luôn
  xanh/đỏ (quy ước thị trường) cho mọi đồng.
- `special`: màu nhãn sự kiện có `tag` (Bitcoin: halving; ETH: nâng cấp mạng…), mặc định vàng `#FFC93C`.
- `musicShuffle`: mặc định xáo thứ tự các bài đã duyệt theo mã đồng (cố định giữa các lần chạy). Bitcoin = `false`.

## Bảng màu đề xuất (glow tech — chờ người dùng duyệt từng đồng khi làm)

| Đồng | accent (đường nét) | accent2 (ngày, phụ) | nền bg1 → bg0 | logoGlow | special |
|---|---|---|---|---|---|
| **BTC** (đang dùng) | cyan `#00E5FF` | `#8AF6FF` | navy `#03142B` → `#01040C` | cam `#F7931A` | vàng `#FFC93C` |
| **ETH** | tím chàm `#8A92FF` | `#C3C8FF` | `#0E1036` → `#03030E` | `#627EEA` | vàng `#FFC93C` |
| **SOL** | tím `#B57BFF` | xanh ngọc `#7EE8FF` | `#170B2E` → `#06030D` | `#9945FF` | vàng `#FFC93C` |
| **BNB** | hổ phách `#F3BA2F` | `#FFE08A` | `#1C1505` → `#080602` | `#F3BA2F` | cyan `#00E5FF` |
| **DOGE** | vàng đồng `#D9B95A` | `#F4E3A8` | `#1A1408` → `#070502` | `#C2A633` | cyan `#00E5FF` |
| **XRP** | xám thép `#9FB8D6` | `#E6EEF8` | `#0B1220` → `#03060C` | `#9FB8D6` | vàng `#FFC93C` |
| **ADA** | xanh hoàng gia `#3D7BFF` | `#9DBBFF` | `#06103A` → `#02040F` | `#0033AD` | vàng `#FFC93C` |

Đồng chưa có trong bảng: đề xuất theo màu thương hiệu của đồng (tông chính → accent, nền tối cùng tông), tránh màu
quá gần xanh/đỏ của nến; người dùng duyệt.

## Làm một đồng mới (quy trình chi tiết: PROJECT.md §11)

```bash
COIN=ETH node fetch-tradingview.js CRYPTO:ETHUSD --print       # thử vài mã, chọn mã có lịch sử dài nhất
COIN=ETH node fetch-tradingview.js                              # lưu (mã trong coin.json)
COIN=ETH node make-data.js && COIN=ETH node detect-phases.js && COIN=ETH node make-data.js --strict
ffmpeg -i coins/ETH/logo.png -vf "negate=negate_alpha=0" coins/ETH/logo-negative.png   # logo đảo màu cho nền
COIN=ETH node song.js && FPS=60 node engine/render.js video --res 480 && FPS=60 node engine/render.js mux eth-preview --res 480
COIN=ETH node youtube-chapters.js
```

## Đầy đủ sự kiện nguồn cho mọi coin

Tuân thủ PROJECT.md §13: lưu đủ nghiên cứu 0/1/2; đối chiếu từng ID 99Bitcoins bằng `data/99bitcoins-coverage.json`
(BTC: `data/` gốc). Chạy `python3 audit-99bitcoins.py --live` cho toàn bộ coin trước khi báo hoàn tất và trước final.
Trang giá hoặc redirect sang BTC không phải timeline altcoin; luôn ghi rõ giới hạn nguồn.

Hiển thị theo PROJECT.md §14: BTC chỉ 1/2; **mọi altcoin hiện đủ 0/1/2**, gồm cả Shorts. Mức 0 nhỏ/xám, không SFX.
