# Binance hack (29/10/2026): fact sheet DRAFT, CHƯA KIỂM CHỨNG

Lập ngày 30/10/2026 trên cloud, chỉ dựa vào kết quả tìm kiếm có trích nguồn. Phiên cloud không mở được trang gốc.
**Chưa dùng để viết storyboard.** Ở G1 (trên máy local) phải mở từng link, đối chiếu đúng câu chữ, số và giờ, rồi chuyển
sang `claims.csv` + `sources.csv`.

| id | Khẳng định | Giá trị | Trạng thái dự kiến | Nguồn (cần mở để xác nhận) | Ghi chú / mâu thuẫn |
|---|---|---|---|---|---|
| total | Tổng giá trị bị lấy | ~$6.3B (Binance); ~$6.36B (TRM) | estimated | TRM Labs; CNBC; NBC; CoinDesk | Ban đầu TechCrunch ghi "ít nhất $2B" |
| chains | Số blockchain bị ảnh hưởng | 10 | reported | TRM Labs | |
| speed | Phần lớn tiền bị chuyển đi trong | ~20 phút | reported | TRM Labs | |
| start | Giờ bắt đầu | 20:05 UTC 29/10 | reported | TRM Labs | CryptoTimes ghi ~20:20 UTC; một nguồn ghi 04:00 30/10 → chọn TRM, ghi "approx." |
| cause | Laptop của một kỹ sư DevOps bị xâm nhập → service container → lệnh rút trái phép | | preliminary | Binance (Richard Teng), WaPo, Bloomberg | |
| actor | TraderTraitor (Triều Tiên) | | suspected | TRM Labs; Chainalysis | Binance chưa xác nhận |
| frozen-usdt | Tether phong tỏa | ~$1.56B | reported | NBC; Al Jazeera | |
| frozen-usdc | Circle phong tỏa | ~$800M | reported | NBC | |
| frozen-total | Tổng bị phong tỏa | $2.54B / ~$3B | reported | Al Jazeera / Bloomberg | Mâu thuẫn: ghi cả hai kèm nguồn |
| cover | Binance bù toàn bộ thiệt hại (SAFU + vốn công ty) | | confirmed (company statement) | Binance; CNBC; Bloomberg | |
| pause | Tạm dừng nạp/rút | | confirmed | TechCrunch; Bloomberg | |
| resume | Dự kiến mở lại rút tiền trong ~48h / "Sunday" | | reported | U.Today; AMBCrypto (Yi He) | Chưa có xác nhận đã mở lại |
| bnb | BNB giảm | −7.1% đến −8.2% (~$693–699) | reported | The Block; Cointelegraph | Lấy giá thật từ TradingView 1h |
| btc | BTC xuống dưới $77K, đáy ~$76,650 (thấp nhất 6 tuần) | | reported | The Block; CNBC; Bloomberg | TradingView 1h |
| eth | ETH giảm ~3–4% (~$2,200–2,240) | | reported | CNBC | TradingView 1h |
| liq | Thanh lý toàn thị trường | $1.49B, 86.8% lệnh long | reported | FinanceFeeds (CoinGlass) | Tìm nguồn thứ hai |
| assets | Binance giữ ~$144B tài sản trên nền tảng | | reported | DefiLlama (qua báo chí) | Ghi ngày của số liệu |
| ranking | Vụ hack crypto lớn nhất lịch sử | | reported | TRM; Al Jazeera; NBC | Các vụ so sánh (Bybit, Ronin, Poly Network, Mt. Gox…) phải tra nguồn ở G1 |

## Link

