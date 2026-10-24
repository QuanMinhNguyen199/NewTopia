import React, {useState, useRef, useEffect, useLayoutEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {answers, documents, relations, sources, sourceOrigins} from './data.js';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-sans/700.css';
import '@fontsource/tinos/400.css';
import '@fontsource/tinos/700.css';
import './style.css';

const DOC_PREVIEW=5;
const KIND={bao_cao:'Báo cáo',cong_van:'Công văn'};
const NO_CONTENT='PDF mẫu chỉ hiển thị số hiệu văn bản này, chưa có nội dung chi tiết.';
const normalize=s=>s.toLocaleLowerCase('vi').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d');
const compact=s=>s.replace(/\s+/g,'');

// Gom các ý theo đơn vị ban hành nguồn, giữ thứ tự xuất hiện.
const groups=answers.reduce((list,[text,src],id)=>{
 const unit=sourceOrigins[src-1][0];
 let group=list.find(g=>g.unit===unit);
 if(!group)list.push(group={unit,items:[]});
 group.items.push({id,text,src});
 return list;
},[]);
const reportItems=[0,1,4,8,14,15].map(id=>({id,text:answers[id][0],src:answers[id][1]}));

// Gộp quan hệ theo văn bản đích: một văn bản có thể vừa là căn cứ vừa được dẫn chiếu.
const relationRows=[...relations.reduce((map,[,rows],kind)=>{
 rows.forEach(([name,ref,external])=>{
  const row=map.get(name)||{name,external:false,basis:'',cited:''};
  row.external||=external;
  row[kind===0?'basis':'cited']=ref;
  map.set(name,row);
 });
 return map;
},new Map()).values()];

const sourceParts=i=>{const [kind,date,,pages]=sources[i][1].split(' · ');return {kind:KIND[kind]||kind,date,pages,issuer:sourceOrigins[i][1]}};
const sourceLine=i=>{const {kind,date,pages,issuer}=sourceParts(i);return `${issuer}. ${kind} ngày ${date}, ${pages}.`};
const citedBy=code=>sources.map((s,i)=>compact(s[0])===compact(code)?i+1:0).filter(Boolean);
const findDocument=code=>documents.find(d=>compact(d[0])===compact(code));

// Biểu tượng vẽ tay, cùng nét 1.75px, theo màu chữ.
const ICONS={
 down:<path d="M4 6l4 4 4-4"/>,
 download:<><path d="M8 2.5v8M4.75 7.5L8 10.75l3.25-3.25"/><path d="M3 13.5h10"/></>,
};
const Icon=({name})=><svg className="icon" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[name]}</svg>;

function SourceHead({n,title}){
 return <div className="source-head"><span className="source-no">[{n}]</span><strong className="doc-no">{title}</strong></div>;
}
function SourceMeta({index}){
 const {kind,date,pages,issuer}=sourceParts(index);
 return <div className="source-meta"><span className="issuer">{issuer}</span><span>{kind} ngày {date}, {pages}</span></div>;
}

// Desktop chia đôi: trích dẫn mở ở cột bằng chứng. Màn hẹp: trích dẫn mở ngay dưới ý.
const WIDE='(min-width: 1100px)';
function useWide(){
 const [wide,setWide]=useState(()=>window.matchMedia(WIDE).matches);
 // Nghe thêm resize: sự kiện change của matchMedia có thể bị bỏ lỡ khi kích thước đổi liên tiếp.
 useEffect(()=>{
  const media=window.matchMedia(WIDE),update=()=>setWide(media.matches);
  media.addEventListener('change',update);window.addEventListener('resize',update);update();
  return()=>{media.removeEventListener('change',update);window.removeEventListener('resize',update)};
 },[]);
 return wide;
}

