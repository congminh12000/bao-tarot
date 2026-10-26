# Bitcoin Chart Film — tài liệu bàn giao (đọc trước khi làm bất cứ điều gì)

Video hoạt hình biểu đồ nến ngày BTC/USD từ 2010 đến nay. Mọi khung hình được vẽ bằng code (canvas), mọi âm
thanh được tổng hợp bằng code; không có file nhạc hay hình ảnh có sẵn ngoài logo Bitcoin.

Tài liệu này ghi lại **yêu cầu đã được người dùng (chủ dự án) duyệt**. Model/AI nào tiếp quản dự án phải giữ đúng
các quy tắc ở đây; chỉ thay đổi khi người dùng yêu cầu, và cập nhật lại file này sau mỗi thay đổi đã được duyệt.

---

## 1. Quy trình làm việc với người dùng (bắt buộc)

**Trước mọi công việc trong dự án:** mỗi lượt yêu cầu và trước mỗi đợt kiểm tra, sửa tài liệu/code, tạo dữ liệu,
render hoặc commit/push, phải kiểm tra commit và đồng bộ code mới:

```bash
git status --short --branch
git fetch origin
git log -1 --format='%h %s' HEAD
git log -1 --format='%h %s' '@{upstream}'
git rev-list --left-right --count 'HEAD...@{upstream}'
git pull --ff-only
```

Đọc lại các hướng dẫn và file liên quan nếu remote có thay đổi. Giữ nguyên công việc local chưa commit;
nếu thay đổi local hoặc lịch sử phân kỳ làm pull không an toàn, báo rõ trước khi tiếp tục phần việc phụ thuộc.

1. Người dùng giao tiếp bằng **tiếng Việt** → trả lời bằng tiếng Việt. Chữ hiển thị TRONG video là **tiếng Anh**.
2. Sau mỗi đợt thay đổi: **render preview chất lượng thấp** (đoạn ngắn, ví dụ 2017–2018 và đoạn có vấn đề),
   gửi người dùng xem, **chờ duyệt "OK" rồi mới làm tiếp**. Không tự render bản đầy đủ khi chưa được yêu cầu.
   Preview: **luôn 60 fps**, mặc định 16:9, 480p (854×480): `FPS=60 … --res 480` (lệnh ở §8).
3. Không nghe được âm thanh → chỉ báo số đo (LUFS, levels), nói rõ là chưa nghe, mời người dùng nghe góp ý.
4. Commit + push lên branch `claude/bitcoin-price-chart-animation-l7ta0e` sau mỗi thay đổi (repo
   `congminh12000/bao-tarot`). Không tạo Pull Request nếu không được yêu cầu.
5. Thông tin sự kiện (tên, ngày) **phải trung thực**: không bịa nguyên nhân; chỗ không chắc thì nói rõ.
   Giá trên nhãn lấy từ dữ liệu TradingView, không lấy từ trí nhớ.
6. Khi người dùng nói **"render video final"** (bản cuối, phim đầy đủ): **luôn 60 fps** (không hỏi). Hỏi **2 bước, lần lượt
   từng bước**, mỗi bước một câu hỏi có lựa chọn, rồi mới render:
   1. **Tỷ lệ khung hình**: **16:9** · 1:1 · 9:16
   2. **Độ phân giải**: **Full HD** · 2K · 4K
   Mặc định (in đậm): **16:9, Full HD**. Cách chạy: `FPS=60 node engine/render.js video --format <tỷ lệ>
   --res <1080|1440|2160>` (cạnh ngắn, px), rồi `mux` + `verify` với cùng các tham số. Layout `film.js` được thiết kế
   cho 16:9; với 1:1 / 9:16 phải render preview kiểm tra bố cục trước khi chạy bản cuối.
