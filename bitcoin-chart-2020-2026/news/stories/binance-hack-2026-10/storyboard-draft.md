# Storyboard NHÁP — "Binance Breach" (news deep-dive, 16:9, ~10:01, 60 fps)

Bản nháp làm theo yêu cầu người dùng ngày 30/10/2026, **trước G1**. Mọi con số và khẳng định gắn **[G1]** là chưa
kiểm chứng: sẽ sửa hoặc bỏ theo fact sheet đã duyệt. Chữ trên màn hình viết bằng tiếng Anh; ghi chú viết bằng tiếng Việt.

## Khung chung

- **Thanh trên (luôn hiện, nhỏ):** `BINANCE BREACH · <TÊN ACT> · AS OF OCT 30, hh:mm UTC [G1]`.
- **Thanh tiến độ dưới:** 9 đoạn, đoạn đang xem sáng cyan.
- **Góc nguồn dưới phải:** `SOURCE: <tên>`, đổi theo con số đang hiện.
- **Nhãn trạng thái (hổ phách):** `ESTIMATED` · `REPORTED` · `SUSPECTED` · `PRELIMINARY`.
- **Màu:**
  - đỏ `#FF2E63`: tấn công / tổn thất;
  - xanh `#00FFA3`: phong tỏa / phục hồi;
  - vàng `#F3BA2F`: Binance;
  - cyan: on-chain / dữ liệu.
- **Nhịp:**
  - 80 BPM, 1 ô nhịp = 3,0 s; 100 BPM, 1 ô nhịp = 2,4 s.
  - Mọi chữ vào/ra đúng phách.
  - **HIT** = riser → lặng 1/16 → impact + flash + sóng xung kích.
- **Quy tắc:** mỗi lúc chỉ 1 tiêu đề (≤ 8 từ) + 1 dòng phụ (≤ 14 từ) + 1 khối hình. Thời gian đọc ≥ 1,0 s + 0,32 s/từ.

| # | Act | Thời gian | Ô nhịp | Nhạc (đã duyệt, không lặp) | HIT |
|---|---|---|---|---|---|
| 0 | Cold open | 0:00–0:36 | 12 @80 | Siege | 1 |
| 1 | What happened | 0:36–1:51 | 25 @80 | Collapse | 1 |
| 2 | How they got in | 1:51–3:30 | 33 @80 | Undertow | 1 |
| 3 | Who is behind it | 3:30–4:45 | 25 @80 | Shadow | 1 |
| 4 | Follow the money | 4:45–6:15 | 30 @80 | Vertigo | 1 |
| 5 | Market shock | 6:15–7:30 | 25 @80 | Tremor | 1 |
| 6 | Binance responds | 7:30–8:30 | 25 @100 | Horizon | 1 |
| 7 | Biggest hacks ever | 8:30–9:25 | 23 @100 | Warpath | 1 |
| 8 | What to watch | 9:25–10:01 | 12 @80 | Standoff | 0 |

---

## Act 0 — Cold open (0:00–0:36, Siege)

| Thời gian | Ô nhịp | Hình | Chữ trên màn hình | Âm thanh |
|---|---|---|---|---|
| 0:00–0:06 | 2 | Nền đen → hologram. Đồng hồ UTC lớn đang chạy giây | `OCT 29 · 20:05 UTC` [G1: 20:05 hay 20:24] | Nhịp tim + tích tắc |
| 0:06–0:15 | 3 | Thanh "Binance hot wallets" rút cạn dần. Bộ đếm `$0 → $6.3B` tăng tốc. 10 ô chain lần lượt đỏ lên | `$6.3B` + `ESTIMATED IMPACT` · phụ: `Moved out in about 20 minutes` [G1] | Riser dâng dần |
| 0:15–0:18 | 1 | **HIT**: tiêu đề nổ ra giữa màn hình | `THE $6.3 BILLION BREACH` | Lặng 1/16 → impact |
| 0:18–0:30 | 4 | Tiêu đề thu lên trên. 4 chip lần lượt hiện theo phách | phụ: `Possibly the largest crypto hack on record` (REPORTED) → chip `WHAT · HOW · WHO · NEXT` | Nhạc vào full |
| 0:30–0:36 | 2 | Khoảng thở, rồi wipe ngang | — | Whoosh |

