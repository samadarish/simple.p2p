/* ---------- my orders (list page) ---------- */
const ORDER_VIEWS=[
  {id:'active',g:'Open',l:'In progress',f:d=>ACTIVE.includes(d.st),cr:['State = in progress']},
  {id:'todo',g:'Open',l:'Waiting for me',f:needsMe,cr:['State = in progress','Next step = you']},
  {id:'appeal',g:'Open',l:'Appeals',f:d=>d.st==='disputed'||(d.st==='refunded'),cr:['Appeal = true']},
  {id:'done',g:'History',l:'Completed',f:d=>d.st==='done',cr:['State = done']},
  {id:'cancelled',g:'History',l:'Cancelled or expired',f:d=>['cancelled','expired','refunded'].includes(d.st),cr:['State = cancelled, expired or returned']},
  {id:'all',g:'History',l:'All orders',f:()=>true,cr:[]}
];
LCFG.orders={menu:'left',menuTitle:'Orders',views:ORDER_VIEWS,rows:v=>S.deals.filter(v.f),sort:{k:'created',dir:-1},title:v=>'Orders: '+v.l,
  cols:[
    {k:'number',l:'Number',v:d=>`<button class="link" data-a="go" data-x="deal:${d.id}">${d.id}</button>${d.unread?` <span class="nb" style="position:static;display:inline-block">${d.unread}</span>`:''}`,s:d=>+d.id.slice(2)},
    {k:'type',l:'Type',v:d=>`<span class="pill nd ${d.side==='buy'?'p-done':'p-bad'}">${d.side==='buy'?'Buy':'Sell'}</span>`,s:d=>d.side},
    {k:'cp',l:'Counterparty',v:d=>`<span class="who">${av(d.cp,'sm')}<button class="link" data-a="go" data-x="profile:${d.cp}">${esc(d.cp)}</button></span>`,s:d=>d.cp},
    {k:'amount',l:'Amount',r:1,v:d=>`<b class="num">${u(d.usdt)}</b> USDT`,s:d=>d.usdt},
    {k:'total',l:'Total',r:1,v:d=>`<span class="num">${m2(d.total)} ${d.fiat}</span>`,s:d=>d.total},
    {k:'method',l:'Payment',v:d=>`<span class="tag">${esc(d.method)}</span>`,s:d=>d.method},
    {k:'state',l:'State',v:d=>pill(d.st),s:d=>d.st},
    {k:'created',l:'Created',v:d=>dtime(d.t0),s:d=>d.t0}],
  act:d=>`<button class="btn sm${needsMe(d)?' pri':''}" data-a="go" data-x="deal:${d.id}">${needsMe(d)?'Act now':'Open'}</button>`,
  search:[['number','Number',(d,q)=>d.id.toLowerCase().includes(q),'D-2090'],['cp','Counterparty',(d,q)=>d.cp.includes(q),'Trader name'],['amount','Amount',(d,q)=>String(d.usdt).includes(q),'USDT amount']],
  builder:[{k:'side',l:'Type',opts:[['buy','Buy'],['sell','Sell']]},{k:'method',l:'Payment',opts:METHODS},{k:'when',l:'Created',opts:[['1','Today'],['7','Last 7 days'],['30','Last 30 days']]}],
  cond:b=>{const c=[];if(b.side)c.push({l:'Type = '+(b.side==='buy'?'Buy':'Sell'),f:d=>d.side===b.side});if(b.method)c.push({l:'Payment = '+b.method,f:d=>d.method===b.method});if(b.when)c.push({l:'Created in last '+b.when+' day'+(b.when>1?'s':''),f:d=>now()-d.t0<=+b.when*DAY});return c},
  head:()=>`<button class="btn" data-a="exportCsv">${ico('down',14)} Export</button>`,
  empty:v=>emptyHTML('empty',v.id==='active'||v.id==='todo'?'No orders in progress':'No orders here','When you buy or sell, your orders show up here.',`<button class="btn pri" data-a="go" data-x="list:buy-all">Find an ad</button>`)};
