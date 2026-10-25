# Bitcoin Chart Film — tài liệu bàn giao (đọc trước khi làm bất cứ điều gì)

Video hoạt hình biểu đồ nến ngày BTC/USD từ 2010 đến nay. Mọi khung hình được vẽ bằng code (canvas), mọi âm
thanh được tổng hợp bằng code; không có file nhạc hay hình ảnh có sẵn ngoài logo Bitcoin.

Tài liệu này ghi lại **yêu cầu đã được người dùng (chủ dự án) duyệt**. Model/AI nào tiếp quản dự án phải giữ đúng
các quy tắc ở đây; chỉ thay đổi khi người dùng yêu cầu, và cập nhật lại file này sau mỗi thay đổi đã được duyệt.

---

## 1. Quy trình làm việc với người dùng (bắt buộc)

1. Người dùng giao tiếp bằng **tiếng Việt** → trả lời bằng tiếng Việt. Chữ hiển thị TRONG video là **tiếng Anh**.
2. Sau mỗi đợt thay đổi: **render preview chất lượng thấp** (đoạn ngắn, ví dụ 2017–2018 và đoạn có vấn đề),
   gửi người dùng xem, **chờ duyệt "OK" rồi mới làm tiếp**. Không tự render bản đầy đủ khi chưa được yêu cầu.
3. Không nghe được âm thanh → chỉ báo số đo (LUFS, levels), nói rõ là chưa nghe, mời người dùng nghe góp ý.
4. Commit + push lên branch `claude/bitcoin-price-chart-animation-l7ta0e` sau mỗi thay đổi (repo
   `congminh12000/bao-tarot`). Không tạo Pull Request nếu không được yêu cầu.
5. Thông tin sự kiện (tên, ngày) **phải trung thực**: không bịa nguyên nhân; chỗ không chắc thì nói rõ.
   Giá trên nhãn lấy từ dữ liệu TradingView, không lấy từ trí nhớ.

## 2. Đặc tả video (đã duyệt)

| Hạng mục | Yêu cầu |
|---|---|
| Khung hình | 16:9. Bản cuối: 1920×1080, 24 fps (preview: `--draft` 960×540; demo đã dùng 1032×580 @30 fps) |
| Phong cách | "Glow Technology" — mẫu **A Hologram** (`look.js` → `hologram`): nền xanh navy đậm, đường nét cyan, bloom, bụi sáng nhẹ, scanline |
| Nến | Nến ngày, xanh = tăng, đỏ = giảm, chạy từ trái qua phải, camera bám theo nến đang chạy |
| Zoom | `PPD = 16.06` px/ngày (đã zoom 2 lần ×1.3 so với 9.5) |
| Nền giữa | Logo Bitcoin **âm bản** (`assets/bitcoin-logo-negative.png`, đảo màu từ logo cam), mờ (alpha 0.1), lắc nhẹ, vòng quét cyan |
| Góc trái trên | Chỉ `BTC / USD` + ngày dạng `Mar 12, 2020` (chữ ngày nhỏ hơn) |
| Góc phải trên | Chỉ **giá đang chạy**, mép phải thẳng hàng mép phải chart. **Không có %** |
| Bên phải chart | Không có bubble giá; chỉ có **đường chấm chấm** từ nến đang chạy tới trục giá |
| Mở đầu | Chữ "BITCOIN" + `năm đầu → năm cuối` |
| Kết thúc | Camera lùi ra toàn cảnh + khung "`năm → năm`: giá đầu → giá cuối (×…)" |
| Ngôn ngữ trong video | Tiếng Anh |

## 3. Nhãn sự kiện (đã duyệt)

- Nguồn: `data/events.csv` (`date,kind,hit,text`). `kind`: up/down/info. `hit`: 0 nhỏ, 1 quan trọng, 2 lớn nhất.
- Nhãn **up** (và info) đặt **phía trên** nến; nhãn **down** đặt **phía dưới** nến. **Không bao giờ đè lên nến**
  (tính cả những nến chưa chạy tới nằm dưới bề ngang nhãn).
