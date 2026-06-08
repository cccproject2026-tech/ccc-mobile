/**
 * Removes development-only comments from source files.
 * Preserves JSDoc, tooling directives, and substantive business/API notes.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SELF = path.basename(__filename);

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.expo',
  'android',
  'ios',
  'dist',
  'build',
  'web-build',
  'patches',
]);

const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

const TOOLING_KEEP = [
  /eslint-disable/,
  /eslint-enable/,
  /@ts-ignore/,
  /@ts-expect-error/,
  /@ts-nocheck/,
  /@nativewind/,
  /prettier-ignore/,
  /istanbul ignore/,
  /webpackIgnore/,
  /@format\b/,
];

const BUSINESS_KEEP = [
  /\bbackend\b/i,
  /\bAPI\b/,
  /\bendpoint\b/i,
  /\binterceptor/i,
  /\blag(s|ging)?\b/i,
  /\bedge case/i,
  /\bworkaround\b/i,
  /\bsecurity\b/i,
  /\bauth(entication|orization)?\b/i,
  /\btoken\b/i,
  /\bMongoDB\b/i,
  /\bObjectId\b/i,
  /\bDO NOT\b/i,
  /\bNEVER\b/i,
  /\bWARNING\b/i,
  /\bIMPORTANT\b/i,
  /\bUTF-16\b/i,
  /\bencoding\b/i,
  /\bBabel\b/i,
  /\bMetro\b/i,
  /source of truth/i,
  /matches backend/i,
  /aligned with/i,
  /CCC-Web/i,
  /Query key/i,
  /Normalize/i,
  /OAuth/i,
  /refresh token/i,
  /401\b/,
  /403\b/,
];

function shouldKeepCommentText(text) {
  const t = text.trim();
  if (!t) return false;
  if (TOOLING_KEEP.some((p) => p.test(t))) return true;
  if (BUSINESS_KEEP.some((p) => p.test(t))) return true;
  if (/^@\w+/.test(t)) return true;
  if (/^(?:license|copyright)\b/i.test(t)) return true;
  if (t.length >= 55 && /[.?]/.test(t) && !/!\w/.test(t) && !/^(?:TODO|FIXME|HACK|DEBUG)\b/i.test(t)) {
    return true;
  }
  return false;
}

function isFilePathComment(text) {
  const t = text.trim();
  return /^[\w./()@-]+\.(tsx?|jsx?|mjs|cjs)$/.test(t);
}

function isDeadOrDevComment(text) {
  const t = text.trim();
  if (isFilePathComment(t)) return true;
  if (/^(?:TODO|FIXME|HACK|DEBUG|XXX)\b/i.test(t)) return true;
  if (/✅|OPTIMIZATION|\bconsole\.log\b/i.test(t)) return true;
  if (/^[-=*_]{3,}$/.test(t)) return true;
  if (/^(?:Section|Header|Footer|Step \d|---)/i.test(t)) return true;
  return false;
}

function looksLikeCommentedCode(text) {
  const t = text.trim();
  return /^(?:import |export |const |let |var |function |return |if |else |await |async |class |interface |type |switch |case |default:|throw |try |catch |for |while |\/\/|\}|\{|\)|\(|@\/|[\w.$'"`[\]]+\s*[=:(<])/.test(
    t,
  );
}

function shouldRemoveFullLineComment(commentBody) {
  if (isDeadOrDevComment(commentBody)) return true;
  if (looksLikeCommentedCode(commentBody)) return true;
  if (/<[A-Za-z/]/.test(commentBody.trim())) return true;
  if (shouldKeepCommentText(commentBody)) return false;
  if (commentBody.trim().length < 55) return true;
  return false;
}

function stripTrailingSlashComment(line) {
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let escaped = false;

  for (let i = 0; i < line.length - 1; i++) {
    const c = line[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (c === '\\') {
      escaped = true;
      continue;
    }
    if (!inDouble && !inTemplate && c === "'") {
      inSingle = !inSingle;
      continue;
    }
    if (!inSingle && !inTemplate && c === '"') {
      inDouble = !inDouble;
      continue;
    }
    if (!inSingle && !inDouble && c === '`') {
      inTemplate = !inTemplate;
      continue;
    }
    if (!inSingle && !inDouble && !inTemplate && c === '/' && line[i + 1] === '/') {
      const comment = line.slice(i + 2).trim();
      if (shouldKeepCommentText(comment)) return line;
      if (shouldRemoveFullLineComment(comment)) {
        return line.slice(0, i).replace(/\s+$/, '');
      }
      return line;
    }
  }
  return line;
}

function removeNonJSDocBlockComments(source) {
  let out = '';
  let i = 0;
  const len = source.length;

  while (i < len) {
    const ch = source[i];
    const next = source[i + 1];

    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch;
      out += ch;
      i++;
      let escaped = false;
      while (i < len) {
        const c = source[i];
        out += c;
        if (escaped) {
          escaped = false;
        } else if (c === '\\') {
          escaped = true;
        } else if (c === quote) {
          i++;
          break;
        }
        i++;
      }
      continue;
    }

    if (ch === '/' && next === '*') {
      const isJSDoc = source[i + 2] === '*';
      let j = i + 2;
      while (j < len - 1 && !(source[j] === '*' && source[j + 1] === '/')) j++;
      const block = source.slice(i, j + 2);
      if (isJSDoc || shouldKeepCommentText(block.replace(/^\/\*+|\*+\/$/g, '').replace(/^\s*\* ?/gm, ''))) {
        out += block;
      }
      i = j + 2;
      continue;
    }

    if (ch === '/' && next === '/') {
      let j = i + 2;
      while (j < len && source[j] !== '\n') j++;
      const commentBody = source.slice(i + 2, j);
      const lineStart = source.lastIndexOf('\n', i - 1) + 1;
      const before = source.slice(lineStart, i);
      const isFullLine = before.trim() === '';

      if (isFullLine) {
        if (!shouldRemoveFullLineComment(commentBody)) {
          out += source.slice(i, j);
        }
      } else {
        out += source.slice(i, j);
      }
      i = j;
      continue;
    }

    out += ch;
    i++;
  }

  return out;
}

function removeJsxComments(source) {
  return source.replace(/\{\/\*[\s\S]*?\*\/\}/g, (match) => {
    const inner = match.slice(3, -3).trim();
    if (shouldKeepCommentText(inner)) return match;
    return '';
  });
}

function collapseExtraBlankLines(source) {
  return source.replace(/\n{3,}/g, '\n\n');
}

function processSource(content, ext) {
  let result = removeNonJSDocBlockComments(content);
  if (ext === '.tsx' || ext === '.jsx') {
    result = removeJsxComments(result);
  }

  const lines = result.split('\n');
  const processed = lines.map((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') && !trimmed.startsWith('// @')) {
      const body = trimmed.slice(2);
      if (shouldRemoveFullLineComment(body)) return null;
      return line;
    }
    if (trimmed.includes('//') && !trimmed.startsWith('//')) {
      return stripTrailingSlashComment(line);
    }
    return line;
  });

  result = processed.filter((line) => line !== null).join('\n');
  result = collapseExtraBlankLines(result);
  if (content.endsWith('\n') && !result.endsWith('\n')) result += '\n';
  return result;
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === SELF) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(full, files);
      continue;
    }
    const ext = path.extname(entry.name);
    if (!EXTENSIONS.has(ext)) continue;
    files.push(full);
  }
  return files;
}

function main() {
  const files = walk(ROOT);
  const modified = [];

  for (const file of files) {
    const ext = path.extname(file);
    const original = fs.readFileSync(file, 'utf8');
    const updated = processSource(original, ext);
    if (updated !== original) {
      fs.writeFileSync(file, updated, 'utf8');
      modified.push(path.relative(ROOT, file));
    }
  }

  const summaryPath = path.join(ROOT, 'comment-cleanup-summary.json');
  fs.writeFileSync(
    summaryPath,
    JSON.stringify({ modifiedCount: modified.length, modified }, null, 2),
    'utf8',
  );
  console.log(`Done. Modified ${modified.length} file(s). Summary: ${summaryPath}`);
}

main();