## Act 1 — What happened (0:36–1:51, Collapse)

| Thời gian | Ô nhịp | Hình | Chữ | Âm thanh |
|---|---|---|---|---|
| 0:36–0:42 | 2 | actCard | `01 · WHAT HAPPENED` | Whoosh vào |
| 0:42–0:51 | 3 | Trục thời gian UTC 20:00 → 21:00, mốc 1 sáng lên | `20:05 UTC · Outflows begin` · SOURCE TRM Labs [G1] | Tick |
| 0:51–1:00 | 3 | Mốc 2; ví "Binance 14" rút ra | `20:24 UTC · 167,464 ETH leaves Binance 14` · SOURCE Etherscan / CoinDesk [G1] | Tick |
| 1:00–1:09 | 3 | Mốc 3; 10 chain sáng cùng lúc | `~20 minutes · 10 blockchains` · SOURCE TRM Labs | Tick |
| 1:09–1:18 | 3 | Bảng trạng thái chuyển đỏ | `Deposits & withdrawals: PAUSED` | Khóa kim loại |
| 1:18–1:30 | 4 | **HIT**: bộ đếm `$6.3B` dừng đúng phách | `$6.3B` `ESTIMATED IMPACT` · phụ: `Binance's estimate — not a confirmed net loss` | Impact |
| 1:30–1:42 | 4 | Bậc thang ước tính tăng dần theo thời gian | `Early reports: $2B+ → $6.3B` · SOURCE TechCrunch, Binance [G1] | Bậc + tick |
| 1:42–1:51 | 3 | Khoảng thở → wipe | — | Whoosh |

## Act 2 — How they got in (1:51–3:30, Undertow) — đoạn "giải mã"

Có 2 lớp, chuyển lớp bằng đổi màu badge:

| Thời gian | Ô nhịp | Hình | Chữ | Âm thanh |
|---|---|---|---|---|
| 1:51–1:57 | 2 | actCard | `02 · HOW THEY GOT IN` | Whoosh |
| 1:57–2:06 | 3 | Badge hổ phách `BINANCE: PRELIMINARY`. Nút 1 (icon laptop) sáng | `A DevOps engineer's laptop` · phụ: `Suspected compromised` | Blip |
| 2:06–2:15 | 3 | Mũi tên phát sáng → nút 2 (container) | `Access to a service container` | Blip |
| 2:15–2:24 | 3 | → nút 3 (lệnh rút đỏ nhấp nháy) | `Unauthorized withdrawals submitted` | Blip |
| 2:24–2:36 | 4 | Sơ đồ thu nhỏ sang trái. Bên phải: ví nóng (online) vs ví lạnh (offline) | `Hot wallet: online, pays out withdrawals` / `Cold wallet: offline storage` | Lắng |
| 2:36–2:45 | 3 | Biểu tượng chìa khóa có dấu "?" | `No evidence private keys leaked` · SOURCE Binance (statement) | — |
| 2:45–2:57 | 4 | Badge đổi cyan `ON-CHAIN EVIDENCE`. Ví Binance 14 + mã hợp đồng | `EIP-7702: a wallet can run contract code` | Riser nhẹ |
| 2:57–3:06 | 3 | 50 tia ủy quyền bắn vào ví, 49 tắt, 1 xuyên qua | `50 authorizations sent. One worked.` · SOURCE Blockaid [G1] | Ticks dồn dập |
| 3:06–3:15 | 3 | **HIT**: ví thành "sweeper", dòng ETH tự chảy sang ví hacker, bộ đếm 167,464 ETH | `Binance 14 became a sweeper` · SOURCE CoinDesk [G1] | Impact |
| 3:15–3:21 | 2 | Thẻ câu hỏi mở | `How was it signed? Still unknown.` | Lặng |
| 3:21–3:30 | 3 | Khoảng thở → wipe | — | Whoosh |

## Act 3 — Who is behind it (3:30–4:45, Shadow)

