/* ---------- P2P trading list ---------- */
const TRADE_VIEWS=[
  {id:'buy-ready',g:'Buy USDT',l:'Ready now',side:'sell',ready:true,cr:['Type = Selling USDT','Ready now = true']},
  {id:'buy-all',g:'Buy USDT',l:'All sellers',side:'sell',cr:['Type = Selling USDT']},
  {id:'buy-bank',g:'Buy USDT',l:'Bank transfer',side:'sell',m:'Bank transfer',cr:['Type = Selling USDT','Payment = Bank transfer']},
  {id:'buy-instant',g:'Buy USDT',l:'Instant transfer',side:'sell',m:'Instant transfer',cr:['Type = Selling USDT','Payment = Instant transfer']},
  {id:'buy-mobile',g:'Buy USDT',l:'Mobile money',side:'sell',m:'Mobile money',cr:['Type = Selling USDT','Payment = Mobile money']},
  {id:'buy-cash',g:'Buy USDT',l:'Cash deposit',side:'sell',m:'Cash deposit',cr:['Type = Selling USDT','Payment = Cash deposit']},
  {id:'sell-all',g:'Sell USDT',l:'All buyers',side:'buy',sort:{k:'price',dir:-1},cr:['Type = Buying USDT']},
  {id:'sell-bank',g:'Sell USDT',l:'Bank transfer',side:'buy',sort:{k:'price',dir:-1},m:'Bank transfer',cr:['Type = Buying USDT','Payment = Bank transfer']},
  {id:'sell-mobile',g:'Sell USDT',l:'Mobile money',side:'buy',sort:{k:'price',dir:-1},m:'Mobile money',cr:['Type = Buying USDT','Payment = Mobile money']},
  {id:'saved-merchants',g:'Saved lists',l:'Verified merchants',side:'sell',merchant:true,cr:['Type = Selling USDT','Merchant = true']},
  {id:'saved-online',g:'Saved lists',l:'Online now',side:'sell',online:true,cr:['Type = Selling USDT','Online = true']},
  {id:'saved-follow',g:'Saved lists',l:'Traders I follow',follow:true,cr:['Trader is followed']}
];
const tradeView=()=>lview('trade');
const reqMiss=o=>{const r=o.req||{},m=[];if(r.kyc>ME.kyc)m.push(`ID check level ${r.kyc} (you have level ${ME.kyc})`);if(r.trades>ME.trades)m.push(`${r.trades}+ finished orders (you have ${ME.trades})`);return m};
const maxFiat=o=>Math.min(o.max,Math.floor(o.avail*o.price),trader(o.by).newbie?Math.floor(NEW_CAP*o.price):Infinity);
/* ready = the trader is online, inside their trading hours, and the USDT is already locked */
const ready=o=>o.status==='online'&&trader(o.by).online&&inHours(o)&&o.avail>0;
/* how far the price is from the market, in %, when it is suspiciously good for the taker */
const odd=o=>{const mk=CUR[o.fiat].market,d=(o.price-mk)/mk*100;return o.side==='sell'?(d<-1.5?d:0):(d>1.5?d:0)};
const oddTag=o=>odd(o)?`<span class="tag bad">${ico('alert',11)} ${Math.abs(odd(o)).toFixed(1)}% ${odd(o)<0?'below':'above'} market</span>`:'';
const hoursTag=o=>!o.hours||o.hours==='any'?'':inHours(o)?`<small>${hoursLabel(o)}</small>`:`<small style="color:var(--high)">Away now · ${hoursLabel(o)}</small>`;
function shieldList(o){const t=trader(o.by),buyIt=o.side==='sell';const L=buyIt?[[1,`${u(o.avail)} USDT is already locked by simple.p2p.`],[1,`${esc(o.by)}'s bank account is checked against their ID.`],[1,'You get a payment reference to put in the payment note.'],[1,`Pay only from your own account (${esc(ME.holder)}).`]]
    :[[1,'Your USDT stays locked until the money is in your own bank.'],[1,`The buyer must pay from their own name: ${esc(t.holder)}.`],[1,'Every order gets a payment reference and a proof pack for your bank.']];
  if(t.newbie)L.push([2,`New account: up to ${NEW_CAP} USDT per order until 10 finished orders.`]);
  if(odd(o))L.push([2,'Unusual price. Never move to a private chat for a "better deal".']);
  return `<ul class="shl">${L.map(([k,x])=>`<li class="${k===2?'warn':''}"><span class="d">${ico(k===2?'alert':'check',11)}</span><span>${x}</span></li>`).join('')}</ul>`}
