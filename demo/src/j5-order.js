/* ---------- order engine (demo simulation) ---------- */
const RELEASE_WIN=15*60000,APPEAL_WAIT=20000,SLOW=['river','delta_fx'];
const refOf=d=>d.ref||String(1000+(+d.id.slice(2)*37)%9000);
const revHTML=r=>`<li class="ev">${av(r.from)}<div><div class="ev-t">${esc(nm(r.from))} <span class="ev-m">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)} · ${ago(r.t)}</span></div><div class="ev-c">${esc(r.text)}</div>${r.deal?`<div class="vrev"><span class="tag ok">${ico('check',11)} Verified order</span><span class="num">${esc(r.deal)} · ${u(r.usdt)} USDT · ${esc(r.method)} · released in ${r.relMin} min</span></div>`:''}</div></li>`;
function say(d,from,text,kind,extra){
  /* the other side tried to move the chat off the app: hide it, warn, and tell the admin */
  if(from!=='you'&&from!=='sys'&&from!=='admin'&&(!kind||kind==='msg')&&SCAMRX.test(text||'')){S.typing[d.id]=false;
    const m={from:'sys',kind:'event',icon:'bad',text:`simple.p2p hid a message from ${from}. It had a phone number or asked to move to another app. Never talk or pay outside this order. The admin was told.`,t:now()};d.msgs.push(m);
    S.risk.unshift({id:'RA-'+(80+S.risk.length),user:from,rule:'Tried to move an order chat off the app ('+d.id+')',sev:'high',st:'open',t:now()});
    if(!viewingChat(d))d.unread=(d.unread||0)+1;return m}
  const m=Object.assign({from,text,t:now(),kind:kind||(from==='sys'?'event':'msg')},extra||{});d.msgs.push(m);
  if(from!=='you'&&from!=='sys'){S.typing[d.id]=false;d.msgs.forEach(x=>{if(x.from==='you')x.read=true});if(!viewingChat(d))d.unread=(d.unread||0)+1}return m}
const viewingChat=d=>S.active==='deal:'+d.id&&(innerWidth>980||(S.dealPane[d.id]||'deal')==='chat');
const sys=(d,text,icon)=>say(d,'sys',text,'event',{icon});
function typing(d,who){S.typing[d.id]=who;if(S.active==='deal:'+d.id)render()}
function startDeal(o,cp,mySide,usdt,method,pmId,fiatTotal){
  const t=trader(cp),sellerIsMe=mySide==='sell',pm=pmId&&S.pms.find(p=>p.id===pmId);
  const mob=method==='Mobile money',seller=sellerIsMe?(pm||{bank:ME.bank,holder:ME.holder,acct:ME.acct}):mob?{bank:'PayLink',holder:t.holder,acct:'+000 555 '+String(1000+T.indexOf(t)*137).slice(-4)}:t;
  const d={id:'D-'+(DID++),ad:o.id,cp,side:mySide,usdt,price:o.price,fiat:o.fiat,total:fiatTotal!=null?fiatTotal:+(usdt*o.price).toFixed(2),method,mobile:mob,st:'locked',t0:now(),stT:now(),payBy:now()+o.mins*60000,mins:o.mins,msgs:[],files:[],paidAt:0,rated:0,fresh:true,unread:0,
    bank:seller.bank,holder:seller.holder,acct:seller.acct,terms:o.terms,ptype:o.ptype,margin:o.margin,ref:String(1000+(DID*7919)%9000)};
  if(sellerIsMe){if(o.by==='you')S.wallet.ads-=usdt;else S.wallet.avail-=usdt;S.wallet.held+=usdt}
  o.avail=+(o.avail-usdt).toFixed(2);o.orders++;
  if(o.avail*o.price<o.min){if(o.by==='you'&&o.side==='sell'){S.wallet.ads-=o.avail;S.wallet.avail+=o.avail;o.avail=0}o.status='closed';S.channel.forEach(p=>{if(p.kind==='new'&&p.o.id===o.id)p.taken=true})}
  sys(d,`Order created. ${u(usdt)} USDT is locked by simple.p2p.`,'lock');
  S.deals.push(d);
  if(o.by==='you')say(d,'you',o.auto,'auto');else later(900,()=>say(d,cp,o.auto,'auto'));
  if(mySide==='buy'){notify(`Order ${d.id} started`,`${u(d.usdt)} USDT is locked. Pay ${m2(d.total)} ${d.fiat} to ${cp} within ${o.mins} min.`,'deal:'+d.id,'Order updates');
    if(SLOW.includes(cp))later(5200,()=>{if(d.st==='locked'){say(d,cp,'Faster on WhatsApp: +000 555 0199. I can give you a better price there.');render()}})}
  else{notify(`Order ${d.id} started`,`Your ${u(d.usdt)} USDT is locked. ${cp} is paying.`,'deal:'+d.id,'Order updates');
    later(2600,()=>typing(d,cp));later(4200,()=>say(d,cp,'Hi, sending the money now.'));
    later(9500,()=>{if(d.st!=='locked')return;d.st='paid';d.stT=now();d.paidAt=now();d.fresh=true;
      const r=say(d,cp,'','img',{rc:{bank:t.bank,amt:d.total,fiat:d.fiat,from:t.holder,ref:d.ref}});d.files.push({n:'payment-receipt.jpg',s:'212 KB',by:cp,t:r.t});
      say(d,cp,`Sent ${m2(d.total)} ${d.fiat} from my ${t.bank} account (${t.holder}).`);sys(d,'State: Paid (was Locked). The buyer marked the order as paid.','ok');
      notify(`${cp} marked ${d.id} as paid`,'Check YOUR bank app, then release.','deal:'+d.id,'Order updates')})}
  return d}
