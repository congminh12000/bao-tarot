// Generate a concrete, non-rendered review. Does not grant approval or change selections.
const fs = require('fs'), path = require('path');
const C = require('./coin'), E = require('./equity');
if (C.assetClass !== 'equity') throw new Error('Select an equity with COIN');
const read = (f) => JSON.parse(fs.readFileSync(path.join(C.dataDir, f)));
const events = require('./event-csv').readEvents(path.join(C.dataDir, 'events.csv'));
const details = read('event-details.json'), audit = read('price-audit.json'), quarters = read('quarter-coverage.json');
const sessions = E.readSessions(C.dataDir), review = E.reviewState(C.dataDir);
const deliveryCount = (status) => quarters.filter((q) => q.deliveries.status === status).length;
const inventory = read('source-inventory.json');
const esc = (s) => String(s || '').replaceAll('|', '\\|').replaceAll('\n', ' ');
const links = (d) => d.sources.map((s, i) => `[${i + 1}: ${esc(s.source)}${s.checked ? '' : ' (context only)'}](${s.url})`).join(' · ');
const kept = events.filter((e) => !e.remove), removed = events.filter((e) => e.remove);
const table = (rows) => ['| Ngày công bố | Phiên gắn nhãn | Thời điểm | Nội dung gốc | Mức | remove | Lý do / lưu ý | Nguồn |',
  '|---|---|---|---|---:|---|---|---|', ...rows.map((e) => {
    const d = details[`${e.date}|${e.text}`], mapped = E.anchorEvent(e, d, sessions);
    return `| ${e.date} | ${e.remove ? '—' : mapped.anchorDate || 'Pending session'} | ${mapped.marketTiming} | ${esc(e.text)} | ${e.hit} | ${e.remove} | ${esc(d.reason)} | ${links(d)} |`;
  })].join('\n');
const content = [`# ${C.name} — danh sách sự kiện ${review.status === 'approved' ? 'đã duyệt cho preview' : 'chờ duyệt'}`, '',
  `Trạng thái: **${review.status}**. Phạm vi phê duyệt được lưu trong review-state.json. Duyệt kế hoạch không thay cho duyệt danh sách cụ thể; sửa dữ liệu phải duyệt lại.`, '',
  `Giá: **${audit.range.join(' → ')}**, ${audit.candles} phiên TradingView split-adjusted. Lưu ${events.length} sự kiện nghiên cứu; giữ **${kept.length}** (${kept.filter(e=>e.hit===0).length} mức 0, ${kept.filter(e=>e.hit===1).length} mức 1, ${kept.filter(e=>e.hit===2).length} mức 2), remove=true **${removed.length}**.`, '',
  `Giữ đủ ${quarters.length} kỳ earnings; ${deliveryCount('separate_release_verified')} kỳ có bản giao xe riêng, ${deliveryCount('embedded_in_earnings')} kỳ gộp trong earnings; ${deliveryCount('financial_report_context_only')} kỳ chỉ có ngữ cảnh báo cáo tài chính, chưa xác minh được chuỗi giao xe riêng thống nhất. Không dựng thêm số liệu.`, '',
  'Mức 1: báo cáo quý, hoạt động kinh doanh và cột mốc quan trọng. Mức 2: bước ngoặt lớn về sản phẩm, pháp lý, chiến lược hoặc thị trường. Mức 0 thường được remove vì nhỏ/lặp/ngoài phạm vi; các mục người dùng chỉ định bật lại giữ nguyên mức 0 và hiện nhãn nhỏ, không SFX/hiệu ứng. Không áp dụng yêu cầu lấy 99Bitcoins cho cổ phiếu.', '',
  'Nguồn được dẫn từng dòng. Hai tài liệu Tesla/SEC vẫn là thông tin từ cùng doanh nghiệp, không được gọi là hai xác nhận báo chí độc lập. “context only” là nguồn không đọc trực tiếp được, không tính vào tối thiểu hai tài liệu đã kiểm tra. unknown nghĩa là chưa xác minh được giờ công bố; ngày được giữ, không bịa giờ.', '',
  `Giá có ${audit.comparison['differencesOver0.5Percent'].length} trường OHLC trên ${new Set(audit.comparison['differencesOver0.5Percent'].map((r) => r.date)).size} phiên lệch hơn 0,5% so với Yahoo; giữ nguyên TradingView và công khai trong [price-audit.json](data/price-audit.json). Chưa giải quyết được bằng nguồn thứ ba. Không cam kết mọi sự kiện trong lịch sử ${C.name} đã được bao quát; đã đối chiếu toàn bộ ${inventory.length} mục kho IR hiện tải được và tuyển thêm nguồn ngoài IR.`, '',
  '[Danh sách quý](quarter-coverage.md) · [Nguồn và giới hạn](SOURCES.md) · [CSV toàn bộ](data/events.csv) · [Chi tiết và lý do](data/event-details.json)', '',
  'Các mốc ATH/CYCLE LOW do giá sinh riêng, không được tính trong số sự kiện nghiên cứu bên trên. Xem README; CYCLE LOW không phải ATL.', '',
  '## Sự kiện giữ lại', '', table(kept), '',
  '## Nghiên cứu đã loại khỏi video', '', '<details><summary>Mở toàn bộ danh sách remove=true</summary>', '', table(removed), '', '</details>', '',
  '## Phiên bản duyệt', '', `SHA-256 của events + citations + details: \`${review.eventHash}\`. Bất kỳ sửa đổi nào vào ba file này hủy hiệu lực phê duyệt cũ; phải gửi lại danh sách thay đổi trước khi render.`, ''].join('\n');
fs.writeFileSync(path.join(C.dir, 'event-review.md'), content);
fs.writeFileSync(path.join(C.dir, 'quarter-coverage.md'), [`# Kiểm tra báo cáo quý ${C.name}`, '',
  'Ngày earnings là ngày công bố, không phải ngày nộp 10-Q/10-K. Không coi các quý đầu có dữ liệu giao xe đồng nhất.', '',
  '| Quý | Earnings | Delivery reporting | Ngày / ghi chú |', '|---|---|---|---|', ...quarters.map((q) =>
    `| ${q.quarter} | ${q.earnings.date}: ${esc(q.earnings.event)} | ${q.deliveries.status} | ${esc(q.deliveries.date || q.deliveries.note)} |`), ''].join('\n'));
console.log(`${C.symbol}: review written; ${kept.length} retained, ${removed.length} removed; ${review.status}`);