function advCell(id){const t=trader(id);return `<span class="adv">${avp(id)}<span class="who-n"><b>${id==='you'?'You':`<button class="link" data-a="go" data-x="profile:${id}">${esc(id)}</button>`}${t.merchant?mbadge:''}${t.newbie?' <span class="tag warn">New</span>':''}</b><span class="meta">${u(t.t30)} orders · ${t.done}% · ${ico('clock',11)} ${t.rel} min</span></span></span>`}
LCFG.trade={menu:'left',menuTitle:'Lists',views:TRADE_VIEWS,sel:true,preview:id=>tradePreview(id),onPreview:id=>A.start(id),
  title:v=>v.g+': '+v.l,
  rows:v=>S.offers.filter(o=>o.status==='online'&&(!v.side||o.side===v.side)&&(!v.m||o.methods.includes(v.m))&&(!v.merchant||trader(o.by).merchant)&&(!v.online||trader(o.by).online)&&(!v.ready||ready(o))&&(!v.follow||S.follow.has(o.by))&&!S.blocked.has(o.by)),
  sort:{k:'price',dir:1},
  cols:[
    {k:'trader',l:'Advertiser',v:o=>advCell(o.by)+(o.by==='you'?' <span class="pill p-open nd">Your ad</span>':''),s:o=>o.by},
    {k:'rating',l:'Rating',v:o=>`${stars(trader(o.by).rating)} <span class="small muted">(${u(trader(o.by).reviews)})</span>`,s:o=>trader(o.by).rating},
    {k:'price',l:'Price',r:1,v:o=>`<span class="pr num">${m2(o.price)} <small>${o.fiat}${o.ptype==='float'?` · market ${o.margin>0?'+':''}${o.margin}%`:''}</small></span>${oddTag(o)}`,s:o=>o.price/CUR[o.fiat].market},
    {k:'avail',l:'Available / limit',r:1,v:o=>`<span class="lim num"><b>${u(o.avail)} USDT</b>${o.side==='sell'?`<span class="lkc" title="This USDT is already locked by simple.p2p">${ico('lock',11)} Locked</span>`:''}<small>${u(o.min)} – ${u(maxFiat(o))} ${o.fiat}</small></span>`,s:o=>o.avail},
    {k:'pay',l:'Payment',v:o=>{const t=trader(o.by);return `<span class="lim"><span class="tags">${o.methods.map(x=>`<span class="tag">${esc(x)}</span>`).join('')}${t.bank===ME.bank&&o.by!=='you'?'<span class="tag ok">Same bank</span>':''}</span><small>${esc(t.bank)}${o.methods.includes('Cash deposit')?' · '+esc(t.city):''}</small></span>`}},
    {k:'mins',l:'Pay within',v:o=>`<span class="lim">${o.mins} min${hoursTag(o)}</span>`,s:o=>o.mins}
  ],
  act:o=>o.by==='you'?`<button class="btn sm plain" data-a="go" data-x="ad:${o.id}">Edit</button>`:`<button class="btn sm pri" data-a="start" data-x="${o.id}"${S.paused?' disabled':''}>${o.side==='sell'?'Buy':'Sell'}</button>`,
  rowCls:o=>o.by==='you'?'mine':'',
  search:[['amount','Amount (LC)',(o,q)=>{const a=parseFloat(q);return !a||(a>=o.min&&a<=maxFiat(o))},'Amount you want to trade'],['trader','Trader',(o,q)=>o.by.includes(q),'Trader name'],['number','Ad number',(o,q)=>o.id.toLowerCase().includes(q),'O-2140']],
  builder:[{k:'fiat',l:'Currency',opts:[['LC','LC (local)'],['USD','USD']]},{k:'method',l:'Payment',opts:METHODS},{k:'bank',l:'Trader\'s bank',opts:BANKS},{k:'city',l:'City (for cash)',opts:CITIES},{k:'rating',l:'Rating',opts:[['4.5','4.5 and up'],['4.8','4.8 and up'],['4.9','4.9 and up']]},{k:'ready',l:'Ready now',opts:[['1','Yes']]},{k:'merchant',l:'Merchants only',opts:[['1','Yes']]}],
  cond:b=>{const c=[];if(b.fiat)c.push({l:'Currency = '+b.fiat,f:r=>r.fiat===b.fiat});if(b.method)c.push({l:'Payment = '+b.method,f:r=>r.methods.includes(b.method)});if(b.bank)c.push({l:'Bank = '+b.bank,f:r=>trader(r.by).bank===b.bank});if(b.city)c.push({l:'City = '+b.city,f:r=>trader(r.by).city===b.city});if(b.rating)c.push({l:'Rating ≥ '+b.rating,f:r=>trader(r.by).rating>=+b.rating});if(b.ready)c.push({l:'Ready now = true',f:ready});if(b.merchant)c.push({l:'Merchant = true',f:r=>trader(r.by).merchant});return c},
  bulk:[['follow','Follow these traders'],['hide','Hide from this list']],
  head:()=>`<button class="btn" data-a="malert">${ico('bell',14)} Alert me</button><button class="btn" data-a="go" data-x="pg:express">${ico('zap',14)} Quick trade</button><button class="btn pri" data-a="go" data-x="ad:new"${S.paused?' disabled':''}>Post an ad</button>`,
  empty:()=>emptyHTML('empty','No ads match','Try another list, or get an alert when a matching trader comes online.',`<div class="btns" style="justify-content:center"><button class="btn pri" data-a="malert">${ico('bell',14)} Alert me</button><button class="btn" data-a="go" data-x="ad:new">Post an ad</button></div>`)
};
lst('trade');
function tradePreview(id){const o=S.offers.find(x=>x.id===id);if(!o)return '';const t=trader(o.by),buyIt=o.side==='sell';
  return `<div class="lprev-h">${o.id}<button class="ib" data-a="lclosePrev" data-x="trade" aria-label="Close preview">${ico('x')}</button></div>
  <div class="pc">${advCell(o.by)}<span class="small muted">${stars(t.rating)} · ${u(t.trades)} orders in total · member since ${t.since}</span></div>
  <div class="pc">${ro('Price',m2(o.price)+' '+o.fiat+(o.ptype==='float'?` (market ${o.margin>0?'+':''}${o.margin}%)`:''))}${ro('Available',u(o.avail)+' USDT')}${ro('Limit',`${u(o.min)} – ${u(maxFiat(o))} ${o.fiat}`)}${ro('Payment',o.methods.join(', '))}${ro('Pay within',o.mins+' min')}</div>
  <div class="pc"><h4>Terms</h4><p>${esc(o.terms)}</p>${reqMiss(o).length?`<p class="small" style="color:var(--crit)"><b>Needs:</b> ${esc(reqMiss(o).join(', '))}</p>`:''}</div>
  ${o.by==='you'?'':`<div class="pc"><h4>Safety checks</h4>${shieldList(o)}</div><button class="btn pri lg full" data-a="start" data-x="${o.id}"${S.paused?' disabled':''}>${buyIt?'Buy':'Sell'} USDT</button>`}`}
