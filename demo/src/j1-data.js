'use strict';
/* ---------- helpers ---------- */
const $=(s,r)=>(r||document).querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const m2=n=>Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const u=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:2});
const now=()=>Date.now();
const DAY=86400000;
const clock=t=>new Date(t).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
const dstr=t=>new Date(t).toLocaleDateString('en-GB',{day:'numeric',month:'short'});
const dtime=t=>dstr(t)+', '+clock(t);
const dur=ms=>{const s=Math.max(0,Math.round(ms/1000));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return h?`${h}h ${m}m`:`${m}:${String(x).padStart(2,'0')}`};
const ago=t=>{const s=Math.round((now()-t)/1000);return s<45?'just now':s<3600?Math.max(1,Math.round(s/60))+' min ago':s<86400?Math.round(s/3600)+' h ago':Math.round(s/86400)+' d ago'};
const wide=()=>innerWidth>=1200;
const phone=()=>innerWidth<=760;
const img=n=>`img/${n}.jpg`;
const hero=(art,eb,title,text,extra,big)=>`<section class="hero${big?'':' sm'}"><div class="hero-art" style="background-image:url(${img(art)})" aria-hidden="true"></div><div class="hero-t"><p class="eyebrow">${esc(eb)}</p><h1>${title}</h1>${text?`<p>${text}</p>`:''}${extra||''}</div></section>`;
const P={
  home:'M3 11l9-7 9 7M5 10v10h5v-6h4v6h5V10',
  list:'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01',
  wallet:'M3 7h18v12H3zM3 7l3-3h12l3 3M16 13h2',
  send:'M21 4 3 11l6 2 2 6 3-4 5 4z',
  shield:'M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z',
  shieldok:'M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6zM9 12l2 2 4-4',
  search:'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
  help:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01',
  star:'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z',
  pin:'M9 4h6l-1 5 3 3H7l3-3zM12 12v8',
  filter:'M4 5h16l-6 7v6l-4 2v-8z',
  info:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01',
  x:'M6 6l12 12M18 6L6 18',
  plus:'M12 5v14M5 12h14',
  minus:'M5 12h14',
  chevD:'M6 9l6 6 6-6',chevR:'M9 6l6 6-6 6',chevL:'M15 6l-6 6 6 6',chevU:'M6 15l6-6 6 6',
  chat:'M4 5h16v11H10l-5 4v-4H4z',
  bot:'M4 5h16v11H10l-5 4v-4H4zM8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01',
  clip:'M20 11.5l-7.8 7.8a5 5 0 0 1-7.1-7.1l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4L15 6.9',
  user:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20a7.5 7.5 0 0 1 15 0',
  users:'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 7.5M18 14a6 6 0 0 1 4 7',
  lock:'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  check:'M5 12.5l4.5 4.5L19 7.5',
  clock:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  copy:'M9 9h11v11H9zM5 15H4V4h11v1',
  alert:'M12 4l9 16H3zM12 10v4M12 17h.01',
  refresh:'M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7',
  down:'M12 4v12M6 11l6 6 6-6M5 20h14',
  up:'M12 20V8M6 13l6-6 6 6M5 4h14',
  image:'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15.5 9h.01',
  pay:'M3 7h18v10H3zM3 11h18M7 15h3',
  undo:'M9 14l-5-5 5-5M4 9h10a6 6 0 0 1 0 12h-3',
  swap:'M7 7h11l-3-3M17 17H6l3 3',
  receipt:'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6',
  mega:'M4 10v4h3l7 4V6L7 10zM18 9.5a3.5 3.5 0 0 1 0 5',
  trend:'M3 17l6-6 4 4 8-8M15 7h6v6',
  bell:'M6 16V11a6 6 0 1 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0',
  key:'M15.5 7.5l3 3L22 7l-3-3M21 2l-9.6 9.6M11.4 11.6a5.5 5.5 0 1 1-7.8 7.8 5.5 5.5 0 0 1 7.8-7.8z',
  gift:'M3 8h18v4H3zM5 12v9h14v-9M12 8v13M12 8S10.5 3 8 4s-1 4 4 4zm0 0s1.5-5 4-4 1 4-4 4z',
  device:'M7 3h10v18H7zM11 18h2',
  logout:'M9 4H5v16h4M14 8l4 4-4 4M18 12H8',
  eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  ban:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM5.6 5.6l12.8 12.8',
  flag:'M5 21V4h12l-2 4 2 4H5',
  book:'M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z',
  doc:'M6 3h9l4 4v14H6zM14 3v5h5M9 13h6M9 17h6',
  bank:'M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18',
  link:'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  camera:'M4 8h3l2-3h6l2 3h3v11H4zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
  id:'M3 5h18v14H3zM7 10a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM6 16c.5-1.5 2-2 3-2s2.5.5 3 2M14 9h4M14 13h4',
  globe:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18',
  edit:'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  trash:'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  more:'M11 5a1 1 0 1 0 2 0 1 1 0 0 0-2 0zM11 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0zM11 19a1 1 0 1 0 2 0 1 1 0 0 0-2 0z',
  zap:'M13 3L4 14h7l-1 7 9-11h-7z',
  snow:'M12 2v20M4 6l16 12M20 6L4 18',
  store:'M4 9l1-5h14l1 5M4 9h16v11H4zM10 20v-5h4v5',
  chart:'M4 20V10M10 20V4M16 20v-7M22 20H2',
  mail:'M3 5h18v14H3zM3 6l9 7 9-7',
  thumb:'M7 10v10H4V10zM7 10l4-7a2 2 0 0 1 3 2l-1 4h6a2 2 0 0 1 2 2.3l-1.4 7A2 2 0 0 1 17.6 20H7',
  spark:'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z',
  gear:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z'
};
const ico=(n,s,c)=>`<svg class="i${c?' '+c:''}" viewBox="0 0 24 24" width="${s||16}" height="${s||16}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[n]}"/></svg>`;
const initial=id=>id==='you'?'Y':id==='admin'?'A':id==='agent'?'S':String(id)[0].toUpperCase();
const av=(id,c)=>`<span class="av${c?' '+c:''}" aria-hidden="true">${esc(initial(id))}</span>`;
const avp=(id,c)=>{const t=id==='you'?ME:T.find(x=>x.id===id);return `<span class="avw">${av(id,c)}${t?`<span class="pres${t.online?' on':''}" title="${t.online?'Online':'Away'}"></span>`:''}</span>`};
const idok=`<span class="idok" title="ID checked">${ico('check',10)}<span class="sr">ID checked</span></span>`;
const mbadge=`<span class="mbadge" title="Verified merchant">${ico('shieldok',11)}Merchant</span>`;
const stars=r=>`<span class="stars">${ico('star',13,'fill')}${r.toFixed(1)}</span>`;
const nm=id=>id==='you'?'You':id==='agent'?'Support':id;
const ST={open:['Open','p-open'],locked:['Locked','p-lock'],paid:['Paid','p-paid'],disputed:['Appeal','p-bad'],done:['Done','p-done'],refunded:['Returned','p-low'],cancelled:['Cancelled','p-low'],expired:['Expired','p-low']};
const pill=st=>`<span class="pill ${ST[st][1]}">${ST[st][0]}</span>`;
const pl=(text,cls,nd)=>`<span class="pill ${cls}${nd?' nd':''}">${esc(text)}</span>`;
const AL={critical:'alert',high:'alert',warning:'alert',moderate:'info',low:'info',info:'info',positive:'check'};
const alertHTML=(lvl,text,head)=>`<div class="alert a-${lvl}" role="${lvl==='critical'?'alert':'status'}">${ico(AL[lvl],16)}<div>${head?`<b>${esc(head)}</b> `:''}${text}</div></div>`;
const ro=(label,val,copy)=>`<div class="fld"><span class="lbl">${esc(label)}</span><div class="ro"><span>${esc(val)}</span>${copy?`<button class="ib" data-a="copy" data-x="${esc(val)}" aria-label="Copy ${esc(label)}">${ico('copy',14)}</button>`:''}</div></div>`;
const opts=(arr,val)=>arr.map(o=>{const [v,l]=Array.isArray(o)?o:[o,o];return `<option value="${esc(v)}"${String(v)===String(val)?' selected':''}>${esc(l)}</option>`}).join('');
const fsel=(id,label,arr,val,req)=>`<div class="fld"><label class="lbl${req?' req':''}" for="${id}">${esc(label)}</label><select class="in" id="${id}">${opts(arr,val)}</select></div>`;
const finp=(id,label,val,o)=>{o=o||{};return `<div class="fld${o.wide?' wide':''}"><label class="lbl${o.req?' req':''}" for="${id}">${esc(label)}</label><input class="in${o.num?' num':''}" id="${id}" value="${esc(val)}"${o.num?' inputmode="decimal"':''}${o.ph?` placeholder="${esc(o.ph)}"`:''} autocomplete="off">${o.hint?`<span class="small muted">${o.hint}</span>`:''}</div>`};
const tsw=(on,a,x,label)=>`<button class="tsw${on?' on':''}" data-a="${a}" data-x="${esc(x)}" aria-pressed="${!!on}"><span class="sw" aria-hidden="true"></span>${label!=null?esc(label):`<span class="sr">${on?'On':'Off'}</span>`}</button>`;
const emptyHTML=(pic,title,text,btn)=>`<div class="es"><span class="es-ic">${ico(pic==='dispute'?'shield':'list',26)}</span><b>${esc(title)}</b>${text?`<p>${text}</p>`:''}${btn||''}</div>`;
function spark(arr){const w=220,h=40,mn=Math.min(...arr),mx=Math.max(...arr),r=(mx-mn)||1;const d=arr.map((v,i)=>(i?'L':'M')+(i/(arr.length-1)*w).toFixed(1)+' '+(h-4-(v-mn)/r*(h-8)).toFixed(1)).join(' ');return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path class="sp-a" d="${d} L ${w} ${h} L 0 ${h} Z"/><path class="sp-l" d="${d}"/></svg>`}
let seed=7;const rnd=n=>{seed=(seed*9301+49297)%233280;return Math.floor(seed/233280*n)};
const pick=(a,i)=>a[((i%a.length)+a.length)%a.length];

/* ---------- traders ---------- */
const CUR={LC:{market:3.65,name:'LC (local)'},USD:{market:1.0,name:'USD'}};
const METHODS=['Bank transfer','Instant transfer','Mobile money','Cash deposit'];
const MICON={'Bank transfer':'bank','Instant transfer':'zap','Mobile money':'device','Cash deposit':'pay'};
const BANKS=['National Bank','Union Bank','First City Bank'],CITIES=['Capital City','Port Town','Hill City'];
const HOURS=[['any','Any time'],['9-21','9:00 – 21:00'],['9-18','9:00 – 18:00'],['18-2','18:00 – 02:00']];
const inHours=o=>{if(!o.hours||o.hours==='any')return true;const [a,b]=o.hours.split('-').map(Number),h=new Date().getHours();return a<b?h>=a&&h<b:h>=a||h<b};
const hoursLabel=o=>(HOURS.find(h=>h[0]===(o.hours||'any'))||HOURS[0])[1];
/* phone numbers, links and "move to another app" requests are blocked in order chats */
const SCAMRX=/(\+?\d[\d\s-]{7,}\d)|(https?:\/\/|t\.me\/|wa\.me|www\.)|(whats ?app|signal app|dm me|message me on|call me|telegram me)/i;
/* ads that usually move stolen money, the main cause of frozen bank accounts */
const BANNED=/(card bill|cc bill|credit card|gift ?card|loan|clean money|black money|cash ?out|bill payment)/i;
const T=[
  {id:'northdesk',rating:5.0,reviews:980,trades:3105,vol:1840000,done:99.8,rel:2,pay:4,since:'Feb 2026',bank:'Union Bank',holder:'North Desk LLC',acct:'7710 0042 8812',merchant:true,online:true,t30:412,kyc:2,risk:12,pos:99.6},
  {id:'amir_k',rating:4.9,reviews:412,trades:1240,vol:486000,done:99.4,rel:4,pay:6,since:'Mar 2026',bank:'National Bank',holder:'Amir K.',acct:'0021 4471 9930',merchant:true,online:true,t30:188,kyc:2,risk:18,pos:99.1},
  {id:'lina_trade',rating:4.8,reviews:230,trades:640,vol:212000,done:98.9,rel:6,pay:7,since:'Apr 2026',bank:'First City Bank',holder:'Lina M.',acct:'1180 2231 0045',merchant:false,online:true,t30:96,kyc:2,risk:22,pos:98.7},
  {id:'maya',rating:4.9,reviews:301,trades:870,vol:305000,done:99.1,rel:3,pay:5,since:'Mar 2026',bank:'National Bank',holder:'Maya R.',acct:'0021 9902 3317',merchant:true,online:true,t30:140,kyc:2,risk:15,pos:99.3},
  {id:'sami_otc',rating:4.7,reviews:158,trades:420,vol:390000,done:98.2,rel:7,pay:8,since:'May 2026',bank:'Union Bank',holder:'Sami O.',acct:'7710 5521 0090',merchant:false,online:false,t30:51,kyc:2,risk:48,pos:97.9},
  {id:'delta_fx',rating:4.6,reviews:96,trades:233,vol:120000,done:97.5,rel:9,pay:9,since:'Jun 2026',bank:'First City Bank',holder:'Delta FX',acct:'1180 7741 2208',merchant:false,online:true,t30:40,kyc:1,risk:55,pos:96.8},
  {id:'jon_b',rating:4.8,reviews:188,trades:505,vol:150000,done:99.0,rel:5,pay:6,since:'Apr 2026',bank:'National Bank',holder:'Jon B.',acct:'0021 3310 8876',merchant:false,online:false,t30:77,kyc:2,risk:20,pos:98.9},
  {id:'river',rating:4.5,reviews:61,trades:140,vol:48000,done:96.4,rel:11,pay:12,since:'Aug 2026',bank:'Union Bank',holder:'River T.',acct:'7710 1199 4420',merchant:false,online:true,t30:23,kyc:1,risk:71,pos:95.2},
  {id:'kai_new',rating:5.0,reviews:2,trades:3,vol:900,done:100,rel:12,pay:10,since:'Nov 2026',bank:'First City Bank',holder:'Kai N.',acct:'1180 4410 7781',merchant:false,online:true,t30:3,kyc:1,risk:64,pos:100,newbie:true,days:3}
];
const TX={northdesk:['Capital City',1,0],amir_k:['Port Town',2,0],lina_trade:['Capital City',3,0],maya:['Hill City',2,0],sami_otc:['Port Town',6,1],delta_fx:['Capital City',8,2],jon_b:['Hill City',4,0],river:['Port Town',9,3],kai_new:['Port Town',5,0]};
T.forEach(t=>{const x=TX[t.id];t.city=x[0];t.resp=x[1];t.lost=x[2]});
const NEW_CAP=500;/* USDT per order for accounts under 10 finished orders */
const REVS=['Paid fast, smooth deal.','Released in two minutes.','Clear and polite. Will trade again.','Exactly as agreed.','Quick replies in chat.','Good trader, a bit slow to confirm.'];
const TERMS=['Pay only from an account in your own name.','Please stay online during the deal.','I release as soon as the money arrives.'];
const AUTO=['Hi! Bank details are on the order page. Send the exact amount and tap "I have paid".','Hello, I am online. Please pay from your own account.','Thanks for your order. I check my bank every few minutes.'];
T.forEach((t,i)=>{t.idok=true;t.revs=[0,1,2,3].slice(0,t.newbie?2:4).map(k=>({from:T[(i+k+1)%T.length].id,stars:k===3&&t.rating<4.8?4:5,text:REVS[(i+k)%REVS.length],t:now()-(k*3+i+1)*DAY,deal:'D-'+(1400+i*37+k*9),usdt:pick([100,250,300,500,800,1200],i+k),method:pick(METHODS,i+k*3),relMin:Math.max(1,t.rel-2+k)}))});
const ME={id:'you',name:'You (demo)',rating:4.8,reviews:23,trades:31,vol:14800,done:100,rel:5,pay:6,since:'Nov 2026',idok:true,kyc:1,merchant:false,online:true,t30:9,risk:8,pos:100,
  bank:'National Bank',holder:'You (demo)',acct:'0021 0098 4400',tfa:false,fundpw:false,phish:'',wl:false,
  city:'Capital City',resp:3,lost:0,
  revs:[{from:'maya',stars:5,text:'Paid fast, smooth deal.',t:now()-2*DAY,deal:'D-2058',usdt:300,method:'Mobile money',relMin:3},{from:'jon_b',stars:5,text:'Clear and polite.',t:now()-5*DAY,deal:'D-2041',usdt:150,method:'Bank transfer',relMin:4},{from:'northdesk',stars:4,text:'Good, a bit slow to pay.',t:now()-9*DAY,deal:'D-2033',usdt:500,method:'Bank transfer',relMin:6}]};
const trader=id=>id==='you'?ME:T.find(t=>t.id===id)||T[0];

/* ---------- ads (offers) ---------- */
let OID=2140,DID=2090,NID=0,TID=1005,CID=1043,AID=12,XID=400,WID=890;
const adPrice=o=>o.ptype==='float'?+(CUR[o.fiat].market*(1+o.margin/100)).toFixed(2):o.price;
function mkAd(by,side,total,price,methods,o){o=o||{};const a={id:'O-'+(OID++),by,side,ptype:o.margin!=null?'float':'fixed',margin:o.margin||0,price,fiat:o.fiat||'LC',total,avail:total,
  min:o.min||(o.fiat==='USD'?20:100),max:o.max||Math.round(total*price),methods,mins:o.mins||15,terms:o.terms||TERMS[OID%3],auto:AUTO[OID%3],req:o.req||{kyc:0,trades:0,reg:0},hours:o.hours||'any',status:'online',orders:o.orders||((OID*13)%40),t:now()-((OID*7)%50)*60000};
  a.price=adPrice(a);return a}
const S={
  signedIn:true,
  page:'home',sub:{wallet:'assets',account:'profile',help:'home',admin:'dash'},tabs:['page'],active:'page',
  favs:['pg:home','list:buy-bank','pg:market'],hist:[],pop:null,pinned:false,treeClosed:new Set(),menuQ:'',q:'',
  notifs:[],unread:0,L:{},lclosed:new Set(),
  wallet:{avail:1250,held:0,ads:0},
  txs:[],offers:[],deals:[],board:[],onlyMine:false,doneToday:37,
  priceHist:[],coverHist:[100.4,100.6,100.5,100.9,100.7,100.8,100.6,100.7],
  bot:[],channel:[],group:[],tg:'bot',topic:'General',
  disputes:[],approvals:[],log:[],paused:false,hot:3120,cold:45400,others:46960,
  modal:null,depTab:'wallet',depAmt:'100',draft:{},rate:{n:0,tags:[],text:''},create:null,
  dealPane:{},dtab:{},typing:{},cancels:0,
  pms:[{id:'PM-1',type:'Bank transfer',bank:'National Bank',holder:'You (demo)',acct:'0021 0098 4400'},{id:'PM-2',type:'Mobile money',bank:'PayLink',holder:'You (demo)',acct:'+000 555 0142'}],
  book:[{id:'AB-1',label:'My Tonkeeper',addr:'UQBn3c9Xw2Lk8Tq5ZrP7mV1aY4sH6eD0fJ9gN2uC5bR8oK'}],
  follow:new Set(['northdesk']),blocked:new Set(),
  alerts:[{id:'PA-1',side:'buy',op:'below',price:3.64,on:true,hit:0}],
  sessions:[{id:'SE-1',dev:'Chrome on Windows',where:'This device',t:now(),cur:true},{id:'SE-2',dev:'Telegram on iPhone (Mini App)',where:'Active 2 h ago',t:now()-2*3600000},{id:'SE-3',dev:'Telegram Desktop',where:'Active yesterday',t:now()-DAY}],
  logins:[{t:now(),how:'Telegram Mini App',ok:true},{t:now()-2*3600000,how:'Telegram login',ok:true},{t:now()-DAY,how:'Telegram Desktop',ok:true},{t:now()-3*DAY,how:'Telegram login',ok:false}],
  nprefs:{'Order updates':[1,1,0],'Chat messages':[1,1,0],'Price alerts':[1,1,0],'Deposits and withdrawals':[1,1,1],'Security alerts':[1,1,1],'News and announcements':[1,0,0]},
  prefs:{density:'compact',lang:'English',cur:'LC',tz:'GMT+3',home:'home'},
  ref:{code:'P2P-YOU7',friends:[{n:'sam_t',t:now()-15*DAY,traded:true,earned:4.2},{n:'nora_k',t:now()-9*DAY,traded:true,earned:1.8},{n:'leo_m',t:now()-2*DAY,traded:false,earned:0}]},
  merchApp:null,kyc2:null,annOff:false,mrange:'1D',va:null,vaMin:false,
  malerts:[],pcFile:false,vc:null,
  cases:[],kycq:[],mapps:[],risk:[],anns:[],chain:[],ustat:{},
  set:{taker:0,maker:0.1,auto:2000,user:2000,plat:5000,methods:{'Bank transfer':true,'Instant transfer':true,'Mobile money':true,'Cash deposit':true},cur:{LC:true,USD:true}}
};
S.offers=[
  mkAd('northdesk','sell',2500,3.67,['Bank transfer','Instant transfer'],{min:500,max:9000,orders:61}),
  mkAd('amir_k','sell',500,3.68,['Bank transfer'],{min:100,max:1840}),
  mkAd('maya','sell',300,0,['Mobile money','Bank transfer'],{margin:0.3,min:100,max:1100}),
  mkAd('lina_trade','sell',1200,3.69,['Instant transfer'],{min:200,max:4400}),
  mkAd('sami_otc','sell',5000,3.70,['Bank transfer'],{min:3000,max:18500,req:{kyc:2,trades:50,reg:0},hours:'9-18'}),
  mkAd('kai_new','sell',600,3.55,['Bank transfer','Mobile money'],{min:100,max:1775}),
  mkAd('jon_b','sell',150,3.66,['Mobile money','Cash deposit'],{min:50,max:549,hours:'9-21'}),
  mkAd('delta_fx','sell',800,1.01,['Bank transfer'],{fiat:'USD',min:20,max:808}),
  mkAd('river','sell',100,3.71,['Cash deposit'],{min:50,max:371}),
  mkAd('northdesk','buy',3000,3.63,['Bank transfer'],{min:500,max:10890}),
  mkAd('amir_k','buy',400,0,['Bank transfer','Instant transfer'],{margin:-0.6,min:100,max:1450}),
  mkAd('maya','buy',250,3.64,['Mobile money'],{min:50,max:910}),
  mkAd('jon_b','buy',1000,3.61,['Bank transfer'],{min:300,max:3610,req:{kyc:2,trades:0,reg:0}}),
  mkAd('delta_fx','buy',600,0.99,['Bank transfer'],{fiat:'USD',min:20,max:594}),
  mkAd('lina_trade','buy',150,3.63,['Instant transfer','Mobile money'],{min:50,max:544})
];
S.offers.forEach(o=>{if(o.by==='kai_new')o.keep=true});
function mkTile(st,ageSec){const b=T[rnd(T.length)],s=T[(T.indexOf(b)+1+rnd(T.length-1))%T.length];return {id:'D-'+(DID++),buyer:b.id,seller:s.id,usdt:pick([100,150,250,300,500,800,1000,1200,2000,2500],rnd(10)),fiat:'LC',price:+(3.64+rnd(7)/100).toFixed(2),method:pick(METHODS,rnd(4)),st,t:now()-ageSec*1000,fresh:false}}
S.board=[mkTile('locked',140),mkTile('locked',60),mkTile('locked',20),mkTile('paid',200),mkTile('paid',90),mkTile('paid',30),mkTile('done',40),mkTile('done',15),mkTile('done',5)];
{let p=3.62;for(let i=0;i<24;i++){p+=((i*37)%7-3)/400;S.priceHist.push(+p.toFixed(3))}S.priceHist[23]=3.65}
const HIST7=[],HIST30=[];{let p=3.58;for(let i=0;i<28;i++){p+=((i*29)%9-4)/300;HIST7.push(+p.toFixed(3))}HIST7[27]=3.65;p=3.49;for(let i=0;i<30;i++){p+=((i*31)%11-4)/250;HIST30.push(+p.toFixed(3))}HIST30[29]=3.65}
const VOL14=[41,38,52,47,60,55,49,63,71,58,66,74,69,80].map(x=>x*1000);
const MVOL={'Bank transfer':182400,'Instant transfer':64200,'Mobile money':51800,'Cash deposit':12600};
const USERS14=[12,9,15,11,18,14,16,21,19,17,24,22,26,31];

/* ---------- my order history ---------- */
function pastDeal(id,cp,side,usdt,price,method,st,daysAgo,extra){const t0=now()-daysAgo*DAY;const d={id,ad:'O-20'+id.slice(-2),cp,side,usdt,price,fiat:'LC',total:usdt*price,method,st,t0,stT:t0+(st==='expired'?15:9)*60000,payBy:t0+15*60000,mins:15,msgs:[],files:[],paidAt:st==='done'?t0+4*60000:0,rated:st==='done'?5:0,fresh:false,unread:0,bank:'',holder:'',acct:'',past:true};
  d.msgs.push({from:'sys',kind:'event',icon:'lock',text:`Order created. ${u(usdt)} USDT is locked by simple.p2p.`,t:t0});
  if(st==='done'){d.msgs.push({from:side==='buy'?'you':cp,kind:'msg',text:'Paid, please check.',t:t0+4*60000});d.msgs.push({from:'sys',kind:'event',icon:'ok',text:`State: Done. ${u(usdt)} USDT released.`,t:t0+9*60000})}
  if(st==='cancelled')d.msgs.push({from:'sys',kind:'event',icon:'bad',text:'State: Cancelled. '+(extra||'The buyer cancelled.'),t:t0+5*60000});
  if(st==='expired')d.msgs.push({from:'sys',kind:'event',icon:'bad',text:'State: Expired. Nobody paid in 15 minutes, so the USDT went back to the seller.',t:t0+15*60000});
  if(extra)d.reason=extra;return d}
S.deals=[pastDeal('D-2049','amir_k','buy',1000,3.66,'Bank transfer','done',12),pastDeal('D-2052','delta_fx','buy',200,3.68,'Bank transfer','expired',9),pastDeal('D-2058','jon_b','sell',300,3.64,'Mobile money','done',8),
  pastDeal('D-2060','river','buy',100,3.71,'Cash deposit','cancelled',6,'You cancelled: changed my mind.'),pastDeal('D-2066','northdesk','buy',500,3.67,'Bank transfer','done',4),pastDeal('D-2071','lina_trade','sell',250,3.66,'Instant transfer','done',2)];
S.txs=[{id:'T-1001',type:'Deposit',detail:'From Tonkeeper',amt:500,st:'Done',t:now()-14*DAY,hash:'b7c1…02fa'},{id:'T-1002',type:'Bought',detail:'Order D-2049 · amir_k',amt:1000,st:'Done',t:now()-12*DAY},
  {id:'T-1003',type:'Deposit',detail:'From Telegram Wallet',amt:1500,st:'Done',t:now()-3*DAY,hash:'9e44…c1d0'},{id:'T-1004',type:'Sold',detail:'Order D-2071 · lina_trade',amt:-250,st:'Done',t:now()-2*DAY},
  {id:'T-1000',type:'Withdrawal',detail:'To UQBn3c…8oK',amt:-1500,st:'Done',t:now()-10*DAY,hash:'41aa…77e3'}];
const deal=id=>S.deals.find(d=>d.id===id);
const ACTIVE=['locked','paid','disputed'];
const activeMine=()=>S.deals.filter(d=>ACTIVE.includes(d.st));
const needsMe=d=>(d.side==='buy'&&d.st==='locked')||(d.side==='sell'&&d.st==='paid');

/* ---------- telegram, admin queues ---------- */
S.disputes=[{id:'X-311',deal:'D-2068',mine:false,usdt:300,fiat:'LC',total:1092,method:'Cash deposit',buyer:'river',seller:'delta_fx',buyerSays:'I paid 1,092 LC by cash deposit 40 min ago. Receipt attached.',sellerSays:'Nothing in my account yet.',evidence:['Cash deposit receipt','Chat (14 messages)'],t:now()-35*60000,notes:[],st:'open',
  chat:[{from:'river',text:'Paid by cash deposit at Union Bank, sending the receipt.',t:now()-50*60000},{from:'river',img:1,text:'',t:now()-49*60000},{from:'delta_fx',text:'I do not see it yet.',t:now()-44*60000},{from:'river',text:'Cash deposits can take 30 min. Please check again.',t:now()-40*60000},{from:'delta_fx',text:'Still nothing. Opening an appeal.',t:now()-36*60000}]}];
S.approvals=[{id:'W-881',user:'northdesk',amt:3500,addr:'UQBx7n…a9f2K',t:now()-12*60000,mine:false}];
S.log=[{t:now()-3600000,who:'admin',text:'Approved withdrawal W-874 · 2,800 USDT · sami_otc'},{t:now()-7200000,who:'admin',text:'Appeal X-309 · gave USDT to buyer · bank receipt matches'},{t:now()-26*3600000,who:'admin',text:'Changed setting · auto-approve limit 2,000 USDT'}];
S.channel=[{kind:'sum',hi:3.71,lo:3.60,n:412,med:4,fast:1,slow:38,t:now()-3*3600000},{kind:'new',o:S.offers[0],t:now()-50*60000,taken:false},{kind:'done',usdt:1200,fiat:'LC',rating:4.9,mins:6,t:now()-40*60000},{kind:'news',text:'Mobile money is now a payment option.',t:now()-30*60000},{kind:'new',o:S.offers[2],t:now()-20*60000,taken:false}];
S.group=[
  {topic:'General',from:'maya',text:'Morning all. Lots of LC sell offers today.',t:now()-40*60000},
  {topic:'General',from:'river',text:'Is cash deposit safe for big amounts?',t:now()-35*60000},
  {topic:'General',from:'simple.p2p bot',bot:true,text:'Cash deposit is fine. Always use the order page, and the seller only releases after checking their own bank.',t:now()-34*60000},
  {topic:'General',del:true,text:'Message removed by the bot: it contained a bank account number. Share bank details only inside an order.',t:now()-20*60000},
  {topic:'Market',from:'northdesk',text:'Selling up to 10k USDT at 3.67 today. Ads are in the app.',t:now()-25*60000},
  {topic:'Help',from:'jon_b',text:'How long does a withdrawal take?',t:now()-15*60000},
  {topic:'Help',from:'simple.p2p bot',bot:true,text:'Usually under 2 minutes. Big ones are checked by the admin first.',t:now()-14*60000},
  {topic:'Scam reports',from:'lina_trade',text:'Someone messaged me pretending to be the admin. Reported.',t:now()-10*60000},
  {topic:'Scam reports',from:'simple.p2p bot',bot:true,text:'Thanks. Staff never message first. Check anyone with /verify @name.',t:now()-9*60000}
];
S.bot=[{t:now()-3*DAY,text:'Welcome to simple.p2p. Your account is linked.\nOrder updates arrive here.',btn:{label:'Open app',x:'pg:home'}}];
S.notifs=[{id:'N0',title:'Turn on two-step login',body:'Protect withdrawals and releases with an authenticator app.',key:'pg:account/security',t:now()-5*3600000,read:false,cat:'Security'},
  {id:'N-1',title:'Mobile money is live',body:'You can now pay and get paid with mobile money.',key:'pg:help',t:now()-2*DAY,read:true,cat:'System'}];
S.cases=[
  {id:'CS0001041',subj:'Withdrawal took longer than usual',cat:'Wallet',order:'',st:'resolved',t:now()-5*DAY,upd:now()-4*DAY,msgs:[{from:'you',text:'My withdrawal of 1,500 USDT took 40 minutes. Is that normal?',t:now()-5*DAY},{from:'agent',text:'Hi! Withdrawals over 2,000 USDT, or the first one to a new address, are checked by hand. Yours is done now. Hash 41aa…77e3.',t:now()-4*DAY-3600000},{from:'sys',text:'State changed to Resolved.',t:now()-4*DAY}]},
  {id:'CS0001042',subj:'Can I pay from my spouse\'s bank account?',cat:'Orders',order:'D-2066',st:'waiting',t:now()-DAY,upd:now()-20*3600000,msgs:[{from:'you',text:'Can I pay a seller from my spouse\'s account?',t:now()-DAY},{from:'agent',text:'For your safety, the payment must come from an account in your own name. Can you confirm you have one?',t:now()-20*3600000},{from:'sys',text:'State changed to Waiting for you.',t:now()-20*3600000}]}];
S.kycq=[{id:'KYC-201',user:'river',lvl:2,doc:'National ID card',t:now()-50*60000,st:'pending'},{id:'KYC-202',user:'delta_fx',lvl:2,doc:'Passport',t:now()-3*3600000,st:'pending'},{id:'KYC-199',user:'jon_b',lvl:2,doc:'National ID card',t:now()-2*DAY,st:'approved'}];
S.mapps=[{id:'MA-31',user:'jon_b',t:now()-5*3600000,st:'pending',note:'Trading every day, mostly mobile money.'},{id:'MA-30',user:'maya',t:now()-12*DAY,st:'approved',note:''}];
S.risk=[{id:'RA-77',user:'river',rule:'Payer name did not match the account name',sev:'high',st:'open',t:now()-40*60000},{id:'RA-78',user:'delta_fx',rule:'3 cancelled orders in 1 hour',sev:'moderate',st:'open',t:now()-2*3600000},{id:'RA-79',user:'sami_otc',rule:'New device, then a large withdrawal',sev:'moderate',st:'open',t:now()-6*3600000},{id:'RA-74',user:'lina_trade',rule:'Many small orders in a short time',sev:'low',st:'dismissed',t:now()-3*DAY}];
S.anns=[{id:'AN-11',title:'Mobile money is live',body:'You can now pay and get paid with mobile money.',t:now()-2*DAY,ch:['App banner','Telegram channel']},{id:'AN-10',title:'Welcome to simple.p2p beta',body:'Trading fees are 0% during the beta.',t:now()-20*DAY,ch:['App banner','Telegram channel','Bot message']}];
S.chain=[{id:'b7c1…02fa',dir:'In',amt:500,what:'User deposit · you',t:now()-14*DAY},{id:'41aa…77e3',dir:'Out',amt:1500,what:'Withdrawal · you',t:now()-10*DAY},{id:'c90e…5b12',dir:'Out',amt:6000,what:'Sweep hot → cold',t:now()-6*DAY},{id:'9e44…c1d0',dir:'In',amt:1500,what:'User deposit · you',t:now()-3*DAY},{id:'0d3f…a871',dir:'Out',amt:2800,what:'Withdrawal · sami_otc',t:now()-3600000}];
T.concat([ME]).forEach(t=>{S.ustat[t.id]={st:'active',limit:t.kyc===2?20000:2000,notes:[]}});
const KB=[
  {id:'KB0010001',topic:'getting',title:'How simple.p2p works',sum:'Buy and sell USDT with people, with simple.p2p holding the USDT safely in between.',views:4210,help:96,
    body:[['p','simple.p2p connects buyers and sellers of USDT. You pay each other in local money, by bank or mobile money. simple.p2p holds the seller\'s USDT until the money arrives.'],['ol',['A seller posts an ad, or you pick one from the list.','When the order starts, the USDT is locked.','The buyer pays the seller directly and taps "I have paid".','The seller checks their own bank and releases the USDT.']],['tip','If anything goes wrong, open an appeal. The admin sees the chat and both sides\' proof.']]},
  {id:'KB0010002',topic:'getting',title:'Verify your identity',sum:'Verification raises your limits and lets you trade with merchants.',views:2380,help:91,
    body:[['p','There are three levels. Level 0 is your linked Telegram account. Level 1 adds your name and phone. Level 2 adds an ID document and a selfie.'],['ol',['Open Account, then Verification.','Pick your document and take photos of both sides.','Take a selfie. Results usually take under 10 minutes.']],['tip','Your payment accounts must be in the same name as your ID.']]},
  {id:'KB0010003',topic:'buying',title:'How to buy USDT',sum:'Pick an ad, pay the seller, and get USDT in your wallet.',views:3920,help:94,
    body:[['ol',['Open P2P trading and choose Buy.','Pick a seller. Check their rating, completion rate and payment methods.','Enter how much you want to pay and start the order.','Send the exact amount to the account shown on the order page.','Tap "I have paid". The seller releases the USDT.']],['tip','Never pay outside the order page, and always pay from an account in your own name.']]},
  {id:'KB0010004',topic:'buying',title:'I paid but the seller has not released',sum:'What to do when the USDT does not arrive.',views:1870,help:88,
    body:[['p','Most sellers release within a few minutes. Bank transfers can take longer outside working hours.'],['ol',['Send the seller a message with your payment reference.','Add your receipt in the chat.','If nothing happens after the waiting time, tap Appeal.']],['tip','Your USDT stays locked for you while the appeal is open. It cannot be taken back by the seller.']]},
  {id:'KB0010005',topic:'selling',title:'How to sell USDT',sum:'Sell to a buyer ad, or post your own sell ad.',views:2960,help:93,
    body:[['ol',['Make sure you have USDT in your wallet.','Pick a buyer ad, or post your own ad in My ads.','When the buyer pays, check YOUR bank app.','Release the USDT only when the money is there.']]]},
  {id:'KB0010006',topic:'selling',title:'Check your bank before you release',sum:'Fake receipts are the most common scam. Here is how to stay safe.',views:2210,help:97,
    body:[['p','Screenshots and PDFs can be faked. Only trust what you see in your own bank or mobile money app.'],['ol',['Open your bank app yourself, not a link.','Check the amount and the payer name.','Only then tap Release.']],['tip','Released USDT cannot be taken back.']]},
  {id:'KB0010007',topic:'wallet',title:'Deposit USDT on TON (memo required)',sum:'Send only USDT on the TON network, and always include your memo.',views:3100,help:90,
    body:[['ol',['Open Wallet and tap Deposit.','From Telegram Wallet or Tonkeeper, approve the payment. The memo is filled in.','From an exchange, copy the address AND the memo.']],['tip','Without the memo we cannot tell the money is yours. Recovery takes days.']]},
  {id:'KB0010008',topic:'wallet',title:'Withdrawal times and limits',sum:'Small withdrawals go out in minutes. Big ones are checked first.',views:1650,help:89,
    body:[['p','Up to 2,000 USDT is sent automatically in about 2 minutes. Larger amounts wait for an admin check, usually under an hour.'],['tip','Turn on the address whitelist so money can only go to addresses you saved.']]},
  {id:'KB0010009',topic:'security',title:'Turn on two-step login',sum:'Use an authenticator app to protect releases and withdrawals.',views:1320,help:95,
    body:[['ol',['Open Account, then Security.','Tap Turn on next to Authenticator app.','Scan the QR code and type the 6-digit code.']]]},
  {id:'KB0010010',topic:'security',title:'Spotting fake admins and scams',sum:'Staff never message you first.',views:2780,help:98,
    body:[['ol',['Staff never message first, in Telegram or anywhere else.','Check anyone with /verify @name in the group.','Set an anti-phishing code. Real messages from us include it.']]]},
  {id:'KB0010011',topic:'disputes',title:'How appeals work',sum:'When buyer and seller disagree, the admin decides with the evidence.',views:1540,help:87,
    body:[['ol',['Either side taps Appeal after the waiting time.','Both add proof in the chat: receipts and bank references.','The admin gives the USDT to the buyer or back to the seller, and writes why.']],['tip','Keep all talk inside the order chat. Outside messages cannot be used.']]},
  {id:'KB0010013',topic:'security',title:'My bank account was frozen',sum:'What to do, and how the proof pack helps you get it unfrozen.',views:2650,help:95,
    body:[['p','Banks sometimes freeze an account when money arrives from a stranger. This can happen even when you did nothing wrong. simple.p2p gives you proof that the money came from a real, ID-checked trade.'],['ol',['Open the order and tap Proof pack in the Details tab.','Take the proof pack and your ID to your bank branch.','The bank can check the pack online with its code.','Still stuck? Open a support request. We can send a letter to your bank.']],['tip','Only trade with ID-checked people, only accept money from the buyer\'s own name, and always ask for the payment reference. That keeps the proof clean.']]},
  {id:'KB0010014',topic:'buying',title:'The payment reference',sum:'A short code that links your bank payment to one order.',views:1440,help:93,
    body:[['p','Every order has a 4-digit payment reference. Put it in the payment note. For a cash deposit, write it on the slip.'],['ol',['It proves which order the money belongs to.','It stops middlemen from re-using your payment for their own order.','It goes into the proof pack if a bank ever asks.']],['tip','Never write "USDT" or "crypto" in the note. The reference is enough.']]},
  {id:'KB0010012',topic:'fees',title:'Fees and limits',sum:'0% taker fee during the beta. Limits depend on your verification level.',views:1980,help:92,body:[['p','See the Fees and limits page for the full table.']]}
];
const TOPICS=[['getting','Getting started','home','Accounts, verification and the basics'],['buying','Buying','down','Pay a seller and get USDT'],['selling','Selling','up','Sell safely and get paid'],['wallet','Wallet','wallet','Deposits, withdrawals and memos'],['security','Security','lock','Two-step login and scams'],['disputes','Appeals','shield','When something goes wrong'],['fees','Fees and limits','pay','What it costs and how much you can trade']];
const LEVELS=[{n:0,t:'Telegram linked',need:'Telegram account',buy:500,sell:500,wd:500},{n:1,t:'Basic',need:'Name, birth date, phone',buy:2000,sell:2000,wd:2000},{n:2,t:'Full',need:'ID document and selfie',buy:20000,sell:20000,wd:50000}];
