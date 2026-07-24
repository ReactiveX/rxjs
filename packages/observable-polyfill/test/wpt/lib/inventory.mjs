import path from 'node:path';

function toUrl(filePath) {
  return `/${filePath.split(path.sep).join('/')}`;
}

export function deriveTestUrls(filePaths) {
  const urls = [];

  for (const filePath of filePaths) {
    if (!filePath.startsWith('dom/observable/tentative/')) {
      continue;
    }

    if (filePath.endsWith('.any.js')) {
      const stem = filePath.slice(0, -'.any.js'.length);
      urls.push(toUrl(`${stem}.any.html`), toUrl(`${stem}.any.worker.html`));
      continue;
    }

    if (filePath.endsWith('.window.js')) {
      urls.push(toUrl(`${filePath.slice(0, -'.window.js'.length)}.window.html`));
      continue;
    }

    if (filePath.endsWith('.html')) {
      urls.push(toUrl(filePath));
    }
  }

  return urls.sort();
}