const maLabel=a=>`${a.side==='buy'?'Buy':'Sell'} · ${esc(a.method||'any method')} · ${esc(a.bank||'any bank')} · ${a.side==='buy'?'at most':'at least'} ${m2(a.price)} LC`;
const maMatch=(a,o)=>o.status==='online'&&o.by!=='you'&&o.fiat==='LC'&&o.side===(a.side==='buy'?'sell':'buy')&&(!a.method||o.methods.includes(a.method))&&(!a.bank||trader(o.by).bank===a.bank)&&(a.side==='buy'?o.price<=a.price:o.price>=a.price)&&!odd(o);
function maCheck(o){S.malerts.forEach(a=>{if(a.on&&maMatch(a,o)){a.hit++;notify(`Match: ${o.by} is ${o.side==='sell'?'selling':'buying'} at ${m2(o.price)} LC`,`${o.methods.join(', ')} · ${trader(o.by).bank}. Tap to open the ad.`,'offer:'+o.id,'Price alerts')}})}
const maStrip=()=>S.malerts.length?`<div class="malerts">${ico('bell',15)}<b>Your alerts</b>${S.malerts.map(a=>`<span class="tag">${maLabel(a)}${a.hit?` · ${a.hit} found`:''} <button class="link small" data-a="maDel" data-x="${a.id}" aria-label="Remove this alert">Remove</button></span>`).join('')}<span class="small muted">We message you here and in the Telegram bot.</span></div>`:'';
function vTrade(){const bl=S.blocked.size;return `${pausedAlert()}${maStrip()}${listHTML('trade')}${bl?`<p class="small muted">${bl} blocked trader${bl>1?'s are':' is'} hidden. <button class="link" data-a="go" data-x="pg:account/people">Manage</button></p>`:''}`}

