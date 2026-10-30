# Kế hoạch: định dạng video mới "News Deep-Dive" (phân tích tin nóng) — vụ hack Binance 29/10/2026

## Context

Người dùng muốn một **dạng video mới**: phân tích sâu một tin nóng (bắt đầu bằng vụ hack Binance hôm qua), vẫn giữ phong
cách **glow tech hologram** và animation dạng thông tin như các phim giá coin. Yêu cầu đã chốt:

- **16:9, khoảng 10 phút**, phân tích và giải thích chi tiết, không chỉ đưa tin kiểu bản tin thường.
- **Không voice-over**: 100% thông tin nằm trên hình. Mỗi lúc chỉ hiện ít thông tin, biết lúc nào hiện, lúc nào ẩn.
- **Nhịp điệu rõ**, tạo hưng phấn hoặc kịch tính.
- **Kiểm tra thông tin trước khi làm**. Chốt dữ liệu tại một mốc **"As of …"**, số chưa chắc thì ghi *reported* / *estimated*.
- Dựng thành **khuôn mẫu dùng lại** cho các tin nóng sau.
- Thứ tự làm việc: cấu trúc → phase → thiết kế → preview → final.
- Người dùng sẽ **dán nội dung thảo luận với ChatGPT**, vì `chatgpt.com` bị chặn trong phiên cloud. Mình sẽ đối chiếu nó với
  bảng sự kiện ở bước G1.

Tiền lệ gần nhất trong repo là pipeline riêng `bitcoin-chart-2020-2026/sales/` (phim doanh số Tesla). Nó có workspace cô lập,
duyệt theo mã hash, nguồn cho từng số liệu, và adapter dùng lại `song.js` mà không đụng dữ liệu phim giá.

---

## 1. Kiểm tra thông tin sơ bộ (đã làm 30/10, tra chéo nhiều nguồn)

| Hạng mục | Thông tin | Mức chắc chắn |
|---|---|---|
| Sự kiện | Hack ví nóng Binance, tối 29/10/2026 (UTC) | Chắc: WaPo, TechCrunch, CNBC, NBC, Axios, CoinDesk, Bloomberg, Al Jazeera |
| Thiệt hại | Binance ước tính **~$6.3B**; TRM Labs **~$6.36B** trên **10 blockchain**, phần lớn chuyển đi trong **~20 phút** | Chắc (ghi "estimated") |
| Giờ bắt đầu | 20:05 UTC (TRM) / ~20:20 UTC (CryptoTimes) / một nguồn ghi 04:00 30/10 | **Mâu thuẫn**: dùng TRM, ghi "approx." |
| Nguyên nhân | Laptop của một kỹ sư DevOps bị xâm nhập → vào được service container → gửi lệnh rút trái phép (Binance, Richard Teng) | Chắc, nhưng là "preliminary" |
| Thủ phạm | TraderTraitor (Triều Tiên), theo TRM và Chainalysis; Binance **chưa xác nhận** | Ghi "suspected" |
| Phong tỏa | Tether ~**$1.56B**, Circle ~**$800M**; tổng bị phong tỏa $2.54B (Al Jazeera) / ~$3B (Bloomberg, Binance) | Mâu thuẫn về tổng: ghi số kèm nguồn |
| Phản ứng | Binance cam kết **bù toàn bộ** (SAFU + vốn công ty); tạm dừng nạp/rút. Yi He: dự kiến mở lại rút tiền trong ~48 h / "Sunday" | Mở lại rút: **chưa xác nhận** |
| Thị trường | BNB −7% đến −8% (~$693–699); BTC < $77K (đáy ~$76,650, thấp nhất 6 tuần); ETH −3% đến −4%; thanh lý **$1.49B** (86,8% lệnh long, CoinGlass) | Chắc; giá thật lấy từ TradingView |
| Bối cảnh | Binance giữ ~$144B tài sản (DefiLlama); nhà phân tích: chưa thấy rủi ro mất khả năng thanh toán | Ghi nguồn |