lst('orders');
function vOrders(){const a=activeMine(),todo=a.filter(needsMe).length,done=S.deals.filter(d=>d.st==='done'),vol=done.reduce((s,d)=>s+d.usdt,0);
  return `<div class="kpis"><section class="kpi"><div class="kpi-h">In progress</div><div class="kpi-v num">${a.length}</div><div class="kpi-s">${todo} waiting for you</div></section>
    <section class="kpi"><div class="kpi-h">Completed</div><div class="kpi-v num">${done.length}</div><div class="kpi-s">${u(vol)} USDT traded</div></section>
    <section class="kpi"><div class="kpi-h">Completion rate</div><div class="kpi-v num">${S.deals.length?Math.round(done.length/S.deals.filter(d=>!ACTIVE.includes(d.st)).length*100):100}%</div><div class="kpi-s">Cancelled orders lower it</div></section>
    <section class="kpi"><div class="kpi-h">Cancellations today</div><div class="kpi-v num">${S.cancels} <small>of 3</small></div><div class="bar${S.cancels>=2?' warn':''}"><i style="width:${S.cancels/3*100}%"></i></div></section></div>
  ${listHTML('orders')}`}

/* ---------- my ads (list page + form) ---------- */
const AD_VIEWS=[{id:'all',g:'My ads',l:'All',f:o=>true,cr:['Advertiser = you']},{id:'online',g:'My ads',l:'Online',f:o=>o.status==='online',cr:['Advertiser = you','Status = online']},{id:'offline',g:'My ads',l:'Offline',f:o=>o.status==='offline',cr:['Advertiser = you','Status = offline']},{id:'closed',g:'My ads',l:'Closed',f:o=>o.status==='closed',cr:['Advertiser = you','Status = closed']}];
LCFG.ads={menu:'pills',views:AD_VIEWS,rows:v=>S.offers.filter(o=>o.by==='you'&&v.f(o)),sort:{k:'number',dir:-1},title:()=>'My ads',
  cols:[
    {k:'number',l:'Number',v:o=>`<button class="link" data-a="go" data-x="ad:${o.id}">${o.id}</button>`,s:o=>+o.id.slice(2)},
    {k:'type',l:'Type',v:o=>`<span class="pill nd ${o.side==='sell'?'p-bad':'p-done'}">${o.side==='sell'?'Sell':'Buy'}</span>`,s:o=>o.side},
    {k:'price',l:'Price',r:1,v:o=>`<span class="pr num">${m2(o.price)} <small>${o.fiat}${o.ptype==='float'?` · market ${o.margin>0?'+':''}${o.margin}%`:' · fixed'}</small></span>`,s:o=>o.price},
    {k:'avail',l:'Available / total',r:1,v:o=>`<span class="lim num"><b>${u(o.avail)}</b> / ${u(o.total)} USDT<small>${u(o.min)} – ${u(o.max)} ${o.fiat}</small></span>`,s:o=>o.avail},
    {k:'pay',l:'Payment',v:o=>`<span class="tags">${o.methods.map(x=>`<span class="tag">${esc(x)}</span>`).join('')}</span>`},
    {k:'orders',l:'Orders',r:1,v:o=>u(o.orders),s:o=>o.orders},
    {k:'status',l:'Status',v:o=>o.status==='closed'?pl('Closed','p-low'):tsw(o.status==='online','adToggle',o.id,o.status==='online'?'Online':'Offline'),s:o=>o.status}],
  act:o=>o.status==='closed'?'':`<span class="btns" style="flex-wrap:nowrap"><button class="btn sm" data-a="go" data-x="ad:${o.id}">${ico('edit',13)} Edit</button><button class="ib" data-a="adClose" data-x="${o.id}" aria-label="Close ad ${o.id}" title="Close ad">${ico('trash')}</button></span>`,
  search:[['number','Number',(o,q)=>o.id.toLowerCase().includes(q),'O-2154']],
  head:()=>`<button class="btn pri" data-a="go" data-x="ad:new"${S.paused?' disabled':''}>${ico('plus',14)} Post an ad</button>`,
  empty:()=>emptyHTML('empty','You have no ads yet','Post an ad and other traders come to you. It is also posted to the Telegram channel.',`<button class="btn pri" data-a="go" data-x="ad:new">Post an ad</button>`)};