/* ---------- home (landing page) ---------- */
const pausedAlert=()=>S.paused?alertHTML('critical','Open orders still finish normally.','New orders are paused by the admin.'):'';
function greet(){const h=new Date().getHours();return h<12?'Good morning':h<18?'Good afternoon':'Good evening'}
function todoText(d){const tot=`${m2(d.total)} ${d.fiat}`;
  if(d.st==='disputed')return 'The admin is checking this appeal';
  if(d.side==='buy')return d.st==='locked'?`Pay ${tot} to ${d.cp}`:`Wait for ${d.cp} to release`;
  return d.st==='locked'?`Wait for ${d.cp} to pay you`:`Check your bank, then release`}
function boardTiles(){
  const mine=S.deals.filter(d=>!d.past).map(d=>({id:d.id,buyer:d.side==='buy'?'you':d.cp,seller:d.side==='sell'?'you':d.cp,usdt:d.usdt,fiat:d.fiat,price:d.price,method:d.method,st:d.st==='disputed'?'paid':ACTIVE.includes(d.st)?d.st:'done',real:d.st,t:d.stT,mine:true,fresh:d.fresh}));
  return S.onlyMine?mine:mine.concat(S.board)}
function tileHTML(x){return `<button class="tile${x.mine?' mine':''}${x.fresh?' fresh':''}" data-a="tile" data-x="${x.id}">
  <span class="t-no">${x.id}${x.mine?' · yours':''}</span>
  <span class="t-ti num">${u(x.usdt)} USDT <span class="muted">· ${m2(x.usdt*x.price)} ${x.fiat}</span></span>
  <span class="t-flow">${av(x.buyer,'sm')}<span class="t-n">${esc(nm(x.buyer))}</span>${ico('chevR',12)}${av(x.seller,'sm')}<span class="t-n">${esc(nm(x.seller))}</span></span>
  <span class="t-pills">${pill(x.real||x.st)}<span class="tag">${esc(x.method)}</span><span class="t-ago">${ago(x.t)}</span></span></button>`}
