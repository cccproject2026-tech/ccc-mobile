#!/usr/bin/env node
/**
 * Detects UTF-16 (and UTF-8 BOM) in source files and rewrites them as UTF-8.
 * Metro/Babel expect UTF-8; PowerShell Set-Content -Encoding Unicode writes UTF-16 LE.
 *
 * Usage:
 *   node scripts/fix-encoding.js          # fix all bad files under project root
 *   node scripts/fix-encoding.js --check  # exit 1 if any bad file (no writes)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CHECK_ONLY = process.argv.includes('--check');

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.expo',
  'dist',
  'build',
  'android',
  'ios',
]);

const EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.css',
  '.md',
]);

function detectEncoding(buffer) {
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    return 'utf16le';
  }
  if (buffer.length >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff) {
    return 'utf16be';
  }
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    return 'utf8-bom';
  }
  if (looksLikeUtf16LeWithoutBom(buffer)) {
    return 'utf16le';
  }
  return 'utf8';
}

/** UTF-16 LE text often has 0x00 on odd indices for ASCII-heavy files. */
function looksLikeUtf16LeWithoutBom(buffer) {
  if (buffer.length < 8 || buffer.length % 2 !== 0) {
    return false;
  }
  let nullAtOdd = 0;
  let asciiPairs = 0;
  const sample = Math.min(buffer.length, 512);
  for (let i = 0; i < sample - 1; i += 2) {
    const lo = buffer[i];
    const hi = buffer[i + 1];
    if (hi === 0 && lo >= 0x09 && lo <= 0x7e) {
      nullAtOdd += 1;
      asciiPairs += 1;
    }
  }
  return asciiPairs >= 4 && nullAtOdd / (sample / 2) > 0.7;
}

function decodeBuffer(buffer, encoding) {
  switch (encoding) {
    case 'utf16le':
      return buffer.toString('utf16le');
    case 'utf16be': {
      const swapped = Buffer.alloc(buffer.length);
      for (let i = 0; i + 1 < buffer.length; i += 2) {
        swapped[i] = buffer[i + 1];
        swapped[i + 1] = buffer[i];
      }
      return swapped.toString('utf16le');
    }
    case 'utf8-bom':
      return buffer.slice(3).toString('utf8');
    default:
      return buffer.toString('utf8');
  }
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

function relative(file) {
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function main() {
  const targets = walk(ROOT);
  const problems = [];

  for (const file of targets) {
    const buffer = fs.readFileSync(file);
    const encoding = detectEncoding(buffer);
    if (encoding === 'utf8') continue;

    problems.push({ file, encoding });
    if (!CHECK_ONLY) {
      const text = decodeBuffer(buffer, encoding);
      fs.writeFileSync(file, text, { encoding: 'utf8' });
    }
  }

  if (problems.length === 0) {
    console.log('Encoding OK: all scanned files are UTF-8.');
    return;
  }

  for (const { file, encoding } of problems) {
    const action = CHECK_ONLY ? 'INVALID' : 'FIXED';
    console.log(`${action} ${relative(file)} (${encoding} -> utf8)`);
  }

  if (CHECK_ONLY) {
    console.error(
      `\n${problems.length} file(s) are not UTF-8. Run: npm run fix-encoding`,
    );
    process.exit(1);
  }

  console.log(`\nRe-encoded ${problems.length} file(s) to UTF-8.`);
}

main();