7. **Luôn lưu lại bản render** (preview và bản cuối) để tái sử dụng: sau mỗi lần render chạy
   `FPS=60 node keep-render.js save <tên> [--res 480]` (lưu khung hình câm + mp4 + dấu vân tay vào `out/renders/<tên>/`).
   Khi chỉ chỉnh nhỏ không làm đổi hình (nhạc, mix, giai điệu…): `keep-render.js check` → `restore` → `node song.js` →
   `render.js mux` + `verify`, **không render lại khung hình**. Chỉ render lại khi cập nhật dữ liệu hoặc thay đổi lớn ảnh
   hưởng tới hình (nhãn, đồ thị, tempo/thứ tự bài, fps, độ phân giải) — `check` sẽ báo phần nào đã đổi.
8. **Nhạc không được lặp lại** trong phim: số bài đã duyệt của mỗi loại phải ≥ số phase loại đó. `make-data.js` in
   "⚠ NOT ENOUGH MUSIC" khi thiếu (`--strict` thì dừng hẳn, dùng trước bản cuối). Thiếu bài → **tự tạo bài mới đúng phong
   cách đã duyệt, gửi người dùng nghe thử trước**, chỉ render khi đã đủ bài được duyệt.
9. **Tiêu đề, mô tả, chương YouTube** (mẫu đã duyệt: `youtube.md`; làm lại y như vậy cho mỗi video/bản cắt mới):
   - **Tiêu đề**: chữ **"Bitcoin" đứng đầu**, **không ghi số năm**, thể hiện cả **biểu đồ giá** và **yếu tố lịch sử**
     (bản đã chọn: "Bitcoin Price History: Every All-Time High & Crash, Animated in 9 Minutes"). Đề xuất vài phương án,
     người dùng chọn.
   - **Mô tả**: **không** số năm, **không** giá Bitcoin, **không** thứ gì sẽ thay đổi theo thời gian (today, giá hiện
     tại, "X years", % tăng từ đầu…). Có: đoạn mở đầu, 2 loại phase + nhạc riêng, chương, nguồn dữ liệu (TradingView
     INDEX:BTCUSD; 99Bitcoins), nhạc tự tạo, "not financial advice", hashtag.
   - **Chương**: **đủ tất cả** ATH, ATL, sự kiện mức 2 và halving — **không** "today"; mỗi chương bắt đầu **sớm 3 s** so
     với lúc nhãn hiện trên video; chương đầu `0:00 The first trades`; mốc cách nhau < 10 s gộp một chương ("A · B")
     vì YouTube cần ≥ 10 s/chương. Viết **ATH / ATL** rồi thêm nội dung phân biệt với các ATH/ATL khác (không giá, không
     năm, dựa trên sự kiện có thật trong dữ liệu), ví dụ "ATH: the ICO boom", "ATL: after FTX"; sự kiện khác cũng bỏ
     giá/năm ("Bitcoin crosses six figures"). Tạo bằng `node youtube-chapters.js` (tên trong `NAMES`; thêm tên cho sự
     kiện mới).
   - Đồng khác Bitcoin: tiêu đề bắt đầu bằng **tên đồng** (vd. "Ethereum Price History: …"), cùng quy tắc.
   - **Kiểm tra thời gian chương** với video thật, **không cần render**: dùng bản render đã lưu cùng timeline
     (`out/renders/…`, xác nhận dữ liệu/tempo/nhạc không đổi từ lúc render và độ dài video = `S.DURATION`), trích khung
     tại mốc chương (nhãn chưa hiện) và ~1 s sau mốc sự kiện (nhãn đã hiện). Sau khi render bản final: chạy lại
     `youtube-chapters.js` và cập nhật `youtube.md`.

10. **Video về một đồng khác** (ETH, DOGE, BNB, SOL, … — bất kỳ đồng nào chưa có trong `coins/`): **tự làm luôn, không cần
    hỏi**, theo quy trình §11, cho ra **một video giống hệt video Bitcoin** (cùng đặc tả §2–§6, cùng quy tắc nhãn, phase,
    nhạc, ô tổng kết, YouTube): dữ liệu giá TradingView + sự kiện 99Bitcoins, lưu như Bitcoin; **màu riêng cho mỗi đồng**
    (vẫn glow tech — bảng đề xuất trong `coins/README.md`, người dùng duyệt); **logo/icon tự tìm trên Google nhưng phải
    chính xác** (logo chính thức); **nhạc dùng các bài đã duyệt của Bitcoin nhưng xáo thứ tự phát ngẫu nhiên** (tự động,
    theo mã đồng) — vẫn không được lặp (§1.8).
