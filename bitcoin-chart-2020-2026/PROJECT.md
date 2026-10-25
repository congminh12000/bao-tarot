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
   Preview mặc định: **30 fps, 16:9, 480p** (854×480): `FPS=30 … --res 480` (lệnh ở §8), trừ khi người dùng chọn khác.
3. Không nghe được âm thanh → chỉ báo số đo (LUFS, levels), nói rõ là chưa nghe, mời người dùng nghe góp ý.
4. Commit + push lên branch `claude/bitcoin-price-chart-animation-l7ta0e` sau mỗi thay đổi (repo
   `congminh12000/bao-tarot`). Không tạo Pull Request nếu không được yêu cầu.
5. Thông tin sự kiện (tên, ngày) **phải trung thực**: không bịa nguyên nhân; chỗ không chắc thì nói rõ.
   Giá trên nhãn lấy từ dữ liệu TradingView, không lấy từ trí nhớ.
6. Khi người dùng nói **"render video final"** (bản cuối, phim đầy đủ): hỏi **3 bước, lần lượt từng bước**, mỗi bước
   một câu hỏi có lựa chọn, rồi mới render:
   1. **FPS**: 24 · **30** · 60
   2. **Tỷ lệ khung hình**: **16:9** · 1:1 · 9:16
   3. **Độ phân giải**: **Full HD** · 2K · 4K
   Mặc định (in đậm): **30 fps, 16:9, Full HD**. Cách chạy: `FPS=<fps> node engine/render.js video --format <tỷ lệ>
   --res <1080|1440|2160>` (cạnh ngắn, px), rồi `mux` + `verify` với cùng các tham số. Layout `film.js` được thiết kế
   cho 16:9; với 1:1 / 9:16 phải render preview kiểm tra bố cục trước khi chạy bản cuối.

## 2. Đặc tả video (đã duyệt)

| Hạng mục | Yêu cầu |
|---|---|
| Khung hình | 16:9. Bản cuối: hỏi 3 bước (§1.6), mặc định 1920×1080 @30 fps. Preview: 854×480 @30 fps (`FPS=30 … --res 480`) |
| Phong cách | "Glow Technology" — mẫu **A Hologram** (`look.js` → `hologram`): nền xanh navy đậm, đường nét cyan, bloom, bụi sáng nhẹ, scanline |
| Nến | Nến ngày, xanh = tăng, đỏ = giảm, chạy từ trái qua phải, camera bám theo nến đang chạy |
| Zoom | `PPD = 16.06` px/ngày (đã zoom 2 lần ×1.3 so với 9.5) |
| Nền giữa | Logo Bitcoin **âm bản** (`assets/bitcoin-logo-negative.png`, đảo màu từ logo cam), mờ (alpha 0.1), lắc nhẹ, vòng quét cyan |
| Góc trái trên | Chỉ `BTC / USD` + ngày dạng `Mar 12, 2020` (chữ ngày nhỏ hơn) |
| Góc phải trên | Chỉ **giá đang chạy**, mép phải thẳng hàng mép phải chart. **Không có %**. Chưa có dữ liệu giá → không hiện giá |
| Bên phải chart | Không có bubble giá; chỉ có **đường chấm chấm** từ nến đang chạy tới trục giá |
| Trục X / Y | 2 đường trục (đáy chart, trục giá) **luôn vẽ trên cùng**: không nhãn, sóng xung kích hay hiệu ứng nào đè lên |
| Mở đầu | **Pre-run**: nến của 180 ngày trước đoạn phim đã chạy sẵn (cùng tốc độ phase đầu; ngày chưa có dữ liệu thì lưới/ngày vẫn chạy nhưng không có nến, không giá). Chữ "BITCOIN" + `năm đầu → năm cuối` (glow nhẹ: 12 / 5) **hiện ngay khung đầu** trên nền mờ + tối, giữ 1,1 s, tắt hẳn ở **1,5 s**. **Không có nhạc** trong lúc tiêu đề; nhạc vào ở phách kế tiếp (~1,8 s) bằng timpani + crash |
| Kết thúc | Camera lùi ra toàn cảnh. Giữ lại nhãn **mức 2** (kể cả ATH/ATL) và **halving**, thu nhỏ quanh cây nến của chúng (giữ hình dạng lúc xuất hiện); nhãn mức 1 mờ đi. Trục giá: mốc thưa nhất (1, 1-3, 1-2-5…) mà vẫn ≥ 6 mốc. **Ô tổng kết** tinh gọn kiểu glow tech (kính sáng, viền neon đôi, góc trắng, vệt sáng quét 1 lần): hàng trên = năm (30px, sát phải); hàng dưới = giá đầu → giá cuối (chạy số) + chip % cùng hàng; tự giãn theo độ dài số, góc dưới phải chart |
| Ngôn ngữ trong video | Tiếng Anh |

