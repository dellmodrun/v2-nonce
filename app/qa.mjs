import puppeteer from 'file:///C:/Users/Administrator/Desktop/github/senmilo/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
const browser=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--no-sandbox']});
for (const path of ['/', '/launch/', '/docs/', '/bonds/', '/registry/']) {
 const page=await browser.newPage(); await page.setViewport({width:1440,height:1000});
 const errors=[]; page.on('pageerror',e=>errors.push('PAGE '+e.message)); page.on('requestfailed',r=>errors.push('REQ '+r.url()+' '+r.failure()?.errorText));
 const res=await page.goto('http://127.0.0.1:4177'+path,{waitUntil:'networkidle2',timeout:30000});
 const info=await page.evaluate(()=>({title:document.title,text:document.body.innerText.slice(0,900),rootChildren:document.querySelector('#root')?.children.length,scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth}));
 console.log(JSON.stringify({path,status:res.status(),info,errors:errors.slice(0,12)}));
 if(path==='/') await page.screenshot({path:'C:/Users/Administrator/Desktop/github/v2pad-original/home.png',fullPage:true});
 await page.close();
}
await browser.close();