// Số chú thích: desktop chuyển cột bằng chứng sang nguồn (bấm lại để bỏ chọn); màn hẹp mở đoạn trích tại chỗ.
function Cite({item,open,onToggle,wide,active}){
 const title=sources[item.src-1][0];
 return wide
  ?<button type="button" className={`cite ${active?'is-active':''}`} aria-controls={`source-${item.src}`} aria-label={`${active?'Bỏ chọn':'Xem'} nguồn ${item.src}: ${title}, ở cột bằng chứng`} title={`Nguồn ${item.src}: ${title}`} onClick={onToggle}>[{item.src}]</button>
  :<button type="button" className="cite" aria-expanded={open} aria-controls={`cite-${item.id}`} aria-label={`${open?'Ẩn':'Xem'} nguồn ${item.src}: ${title}`} onClick={onToggle}>[{item.src}]</button>;
}
function Bullet(props){
 const {item,open,wide,active,openDocument}=props;
 const [title,,text]=sources[item.src-1];
 return <li id={`point-${item.id}`} tabIndex={-1} className={active?'active':undefined}>
  {item.text}<Cite {...props}/>
  {open&&!wide&&<div className="excerpt inline" id={`cite-${item.id}`}>
   <SourceHead n={item.src} title={title}/>
   <SourceMeta index={item.src-1}/>
   <p className="excerpt-text"><span className="clamp">{text}</span></p>
   <button type="button" className="link-btn" onClick={()=>openDocument(title,text,sourceLine(item.src-1))}>Xem toàn bộ</button>
  </div>}
 </li>;
}

