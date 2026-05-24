/**
 * Metro Babel transformer wrapper: re-reads each project source file as UTF-8
 * before Babel runs, so UTF-16 saves never break the bundler mid-session.
 */
const upstream = require('@expo/metro-config/babel-transformer');
const { readUtf8SourceFile } = require('./encoding-utils');

function transform(options) {
  const { filename, src } = options;

  if (filename) {
    const utf8 = readUtf8SourceFile(filename, { write: true, log: true });
    if (utf8 != null) {
      return upstream.transform({ ...options, src: utf8 });
    }
  }

  return upstream.transform(options);
}

module.exports = { transform };