function offerTile(o){const mine=o.by==='you';return `<button class="tile${mine?' mine':''}" data-a="${mine?'go':'start'}" data-x="${mine?'ad:'+o.id:o.id}">
  <span class="t-no">${o.id}</span><span class="t-ti num">${o.side==='sell'?'Selling':'Buying'} ${u(o.avail)} USDT</span>
  <span class="t-flow">${av(o.by,'sm')}<span class="t-n">${esc(nm(o.by))}</span>${mine?'':stars(trader(o.by).rating)}</span>
  <span class="t-pills">${pill('open')}<span class="tag num">${m2(o.price)} ${o.fiat}</span><span class="tag">${esc(o.methods[0])}</span></span></button>`}
function setupSteps(){return [['Link your Telegram account',true,''],['Verify your name and phone',ME.kyc>=1,'pg:account/verify'],['Verify your ID for higher limits',ME.kyc>=2,'pg:account/verify'],['Add a payment method',S.pms.length>0,'pg:account/payments'],['Turn on two-step login',ME.tfa,'pg:account/security'],['Set an anti-phishing code',!!ME.phish,'pg:account/security'],['Finish your first order',ME.trades>0,'list:buy-all']]}
function vHome(){
  const mine=activeMine(),others=S.offers.filter(o=>o.by!=='you'&&o.status==='online');
  const inProg=S.board.filter(b=>b.st!=='done').length+mine.length;
  const ph=S.priceHist,price=ph[ph.length-1],ch=(price-ph[0])/ph[0]*100;
  const all=boardTiles();
  const open=S.onlyMine?S.offers.filter(o=>o.by==='you'&&o.status==='online'):others.slice().sort((a,b)=>b.t-a.t).slice(0,5);
  const cols=[['Open',open.map(offerTile)],['Locked',all.filter(x=>x.st==='locked').map(tileHTML)],['Paid',all.filter(x=>x.st==='paid').map(tileHTML)],['Done',all.filter(x=>x.st==='done').map(tileHTML)]];
  const colPill=['open','locked','paid','done'];
  const steps=setupSteps(),okN=steps.filter(s=>s[1]).length;
  const an=S.anns[0];
  return `${pausedAlert()}${!S.annOff&&an?`<div class="ann" role="status">${ico('info',16)}<span class="grow"><b>${esc(an.title)}.</b> ${esc(an.body)}</span><button class="ib" data-a="annOff" aria-label="Dismiss announcement">${ico('x',14)}</button></div>`:''}
  <section class="hero"><div class="hero-art" style="background-image:url(${img('hero')})" aria-hidden="true"></div><div class="hero-t"><p class="eyebrow">simple.p2p / Home</p><h1>${greet()}. Trade USDT with people you can trust.</h1><p>Buy and sell with local money. simple.p2p holds the USDT until the money arrives.</p>
    <div class="btns"><button class="btn pri lg" data-a="go" data-x="list:buy-ready">Buy USDT</button><button class="btn lg" data-a="go" data-x="list:sell-all">Sell USDT</button><button class="btn lg plain" data-a="go" data-x="pg:express">${ico('zap',15)} Quick trade</button></div></div><div class="kpis hero-k">
    <section class="kpi"><div class="kpi-h">USDT price <span class="tag">LC</span></div><div class="kpi-v num">${m2(price)} <small>LC</small></div><div class="kpi-s ${ch>=0?'up':'down'}">${ch>=0?'▲':'▼'} ${Math.abs(ch).toFixed(2)}% today</div>${spark(ph)}</section>
    <section class="kpi"><div class="kpi-h">Open ads</div><div class="kpi-v num">${others.length}</div><div class="kpi-s">${others.filter(o=>o.side==='sell').length} selling · ${others.filter(o=>o.side==='buy').length} buying</div><button class="link" data-a="go" data-x="list:buy-all">See all ads</button></section>
    <section class="kpi"><div class="kpi-h">Orders in progress</div><div class="kpi-v num">${inProg}</div><div class="kpi-s">${S.doneToday} finished today</div><div class="bar"><i style="width:${Math.min(100,inProg*7)}%"></i></div></section>
    <section class="kpi"><div class="kpi-h">Your balance</div><div class="kpi-v num">${u(S.wallet.avail+S.wallet.held+S.wallet.ads)} <small>USDT</small></div><div class="kpi-s">${u(S.wallet.avail)} free · ${u(S.wallet.held+S.wallet.ads)} locked</div><button class="link" data-a="go" data-x="pg:wallet/assets">Open wallet</button></section>
  </div></section>
  <div class="ov-g">
    <section class="card"><div class="card-h"><h2 class="card-t">Live orders</h2><span class="small muted">Orders move left to right. Yours are outlined.</span><div class="seg ml" role="group" aria-label="Which orders"><button class="${S.onlyMine?'':'on'}" data-a="onlyMine" data-x="0" aria-pressed="${!S.onlyMine}">All</button><button class="${S.onlyMine?'on':''}" data-a="onlyMine" data-x="1" aria-pressed="${S.onlyMine}">Mine</button></div></div>
      <div class="card-b"><div class="board">${cols.map((c,i)=>`<section class="bcol" aria-label="${c[0]}"><div class="bcol-h">${pill(colPill[i])}<span class="c">${c[1].length}</span></div>${c[1].join('')||`<p class="bcol-e">${i===0&&S.onlyMine?'You have no open ads.':'Nothing here right now.'}</p>`}</section>`).join('')}</div></div></section>
    <div class="vstack">
      <section class="card todo-card"><div class="card-h"><h2 class="card-t">Your to-dos</h2><span class="cnt">${mine.length}</span></div>
        <div class="card-b todos">${mine.length?mine.map(d=>`<article class="todo"><span class="t-no">${d.id} · ${d.side==='buy'?'Buying':'Selling'} ${u(d.usdt)} USDT</span><b>${esc(todoText(d))}</b><span class="t-pills">${pill(d.st)}${d.st==='locked'?`<span class="pill p-high nd">${ico('clock',12)}<span data-left="${d.payBy}">${dur(d.payBy-now())}</span></span>`:''}</span><button class="btn sm pri" data-a="go" data-x="deal:${d.id}">Open order</button></article>`).join(''):`<p class="empty">Nothing to do right now.<br><button class="link" data-a="go" data-x="list:buy-all">Find an ad</button></p>`}</div></section>
      <section class="card"><div class="card-h"><h2 class="card-t">Get set up</h2><span class="cnt">${okN}/${steps.length}</span></div><div class="card-b"><div class="bar" style="margin-bottom:8px"><i style="width:${okN/steps.length*100}%"></i></div><ul class="chkl">${steps.map(([l,ok,k])=>`<li class="${ok?'ok':''}"><span class="d">${ok?ico('check',12):''}</span><span class="ct">${l}</span>${ok||!k?'':`<button class="link small" data-a="go" data-x="${k}">Start</button>`}</li>`).join('')}</ul></div></section>
    </div>
  </div>`;
}

