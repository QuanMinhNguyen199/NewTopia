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

// Ba bề rộng: ≥1100px bằng chứng nằm cột phải (thu gọn được); 768–1099px bằng chứng là panel trượt từ phải;
// <768px một cột, trích dẫn mở ngay dưới ý.
const WIDE='(min-width: 1100px)',SPLIT='(min-width: 768px)';
function useMedia(query){
 const [match,setMatch]=useState(()=>window.matchMedia(query).matches);
 // Nghe thêm resize: sự kiện change của matchMedia có thể bị bỏ lỡ khi kích thước đổi liên tiếp.
 useEffect(()=>{
  const media=window.matchMedia(query),update=()=>setMatch(media.matches);
  media.addEventListener('change',update);window.addEventListener('resize',update);update();
  return()=>{media.removeEventListener('change',update);window.removeEventListener('resize',update)};
 },[query]);
 return match;
}
// Chế độ nhúng: trang nằm trong khung chat GeoAgent (iframe), hoặc mở với ?embed. Không có đầu trang và thanh câu hỏi
// vì câu hỏi đã là tin nhắn trong chat; bố cục tính theo bề rộng khung nhúng. ?mode=report mở thẳng báo cáo tổng hợp.
const params=new URLSearchParams(location.search);
const EMBED=params.has('embed')||window.self!==window.top;
const START_TAB=params.get('mode')==='report'?'report':'qa';
const EMBED_WIDE='(min-width: 720px)';
// Chiều cao nội dung gửi cho GeoAgent để khung iframe co giãn theo. Nên đặt VITE_GEOAGENT_ORIGIN khi có địa chỉ thật.
const HOST_ORIGIN=import.meta.env.VITE_GEOAGENT_ORIGIN||'*';
const DOCKED_KEY='van-ban:evidence-docked';
const readDocked=()=>{try{return localStorage.getItem(DOCKED_KEY)!=='0'}catch{return true}};

// Số chú thích: từ 768px chuyển phần bằng chứng sang nguồn (bấm lại để bỏ chọn); màn hẹp mở đoạn trích tại chỗ.
function Cite({item,open,onToggle,split,active}){
 const title=sources[item.src-1][0];
 return split
  ?<button type="button" className={`cite ${active?'is-active':''}`} aria-controls={`source-${item.src}`} aria-label={`${active?'Bỏ chọn':'Xem'} nguồn ${item.src}: ${title}, ở phần bằng chứng`} title={`Nguồn ${item.src}: ${title}`} onClick={onToggle}>[{item.src}]</button>
  :<button type="button" className="cite" aria-expanded={open} aria-controls={`cite-${item.id}`} aria-label={`${open?'Ẩn':'Xem'} nguồn ${item.src}: ${title}`} onClick={onToggle}>[{item.src}]</button>;
}
function Bullet(props){
 const {item,open,split,active,openDocument}=props;
 const [title,,text]=sources[item.src-1];
 return <li id={`point-${item.id}`} tabIndex={-1} className={active?'active':undefined}>
  {item.text}<Cite {...props}/>
  {open&&!split&&<div className="excerpt inline" id={`cite-${item.id}`}>
   <SourceHead n={item.src} title={title}/>
   <SourceMeta index={item.src-1}/>
   <p className="excerpt-text"><span className="clamp">{text}</span></p>
   <button type="button" className="link-btn" onClick={()=>openDocument(title,text,sourceLine(item.src-1))}>Xem toàn bộ</button>
  </div>}
 </li>;
}

