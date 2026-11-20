const {test} = require('node:test');
const assert = require('node:assert/strict');
const AxeBuilder = require('@axe-core/playwright').default;
const allowed = require('./accessibility-baseline.json');
const {openSite} = require('./helpers.cjs');

test('mobile pages introduce no axe findings beyond the documented unchanged-design contrast baseline', async () => {
  const app=await openSite();
  try {
    for(const route of Object.keys(allowed)) {
      await app.page.goto(app.site.url+route);
      const result=await new AxeBuilder({page:app.page}).analyze();
      const findings=result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}));
      assert.deepEqual(findings,allowed[route],`Accessibility findings changed for ${route}; inspect before updating the baseline.`);
    }
  } finally {await app.close();}
});

test('keyboard-focused menu, FAQ and carousel controls have a visible focus indicator', async () => {
  const app=await openSite();
  const checkFocus=async control => {
    await control.focus();
    await app.page.keyboard.press('Shift+Tab');
    await app.page.keyboard.press('Tab');
    const state=await control.evaluate(element=>{
      const style=getComputedStyle(element);
      return {focused:element===document.activeElement,visible:element.matches(':focus-visible'),outline:style.outlineStyle,width:parseFloat(style.outlineWidth)};
    });
    assert.equal(state.focused,true);
    assert.equal(state.visible,true);
    assert.notEqual(state.outline,'none');
    assert.ok(state.width>0);
  };
  try {
    await app.page.goto(app.site.url);
    await app.page.getByRole('button',{name:'Open navigation'}).click();
    await app.page.waitForFunction(()=>Boolean(document.activeElement?.closest('.site-nav')));
    await checkFocus(app.page.getByRole('navigation',{name:'Primary navigation'}).getByRole('link').first());
    await app.page.keyboard.press('Escape');
    await app.page.setViewportSize({width:1440,height:1000});
    await checkFocus(app.page.getByRole('button',{name:'What services do you offer?'}));
    await checkFocus(app.page.getByRole('button',{name:'Next project',exact:true}));
    await checkFocus(app.page.locator('.gallery-carousel').getByRole('button',{name:'Go to item 2',exact:true}));
  } finally {await app.close();}
});