- https://www.trmlabs.com/resources/blog/north-korea-steals-usd-6-36-billion-from-binance-in-the-largest-hack-in-history
- https://www.washingtonpost.com/technology/2026/10/29/suspected-binance-hack-sets-off-scramble-lock-down-billions-crypto/
- https://techcrunch.com/2026/10/29/binance-pauses-withdrawals-as-hackers-suspected-of-stealing-billions-in-crypto/
- https://www.cnbc.com/2026/10/30/billions-in-crypto-frozen-in-binance-hack-heres-what-happens-next-.html
- https://www.cnbc.com/2026/10/30/bitcoin-ether-price-binance-security-scare-rattles-crypto-markets.html
- https://www.nbcnews.com/business/markets/binance-hack-tether-circle-stablecoins-rcna606445
- https://www.axios.com/2026/10/29/binance-cyberattack-crypto-heist
- https://www.coindesk.com/business/2026/10/29/potential-multi-billion-binance-hack-hitting-crypto-markets
- https://www.bloomberg.com/news/articles/2026-10-29/binance-founder-says-possible-hack-of-exchange-bitcoin-falls
- https://www.aljazeera.com/economy/2026/10/30/binance-says-2-54bn-in-crypto-funds-frozen-amid-potential-security-issue
- https://www.theblock.co/news/markets/2026-10-29-bitcoin-slides-below-77000-binance-hack-432183
- https://cointelegraph.com/markets/binance-hack-rattles-crypto-markets-bnb-bitcoin-slide
- https://financefeeds.com/bitcoin-falls-below-77000-as-binance-hack-triggers-1-5-billion-in-crypto-liquidations/
- https://u.today/binance-reveals-when-it-will-resume-withdrawals-after-historic-hack
- https://ambcrypto.com/binance-to-resume-withdrawals-within-48-hours-after-6-3b-hack/
- https://www.cryptotimes.io/2026/10/30/binance-hack-live-updates-the-6-3-billion-security-breach-in-hot-wallets/

---

## G0: đối chiếu ghi chú ChatGPT của người dùng (30/10/2026)

Ghi chú ChatGPT có dẫn Binance, Reuters, AP, CoinDesk, Fortune, VnExpress, TRM. Cột "Tra chéo cloud" là kết quả tìm kiếm
lần hai trên cloud, **chưa mở được trang gốc**. Mọi dòng vẫn phải được xác nhận ở G1 trên máy local.

### Khớp với bản nháp

- Quy mô **~$6.3B là "estimated impact"**, không phải thiệt hại ròng (AP thận trọng). → Video ghi "ESTIMATED IMPACT",
  không ghi "stolen $6.3B".
- **~3B đã phong tỏa** (Binance). $2.54B là con số Reuters đưa sớm hơn → dùng ~$3B, ghi rõ thời điểm.
- Tether ~**$1.57B**, Circle **>$800M**; nạp/rút tạm dừng; cam kết bù bằng SAFU + vốn công ty.
- Nguyên nhân DevOps laptop → service container = **giả thuyết sơ bộ** của Binance.
- TRM: ~$6.36B trên 10 chain, ~20 phút; quy kết TraderTraitor = **suspected**, chưa có xác nhận từ FBI/DOJ.

### Mới, cần đưa vào G1

| id | Khẳng định | Nguồn ChatGPT | Tra chéo cloud |
|---|---|---|---|
| no-key | Binance chưa tìm thấy bằng chứng private key bị lộ; đã thu hồi quyền ủy quyền của địa chỉ bị ảnh hưởng | Binance | chưa tìm lại được |
| eip7702 | Kẻ tấn công lợi dụng **EIP-7702**: ví Binance 14 bị ủy quyền thành "sweeper" tự chuyển tiền ra | CoinDesk | Có: CoinDesk (sweeper), Blockaid qua crypto.news/TechFlow: **50 authorization EIP-7702, 1 thành công** |
| eth-14 | 20:24 UTC: **167,464 ETH** rời Binance 14 | CoinDesk (Etherscan) | Blockaid qua crypto.news/drk.vc: 167,464 ETH + >1.6B USDT ở lượt sweep đầu |
| eth-16 | **28,005.6 ETH** rời Binance 16 | CoinDesk | chưa thấy |
| eth-fwd | ~15 phút sau: **195,460 ETH (~$442M)** chuyển tiếp sang địa chỉ thứ hai; không cộng vào tổng | CoinDesk | chưa thấy |
| por | Binance 14 thuộc nhóm ví Proof of Reserves; ~204,500 ETH bị chuyển đi; tỷ lệ dự trữ ETH **100% → ~94%** (ước tính trước bù đắp) | CoinDesk | Có bài CoinDesk "drained wallets backing customer assets" |
| arkham | Lượt đầu ~$2.53B / 64 token sang địa chỉ mới → ~$3.48B; Arkham: 55 địa chỉ ~$5.78B | VnExpress | **không tìm thấy** |
| ripple | Ripple phong tỏa **~$200M** | Reuters | Có (Yi He, qua Reuters/Bitcoin.com) |
| wlfi | World Liberty Financial ~**$29M** ($27M stablecoin + ~$2M token WLFI, qua BitGo) | Reuters | Có |
| custody | Binance giữ **$162.8B** tài sản lưu ký (báo cáo năm 2025); 335M người dùng; đây là tiền khách hàng, không phải vốn Binance | Reuters | Có (bản Reuters cũ hơn ghi ~$160B, theo báo cáo 2024) |
| defi | Một phần tài sản đi qua Uniswap, Aave (thế chấp rồi vay ETH) | Fortune, VnExpress | chưa thấy |
| stocks | Cổ phiếu Coinbase, Strategy bị bán | Reuters | chưa thấy |
| resume | Dự kiến mở lại rút tiền trong 48h | (Reuters/Binance) | Có, nhưng chưa xác nhận đã mở lại |
| report | Binance hứa công bố báo cáo kỹ thuật sau điều tra + Proof of Reserves cập nhật | Binance | chưa tìm lại được |