lst('ads');
function vAds(){const mine=S.offers.filter(o=>o.by==='you'),on=mine.filter(o=>o.status==='online');
  return `${pausedAlert()}${phead('My ads','Ads you post show up in P2P trading and on the Telegram channel.')}
  <div class="kpis"><section class="kpi"><div class="kpi-h">Online ads</div><div class="kpi-v num">${on.length}</div><div class="kpi-s">${mine.length-on.length} offline or closed</div></section>
    <section class="kpi"><div class="kpi-h">Reserved for ads</div><div class="kpi-v num">${u(S.wallet.ads)} <small>USDT</small></div><div class="kpi-s">Moves into an order when someone trades</div></section>
    <section class="kpi"><div class="kpi-h">Orders from ads</div><div class="kpi-v num">${mine.reduce((s,o)=>s+o.orders,0)}</div><div class="kpi-s">All time</div></section>
    <section class="kpi"><div class="kpi-h">Maker fee</div><div class="kpi-v num">0% <small>beta</small></div><div class="kpi-s">Later: ${S.set.maker}% per order</div></section></div>
  ${alertHTML('info','Sell ads lock your USDT the moment they go online, so buyers never wait for you to fund an order. If you miss 2 orders in a row, your ads go offline until you turn them back on. Set trading hours so your ads hide while you sleep.','Every ad is ready to trade.')}
  ${listHTML('ads')}`}
function newAdDraft(){return {id:null,side:'sell',fiat:'LC',ptype:'fixed',price:'3.67',margin:'0.5',total:'500',min:'100',max:'1835',methods:['Bank transfer'],mins:'15',hours:'any',terms:'',auto:'Hi! I am online. Please pay from an account in your own name.',kyc:'0',trades:'0',status:'online',err:''}}
function adDraftFrom(o){return {id:o.id,side:o.side,fiat:o.fiat,ptype:o.ptype,price:String(o.price),margin:String(o.margin),total:String(o.total),min:String(o.min),max:String(o.max),methods:o.methods.slice(),mins:String(o.mins),hours:o.hours||'any',terms:o.terms,auto:o.auto,kyc:String(o.req.kyc),trades:String(o.req.trades),status:o.status,err:''}}
const draftPrice=c=>c.ptype==='float'?+(CUR[c.fiat].market*(1+(parseFloat(c.margin)||0)/100)).toFixed(2):parseFloat(c.price)||0;
function adPrev(c){const p=draftPrice(c),a=parseFloat(c.total)||0;
  return `<span class="t-no">${c.id||'New ad'}</span>${advCell('you')}<span class="pr num">${m2(p)} <small>${c.fiat}${c.ptype==='float'?` · market ${(parseFloat(c.margin)||0)>0?'+':''}${parseFloat(c.margin)||0}%`:''}</small></span><span class="lim num"><b>${u(a)} USDT</b><small>${u(parseFloat(c.min)||0)} – ${u(parseFloat(c.max)||0)} ${c.fiat}</small></span><span class="t-pills">${(c.methods.length?c.methods:['No payment chosen']).map(m=>`<span class="tag">${esc(m)}</span>`).join('')}</span><span class="small muted">Pay within ${c.mins} min · ${c.side==='sell'?'You sell':'You buy'} USDT</span>`}