**Giới hạn:** phiên cloud chặn trang gốc (binance.com, TradingView, chatgpt.com, phần lớn báo chí). Các con số trên đến từ
kết quả tìm kiếm có trích nguồn. Bước G1 phải được làm trên **máy local**, mở từng link để xác nhận đúng câu chữ và đúng
giờ. Các số hack cũ dùng cho bảng xếp hạng (Bybit 2025, Ronin 2022, Poly Network 2021, Mt. Gox 2014) cũng phải tra
nguồn ở G1, không lấy từ trí nhớ.

---

## 2. Cấu trúc video (10:00, 16:9, 60 fps)

Phim gồm 9 **chương (act)**. Mỗi act có một câu hỏi dẫn dắt, một kiểu hình ảnh chủ đạo và một bản nhạc riêng. Các act
này cũng là chương YouTube.

| # | Thời gian | Act (tiêu đề trên màn hình) | Hình ảnh chủ đạo | Nhịp / cảm xúc |
|---|---|---|---|---|
| 0 | 0:00–0:35 | **Cold open**: "20:05 UTC" | Đồng hồ UTC chạy, bộ đếm $ tăng vọt $0 → $6.3B, 10 logo chain lần lượt đỏ lên, tiêu đề "THE $6.3 BILLION HEIST" | Căng, tăng tốc → cú hit lớn |
| 1 | 0:35–1:50 | **What happened** | Timeline theo phút (as reported): rút tiền → phát hiện → dừng nạp/rút → thông báo | Nhịp đều, chữ hiện theo phách |
| 2 | 1:50–3:30 | **How they got in** | Sơ đồ chuỗi tấn công: laptop → container → lệnh rút trái phép → ví nóng; giải thích ví nóng/ví lạnh | Bí ẩn, lắng → bừng sáng ở mỗi mắt xích |
| 3 | 3:30–4:45 | **Who is behind it** | Hồ sơ "TraderTraitor (suspected)" + dòng thời gian các vụ cùng nhóm (đã có nguồn) | Tối, nặng |
| 4 | 4:45–6:15 | **Follow the money** | Dòng tiền chảy giữa các chain, các "băng chặn" Tether/Circle khóa lại, bộ đếm "frozen" | Rượt đuổi, nhanh |
| 5 | 6:15–7:30 | **Market shock** | Biểu đồ nến 1h BNB/BTC/ETH quanh vụ hack (TradingView), thẻ % giảm, cột thanh lý | Kịch tính → hit ở đáy giá |
| 6 | 7:30–8:30 | **Binance responds** | Thẻ cam kết (SAFU + vốn công ty), trạng thái nạp/rút, tỷ lệ $6.3B / $144B | Ổn định lại, sáng hơn |
| 7 | 8:30–9:25 | **Biggest hacks ever** | Bar race các vụ hack lớn nhất (đã có nguồn), Binance vượt lên đầu | Cao trào, hit lớn |
| 8 | 9:25–10:00 | **What to watch** + As of + nguồn | 3 câu hỏi mở (mở lại rút tiền, xác nhận thủ phạm, thu hồi), thẻ "As of …", "Sources: …", not financial advice | Hạ nhịp, kết |

Mỗi act có cùng một khung nhịp:

**Tiêu đề act** (2 ô nhịp) → **3–6 "beat" thông tin** (mỗi beat = một ý) → **khoảng thở** (1–2 ô nhịp, chỉ còn hình nền,
nhạc lên) → **chuyển act** (wipe + SFX).

---

## 3. Thiết kế hiển thị: quy tắc "ít mà rõ"

**Bố cục cố định (16:9, 1920×1080):**
- **Thanh trên** (luôn hiện, nhỏ): `BINANCE HACK` · tên act · `As of Oct 30, hh:mm UTC`.
- **Thanh tiến độ** gồm 9 đoạn, đánh dấu act đang xem.
- **Vùng chính** ở giữa: một hình chủ đạo (sơ đồ, biểu đồ, bộ đếm).
- **Vùng chữ**: tối đa một tiêu đề cộng một dòng phụ.
- **Góc nguồn** dưới phải: tên nguồn nhỏ của con số đang hiện, ví dụ "Source: TRM Labs".

