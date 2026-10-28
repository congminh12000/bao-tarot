# Dữ liệu giá BTC/USD

Video đọc dữ liệu từ `btc-data.js`. File này **được sinh tự động** bằng `node make-data.js` từ các file trong thư mục này:

| file | nội dung |
|---|---|
| `tradingview/*.csv` | **Nến ngày thật** export từ TradingView (đặt bao nhiêu file cũng được) |
| `anchors.csv` | Giá gần đúng ở các điểm đảo chiều. Chỉ dùng để lấp những ngày chưa có file TradingView |
| `events.csv` | Các sự kiện hiện trên biểu đồ và tạo "hit" trong nhạc |
| `btc-daily.csv` | (sinh tự động) Toàn bộ nến sau khi gộp, cột `source`: `tv` = TradingView, `est` = ước lượng |

## Lấy dữ liệu thật từ TradingView

1. Mở biểu đồ `BITSTAMP:BTCUSD` (Bitstamp có dữ liệu từ 2011; nếu cần từ 2010 thì dùng `INDEX:BTCUSD`), khung **1D**.
2. Kéo biểu đồ về tận đầu lịch sử để TradingView tải đủ nến.
3. Menu ⋯ (Manage layouts) → **Export chart data…** → Time format: *ISO time* hoặc *UNIX timestamp*, đều được.
4. Lưu file `.csv` vào `data/tradingview/` (ví dụ `2011-2026.csv`).
5. Chạy:
   ```bash
   node make-data.js     # gộp dữ liệu -> btc-data.js
   node song.js          # nhạc tự khớp lại timeline mới
   node engine/render.js video && node engine/render.js mux
   ```

## Cập nhật thêm sau này

Chỉ cần export đoạn mới (ví dụ 3 tháng gần nhất) thành một file mới, đặt tên xếp sau theo thứ tự chữ cái (ví dụ `2026-10.csv`), rồi chạy lại các lệnh trên.
Nếu hai file có cùng một ngày thì **file đứng sau ghi đè** file trước. Ngày nào chưa có dữ liệu thật thì dùng ước lượng từ `anchors.csv`.

Chỉ dựng một giai đoạn: `FROM=2020-01-01 node make-data.js` (thêm `TO=2026-06-30` nếu muốn dừng sớm).

## Thêm / sửa sự kiện

Mỗi dòng trong `events.csv` có dạng `ngày,kind,hit,tag,nội dung,remove`:
- `kind`: `up` (nhãn đặt trên đỉnh nến), `down` (dưới đáy), `info`
- `hit`: `1` = quan trọng (nhãn nhỏ, không SFX), `2` = cột mốc / khủng hoảng (nhãn lớn + SFX + hiệu ứng). `0` = sự kiện bổ sung, hiển thị như nhãn mức 1 ở mọi altcoin; riêng BTC ẩn mức 0.
- `tag`: để trống, hoặc `halving` = sự kiện nội tại đặc biệt (nhãn màu vàng, còn hiện khi zoom-out cuối phim)
- `remove`: `true` = không đưa vào video, `false` = áp dụng mức hiển thị. Giữ cả dòng và nguồn; đổi về false để hiện lại.
  Research lưu đầy đủ cả mục lặp; tự đặt `true` cho release/bảo trì/nâng cấp nhỏ lặp hoặc báo cáo nhắc lại, kèm lý do.
  Mục mới không lặp mặc định false; file cũ 5 cột mặc định false. Giữ quyết định đã duyệt khi refresh nguồn (§16).
  Sau khi sửa danh sách/flag, gửi danh sách giữ/loại cụ thể và chờ người dùng duyệt trước mọi render, kể cả preview (§1.2).
- ALL-TIME HIGH / ALL-TIME LOW ở các điểm chuyển phase do `score.js` tự gắn (hoặc tự tạo), không cần ghi tay

Thời lượng video và bản nhạc tự tính lại theo dữ liệu và các hit.

## Đối chiếu nguồn bắt buộc

Tuân thủ PROJECT.md §13. Chạy `python3 audit-99bitcoins.py --live` cho mọi coin trước khi báo đã cập nhật đủ nguồn.
Snapshot và phạm vi: `source-audits/99bitcoins/README.md`; ánh xạ từng ID: `99bitcoins-coverage.json`.