function App(){
 const [tab,setTab]=useState(START_TAB),[question,setQuestion]=useState('việc triển khai Nghị quyết 57 như thế nào'),[user,setUser]=useState('leader');
 const [keyword,setKeyword]=useState(''),[kind,setKind]=useState(''),[from,setFrom]=useState(''),[to,setTo]=useState('');
 const [auto,setAuto]=useState(true),[llm,setLlm]=useState(true),[showAnswer,setShowAnswer]=useState(true),[second,setSecond]=useState(false);
 const [notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[result,setResult]=useState(documents),[selected,setSelected]=useState(null);
 const [expanded,setExpanded]=useState([groups[0].unit]),[openCite,setOpenCite]=useState(null),[evidence,setEvidence]=useState('docs'),[allDocs,setAllDocs]=useState(false);
 const [activeSource,setActiveSource]=useState(null),[pull,setPull]=useState(0),[evidenceAll,setEvidenceAll]=useState(true),[docFocus,setDocFocus]=useState(null),[announce,setAnnounce]=useState('');
 const wideScreen=useMedia(WIDE),splitScreen=useMedia(SPLIT),wideEmbed=useMedia(EMBED_WIDE);
 const wide=EMBED?wideEmbed:wideScreen,split=EMBED?wideEmbed:splitScreen;
 // Đã có kết quả thì khối câu hỏi thu thành một thanh; "applied" là câu hỏi và bộ lọc của kết quả đang hiện.
 const [editing,setEditing]=useState(false),[applied,setApplied]=useState({question,keyword,kind,from,to});
 const [docking,setDocking]=useState(false),[docked,setDocked]=useState(readDocked),[panelOpen,setPanelOpen]=useState(false);
 const dialog=useRef(null),questionField=useRef(null),evidenceTablist=useRef(null),editButton=useRef(null),railButton=useRef(null),opener=useRef(null),reportHeight=useRef(null),draft=useRef(null);
 const solo=tab==='qa'&&!showAnswer;
 // Dưới 1100px (không nhúng): bằng chứng là panel trượt từ phải, mở bằng dải bám mép phải. Trang không có câu trả lời thì để bằng chứng nằm trong trang.
 const panel=!EMBED&&!wide&&!solo;
 const evidenceShown=wide?docked||solo:panel?panelOpen:true;
 const behind=panel&&panelOpen;
 // Vạch mực dưới tab bằng chứng: đo tab đang chọn để vạch trượt tới đúng vị trí và độ rộng.
 const [ink,setInk]=useState({x:0,w:0});
 useLayoutEffect(()=>{
  const measure=()=>{const tab=evidenceTablist.current?.querySelector('[aria-selected="true"]');if(tab)setInk({x:tab.offsetLeft,w:tab.offsetWidth})};
  measure();window.addEventListener('resize',measure);document.fonts?.ready.then(measure);
  return()=>window.removeEventListener('resize',measure);
 },[evidence,wide,result.length,expanded,evidenceAll,evidenceShown]);
 // Ô câu hỏi tự giãn theo nội dung, mặc định một dòng bằng chiều cao nút Hỏi.
 useEffect(()=>{const el=questionField.current;if(!el)return;el.style.height='auto';el.style.height=`${el.scrollHeight+2}px`},[question,wide,editing]);
 // Thanh câu hỏi: cuộn xuống để đọc thì trượt khuất, cuộn lên thì hiện lại. Ở đầu trang luôn hiện.
 const [barHidden,setBarHidden]=useState(false);
 useEffect(()=>{
  if(EMBED||editing){setBarHidden(false);return}
  let last=window.scrollY;
  const onScroll=()=>{
   const y=window.scrollY,delta=y-last;
   if(y<80)setBarHidden(false);
   else if(delta>8&&!document.querySelector('.query-bar')?.contains(document.activeElement))setBarHidden(true);
   else if(delta<-8)setBarHidden(false);
   if(Math.abs(delta)>8||y<80)last=y;
  };
  window.addEventListener('scroll',onScroll,{passive:true});
  return()=>window.removeEventListener('scroll',onScroll);
 },[editing]);
 // Panel bằng chứng (dưới 1100px): mở thì đưa focus vào panel.
 useEffect(()=>{if(behind)document.getElementById('evidence')?.focus({preventScroll:true})},[behind]);
 const filterCount=[keyword,kind,from,to].filter(Boolean).length;
 const appliedFilters=[applied.keyword,applied.kind,applied.from,applied.to].filter(Boolean).length;
 const allOpen=expanded.length===groups.length;

 // Mở lại form: nếu lần trước bấm ra ngoài khi đang gõ dở thì khôi phục bản gõ dở.
 function editQuestion(){
  const d=draft.current;draft.current=null;
  if(d){setQuestion(d.question);setKeyword(d.keyword);setKind(d.kind);setFrom(d.from);setTo(d.to)}
  setEditing(true);requestAnimationFrame(()=>{const el=questionField.current;if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length)}});
 }
 // Trả câu hỏi và bộ lọc về đúng những gì kết quả đang hiện dựa trên.
 function restoreApplied(){setQuestion(applied.question);setKeyword(applied.keyword);setKind(applied.kind);setFrom(applied.from);setTo(applied.to);setEditing(false);setNotice('')}
 // Hủy sửa (nút hoặc Esc): bỏ hẳn bản gõ dở, focus về nút Sửa câu hỏi.
 function cancelEdit(){draft.current=null;restoreApplied();requestAnimationFrame(()=>editButton.current?.focus())}
 // Bấm ra ngoài khối tìm kiếm khi đang sửa: thu form lại như Hủy sửa, nhưng giữ bản gõ dở cho lần mở sau và không giành focus.
 // Nghe sự kiện click (sau khi thả chuột) để form thu lại không làm lệch chỗ người dùng vừa bấm.
 useEffect(()=>{
  if(!editing||EMBED||!result)return;
  const onClick=e=>{
   const t=e.target;
   if(!(t instanceof Element)||!t.isConnected||t.closest('.query, header, nav, dialog'))return;
   const current={question,keyword,kind,from,to};
   draft.current=Object.keys(current).some(k=>current[k]!==applied[k])?current:null;
   restoreApplied();
  };
  document.addEventListener('click',onClick);
  return()=>document.removeEventListener('click',onClick);
 });
 function dock(open){setDocked(open);setDocking(open);try{localStorage.setItem(DOCKED_KEY,open?'1':'0')}catch{}}
 function openEvidence(){
  if(wide&&!docked)dock(true);
  if(panel&&!panelOpen){opener.current=document.activeElement;setPanelOpen(true)}
 }
 function closePanel(){setPanelOpen(false);requestAnimationFrame(()=>(opener.current?.isConnected?opener.current:railButton.current)?.focus())}
 function collapseEvidence(){dock(false);requestAnimationFrame(()=>railButton.current?.focus())}
 // Khi nhúng, khung iframe cao bằng nội dung nên hộp văn bản phải mở cạnh chỗ vừa bấm, không phải giữa khung.
 function openDocument(title,content,meta){
  setSelected({title,content,meta});
  if(EMBED){const r=document.activeElement?.getBoundingClientRect();dialog.current.style.top=`${Math.max(8,Math.round((r?.top??0)+window.scrollY-24))}px`}
  dialog.current.showModal();reportHeight.current?.();
 }
 useEffect(()=>{
  if(!EMBED||window.parent===window)return;
  let last=0;
  const report=()=>{const d=dialog.current,h=Math.ceil(Math.max(document.body.getBoundingClientRect().height,d?.open?d.offsetTop+d.offsetHeight+16:0));if(h!==last){last=h;window.parent.postMessage({type:'van-ban/resize',version:1,height:h},HOST_ORIGIN)}};
  reportHeight.current=report;
  const observer=new ResizeObserver(report);observer.observe(document.body);observer.observe(dialog.current);report();
  return()=>observer.disconnect();
 },[]);
 function openCode(code){const doc=findDocument(code);openDocument(code,doc?.[2]||NO_CONTENT,doc?`Ngày ${doc[1]}`:'')}
 // Trái → phải: [n] chuyển phần bằng chứng sang nguồn n (mở lại nếu đang thu gọn); chỉ cuộn bên trong phần đó. Bấm lại để bỏ chọn.
 function showSource(n,fromAnswer=true){
  if(activeSource===n&&evidenceShown){setActiveSource(null);setAnnounce(`Đã bỏ chọn nguồn ${n}.`);return}
  openEvidence();
  setEvidence('sources');setActiveSource(n);setPull(p=>p+1);setEvidenceAll(!fromAnswer);setDocFocus(null);setAnnounce(`Đang hiển thị nguồn ${n}: ${sources[n-1][0]}, ở phần bằng chứng.`);
  requestAnimationFrame(()=>{
   const slip=document.getElementById(`source-${n}`);
   if(!slip)return;
   const behavior=window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
   if(wide||panel){const column=document.querySelector('.evidence'),head=column.querySelector('.evidence-head');column.scrollTo({top:slip.offsetTop-head.offsetHeight-12,behavior})}
   else slip.scrollIntoView({block:'start',behavior});
  });
 }
 // Phải → trái: mở các đơn vị dùng nguồn n, đánh dấu và chuyển focus tới ý đầu tiên. Panel (dưới 1100px) đóng lại để thấy ý.
 function showPoints(n){
  setActiveSource(n);
  if(panel)setPanelOpen(false);
  const units=groups.filter(g=>g.items.some(i=>i.src===n)).map(g=>g.unit),count=answers.filter(a=>a[1]===n).length;
  setExpanded([...new Set([...expanded,...units])]);
  setAnnounce(`Đã mở ${count} ý dùng nguồn ${n}.`);
  const first=answers.findIndex(a=>a[1]===n);
  if(first>=0)requestAnimationFrame(()=>requestAnimationFrame(()=>document.getElementById(`point-${first}`)?.focus()));
 }
 const toggleCite=(id,src)=>split?showSource(src):setOpenCite(openCite===id?null:id);
 const bulletProps=item=>({item,split,open:openCite===item.id,active:split&&evidenceShown&&activeSource===item.src,onToggle:()=>toggleCite(item.id,item.src),openDocument});
 const toggleGroup=unit=>{if(!expanded.includes(unit)){setEvidenceAll(false);setDocFocus(null)}setExpanded(expanded.includes(unit)?expanded.filter(u=>u!==unit):[...expanded,unit])};

 // Từ danh sách văn bản: mở tab Đoạn nguồn, chỉ hiện các tờ trích của văn bản đó và rút tờ đầu tiên.
 function showDocSources(code,list){
  setDocFocus({code,list});setEvidence('sources');setActiveSource(list[0]);setPull(p=>p+1);
  setAnnounce(`Đang xem ${list.length} đoạn trích của ${code}.`);
  requestAnimationFrame(()=>{
   const behavior=window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
   if(wide||panel)document.querySelector('.evidence').scrollTo({top:0,behavior});
   else document.getElementById('evidence')?.scrollIntoView({block:'start',behavior});
  });
 }
 const showAllEvidence=()=>{setEvidenceAll(true);setDocFocus(null)};
 function clearFilters(){setDocFocus(null);setKeyword('');setKind('');setFrom('');setTo('');setApplied(a=>({...a,keyword:'',kind:'',from:'',to:''}));setResult(documents);setNotice('Đã xóa bộ lọc.')}
 // Bấm Hỏi là thu đầu trang ngay, không đợi kết quả; focus về nút Sửa câu hỏi để không mất vị trí bàn phím.
 function search(event){event.preventDefault();if(from&&to&&from>to){setNotice('Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.');return}setBusy(true);setNotice('Đang lọc dữ liệu mẫu…');
  setApplied({question,keyword,kind,from,to});setEditing(false);requestAnimationFrame(()=>editButton.current?.focus());
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
 const unitMatching=wide&&evidenceShown&&tab==='qa'&&showAnswer&&!evidenceAll&&openGroups.length>0&&!allOpen;
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

 const identity=user==='leader'?'lanh_dao_tp: 177 đơn vị, mức mật tối đa tuyet_mat':user==='staff'?'chuyen_vien: người dùng giả lập — chưa kết nối phân quyền':'lanh_dao_don_vi: người dùng giả lập — chưa kết nối phân quyền';
 const userSelect=<select value={user} onChange={e=>setUser(e.target.value)}><option value="leader">Lãnh đạo thành phố</option><option value="staff">Chuyên viên</option><option value="unit">Lãnh đạo đơn vị</option></select>;
 const modeNav=<nav aria-label="Chế độ tra cứu" inert={behind}><div role="tablist" aria-label="Chế độ tra cứu" onKeyDown={e=>moveTab(e,['qa','report'],tab,selectMode)}>
  {[['qa','Hỏi đáp'],['report','Báo cáo tổng hợp']].map(([id,title])=><button key={id} type="button" role="tab" id={`tab-${id}`} aria-selected={tab===id} aria-controls="results" tabIndex={tab===id?0:-1} className="tab" onClick={()=>selectMode(id)}>{title}</button>)}
 </div></nav>;

 return <main className={EMBED?`embed ${wide?'embed-wide':''}`:editing?undefined:`compact ${barHidden?'bar-hidden':''}`}>
 {/* Khi đang sửa câu hỏi: đầu trang đầy đủ. Khi đang tìm hoặc đã có kết quả: gộp vào thanh câu hỏi. */}
 {EMBED?<><h1 className="sr-only">Tra cứu và tổng hợp văn bản</h1><p className="embed-note">Dữ liệu mẫu chép từ PDF, chưa kết nối API tra cứu hoặc LLM.</p></>
 :editing?<>
 <header inert={behind}>
  <div className="brand"><h1>Tra cứu và tổng hợp văn bản</h1><p>Bản demo. Chưa có Keycloak nên chọn người dùng giả lập, mọi lượt vẫn qua Adapter quyền.</p><p id="identity">{identity}</p></div>
  <label className="user">Người dùng giả lập{userSelect}</label>
 </header>
 {modeNav}
 </>:<h1 className="sr-only">Tra cứu và tổng hợp văn bản</h1>}

 {!EMBED&&(editing?<form onSubmit={search} className="query" onKeyDown={e=>{if(e.key==='Escape'&&e.target.tagName!=='SELECT'){e.preventDefault();cancelEdit()}}}>
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
   <button type="button" className="link-btn" onClick={cancelEdit}>Hủy sửa</button>
   <span className="timing" title="Thời gian được hiển thị trong PDF mẫu">Tìm 0.522s, LLM 8.927s</span>
  </div>
 </form>
 // Thanh câu hỏi: chế độ tra cứu, câu hỏi đang được trả lời, người dùng giả lập; bám đầu trang khi cuộn.
 :<div className={`query-bar ${barHidden?'is-hidden':''}`} inert={behind} onFocus={()=>setBarHidden(false)}>
  {modeNav}
  <p className="query-text" title={applied.question} onClick={editQuestion}><span className="sr-only">Câu hỏi đang xem: </span>{applied.question}</p>
  {appliedFilters>0&&<p className="query-filters">Bộ lọc ({appliedFilters})<button type="button" className="link-btn" onClick={clearFilters}>Xóa bộ lọc</button></p>}
  {busy?<span className="timing">Đang tìm…</span>:<span className="timing" title="Thời gian được hiển thị trong PDF mẫu">Tìm 0.522s, LLM 8.927s</span>}
  <button type="button" className="btn" ref={editButton} onClick={editQuestion}>Sửa câu hỏi</button>
  <label className="user-compact" title={identity}><span className="sr-only">Người dùng giả lập</span>{userSelect}</label>
 </div>)}
 {notice&&<p id="notice" role="status" inert={behind}>{notice}</p>}

 <p className="sr-only" aria-live="polite">{announce}</p>
 <div id="results" role={EMBED?undefined:'tabpanel'} aria-labelledby={EMBED?undefined:`tab-${tab}`} aria-busy={busy||undefined} className={`results ${solo?'solo':''} ${wide&&!evidenceShown?'railed':''}`}>
 {!panel&&evidenceShown&&<a className="skip-link" href="#evidence">Chuyển tới phần bằng chứng</a>}
 {tab==='qa'&&showAnswer&&<section className="answer" aria-labelledby="answer-title" inert={behind}>
  <div className="section-head"><h2 id="answer-title">Câu trả lời</h2>
   <button type="button" className="link-btn" aria-expanded={allOpen} onClick={()=>setExpanded(allOpen?[groups[0].unit]:groups.map(g=>g.unit))}>{allOpen?'Thu gọn tất cả':`Mở cả ${answers.length} ý`}</button>
  </div>
  <div className="unit-list">{groups.map(renderUnit)}</div>
  <p className="footnote">1 ý bị bỏ vì không có nguồn hợp lệ.</p>
 </section>}

 {tab==='report'&&<section className="answer" aria-labelledby="report-title" inert={behind}>
  <div className="section-head"><h2 id="report-title">Báo cáo tổng hợp</h2></div>
  <p className="report-lead">Tổng hợp {result.length} văn bản mẫu về triển khai Nghị quyết 57.</p>
  <ul className="report-list">{reportItems.map(item=><Bullet key={item.id} {...bulletProps(item)}/>)}</ul>
  <button type="button" className="btn" onClick={downloadReport}><Icon name="download"/>Tải báo cáo</button>
 </section>}

 {behind&&<div className="scrim" aria-hidden="true" onClick={closePanel}/>}
 <aside className={`evidence ${behind?'is-open':''} ${docking&&wide?'docking':''}`} onAnimationEnd={e=>{if(e.target===e.currentTarget)setDocking(false)}} id="evidence" tabIndex={-1} aria-labelledby="evidence-title" hidden={wide&&!evidenceShown}
  role={panel?'dialog':undefined} aria-modal={behind||undefined}
  onKeyDown={e=>{if(panel&&e.key==='Escape'){e.stopPropagation();closePanel()}}}>
  <div className="evidence-head">
   <div className="section-head"><h2 id="evidence-title">Bằng chứng</h2>
    {wide&&!solo&&<button type="button" className="link-btn" aria-expanded="true" aria-controls="evidence" onClick={collapseEvidence}>Thu gọn</button>}
    {panel&&<button type="button" className="btn" onClick={closePanel}>Đóng</button>}
   </div>
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
 {/* Dải bằng chứng: ≥1100px (hoặc khung nhúng ≥720px) khi đã thu gọn; dưới 1100px khi panel đóng. */}
 {!evidenceShown&&<button type="button" ref={railButton} className="evidence-rail" aria-expanded="false" aria-controls="evidence"
  aria-label={`Mở bằng chứng: ${result.length} văn bản, ${sources.length} đoạn nguồn`} title={`${result.length} văn bản, ${sources.length} đoạn nguồn`}
  onClick={()=>{openEvidence();if(wide)requestAnimationFrame(()=>document.getElementById('evidence')?.focus({preventScroll:true}))}}>
  <span className="rail-label">Bằng chứng</span><span className="count">{result.length}</span>
 </button>}
 </div>

 <dialog aria-labelledby="document-title" ref={dialog} onClose={()=>reportHeight.current?.()} onClick={e=>{if(e.target===dialog.current)dialog.current.close()}}>
  <div className="dialog-heading"><h2 id="document-title">{selected?.title}</h2><button type="button" className="btn" onClick={()=>dialog.current.close()}>Đóng</button></div>
  <p className="dialog-meta">{selected?.meta?`${selected.meta} `:''}Trích đoạn được hiển thị trong PDF mẫu.</p>
  <div id="dialog-content">{selected?.content}</div>
  <p className="dialog-foot">Bản giao diện mẫu chưa kết nối kho văn bản gốc.</p>
 </dialog>
 </main>
}
createRoot(document.getElementById('root')).render(<App/>);
