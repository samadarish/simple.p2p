/* ---------- pages, records, menus ---------- */
const PAGES={
  home:{l:'Home',i:'home',v:()=>vHome()},
  trade:{l:'P2P trading',i:'swap',v:()=>vTrade()},
  express:{l:'Quick trade',i:'zap',v:()=>vExpress()},
  orders:{l:'My orders',i:'receipt',v:()=>vOrders()},
  ads:{l:'My ads',i:'mega',v:()=>vAds()},
  wallet:{l:'Wallet',i:'wallet',v:()=>vWallet(),subs:[['assets','Assets'],['history','History'],['addresses','Address book']]},
  market:{l:'Market',i:'trend',v:()=>vMarket()},
  account:{l:'Account',i:'user',v:()=>vAccount(),subs:[['profile','My profile'],['verify','Verification'],['payments','Payment methods'],['security','Security'],['notify','Notification settings'],['referral','Invite friends'],['merchant','Merchant program'],['people','Following and blocked']]},
  help:{l:'Help center',i:'help',v:()=>vHelp(),subs:[['home','Help home'],['requests','My requests'],['fees','Fees and limits']]},
  telegram:{l:'Telegram',i:'send',v:()=>vTelegram()},
  notifs:{l:'Notifications',i:'bell',v:()=>vNotifs()},
  admin:{l:'Admin',i:'shield',v:()=>vAdmin(),subs:[['dash','Dashboard'],['disputes','Appeals'],['wd','Withdrawals'],['kyc','ID checks'],['merch','Merchant requests'],['risk','Risk alerts'],['users','Users'],['ads','All ads'],['treasury','Treasury'],['anns','Announcements'],['settings','Settings'],['audit','Audit log']]}
};
const subLabel=(p,s)=>{const x=(PAGES[p].subs||[]).find(y=>y[0]===s);if(x)return x[1];if(s&&s.startsWith('topic-')){const t=TOPICS.find(y=>y[0]===s.slice(6));return t?t[1]:s}return s};
const REC={
  deal:{i:'receipt',l:id=>id,ctx:id=>{const d=deal(id);return 'Order '+id+(d?' - '+u(d.usdt)+' USDT':'')},v:id=>vDeal(id)},
  profile:{i:'user',l:id=>id==='you'?'My profile':id,ctx:id=>'Trader - '+nm(id),v:id=>vProfile(id)},
  ad:{i:'mega',l:id=>id==='new'?'Post an ad':'Ad '+id,ctx:id=>id==='new'?'Post an ad':'Edit ad '+id,v:id=>vAdForm(id)},
  kb:{i:'book',l:id=>id,ctx:id=>{const a=KB.find(x=>x.id===id);return 'Article - '+(a?a.title:id)},v:id=>vArticle(id)},
  case:{i:'doc',l:id=>id==='new'?'New request':id,ctx:id=>id==='new'?'New support request':'Request '+id,v:id=>id==='new'?vCaseNew():vCase(id)},
  user:{i:'users',l:id=>'User '+id,ctx:id=>'Admin - User '+nm(id),v:id=>vUser(id)},
  disp:{i:'shield',l:id=>'Appeal '+id,ctx:id=>'Admin - Appeal '+id,v:id=>vDisp(id)}
};
const RAIL=[['home',1],['trade',1],['orders',1],['ads',0],['wallet',1],['market',0],['account',0],['help',0],['telegram',0],['admin',0]];
const TREE=[
  {g:'Home',items:[['pg:home','Home'],['pg:notifs','Notifications']]},
  {g:'P2P trading',items:[['list:buy-all','Buy USDT'],['list:sell-all','Sell USDT'],['pg:express','Quick trade'],['pg:market','Market prices']]},
  {g:'My orders',items:[['ord:active','In progress'],['ord:all','All orders'],['ord:appeal','Appeals']]},
  {g:'My ads',items:[['pg:ads','My ads'],['ad:new','Post an ad']]},
  {g:'Wallet',items:[['pg:wallet/assets','Assets'],['act:deposit','Deposit'],['act:withdraw','Withdraw'],['act:transfer','Send to a user'],['pg:wallet/history','History'],['pg:wallet/addresses','Address book']]},
  {g:'Account',items:PAGES.account.subs.map(([s,l])=>['pg:account/'+s,l]).concat([['act:prefs','Preferences']])},
  {g:'Help',items:[['pg:help/home','Help home'],['act:va','Ask the assistant'],['pg:help/requests','My requests'],['case:new','New request'],['pg:help/fees','Fees and limits']]},
  {g:'Telegram',items:[['tg:bot','Bot'],['tg:channel','Channel'],['tg:group','Group']]},
  {g:'Admin',items:PAGES.admin.subs.map(([s,l])=>['pg:admin/'+s,l])}
];
const treeLabel=k=>{for(const g of TREE){const x=g.items.find(i=>i[0]===k);if(x)return x[1]}return null};
function keyLabel(k){
  const i=k.indexOf(':'),t=k.slice(0,i),id=k.slice(i+1);
  if(t==='pg'){const [p,s]=id.split('/');return PAGES[p]?PAGES[p].l+(s?': '+subLabel(p,s):''):k}
  if(t==='list'){const v=TRADE_VIEWS.find(x=>x.id===id);return v?v.g+': '+v.l:k}
  if(t==='ord'){const v=ORDER_VIEWS.find(x=>x.id===id);return 'Orders: '+(v?v.l:id)}
  if(t==='tg')return 'Telegram: '+id;
  if(REC[t])return REC[t].ctx(id).replace(' - ',': ');
  return treeLabel(k)||k;
}
function pageKey(){const p=S.page;if(p==='trade')return 'list:'+lst('trade').view;if(p==='orders')return 'ord:'+lst('orders').view;return PAGES[p].subs?'pg:'+p+'/'+S.sub[p]:'pg:'+p}
function tabMeta(k){
  if(k==='page'){const p=PAGES[S.page];const s=p.subs?subLabel(S.page,S.sub[S.page]):S.page==='trade'?tradeView().g+': '+tradeView().l:'';return {l:p.l,i:p.i,fav:pageKey(),ctx:p.l+(s?' - '+s:'')}}
  const i=k.indexOf(':'),t=k.slice(0,i),id=k.slice(i+1),r=REC[t];
  const d=t==='deal'&&deal(id);
  return {l:r.l(id),i:r.i,fav:id==='new'?null:k,ctx:r.ctx(id),dot:d&&d.unread>0&&S.active!==k};
}
function addHist(k){S.hist=S.hist.filter(h=>h.k!==k);S.hist.unshift({k,t:now()});S.hist=S.hist.slice(0,15)}
function setHash(p){try{history.replaceState(null,'','#'+p)}catch(e){}}
function goPage(p,keep){S.page=p;S.active='page';addHist(pageKey());if(!keep)setHash(p);render();window.scrollTo(0,0)}
function openTab(k){if(!S.tabs.includes(k))S.tabs.push(k);S.active=k;addHist(k);if(k.startsWith('deal:')){const d=deal(k.slice(5));if(d)d.unread=0}render();window.scrollTo(0,0)}
function closeTab(k){const i=S.tabs.indexOf(k);if(i<1)return;S.tabs.splice(i,1);if(S.active===k)S.active=S.tabs[Math.max(0,i-1)];if(k==='ad:new')S.create=null;if(k==='case:new')S.caseDraft=null;render()}
function go(k){
  closePops();if(S.modal)closeModal(true);
  const i=k.indexOf(':'),t=k.slice(0,i),id=k.slice(i+1);
  if(t==='pg'){const [p,s]=id.split('/');if(!PAGES[p])return;if(s)S.sub[p]=s;return goPage(p)}
  if(t==='list'){lst('trade').view=id;resetL('trade');return goPage('trade')}
  if(t==='ord'){lst('orders').view=id;resetL('orders');return goPage('orders')}
  if(t==='tg'){S.tg=id;return goPage('telegram')}
  if(t==='act')return A[id]();
  if(t==='offer')return A.start(id);
  if(k==='ad:new'&&S.paused){toast('New ads are paused right now.');return}
  if(REC[t])return openTab(k);
}