## 3. Nhãn sự kiện (đã duyệt)

- Nguồn: `data/events.csv` (`date,kind,hit,tag,text`) — 99Bitcoins (ATH theo TradingView), người dùng soạn/kiểm chứng.
  `tag`: để trống, hoặc `halving` = sự kiện nội tại đặc biệt → nhãn **màu vàng** (#FFC93C, cỡ mức 1), còn hiện khi zoom-out.
  `kind`: up/down/info. **Chỉ dùng 2 mức**: `hit 1` = quan trọng, `hit 2` = rất quan trọng (cột mốc / khủng hoảng).
  **Không lấy dữ liệu mức 0**: không ghi vào file; nếu có, `make-data.js` tự bỏ.
- Nội dung sự kiện **ngắn gọn hết mức** (≤ ~30 ký tự, tối đa 38), tiếng Anh, không bịa nguyên nhân.
- Số tiền viết gọn: `$266`, `$1.2K`, `$19.8K`, `$109K`, `$41M`, `$1.5B` (1 chữ số lẻ khi < 100 đơn vị).
  `make-data.js` tự đổi mọi `$1,234,567` còn sót; nhãn ALL-TIME LOW tự tạo cũng dùng cùng định dạng.
- Nhãn **up** (và info) đặt **phía trên** nến; nhãn **down** đặt **phía dưới** nến. **Không bao giờ đè lên nến**
  (tính cả những nến chưa chạy tới nằm dưới bề ngang nhãn).
- Đường dẫn: **gấp khúc 2 đoạn** (chéo rồi ngang). Nếu đường gấp khúc quá dài (>110 px) → dùng **đường thẳng đứng ngắn**, nhãn đặt giữa nến.
- Ưu tiên vị trí: **bên phải** nến → **giữa** → xa hơn bên phải (đường ngang dài hơn) → **bên trái**; thử ở tầng
  sát nến trước rồi mới xếp tầng xa hơn. Trường hợp không còn chỗ: phía ngược lại, bên trái (vd. trên-trái).
- **Không bao giờ bỏ nhãn nào và tuyệt đối không đè nhau.** Khoảng cách rõ ràng (28 px ngang, 22 px dọc). Khi các vị trí
  ưu tiên đều kín: tìm mọi chỗ trống trên màn hình (mọi độ dài đường dẫn, mọi tầng, cả 2 phía). Nếu màn hình thật sự
  hết chỗ: nhãn cũ cản đường mờ đi ngay trước khi nhãn mới hiện. Kiểm tra: `node check-labels.js` (phải ra ✓).
  Nhãn thường chừa chỗ cho các nhãn sắp xuất hiện (trong 20 s tới).
- Vị trí nhãn được **tính 1 lần lúc sự kiện xảy ra rồi cố định** theo cây nến.
- Nhãn **còn hiển thị khi còn trong khung hình**; chỉ mờ dần khi trôi ra khỏi mép trái.
- 2 kiểu nhãn: **mức 1** = kiểu nhỏ (22px, hộp xám, chữ xám, chỉ đường dẫn có màu) · **mức 2** = kiểu lớn (34px,
  màu, nền nhuộm màu, glow nhấp nháy). Mức 2 lớn hơn mức 1 ~50%. Halving: kiểu nhỏ nhưng viền + chữ + đường dẫn vàng.
- Nhãn mức 2 ghi thêm **ngày** ngoài hộp, dưới mép trái (`Mar 13, 2020`, cùng format ngày đang chạy, 20px, cùng màu
  nhãn); chỗ của dòng ngày được tính khi xếp nhãn.
- **Không còn đỉnh phụ / đáy phụ, không còn nhãn TOP / BOTTOM.** Mỗi điểm chuyển phase là **ALL-TIME HIGH** hoặc
  **ALL-TIME LOW** (§4), luôn là nhãn **mức 2**, đúng ngày + đúng giá high/low thật: dùng sự kiện "ALL-TIME HIGH/LOW"
  có sẵn trong `events.csv` ở đúng ngày đó, không có thì tự tạo `ALL-TIME LOW: $X` (`score.js`).
- Nhãn ATH/ATL **giữ đúng phía** (ATH trên nến, ATL dưới nến) với đường dẫn ngắn hơn (cách nến 12px thay vì 22px),
  không nhường chỗ cho nhãn sắp tới, thử hết chỗ trống phía mình rồi mới sang phía ngược lại (chỉ khi thật sự hết chỗ).
- Hiệu ứng **chỉ cho mức 2** (mức 1 chỉ hiện nhãn, không SFX, không hiệu ứng):
  - Trước: 45 ngày trước sự kiện màn hình rung nhẹ tăng dần + viền tối đỏ (giảm) / viền tỏa sáng xanh (tăng);
    âm thanh: cymbal đảo ngược + riser dâng lên, cắt lặng 1/16 phách ngay trước khoảnh khắc.
  - Khoảnh khắc: flash màu, rung mạnh, zoom "đấm" 4,5%, 2 vòng sóng xung kích lan ra từ cây nến + chớp sáng tâm;
    âm thanh: 2 kick + sub boom, 2 crash trái/phải, timpani, hợp âm kèn đồng; tăng thêm chuỗi chuông đi lên + sweep
    lên, giảm thêm tiếng thud trầm + sweep rơi xuống.

## 4. Giai đoạn và nhạc (đã duyệt)

- Chỉ 2 loại giai đoạn (`data/phases.csv`, tạo bởi `detect-phases.js`, sửa tay được), đổi **chỉ** ở ATH / ATL:
  - **UPTREND** = ALL-TIME LOW → ALL-TIME HIGH kế tiếp; **DOWNTREND** = ALL-TIME HIGH → ALL-TIME LOW kế tiếp.
  - **ALL-TIME HIGH** = giá đóng cửa cao nhất trước khi giá đóng cửa rơi ≥ 45% (`REVERSAL`) so với nó.
    **ALL-TIME LOW** = giá đóng cửa thấp nhất giữa ATH đó và lần lập ATH mới. Pha hồi không vượt ATH, hoặc giảm < 45%,
    vẫn nằm trong phase. Sóng < 45 ngày bị bỏ (`MIN_DAYS`, vd. cú sập 04/2013). Rồi mỗi điểm được đặt vào ngày có
    high/low thật trong ±7 ngày (`SEAT`). Phase cuối (chưa có ATH/ATL mới) chạy tới hết dữ liệu.
  - Hiện tại: 13 phase, 6 ATH ($32 · $1.2K · $19.8K · $64.9K · $69K · $126K) và 6 ATL ($2 · $166 · $3.1K · $29.3K ·
    $15.5K · $57.7K).
- **Mỗi phase trong `data/phases.csv` = đúng 1 bản nhạc từ đầu tới cuối phase**; chỉ đổi bài ở ranh giới phase,
  không bao giờ đổi trong 1 phase. Bản nhạc được chọn trên **toàn bộ** danh sách phase (preview FROM/TO cũng phát
  đúng bài như phim đầy đủ).
- Nhạc (`data/music.js`), giọng quanh Rê thứ, thay phiên các bản cùng loại:
  - Uptrend: **Ascent 100 BPM**, **Euphoria 104 BPM**. Downtrend: **Freefall 98 BPM**, **Pressure 96 BPM**.
- **Chuyển giao ở ATH / ATL** (`TURN` trong `data/music.js`):
  - Nhạc và nến **giữ nguyên tốc độ** cho tới đúng khoảnh khắc **nhãn ATH / ATL hiện ra** (không chậm trước, không có khoảng lặng trước).
  - Lúc đó **phanh** (0.5 phách) xuống **60 BPM**, **giữ chậm 3 giây**, rồi **tăng tốc mượt (smoothstep) trong ~3 giây** về tempo bản nhạc mới.
- **Sự kiện mức 2 nằm giữa phase không đổi bài**: nhạc nền (mọi bus trừ SFX) **giảm ~7,5 dB** từ lúc riser chạy
  (1,6 s trước khoảnh khắc) tới hết flash/rung (1,6 s sau), rồi lên lại trong 1 s (`DUCK` trong `song.js`; đo ở
  COVID crash: pizz −16 → −23,6 dB, pad −29 → −36,5 dB, trống −16 → −23 dB). SFX mức 2 nằm ở bus riêng
  (`hDrums`, `hPerc`, `hLead`, `hFx`) với mức cũ nên không bị giảm theo.
- Nghe thử 1 bản: `PREVIEW_CUE=up-ascent node song.js` → `out/music.wav`.
- Âm lượng (không có voice-over): master **−16 LUFS** (mặc định của `song.js`), true peak ≤ −1 dBTP; SFX mức 2 nổi hơn
  nhạc nền ~6 dB (đo: 4,8–8,6 dB, trung vị 6,0). Đo lại sau mỗi lần đổi mix.

## 5. Tốc độ nến (đã duyệt)

- **Nến chạy theo nhạc**: trong một giai đoạn, mỗi phách nhạc hiển thị một số ngày cố định.
  - Ngày/phách = (ngày/ô nhịp theo thời kỳ × `SPEED`) ÷ 4. Thời kỳ: ≤2012 = 130, 2013–2019 = 85, ≥2020 = 70 ngày/ô nhịp.
  - **`SPEED = 0.35`** (đã chọn). Ví dụ 2017 ở 100 BPM ≈ 12 ngày/giây.
  - Tốc độ (ngày/giây) = ngày/phách × BPM ÷ 60. Nến nhích nhẹ theo từng phách (`PULSE = 0.3`).
- Sự kiện **không** được ghim vào phách (ghim làm tốc độ méo, nến như phanh trước đỉnh).

## 6. Dữ liệu

- Giá thật: `data/tradingview/*.csv` (TradingView `INDEX:BTCUSD` 1D, người dùng export). File đứng sau ghi đè file trước nếu trùng ngày.
- Phim bắt đầu từ ngày đầu tiên có volume (17/07/2010). Lỗ hổng trong dữ liệu (06/2011, 23/06/2013) được nối bằng nến phẳng nội suy.
- `btc-data.js` có thêm 180 ngày **pre-run** trước `FROM` (`PRE=180`, `PRE=0` = không có): `BTC.start` = ngày đầu pre-run,
  `BTC.pre` = số ngày pre-run; phim (nhạc, phase, sự kiện, ô tổng kết) bắt đầu ở ngày `BTC.pre` (`S.P0`).
  `data/btc-daily.csv` chỉ chứa các ngày của phim.
- `data/anchors.csv`: giá ước lượng, chỉ dùng khi không có dữ liệu TradingView.
- Hướng dẫn cập nhật dữ liệu: `data/README.md`.
- Sự kiện: `data/events.csv` — từ 99Bitcoins "Bitcoin Historical Events" (lấy 25/10/2026), ngày/giá ATH theo
  TradingView; người dùng soạn và kiểm chứng (nhờ ChatGPT). Chỉ giữ mức 1 và 2 (119 dòng, 117 nằm trong phim).
  Bản gốc 238 dòng (có mức 0) nằm trong lịch sử git, commit `c3d3e43b`.

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
  check-labels.js    kiểm tra cả phim: không có 2 nhãn nào đè nhau (cần `npm install` 1 lần: playwright-core)
  data/              events.csv, phases.csv, music.js, tradingview/, anchors.csv, README.md
  assets/            logo Bitcoin (gốc + âm bản)
  engine/            bộ công cụ render/âm thanh (không sửa theo từng phim)
```

## 8. Lệnh thường dùng

Cần Node 22+, ffmpeg, Google Chrome/Chromium. Chạy trong thư mục `bitcoin-chart-2020-2026`.

**Trên máy cá nhân (Mac) lần đầu:**
```bash
git clone https://github.com/congminh12000/bao-tarot.git && cd bao-tarot
git checkout claude/bitcoin-price-chart-animation-l7ta0e && cd bitcoin-chart-2020-2026
brew install node ffmpeg          # nếu chưa có; Chrome ở /Applications được tự tìm thấy
npm install                       # chỉ để chạy check-labels.js
```

```bash
node make-data.js                          # dữ liệu đầy đủ 2010 → nay
node make-data.js && node detect-phases.js && node make-data.js # tính lại giai đoạn ATH/ATL (dữ liệu ĐẦY ĐỦ)
node song.js                               # nhạc (master −16 LUFS)
node engine/render.js stills 30 60         # ảnh tĩnh tại giây 30, 60 → out/stills/
# preview chất lượng thấp một đoạn:
FROM=2017-01-01 TO=2018-12-31 node make-data.js && node song.js
FPS=30 node engine/render.js video --res 480 && FPS=30 node engine/render.js mux --res 480   # 480p @30 fps
FPS=30 node engine/render.js verify --res 480   # kiểm tra khớp hình/tiếng ở các điểm hit → out/bitcoin-chart-2020-2026-480p.mp4
node check-labels.js                       # kiểm tra cả phim: không có 2 nhãn nào đè nhau
node make-data.js && node song.js          # LUÔN khôi phục dữ liệu đầy đủ sau khi render đoạn ngắn
# bản cuối 1080p 24fps (~8 phút 45 giây; khoảng 12.600 khung hình):
node make-data.js && node song.js && node check-labels.js
node engine/render.js video && node engine/render.js mux && node engine/render.js verify
# → out/bitcoin-chart-2020-2026.mp4   (hoặc gọn: npm run build)
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
| Chậm ở ATH / ATL | `TURN` trong `data/music.js` (`slowBpm`, `holdSec`, `rampSec`, `brakeBeats`) |
| Độ nhạy ATH/ATL | `REVERSAL`, `MIN_DAYS`, `SEAT` trong `detect-phases.js` |
| Nhạc giảm khi có mức 2 | `DUCK` trong `song.js` (`depth`, `pre`, `post`, `attack`, `release`) |
| Thời gian tiêu đề / pre-run | `TITLE_OUT` trong `film.js`, `FIRST_BEAT` trong `score.js`, `PRE` khi chạy `make-data.js` |
| Màu halving | `GOLD` trong `film.js` |
| Sự kiện | `data/events.csv` |
| Cỡ chữ nhãn | `sizeOf` trong `film.js` (mức 1 = 22, mức 2 = 34) |
| Hiệu ứng hình mức 2 | `draw()` (flash, shake, punch) và `shockwave()` trong `film.js` |
| SFX mức 2 | khối "the hits" trong `song.js` |
| Âm lượng tổng | `LUFS=-14 node song.js` để đổi (mặc định −16) |
| Mix từng nhóm | `GAIN` trong `song.js` |

## 10. Trạng thái hiện tại (25/10/2026)

- Đã duyệt (25/10/2026): pre-run + tiêu đề 1,5 s; trục X/Y trên cùng; ngày dưới nhãn mức 2; phase chỉ đổi ở ATH/ATL
  (13 phase); nhạc giảm âm lượng dưới mức 2 giữa phase; halving màu vàng (cột `tag`); zoom-out giữ mức 2 + halving;
  ô tổng kết tinh gọn. Preview đã xem: 2019–2022 (nháp) và 03–08/2021 (1080p @30 và @60 fps).
- Kiểm tra gần nhất: `verify` ✓ (2019–2022, 03–08/2021, cả phim bản nháp); `check-labels` ✓ cả phim.
- Đã biết, chấp nhận: ở đoạn FROM/TO ngắn, khung zoom-out lùi ra ít và ô tổng kết có thể che nhãn ATL / nến ở góc
  dưới phải (phim đầy đủ không bị).
- Chưa nghe thử phần nhạc giảm âm lượng (mới có số đo). **Chưa render bản cuối 1080p.**
- Bản đầy đủ 2010–2026 dài ~8 phút 44 giây (524 giây).