11. **Khi render preview hay final**: nếu chưa rõ đang làm đồng nào thì **hỏi render đồng nào**; nếu đang trong flow làm
    một đồng thì không hỏi, cứ làm đồng đó. Luôn chạy với `COIN=<SYMBOL>` và đặt tên file theo mã đồng
    (`mux eth-preview…`, `keep-render.js save eth-…`).

## 2. Đặc tả video (đã duyệt)

| Hạng mục | Yêu cầu |
|---|---|
| Khung hình | 16:9, **luôn 60 fps** (preview và bản cuối). Bản cuối: hỏi tỷ lệ + độ phân giải (§1.6), mặc định 1920×1080. Preview: 854×480 (`FPS=60 … --res 480`) |
| Phong cách | "Glow Technology" — mẫu **A Hologram** (`look.js` → `hologram`): nền xanh navy đậm, đường nét cyan, bloom, bụi sáng nhẹ, scanline |
| Nến | Nến ngày, xanh = tăng, đỏ = giảm, chạy từ trái qua phải, camera bám theo nến đang chạy |
| Zoom | `PPD = 16.06` px/ngày (đã zoom 2 lần ×1.3 so với 9.5) |
| Nền giữa | Logo Bitcoin **âm bản** (`assets/bitcoin-logo-negative.png`, đảo màu từ logo cam), mờ (alpha 0.1), lắc nhẹ, vòng quét cyan |
| Góc trái trên | Chỉ `BTC / USD` + ngày dạng `Mar 12, 2020` (chữ ngày nhỏ hơn) |
| Góc phải trên | **Giá đang chạy**, mép phải thẳng hàng mép phải chart; nhãn **▲ UPTREND / ▼ DOWNTREND** ngay bên phải giá, xanh/đỏ theo phase, vị trí cố định. `PHASE_BADGE = 'price'` trong `look.js`, độc lập với overlay (`date` = cạnh ngày, `none` = tắt). **Không có %**. Chưa có dữ liệu giá → không hiện giá hay nhãn phase |
| Bên phải chart | Không có bubble giá; chỉ có **đường chấm chấm** từ nến đang chạy tới trục giá |
| Trục X / Y | 2 đường trục (đáy chart, trục giá) **luôn vẽ trên cùng**: không nhãn, sóng xung kích hay hiệu ứng nào đè lên |
| Mở đầu | **Không có tiêu đề.** Hình **fade-in từ đen trong 1 s** (sau bloom/grain, `FADE_IN` trong `film.js`), nhạc bắt đầu ngay khung đầu và cũng fade-in 1 s (`FADE_IN` trong `song.js`). Nến chạy ngay từ khung đầu ở tốc độ phase đầu; 180 ngày **pre-run** lấp đầy màn hình phía sau (ngày chưa có dữ liệu: không nến, không giá) |
| Kết thúc | Camera lùi ra toàn cảnh. Giữ lại nhãn **mức 2** (kể cả ATH/ATL) và **halving**, thu nhỏ quanh cây nến của chúng (giữ hình dạng lúc xuất hiện); nhãn mức 1 mờ đi. Trục giá: mốc thưa nhất (1, 1-3, 1-2-5…) mà vẫn ≥ 6 mốc. **Ô tổng kết** ghép từ 2 khung nhãn: **dòng 1 = khung mức 2** (nền nhuộm màu, glow nhấp nháy): đồng coin Bitcoin cam bên trái, giá đầu → giá cuối (chạy số) bên phải, 48px; **dòng 2 = khung mức 1** (hộp xám, góc màu): tổng số năm bên trái (`16 YEARS`; < 2 năm thì 1 chữ số lẻ), % giá bên phải (`+163,294,184%`), 32px — dòng 1 to hơn 50%. Giá đầu mờ 52,5% (cùng cỡ), glow giá cuối 3,5, glow % giá 5,6. Xanh khi tăng, đỏ khi giảm; tự giãn theo độ dài số, góc dưới phải chart |
| Overlay uptrend / downtrend | **Tắt** (`PHASE_OVERLAY = 'none'` trong `look.js`). Đã thử 10 phương án (area, bands, ribbon, tint, background, trend, timeline, ema, watermark, gauge — code trong `film.js`, bật bằng `look.js`) và người dùng chọn không dùng |
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
- Nhạc (`data/music.js`), giọng quanh Rê thứ, các bài cùng loại thay phiên nhau (chọn trên toàn bộ danh sách phase).
  **Bài đã duyệt (26/10/2026)**, bản nghe lưu ở `out/approved/` (máy người dùng):
  - **Uptrend — 100 BPM, cinematic hào hùng:** **Vanguard** (hành quân: cello móc đơn có nhấn, tom trailer, horn 4 ô nhịp,
    hợp xướng từ ô 5, violin đánh đôi từ ô 9) · **Titan** (xung trận: snare quân hành, bass móc đơn, spiccato, kèn fanfare)
    · **Crusade** (Rê dorian, spiccato móc đơn kiểu Celtic, horn) · **Overdrive** (rock điện ảnh: power chord rè, beat rock,
    kèn đồng) · **Horizon** (Fa trưởng, beat lai, violin vút lên + horn đáp) · **Warpath** (taiko, hợp xướng nam hô nhịp,
    kèn đồng). Bốn bài này là bản đầu tiên ("v1") của chúng. · **Spartan** (hùng ca Son thứ, trống trận, kèn đồng + hợp
    xướng hát giai điệu) · **Last Stand** (taiko, spiccato đua, braam, kèn đồng) · **War Cry** (beat rock + taiko, power
    chord, braam, violin vút lên) · **Dominion** (cả dàn nhạc: spiccato + cello, tom trailer, braam, horn đồng âm).
  - **Downtrend — 80 BPM, hồi hộp căng thẳng, beat vừa phải, KHÔNG kịch tính:** **Siege** (đồng hồ tích tắc + nhịp tim, bass
    ngắt móc đơn, spiccato rung, violin giữ nốt dài) · **Undertow** (Rê phrygian, spiccato láy D–Eb, rim kiểu sonar, cello
    trầm — không dùng chuông vì quá chói) · **Collapse** (hi-hat tích tắc, spiccato chạy xuống, e-piano bước xuống)
    · **Tremor** (con lắc tích–tắc, pizzicato trầm lặp, cello) · **Shadow** (spiccato lùi bậc 8-8-7-8, e-piano thưa)
    · **Vertigo** (pizzicato nghịch phách, rim sonar, violin trượt xuống) · **Standoff** (đồng hồ gỗ, marimba, horn trầm).
  - Thứ tự luân phiên = thứ tự bài trong `data/music.js` (theo từng loại). Hiện 13 phase: Vanguard, Tremor, Titan, Shadow,
    Crusade, Vertigo, Overdrive, Standoff, Horizon, Undertow, Warpath, Siege, Spartan — không bài nào lặp (chưa tới lượt:
    Last Stand, War Cry, Dominion, Collapse).
  - Uptrend và downtrend phải **khác hẳn nhau** (tempo, trống, hòa âm). Downtrend: lấy đà êm (swell tối + nhịp tim), không
    crash, không swell, không fanfare.
  - Mỗi bài mở bằng **~1 s lấy đà** (`pickup: 2` phách) rồi vào nhạc chính ngay (không xây dần nhiều ô nhịp).
  - Bài đang thử nghe: `rotation: false` (phim không dùng). Nghe: `PREVIEW_CUE=<id> PREVIEW_BARS=16 node song.js`.
