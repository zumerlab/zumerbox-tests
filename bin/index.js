#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Force Jest to run from this package's local installation
const jestBin = require.resolve('jest/bin/jest');

try {
  const cwd = process.cwd();
  const args = process.argv.slice(2).join(' ');

  const defaultConfig = path.resolve(__dirname, '../jest.config.json');
  const defaultSetup = path.resolve(__dirname, '../jest-image-snapshot-extend.js');

  const hasUserConfig =
    fs.existsSync(path.join(cwd, 'jest.config.js')) ||
    fs.existsSync(path.join(cwd, 'jest.config.json'));

  const configArg = hasUserConfig ? '' : `-c ${defaultConfig}`;
  const setupArg = fs.existsSync(defaultSetup)
    ? `--setupFilesAfterEnv ${defaultSetup}`
    : '';

  if (!hasUserConfig) {
    console.log('🧪 Using default config from @zumerbox/tests');
  } else {
    console.log('🧪 Using user-defined Jest config');
  }

  // Compose full command using internal Jest
  execSync(`node ${jestBin} --rootDir ${cwd} ${configArg} ${setupArg} ${args}`, {
    stdio: 'inherit',
  });

} catch (error) {
  console.error('❌ Jest failed. Please fix the errors and try again.');
  process.exit(1);
}