### Mâu thuẫn cần chốt ở G1

1. **Giờ bắt đầu:** TRM 20:05 UTC · CoinDesk/Etherscan 20:24 UTC (giao dịch Binance 14) · CryptoTimes ~20:20 UTC. Có thể
   20:05 là lúc bắt đầu toàn chiến dịch trên 10 chain, còn 20:24 là giao dịch ETH lớn nhất. Cần mở TRM + Etherscan để
   tách bạch hai mốc này.
2. **Giá thấp nhất / % giảm:** ChatGPT (Reuters, tại thời điểm đưa tin) ghi BTC −3% ~$76,368, ETH ~$2,178, BNB −5% ~$709.70.
   The Block / CNBC ghi BTC đáy ~$76,650, BNB −7,1% đến −8,2% (~$693–699). Các con số này khác nhau vì được đo ở thời điểm
   khác nhau. → **Video dùng nến 1h TradingView**, ghi rõ khung giờ; không chép % của báo.
3. **Tổng ETH:** ~204,500 ETH (CoinDesk/PoR) ≠ 167,464 + 28,005.6 = 195,469.6 ETH (gần bằng 195,460 ETH được chuyển tiếp).
   Cần đọc lại CoinDesk xem 204,500 tính gồm những ví nào.
4. **Tổng phong tỏa:** $2.54B (bản Reuters sớm) → ~$3B (Binance cập nhật). CryptoSlate ghi $2.6B riêng phần stablecoin.
   → Dùng con số mới nhất của Binance, ghi mốc thời gian.

### Khác biệt về cách dùng trong video

- Mục "Nếu đang giữ tiền trên Binance thì nên làm gì?" là lời khuyên tài chính → **không đưa vào video** (kênh ghi rõ
  "not financial advice"). Act 8 chỉ nêu những điều cần theo dõi (mở lại rút tiền, post-mortem, PoR mới, quy kết chính thức).
- Video dùng giờ UTC ("Oct 29, 20:24 UTC"). Giờ Việt Nam (rạng sáng 30/10) chỉ dùng cho tiêu đề/mô tả nếu cần.
- Phân biệt rõ ba con số: **$6.3B ảnh hưởng ước tính · ~$3B đã phong tỏa · ~$3.3B chưa rõ tình trạng** (không gọi là mất).

### Nguồn tra chéo bổ sung

- https://www.coindesk.com/business/2026/10/30/binance-hack-drained-wallets-backing-customer-assets-reserve-data-shows
- https://crypto.news/binance-hack-eip-7702-wallet-attack/
- https://drk.vc/news/binance-14-eip-7702-drain
- https://www.techflowpost.com/en-US/article/34990 (Blockaid)
- https://www.cryptoninjas.net/news/binance-5-5b-hack-exposed-50-eip-7702-nonces-opened-one-hot-wallet-in-minutes/
- https://news.bitcoin.com/security/ripple-world-liberty-freeze-binance-hacker-funds/
- https://cryptoslate.com/trumps-crypto-firm-joins-tether-circle-and-ripple-in-2-6-billion-stablecoin-freeze-as-binance-hack-outflows-near-6-billion
- https://www.france24.com/en/technology/20261030-binance-security-breach-has-6-3-billion-impact-in-potential-record-crypto-heist
- https://ca.finance.yahoo.com/news/binance-says-2-54-billion-005100392.html
- https://finance.yahoo.com/markets/crypto/articles/tether-circle-freeze-2-38-222607515.html
