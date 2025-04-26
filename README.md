# @zumerbox/tests

This tool simplifies the process of running Jest tests for your project, including visual tests with image snapshots. It provides a convenient way to execute Jest with custom configuration and setup files, allowing you to run tests with ease.

Visual test are a convenient way to test UI. In this case, image snapshoots are compared to detect changes.

Refer to the [ZumerBox bundle](https://github.com/zumerlab/zumerbox) for more information and tools.

## Features

- **Headless DOM** with jsdom
- **Visual diff testing** with Puppeteer + pixelmatch
- **Out of the box**: zero configuration required in the user’s project

## Installation & Usage

Run directly without prior installation:

```bash
npx @zumerbox/tests
```

By default, Mocha will discover test files matching `test/**/*.test.{js,ts,jsx,tsx}`.

## Writing Tests

### Unit / Logic Tests

```js
// test/math.test.js
const { expect } = require('chai');

describe('Math Operations', () => {
  it('should add numbers correctly', () => {
    expect(1 + 2).to.equal(3);
  });
});
```

### Visual UI Tests

```js
// test/button.test.js
describe('Button UI', () => {
  it('matches the visual snapshot', async function() {
    await this.page.setContent('<button class="primary">Click me</button>');
    await visualDiff(this.page, 'button-primary.png');
  });
});
```

- On the first run, a new snapshot `__snapshots__/button-primary.png` will be generated.
- Subsequent runs compare against the baseline and, if discrepancies are found, output a diff image `*.diff.png` and fail the test.

## Optional Flags

- `--u`: Regenerate all baseline snapshots.


```bash
npx @zumerbox/tests --update-snapshots
npx @zumerbox/tests --grep "Button UI"
```