function finish(d,how,note){const was=d.st;d.st=how;d.stT=now();d.fresh=true;S.typing[d.id]=false;
  if(how==='done'){if(d.side==='buy'){S.wallet.avail+=d.usdt;tx('Bought',`Order ${d.id} · ${d.cp}`,d.usdt)}else{S.wallet.held-=d.usdt;tx('Sold',`Order ${d.id} · ${d.cp}`,-d.usdt)}
    ME.trades++;ME.t30++;S.doneToday++;S.channel.push({kind:'done',usdt:d.usdt,fiat:d.fiat,rating:d.side==='buy'?trader(d.cp).rating:ME.rating,mins:Math.max(1,Math.round((now()-d.t0)/60000)),t:now()})}
  else{const o=S.offers.find(x=>x.id===d.ad);
    if(d.side==='sell'){S.wallet.held-=d.usdt;if(o&&o.by==='you'&&o.status==='online'){o.avail+=d.usdt;S.wallet.ads+=d.usdt}else S.wallet.avail+=d.usdt}
    else if(o&&o.status==='online')o.avail+=d.usdt}
  if(note)d.reason=note;return was}
function markPaid(d){d.st='paid';d.stT=now();d.paidAt=now();d.fresh=true;sys(d,'State: Paid (was Locked). You marked the order as paid.','ok');
  later(2400,()=>typing(d,d.cp));later(4000,()=>{if(d.st==='paid')say(d,d.cp,'Checking my bank now.')});
  if(SLOW.includes(d.cp)){later(9000,()=>{if(d.st==='paid')say(d,d.cp,'I do not see the money yet. Are you sure you sent it?')});return}
  later(10500,()=>{if(d.st!=='paid')return;say(d,d.cp,'Money received. Releasing now. Thanks!');finish(d,'done');sys(d,`State: Done (was Paid). ${u(d.usdt)} USDT was released to your wallet.`,'ok');notify(`Order ${d.id} done`,`${u(d.usdt)} USDT is in your wallet.`,'deal:'+d.id,'Order updates')})}
