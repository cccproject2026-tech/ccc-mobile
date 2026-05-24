#!/usr/bin/env node
/**
 * Detects UTF-16 (and UTF-8 BOM) in source files and rewrites them as UTF-8.
 * Metro/Babel expect UTF-8; PowerShell Set-Content -Encoding Unicode writes UTF-16 LE.
 *
 * Also runs automatically from metro.config.js and scripts/metro-babel-transformer.js.
 *
 * Usage:
 *   node scripts/fix-encoding.js          # fix all bad files under project root
 *   node scripts/fix-encoding.js --check  # exit 1 if any bad file (no writes)
 */

const { fixAllUnderRoot } = require('./encoding-utils');

const CHECK_ONLY = process.argv.includes('--check');

function main() {
  const { fixed, ok } = fixAllUnderRoot({ checkOnly: CHECK_ONLY, log: !CHECK_ONLY });

  if (ok) {
    console.log('Encoding OK: all scanned files are UTF-8.');
    return;
  }

  if (CHECK_ONLY) {
    for (const { file, encoding } of fixed) {
      const rel = require('./encoding-utils').relativeFromRoot(file);
      console.log(`INVALID ${rel} (${encoding})`);
    }
    console.error(
      `\n${fixed.length} file(s) are not UTF-8. Run: npm run fix-encoding`,
    );
    process.exit(1);
  }

  console.log(`\nRe-encoded ${fixed.length} file(s) to UTF-8.`);
}

main();