/* ---------- render ---------- */
function keepFocus(fn){
  const a=document.activeElement;const id=a&&a.id;const da=a&&a.dataset&&a.dataset.a,dx=a&&a.dataset&&a.dataset.x;
  let s=null,e=null;try{s=a.selectionStart;e=a.selectionEnd}catch(x){}
  fn();
  if(!a||a===document.body||document.contains(a))return;
  let n=id?document.getElementById(id):null;
  if(!n&&da)n=document.querySelector(`[data-a="${da}"]${dx!=null?`[data-x="${CSS.escape(dx)}"]`:''}`);
  if(n){n.focus({preventScroll:true});try{if(s!=null&&n.setSelectionRange)n.setSelectionRange(s,e)}catch(x){}}
}
function render(){keepFocus(()=>{renderHeader();renderRail();renderTabs();renderMain();renderPinned();renderVA();renderSignin();if(S.pop==='bell')renderPop()})}
function renderHeader(){
  const n=S.notifs.filter(x=>!x.read).length,nb=$('#bell-n');nb.textContent=n;nb.hidden=!n;
}
const adminCount=()=>S.disputes.filter(d=>d.st==='open').length+S.approvals.length+S.kycq.filter(k=>k.st==='pending').length+S.mapps.filter(m=>m.st==='pending').length+S.risk.filter(r=>r.st==='open').length;
function renderRail(){
  const badge=k=>k==='telegram'?S.unread:k==='admin'?adminCount():k==='orders'?activeMine().length:k==='help'?S.cases.filter(c=>c.st==='waiting').length:0;
  $('#rail').innerHTML=RAIL.map(([k,ph])=>{const p=PAGES[k],on=S.page===k&&S.active==='page';const b=badge(k);return `<button class="rb${S.page===k?' on':''}${ph?'':' nph'}" data-a="go" data-x="pg:${k}" aria-label="${p.l}${b?` (${b})`:''}" title="${p.l}"${on?' aria-current="page"':''}>${ico(p.i,19)}<span class="rb-l">${k==='trade'?'Trade':k==='orders'?'Orders':p.l}</span>${b?`<span class="nb">${b}</span>`:''}</button>`}).join('')+`<button class="rb more" data-a="menu" data-x="all" aria-label="More pages">${ico('more',19)}<span class="rb-l">More</span></button>`;
}
function renderTabs(){
  $('#tabs').innerHTML=S.tabs.map(k=>{const m=tabMeta(k),on=S.active===k;return `<div class="tab${on?' on':''}"><button class="tb" role="tab" aria-selected="${on}" data-a="tab" data-x="${k}" title="${esc(m.ctx)}">${ico(m.i,14)}<span class="tl">${esc(m.l)}</span>${m.dot?'<span class="tdot" aria-label="new messages"></span>':''}</button>${on&&m.fav?(()=>{const st=S.favs.includes(m.fav);return `<button class="tstar${st?' on':''}" data-a="favToggle" aria-pressed="${st}" aria-label="${st?'Remove from favorites':'Add to favorites'}" title="${st?'Starred: in Favorites':'Star: add to Favorites'}">${ico('star',13,st?'fill':'')}</button>`})():''}${k==='page'?'':`<button class="tx" data-a="closeTab" data-x="${k}" aria-label="Close ${esc(m.l)}">${ico('x',13)}</button>`}</div>`}).join('')+`<button class="tadd" data-a="go" data-x="ad:new" aria-label="Post an ad" title="Post an ad">${ico('plus',16)}</button>`;
  const on=$('#tabs .tab.on');if(on)on.scrollIntoView({block:'nearest',inline:'nearest'});
}
let CHARTS={};
function renderMain(){
  const m=$('#main'),k=S.active;let html,flush=false;CHARTS={};
  if(k==='page')html=PAGES[S.page].v();
  else{const i=k.indexOf(':'),t=k.slice(0,i),id=k.slice(i+1);flush=true;html=REC[t].v(id)}
  const cl=$('#chlog'),stick=!cl||cl.scrollHeight-cl.scrollTop-cl.clientHeight<60;
  m.className='main'+(flush?' flush':'');m.innerHTML=html;
  m.querySelectorAll('canvas.qr').forEach(drawQR);
  const f=$('#tgfeed');if(f)f.scrollTop=f.scrollHeight;
  const c=$('#chlog');if(c&&stick)c.scrollTop=c.scrollHeight;
  tickTimers();
  S.deals.forEach(d=>d.fresh=false);S.board.forEach(b=>b.fresh=false);
  if(k==='page'&&S.page==='telegram'&&S.tg==='bot'&&S.unread){S.unread=0;renderRail()}
}