| Thời gian | Ô nhịp | Hình | Chữ | Âm thanh |
|---|---|---|---|---|
| 3:30–3:36 | 2 | actCard | `03 · WHO IS BEHIND IT` | Whoosh |
| 3:36–3:45 | 3 | **HIT**: hồ sơ mật, đóng dấu đỏ | `TRADERTRAITOR` + `SUSPECTED` | Dấu đóng + impact |
| 3:45–3:54 | 3 | 2 logo nguồn | `Attribution: TRM Labs, Chainalysis` | — |
| 3:54–4:03 | 3 | Bản đồ phát sáng (Triều Tiên) | `A North Korea-linked hacking group` [G1 nguồn] | — |
| 4:03–4:21 | 6 | Timeline các vụ trước được quy cho nhóm này | 3–4 vụ, mỗi vụ 1,5 ô nhịp (tên · năm · giá trị) [G1, toàn bộ số] | Tick mỗi vụ |
| 4:21–4:30 | 3 | Vụ Bybit 2025 sáng lên, nối với Binance | `TRM: similarities with Bybit 2025` | — |
| 4:30–4:36 | 2 | Dấu hổ phách | `Not confirmed by Binance or US authorities` | — |
| 4:36–4:45 | 3 | Khoảng thở → wipe | — | Whoosh |

## Act 4 — Follow the money (4:45–6:15, Vertigo)

| Thời gian | Ô nhịp | Hình | Chữ | Âm thanh |
|---|---|---|---|---|
| 4:45–4:51 | 2 | actCard | `04 · FOLLOW THE MONEY` | Whoosh |
| 4:51–5:03 | 4 | Đồ thị dòng tiền: ví Binance → ví hacker → 10 chain (hạt sáng chạy) | `Funds scattered across wallets and chains` | Rượt đuổi |
| 5:03–5:12 | 3 | Nhánh vào logo Uniswap / Aave | `Some routed through DeFi` · SOURCE Fortune [G1] | — |
| 5:12–5:18 | 2 | Ổ khóa xanh đóng lên nhánh USDT | `Tether froze ~$1.57B` | Khóa |
| 5:18–5:24 | 2 | Khóa USDC | `Circle froze $800M+` | Khóa |
| 5:24–5:30 | 2 | Khóa RLUSD/Ripple | `Ripple froze ~$200M` [G1] | Khóa |
| 5:30–5:36 | 2 | Khóa WLF | `World Liberty froze ~$29M` [G1] | Khóa |
| 5:36–5:45 | 3 | **HIT**: tổng bị khóa | `~$3B FROZEN` · SOURCE Binance | Impact (sáng, xanh) |
| 5:45–5:54 | 3 | Dấu "≠" lớn | `Frozen is not recovered` | — |
| 5:54–6:03 | 3 | Thế chấp stablecoin → vay ETH | `Collateral posted on Aave, ETH borrowed` [G1] | — |
| 6:03–6:15 | 4 | Khoảng thở → wipe | — | Whoosh |

## Act 5 — Market shock (6:15–7:30, Tremor)

Nến 1h từ TradingView, khung 29/10 12:00 → 30/10 12:00 UTC. Có vạch dọc tại giờ tấn công. Giá và % lấy từ dữ liệu, không lấy từ báo.

| Thời gian | Ô nhịp | Hình | Chữ | Âm thanh |
|---|---|---|---|---|
| 6:15–6:21 | 2 | actCard | `05 · MARKET SHOCK` | Whoosh |
| 6:21–6:33 | 4 | Nến BTC chạy, rơi qua vạch | `BTC` + đáy và % [G1 TradingView] | Rung |
| 6:33–6:45 | 4 | Nến ETH | `ETH` + đáy và % [G1] | Rung |
| 6:45–6:57 | 4 | **HIT** ở đáy BNB (giảm sâu nhất) | `BNB` + đáy và % [G1] | Impact |
| 6:57–7:06 | 3 | Cột thanh lý, đỏ 86,8% | `$1.49B liquidated · 86.8% longs` · SOURCE CoinGlass [G1, cần nguồn thứ 2] | — |
| 7:06–7:15 | 3 | 2 thẻ cổ phiếu | `Coinbase and Strategy shares fell` [G1] | — |
| 7:15–7:30 | 5 | Khoảng thở → wipe | — | Whoosh |