function vAdForm(id){if(!S.create||(id!=='new'&&S.create.id!==id)){const o=S.offers.find(x=>x.id===id);S.create=id==='new'||!o?newAdDraft():adDraftFrom(o)}
  const c=S.create,p=draftPrice(c),edit=!!c.id,miss=c.side==='sell'?c.methods.filter(m=>!S.pms.some(x=>x.type===m)):[];
  return `<article class="rec"><header class="rec-h"><div><h1>${edit?'Edit ad '+c.id:'Post an ad'}</h1><p class="sub">${edit?'Changes apply to new orders only.':'Your ad is listed in P2P trading and posted to the Telegram channel.'}</p></div><div class="btns"><button class="btn plain" data-a="closeTab" data-x="ad:${id}">Cancel</button><button class="btn pri" data-a="submitAd" data-x="${id}"${S.paused?' disabled':''}>${edit?'Save changes':'Post ad'}</button></div></header>
  ${c.err?`<div class="rec-al">${alertHTML('critical',esc(c.err),'Check the form.')}</div>`:''}
  <div class="rec-g"><form class="r-form" id="adf" novalidate><div class="vstack">
    <section class="sect"><div class="sect-h">1. Type and price</div><div class="f2">
      <div class="fld"><span class="lbl req">I want to</span><div class="seg" role="group" aria-label="Ad type"><button type="button" class="${c.side==='sell'?'on':''}" data-a="adSide" data-x="sell"${edit?' disabled':''}>Sell USDT</button><button type="button" class="${c.side==='buy'?'on':''}" data-a="adSide" data-x="buy"${edit?' disabled':''}>Buy USDT</button></div></div>
      ${fsel('af-fiat','Currency',[['LC','LC (local)'],['USD','USD']],c.fiat,true)}
      <div class="fld"><span class="lbl req">Price type</span><div class="seg" role="group" aria-label="Price type"><button type="button" class="${c.ptype==='fixed'?'on':''}" data-a="adPtype" data-x="fixed">Fixed</button><button type="button" class="${c.ptype==='float'?'on':''}" data-a="adPtype" data-x="float">Follows the market</button></div></div>
      ${c.ptype==='fixed'?finp('af-price','Price per USDT ('+c.fiat+')',c.price,{num:1,req:1,hint:`Market now: ${m2(CUR[c.fiat].market)} ${c.fiat}`}):finp('af-margin','Above or below market (%)',c.margin,{num:1,req:1,hint:`Your price now: <b id="af-pnow">${m2(p)} ${c.fiat}</b> · it moves with the market`})}
    </div></section>
    <section class="sect"><div class="sect-h">2. Amount and limits</div><div class="f2">
      ${finp('af-total','Total amount (USDT)',c.total,{num:1,req:1,hint:c.side==='sell'?`You have ${u(S.wallet.avail+(edit?S.offers.find(o=>o.id===c.id).avail:0))} USDT free. It is reserved while the ad is online.`:'How much USDT you want to buy in total.'})}
      <div class="fld"><span class="lbl">Total in ${c.fiat}</span><div class="ro num" id="af-tot">${m2((parseFloat(c.total)||0)*p)} ${c.fiat}</div></div>
      ${finp('af-min','Smallest order ('+c.fiat+')',c.min,{num:1,req:1})}${finp('af-max','Largest order ('+c.fiat+')',c.max,{num:1,req:1})}
    </div></section>
    <section class="sect"><div class="sect-h">3. Payment</div>
      <fieldset class="fld" style="border:0;margin:0;padding:0"><legend class="lbl req">${c.side==='sell'?'How buyers pay you':'How you pay sellers'}</legend><div class="chips">${METHODS.filter(m=>S.set.methods[m]).map(x=>`<label class="chk"><input type="checkbox" name="af-m" value="${x}"${c.methods.includes(x)?' checked':''}> ${ico(MICON[x],14)} ${x}</label>`).join('')}</div></fieldset>
      ${miss.length?alertHTML('warning',`You have no saved ${esc(miss.join(' or '))} account. Buyers need one to pay you. <button class="link" data-a="go" data-x="pg:account/payments">Add payment method</button>`,'Missing payment details.'):''}
      <div class="f2">${fsel('af-mins','Buyer must pay within',[['15','15 min'],['30','30 min'],['45','45 min'],['60','60 min']],c.mins)}${fsel('af-hours','Trading hours (ad hides outside them)',HOURS,c.hours)}</div></section>
    <section class="sect"><div class="sect-h">4. Terms and auto-reply</div><div class="f2">
      <div class="fld wide"><label class="lbl" for="af-terms">Terms (shown before the order starts)</label><textarea class="in" id="af-terms" placeholder="Example: pay only from your own account. No third-party payments.">${esc(c.terms)}</textarea></div>
      <div class="fld wide"><label class="lbl" for="af-auto">Auto-reply (sent in the chat when an order starts)</label><textarea class="in" id="af-auto" style="min-height:64px">${esc(c.auto)}</textarea></div></div></section>
    <section class="sect"><div class="sect-h">5. Who can trade with you</div><div class="f2">
      ${fsel('af-kyc','ID check needed',[['0','Anyone'],['1','Level 1 or higher'],['2','Level 2 only']],c.kyc)}${fsel('af-trades','Finished orders needed',[['0','No minimum'],['10','10 or more'],['50','50 or more']],c.trades)}
      ${fsel('af-status','After posting',[['online','Go online now'],['offline','Keep offline']],c.status)}</div></section>
  </div></form>
  <aside class="r-side"><div class="sp"><div class="sp-h">Preview</div><div class="pc" id="af-prev">${adPrev(c)}</div><p class="small muted">This is how other traders see your ad.</p><div class="pc"><h4>Tips</h4><ul class="small" style="padding-left:16px;list-style:disc"><li>Prices close to the market fill faster.</li><li>Clear terms mean fewer appeals.</li><li>Stay online while your ad is live.</li></ul></div><div class="pc"><h4>Not allowed</h4><p class="small muted">Card bill payments, gift cards, loans and "cash-out" offers. They often move stolen money, which gets bank accounts frozen. Ads with them are blocked.</p></div></div></aside></div></article>`}