function tickDeals(){S.deals.forEach(d=>{if(d.st==='locked'&&!d.past&&now()>=d.payBy){finish(d,'expired');sys(d,'State: Expired (was Locked). Nobody paid in time, so the USDT went back to the seller.','bad');notify(`Order ${d.id} expired`,'The payment time ran out.','deal:'+d.id,'Order updates');render()}})}

/* ---------- order page: deal on the left, chat on the right ---------- */
const QUICK={buy_locked:['I am paying now','Is this the right account name?','Thanks!'],buy_paid:['I have paid, please check','Please release the USDT','My receipt is in the chat'],sell_locked:['Please pay from your own account','The account details are on the order page'],sell_paid:['Checking my bank now','Payment received, releasing','I do not see the money yet'],disputed:['I added my proof','Waiting for the admin']};
function dealButtons(d){const wait=d.paidAt+APPEAL_WAIT,appealBtn=l=>`<button class="btn bad" data-a="appeal" data-x="${d.id}" data-appeal="${wait}"${now()<wait?' disabled':''}>${l}${now()<wait?` <span class="small" data-left="${wait}">${dur(wait-now())}</span>`:''}</button>`;
  if(d.side==='buy'&&d.st==='locked')return `<button class="btn plain" data-a="cancel" data-x="${d.id}">Cancel order</button><button class="btn pri" data-a="paid" data-x="${d.id}">I have paid</button>`;
  if(d.side==='buy'&&d.st==='paid')return appealBtn('Appeal');
  if(d.side==='sell'&&d.st==='locked')return `<button class="btn plain" data-a="remind" data-x="${d.id}">Remind buyer</button>`;
  if(d.side==='sell'&&d.st==='paid')return appealBtn('Money not received')+`<button class="btn pri" data-a="release" data-x="${d.id}" data-unlock="${d.paidAt+5000}"${d.paidAt+5000>now()?' disabled':''}>Release USDT</button>`;
  if(d.st==='disputed')return `<button class="btn" data-a="dtab" data-x="${d.id}|files">${ico('clip',14)} Add proof</button>`;
  const o=S.offers.find(x=>x.id===d.ad&&x.status==='online'&&x.by!=='you');
  return (d.st==='done'?`<button class="btn" data-a="proof" data-x="${d.id}">${ico('doc',14)} Proof pack</button>`:'')+(o?`<button class="btn" data-a="start" data-x="${o.id}">Trade again</button>`:'');
}
function flowHTML(d){const s=d.st;let st=['done','now','',''],lab=['Created',d.side==='buy'?'You pay':'Buyer pays','Release','Completed'];
  if(s==='paid')st=['done','done','now',''];
  if(s==='disputed'){st=['done','done','bad',''];lab[2]='Appeal'}
  if(s==='done')st=['done','done','done','done'];
  if(s==='cancelled'||s==='expired'){st=['done','bad','',''];lab[1]=s==='expired'?'Expired':'Cancelled'}
  if(s==='refunded'){st=['done','done','bad',''];lab[2]='Returned'}
  const timer=s==='locked'?`<span class="timer">${ico('clock',14)} Pay within <b class="num" data-left="${d.payBy}">${dur(d.payBy-now())}</b></span>`:s==='paid'?`<span class="timer">${ico('clock',14)} Waiting for release <b class="num" data-since="${d.paidAt}">${dur(now()-d.paidAt)}</b></span>`:s==='disputed'?`<span class="timer bad">${ico('shield',14)} Admin is checking</span>`:s==='done'?`<span class="timer ok">${ico('check',14)} Done in ${Math.max(1,Math.round((d.stT-d.t0)/60000))} min</span>`:`<span class="timer low">${ico('x',14)} ${ST[s][0]}</span>`;
  return `<div class="rec-flow"><ol class="flow" aria-label="Order stages">${lab.map((l,i)=>`<li class="${st[i]}"${st[i]==='now'?' aria-current="step"':''}>${st[i]==='done'?ico('check',13):st[i]==='bad'?ico('x',13):''}${l}</li>`).join('')}</ol>${timer}</div>`}