/* ---------- quick trade (express) ---------- */
S.ex={side:'buy',amt:'1000',fiat:'LC',m:''};
function exMatches(){const e=S.ex,a=parseFloat(e.amt)||0;
  return S.offers.filter(o=>o.status==='online'&&o.by!=='you'&&!S.blocked.has(o.by)&&o.side===(e.side==='buy'?'sell':'buy')&&o.fiat===e.fiat&&(!e.m||o.methods.includes(e.m))&&!reqMiss(o).length&&ready(o)&&!odd(o)&&(e.side==='buy'?(a>=o.min&&a<=maxFiat(o)):(a*o.price>=o.min&&a*o.price<=maxFiat(o))))
    .sort((x,y)=>e.side==='buy'?x.price-y.price||trader(y.by).done-trader(x.by).done:y.price-x.price)}
function exResult(){const e=S.ex,a=parseFloat(e.amt)||0,m=exMatches(),b=m[0];
  if(!a)return `<p class="muted">Enter an amount.</p>`;
  if(!b)return alertHTML('warning','No ad fits this amount right now. Try a different amount or payment method.','No match.');
  const t=trader(b.by),get=e.side==='buy'?a/b.price:a*b.price;
  return `<div class="give-get num"><div><span class="lbl">You ${e.side==='buy'?'pay':'sell'}</span><b>${e.side==='buy'?m2(a)+' '+e.fiat:u(a)+' USDT'}</b></div><div><span class="lbl">You get about</span><b>${e.side==='buy'?u(+get.toFixed(2))+' USDT':m2(get)+' '+e.fiat}</b></div></div>
  <div class="pc" style="box-shadow:none;border:1px solid var(--line)"><span class="lbl">Best match</span>${advCell(b.by)}<span class="small muted">Price <b class="num">${m2(b.price)} ${b.fiat}</b> · ${esc(b.methods.join(', '))} · ${stars(t.rating)}</span></div>
  <button class="btn pri lg full" data-a="exGo" data-x="${b.id}"${S.paused?' disabled':''}>${e.side==='buy'?'Buy':'Sell'} USDT · 0 fee</button>
  ${m.length>1?`<button class="link small" data-a="go" data-x="list:${e.side==='buy'?'buy-all':'sell-all'}">${m.length-1} other matching ad${m.length>2?'s':''}</button>`:''}`}
