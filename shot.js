const { chromium } = require('playwright');
(async () => {
  let browser;
  try { browser = await chromium.launch({ args: ['--no-sandbox','--disable-gpu'] }); }
  catch (e) { console.log('LAUNCH_FAIL:'+e.message.slice(0,200)); process.exit(2); }
  const base = 'http://localhost:3102';
  const forceReveal = `(()=>{const s=document.createElement('style');s.textContent='.reveal{opacity:1!important;transform:none!important}';document.head.appendChild(s);})()`;
  async function shot(path, file, vp) {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto(base + path, { waitUntil: 'networkidle' });
    await page.addScriptTag({ content: forceReveal });
    await page.waitForTimeout(400);
    await page.screenshot({ path: '/tmp/bendavis-site/shots/' + file, fullPage: true });
    await ctx.close();
    console.log('shot', file);
  }
  require('fs').mkdirSync('/tmp/bendavis-site/shots', { recursive: true });
  const D = { width: 1280, height: 900 }, M = { width: 390, height: 844 };
  await shot('/', 'home_d.png', D);
  await shot('/', 'home_m.png', M);
  await shot('/modeling', 'modeling_d.png', D);
  await shot('/acting', 'acting_m.png', M);
  await shot('/content-creation', 'cc_d.png', D);
  await shot('/about', 'about_d.png', D);
  await shot('/contact', 'contact_d.png', D);
  await shot('/contact', 'contact_m.png', M);
  await shot('/admin', 'admin_d.png', D);
  await browser.close();
})();
