import {chromium} from '@playwright/test';
import fs from 'node:fs';
fs.mkdirSync('.impeccable/review',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const page=await browser.newPage({viewport:{width:2056,height:1200},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const docCount=async()=>Number((await page.locator('#tab-docs .count').textContent()).split('/').pop());
await page.goto(process.env.CHECK_URL || 'http://127.0.0.1:5173');
await page.screenshot({path:'.impeccable/review/desktop.png',fullPage:true});
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
// Lọc, xóa lọc.
await page.locator('.filters summary').click();
await page.getByPlaceholder('Số hiệu hoặc nội dung').fill('150/BC');
await page.getByRole('button',{name:'Hỏi',exact:true}).click();
await page.waitForTimeout(350);
await page.locator('#tab-docs').click();
if(await docCount()!==1||await page.locator('.document').count()!==1)throw Error('Keyword filter failed');
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
await page.reload();
await page.setViewportSize({width:390,height:844});
await page.screenshot({path:'.impeccable/review/mobile.png',fullPage:true});
// Mobile một cột: [n] mở đoạn trích ngay dưới ý.
if(await page.locator('.results').evaluate(e=>getComputedStyle(e).display)==='grid')throw Error('Mobile should be single column');
await page.locator('.answer .cite').first().click();
await page.locator('.excerpt.inline').waitFor({timeout:3000}).catch(()=>{throw Error('Mobile inline citation failed')});
const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
if(overflow)throw Error('Mobile horizontal overflow');
if(errors.length)throw Error(errors.join('\n'));
console.log('PASS: desktop split with citation↔source linking, mobile inline citation, answer groups, source dialog, filter, reset, show all, evidence tabs, report tab, mobile without horizontal overflow or browser errors');
await browser.close();
