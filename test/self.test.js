describe('@zumerbox/tests - self test', () => {
  it('loads visualDiff global function', () => {
    expect(typeof visualDiff).to.equal('function');
  });

  it('simulates jsdom correctly', () => {
    const div = document.createElement('div');
    div.id = 'demo';
    document.body.appendChild(div);
    const el = document.getElementById('demo');
    expect(el).to.not.be.null;
  });

  it('can launch Puppeteer and set content', async () => {
    await page.setContent('<h1>Hello</h1>');
    const content = await page.$eval('h1', el => el.textContent);
    expect(content).to.equal('Hello');
  });

  it('can run a visual diff on basic HTML', async () => {
    await page.setContent('<div style="width:100px;height:50px;background:red"></div>');
    await visualDiff(page, 'self-test-box.png');
  });
});
