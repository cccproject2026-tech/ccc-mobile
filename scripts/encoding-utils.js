/**
 * Shared UTF-8 enforcement for Metro and npm scripts.
 * Windows tools (PowerShell Unicode, some editors) save TS/JS as UTF-16 LE;
 * Babel then fails with "Unexpected character" at line 1.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.expo',
  'dist',
  'build',
  'android',
  'ios',
]);

const SOURCE_EXTENSIONS = new Set([
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
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xef &&
    buffer[1] === 0xbb &&
    buffer[2] === 0xbf
  ) {
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

function isScannableSourceFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!SOURCE_EXTENSIONS.has(ext)) return false;
  const parts = filePath.split(path.sep);
  return !parts.some((p) => SKIP_DIRS.has(p));
}

function relativeFromRoot(file) {
  return path.relative(ROOT, file).split(path.sep).join('/');
}

/**
 * Read a source file as UTF-8. If mis-encoded, rewrite the file on disk.
 * @returns {string|null} UTF-8 text when fixed or already UTF-8; null if skipped.
 */
function readUtf8SourceFile(filePath, { write = true, log = true } = {}) {
  if (!filePath || !isScannableSourceFile(filePath)) {
    return null;
  }

  let buffer;
  try {
    buffer = fs.readFileSync(filePath);
  } catch {
    return null;
  }

  const encoding = detectEncoding(buffer);
  if (encoding === 'utf8') {
    return buffer.toString('utf8');
  }

  const text = decodeBuffer(buffer, encoding);
  if (write) {
    fs.writeFileSync(filePath, text, { encoding: 'utf8' });
    if (log) {
      console.warn(
        `[encoding] ${relativeFromRoot(filePath)} (${encoding} -> utf8)`,
      );
    }
  }
  return text;
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

/**
 * Scan the project and re-encode mis-encoded files to UTF-8.
 * @returns {{ fixed: Array<{file: string, encoding: string}>, ok: boolean }}
 */
function fixAllUnderRoot({ checkOnly = false, log = true } = {}) {
  const targets = walk(ROOT);
  const problems = [];

  for (const file of targets) {
    const buffer = fs.readFileSync(file);
    const encoding = detectEncoding(buffer);
    if (encoding === 'utf8') continue;

    problems.push({ file, encoding });
    if (!checkOnly) {
      const text = decodeBuffer(buffer, encoding);
      fs.writeFileSync(file, text, { encoding: 'utf8' });
      if (log) {
        console.log(`FIXED ${relativeFromRoot(file)} (${encoding} -> utf8)`);
      }
    }
  }

  return { fixed: problems, ok: problems.length === 0 };
}

module.exports = {
  ROOT,
  SOURCE_EXTENSIONS,
  detectEncoding,
  decodeBuffer,
  isScannableSourceFile,
  readUtf8SourceFile,
  fixAllUnderRoot,
  relativeFromRoot,
};
