const puppeteer = require('puppeteer');
const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('./webpack.config.js');

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

async function main() {
  console.log('Starting Webpack Server...');
  const compiler = Webpack(webpackConfig);
  const devServerOptions = { ...webpackConfig.devServer, open: false };
  const server = new WebpackDevServer(devServerOptions, compiler);
  await server.start();

  console.log('Webpack server listening on port', 8080);

  console.log('Starting puppeteer...');
  const timeout = setTimeout(() => {
    console.error('Operation timed out.');
    browser.close();
    process.exit(1);
  }, 10000);

  const browser = await puppeteer.launch({
    // args: ['--allow-file-access-from-files'],
    // headless: false,
  });

  const page = await browser.newPage();

  page.on('pageerror', (error) => {
    console.error('Page error:', error.message);
    browser.close();
    process.exit(1);
  });

  // Listen for console events
  page.on('console', async (msg) => {
    const type = msg.type();
    if (type === 'error') {
      console.error('JS Error:', msg.text());
      // Handle or throw error here
    } else {
      console.log(`${type.toUpperCase()}:`, msg.text());
    }
  });

  // Expose a function to the page for signaling success
  await page.exposeFunction('reportDone', (success) => {
    clearTimeout(timeout);
    browser.close();
    if (success) {
      console.log('Script executed successfully!');
      process.exit(0);
    } else {
      console.error('Browser script failed!');
      process.exit(1);
    }
  });

  const url = `http://localhost:${webpackConfig.devServer.port}/`;
  console.log(`Navigating to ${url}...`);
  await page.goto(url);

  await page.click('#run-test');
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
