// Run ONLY after the user approves the concrete event/caption review. No rendering here.
const fs = require('fs'), path = require('path');
const [folder, hash] = process.argv.slice(2);
if (!folder || !hash) throw new Error('usage: node line/approve.js <part-workspace> <manifest-contentHash> (only after user approval)');
const dir = path.resolve(folder), part = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
if (hash !== part.contentHash) throw new Error('Manifest changed: review the current manifest before approval');
fs.writeFileSync(path.join(dir, 'render-approval.json'), JSON.stringify({ contentHash: hash, approved: true }, null, 2) + '\n');
console.log('Recorded approval for ' + hash + '. Regenerating the workspace revokes approval.');