function App(){
 const [tab,setTab]=useState('qa'),[question,setQuestion]=useState('việc triển khai Nghị quyết 57 như thế nào'),[user,setUser]=useState('leader');
 const [keyword,setKeyword]=useState(''),[kind,setKind]=useState(''),[from,setFrom]=useState(''),[to,setTo]=useState('');
 const [auto,setAuto]=useState(true),[llm,setLlm]=useState(true),[showAnswer,setShowAnswer]=useState(true),[second,setSecond]=useState(false);
 const [notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[result,setResult]=useState(documents),[selected,setSelected]=useState(null);
 const [expanded,setExpanded]=useState([groups[0].unit]),[openCite,setOpenCite]=useState(null),[evidence,setEvidence]=useState('docs'),[allDocs,setAllDocs]=useState(false);
 const [activeSource,setActiveSource]=useState(null),[pull,setPull]=useState(0),[evidenceAll,setEvidenceAll]=useState(true),[docFocus,setDocFocus]=useState(null),[announce,setAnnounce]=useState(''),wide=useWide();
 const dialog=useRef(null),questionField=useRef(null),evidenceTablist=useRef(null);
 // Vạch mực dưới tab bằng chứng: đo tab đang chọn để vạch trượt tới đúng vị trí và độ rộng.
 const [ink,setInk]=useState({x:0,w:0});
 useLayoutEffect(()=>{
  const measure=()=>{const tab=evidenceTablist.current?.querySelector('[aria-selected="true"]');if(tab)setInk({x:tab.offsetLeft,w:tab.offsetWidth})};
  measure();window.addEventListener('resize',measure);document.fonts?.ready.then(measure);
  return()=>window.removeEventListener('resize',measure);
 },[evidence,wide,result.length,expanded,evidenceAll]);
 // Ô câu hỏi tự giãn theo nội dung, mặc định một dòng bằng chiều cao nút Hỏi.
 useEffect(()=>{const el=questionField.current;el.style.height='auto';el.style.height=`${el.scrollHeight+2}px`},[question,wide]);
 const filterCount=[keyword,kind,from,to].filter(Boolean).length;
 const allOpen=expanded.length===groups.length;

 function openDocument(title,content,meta){setSelected({title,content,meta});dialog.current.showModal()}
 function openCode(code){const doc=findDocument(code);openDocument(code,doc?.[2]||NO_CONTENT,doc?`Ngày ${doc[1]}`:'')}
 // Trái → phải: [n] chuyển cột bằng chứng sang nguồn n; chỉ cuộn bên trong cột. Bấm lại để bỏ chọn.
 function showSource(n,fromAnswer=true){
  if(activeSource===n){setActiveSource(null);setAnnounce(`Đã bỏ chọn nguồn ${n}.`);return}
  setEvidence('sources');setActiveSource(n);setPull(p=>p+1);setEvidenceAll(!fromAnswer);setDocFocus(null);setAnnounce(`Đang hiển thị nguồn ${n}: ${sources[n-1][0]}, ở cột bằng chứng.`);
  requestAnimationFrame(()=>{
   const slip=document.getElementById(`source-${n}`);
   if(!slip)return;
   const behavior=window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
   if(wide){const column=document.querySelector('.evidence'),head=column.querySelector('.evidence-head');column.scrollTo({top:slip.offsetTop-head.offsetHeight-12,behavior})}
   else slip.scrollIntoView({block:'start',behavior});
  });
 }
 // Phải → trái: mở các đơn vị dùng nguồn n, đánh dấu và chuyển focus tới ý đầu tiên.
 function showPoints(n){
  setActiveSource(n);
  const units=groups.filter(g=>g.items.some(i=>i.src===n)).map(g=>g.unit),count=answers.filter(a=>a[1]===n).length;
  setExpanded([...new Set([...expanded,...units])]);
  setAnnounce(`Đã mở ${count} ý dùng nguồn ${n}.`);
  const first=answers.findIndex(a=>a[1]===n);
  if(first>=0)requestAnimationFrame(()=>document.getElementById(`point-${first}`)?.focus());
 }
 const toggleCite=(id,src)=>wide?showSource(src):setOpenCite(openCite===id?null:id);
 const bulletProps=item=>({item,wide,open:openCite===item.id,active:wide&&activeSource===item.src,onToggle:()=>toggleCite(item.id,item.src),openDocument});
 const toggleGroup=unit=>{if(!expanded.includes(unit)){setEvidenceAll(false);setDocFocus(null)}setExpanded(expanded.includes(unit)?expanded.filter(u=>u!==unit):[...expanded,unit])};

 // Từ danh sách văn bản: mở tab Đoạn nguồn, chỉ hiện các tờ trích của văn bản đó và rút tờ đầu tiên.
 function showDocSources(code,list){
  setDocFocus({code,list});setEvidence('sources');setActiveSource(list[0]);setPull(p=>p+1);
  setAnnounce(`Đang xem ${list.length} đoạn trích của ${code}.`);
  requestAnimationFrame(()=>{
   const behavior=window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
   if(wide)document.querySelector('.evidence').scrollTo({top:0,behavior});
   else document.getElementById('evidence')?.scrollIntoView({block:'start',behavior});
  });
 }
 const showAllEvidence=()=>{setEvidenceAll(true);setDocFocus(null)};
 function clearFilters(){setDocFocus(null);setKeyword('');setKind('');setFrom('');setTo('');setResult(documents);setNotice('Đã xóa bộ lọc.')}
 function search(event){event.preventDefault();if(from&&to&&from>to){setNotice('Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.');return}setBusy(true);setNotice('Đang lọc dữ liệu mẫu…');
  window.setTimeout(()=>{const filtered=documents.filter(d=>{const date=d[1].split('/').reverse().join('-');return (!keyword||normalize(d.join(' ')).includes(normalize(keyword)))&&(!kind||(kind==='Báo cáo'?d[0].includes('BC'):kind==='Công văn'?d[0].includes('CV'):d[0].includes('NQ')))&&(!from||date>=from)&&(!to||date<=to)});setResult(filtered);setShowAnswer(llm&&tab==='qa');setBusy(false);setNotice('Đang hiển thị dữ liệu mẫu từ PDF. Chưa kết nối API tra cứu hoặc LLM để trả lời câu hỏi mới.');},250)
 }
 function downloadReport(){
  const url=URL.createObjectURL(new Blob(['BÁO CÁO TỔNG HỢP — DỮ LIỆU MẪU TỪ PDF\n\n'+result.map(d=>d.join(' — ')).join('\n\n')],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');
  a.href=url;a.download='bao-cao-tong-hop.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 function moveTab(event,ids,current,select){
  const step={ArrowRight:1,ArrowLeft:-1}[event.key];
  if(!step)return;
  const next=ids[(ids.indexOf(current)+step+ids.length)%ids.length];
  select(next);document.getElementById(`tab-${next}`).focus();
 }
 function selectMode(id){setTab(id);setNotice(id==='report'?'Báo cáo tổng hợp từ các văn bản mẫu trong PDF.':'')}
 // Khớp hai cột: trên desktop, sau khi người dùng mở một đơn vị, cột bằng chứng chỉ hiện nguồn của các đơn vị đang mở.
 const openGroups=groups.filter(g=>expanded.includes(g.unit));
 const unitMatching=wide&&tab==='qa'&&showAnswer&&!evidenceAll&&openGroups.length>0&&!allOpen;
 const matching=!!docFocus||unitMatching;
 const contextSources=new Set(docFocus?docFocus.list:openGroups.flatMap(g=>g.items.map(i=>i.src)));
 const shownSources=sources.map((_,i)=>i+1).filter(n=>!matching||contextSources.has(n));
 const shownDocs=unitMatching&&!docFocus?result.filter(d=>citedBy(d[0]).some(n=>contextSources.has(n))):result;
 const contextName=openGroups.length>2?`${openGroups[0].unit} và ${openGroups.length-1} đơn vị khác`:openGroups.map(g=>g.unit).join(' và ');
 const tabCount=(shown,total)=>matching&&shown!==total?`${shown}/${total}`:total;
 const evidenceTabs=[['docs','Văn bản',tabCount(shownDocs.length,result.length)],['sources','Đoạn nguồn',tabCount(shownSources.length,sources.length)],['relations','Quan hệ',relationRows.length]];
 const visibleDocs=allDocs?shownDocs:shownDocs.slice(0,DOC_PREVIEW);

 // Mỗi đơn vị là một dòng sổ: lề trái ghi các nguồn mà đơn vị dùng (dữ liệu thật), cột chính là tên và các ý.
 // Nội dung đơn vị đang đóng vẫn được render để mở/đóng có chuyển động, nhưng bị inert và ẩn khỏi trình đọc màn hình.
 function renderUnit(group){
  const open=expanded.includes(group.unit),panel=`unit-${group.items[0].id}`,srcs=[...new Set(group.items.map(i=>i.src))];
  return <section className={`unit ${open?'open':''}`} key={group.unit}>
   <p className="unit-margin">Nguồn {srcs.join(', ')}</p>
   <div className="unit-main">
    <h3><button type="button" className="unit-row" aria-expanded={open} aria-controls={panel} onClick={()=>toggleGroup(group.unit)}><span className="unit-label"><span className="unit-name">{group.unit}</span><span className="unit-sub">{group.items.length} ý<span className="unit-src">, nguồn {srcs.join(', ')}</span></span></span><Icon name="down"/></button></h3>
    <div className="unit-body" id={panel} inert={!open} aria-hidden={!open}><div className="unit-inner"><ul>{group.items.map(item=><Bullet key={item.id} {...bulletProps(item)}/>)}</ul></div></div>
   </div>
  </section>;
 }

 return <main>
 <header>
  <div className="brand"><h1>Tra cứu và tổng hợp văn bản</h1><p>Bản demo. Chưa có Keycloak nên chọn người dùng giả lập, mọi lượt vẫn qua Adapter quyền.</p><p id="identity">{user==='leader'?'lanh_dao_tp: 177 đơn vị, mức mật tối đa tuyet_mat':user==='staff'?'chuyen_vien: người dùng giả lập — chưa kết nối phân quyền':'lanh_dao_don_vi: người dùng giả lập — chưa kết nối phân quyền'}</p></div>
  <label className="user">Người dùng giả lập<select value={user} onChange={e=>setUser(e.target.value)}><option value="leader">Lãnh đạo thành phố</option><option value="staff">Chuyên viên</option><option value="unit">Lãnh đạo đơn vị</option></select></label>
 </header>
 <nav aria-label="Chế độ tra cứu"><div role="tablist" aria-label="Chế độ tra cứu" onKeyDown={e=>moveTab(e,['qa','report'],tab,selectMode)}>
  {[['qa','Hỏi đáp'],['report','Báo cáo tổng hợp']].map(([id,title])=><button key={id} type="button" role="tab" id={`tab-${id}`} aria-selected={tab===id} aria-controls="results" tabIndex={tab===id?0:-1} className="tab" onClick={()=>selectMode(id)}>{title}</button>)}
 </div></nav>

 <form onSubmit={search} className="query">
  <div className="search-row">
   <label className="sr-only" htmlFor="question">Câu hỏi tra cứu</label>
   <textarea id="question" ref={questionField} rows="1" value={question} required onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();e.currentTarget.form.requestSubmit()}}}/>
   <button className="primary" disabled={busy}>{busy?'Đang tìm…':tab==='qa'?'Hỏi':'Tổng hợp'}</button>
  </div>
  <div className="query-options">
   <label className="check"><input type="checkbox" checked={auto} onChange={e=>{setAuto(e.target.checked);setNotice('Tự nhận bộ lọc cần kết nối API. Bạn có thể sử dụng Bộ lọc để lọc dữ liệu mẫu.')}}/> Tự nhận bộ lọc trong câu hỏi</label>
   <label className="check"><input type="checkbox" checked={llm} onChange={e=>setLlm(e.target.checked)}/> Viết câu trả lời (LLM)</label>
   <details className="filters">
    <summary>Bộ lọc{filterCount>0&&<span className="filter-count">({filterCount})</span>}<Icon name="down"/></summary>
   <div className="filter-grid">
    <label>Từ khóa văn bản<input value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder="Số hiệu hoặc nội dung"/></label>
    <label>Loại văn bản<select value={kind} onChange={e=>setKind(e.target.value)}><option value="">Tất cả</option><option>Báo cáo</option><option>Công văn</option><option>Nghị quyết</option></select></label>
    <label>Từ ngày<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label>
    <label>Đến ngày<input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label>
   </div>
   <button type="button" className="btn" onClick={clearFilters}>Xóa bộ lọc</button>
   </details>
   <span className="timing" title="Thời gian được hiển thị trong PDF mẫu">Tìm 0.522s, LLM 8.927s</span>
  </div>
  {notice&&<p id="notice" role="status">{notice}</p>}
 </form>

 <p className="sr-only" aria-live="polite">{announce}</p>
 <div id="results" role="tabpanel" aria-labelledby={`tab-${tab}`} className={`results ${tab==='qa'&&!showAnswer?'solo':''}`}>
 <a className="skip-link" href="#evidence">Chuyển tới phần bằng chứng</a>
 {tab==='qa'&&showAnswer&&<section className="answer" aria-labelledby="answer-title">
  <div className="section-head"><h2 id="answer-title">Câu trả lời</h2>
   <button type="button" className="link-btn" aria-expanded={allOpen} onClick={()=>setExpanded(allOpen?[groups[0].unit]:groups.map(g=>g.unit))}>{allOpen?'Thu gọn tất cả':`Mở cả ${answers.length} ý`}</button>
  </div>
  <div className="unit-list">{groups.map(renderUnit)}</div>
  <p className="footnote">1 ý bị bỏ vì không có nguồn hợp lệ.</p>
 </section>}

 {tab==='report'&&<section className="answer" aria-labelledby="report-title">
  <div className="section-head"><h2 id="report-title">Báo cáo tổng hợp</h2></div>
  <p className="report-lead">Tổng hợp {result.length} văn bản mẫu về triển khai Nghị quyết 57.</p>
  <ul className="report-list">{reportItems.map(item=><Bullet key={item.id} {...bulletProps(item)}/>)}</ul>
  <button type="button" className="btn" onClick={downloadReport}><Icon name="download"/>Tải báo cáo</button>
 </section>}

 <aside className="evidence" id="evidence" tabIndex={-1} aria-labelledby="evidence-title">
  <div className="evidence-head">
   <div className="section-head"><h2 id="evidence-title">Bằng chứng</h2></div>
   <div className="drawer-tabs" ref={evidenceTablist} role="tablist" aria-label="Loại bằng chứng" onKeyDown={e=>moveTab(e,['docs','sources','relations'],evidence,setEvidence)}>
    {evidenceTabs.map(([id,label,count])=><button key={id} type="button" role="tab" id={`tab-${id}`} aria-selected={evidence===id} aria-controls={`panel-${id}`} tabIndex={evidence===id?0:-1} onClick={()=>setEvidence(id)}>{label} <span className="count">{count}</span></button>)}
    <span className="tab-ink" aria-hidden="true" style={{transform:`translateX(${ink.x}px) scaleX(${ink.w/100})`}}/>
   </div>
   {matching&&<p className="context-line" role="status"><span>{docFocus?<>Đang xem đoạn trích của <strong>{docFocus.code}</strong></>:<>Đang xem nguồn của <strong>{contextName}</strong></>}</span><button type="button" className="link-btn" onClick={showAllEvidence}>Hiện tất cả</button></p>}
  </div>

  <div className="drawer" key={`${evidence}-${matching?[...contextSources].join(","):"all"}`}>
  {evidence==='docs'&&<div role="tabpanel" id="panel-docs" aria-labelledby="tab-docs">
   {shownDocs.length>0&&<p className="panel-note">Hiệu lực chưa xác định</p>}
   {shownDocs.length>0&&<div className="doc-list">{visibleDocs.map(([title,date,desc])=>{const cited=citedBy(title);return <div className="document" key={title}>
    <div className="doc-top">
     <button type="button" className="doc-open doc-no" onClick={()=>openDocument(title,desc||NO_CONTENT,`Ngày ${date}`)}>{title}</button>
     <time>{date}</time>
    </div>
    {desc&&<p className="doc-description">{desc}</p>}
    {cited.length>0&&<button type="button" className="btn cited-btn" aria-label={`Xem ${cited.length} đoạn trích của ${title}: nguồn ${cited.join(', ')}`} onClick={()=>showDocSources(title,cited)}>Xem {cited.length} đoạn trích</button>}
   </div>})}
    {shownDocs.length>DOC_PREVIEW&&<button type="button" className="show-all" aria-expanded={allDocs} onClick={()=>setAllDocs(!allDocs)}>{allDocs?'Thu gọn danh sách':`Hiện tất cả ${shownDocs.length} văn bản`}</button>}
   </div>}
   {unitMatching&&!docFocus&&result.length>0&&!shownDocs.length&&<div className="empty"><p>Nguồn của {openGroups.length>1?'các đơn vị đang mở':'đơn vị này'} không có trong danh sách văn bản tìm thấy.</p></div>}
   {!result.length&&<div className="empty"><p>Không tìm thấy văn bản trong dữ liệu mẫu. Hãy đổi từ khóa hoặc xóa bộ lọc.</p><button type="button" className="btn" onClick={clearFilters}>Xóa bộ lọc</button></div>}
  </div>}

  {evidence==='sources'&&<div role="tabpanel" id="panel-sources" aria-labelledby="tab-sources">
   {sources.map(([title,,text],i)=>{const n=i+1;if(!shownSources.includes(n))return null;const uses=answers.filter(a=>a[1]===n).length;return <article id={`source-${n}`} aria-current={activeSource===n?'true':undefined} className={`excerpt ${activeSource===n?'active pulled':''}`} key={activeSource===n?`s${n}-${pull}`:`s${n}`}>
    <SourceHead n={n} title={title}/><SourceMeta index={i}/>
    <p className="excerpt-text"><span className="clamp">{text}</span></p>
    <div className="excerpt-actions"><button type="button" className="link-btn" onClick={()=>openDocument(title,text,sourceLine(i))}>Xem toàn bộ</button>{tab==='qa'&&showAnswer&&uses>0&&<button type="button" className="link-btn" onClick={()=>showPoints(n)}>Xem {uses} ý dùng nguồn này</button>}</div>
   </article>})}
  </div>}

  {evidence==='relations'&&<div role="tabpanel" id="panel-relations" aria-labelledby="tab-relations">
   {matching&&<p className="panel-note">Quan hệ không gắn với từng đơn vị nên luôn hiện tất cả.</p>}
   <label className="relation-toggle"><input type="checkbox" checked={second} onChange={e=>setSecond(e.target.checked)}/> Hiện cả quan hệ bước 2 <span className="muted">107 văn bản chỉ xuất hiện qua quan hệ.</span></label>
   {second&&<p className="muted" role="status">PDF không có dữ liệu chi tiết quan hệ bước 2. Cần kết nối kho văn bản để hiển thị.</p>}
   <div className="relation-list">{relationRows.map(row=><div className="relation-row" key={row.name}>
    <div className="relation-top"><button type="button" className="relation-name" onClick={()=>openCode(row.name)}>{row.name}</button>{row.external&&<span className="badge">ngoài kho</span>}</div>
    {[['Căn cứ vào văn bản này',row.basis],['Dẫn chiếu văn bản này',row.cited]].filter(([,refs])=>refs).map(([label,refs])=><p key={label}>{label}: {refs.split(', ').map((code,k)=><React.Fragment key={code}>{k>0&&', '}<button type="button" className="ref" onClick={()=>openCode(code)}>{code}</button></React.Fragment>)}</p>)}
   </div>)}</div>
  </div>}
  </div>
 </aside>
 </div>

 <dialog aria-labelledby="document-title" ref={dialog} onClick={e=>{if(e.target===dialog.current)dialog.current.close()}}>
  <div className="dialog-heading"><h2 id="document-title">{selected?.title}</h2><button type="button" className="btn" onClick={()=>dialog.current.close()}>Đóng</button></div>
  <p className="dialog-meta">{selected?.meta?`${selected.meta} `:''}Trích đoạn được hiển thị trong PDF mẫu.</p>
  <div id="dialog-content">{selected?.content}</div>
  <p className="dialog-foot">Bản giao diện mẫu chưa kết nối kho văn bản gốc.</p>
 </dialog>
 </main>
}
createRoot(document.getElementById('root')).render(<App/>);