/* ---------- menus and popovers ---------- */
function menuList(type,q){
  if(type==='all'){const h=TREE.map(g=>{const items=g.items.filter(([,l])=>!q||l.toLowerCase().includes(q)||g.g.toLowerCase().includes(q));if(!items.length)return '';const open=q||!S.treeClosed.has(g.g);
    return `<button class="mo-g" data-a="tree" data-x="${g.g}" aria-expanded="${!!open}">${ico(open?'chevD':'chevR',14)}${g.g}</button>${open?`<div class="mo-sub">${items.map(([k,l])=>`<button class="mo-i" data-a="go" data-x="${k}"><span>${esc(l)}</span>${S.favs.includes(k)?ico('star',13,'fill mo-star'):''}</button>`).join('')}</div>`:''}`}).join('');
    return h||'<p class="mo-empty">Nothing matches.</p>'}
  if(type==='fav'){const l=S.favs.filter(k=>!q||keyLabel(k).toLowerCase().includes(q));return l.length?l.map(k=>`<div class="mo-row"><button class="mo-i" data-a="go" data-x="${k}">${esc(keyLabel(k))}</button><button class="ib dk" data-a="favRemove" data-x="${k}" aria-label="Remove ${esc(keyLabel(k))} from favorites">${ico('star',14,'fill mo-star')}</button></div>`).join(''):'<p class="mo-empty">No favorites yet. Tap the star on an open tab to add it here.</p>'}
  const l=S.hist.filter(h=>!q||keyLabel(h.k).toLowerCase().includes(q));
  return l.length?l.map(h=>`<div class="mo-row"><button class="mo-i" data-a="go" data-x="${h.k}"><span>${esc(keyLabel(h.k))}</span><small>${ago(h.t)}</small></button></div>`).join(''):'<p class="mo-empty">Nothing opened yet.</p>';
}
function menuHTML(type,pre){
  return `<div class="mo-h"><label class="mo-f">${ico('filter',14)}<span class="sr">Filter</span><input id="${pre}-q" placeholder="Filter" autocomplete="off" value="${esc(S.menuQ)}"></label>${type==='all'&&!phone()?`<button class="ib dk" data-a="pin" aria-pressed="${S.pinned}" aria-label="${S.pinned?'Unpin menu':'Pin menu to the side'}" title="${S.pinned?'Unpin':'Pin to the side'}">${ico('pin')}</button>`:''}</div><div class="mo-list" id="${pre}-list">${menuList(type,S.menuQ.trim().toLowerCase())}</div>`;
}
function renderPinned(){const p=$('#pinned');if(S.pinned&&!phone()){if(!p.contains(document.activeElement)||p.hidden)p.innerHTML=`<p class="pin-t">All</p>`+menuHTML('all','pin');else $('#pin-list').innerHTML=menuList('all',S.menuQ.trim().toLowerCase());p.hidden=false}else p.hidden=true}
function searchResults(q){
  q=q.trim().toLowerCase();if(!q)return [];const r=[];
  Object.entries(PAGES).forEach(([k,p])=>{if(p.l.toLowerCase().includes(q))r.push({k:'pg:'+k,l:p.l,g:'Pages'});(p.subs||[]).forEach(([s,l])=>{if(l.toLowerCase().includes(q))r.push({k:'pg:'+k+'/'+s,l:p.l+': '+l,g:'Pages'})})});
  T.forEach(t=>{if(t.id.includes(q))r.push({k:'profile:'+t.id,l:t.id,g:'Traders',s:`★ ${t.rating.toFixed(1)} · ${u(t.trades)} orders`})});
  S.deals.forEach(d=>{if(d.id.toLowerCase().includes(q)||d.cp.includes(q))r.push({k:'deal:'+d.id,l:'Order '+d.id,g:'Your orders',s:`${u(d.usdt)} USDT · ${ST[d.st][0]}`})});
  S.offers.forEach(o=>{if(o.status==='online'&&(o.id.toLowerCase().includes(q)||String(o.avail).includes(q)))r.push({k:'offer:'+o.id,l:o.id,g:'Ads',s:`${o.side==='sell'?'Selling':'Buying'} ${u(o.avail)} USDT · ${nm(o.by)}`})});
  KB.forEach(a=>{if(a.title.toLowerCase().includes(q)||a.sum.toLowerCase().includes(q))r.push({k:'kb:'+a.id,l:a.title,g:'Help articles',s:a.id})});
  S.cases.forEach(c=>{if(c.id.toLowerCase().includes(q)||c.subj.toLowerCase().includes(q))r.push({k:'case:'+c.id,l:c.subj,g:'Your requests',s:c.id})});
  return r.slice(0,14);
}
function searchList(){const r=searchResults(S.q);if(!S.q.trim())return '<p class="empty">Type a trader, an order number, an amount or a question.</p>';if(!r.length)return '<p class="empty">No results.</p>';let g='';return r.map(x=>{const h=x.g!==g?`<p class="sr-g">${x.g}</p>`:'';g=x.g;return h+`<button class="mi" data-a="go" data-x="${x.k}"><span><b>${esc(x.l)}</b>${x.s?`<br><span class="small muted">${esc(x.s)}</span>`:''}</span></button>`}).join('')}
function popHTML(p){
  if(p==='bell'){const l=S.notifs.slice().reverse().slice(0,8);return `<div class="pop-h">Notifications<span class="btns">${l.some(n=>!n.read)?'<button class="link small" data-a="readAll">Mark all as read</button>':''}</span></div><div class="pop-b">${l.length?l.map(n=>`<button class="nt${n.read?'':' unread'}" data-a="notif" data-x="${n.id}"><span class="dot"></span><span><b>${esc(n.title)}</b><span>${esc(n.body)}</span><time>${ago(n.t)}</time></span></button>`).join(''):'<p class="empty">No notifications yet.</p>'}</div><div class="ps-f" style="border-top:1px solid var(--line);border-bottom:0"><button class="link" data-a="go" data-x="pg:notifs">View all notifications</button><button class="link ml" data-a="go" data-x="pg:account/notify">Settings</button></div>`}
  if(p==='user')return `<div class="pop-h"><span class="who">${av('you')}<span class="who-n"><b>You${idok}</b><span class="small muted">Level ${ME.kyc} verified · Telegram linked</span></span></span></div><div class="pop-b"><button class="mi" data-a="go" data-x="profile:you">${ico('user')} My profile</button><button class="mi" data-a="go" data-x="pg:account/verify">${ico('id')} Verification</button><button class="mi" data-a="go" data-x="pg:account/security">${ico('lock')} Security</button><button class="mi" data-a="prefs">${ico('gear')} Preferences</button><button class="mi" data-a="go" data-x="pg:admin/dash">${ico('shield')} Admin workspace</button><button class="mi" data-a="va">${ico('bot')} Help assistant</button><button class="mi" data-a="signout">${ico('logout')} Sign out</button></div>`;
  return `<form class="ps-f" id="psf"><label class="sr" for="gsearch2">Search</label><input class="in" id="gsearch2" type="search" placeholder="Search traders, orders, help" autocomplete="off" value="${esc(S.q)}"></form><div class="pop-b" id="srch">${searchList()}</div>`;
}
function renderPop(){
  const ov=$('#menuOv'),pp=$('#pop'),sc=$('#ovScrim'),p=S.pop;
  if(p==='all'||p==='fav'||p==='hist'){ov.innerHTML=menuHTML(p,'mo');ov.hidden=false;sc.hidden=false;const b=document.querySelector(`.hm[data-x="${p}"]`);const r=b&&b.getBoundingClientRect();ov.style.left=phone()?'0px':Math.max(8,r?r.left:8)+'px'}
  else{ov.hidden=true;sc.hidden=true}
  if(p==='bell'||p==='user'||p==='search'){
    if(p==='search'&&!phone()){pp.innerHTML=`<div class="pop-b" id="srch">${searchList()}</div>`;const r=$('#gs-box').getBoundingClientRect();pp.style.left=Math.max(8,Math.min(r.left,innerWidth-380))+'px';pp.style.right='auto'}
    else{pp.innerHTML=popHTML(p);pp.style.left='';pp.style.right=''}
    pp.hidden=false;pp.setAttribute('aria-label',p==='bell'?'Notifications':p==='user'?'Account':'Search results');
  }else pp.hidden=true;
  document.querySelectorAll('.hm').forEach(b=>{const x=b.dataset.x;b.classList.toggle('on',x===p||(x==='all'&&S.pinned));b.setAttribute('aria-expanded',x===p)});
}
function openPop(p){S.pop=S.pop===p?null:p;if(p==='all'||p==='fav'||p==='hist')S.menuQ='';renderPop();
  if(S.pop==='all'||S.pop==='fav'||S.pop==='hist'){const i=$('#mo-q');if(i&&!phone())i.focus()}
  if(S.pop==='search'&&phone()){const i=$('#gsearch2');if(i)i.focus()}}
