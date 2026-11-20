const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');

// A local fixture server, not the production Cloudflare redirect engine.
async function startSite(root = path.join(__dirname, '..')) {
  const server = http.createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const file = path.resolve(root, `.${pathname}`);
      if (!file.startsWith(`${root}${path.sep}`) && file !== root) {
        response.writeHead(403).end();
        return;
      }
      if (pathname.split('/').some(segment => segment.startsWith('.'))) {
        response.writeHead(403).end();
        return;
      }
      const stat = await fs.stat(file);
      const resolved = stat.isDirectory() ? path.join(file, 'index.html') : file;
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.ttf': 'font/ttf' };
      response.writeHead(200, { 'Content-Type': types[path.extname(resolved)] || 'text/plain' });
      response.end(await fs.readFile(resolved));
    } catch {
      response.writeHead(404).end('Not found');
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return { url: `http://127.0.0.1:${server.address().port}`, close: () => new Promise(resolve => server.close(resolve)) };
}

async function openSite(options = {}) {
  const site = await startSite(options.root);
  let browser;
  try {
    browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH });
  } catch (error) {
    await site.close();
    throw error;
  }
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, ...options.context });
  // Never send inquiries or contact HoneyBook during automated checks.
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  const page = await context.newPage();
  page.setDefaultTimeout(3000);
  return { site, browser, context, page, close: async () => { await browser.close(); await site.close(); } };
}
module.exports = { startSite, openSite };