function dealAlert(d){const t=trader(d.cp);
  if(d.st==='locked')return d.side==='buy'?alertHTML('info',`${u(d.usdt)} USDT is locked for you. Pay from an account in your own name, then tap <b>I have paid</b>.`,'USDT locked.'):alertHTML('info',`Your ${u(d.usdt)} USDT is locked. Do not release anything yet.`,'USDT locked.');
  if(d.st==='paid')return d.side==='sell'?alertHTML('warning',`Look for ${m2(d.total)} ${d.fiat} from ${esc(t.holder)} with reference ${refOf(d)} in YOUR bank app. Screenshots and slips can be faked.`,'Check before you release.'):alertHTML('moderate',`${esc(d.cp)} is checking their bank. This usually takes about ${t.rel} min.`,'Payment sent.');
  if(d.st==='disputed')return alertHTML('critical','The admin is checking both sides. The USDT stays locked until a decision.','Appeal open.');
  if(d.st==='done')return alertHTML('positive',d.side==='buy'?`${u(d.usdt)} USDT was added to your wallet.`:`You sold ${u(d.usdt)} USDT.`,'Order completed.');
  if(d.st==='refunded')return alertHTML('low',d.side==='sell'?`${u(d.usdt)} USDT is back in your wallet.`:'The USDT went back to the seller.','Returned.'+(d.reason?' Admin: '+esc(d.reason):''));
  if(d.st==='expired')return alertHTML('low','Nobody paid within the time limit. The USDT went back to the seller.','Order expired.');
  return alertHTML('low','Nobody paid anything. The USDT went back to the seller.'+(d.reason?' '+esc(d.reason):''),'Order cancelled.')}
function summaryHTML(d){const t=trader(d.cp),tot=`${m2(d.total)} ${d.fiat}`;let s,doIt,next;
  if(d.st==='locked'&&d.side==='buy'){s=`${u(d.usdt)} USDT is locked for you.`;doIt=[`Send <b>${tot}</b> to ${esc(d.holder)} (${esc(d.bank)}${d.mobile?' mobile money':''}).`,`Put reference <b>${refOf(d)}</b> in the payment note${d.method==='Cash deposit'?', or write it on the cash slip':''}.`,'Pay from an account in your own name.'];next=`Tap <b>I have paid</b>. ${esc(d.cp)} checks their bank and releases the USDT.`}
  else if(d.st==='locked'){s=`Your ${u(d.usdt)} USDT is locked.`;doIt=[`Wait for ${esc(d.cp)} to pay ${tot} into your account at ${esc(d.bank)}.`,'Do not release anything yet.'];next='When they mark it paid, check your bank app.'}
  else if(d.st==='paid'&&d.side==='buy'){s='You marked this order as paid.';doIt=[`Wait. ${esc(d.cp)} usually releases in ${t.rel} min.`,'If nothing happens, tap Appeal when it unlocks.'];next='The USDT arrives in your wallet.'}
  else if(d.st==='paid'){s=`${esc(d.cp)} says they paid ${tot}.`;doIt=[`Find ${tot} from ${esc(t.holder)} with reference ${refOf(d)} in YOUR bank app.`,'Screenshots and receipts can be faked. A different payer name means: do not release.'];next='If the money is there, tap <b>Release USDT</b>.'}
  else if(d.st==='disputed'){s='Appeal open.';doIt=['Add proof in the chat: a receipt or the bank reference.'];next='The admin decides: the USDT goes to the buyer or back to the seller.'}
  else if(d.st==='done'){s='Order completed.';doIt=[d.side==='buy'?`Your ${u(d.usdt)} USDT is in your wallet.`:`You received ${tot}.`];next=d.rated?'Thanks for rating.':`Rate ${esc(d.cp)} below.`}
  else{s=ST[d.st][0]+'.';doIt=['Nothing else to do.'];next='You can start a new order any time.'}
  return `<section class="sum" aria-label="Order summary"><div class="sum-h"><span>${ico('spark',14)} Order summary</span><span>Updated ${clock(d.stT)}</span></div><p><b>Status:</b> ${s}</p><p><b>Do this now:</b></p><ul>${doIt.map(x=>`<li>${x}</li>`).join('')}</ul><p><b>Next:</b> ${next}</p></section>`}