function closePops(){if(!S.pop)return;S.pop=null;renderPop()}

/* ---------- sign-in screen ---------- */
function renderSignin(){const s=$('#signin');if(S.signedIn){s.hidden=true;s.innerHTML='';return}
  if(!s.hidden&&s.dataset.st===String(S.signing))return;s.dataset.st=String(S.signing);
  s.innerHTML=`<div class="si-card" role="dialog" aria-modal="true" aria-labelledby="si-t"><span class="logo"><span class="logo-mark">${ico('swap',16)}</span><span>simple<em>.p2p</em></span></span><h1 id="si-t">Log in to simple.p2p</h1><p class="muted">Buy and sell USDT with local money. Your Telegram account is your login, so there is no password to lose.</p>
    ${S.signing?`${alertHTML('info','Open Telegram and tap <b>Confirm</b> on the message from the simple.p2p bot.','Check Telegram.')}<button class="btn lg full" disabled>Waiting for Telegram…</button>`:`<button class="tgbtn" data-a="signin">${ico('send',18)} Log in with Telegram</button>`}
    <p class="small muted">Inside Telegram? Open the Mini App from the bot and you are logged in automatically.</p><p class="small muted">By logging in you agree to the trading rules and privacy notice.</p></div>`;s.hidden=false;
  const b=s.querySelector('.tgbtn');if(b)b.focus()}