**Quy tắc hiện/ẩn**, được kiểm bằng script:
1. Mỗi lúc chỉ **1 ý chính**: tối đa 1 tiêu đề (≤ 8 từ), 1 dòng phụ (≤ 14 từ) và 1 khối số liệu. Ý cũ phải **ra trước** khi
   ý mới vào; được chồng nhau tối đa 0,3 s khi chuyển.
2. **Thời gian đọc**: mỗi khối chữ hiện ít nhất `1,0 s + 0,32 s × số từ`, tối thiểu 2,5 s. Con số lớn được giữ thêm
   1 ô nhịp.
3. Con số quan trọng hiện bằng **đếm lên** (count-up), dừng đúng trên một phách mạnh kèm SFX.
4. Chữ không chắc chắn luôn có nhãn nhỏ màu hổ phách: `REPORTED`, `ESTIMATED` hoặc `SUSPECTED`.
5. Không có chữ nào nằm ngoài vùng an toàn (5% mép); cỡ chữ tối thiểu 28 px ở 1080p.

**Màu sắc:** nền hologram navy, nét cyan (giống phim BTC). Đỏ `#FF2E63` dành cho tổn thất/tấn công, xanh `#00FFA3`
cho phục hồi/phong tỏa, hổ phách cho chữ "chưa xác nhận", vàng BNB `#F3BA2F` cho Binance.

**Thành phần hình ảnh (component)**, mỗi cái là một hàm vẽ thuần theo thời gian t, xem thêm mục 5:
- `headline`: chữ glow gõ ra theo phách.
- `counter`: bộ đếm tiền/số.
- `timeline`: trục thời gian có các mốc.
- `flowDiagram`: các nút và mũi tên phát sáng.
- `chainGrid`: 10 logo chain.
- `walletDrain`: thanh ví rút cạn.
- `candleMini`: nến 1h, tái dùng logic nến của phim giá.
- `barRace`: bảng xếp hạng dạng thanh chạy đua.
- `statusBoard`: trạng thái nạp/rút.
- `sourceTag`: nhãn nguồn.
- `actCard`: thẻ tiêu đề act.
- `transition`: wipe, glitch, flash.

---

## 4. Nhịp điệu và âm thanh

- **Một bản nhạc riêng cho mỗi act**, theo phong cách đã duyệt: down-cue 80 BPM căng thẳng cho act 0–5, cue sáng hơn cho
  act 6, cao trào cho act 7, outro lắng cho act 8. Tempo cố định trong act, nên **ô nhịp là đơn vị dàn dựng**: mọi
  chữ, số và hình đều vào/ra trên phách.
- **SFX theo vai trò:**
  - riser + cắt lặng 1/16 → impact (subBoom + crash), dùng cho "hit lớn": tiêu đề phim, con số $6.3B, đáy giá, Binance #1;
  - tick/blip cho từng mốc timeline;
  - whoosh khi chuyển act;
  - "lock" (thud kim loại + bell) khi phong tỏa.
- **Mật độ:** mỗi act có tối đa 2 hit lớn, các hit lớn cách nhau ≥ 20 s. Dùng khoảng lặng có chủ đích trước hit.
- Master **−16 LUFS**, true peak ≤ −1 dBTP. Kiểm tra mọi hit bằng `engine/render.js verify` (hình + tiếng lệch ≤ 1 frame / 20 ms).

---

## 5. Kiến trúc kỹ thuật: pipeline `news/` dùng lại được

Làm theo mẫu `sales/` (cô lập, không đụng dữ liệu hay nhạc của phim giá):

