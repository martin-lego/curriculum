#!/usr/bin/env node
import { readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mdToPdf } from 'md-to-pdf';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));

function resolveChromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return undefined;
}

async function findMarkdownCvs() {
  const explicit = process.argv.slice(2);
  if (explicit.length > 0) return explicit.map((p) => resolve(projectRoot, p));
  const entries = await readdir(projectRoot, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && extname(e.name).toLowerCase() === '.md')
    .map((e) => join(projectRoot, e.name))
    .sort();
}

async function main() {
  const executablePath = resolveChromePath();
  const launchOptions = {
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  };
  if (executablePath) launchOptions.executablePath = executablePath;

  const files = await findMarkdownCvs();
  if (files.length === 0) {
    console.log('No Markdown files found to build.');
    return;
  }

  console.log(`Using Chrome: ${executablePath ?? '(puppeteer default)'}`);
  for (const file of files) {
    const dest = join(projectRoot, `${basename(file, extname(file))}.pdf`);
    process.stdout.write(`Building ${basename(dest)} ... `);
    await mdToPdf(
      { path: file },
      {
        dest,
        launch_options: launchOptions,
        pdf_options: {
          format: 'A4',
          margin: { top: '18mm', bottom: '18mm', left: '18mm', right: '18mm' },
          printBackground: true,
        },
      },
    );
    console.log('done');
  }
  console.log(`\nBuilt ${files.length} PDF(s).`);
}

main().catch((err) => {
  console.error('\nPDF build failed:', err);
  process.exit(1);
});
