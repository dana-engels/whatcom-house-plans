const {test} = require('node:test');
const assert = require('node:assert/strict');
const {openSite} = require('./helpers.cjs');

test('all pages load local assets without script errors and retain existing contact routes with HoneyBook blocked', async () => {
  const app = await openSite();
  try {
    const errors=[];
    const failed=[];
    app.page.on('pageerror',error => errors.push(error.message));
    app.page.on('response',response => {if(response.url().startsWith(app.site.url) && response.status() >= 400) failed.push(response.url());});
    for (const route of ['/', '/stock-plans-1/', '/404.html']) {
      await app.page.goto(app.site.url+route);
      await app.page.evaluate(async () => {await document.fonts.ready; for(const image of document.images) image.loading='eager';});
      const links=app.page.getByRole('link');
      if(route !== '/404.html') {
        assert.equal(await app.page.locator('a[href="mailto:dana@whatcomhp.com"]').isVisible(),true);
        assert.equal(await app.page.locator('a[href="tel:+13603031196"]').isVisible(),true);
      } else assert.equal(await links.filter({hasText:'Return Home'}).count(),1);
      assert.equal(await app.page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    }
    assert.deepEqual(errors,[]);
    assert.deepEqual(failed,[]);
  } finally {await app.close();}
});

test('reduced motion preserves carousel interaction, and no-JavaScript visitors can read all existing slides', async () => {
  const app = await openSite({context:{reducedMotion:'reduce'}});
  try {
    await app.page.goto(app.site.url);
    await app.page.getByRole('button',{name:'Next project',exact:true}).click();
    assert.equal(await app.page.locator('.gallery-carousel [data-carousel-count]').innerText(),'02 / 13');
    const duration=await app.page.locator('.carousel-track').first().evaluate(element => parseFloat(getComputedStyle(element).transitionDuration));
    assert.ok(duration < 0.01);
    const noJS = await app.browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
    try {
      await noJS.route('**/*',route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
      const page=await noJS.newPage();
      await page.goto(app.site.url);
      assert.equal(await page.locator('.gallery-carousel img').count(),13);
      assert.equal(await page.locator('.gallery-carousel img').last().isVisible(),true);
      assert.equal(await page.locator('.review-carousel blockquote').last().isVisible(),true);
    } finally {await noJS.close();}
  } finally {await app.close();}
});