function vExpress(){const e=S.ex;
  return `${pausedAlert()}${phead('Quick trade','Enter an amount. We pick the best ad for you.')}
  <div class="g2" style="align-items:start"><section class="sect"><div class="seg" role="group" aria-label="Buy or sell"><button class="${e.side==='buy'?'on':''}" data-a="exSide" data-x="buy">Buy USDT</button><button class="${e.side==='sell'?'on':''}" data-a="exSide" data-x="sell">Sell USDT</button></div>
    <div class="fld"><label class="lbl" for="ex-amt">${e.side==='buy'?'I want to spend':'I want to sell'}</label><div class="amt"><input id="ex-amt" inputmode="decimal" value="${esc(e.amt)}" autocomplete="off"><span class="u">${e.side==='buy'?e.fiat:'USDT'}</span></div></div>
    <div class="g2">${fsel('ex-fiat','Currency',[['LC','LC (local)'],['USD','USD']],e.fiat)}${fsel('ex-m','Payment method',[['','Any method']].concat(METHODS),e.m)}</div>
    <div id="ex-res" class="vstack" style="gap:10px">${exResult()}</div></section>
  <section class="ill"><div class="vstack"><h2>How quick trade works</h2><ol class="stps"><li class="done"><span class="d">1</span>We find the best price from verified traders.</li><li class="done"><span class="d">2</span>The USDT is locked before you pay anything.</li><li class="done"><span class="d">3</span>You pay the seller, they release, done.</li></ol><button class="link" data-a="go" data-x="kb:KB0010003">Read: How to buy USDT</button></div></section></div>`}

