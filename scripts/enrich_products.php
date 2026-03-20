<?php

declare(strict_types=1);

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

const DEFAULT_SOCKET = '/Users/minhphan/Library/Application Support/Local/run/rcEnlcFkJ/mysql/mysqld.sock';

function parseArgs(array $argv): array
{
    $args = [
        'apply' => false,
        'socket' => DEFAULT_SOCKET,
        'ids' => [],
    ];

    foreach ($argv as $arg) {
        if ($arg === '--apply') {
            $args['apply'] = true;
            continue;
        }

        if (str_starts_with($arg, '--socket=')) {
            $args['socket'] = substr($arg, 9);
            continue;
        }

        if (str_starts_with($arg, '--ids=')) {
            $ids = array_filter(array_map('trim', explode(',', substr($arg, 6))));
            $args['ids'] = array_map('intval', $ids);
        }
    }

    return $args;
}

function connectDatabase(string $socket): mysqli
{
    $mysqli = mysqli_init();
    $mysqli->real_connect(null, 'root', 'root', 'local', null, $socket);
    $mysqli->set_charset('utf8mb4');

    return $mysqli;
}

function normalizeText(string $value): string
{
    $value = html_entity_decode($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $value = str_replace(["\r\n", "\r"], "\n", $value);
    $value = preg_replace('/[ \t]+/u', ' ', $value) ?? $value;
    $value = preg_replace('/\s*\n\s*/u', "\n", $value) ?? $value;
    $value = preg_replace('/ {2,}/u', ' ', $value) ?? $value;

    return trim($value);
}

function inferDeckKind(string $title): string
{
    $lower = mb_strtolower($title);

    if (str_contains($lower, 'affirmation')) {
        return 'affirmation';
    }

    if (str_contains($lower, 'lenormand')) {
        return 'lenormand';
    }

    if (str_contains($lower, 'oracle')) {
        return 'oracle';
    }

    if (str_contains($lower, 'tarot')) {
        return 'tarot';
    }

    return 'deck';
}

function parseProductFacts(string $content): array
{
    $content = normalizeText($content);

    $patterns = [
        'display_name' => '/Tên (?:bộ bài|sản phẩm):\s*(.+?)(?=\s+Nhà sản xuất:|\s+Tác giả:|\s+Bao gồm:|\s+Kích thước tổng thể:|\s+Kích thước bên trong:|\s+Phù hợp để đựng cỡ lá bài:|\s+Sức chứa tối đa:|\s+ISBN:|$)/u',
        'publisher' => '/Nhà sản xuất:\s*(.+?)(?=\s+Xuất xứ:|\s+Tác giả:|\s+Bao gồm:|\s+ISBN:|$)/u',
        'origin' => '/Xuất xứ:\s*(.+?)(?=\s+Bao gồm:|\s+ISBN:|$)/u',
        'authors' => '/Tác giả:\s*(.+?)(?=\s+Bao gồm:|\s+ISBN:|$)/u',
        'includes' => '/Bao gồm:\s*(.+?)(?=\s+ISBN:|$)/u',
        'isbn' => '/ISBN:\s*([0-9Xx\-]+)/u',
        'outer_size' => '/Kích thước tổng thể:\s*(.+?)(?=\s+Kích thước bên trong:|\s+Phù hợp để đựng cỡ lá bài:|\s+Sức chứa tối đa:|$)/u',
        'inner_size' => '/Kích thước bên trong:\s*(.+?)(?=\s+Phù hợp để đựng cỡ lá bài:|\s+Sức chứa tối đa:|$)/u',
        'fit_size' => '/Phù hợp để đựng cỡ lá bài:\s*(.+?)(?=\s+Sức chứa tối đa:|$)/u',
        'capacity' => '/Sức chứa tối đa:\s*(.+)$/u',
    ];

    $facts = [];

    foreach ($patterns as $key => $pattern) {
        if (preg_match($pattern, $content, $matches) === 1) {
            $facts[$key] = trim($matches[1]);
        }
    }

    return $facts;
}

function buildNormalizedTitle(array $product, array $facts): string
{
    $title = normalizeText($product['post_title']);
    $slug = $product['post_name'];

    if ($product['id'] === 2153) {
        return 'Bao Da Đựng Bài Tarot 7 x 12 cm';
    }

    if (str_contains($slug, 'mini-edition')) {
        $title = str_replace('Mini edition', 'Mini Edition', $title);
    }

    if (str_contains($slug, 'pocket-edition')) {
        $title = str_replace('Pocket Edition', 'Pocket Edition', $title);
    }

    return $title;
}

function escapeHtml(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function productCategory(array $product): string
{
    $title = normalizeText($product['post_title']);

    if (str_contains($title, 'Hộp Gỗ')) {
        return 'wooden_box';
    }

    if (str_contains($title, 'Bao Da')) {
        return 'pouch';
    }

    return 'deck';
}

function productTypeLabel(string $kind): string
{
    return match ($kind) {
        'tarot' => 'bộ bài Tarot',
        'oracle' => 'bộ bài Oracle',
        'lenormand' => 'bộ bài Lenormand',
        'affirmation' => 'bộ thẻ Affirmation',
        default => 'bộ bài',
    };
}

function buildDeckExcerpt(string $title, array $facts, string $kind): string
{
    $typeLabel = productTypeLabel($kind);
    $parts = [];

    $parts[] = $title . ' là ' . $typeLabel . ' dành cho người yêu thích trải bài, sưu tầm hoặc tìm kiếm một lựa chọn chỉn chu để đồng hành lâu dài.';

    if (!empty($facts['includes'])) {
        $parts[] = 'Sản phẩm bao gồm ' . mb_strtolower($facts['includes']) . '.';
    }

    if (!empty($facts['publisher'])) {
        $parts[] = 'Phát hành bởi ' . $facts['publisher'] . '.';
    }

    return trim(implode(' ', $parts));
}

function buildAccessoryExcerpt(string $title, array $facts): string
{
    if (str_contains($title, 'Bao Da')) {
        $segments = [
            $title . ' là phụ kiện bảo quản deck gọn gàng, hạn chế trầy xước và thuận tiện khi mang theo.',
        ];

        if (!empty($facts['fit_size'])) {
            $segments[] = 'Phù hợp với cỡ lá bài ' . $facts['fit_size'] . '.';
        }

        if (!empty($facts['capacity'])) {
            $segments[] = $facts['capacity'] . '.';
        }

        return trim(implode(' ', $segments));
    }

    $segments = [
        $title . ' là hộp gỗ đựng bài dành cho người chơi Tarot muốn bảo quản deck gọn gàng, chắc tay và có tính thẩm mỹ khi trưng bày.',
    ];

    if (!empty($facts['includes'])) {
        $segments[] = str_replace('Hộp kích cỡ', 'Kích thước hộp', $facts['includes']) . '.';
    }

    if (!empty($facts['origin'])) {
        $segments[] = 'Xuất xứ ' . $facts['origin'] . '.';
    }

    return trim(implode(' ', $segments));
}

function renderListItems(array $items): string
{
    $html = '';

    foreach ($items as $item) {
        if ($item === null || $item === '') {
            continue;
        }

        $html .= '<li>' . escapeHtml($item) . '</li>';
    }

    return $html;
}

function buildDeckContent(string $title, array $facts, string $kind): string
{
    $typeLabel = productTypeLabel($kind);

    $highlights = [
        'Phù hợp cho người yêu thích ' . mb_strtolower($typeLabel) . ', sưu tầm hoặc làm quà tặng.',
        !empty($facts['includes']) ? 'Trọn bộ gồm ' . mb_strtolower($facts['includes']) . '.' : null,
        !empty($facts['publisher']) ? 'Ấn phẩm đến từ ' . $facts['publisher'] . '.' : null,
    ];

    $details = [
        'Tên sản phẩm: ' . $title,
        !empty($facts['publisher']) ? 'Nhà sản xuất: ' . $facts['publisher'] : null,
        !empty($facts['authors']) ? 'Tác giả: ' . $facts['authors'] : null,
        !empty($facts['includes']) ? 'Bao gồm: ' . $facts['includes'] : null,
        !empty($facts['isbn']) ? 'SKU / ISBN tham chiếu: ' . $facts['isbn'] : null,
    ];

    $audience = match ($kind) {
        'tarot' => 'Phù hợp với người mới bắt đầu lẫn người đọc Tarot đã có kinh nghiệm, đặc biệt nếu bạn muốn bổ sung một deck có nhận diện riêng trong bộ sưu tập.',
        'oracle' => 'Phù hợp với người yêu thích thông điệp trực quan, dùng để tự chiêm nghiệm mỗi ngày hoặc kết hợp cùng Tarot trong các trải bài mở rộng.',
        'lenormand' => 'Phù hợp với người đã quen hệ Lenormand hoặc muốn bổ sung một bộ bài gọn nhẹ để luyện đọc câu hỏi thực tế.',
        'affirmation' => 'Phù hợp cho việc rút thẻ mỗi ngày, journaling, thiền định hoặc làm quà tặng tinh thần.',
        default => 'Phù hợp với người yêu thích bài chiêm tinh, sưu tầm hoặc tìm kiếm một bộ bài có thể sử dụng lâu dài.',
    };

    $html = [];
    $html[] = '<p><strong>' . escapeHtml($title) . '</strong> là ' . escapeHtml($typeLabel) . ' phù hợp cho nhu cầu sử dụng hằng ngày, sưu tầm hoặc làm quà tặng cho người yêu thích bài chiêm tinh. Nội dung dưới đây được chuẩn hóa để bạn dễ theo dõi thông tin quan trọng trước khi lựa chọn.</p>';
    $html[] = '<h3>Điểm nổi bật</h3>';
    $html[] = '<ul>' . renderListItems($highlights) . '</ul>';
    $html[] = '<h3>Thông tin sản phẩm</h3>';
    $html[] = '<ul>' . renderListItems($details) . '</ul>';
    $html[] = '<h3>Phù hợp với ai</h3>';
    $html[] = '<p>' . escapeHtml($audience) . '</p>';
    $html[] = '<h3>Lưu ý khi sử dụng</h3>';
    $html[] = '<p>Bảo quản bộ bài ở nơi khô ráo, tránh ẩm và ánh nắng trực tiếp. Nếu bạn thường xuyên mang deck theo bên mình, nên kết hợp thêm túi hoặc hộp bảo quản để giữ bộ bài bền đẹp lâu hơn.</p>';

    return implode("\n", $html);
}

function buildAccessoryContent(string $title, array $facts): string
{
    if (str_contains($title, 'Bao Da')) {
        $highlights = [
            'Thiết kế gọn, dễ mang theo khi di chuyển hoặc đi workshop.',
            !empty($facts['fit_size']) ? 'Phù hợp với cỡ lá bài ' . $facts['fit_size'] . '.' : null,
            !empty($facts['capacity']) ? $facts['capacity'] . '.' : null,
        ];

        $details = [
            'Tên sản phẩm: ' . $title,
            !empty($facts['outer_size']) ? 'Kích thước tổng thể: ' . $facts['outer_size'] : null,
            !empty($facts['inner_size']) ? 'Kích thước bên trong: ' . $facts['inner_size'] : null,
            !empty($facts['fit_size']) ? 'Kích thước deck phù hợp: ' . $facts['fit_size'] : null,
            !empty($facts['capacity']) ? 'Sức chứa tối đa: ' . $facts['capacity'] : null,
        ];

        return implode("\n", [
            '<p><strong>' . escapeHtml($title) . '</strong> là phụ kiện dành cho người dùng Tarot muốn cất giữ deck gọn gàng, hạn chế cong góc và tiện mang theo mỗi ngày.</p>',
            '<h3>Điểm nổi bật</h3>',
            '<ul>' . renderListItems($highlights) . '</ul>',
            '<h3>Thông tin sản phẩm</h3>',
            '<ul>' . renderListItems($details) . '</ul>',
            '<h3>Gợi ý sử dụng</h3>',
            '<p>Sản phẩm phù hợp để đựng một deck tiêu chuẩn kèm booklet mỏng. Nếu bạn thường xuyên mang bài theo bên mình, đây là lựa chọn gọn và an toàn hơn so với để deck trần trong túi xách.</p>',
        ]);
    }

    $highlights = [
        'Thiết kế hộp gỗ cứng cáp, phù hợp để bảo quản và trưng bày deck.',
        'Hoạ tiết biểu tượng đặc trưng giúp tăng tính thẩm mỹ cho góc đọc bài.',
        !empty($facts['origin']) ? 'Xuất xứ: ' . $facts['origin'] . '.' : null,
    ];

    $details = [
        'Tên sản phẩm: ' . $title,
        !empty($facts['publisher']) ? 'Nhà sản xuất: ' . $facts['publisher'] : null,
        !empty($facts['origin']) ? 'Xuất xứ: ' . $facts['origin'] : null,
        !empty($facts['includes']) ? str_replace('Hộp kích cỡ', 'Kích thước hộp', $facts['includes']) : null,
    ];

    return implode("\n", [
        '<p><strong>' . escapeHtml($title) . '</strong> là mẫu hộp gỗ đựng bài phù hợp cho người chơi Tarot cần một giải pháp bảo quản chắc chắn, gọn gàng và có tính trang trí khi đặt trên bàn đọc bài hoặc kệ trưng bày.</p>',
        '<h3>Điểm nổi bật</h3>',
        '<ul>' . renderListItems($highlights) . '</ul>',
        '<h3>Thông tin sản phẩm</h3>',
        '<ul>' . renderListItems($details) . '</ul>',
        '<h3>Gợi ý sử dụng</h3>',
        '<p>Hộp thích hợp để đựng deck Tarot, Oracle hoặc các phụ kiện nhỏ như khăn trải bài, crystal mini hay booklet mỏng. Nên bảo quản ở nơi khô ráo để bề mặt hộp luôn bền đẹp.</p>',
    ]);
}

function buildContent(array $product, array $facts): array
{
    $title = buildNormalizedTitle($product, $facts);
    $category = productCategory($product);

    if ($category === 'deck') {
        $kind = inferDeckKind($title);

        return [
            'title' => $title,
            'excerpt' => buildDeckExcerpt($title, $facts, $kind),
            'content' => buildDeckContent($title, $facts, $kind),
        ];
    }

    return [
        'title' => $title,
        'excerpt' => buildAccessoryExcerpt($title, $facts),
        'content' => buildAccessoryContent($title, $facts),
    ];
}

function fetchProducts(mysqli $mysqli, array $ids): array
{
    $where = "WHERE p.post_type = 'product' AND p.post_status = 'publish'";

    if ($ids !== []) {
        $safeIds = implode(',', array_map('intval', $ids));
        $where .= " AND p.ID IN ($safeIds)";
    }

    $sql = <<<SQL
SELECT
    p.ID,
    p.post_title,
    p.post_name,
    p.post_content,
    p.post_excerpt
FROM wp_posts p
$where
ORDER BY p.ID ASC
SQL;

    $rows = [];
    $result = $mysqli->query($sql);

    while ($row = $result->fetch_assoc()) {
        $rows[] = [
            'id' => (int) $row['ID'],
            'post_title' => (string) $row['post_title'],
            'post_name' => (string) $row['post_name'],
            'post_content' => (string) $row['post_content'],
            'post_excerpt' => (string) $row['post_excerpt'],
        ];
    }

    return $rows;
}

function previewProducts(array $products): void
{
    foreach ($products as $product) {
        $facts = parseProductFacts($product['post_content']);
        $built = buildContent($product, $facts);

        echo 'ID: ' . $product['id'] . PHP_EOL;
        echo 'OLD TITLE: ' . normalizeText($product['post_title']) . PHP_EOL;
        echo 'NEW TITLE: ' . $built['title'] . PHP_EOL;
        echo 'EXCERPT: ' . $built['excerpt'] . PHP_EOL;
        echo str_repeat('-', 80) . PHP_EOL;
    }
}

function applyProducts(mysqli $mysqli, array $products): void
{
    $stmt = $mysqli->prepare(
        'UPDATE wp_posts SET post_title = ?, post_excerpt = ?, post_content = ?, post_modified = NOW(), post_modified_gmt = UTC_TIMESTAMP() WHERE ID = ?'
    );

    foreach ($products as $product) {
        $facts = parseProductFacts($product['post_content']);
        $built = buildContent($product, $facts);
        $id = $product['id'];

        $stmt->bind_param('sssi', $built['title'], $built['excerpt'], $built['content'], $id);
        $stmt->execute();
    }
}

if (isset($_SERVER['SCRIPT_FILENAME']) && realpath((string) $_SERVER['SCRIPT_FILENAME']) === __FILE__) {
    $args = parseArgs(array_slice($argv, 1));
    $mysqli = connectDatabase($args['socket']);
    $products = fetchProducts($mysqli, $args['ids']);

    if ($args['apply']) {
        applyProducts($mysqli, $products);
        echo 'Updated ' . count($products) . " products.\n";
        exit(0);
    }

    previewProducts($products);
}
