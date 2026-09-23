/**
 * Reuse the system-installed Google Chrome instead of downloading a bundled
 * Chromium. The committed PDFs are produced by Chrome's Skia/PDF printer, so
 * matching the system browser keeps generated output consistent.
 */
module.exports = {
  skipDownload: true,
  executablePath:
    process.env.CHROME_PATH ||
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    '/usr/bin/google-chrome',
};