- Đường dẫn: **gấp khúc 2 đoạn** (chéo rồi ngang). Nếu đường gấp khúc quá dài (>110 px) → dùng **đường thẳng đứng ngắn**, nhãn đặt giữa nến.
- Ưu tiên vị trí: **bên phải** nến → **giữa** → xa hơn bên phải (đường ngang dài hơn) → **bên trái**; thử ở tầng
  sát nến trước rồi mới xếp tầng xa hơn. Trường hợp không còn chỗ: phía ngược lại, bên trái (vd. trên-trái).
- **Không bao giờ bỏ nhãn nào.** Các nhãn không được đè nhau, có khoảng cách rõ ràng (28 px ngang, 22 px dọc);
  nhãn mới còn chừa chỗ cho nhãn đỉnh/đáy sắp xuất hiện.
- Vị trí nhãn được **tính 1 lần lúc sự kiện xảy ra rồi cố định** theo cây nến.
- Nhãn **còn hiển thị khi còn trong khung hình**; chỉ mờ dần khi trôi ra khỏi mép trái.
- 3 cấp: nhỏ (22px, xám mờ) · quan trọng (31px, màu, nền nhuộm màu, glow) · lớn nhất (34px, glow nhấp nháy).
  Nhãn quan trọng lớn hơn nhãn thường ~50% (không hơn).
- Mỗi đỉnh/đáy giữa 2 giai đoạn **luôn có nhãn**: dùng sự kiện trong ±7 ngày (nâng lên hit), nếu không có thì
  tự tạo `TOP: $X` / `BOTTOM: $X` từ dữ liệu.
- Hiệu ứng: sự kiện giảm → màn hình rung nhẹ tăng dần + viền tối đỏ + SFX trầm; sự kiện tăng → viền tỏa sáng xanh + SFX chuông.

## 4. Giai đoạn và nhạc (đã duyệt)

- Chỉ 2 loại giai đoạn (`data/phases.csv`, tạo bởi `detect-phases.js`, sửa tay được):
  - **UPTREND** = từ đáy kỳ trước → đỉnh kỳ sau; **DOWNTREND** = từ đỉnh kỳ trước → đáy kỳ sau.
  - Đỉnh/đáy: zig-zag giá đóng cửa, đảo chiều ≥ 45% (`REVERSAL`), sóng < 45 ngày bị bỏ (`MIN_DAYS`).
- Nhạc (`data/music.js`), giọng quanh Rê thứ, thay phiên các bản cùng loại:
  - Uptrend: **Ascent 100 BPM**, **Euphoria 104 BPM**. Downtrend: **Freefall 98 BPM**, **Pressure 96 BPM**.
- **Chuyển giao ở đỉnh/đáy** (`TURN` trong `data/music.js`):
  - Nhạc và nến **giữ nguyên tốc độ** cho tới đúng khoảnh khắc **nhãn đỉnh/đáy hiện ra** (không chậm trước, không có khoảng lặng trước).
  - Lúc đó **phanh** (0.5 phách) xuống **60 BPM**, **giữ chậm 3 giây**, rồi **tăng tốc mượt (smoothstep) trong ~3 giây** về tempo bản nhạc mới.
- Nghe thử 1 bản: `PREVIEW_CUE=up-ascent node song.js` → `out/music.wav`.

## 5. Tốc độ nến (đã duyệt)

- **Nến chạy theo nhạc**: trong một giai đoạn, mỗi phách nhạc hiển thị một số ngày cố định.
  - Ngày/phách = (ngày/ô nhịp theo thời kỳ × `SPEED`) ÷ 4. Thời kỳ: ≤2012 = 130, 2013–2019 = 85, ≥2020 = 70 ngày/ô nhịp.
  - **`SPEED = 0.35`** (đã chọn). Ví dụ 2017 ở 100 BPM ≈ 12 ngày/giây.
  - Tốc độ (ngày/giây) = ngày/phách × BPM ÷ 60. Nến nhích nhẹ theo từng phách (`PULSE = 0.3`).
- Sự kiện **không** được ghim vào phách (ghim làm tốc độ méo, nến như phanh trước đỉnh).

## 6. Dữ liệu

