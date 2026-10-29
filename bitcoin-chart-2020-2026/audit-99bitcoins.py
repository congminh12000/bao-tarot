#!/usr/bin/env python3
"""Verify source-event coverage for every configured coin; --live checks for upstream changes."""
import argparse, csv, json, re, subprocess, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent
AUDIT = ROOT / 'data/source-audits/99bitcoins'

def read_json(path):
    return json.loads(path.read_text())

def validate(live=False):
    snapshot = read_json(AUDIT / 'snapshot.json')
    events = snapshot['events']
    ids = [e['id'] for e in events]
    errors = []
    if len(ids) != snapshot['count'] or len(set(ids)) != len(ids):
        errors.append('Snapshot count or unique IDs mismatch')
    source = {e['id']: e for e in events}
    if live:
        body = subprocess.check_output(['curl', '-fLsS', '--max-time', '60', snapshot['sourceUrl']], text=True)
        import html
        found = re.findall(r'<h3 id="([^"]+)">(.*?)</h3>\s*<button[^>]*data-timestamp="([^"]+)"[^>]*data-event-order="(\d+)"', body, re.S)
        latest = {}
        for slug, title, date, sid in found:
            title = re.sub(r'\s+', ' ', html.unescape(re.sub('<[^>]+>', '', title))).strip()
            title = re.sub(r'\s+-\s+[A-Z][a-z]+ \d{1,2}, \d{4}$', '', title)
            if int(sid) in latest:
                errors.append(f'Duplicate live source ID {sid}')
            latest[int(sid)] = (date[:10], title, snapshot['sourceUrl'] + '#' + slug)
        if not latest or len(found) != body.count('data-event-order='):
            errors.append('Live extraction incomplete or source layout changed; do not claim complete')
        expected = {sid: (e['date'], e['title'], e['url']) for sid, e in source.items()}
        if latest != expected:
            errors.append(f'Live source changed: new={sorted(latest.keys()-source.keys())}, removed={sorted(source.keys()-latest.keys())}; review changed titles/dates/URLs too')
    configs = sorted((ROOT / 'coins').glob('*/coin.json'))
    if not configs:
        errors.append('No coins found')
    for config_path in configs:
        coin = read_json(config_path)
        if coin.get('assetClass', 'crypto') != 'crypto':
            print(f"{coin['symbol']}: not applicable to 99Bitcoins (assetClass={coin['assetClass']}); use equity source/quarter audit")
            continue
        directory = ROOT / coin.get('dataDir', str(config_path.parent.relative_to(ROOT) / 'data'))
        coverage_path = directory / '99bitcoins-coverage.json'
        if not coverage_path.exists():
            errors.append(f"{coin['symbol']}: no source coverage file")
            continue
        coverage = read_json(coverage_path)
        event_lines = (directory/'events.csv').read_text().splitlines()
        has_remove = any(re.fullmatch(r'#\s*date,kind,hit,tag,text,remove\s*', line) for line in event_lines)
        rows = list(csv.reader(line for line in event_lines if line.strip() and not line.startswith('#')))
        if has_remove and any(len(row) != 6 or row[5].strip().lower() not in ['true', 'false'] for row in rows):
            errors.append(f"{coin['symbol']}: remove must be true or false on every event row")
        # Deliberately include remove=true: video exclusion never deletes source coverage.
        targets = {(r[0], r[4], int(r[2])) for r in rows}
        entries = coverage['entries']
        cids = [e['sourceId'] for e in entries]
        if coverage.get('coin') != coin['symbol'] or coverage.get('sourceCount') != len(source):
            errors.append(f"{coin['symbol']}: stale or mismatched coverage metadata")
        if coverage.get('processed') != len(entries) or coverage.get('unreviewed') != 0:
            errors.append(f"{coin['symbol']}: unreviewed or inconsistent counts")
        if len(set(cids)) != len(cids) or set(cids) != set(source):
            errors.append(f"{coin['symbol']}: missing or duplicate source IDs")
        for entry in entries:
            sid = entry['sourceId']
            if sid not in source or entry.get('sourceDate') != source[sid]['date']:
                errors.append(f"{coin['symbol']} #{sid}: source date mismatch")
            if not entry.get('reason') or entry.get('status') not in ['stored', 'outside_coin_history', 'not_applicable']:
                errors.append(f"{coin['symbol']} #{sid}: missing disposition/reason")
            if entry.get('status') == 'stored':
                if not entry.get('targets'):
                    errors.append(f"{coin['symbol']} #{sid}: stored without target")
                for target in entry.get('targets', []):
                    if (target['date'], target['text'], target['hit']) not in targets:
                        errors.append(f"{coin['symbol']} #{sid}: target event missing/changed")
        print(f"{coin['symbol']}: {len(entries)}/{len(source)} source IDs reviewed; {len(rows)} local historical rows")
    if errors:
        for error in errors:
            print('FAIL:', error, file=sys.stderr)
        return 1
    print('PASS: source coverage reconciled' + (' with current live table' if live else ' with saved snapshot') + '; this does not certify all altcoin/world history or source factual accuracy')
    return 0

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--live', action='store_true')
    args = parser.parse_args()
    try:
        sys.exit(validate(args.live))
    except (OSError, ValueError, KeyError, subprocess.SubprocessError) as exc:
        print('FAIL:', exc, file=sys.stderr)
        sys.exit(1)