- **Chuyển giao ở ATH / ATL**: **nhạc KHÔNG giảm tốc** — mỗi phase phát bài của nó đúng tempo của bài (đồng hồ nhạc riêng
  trong `song.js`), tới đúng lúc nhãn ATH / ATL hiện ra thì đổi bài ngay, bài mới tự lấy đà ~1 s. **Đường giá vẫn giữ tốc độ
  như cũ**: đồ thị dùng bản đồ tempo của `score.js` (`TURN` trong `data/music.js`: phanh 0.5 phách xuống 60, giữ 3 s, tăng
  tốc mượt ~3 s) nên nến vẫn chậm lại rồi tăng tốc ở mỗi ATH / ATL; nhạc không chạy theo nhịp đó.
- **Sự kiện mức 2 không đổi bài và KHÔNG giảm âm lượng nhạc**: SFX chơi chồng lên nhạc (bus riêng `hDrums`, `hPerc`,
  `hLead`, `hFx`). Còn giữ khoảng lặng 1/16 phách ngay trước mỗi hit.
- Âm lượng (không có voice-over): master **−16 LUFS** (mặc định của `song.js`), true peak ≤ −1 dBTP; SFX mức 2 nổi hơn
  nhạc nền ~6 dB (đo: 4,8–8,6 dB, trung vị 6,0). Đo lại sau mỗi lần đổi mix.