## Act 6 — Binance responds (7:30–8:30, Horizon, 100 BPM)

| Thời gian | Ô nhịp | Hình | Chữ | Âm thanh |
|---|---|---|---|---|
| 7:30–7:35 | 2 | actCard (đổi sang tông sáng hơn) | `06 · BINANCE RESPONDS` | Whoosh |
| 7:35–7:44 | 4 | Bảng trạng thái | `Withdrawals: PAUSED` → `Expected back within 48h` (REPORTED) [G1 cập nhật] | Blip |
| 7:44–7:54 | 4 | Thẻ cam kết vàng | `Losses covered: SAFU fund + company capital` | — |
| 7:54–8:06 | 5 | **HIT**: 3 khối cạnh nhau | `$6.3B IMPACT · ~$3B FROZEN · ~$3.3B UNKNOWN` | Impact |
| 8:06–8:16 | 4 | Đồng hồ đo dự trữ ETH 100% → ~94% | `ETH reserve ratio ~94% before top-up` · `ESTIMATED` · SOURCE CoinDesk [G1] | Kim tụt |
| 8:16–8:25 | 4 | Khối lớn mờ | `$162.8B in customer custody — not Binance's own money` · SOURCE Reuters [G1] | — |
| 8:25–8:30 | 2 | Khoảng thở → wipe | — | Whoosh |

## Act 7 — Biggest hacks ever (8:30–9:25, Warpath, 100 BPM)

Bar race, mọi số **[G1]**: chỉ dùng số có nguồn, giá trị tại thời điểm xảy ra.

| Thời gian | Ô nhịp | Hình | Chữ | Âm thanh |
|---|---|---|---|---|
| 8:30–8:35 | 2 | actCard | `07 · BIGGEST HACKS EVER` | Whoosh |
| 8:35–8:42 | 3 | Trục giá trị, chú thích cách đo | `Ranked by reported value at the time` | — |
| 8:42–9:01 | 8 | 4 vụ lần lượt mọc lên (mỗi vụ 2 ô nhịp), ví dụ Mt. Gox · Poly Network · Ronin · Bybit [G1] | tên · năm · giá trị | Tick mỗi thanh |
| 9:01–9:11 | 4 | **HIT**: thanh Binance vọt lên #1 | `BINANCE · 2026 · $6.3B` + `#1` | Impact lớn |
| 9:11–9:18 | 3 | Dấu hổ phách | `Estimated impact, not a final loss` | — |
| 9:18–9:25 | 3 | Khoảng thở → wipe | — | Whoosh |

## Act 8 — What to watch (9:25–10:01, Standoff)

| Thời gian | Ô nhịp | Hình | Chữ | Âm thanh |
|---|---|---|---|---|
| 9:25–9:31 | 2 | actCard | `08 · WHAT TO WATCH` | Whoosh nhẹ |
| 9:31–9:43 | 4 | 4 câu hỏi, mỗi câu 1 ô nhịp, câu cũ mờ đi khi câu mới vào | `How was the laptop breached?` · `Who signed the delegation?` · `How much will be recovered?` · `When do withdrawals fully resume?` | Tick nhẹ |
| 9:43–9:49 | 2 | Thẻ As of | `AS OF OCT 30, hh:mm UTC — story developing` [G1] | — |
| 9:49–9:55 | 2 | Danh sách nguồn | `Sources: Binance · Reuters · AP · CoinDesk · TRM Labs · Chainalysis · TradingView` [G1] | — |
| 9:55–10:01 | 2 | Fade ra đen | `For education only. Not financial advice.` | Hợp âm kết |

---

## Kiểm tra sơ bộ trên bản nháp

- Mỗi act có đúng 1 HIT; các HIT cách nhau ≥ 20 s. Gần nhất là 2:57→3:06 sweeper và 3:36 TraderTraitor, cách 30 s.
- Câu dài nhất hiện trên màn hình là `$162.8B in customer custody — not Binance's own money`, 9 từ, cần 3,9 s. Có
  4 ô nhịp × 2,4 s = 9,6 s, đủ.
- Không có nội dung khuyên đầu tư. Mục "nên làm gì" của ghi chú ChatGPT không đưa vào video.