function rateHTML(d){if(d.st!=='done'||d.past)return '';const r=S.rate,relMin=Math.max(1,Math.round((d.stT-(d.paidAt||d.t0))/60000));
  if(d.rated)return `<section class="okcard"><span class="ok-ic">${ico('check',30)}</span><div class="vstack" style="gap:8px"><b class="card-t">Thanks for your rating</b><p class="muted">You gave ${esc(d.cp)} ${d.rated} star${d.rated>1?'s':''}. Good ratings help good traders get more orders.</p><div class="btns"><button class="btn" data-a="go" data-x="ord:all">All orders</button><button class="btn pri" data-a="go" data-x="list:${d.side==='buy'?'buy-all':'sell-all'}">New order</button></div></div></section>`;
  return `<section class="okcard" aria-label="Rate ${esc(d.cp)}"><span class="ok-ic">${ico('check',30)}</span><div class="vstack" style="gap:8px"><b class="card-t">How was ${esc(d.cp)}?</b><div class="starsel" role="group" aria-label="Stars">${[1,2,3,4,5].map(n=>`<button class="${n<=r.n?'on':''}" data-a="star" data-x="${n}" aria-label="${n} star${n>1?'s':''}" aria-pressed="${n===r.n}">${ico('star',26,'fill')}</button>`).join('')}</div>
  <div class="chips">${['Fast','Friendly','Clear','Patient','Slow'].map(x=>`<button class="fp${r.tags.includes(x)?' on':''}" data-a="rtag" data-x="${x}" aria-pressed="${r.tags.includes(x)}">${x}</button>`).join('')}</div>
  <label class="sr" for="rate-txt">Comment</label><input class="in" id="rate-txt" placeholder="Add a comment (optional)" value="${esc(r.text)}" autocomplete="off">
  <p class="small muted">${ico('shieldok',12)} Only you and ${esc(d.cp)} can rate this order. The rating is linked to ${d.id}, with the release time measured by simple.p2p: <b>${relMin} min</b>. No order, no rating, so reviews cannot be faked.</p>
  <div><button class="btn pri" data-a="rateGo" data-x="${d.id}"${r.n?'':' disabled'}>Send rating</button></div></div></section>`}
function evHTML(x){
  if(x.kind==='event'){const c={lock:'e-lock',ok:'e-ok',bad:'e-bad'}[x.icon]||'e-info';const ic={lock:'lock',ok:'check',bad:'alert'}[x.icon]||'info';
    return `<li class="ev"><span class="av sq ${c}">${ico(ic,15)}</span><div><div class="ev-t">simple.p2p <span class="ev-m">System · ${dtime(x.t)}</span></div><div class="ev-c">${esc(x.text)}</div></div></li>`}
  if(x.from==='admin')return `<li class="ev note"><span class="av e-adm">A</span><div><div class="ev-t">Admin <span class="ev-m">Admin note · ${dtime(x.t)}</span></div><div class="ev-c">${esc(x.text)}</div></div></li>`;
  return `<li class="ev">${av(x.from)}<div><div class="ev-t">${esc(nm(x.from))} <span class="ev-m">${x.kind==='img'?'Attachment':x.kind==='auto'?'Auto-reply':'Message'} · ${dtime(x.t)}</span></div><div class="ev-c">${x.kind==='img'?'Payment receipt (image)':esc(x.text)}</div></div></li>`}
