const { test } = require('node:test');
const assert = require('node:assert/strict');
const { openSite } = require('./helpers.cjs');

test('gallery exposes only its current slide and announces user changes independently of reviews', async () => {
  const app = await openSite({context:{viewport:{width:1440,height:1000}}});
  try {
    await app.page.goto(app.site.url);
    const gallery = app.page.getByRole('region', {name:'Recent Projects',exact:true});
    assert.equal(await gallery.count(), 1);
    await gallery.getByRole('button', {name:'Next project',exact:true}).click();
    assert.equal(await gallery.locator('[data-carousel-count]').innerText(), '02 / 13');
    assert.equal(await app.page.locator('.review-carousel [data-carousel-count]').innerText(), '01 / 08');
    assert.equal(await gallery.getByRole('img').count(), 1);
    assert.equal(await gallery.getByRole('status').innerText(), 'Item 2 of 13');
    await gallery.getByRole('button', {name:'Go to item 13',exact:true}).click();
    await gallery.getByRole('button', {name:'Next project',exact:true}).click();
    assert.equal(await gallery.locator('[data-carousel-count]').innerText(), '01 / 13');
    await gallery.getByRole('button', {name:'Previous project',exact:true}).click();
    assert.equal(await gallery.locator('[data-carousel-count]').innerText(), '13 / 13');
  } finally { await app.close(); }
});

test('incomplete, empty and single-slide instances do not break other carousels', async () => {
  const app = await openSite();
  try {
    await app.page.route('**/', async route => {
      const response = await route.fetch();
      const html = await response.text();
      // Fixture uses production markup/script at the agreed browser seam.
      await route.fulfill({response, body:html.replace('<main id="main">', `<main id="main">
        <div data-carousel><div class="carousel-track"></div></div>
        <div data-carousel><figure class="carousel-slide">Incomplete</figure></div>
        <div data-carousel aria-label="Single">
          <div class="carousel-track"><figure class="carousel-slide">Only item</figure></div>
          <button data-carousel-prev>Previous</button><button data-carousel-next>Next</button>
          <div data-carousel-dots></div><span data-carousel-count></span>
        </div>`) });
    });
    const errors=[];
    app.page.on('pageerror',error => errors.push(error.message));
    await app.page.goto(app.site.url);
    assert.deepEqual(errors, []);
    assert.equal(await app.page.getByText('Incomplete',{exact:true}).isVisible(), true);
    const single = app.page.getByRole('region',{name:'Single',exact:true});
    assert.equal(await single.getByRole('button',{name:'Next',exact:true}).isDisabled(), true);
    assert.equal(await single.locator('[data-carousel-count]').innerText(),'01 / 01');
    await app.page.getByRole('button',{name:'Next review',exact:true}).click();
    assert.equal(await app.page.locator('.review-carousel [data-carousel-count]').innerText(),'02 / 08');
  } finally { await app.close(); }
});
