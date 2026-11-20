const { test } = require('node:test');
const assert = require('node:assert/strict');
const { openSite } = require('./helpers.cjs');

test('mobile navigation closes on Escape and restores focus', async () => {
  const app = await openSite();
  try {
    await app.page.goto(app.site.url);
    const toggle = app.page.getByRole('button', { name: /navigation/, includeHidden:true });
    await toggle.click();
    assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
    await app.page.keyboard.press('Escape');
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    assert.equal(await toggle.evaluate(element => element === document.activeElement), true);
  } finally { await app.close(); }
});

test('mobile menu contains keyboard focus and closes cleanly across viewport changes', async () => {
  const app = await openSite();
  try {
    await app.page.goto(app.site.url);
    const toggle = app.page.getByRole('button', { name: /navigation/, includeHidden:true });
    await toggle.click();
    await app.page.waitForFunction(() => Boolean(document.activeElement?.closest('.site-nav')), null, {timeout:2000});
    const first = app.page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link').first();
    assert.equal(await first.evaluate(element => element === document.activeElement), true);
    await app.page.keyboard.press('Shift+Tab');
    assert.equal(await toggle.evaluate(element => element === document.activeElement), true);
    await app.page.keyboard.press('Tab');
    assert.equal(await first.evaluate(element => element === document.activeElement), true);
    await app.page.setViewportSize({width:1440,height:1000});
    await app.page.waitForFunction(() => document.querySelector(".menu-toggle").getAttribute("aria-expanded") === "false");
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    await app.page.setViewportSize({width:390,height:844});
    await toggle.click();
    await first.click();
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    assert.equal(await app.page.locator('#services').evaluate(element => element === document.activeElement), true);
    assert.equal(await app.page.locator('main').evaluate(element => element.inert), false);
  } finally { await app.close(); }
});

test('FAQ answers and mobile navigation remain available without JavaScript', async () => {
  const app = await openSite({context:{javaScriptEnabled:false}});
  try {
    await app.page.goto(app.site.url);
    assert.equal(await app.page.locator('#faq-1').isVisible(), true);
    assert.equal(await app.page.getByRole('navigation', {name:'Primary navigation'}).getByRole('link', {name:'Services',exact:true}).isVisible(), true);
  } finally { await app.close(); }
});

test('FAQ controls expand the associated answer and collapse it again', async () => {
  const app = await openSite();
  try {
    await app.page.goto(app.site.url);
    const question = app.page.getByRole('button', {name:'What services do you offer?'});
    assert.equal(await app.page.locator('#faq-1').isVisible(), false);
    await question.click();
    assert.equal(await question.getAttribute('aria-expanded'), 'true');
    assert.equal(await app.page.locator('#faq-1').isVisible(), true);
    await question.click();
    assert.equal(await app.page.locator('#faq-1').isVisible(), false);
  } finally { await app.close(); }
});