```
bitcoin-chart-2020-2026/news/
  README.md         quy trình + lệnh
  core.js           đọc story → lịch dàn dựng tuyệt đối (act, beat, vào/ra theo ô nhịp), trạng thái theo t
  components.js     các hàm vẽ ở mục 3 (chép txt/panel/glowLine/shockwave/dust/scanlines từ film.js)
  film.js           Studio.film({draw, init, post}) ghép component theo trạng thái từ core
  score.js          adapter SCORE: FPS 60, DURATION, clock theo act, markers (hit lớn = sync 'av'), S = act
  song.js           adapter nhạc: cue mỗi act + SFX (dùng lại engine/audio/instruments, mix.master −16 LUFS)
  index.html        engine/util, engine/music, story.js, core, score, gfx, boot, film
  build.js          workspace out/news/<story>/<hash>/ + fingerprint (như sales/build.js)
  render.js         layout | preview <start> | full-preview | final   (FPS=60 LUFS=-16)
  check.js          kiểm nguồn + quy tắc đọc/hiện-ẩn + vùng an toàn (dùng probeAt fillText như engine/tools/pacing.js, qa.js)
  test.js           node:test cho core (lịch, thời gian đọc, không chồng ý)
  stories/binance-hack-2026-10/
    story.json      act → beats (component, chữ, số, claimId, thời lượng theo ô nhịp)
    claims.csv      claimId,text,value,status(confirmed|reported|estimated|suspected),as_of
    sources.csv     claimId,source,url,published,quote (≥2 nguồn độc lập cho mỗi con số)
    prices/         TradingView 1h BINANCE:BNBUSDT, INDEX:BTCUSD, INDEX:ETHUSD (28–31/10)
    assets/         logo Binance + logo 10 chain (chính thức)
    approval.json   G1–G5, khóa theo hash nội dung
```

**Tái sử dụng:**
- `engine/render.js`: `stills`, `clip`, `video`, `mux`, `verify`, `check`, `plan`.
- `engine/util.js`: `ease`, `tween`, `keys`, `pulse`, `springKick`.
- `engine/music.js`: `makeClock`, `makeChords`.
- `engine/audio/*`: nhạc cụ, `mix.master`.
- Hiệu ứng hit trong `song.js` của phim giá (khoảng dòng 399–431): reverse cymbal → riser → impact.
- `engine/video/shots.js`: chuyển cảnh.
- `engine/tools/pacing.js` và `qa.js`.
- `keep-render.js`.
- `fetch-tradingview.js`: cần thêm tham số khung **1h** (hiện chỉ lấy 1D). Phải chạy trên local vì TradingView bị chặn
  trên cloud.

**Tài liệu:**
- Thêm **PROJECT.md §20 "News deep-dive"**: các quy tắc mục 3–4, các cổng duyệt mục 6, quy tắc nguồn của story (≥ 2 nguồn
  độc lập, chính thức trước).
- Thêm phần tương ứng vào `CLAUDE.md` và `AGENTS.md`.
- `youtube.md`: mẫu tiêu đề/mô tả cho dạng news (tiêu đề bắt đầu bằng chủ thể, ví dụ "Binance Hack Explained: …", có
  "As of"; chương = 9 act).

---

## 6. Quy trình bài bản: các cổng duyệt (mỗi cổng chờ người dùng "OK")