## 5. Tốc độ nến (đã duyệt)

- **Nến chạy theo tempo của bài** (bản đồ tempo trong `score.js`): trong một giai đoạn, mỗi phách hiển thị một số ngày cố định
  (downtrend 80 BPM nên chạy chậm hơn uptrend 100 BPM). Nhạc có đồng hồ riêng, không phanh ở ATH / ATL (§4).
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
  keep-render.js     lưu / kiểm tra / dùng lại khung hình đã render (out/renders/)
  coin.js            chọn đồng (COIN=ETH …, mặc định BTC) → coins/<SYMBOL>/coin.json
  coins/             mỗi đồng một thư mục (README.md: cấu trúc, bảng màu); fetch-tradingview.js lấy giá TradingView
  youtube.md         tiêu đề + mô tả YouTube đã duyệt (quy tắc viết mô tả, chương)
  youtube-chapters.js in các chương YouTube từ timeline hiện tại (chạy trên dữ liệu ĐẦY ĐỦ)
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
FPS=60 node engine/render.js video --res 480 && FPS=60 node engine/render.js mux --res 480   # 480p @60 fps
FPS=60 node engine/render.js verify --res 480   # kiểm tra khớp hình/tiếng ở các điểm hit → out/bitcoin-chart-2020-2026-480p.mp4
node check-labels.js                       # kiểm tra cả phim: không có 2 nhãn nào đè nhau
node make-data.js && node song.js          # LUÔN khôi phục dữ liệu đầy đủ sau khi render đoạn ngắn
FPS=60 node keep-render.js save 2017-2018 --res 480   # LUÔN lưu bản render (tên tùy ý, ví dụ theo FROM–TO)
# chỉnh nhỏ không đổi hình (nhạc…): dùng lại khung hình đã lưu thay vì render lại
FPS=60 node keep-render.js check 2017-2018 --res 480    # ✓ dùng lại được / ✗ hình đã đổi (liệt kê phần đổi)
FPS=60 node keep-render.js restore 2017-2018 --res 480 && node song.js && FPS=60 node engine/render.js mux --res 480
node keep-render.js list                               # các bản đã lưu
node make-data.js && node youtube-chapters.js          # chương YouTube (dán vào mô tả trong youtube.md)
# bản cuối 1080p 60 fps (~9 phút 18 giây; khoảng 33.500 khung hình, render ~35 phút):
node make-data.js --strict && node song.js && node check-labels.js   # --strict: dừng nếu nhạc sẽ bị lặp
FPS=60 node engine/render.js video && FPS=60 node engine/render.js mux && FPS=60 node engine/render.js verify
FPS=60 node keep-render.js save final-<ngày>
# → out/bitcoin-chart-2020-2026.mp4   (hoặc gọn: npm run build)
# thư mục out/ (video, nhạc, preview) KHÔNG đưa lên git (.gitignore): gửi file cho người dùng trực tiếp
# luôn FPS=60 (preview và bản cuối); độ phân giải khác: --res 1440 / 2160 (cạnh ngắn, px)
```

**Dùng với ChatGPT (Codex CLI) thay cho Claude:** Codex tự đọc `AGENTS.md` (ở gốc repo và trong thư mục này), cùng quy
tắc với `CLAUDE.md`. Cài: `npm install -g @openai/codex`, mở terminal trong `bitcoin-chart-2020-2026/`, `git pull`, rồi chạy
`codex` (đăng nhập bằng tài khoản ChatGPT). Cho phép Codex chạy Chrome, ghi `out/` và dùng mạng (git push).

Môi trường cloud chạy bằng root: Chrome cần `--no-sandbox` → đặt `CHROME_PATH` tới một script bọc
`exec /path/to/chrome --no-sandbox "$@"`. Trên máy cá nhân (Mac) không cần.

## 9. Các thông số chỉnh nhanh

| Muốn | Sửa |
|---|---|
| Nến nhanh/chậm hơn | `SPEED` trong `score.js` |
| Nhịp nhích theo phách | `PULSE` trong `score.js` |
| Zoom | `PPD` trong `film.js` |
| Tempo bản nhạc | `bpm` từng cue trong `data/music.js` |
| Đồ thị chậm ở ATH / ATL | `TURN` trong `data/music.js` (`slowBpm`, `holdSec`, `rampSec`, `brakeBeats`) — chỉ đồ thị, nhạc không phanh |
| Độ nhạy ATH/ATL | `REVERSAL`, `MIN_DAYS`, `SEAT` trong `detect-phases.js` |
| Fade-in đầu phim / pre-run | `FADE_IN` trong `film.js` và `song.js`, `PRE` khi chạy `make-data.js` |
| Lấy đà đầu mỗi bài | `pickup` (phách) và `softPickup` từng cue trong `data/music.js` |
| Màu halving | `GOLD` trong `film.js` |
| Nhãn uptrend/downtrend cạnh giá | `PHASE_BADGE` trong `look.js` (`price` / `date` / `none`), độc lập với `PHASE_OVERLAY` |
| Sự kiện | `data/events.csv` |
| Cỡ chữ nhãn | `sizeOf` trong `film.js` (mức 1 = 22, mức 2 = 34) |
| Hiệu ứng hình mức 2 | `draw()` (flash, shake, punch) và `shockwave()` trong `film.js` |
| SFX mức 2 | khối "the hits" trong `song.js` |
| Âm lượng tổng | `LUFS=-14 node song.js` để đổi (mặc định −16) |
| Mix từng nhóm | `GAIN` trong `song.js` |

## 10. Trạng thái hiện tại (26/10/2026)

- Đã tách nhãn phase khỏi overlay và bật lại nhãn cạnh giá theo yêu cầu; preview 01/12/2017–31/01/2018 (60 fps, 480p) có cả UPTREND và DOWNTREND, `verify` ✓; `check-labels` ✓ cả phim. Chờ người dùng duyệt preview.
- Đã duyệt (26/10/2026): không dùng overlay uptrend/downtrend; ô tổng kết ghi số năm nguyên ("2 YEARS"); ô tổng kết mới (khung mức 2 + mức 1, logo, số năm, % giá); preview và bản cuối luôn 60 fps; bỏ tiêu đề, fade-in 1 s; 17 bài nhạc (uptrend: Vanguard, Titan,
  Crusade, Overdrive, Horizon, Warpath, Spartan, Last Stand, War Cry, Dominion / downtrend: Siege, Undertow, Collapse, Tremor, Shadow, Vertigo, Standoff); nhạc không
  giảm tốc ở ATH / ATL (đồ thị vẫn như cũ); nhạc không giảm âm lượng dưới SFX. Preview đã xem: 2010–2015 (480p, 30 fps).
- Đang thử nghe, chưa duyệt (`rotation: false` trong `data/music.js`): uptrend — Ironclad, Legion, Valhalla, Conquest,
  Blood Oath, Eclipse, Ascendant.
- Kiểm tra gần nhất: `verify` ✓ (2010–2015); `check-labels` ✓ cả phim.
- Đã biết, chấp nhận: ở đoạn FROM/TO ngắn, khung zoom-out lùi ra ít và ô tổng kết có thể che nhãn ATL / nến ở góc
  dưới phải (phim đầy đủ không bị).
- Bản final 1080p 60 fps đã render 26/10/2026 với nhạc mới: 558,10 s, 33.486 khung hình, `verify` ✓, −16,0 LUFS,
  true peak AAC −1,3 dBTP; lưu ở `out/renders/final-20261026-1080p60/`. Bản này chưa có nhãn phase cạnh giá; thay đổi nhãn mới chỉ có trong preview ở trên.
- Bản đầy đủ 2010–2026 dài ~9 phút 18 giây (558 giây, downtrend 80 BPM).

## 11. Làm video cho một đồng khác (ETH, DOGE, BNB, SOL, …)

Hạ tầng: `coin.js` (chọn đồng bằng `COIN=<SYMBOL>`, mặc định `BTC`), `coins/<SYMBOL>/coin.json`, `fetch-tradingview.js`.
Chi tiết thư mục, `coin.json`, bảng màu: **`coins/README.md`**. Bitcoin giữ dữ liệu ở `./data` (`coins/BTC/coin.json`).

1. **Tạo `coins/<SYMBOL>/coin.json`**: tên, cặp (`ETH / USD`), mã TradingView. Thử `INDEX:<X>USD`, `CRYPTO:<X>USD` và vài
   sàn lớn bằng `node fetch-tradingview.js <mã> --print`, chọn mã có **lịch sử dài nhất**.
2. **Giá**: `COIN=<SYMBOL> node fetch-tradingview.js` → `coins/<SYMBOL>/data/tradingview/`.
3. **Sự kiện**: trang "historical price/events" của **99Bitcoins** cho đồng đó (mở bằng trình duyệt nếu WebFetch bị chặn);
   nếu 99Bitcoins không có, dùng nguồn uy tín khác và **ghi rõ nguồn**. Cùng định dạng `date,kind,hit,tag,text`, chỉ mức
   1/2, chữ ngắn, tiếng Anh, không bịa nguyên nhân; `tag` cho sự kiện nội tại đặc biệt của giao thức (Bitcoin: `halving`,
   ETH: nâng cấp mạng…). ATH/ATL do `score.js` tự gắn. Ghi nguồn vào `coin.json` (`eventsSource`).
4. **Logo**: tự tìm trên Google, **phải chính xác** — logo chính thức (trang chủ / brand kit của dự án), nền trong suốt,
   kích thước ≥ 512 px → `coins/<SYMBOL>/logo.png`; tạo `logo-negative.png`
   (`ffmpeg -i logo.png -vf "negate=negate_alpha=0" logo-negative.png`). Gửi người dùng xem logo.
5. **Màu**: lấy theo bảng trong `coins/README.md` (đồng chưa có thì đề xuất theo màu thương hiệu) → `coin.json`
   (`colors`, `logoGlow`, `special`); chụp ảnh tĩnh cho người dùng duyệt.
6. **Phase + nhạc**: `COIN=<SYMBOL> node make-data.js && COIN=<SYMBOL> node detect-phases.js && COIN=<SYMBOL> node make-data.js --strict`.
   Nhạc = các bài đã duyệt, thứ tự xáo theo mã đồng; nếu "NOT ENOUGH MUSIC" thì làm thêm bài (§1.8).
7. **Preview → duyệt → final** như Bitcoin (§1.2, §1.6, §1.7), luôn `COIN=<SYMBOL>`, tên file theo mã đồng.
8. **YouTube**: `coins/<SYMBOL>/chapter-names.json` + `COIN=<SYMBOL> node youtube-chapters.js`; tiêu đề bắt đầu bằng tên đồng (§1.9).
9. Commit + push dữ liệu, `coin.json`, logo, chapter names (không commit `out/`).