function readAd(){const f=$('#adf');if(!f||!S.create)return;const c=S.create,v=id=>{const e=$('#'+id);return e?e.value:null};
  ['fiat','price','margin','total','min','max','mins','hours','terms','auto','kyc','trades','status'].forEach(k=>{const x=v('af-'+k);if(x!=null)c[k]=x});
  c.methods=[...f.querySelectorAll('input[name="af-m"]:checked')].map(i=>i.value)}
function updAd(){const c=S.create,p=draftPrice(c),pv=$('#af-prev'),t=$('#af-tot'),pn=$('#af-pnow');if(pv)pv.innerHTML=adPrev(c);if(t)t.textContent=m2((parseFloat(c.total)||0)*p)+' '+c.fiat;if(pn)pn.textContent=m2(p)+' '+c.fiat}
function submitAd(id){readAd();const c=S.create,a=parseFloat(c.total),p=draftPrice(c),mn=parseFloat(c.min),mx=parseFloat(c.max);
  const old=c.id&&S.offers.find(o=>o.id===c.id),free=S.wallet.avail+(old&&old.side==='sell'&&old.status!=='closed'?old.avail:0);
  c.err=!(p>0)?'Enter a price.':!(a>=10)?'The total must be at least 10 USDT.':!(mn>=10)?'The smallest order must be at least 10.':!(mx>=mn)?'The largest order must be bigger than the smallest.':mx>a*p+0.01?`The largest order cannot be more than the total (${m2(a*p)} ${c.fiat}).`:!c.methods.length?'Pick at least one payment method.':BANNED.test(c.terms+' '+c.auto)?'Card bills, gift cards, loans and cash-out offers are not allowed. They often move stolen money and get bank accounts frozen.':c.side==='sell'&&a>free?`You only have ${u(free)} USDT free. Deposit first.`:'';
  if(c.err&&/Card bills/.test(c.err))S.risk.unshift({id:'RA-'+(80+S.risk.length),user:'you',rule:'Tried to post an ad for card bills, gift cards or loans',sev:'moderate',st:'open',t:now()});
  if(c.err){render();return}
  if(old){if(old.side==='sell'&&old.status!=='closed'){S.wallet.ads-=old.avail;S.wallet.avail+=old.avail}
    Object.assign(old,{fiat:c.fiat,ptype:c.ptype,margin:parseFloat(c.margin)||0,price:p,total:a,avail:a,min:mn,max:mx,methods:c.methods.slice(),mins:+c.mins,hours:c.hours,terms:c.terms||TERMS[0],auto:c.auto,req:{kyc:+c.kyc,trades:+c.trades,reg:0},status:c.status});
    if(old.side==='sell'){S.wallet.avail-=a;S.wallet.ads+=a}toast('Ad saved')}
  else{const o={id:'O-'+(OID++),by:'you',side:c.side,ptype:c.ptype,margin:parseFloat(c.margin)||0,price:p,fiat:c.fiat,total:a,avail:a,min:mn,max:mx,methods:c.methods.slice(),mins:+c.mins,hours:c.hours,terms:c.terms||TERMS[0],auto:c.auto,req:{kyc:+c.kyc,trades:+c.trades,reg:0},status:c.status,orders:0,t:now()};
    if(c.side==='sell'){S.wallet.avail-=a;S.wallet.ads+=a}
    S.offers.unshift(o);if(o.status==='online')S.channel.push({kind:'new',o,t:now(),taken:false});toast(o.status==='online'?'Ad posted · also on the Telegram channel':'Ad saved as offline');
    later(14000,()=>{if(o.status!=='online'||S.paused)return;const cp=o.side==='sell'?'maya':'amir_k',amt=Math.min(o.avail,Math.max(o.min/o.price,Math.round(o.avail/2)));const d=startDeal(o,cp,o.side,+amt.toFixed(2),o.methods[0]);notify(`${cp} took your ad`,`${u(d.usdt)} USDT · order ${d.id}`,'deal:'+d.id,'Order updates')})}
  S.create=null;S.tabs=S.tabs.filter(k=>k!=='ad:'+id);lst('ads').view='all';goPage('ads')}