| Cổng | Việc | Bàn giao cho người dùng |
|---|---|---|
| **G0** | git sync; đối chiếu nội dung ChatGPT bạn dán | Danh sách điểm khớp / lệch |
| **G1: Fact sheet** | Trên local: mở từng link, điền `claims.csv` + `sources.csv`; chốt mốc **As of**; liệt kê mâu thuẫn và cách ghi | Bảng sự kiện (như mục 1) có link; **chưa duyệt thì không viết kịch bản** |
| **G2: Kịch bản / storyboard** | `story.json` đầy đủ: mọi chữ trên màn hình theo thời gian (`render.js plan` → treatment), `check.js` đạt | Bảng act × beat × giây × chữ |
| **G3: Thiết kế** | 6–8 khung hình tĩnh 1080p: cold open, actCard, timeline, flowDiagram, counter + sourceTag, candleMini, barRace, outro | Ảnh tĩnh để duyệt bố cục/màu |
| **G4: Nhạc** | Bản nghe thử cue của từng act + mẫu SFX (chỉ audio) | File wav |
| **G5: Preview** | (a) 480p60 khoảng 60 s: cold open + act 1; (b) sau khi duyệt: toàn phim 480p60 | Video + kết quả verify/check |
| **G6: Final** | 1080p60 (hỏi lại độ phân giải theo §1.6), `keep-render`, verify, YouTube title/description/chương | Video + text YouTube |

Nếu tin có diễn biến mới giữa các cổng: cập nhật `claims.csv`, đổi mốc As of, chạy lại `check.js`. Chỉ render lại các act
bị ảnh hưởng (`keep-render check`).

---

## 7. Kiểm tra (verification)

- `node news/test.js`: lịch dàn dựng đúng ô nhịp, không có hai "ý chính" trùng lúc, thời gian đọc đủ.
- `node news/check.js`: mọi con số và mọi câu khẳng định có `claimId` với ≥ 2 nguồn (hoặc 1 nguồn chính thức); nhãn
  REPORTED/ESTIMATED/SUSPECTED khớp `status`; chữ nằm trong vùng an toàn; cỡ chữ ≥ 28 px; tối đa 1 tiêu đề + 1 dòng phụ.
- `engine/render.js verify`: mọi hit lớn khớp hình/tiếng; `check`: loudness −16 LUFS, true peak ≤ −1 dBTP.
- Xem khung hình tĩnh ở mỗi ranh giới act và ở mỗi hit (G3/G5) trước khi gửi.

---

## Nguồn đã tra (tìm kiếm 30/10/2026)

- TRM Labs: https://www.trmlabs.com/resources/blog/north-korea-steals-usd-6-36-billion-from-binance-in-the-largest-hack-in-history
- Washington Post: https://www.washingtonpost.com/technology/2026/10/29/suspected-binance-hack-sets-off-scramble-lock-down-billions-crypto/
- TechCrunch: https://techcrunch.com/2026/10/29/binance-pauses-withdrawals-as-hackers-suspected-of-stealing-billions-in-crypto/
- CNBC: https://www.cnbc.com/2026/10/30/billions-in-crypto-frozen-in-binance-hack-heres-what-happens-next-.html
- CNBC (thị trường): https://www.cnbc.com/2026/10/30/bitcoin-ether-price-binance-security-scare-rattles-crypto-markets.html
- NBC News: https://www.nbcnews.com/business/markets/binance-hack-tether-circle-stablecoins-rcna606445
- Axios: https://www.axios.com/2026/10/29/binance-cyberattack-crypto-heist
- CoinDesk: https://www.coindesk.com/business/2026/10/29/potential-multi-billion-binance-hack-hitting-crypto-markets
- Bloomberg: https://www.bloomberg.com/news/articles/2026-10-29/binance-founder-says-possible-hack-of-exchange-bitcoin-falls
- Al Jazeera: https://www.aljazeera.com/economy/2026/10/30/binance-says-2-54bn-in-crypto-funds-frozen-amid-potential-security-issue
- The Block: https://www.theblock.co/news/markets/2026-10-29-bitcoin-slides-below-77000-binance-hack-432183
- FinanceFeeds (thanh lý): https://financefeeds.com/bitcoin-falls-below-77000-as-binance-hack-triggers-1-5-billion-in-crypto-liquidations/
- U.Today (mở lại rút tiền): https://u.today/binance-reveals-when-it-will-resume-withdrawals-after-historic-hack
- CryptoTimes (giờ bắt đầu, nguồn phụ): https://www.cryptotimes.io/2026/10/30/binance-hack-live-updates-the-6-3-billion-security-breach-in-hot-wallets/