const rcptHTML=rc=>`<div class="rcpt"><b>${esc(rc.bank)}</b><span class="muted">Transfer receipt</span><span class="ramt num">${m2(rc.amt)} ${rc.fiat}</span><span><span class="muted">From</span>${esc(rc.from)}</span><span><span class="muted">Ref</span>${esc(rc.ref)}</span></div>`;
function chatMsgs(d){let out='<p class="cm-day">Today</p>';
  d.msgs.forEach(m=>{if(m.kind==='event'){out+=`<p class="cm-sys">${ico(m.icon==='bad'?'alert':m.icon==='lock'?'lock':'info',12)}${esc(m.text)}</p>`;return}
    const me=m.from==='you',adm=m.from==='admin';
    out+=`<div class="cm${me?' me':''}${adm?' adm':''}${m.kind==='auto'?' auto':''}">${me?'':adm?'<span class="av e-adm sm" aria-hidden="true">A</span>':av(m.from,'sm')}<div class="cm-b">${adm?'<span class="cm-m"><b>Admin</b> · simple.p2p staff</span>':m.kind==='auto'?'<span class="cm-m">Auto-reply</span>':''}${m.kind==='img'?rcptHTML(m.rc):`<div class="bub">${esc(m.text)}</div>`}<span class="cm-m">${clock(m.t)}${me?` <span class="tick" title="${m.read?'Read':'Sent'}">${m.read?'✓✓':'✓'}</span>`:''}</span></div></div>`});
  if(S.typing[d.id])out+=`<div class="cm">${av(d.cp,'sm')}<span class="typing" aria-label="${esc(d.cp)} is typing"><i></i><i></i><i></i></span></div>`;
  return out}
function chatHTML(d){const t=trader(d.cp),act=ACTIVE.includes(d.st),qk=d.st==='disputed'?QUICK.disputed:QUICK[d.side+'_'+d.st]||[];
  return `<header class="ch-h">${avp(d.cp)}<div class="who-n"><b>${esc(d.cp)}${idok}${t.merchant?mbadge:''}</b><span class="small muted">${t.online?'Online':'Away'} · usually replies in ${t.rel} min</span></div><button class="ib" data-a="go" data-x="profile:${d.cp}" aria-label="Open ${esc(d.cp)} profile" title="Profile">${ico('user')}</button><button class="ib" data-a="report" data-x="${d.cp}" aria-label="Report ${esc(d.cp)}" title="Report">${ico('flag')}</button></header>
  <div class="ch-safe">${ico('shield',14)} Keep all talk here. Staff never message you first.</div>
  <div class="ch-log" id="chlog" aria-live="polite" aria-label="Chat with ${esc(d.cp)}">${chatMsgs(d)}</div>
  ${act?`<div class="ch-q" aria-label="Quick replies">${qk.map(q=>`<button class="qr-chip" data-a="quick" data-x="${esc(q)}">${esc(q)}</button>`).join('')}</div><form class="ch-f" id="chf"><button type="button" class="ib" data-a="attach" data-x="${d.id}" aria-label="Attach a receipt" title="Attach a receipt">${ico('clip')}</button><label class="sr" for="ch-in">Message</label><input class="in" id="ch-in" placeholder="Type a message" autocomplete="off" value="${esc(S.draft[d.id]||'')}"><button class="btn pri" aria-label="Send">${ico('send',15)}</button></form>`:`<p class="ch-end">This order has ended, so the chat is read-only. It is kept for 180 days for appeals.</p>`}`}
