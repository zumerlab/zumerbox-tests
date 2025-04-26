const puppeteer = require('puppeteer');
const pixelmatch = require('pixelmatch');
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

let browser;
let page;

// Parse command line arguments for snapshot updates
const args = process.argv.slice(2);
const updateSnapshots = args.includes('-u') || args.includes('--update');

// Find test directory
const testPatterns = ['test', 'tests', '__tests__', 'spec', 'specs'];
let testDir = null;

for (const pattern of testPatterns) {
  if (fs.existsSync(path.resolve(process.cwd(), pattern))) {
    testDir = pattern;
    break;
  }
}

if (!testDir) {
  testDir = 'test'; // Default fallback
}

exports.mochaHooks = {
  beforeAll: async function () {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    global.page = page;
    global.browser = browser;
  },

  afterAll: async function () {
    await browser.close();
  }
};

require('jsdom-global')();
global.expect = require('chai').expect;

// visualDiff
global.visualDiff = async (page, snapshotName, opts = {}) => {
  // Store snapshots in the test directory
  const snapshotsDir = path.resolve(process.cwd(), testDir, '__snapshots__');
  if (!fs.existsSync(snapshotsDir)) {
    fs.mkdirSync(snapshotsDir, { recursive: true });
  }

  const imgPath = path.join(snapshotsDir, snapshotName);
  const buffer = await page.screenshot();

  // Update snapshot if flag is set or snapshot doesn't exist
  if (updateSnapshots || !fs.existsSync(imgPath)) {
    fs.writeFileSync(imgPath, buffer);
    console.log(`Snapshot ${updateSnapshots ? 'updated' : 'saved'}: ${snapshotName}`);
    return;
  }

  const baseline = PNG.sync.read(fs.readFileSync(imgPath));
  const current = PNG.sync.read(buffer);
  const { width, height } = baseline;
  const diff = new PNG({ width, height });

  const mismatches = pixelmatch(
    baseline.data, current.data, diff.data,
    width, height,
    { threshold: opts.threshold || 0.1 }
  );

  if (mismatches > 0) {
    const diffPath = path.join(
      snapshotsDir,
      snapshotName.replace(/\.png$/, '.diff.png')
    );
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
    throw new Error(`Visual diff failed: ${mismatches} pixels differ. See ${diffPath}`);
  }
};