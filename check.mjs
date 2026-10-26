import {chromium} from '@playwright/test';
import fs from 'node:fs';
fs.mkdirSync('.impeccable/review',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const page=await browser.newPage({viewport:{width:2056,height:1200},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const docCount=async()=>Number((await page.locator('#tab-docs .count').textContent()).split('/').pop());
await page.goto(process.env.CHECK_URL || 'http://127.0.0.1:5173');
await page.screenshot({path:'.impeccable/review/desktop.png',fullPage:true});
// Đã có kết quả: khối câu hỏi thu thành thanh, mở lại bằng Sửa câu hỏi, Hủy trả về câu hỏi cũ.
if(!await page.locator('.query-bar').isVisible()||await page.locator('#question').count())throw Error('Collapsed query bar missing');
// iOS: viewport-fit=cover để env(safe-area-inset-*) có giá trị; PWA: có manifest.
if(!(await page.locator('meta[name=viewport]').getAttribute('content')).includes('viewport-fit=cover')||!await page.locator('link[rel=manifest]').count())throw Error('Safe-area viewport or manifest missing');
if(await page.getByRole('button',{name:'Sửa câu hỏi'}).evaluate(e=>getComputedStyle(e).backgroundColor)!=='rgb(29, 62, 115)')throw Error('Sửa câu hỏi should be the navy primary button');
await page.getByRole('button',{name:'Sửa câu hỏi'}).click();
await page.locator('#question').fill('câu hỏi tạm');
await page.getByRole('button',{name:'Hủy'}).click();
if(!(await page.locator('.query-text').textContent()).includes('Nghị quyết 57'))throw Error('Cancel edit failed');
// Bấm ra ngoài khi đang sửa: form thu lại, thanh vẫn hiện câu hỏi cũ, mở lại thì còn bản gõ dở.
await page.getByRole('button',{name:'Sửa câu hỏi'}).click();
await page.locator('#question').fill('bản gõ dở');
await page.locator('#answer-title').click();
if(await page.locator('#question').count()||!(await page.locator('.query-text').textContent()).includes('Nghị quyết 57'))throw Error('Click outside should dismiss editing');
await page.getByRole('button',{name:'Sửa câu hỏi'}).click();
if(await page.locator('#question').inputValue()!=='bản gõ dở')throw Error('Draft should survive click outside');
await page.locator('.filter-toggle').click();
if(!await page.locator('#question').count())throw Error('Clicks inside the form must not dismiss it');
await page.getByRole('button',{name:'Hủy'}).click();
// Lớp 1: mỗi nhóm chỉ hiện ý đầu, mở thêm được.
const initialBullets=await page.locator('.unit.open li').count();
await page.getByRole('button',{name:/Mở cả \d+ ý/}).click();
if(await page.locator('.unit.open li').count()<=initialBullets)throw Error('Expand answer groups failed');
await page.getByRole('button',{name:'Thu gọn tất cả',exact:true}).first().click();
// Desktop chia đôi: [n] mở nguồn ở cột phải; nguồn dẫn ngược về các ý.
if(await page.locator('.results').evaluate(e=>getComputedStyle(e).display)!=='grid')throw Error('Desktop split layout missing');
await page.locator('.answer .cite').nth(1).click();
if(await page.locator('#tab-sources').getAttribute('aria-selected')!=='true'||await page.locator('#panel-sources .excerpt.active').count()!==1)throw Error('Citation to evidence column failed');
if(await page.locator('.excerpt.inline').count())throw Error('Desktop should not open inline citation');
await page.locator('#panel-sources .excerpt.active').getByRole('button',{name:/Xem \d+ ý dùng nguồn này/}).click();
if(await page.locator('.answer li.active').count()!==4)throw Error('Source to answer points failed');
await page.locator('#panel-sources .excerpt.active').getByRole('button',{name:'Xem toàn bộ'}).click();
if(!await page.locator('dialog').isVisible())throw Error('Source dialog failed');
await page.getByRole('button',{name:'Đóng',exact:true}).click();
// Khớp hai cột: bằng chứng chỉ hiện nguồn của đơn vị đang mở, kèm dòng ngữ cảnh và nút Hiện tất cả.
if(await page.locator('#tab-sources .count').textContent()!=='1/8'||!await page.locator('.context-line').isVisible())throw Error('Evidence matching missing');
await page.locator('.context-line').getByRole('button',{name:'Hiện tất cả'}).click();
if(await page.locator('#tab-sources .count').textContent()!=='8'||await page.locator('#panel-sources .excerpt').count()!==8)throw Error('Show all evidence failed');
// Đầu trang gộp vào thanh: không còn khối tiêu đề, chế độ tra cứu nằm trong thanh.
if(await page.locator('header').count()||!await page.locator('.query-bar [role=tab]').first().isVisible())throw Error('Header should fold into query bar');
// Cuộn xuống: thanh câu hỏi trượt khuất; cuộn lên: hiện lại.
await page.getByRole('button',{name:/Mở cả \d+ ý/}).click();
await page.mouse.move(600,600);
await page.mouse.wheel(0,400);await page.waitForTimeout(400);
if(!await page.locator('.query-bar.is-hidden').count())throw Error('Query bar should hide on scroll down');
await page.mouse.wheel(0,-150);await page.waitForTimeout(400);
if(await page.locator('.query-bar.is-hidden').count())throw Error('Query bar should show on scroll up');
await page.evaluate(()=>scrollTo(0,0));
await page.getByRole('button',{name:'Thu gọn tất cả',exact:true}).first().click();
// Lề nguồn của đơn vị đang mở: [n] kèm số hiệu văn bản; trỏ vào một ý thì nguồn của ý đó được tô sáng.
await page.getByRole('button',{name:/Xã Phù Cát/}).click();
const phuCat=page.locator('.unit.open').filter({hasText:'Xã Phù Cát'});
if(!(await phuCat.locator('.margin-srcs').textContent()).includes('109 - BC/BCĐ57'))throw Error('Open unit margin should list document numbers');
await phuCat.locator('li[data-src="4"]').evaluate(e=>e.scrollIntoView({block:'center'}));
await phuCat.locator('li[data-src="4"]').hover();await page.waitForTimeout(100);
if((await phuCat.locator('.margin-srcs li.is-current').textContent())?.includes('[4]')!==true)throw Error('Hovered point should highlight its source in the margin');
await page.getByRole('button',{name:/Xã Phù Cát/}).click();
// Thu gọn bằng chứng thành dải; [n] mở lại.
await page.getByRole('button',{name:'Thu gọn',exact:true}).click();
if(await page.locator('#evidence').isVisible()||!await page.locator('.evidence-rail').first().isVisible())throw Error('Collapse evidence failed');
await page.locator('.answer .cite').first().click();
if(!await page.locator('#evidence').isVisible()||await page.locator('#panel-sources .excerpt.active').count()!==1)throw Error('Citation should reopen evidence');
await page.locator('.context-line').getByRole('button',{name:'Hiện tất cả'}).click();
// Lọc, xóa lọc.
await page.getByRole('button',{name:'Sửa câu hỏi'}).click();
await page.locator('.filter-toggle').click();
await page.getByPlaceholder('Số hiệu hoặc nội dung').fill('150/BC');
await page.getByRole('button',{name:'Xác nhận',exact:true}).click();
await page.waitForTimeout(350);
await page.locator('#tab-docs').click();
if(await docCount()!==1||await page.locator('.document').count()!==1)throw Error('Keyword filter failed');
if(!await page.locator('.query-bar').isVisible()||!(await page.locator('.query-filters').textContent()).includes('(1)'))throw Error('Query bar after search failed');
await page.getByRole('button',{name:'Xóa bộ lọc'}).click();
if(await docCount()!==15)throw Error('Reset failed');
await page.locator('#tab-docs').click();
await page.getByRole('button',{name:'Hiện tất cả 15 văn bản'}).click();
// Nút "Xem n đoạn trích" trên dòng văn bản: lọc tab Đoạn nguồn theo văn bản đó.
await page.getByRole('button',{name:/Xem 3 đoạn trích của 109/}).click();
await page.waitForTimeout(100);
if(await page.locator('#tab-sources').getAttribute('aria-selected')!=='true'||await page.locator('#panel-sources .excerpt').count()!==3||!(await page.locator('.context-line').textContent()).includes('109'))throw Error('Document excerpts action failed');
await page.locator('.context-line').getByRole('button',{name:'Hiện tất cả'}).click();
await page.locator('#tab-docs').click();
if(await page.locator('.document').count()!==15)throw Error('Show all documents failed');
// Lớp 3: tab bằng chứng, có điều khiển bằng phím mũi tên.
await page.locator('#tab-docs').focus();
await page.keyboard.press('ArrowRight');
if(await page.locator('#panel-sources .excerpt').count()!==8)throw Error('Evidence tabs failed');
await page.keyboard.press('ArrowRight');
if(!await page.locator('.relation-row').first().isVisible())throw Error('Relations tab failed');
await page.getByRole('tab',{name:'Báo cáo tổng hợp'}).click();
await page.getByRole('button',{name:'Tải báo cáo'}).waitFor();
await page.getByRole('tab',{name:'Hỏi đáp'}).click();
// Tablet: bằng chứng là panel; [n] mở panel, Esc đóng và trả focus.
await page.setViewportSize({width:900,height:1000});
await page.waitForTimeout(400);
if(await page.locator('#evidence').isVisible()||!await page.locator('.evidence-rail').first().isVisible())throw Error('Tablet panel should start closed');
await page.locator('.answer .cite').first().click();
await page.waitForTimeout(350);
if(!await page.locator('#evidence').isVisible()||await page.locator('#panel-sources .excerpt.active').count()!==1)throw Error('Tablet citation should open panel');
await page.screenshot({path:'.impeccable/review/tablet.png'});
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
if(await page.locator('#evidence').isVisible())throw Error('Tablet Escape failed');
await page.locator('.evidence-rail').first().click();
await page.waitForTimeout(300);
if(!await page.locator('#evidence').isVisible())throw Error('Tablet rail failed');
await page.getByRole('button',{name:'Đóng',exact:true}).first().click();
if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Tablet horizontal overflow');
await page.reload();
await page.setViewportSize({width:390,height:844});
await page.screenshot({path:'.impeccable/review/mobile.png',fullPage:true});
// Mobile: sửa câu hỏi tại chỗ khi đang đọc giữa trang, không phải cuộn lên đầu.
await page.getByRole('button',{name:/Mở cả \d+ ý/}).click();
await page.evaluate(()=>scrollTo(0,1500));await page.waitForTimeout(200);
await page.mouse.move(150,500);await page.mouse.wheel(0,-60);await page.waitForTimeout(400);
const yBefore=await page.evaluate(()=>scrollY);
await page.getByRole('button',{name:'Sửa câu hỏi'}).click();await page.waitForTimeout(350);
const fieldTop=await page.locator('#question').evaluate(e=>e.getBoundingClientRect().top);
if(fieldTop<0||fieldTop>80)throw Error(`In-place edit field not at top of screen (${fieldTop})`);
if(await page.locator('.follow-up').count())throw Error('Follow-up composer should hide while editing');
if(await page.locator('header').count())throw Error('In-place edit should not render the full header');
await page.screenshot({path:'.impeccable/review/mobile-inplace.png'});
await page.getByRole('button',{name:'Hủy'}).click();await page.waitForTimeout(300);
const yAfter=await page.evaluate(()=>scrollY);
if(Math.abs(yAfter-yBefore)>120)throw Error(`Cancel should keep reading position (${yBefore}→${yAfter})`);
await page.getByRole('button',{name:'Sửa câu hỏi'}).click();await page.waitForTimeout(300);
await page.getByRole('button',{name:'Xác nhận',exact:true}).click();await page.waitForTimeout(1200);
const resultsTop=await page.locator('#results').evaluate(e=>e.getBoundingClientRect().top);
if(resultsTop<-5||resultsTop>140)throw Error(`Submit should bring results to top (${resultsTop})`);
await page.getByRole('button',{name:'Thu gọn tất cả',exact:true}).first().click();
// Mobile: ô Hỏi tiếp ghim đáy; câu mới thay kết quả, thanh trên đầu hiện câu mới.
const composer=page.locator('.follow-up');
if(await composer.evaluate(e=>getComputedStyle(e).position)!=='fixed'||await composer.evaluate(e=>Math.abs(e.getBoundingClientRect().bottom-innerHeight)>2))throw Error('Follow-up composer should be pinned to the bottom');
// Cuộn xuống: ô Hỏi tiếp trượt khuất; cuộn lên: hiện lại.
await page.getByRole('button',{name:/Mở cả \d+ ý/}).click();
await page.evaluate(()=>scrollTo(0,300));await page.waitForTimeout(100);
await page.mouse.move(150,400);await page.mouse.wheel(0,500);await page.waitForTimeout(400);
if(!await page.locator('.follow-up.is-hidden').count())throw Error('Follow-up should hide on scroll down');
await page.mouse.wheel(0,-200);await page.waitForTimeout(400);
if(await page.locator('.follow-up.is-hidden').count())throw Error('Follow-up should show on scroll up');
await page.getByRole('button',{name:'Thu gọn tất cả',exact:true}).first().click();
await page.getByLabel('Hỏi tiếp hoặc hỏi câu mới').fill('tiến độ chuyển đổi số cấp xã');
await page.keyboard.press('Enter');await page.waitForTimeout(900);
if(!(await page.locator('.query-text').textContent()).includes('chuyển đổi số cấp xã'))throw Error('Follow-up should become the current question');
if(await page.getByLabel('Hỏi tiếp hoặc hỏi câu mới').inputValue()!=='')throw Error('Follow-up field should clear after asking');
await page.evaluate(()=>scrollTo(0,0));
// Mobile một cột: [n] mở đoạn trích ngay dưới ý.
if(await page.locator('.results').evaluate(e=>getComputedStyle(e).display)==='grid')throw Error('Mobile should be single column');
await page.locator('.answer .cite').first().click();
await page.locator('.excerpt.inline').waitFor({timeout:3000}).catch(()=>{throw Error('Mobile inline citation failed')});
// Panel (dưới 1100px) cũng khớp với các ý đang mở: mở đơn vị Xã Đại Phúc rồi mở panel thì chỉ thấy nguồn 2.
await page.setViewportSize({width:900,height:900});await page.waitForTimeout(300);
await page.getByRole('button',{name:/Xã Đại Phúc/}).click();
if(await page.locator('.evidence-rail .count').textContent()!=='1/15')throw Error('Rail count should follow open units');
await page.locator('.evidence-rail').click();await page.waitForTimeout(350);
await page.locator('#tab-sources').click();
if(!await page.locator('.context-line').isVisible()||await page.locator('#panel-sources .excerpt').count()>=8)throw Error('Panel should match open units');
await page.keyboard.press('Escape');await page.waitForTimeout(300);
// Dưới 768px vẫn có dải bằng chứng bên phải; bấm mở panel, Esc đóng.
for(const width of [745,390]){
 await page.setViewportSize({width,height:844});
 await page.waitForTimeout(400);
 if(await page.locator('#evidence').isVisible()||!await page.locator('.evidence-rail').isVisible())throw Error(`Rail missing at ${width}px`);
 await page.locator('.evidence-rail').click();
 await page.waitForTimeout(350);
 if(!await page.locator('#evidence').isVisible())throw Error(`Panel failed at ${width}px`);
 await page.screenshot({path:`.impeccable/review/panel-${width}.png`});
 await page.keyboard.press('Escape');
 await page.waitForTimeout(300);
 if(await page.locator('#evidence').isVisible())throw Error(`Panel Escape failed at ${width}px`);
}
const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
if(overflow)throw Error('Mobile horizontal overflow');
// Nhúng trong khung chat GeoAgent: không đầu trang/thanh câu hỏi, chia đôi từ 720px, báo chiều cao cho khung chat.
const appUrl=page.url().split('?')[0];
for(const [width,splitExpected] of [[970,true],[600,false]]){
 const host=await browser.newPage({viewport:{width:1400,height:900}});
 host.on('pageerror',e=>errors.push(e.message));
 await host.setContent(`<iframe id="f" src="${appUrl}?embed=1" style="width:${width}px;height:400px;border:0"></iframe><script>window.heights=[];addEventListener('message',e=>{if(e.data?.type==='van-ban/resize'){heights.push(e.data.height);document.getElementById('f').style.height=e.data.height+'px'}})</script>`);
 const frame=host.frameLocator('#f');
 await frame.locator('.answer').waitFor();
 await host.waitForTimeout(400);
 if(await frame.locator('.query-bar, header, #question').count())throw Error('Embed should hide header and query');
 const display=await frame.locator('.results').evaluate(e=>getComputedStyle(e).display);
 if((display==='grid')!==splitExpected)throw Error(`Embed ${width}px split layout wrong`);
 if(!(await host.evaluate(()=>window.heights.length)))throw Error('Embed did not report height');
 await frame.locator('.answer .cite').first().click();
 if(splitExpected&&await frame.locator('#panel-sources .excerpt.active').count()!==1)throw Error('Embed citation to evidence failed');
 if(!splitExpected&&!await frame.locator('.excerpt.inline').count())throw Error('Embed narrow inline citation failed');
 await host.waitForTimeout(700);
 if(await frame.locator('.drawer-tabs').evaluate(e=>e.scrollWidth>e.clientWidth+1))throw Error(`Embed ${width}px evidence tabs overflow`);
 await host.screenshot({path:`.impeccable/review/embed-${width}.png`,fullPage:true});
 await host.close();
}
if(errors.length)throw Error(errors.join('\n'));
console.log('PASS: embed in GeoAgent frame (970/600px, height reporting), collapsed query bar, evidence collapse to rail, tablet evidence panel, desktop split with citation↔source linking, mobile inline citation, answer groups, source dialog, filter, reset, show all, evidence tabs, report tab, mobile without horizontal overflow or browser errors');
await browser.close();
