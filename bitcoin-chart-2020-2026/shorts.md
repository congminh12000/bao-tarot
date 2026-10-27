# Shorts 9:16 — TikTok, Reels, YouTube Shorts (cắt từ video dài 16:9)

**Trạng thái: ĐÃ DUYỆT** (26/10/2026, preview short #6 — downtrend 12/2017 → 12/2018). Tóm tắt quy tắc: PROJECT.md §12.
Code: `SHORT=<số phase>` trong `make-data.js` → `score.js` / `song.js` / `film.js` (nhánh `SHORT`).

## 1. Một short = một phase

- Mỗi phase uptrend hoặc downtrend của video dài thành **1 short riêng**: từ điểm chuyển đầu phase (ATL hoặc ATH) tới
  điểm chuyển kế tiếp (cây nến của điểm chuyển cuối nằm trong short). Bitcoin: **13 short** (phase cuối chưa có điểm chuyển
  kết thúc thì chạy tới hết dữ liệu). Đồng khác: theo `phases.csv` của đồng đó.
- Cùng dữ liệu, cùng bài nhạc của phase đó trong video dài.

## 2. Thời lượng

- **20–45 s**: lấy độ dài phase trong video dài, giới hạn 20–45 s, làm tròn theo **bội số 4 ô nhịp** của bài nhạc (16 phách):
  100 BPM → 19,2 / 28,8 / 38,4 s; 80 BPM → 24 / 36 s. Tempo cố định cả short (không phanh ở điểm chuyển).

## 3. Vào là chạy, không fade-in

- Khung đầu sáng đủ, nến đang chạy, nhạc vào thẳng phần đầy đủ nhất của bài (4 ô nhịp cuối của chu kỳ phối khí, lặp lại):
  không lấy đà, không tiêu đề, không fade.

## 4. Vòng lặp: chạy tiếp, không zoom-out

- Tới nhãn điểm chuyển cuối phase (ATH / ATL, hit 2 + hiệu ứng), chart **chạy tiếp** sang cây nến đầu video ở **mức giá
  đầu video**: downtrend → downtrend mãi, uptrend → uptrend mãi. Không kéo lùi, không zoom-out.
- Cách làm (`score.js`): các ngày trước nến đầu (pre-run 60 ngày) là **đoạn cuối phase nhân tỉ lệ** lên giá đầu (`LOOPK`);
  không có trục giá nên hình liền mạch, chỉ giá ở phần trên nhảy về giá đầu. Camera, nhãn và hiệu ứng của vài giây cuối
  chạy tiếp qua chỗ nối; nhãn điểm chuyển cuối tự tránh các nến của vòng mới.
- Nhạc: dài đúng bội số 4 ô nhịp; phần ngân vang sau điểm cuối được cộng vào đầu → lặp không vấp.
- Badge % tính từ giá khung đầu → về 0% khi lặp lại.

## 5. Bố cục 9:16 và vùng an toàn (1080 × 1920)

Các nền tảng che: **trên ~250 px**, **dưới ~420 px**, **cột phải ~160 px từ y ≈ 640 tới 1500**.

- **Không có trục X / Y**, không lưới, không nhãn giá / tháng / năm, không đường giá chấm. Thời gian và giá nằm ở phần trên.
- **Phần trên: 2 hàng, canh đều hai mép** (lề 60 px):

  | | Trái | Phải |
  |---|---|---|
  | Hàng 1 (80 px, glow 4,2) | `BTC / USD` | **giá đang chạy** |
  | Hàng 2 | ngày (`Dec 15, 2018`, 36 px) | badge `▼ DOWNTREND −84%` (26 px; % từ khung đầu) |

- Không có đường chia. **Vùng nến**: x 60–900, y 560–1400, `PPD = 20` (~6 tuần nến), viền nến dày, chấm sáng ở nến đang chạy.
- **Coin nền ở đúng giữa màn hình**, mờ hơn video dài. Dưới y 1500 để trống cho caption.

## 6. Nhãn và hiệu ứng

- **Đủ các mức nhãn như video dài** (mức 1, mức 2, halving), cùng quy tắc không đè nhau; chữ to hơn (mức 2 = 40 px, mức 1 =
  28 px, ngày 26 px), nằm trong y 500–1480 và bên trái x 900. Nhãn mờ dần và mất khi trôi ra mép trái.
- **Bỏ nhãn điểm chuyển đầu phase**: short downtrend không có nhãn ALL-TIME HIGH, short uptrend không có nhãn ALL-TIME LOW.
  Nhãn điểm chuyển cuối giữ nguyên (hit 2).
- Rung, bụi sáng, scanline giảm 50%. Không ô tổng kết, không zoom-out.

## 7. Render và đăng

- Câu hỏi khi "render video final" (PROJECT.md §1.6): đồng coin → tỷ lệ (9:16 = Shorts) → **xuất tất cả 1 lượt hay chọn
  phần lẻ** (liệt kê phase: số, up/down, ngày) → độ phân giải.
- 1080 × 1920, **60 fps**, mỗi short một file `<coin>-short-<số phase>-<up|down>`; lưu bằng `keep-render.js … --format 9:16`.
- **Preview**: video gửi duyệt phải có **ít nhất 1 chỗ nối vòng lặp bên trong** (phát short 2 lần liền, file `-loop2`).
  **Final**: chỉ 1 vòng — cuối video nối thẳng vào đầu video (nền tảng tự phát lặp).
- Tiêu đề / caption: bắt đầu bằng tên đồng, không số năm, theo tinh thần `youtube.md`; hashtag `#Bitcoin #Crypto #Shorts`.

```bash
SHORT=6 node make-data.js && node song.js
FPS=60 node engine/render.js video --format 9:16 --res 480
FPS=60 node engine/render.js mux btc-short-6-down --format 9:16 --res 480
FPS=60 node engine/render.js verify btc-short-6-down --format 9:16 --res 480
FPS=60 node keep-render.js save btc-short-6-down --format 9:16 --res 480
ffmpeg -stream_loop 1 -i out/btc-short-6-down-9x16-480p.mp4 -c copy out/btc-short-6-down-9x16-480p-loop2.mp4   # preview
node make-data.js && node song.js     # LUÔN khôi phục dữ liệu phim dài
# final: bỏ --res 480 (1080p), không ghép loop2
```