/* ---------- start an order (modal) ---------- */
function startModal(m){const o=S.offers.find(x=>x.id===m.id);if(!o||o.status!=='online')return {title:'Ad not available',body:emptyHTML('empty','This ad is gone','Someone took the last of it, or the trader took it offline.'),foot:'<button class="btn pri" data-a="mclose">OK</button>'};
  const t=trader(o.by),buyIt=o.side==='sell',miss=reqMiss(o),mx=maxFiat(o);
  const myPms=S.pms.filter(p=>o.methods.includes(p.type));
  const usdtMax=buyIt?o.avail:Math.min(o.avail,S.wallet.avail);
  const pay=buyIt?`<fieldset class="fld" style="border:0;margin:0;padding:0"><legend class="lbl req">Pay with</legend><div class="chips">${o.methods.map((x,i)=>`<label class="chk"><input type="radio" name="st-pm" value="${esc(x)}"${(m.pm||o.methods[0])===x?' checked':''}> ${ico(MICON[x],14)} ${esc(x)}</label>`).join('')}</div></fieldset>`
    :myPms.length?fsel('st-pm','Receive the money into',myPms.map(p=>[p.id,`${p.type} · ${p.bank} · ${p.acct.slice(-4)}`]),m.pm||myPms[0].id,true)
    :alertHTML('warning',`This buyer pays by ${esc(o.methods.join(' or '))}. Add one of these to your payment methods first. <button class="link" data-a="go" data-x="pg:account/payments">Add payment method</button>`,'No matching payment method.');
  return {title:`${buyIt?'Buy':'Sell'} USDT ${buyIt?'from':'to'} ${esc(o.by)}`,body:`<div class="who">${avp(o.by)}<div class="who-n"><b><button class="link" data-a="go" data-x="profile:${o.by}">${esc(o.by)}</button>${t.merchant?mbadge:''}</b><span class="small muted">${stars(t.rating)} · ${u(t.t30)} orders · ${t.done}% completed · releases in about ${t.rel} min</span></div></div>
    ${miss.length?alertHTML('warning',`This trader only trades with people who have: ${esc(miss.join('; '))}. <button class="link" data-a="go" data-x="pg:account/verify">Go to verification</button>`,'You cannot take this ad yet.'):''}
    ${odd(o)?alertHTML('high',`This price is ${Math.abs(odd(o)).toFixed(1)}% ${odd(o)<0?'below':'above'} the market. Very good prices are a common trick to pull people into private deals. Only pay inside this order.`,'Unusual price.'):''}
    ${t.newbie?alertHTML('moderate',`${esc(o.by)} joined ${t.days} days ago and has ${t.trades} finished orders. New accounts can trade up to ${NEW_CAP} USDT per order.`,'New account.'):''}
    ${!inHours(o)?alertHTML('moderate',`${esc(o.by)} trades ${hoursLabel(o)}. They may reply late.`,'Outside trading hours.'):''}
    <div class="g2"><div class="fld"><label class="lbl" for="st-a">${buyIt?'I want to pay':'I want to sell'}</label><div class="amt"><input id="st-a" inputmode="decimal" value="${esc(m.a||'')}" placeholder="${buyIt?u(o.min)+' – '+u(mx):'0'}" autocomplete="off"><span class="u">${buyIt?o.fiat:'USDT'}</span><button class="link" data-a="stAll">All</button></div></div>
      <div class="fld"><label class="lbl" for="st-b">I will receive</label><div class="amt"><input id="st-b" inputmode="decimal" value="${esc(m.b||'')}" placeholder="0" autocomplete="off"><span class="u">${buyIt?'USDT':o.fiat}</span></div></div></div>
    <p class="small muted num">Price <b>${m2(o.price)} ${o.fiat}</b> · limit ${u(o.min)} – ${u(mx)} ${o.fiat} · available ${u(o.avail)} USDT${buyIt?'':` · you have ${u(S.wallet.avail)} USDT free`}</p>
    <p class="ferr" id="st-err" role="alert">${esc(m.err||'')}</p>
    ${pay}
    <div class="g2">${ro('Pay within',o.mins+' min')}${ro('Fee','0 USDT (beta)')}</div>
    <div class="fld"><span class="lbl">Trader's terms</span><div class="ro" style="background:var(--warn-bg);border-color:var(--warn-line)">${esc(o.terms)}</div></div>
    <div class="fld"><span class="lbl">Safety checks</span>${shieldList(o)}</div>`,
    foot:`<button class="btn plain" data-a="mclose">Cancel</button><button class="btn pri" data-a="confirmStart" data-x="${o.id}"${miss.length||S.paused||(!buyIt&&!myPms.length)?' disabled':''}>${buyIt?'Buy':'Sell'} USDT</button>`,usdtMax}}
