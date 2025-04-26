#!/usr/bin/env node

const path = require('path');
const glob = require('glob');
const Mocha = require('mocha');
const puppeteer = require('puppeteer');
const pixelmatch = require('pixelmatch');
const fs = require('fs');
const { PNG } = require('pngjs');

// Parse command line arguments
const args = process.argv.slice(2);
const updateSnapshots = args.includes('-u') || args.includes('--update');

// Find test directories (test, tests, __tests__, etc.)
const testPatterns = ['test', 'tests', '__tests__', 'spec', 'specs'];
let testDir = null;

for (const pattern of testPatterns) {
  if (fs.existsSync(path.resolve(process.cwd(), pattern))) {
    testDir = pattern;
    break;
  }
}

if (!testDir) {
  console.error('No test directory found. Please create one of: test, tests, __tests__, spec, specs');
  process.exit(1);
}

// Setup jsdom and chai
require('jsdom-global')();
global.expect = require('chai').expect;

async function setupEnvironment() {
  global.browser = await puppeteer.launch();
  global.page = await browser.newPage();

  global.visualDiff = async function (page, snapshotName, opts = {}) {
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
}

// Find test files in all possible test directories
function findTestFiles() {
  const patterns = [
    'test/**/*.test.js',
    'tests/**/*.test.js',
    '__tests__/**/*.test.js',
    'spec/**/*.test.js',
    'specs/**/*.test.js',
    // Add more common patterns
    'test/**/*.spec.js',
    'tests/**/*.spec.js',
    '__tests__/**/*.spec.js'
  ];

  let allFiles = [];
  patterns.forEach(pattern => {
    const files = glob.sync(pattern, { cwd: process.cwd() });
    allFiles = [...allFiles, ...files];
  });

  return allFiles;
}

// Run all tests
(async () => {
  await setupEnvironment();

  const mocha = new Mocha({
    timeout: 10000,
    recursive: true
  });

  const files = findTestFiles();
  
  if (files.length === 0) {
    console.error('No test files found. Test files should match pattern: **/*.test.js or **/*.spec.js');
    process.exit(1);
  }

  console.log(`Found ${files.length} test files`);
  if (updateSnapshots) {
    console.log('Running in update snapshot mode (-u)');
  }

  files.forEach(f => mocha.addFile(path.resolve(process.cwd(), f)));

  mocha.run(async (failures) => {
    await global.browser.close();
    process.exitCode = failures ? 1 : 0;
  });
})();