function vDeal(id){const d=deal(id);if(!d)return emptyHTML('empty','Order not found','This order is not available.');
  const t=trader(d.cp),buy=d.side==='buy',term=!ACTIVE.includes(d.st),pane=S.dealPane[id]||'deal',tab=S.dtab[id]||'activity';
  const title=buy?`Buy ${u(d.usdt)} USDT from ${d.cp}`:`Sell ${u(d.usdt)} USDT to ${d.cp}`;
  const bl=d.mobile?'Provider':'Bank',al=d.mobile?'Phone number':'Account number',payRows=buy?ro(bl,d.bank)+ro('Account name',d.holder)+ro(al,d.acct,true)+ro('Amount to send',m2(d.total)+' '+d.fiat,true)+ro('Payment reference',refOf(d),true):ro(bl,d.bank)+ro('Account name',d.holder)+ro(al,d.acct)+ro('Payment reference',refOf(d));
  const vline=buy?`<p class="vline">${ico('shieldok',14)}<span>Checked by simple.p2p: this account is in ${esc(d.holder)}'s ID-verified name and cannot change during the order. If anyone asks you to pay a different account, it is a scam.</span></p>`
    :`<p class="vline">${ico('shieldok',14)}<span>Only accept money from <b>${esc(t.holder)}</b>, the buyer's ID-verified name, with reference ${refOf(d)}. Money from another name: do not release, tap Money not received.</span></p>`;
  const unread=d.msgs.filter(m=>m.from!=='you'&&m.kind!=='event').length;
  const tabs=[['activity','Activity',d.msgs.length],['details','Details',0],['files','Receipts',d.files.length],['trader',buy?'Seller':'Buyer',0],['help','Help',0]];
  let body='';
  if(tab==='activity')body=`<ol class="feed">${d.msgs.slice().reverse().map(evHTML).join('')}</ol>`;
  else if(tab==='details')body=`<div class="g2">${ro('Order number',d.id,true)}${ro('Ad number',d.ad)}${ro('Created',dtime(d.t0))}${ro('Pay within',d.mins+' min')}${ro('Price type',d.ptype==='float'?`Floating (market ${d.margin>0?'+':''}${d.margin}%)`:'Fixed')}${ro('Fee','0 USDT (beta)')}${ro(buy?'Seller':'Buyer',d.cp)}${ro('Payment method',d.method)}${ro('Payment reference',refOf(d))}</div><div class="fld" style="margin-top:12px"><span class="lbl">Trader's terms</span><div class="ro">${esc(d.terms||TERMS[0])}</div></div>
    <section class="sect" style="margin-top:12px"><div class="sect-h">Bank freeze protection<span class="btns"><button class="btn sm" data-a="proof" data-x="${d.id}">${ico('doc',13)} Proof pack</button></span></div><ul class="shl">${[[1,'Both traders are ID-checked'],[1,`Payer name must match: ${esc(buy?ME.holder:t.holder)}`],[1,`Payment reference ${refOf(d)} links the money to this order`],[d.files.length?1:0,d.files.length?`${d.files.length} receipt${d.files.length>1?'s':''} saved`:'No receipt yet'],[1,'Chat and timeline kept for 180 days']].map(([k,x])=>`<li class="${k?'':'no'}"><span class="d">${ico(k?'check':'minus',11)}</span><span>${x}</span></li>`).join('')}</ul><p class="small muted" style="margin-top:8px">If your bank asks where the money came from, show the proof pack. They can check it online with its code.</p></section>`;
  else if(tab==='files')body=`<div class="vstack" style="gap:10px">${d.files.map(f=>`<div class="file">${ico('image',22)}<div><b>${esc(f.n)}</b><span class="small muted">${f.s} · added by ${esc(nm(f.by))}${f.t?' · '+clock(f.t):''}</span></div></div>`).join('')||'<p class="small muted">No receipts yet. Add a photo of your bank receipt if there is a problem.</p>'}${term?'':`<div><button class="btn" data-a="attach" data-x="${d.id}">${ico('plus',14)} Add receipt</button></div>`}</div>`;
  else if(tab==='trader')body=`<p class="small muted">Every review comes from a finished order.</p><ol class="feed">${t.revs.slice().reverse().map(revHTML).join('')}</ol>`;
  else body=`<div class="vstack" style="gap:10px">${['Pay only from a bank account in your own name.','Never release before the money is in YOUR bank app.','Staff never message you first.','Keep all talk in this chat. It is used in appeals.'].map((x,i)=>`<div class="pc" style="box-shadow:none;border:1px solid var(--line)"><b>${i+1}. ${x}</b></div>`).join('')}<div class="btns"><button class="btn" data-a="caseFor" data-x="${d.id}">${ico('doc',14)} Contact support about this order</button><button class="btn plain" data-a="go" data-x="kb:KB0010011">How appeals work</button></div></div>`;
  return `<article class="rec"><header class="rec-h"><div><h1>${esc(title)}</h1><p class="sub">${d.id} · ${esc(d.method)} · created ${dtime(d.t0)} ${pill(d.st)}</p></div><div class="btns">${dealButtons(d)}</div></header>
  ${flowHTML(d)}<div class="rec-al">${dealAlert(d)}</div>
  <div class="dl${pane==='chat'?' chat':''}">
    <div class="dl-sw"><div class="seg" role="group" aria-label="Show"><button class="${pane==='deal'?'on':''}" data-a="dpane" data-x="${d.id}|deal" aria-pressed="${pane==='deal'}">Order</button><button class="${pane==='chat'?'on':''}" data-a="dpane" data-x="${d.id}|chat" aria-pressed="${pane==='chat'}">Chat${d.unread?` (${d.unread})`:` (${unread})`}</button></div></div>
    <div class="dl-main">
      <dl class="hv"><div><dt>${buy?'You buy':'You sell'}</dt><dd class="num">${u(d.usdt)} USDT</dd></div><div><dt>Price</dt><dd class="num">${m2(d.price)} ${d.fiat}</dd></div><div><dt>${buy?'You pay':'You get'}</dt><dd class="num">${m2(d.total)} ${d.fiat}</dd></div><div><dt>Payment</dt><dd>${esc(d.method)}</dd></div><div><dt>State</dt><dd>${ST[d.st][0]}</dd></div></dl>
      ${summaryHTML(d)}${rateHTML(d)}
      <div class="g2" style="align-items:start">
        <section class="sect"><div class="sect-h">${buy?'Pay to':'Buyer pays into'}${term?'':`<span class="tag">${ico(MICON[d.method]||'bank',12)} ${esc(d.method)}</span>`}</div>${term?'<p class="small muted">Payment details are hidden after the order ends.</p>':`<div class="flds" style="margin-top:0">${payRows}</div>${buy?`<p class="small muted">Put ${refOf(d)} in the payment note${d.method==='Cash deposit'?' or write it on the cash slip':''}. Do not write "USDT" or "crypto".</p>`:''}${vline}`}</section>
        <section class="sect"><div class="sect-h">${buy?'Seller':'Buyer'}<span class="btns"><button class="btn sm${S.follow.has(d.cp)?' pri':''}" data-a="follow" data-x="${d.cp}" aria-pressed="${S.follow.has(d.cp)}">${S.follow.has(d.cp)?'Following':'Follow'}</button></span></div>${advCell(d.cp)}<dl class="kv"><div><dt>Orders (30 days)</dt><dd>${u(t.t30)}</dd></div><div><dt>Completion</dt><dd>${t.done}%</dd></div><div><dt>Avg. release</dt><dd>${t.rel} min</dd></div><div><dt>Avg. pay</dt><dd>${t.pay} min</dd></div></dl></section>
      </div>
      <div><div class="rtabs" role="tablist" aria-label="Order sections">${tabs.map(([k,l,c])=>`<button role="tab" aria-selected="${tab===k}" class="${tab===k?'on':''}" data-a="dtab" data-x="${d.id}|${k}">${l}${c?` <span class="cnt">${c}</span>`:''}</button>`).join('')}</div><div style="padding-top:12px">${body}</div></div>
    </div>
    <aside class="dl-chat" aria-label="Chat">${chatHTML(d)}</aside>
  </div></article>`}