- Giá thật: `data/tradingview/*.csv` (TradingView `INDEX:BTCUSD` 1D, người dùng export). File đứng sau ghi đè file trước nếu trùng ngày.
- Phim bắt đầu từ ngày đầu tiên có volume (17/07/2010). Lỗ hổng trong dữ liệu (06/2011, 23/06/2013) được nối bằng nến phẳng nội suy.
- `data/anchors.csv`: giá ước lượng, chỉ dùng khi không có dữ liệu TradingView.
- Hướng dẫn cập nhật dữ liệu: `data/README.md`.
- Sự kiện được viết từ kiến thức của AI (không tra nguồn); người dùng đang nhờ kiểm chứng. Các dòng chưa chắc:
  Spot ETF (duyệt 10/01/2024), halving 2024 (20/04 UTC), Facebook Libra (công bố 18/06/2019), Xi (24–25/10/2019),
  China crackdown (19/05/2021), Tariff shock (04/2025), $19B liquidation (10/10/2025). Sau 02/2026 chỉ ghi giá.

## 7. Cấu trúc code

```
bitcoin-chart-2020-2026/
  make-data.js       gộp data/ → btc-data.js (giá, sự kiện, giai đoạn + bản nhạc của từng giai đoạn)
  detect-phases.js   tìm uptrend/downtrend → data/phases.csv
  score.js           "nguồn sự thật": giai đoạn → phách, bản đồ tempo, ngày↔thời gian, sự kiện, hợp âm
  song.js            tổng hợp nhạc từ score + data/music.js → out/music.wav
  film.js            vẽ từng khung hình (camera, nến, nhãn, HUD, hiệu ứng) — hàm thuần của t
  look.js            chọn phong cách (hologram)
  index.html         tải engine + data + score + film trong Chrome headless
  data/              events.csv, phases.csv, music.js, tradingview/, anchors.csv, README.md
  assets/            logo Bitcoin (gốc + âm bản)
  engine/            bộ công cụ render/âm thanh (không sửa theo từng phim)
```

## 8. Lệnh thường dùng

Cần Node 22+, ffmpeg, Google Chrome/Chromium. Chạy trong thư mục `bitcoin-chart-2020-2026`.

```bash
node make-data.js                          # dữ liệu đầy đủ 2010 → nay
node detect-phases.js && node make-data.js # tính lại giai đoạn (chạy trên dữ liệu ĐẦY ĐỦ)
LUFS=-14 node song.js                      # nhạc
node engine/render.js stills 30 60         # ảnh tĩnh tại giây 30, 60 → out/stills/
# preview chất lượng thấp một đoạn:
FROM=2017-01-01 TO=2018-12-31 node make-data.js && LUFS=-14 node song.js
node engine/render.js video --draft && node engine/render.js mux --draft
node engine/render.js verify --draft       # kiểm tra khớp hình/tiếng ở các điểm hit
node make-data.js && LUFS=-14 node song.js # LUÔN khôi phục dữ liệu đầy đủ sau khi render đoạn ngắn
# bản cuối 1080p 24fps:
node engine/render.js video && node engine/render.js mux && node engine/render.js verify
# đổi FPS: FPS=30 node … ; độ phân giải khác: --res 580 (cạnh ngắn, px)
```

Môi trường cloud chạy bằng root: Chrome cần `--no-sandbox` → đặt `CHROME_PATH` tới một script bọc
`exec /path/to/chrome --no-sandbox "$@"`. Trên máy cá nhân (Mac) không cần.

## 9. Các thông số chỉnh nhanh

| Muốn | Sửa |
|---|---|
| Nến nhanh/chậm hơn | `SPEED` trong `score.js` |
| Nhịp nhích theo phách | `PULSE` trong `score.js` |
| Zoom | `PPD` trong `film.js` |
| Tempo bản nhạc | `bpm` từng cue trong `data/music.js` |
| Chậm ở đỉnh/đáy | `TURN` trong `data/music.js` (`slowBpm`, `holdSec`, `rampSec`, `brakeBeats`) |
| Độ nhạy đỉnh/đáy | `REVERSAL`, `MIN_DAYS` trong `detect-phases.js` |
| Sự kiện | `data/events.csv` |
| Cỡ chữ nhãn | `sizeOf` trong `film.js` |

## 10. Trạng thái hiện tại

- Đã duyệt tới preview v2 (2017–2018, 2022–2023) — đang chờ người dùng kiểm chứng danh sách sự kiện (nhờ ChatGPT).
- Bản đầy đủ 2010–2026 dài ~8 phút 45 giây ở `SPEED 0.35`; chưa render bản cuối.
