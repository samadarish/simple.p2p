/* ---------- actions ---------- */
const val=id=>{const e=$('#'+id);return e?e.value.trim():''};
const ferr=(id,t)=>{const e=$('#'+id);if(e)e.textContent=t;return false};
const confirmBox=(title,text,btn,a,x,bad)=>openModal('confirm',{title,text,btn,a,x,bad});
const A=Object.assign({},LA,{
  go:x=>go(x),
  tab:x=>{S.active=x;if(x.startsWith('deal:')){const d=deal(x.slice(5));if(d)d.unread=0}addHist(x==='page'?pageKey():x);render();window.scrollTo(0,0)},
  closeTab:x=>closeTab(x),
  menu:x=>openPop(x),pop:x=>openPop(x),closePop:()=>closePops(),
  tree:x=>{S.treeClosed.has(x)?S.treeClosed.delete(x):S.treeClosed.add(x);const l=$('#mo-list');if(l)l.innerHTML=menuList('all',S.menuQ.trim().toLowerCase());if(S.pinned)renderPinned()},
  pin:()=>{S.pinned=!S.pinned;S.pop=null;S.menuQ='';renderPop();renderPinned();toast(S.pinned?'Menu pinned to the side':'Menu unpinned')},
  favToggle:()=>{const m=tabMeta(S.active);if(!m.fav)return;const on=S.favs.includes(m.fav);S.favs=on?S.favs.filter(k=>k!==m.fav):S.favs.concat(m.fav);renderTabs();if(S.pinned)renderPinned();toast(on?'Removed from Favorites':'Added to Favorites')},
  favRemove:x=>{S.favs=S.favs.filter(k=>k!==x);renderPop();renderTabs()},
  readAll:()=>{S.notifs.forEach(n=>n.read=true);if(S.pop)renderPop();render()},
  notif:x=>{const n=S.notifs.find(y=>y.id===x);if(!n)return;n.read=true;if(n.key)go(n.key);else render()},
  signout:()=>{closePops();S.signedIn=false;S.signing=false;render()},
  signin:()=>{S.signing=true;renderSignin();setTimeout(()=>{S.signedIn=true;S.signing=false;S.logins.unshift({t:now(),how:'Telegram login',ok:true});render();toast('Logged in with Telegram')},1800)},
  help:()=>openModal('help'),
  va:()=>{closePops();if(!S.va){S.va={open:true,msgs:[],typing:false};vaHandle('start')}else S.va.open=true;S.vaMin=false;renderVA();const i=$('#va-in');if(i&&!phone())i.focus()},
  vaMin:()=>{S.vaMin=!S.vaMin;renderVA()},vaClose:()=>{S.va.open=false;renderVA()},
  vaChip:x=>{const m=S.va.msgs[S.va.msgs.length-1],c=m&&m.chips&&m.chips.find(y=>y[0]===x);if(x.startsWith('go:')){vaHandle(x);return}vaHandle(x,c?c[1]:x)},
  prefs:()=>{S.prefTab='display';openModal('prefs')},prefTab:x=>{readPrefs();S.prefTab=x;drawModal()},
  prefsGo:()=>{readPrefs();document.body.classList.toggle('comfy',S.prefs.density==='comfy');closeModal(true);toast('Preferences saved');render()},
  annOff:()=>{S.annOff=true;render()},
  onlyMine:x=>{S.onlyMine=x==='1';render()},
  tile:x=>{if(deal(x))return go('deal:'+x);openModal('tile',x)},
  /* trading */
  start:x=>{if(S.paused){toast('New orders are paused right now.');return}if(ustat('you').st!=='active'){toast('Your account is frozen. Contact support.');return}openModal('start',{id:x})},
  stAll:()=>{const m=S.modal.data,o=S.offers.find(y=>y.id===m.id),buyIt=o.side==='sell',lim=LEVELS[ME.kyc].buy;
    if(buyIt){const f=Math.min(maxFiat(o),Math.floor(lim*o.price));m.a=String(f);m.b=(f/o.price).toFixed(2)}else{const q=Math.min(o.avail,S.wallet.avail,maxFiat(o)/o.price,lim);m.a=q.toFixed(2);m.b=(q*o.price).toFixed(2)}$('#st-a').value=m.a;$('#st-b').value=m.b},
  confirmStart:x=>{const o=S.offers.find(y=>y.id===x);if(!o||o.status!=='online')return closeModal();const buyIt=o.side==='sell',a=parseFloat(val('st-a'))||0;
    const fiat=buyIt?a:+(a*o.price).toFixed(2),usdt=buyIt?Math.floor(a/o.price*100)/100:a,lim=LEVELS[ME.kyc][buyIt?'buy':'sell'];
    const pm=buyIt?((document.querySelector('input[name="st-pm"]:checked')||{}).value||o.methods[0]):val('st-pm'),method=buyIt?pm:(S.pms.find(p=>p.id===pm)||{}).type;
    const err=!a?'Enter an amount.':fiat<o.min?`The smallest order is ${u(o.min)} ${o.fiat}.`:fiat>maxFiat(o)?`The largest order is ${u(maxFiat(o))} ${o.fiat}.`:usdt>o.avail?`Only ${u(o.avail)} USDT is available.`:!buyIt&&usdt>S.wallet.avail?`You only have ${u(S.wallet.avail)} USDT free.`:usdt>lim?`Your daily limit is ${u(lim)} USDT. Verify your ID to raise it.`:!method?'Pick a payment method.':'';
    if(err){S.modal.data.err=err;S.modal.data.a=val('st-a');S.modal.data.b=val('st-b');ferr('st-err',err);return}
    closeModal(true);const d=startDeal(o,o.by,buyIt?'buy':'sell',usdt,method,buyIt?null:pm,buyIt?fiat:null);lst('trade').preview=null;openTab('deal:'+d.id)},
  exSide:x=>{S.ex.side=x;S.ex.amt=x==='buy'?'1000':'200';render()},
  exGo:x=>{const o=S.offers.find(y=>y.id===x),a=parseFloat(S.ex.amt)||0;openModal('start',{id:x,a:String(a),b:S.ex.side==='buy'?(a/o.price).toFixed(2):(a*o.price).toFixed(2)})},
  /* orders */
  paid:x=>{S.pcFile=false;openModal('paidConfirm',x)},
  pcFile:()=>{S.pcFile=true;const up=$('#pc-up');if(up){up.classList.add('ok');up.querySelector('b').textContent='payment-receipt.jpg added';const b=up.querySelector('.btn');if(b)b.remove()}const c=$('#pc-chk');if(c)c.checked=true;
    const g=$('#tickGo');if(g)g.disabled=![...document.querySelectorAll('#modal [data-a="tick"][data-g="paid"]')].every(i=>i.checked)},
  paidGo:x=>{const d=deal(x);closeModal(true);if(!d||d.st!=='locked')return;
    if(S.pcFile){const r=say(d,'you','','img',{rc:{bank:ME.bank,amt:d.total,fiat:d.fiat,from:ME.holder,ref:refOf(d)}});d.files.push({n:'payment-receipt.jpg',s:'196 KB',by:'you',t:r.t})}markPaid(d);render()},
  proof:x=>openModal('proof',x),
  proofDl:()=>toast('In the real app this downloads a signed PDF.'),
  malert:()=>openModal('malert'),
  maGo:()=>{const side=val('ma-side'),p=parseFloat(val('ma-price')),m=val('ma-m'),b=val('ma-bank');if(!(p>0))return ferr('ma-err','Enter a price.');
    const a={id:'AL-'+(S.malerts.length+1)+String(now()).slice(-3),side,price:p,method:m,bank:b,on:true,hit:0};S.malerts.push(a);closeModal(true);toast('Alert on. We will message you.');render();
    later(7000,()=>{if(!S.malerts.includes(a)||S.paused)return;const mk=CUR.LC.market,pr=side==='buy'?Math.min(p,+(mk+0.01).toFixed(2)):Math.max(p,+(mk-0.01).toFixed(2));
      if(side==='buy'?pr<mk*0.985:pr>mk*1.015)return;/* the limit is far from the market: wait */
      const t=T.find(x=>!x.newbie&&!SLOW.includes(x.id)&&x.bank===(b||x.bank)&&!S.blocked.has(x.id))||T[0];t.online=true;
      const o=mkAd(t.id,side==='buy'?'sell':'buy',pick([300,500,800],a.id.length),pr,[m||'Bank transfer'],{min:100,max:Math.round(300*pr)});o.t=now();o.keep=true;S.offers.push(o);maCheck(o);render()})},
  maDel:x=>{S.malerts=S.malerts.filter(a=>a.id!==x);toast('Alert removed');render()},
  scamTopic:()=>{S.tg='group';S.topic='Scam reports';goPage('telegram')},
  cancel:x=>openModal('cancel',x),
  cancelGo:x=>{const d=deal(x),why=(document.querySelector('input[name="cx-why"]:checked')||{}).value||'No reason';closeModal(true);finish(d,'cancelled','You cancelled: '+why.toLowerCase()+'.');S.cancels++;sys(d,`State: Cancelled (was Locked). Reason: ${why}.`,'bad');render()},
  release:x=>{if(!ME.tfa)sendCode('release USDT');openModal('release',x)},
  fillCode:x=>{const i=$('#'+x);if(i&&S.code)i.value=S.code.v},
  releaseGo:x=>{const d=deal(x);if(!codeOk(val('rel-code')))return ferr('rel-err','That code is not right. Check the newest message from the bot.');closeModal(true);if(!d||d.st!=='paid')return;finish(d,'done');sys(d,`State: Done (was Paid). You released ${u(d.usdt)} USDT.`,'ok');later(1500,()=>say(d,d.cp,'Got it, thank you!'));notify(`Order ${d.id} done`,`You sold ${u(d.usdt)} USDT.`,'deal:'+d.id,'Order updates');render()},
  appeal:x=>{S.apFile=false;openModal('appeal',x)},
  apFile:()=>{S.apFile=true;const u2=$('#ap-up');if(u2){u2.classList.add('ok');u2.querySelector('b').textContent='bank-statement.pdf added';u2.querySelector('.btn').remove()}},
  appealGo:x=>{const d=deal(x),why=val('ap-why'),desc=val('ap-desc')||why;closeModal(true);d.st='disputed';d.stT=now();d.fresh=true;S.typing[d.id]=false;
    if(S.apFile)d.files.push({n:'bank-statement.pdf',s:'340 KB',by:'you',t:now()});sys(d,`State: Appeal (was Paid). Reason: ${why}. The admin will join the chat.`,'bad');
    later(3000,()=>say(d,'admin','Hi both, I am the admin. Please send proof of payment here: a receipt or bank reference. I will decide soon.','msg'));
    const buyer=d.side==='buy'?'you':d.cp,seller=d.side==='sell'?'you':d.cp;
    S.disputes.unshift({id:'X-'+(XID++),deal:d.id,mine:true,usdt:d.usdt,fiat:d.fiat,total:d.total,method:d.method,buyer,seller,buyerSays:d.side==='buy'?desc:'I paid. The receipt is in the chat.',sellerSays:d.side==='sell'?desc:'Checking. Not received yet.',evidence:[`Chat (${d.msgs.length} entries)`].concat(d.files.map(f=>f.n)),t:now(),notes:[],st:'open'});
    notify(`Appeal opened on ${d.id}`,'The admin is checking.','deal:'+d.id,'Order updates');render()},
  remind:x=>{const d=deal(x);say(d,'you',`Reminder: please pay ${m2(d.total)} ${d.fiat} within ${dur(d.payBy-now())}.`);render();later(2500,()=>say(d,d.cp,'Yes, paying now.'))},
  dpane:x=>{const [id,p]=x.split('|');S.dealPane[id]=p;const d=deal(id);if(p==='chat'&&d)d.unread=0;render();if(innerWidth<=980){const dl=$('.dl');if(dl)window.scrollTo(0,dl.getBoundingClientRect().top+scrollY-$('#hdr').offsetHeight)}if(p==='chat'){const c=$('#chlog');if(c)c.scrollTop=c.scrollHeight}},
  dtab:x=>{const i=x.lastIndexOf('|');S.dtab[x.slice(0,i)]=x.slice(i+1);render()},
  attach:x=>{const d=deal(x),t=d.side==='buy'?{bank:ME.bank,from:ME.holder}:{bank:d.bank,from:ME.holder};const r=say(d,'you','','img',{rc:{bank:t.bank,amt:d.total,fiat:d.fiat,from:t.from,ref:'TX'+String(now()).slice(-6)}});d.files.push({n:'my-receipt.jpg',s:'184 KB',by:'you',t:r.t});render()},
  quick:x=>{const d=deal(S.active.slice(5));if(!d)return;chatSend(d,x)},
  follow:x=>{S.follow.has(x)?S.follow.delete(x):S.follow.add(x);toast(S.follow.has(x)?'Following '+x:'Unfollowed '+x);render()},
  block:x=>{if(S.blocked.has(x)){S.blocked.delete(x);toast('Unblocked '+x);render()}else confirmBox(`Block ${esc(x)}?`,'You will not see their ads and they cannot trade with you. Open orders still finish.','Block','blockGo',x,1)},
  blockGo:x=>{S.blocked.add(x);S.follow.delete(x);closeModal(true);toast('Blocked '+x);render()},
  report:x=>openModal('report',x),
  reportGo:x=>{closeModal(true);S.risk.unshift({id:'RA-'+(80+S.risk.length),user:x,rule:'Reported by a user: '+((document.querySelector('input[name="rp-why"]:checked')||{}).value||'Other'),sev:'moderate',st:'open',t:now()});toast('Report sent to the admin');render()},
  star:x=>{S.rate.n=+x;render()},
  rtag:x=>{const t=S.rate.tags;S.rate.tags=t.includes(x)?t.filter(y=>y!==x):t.concat(x);render()},
  rateGo:x=>{const d=deal(x),t=trader(d.cp);d.rated=S.rate.n;t.revs.push({from:'you',stars:S.rate.n,text:S.rate.text||(S.rate.tags.length?S.rate.tags.join(', ')+'.':'Good order.'),t:now(),deal:d.id,usdt:d.usdt,method:d.method,relMin:Math.max(1,Math.round((d.stT-(d.paidAt||d.t0))/60000))});t.reviews++;S.rate={n:0,tags:[],text:''};toast('Rating sent');render()},
  caseFor:x=>{S.caseDraft={cat:'Orders',order:x,subj:'Help with order '+x,desc:'',file:false,err:''};go('case:new')},
  exportCsv:()=>{const w=S.page==='wallet',head=w?['Number','Type','Details','Amount','Status','When']:['Number','Side','Counterparty','USDT','Total','State','Created'],rows=w?S.txs.slice().sort((a,b)=>b.t-a.t).map(x=>[x.id,x.type,x.detail,u(x.amt),x.st,dtime(x.t)]):S.deals.slice().reverse().map(d=>[d.id,d.side,d.cp,u(d.usdt),m2(d.total)+' '+d.fiat,ST[d.st][0],dtime(d.t0)]);openModal('export',{head,rows})},
  /* ads */
  adSide:x=>{readAd();S.create.side=x;render()},adPtype:x=>{readAd();S.create.ptype=x;render()},
  submitAd:x=>submitAd(x),
  adToggle:x=>{const o=S.offers.find(y=>y.id===x);if(o.status==='online'){o.status='offline';toast('Ad is offline. Your USDT stays reserved.')}else{if(S.paused)return toast('New orders are paused right now.');o.status='online';toast('Ad is online')}render()},
  adClose:x=>confirmBox('Close this ad?','It is removed from the list. Reserved USDT goes back to your free balance. Open orders still finish.','Close ad','adCloseGo',x,1),
  adCloseGo:x=>{const o=S.offers.find(y=>y.id===x);if(o.side==='sell'){S.wallet.ads-=o.avail;S.wallet.avail+=o.avail}o.avail=0;o.status='closed';S.channel.forEach(p=>{if(p.kind==='new'&&p.o.id===x)p.taken=true});closeModal(true);toast('Ad closed');render()},
  /* wallet */
  deposit:()=>{S.depTab='wallet';openModal('deposit')},depTab:x=>{S.depTab=x;drawModal()},
  depGo:()=>{const a=parseFloat(val('dep-amt'));if(!(a>=5)){toast('The minimum deposit is 5 USDT.');return}S.depAmt=String(a);S.modal={type:'depWait',data:a};drawModal();
    later(3000,()=>{S.wallet.avail+=a;S.hot+=a;tx('Deposit','From Telegram Wallet',a,'Done','e3'+String(now()).slice(-2)+'…'+String(now()).slice(-4));S.chain.push({id:'e3'+String(now()).slice(-6),dir:'In',amt:a,what:'User deposit · you',t:now()});if(S.modal&&S.modal.type==='depWait')closeModal();notify('Deposit received',`+${u(a)} USDT. Balance: ${u(S.wallet.avail)} USDT.`,'pg:wallet/assets','Deposits and withdrawals')})},
  withdraw:()=>{if(!ME.tfa)sendCode('withdraw USDT');openModal('withdraw')},
  withdrawTo:x=>{if(!ME.tfa)sendCode('withdraw USDT');openModal('withdraw',x)},
  wdGo:()=>{const a=parseFloat(val('wd-amt')),addr=val('wd-addr');
    if(!/^(UQ|EQ)[\w-]{20,}$/.test(addr))return ferr('wd-err','That is not a TON address. It should start with UQ or EQ.');
    if(ME.wl&&!S.book.some(b=>b.addr===addr))return ferr('wd-err','The whitelist is on. Pick a saved address.');
    if(!(a>=10))return ferr('wd-err','The minimum is 10 USDT.');
    if(a>S.wallet.avail)return ferr('wd-err',`You only have ${u(S.wallet.avail)} USDT free.`);
    if(!codeOk(val('wd-code')))return ferr('wd-err','That code is not right. Check the newest message from the bot.');
    S.wallet.avail-=a;const short=addr.slice(0,6)+'…'+addr.slice(-4),big=a>S.set.auto;const h=tx('Withdrawal','To '+short,-a,big?'Waiting for admin':'Sending');closeModal(true);
    if(big){S.approvals.unshift({id:'W-'+(WID++),user:'you',amt:a,addr:short,t:now(),mine:true,h});toast('Sent to the admin for approval')}
    else{toast('Withdrawal sending');later(4000,()=>{h.st='Done';h.hash='7f'+String(now()).slice(-2)+'…'+String(now()).slice(-4);S.hot-=a;S.chain.push({id:h.hash,dir:'Out',amt:a,what:'Withdrawal · you',t:now()});notify('Withdrawal sent',`${u(a-1)} USDT to ${short}.`,'pg:wallet/history','Deposits and withdrawals')})}render()},
  transfer:()=>openModal('transfer'),
  trGo:()=>{const to=val('tr-to'),a=parseFloat(val('tr-amt'));if(!(a>0))return ferr('tr-err','Enter an amount.');if(a>S.wallet.avail)return ferr('tr-err',`You only have ${u(S.wallet.avail)} USDT free.`);
    S.wallet.avail-=a;tx('Sent','To '+to+(val('tr-note')?' · '+val('tr-note'):''),-a);closeModal(true);toast(`Sent ${u(a)} USDT to ${to}`);render()},
  txInfo:x=>openModal('txInfo',x),
  addAddr:()=>openModal('addAddr'),
  addrGo:()=>{const l=val('ad-label'),a=val('ad-addr');if(!l)return ferr('ad-err','Give it a name.');if(!/^(UQ|EQ)[\w-]{20,}$/.test(a))return ferr('ad-err','That is not a TON address. It should start with UQ or EQ.');S.book.push({id:'AB-'+(S.book.length+2),label:l,addr:a});closeModal(true);toast('Address saved');render()},
  delAddr:x=>{S.book=S.book.filter(b=>b.id!==x);toast('Address deleted');render()},
  wlToggle:()=>{ME.wl=!ME.wl;toast(ME.wl?'Whitelist on':'Whitelist off');render()},
  /* account */
  pmEdit:x=>openModal('pm',x),
  pmGo:x=>{const t=val('pm-type'),b=val('pm-bank'),ac=val('pm-acct');if(ac.replace(/\D/g,'').length<6)return ferr('pm-err','Enter the full account or phone number.');
    if(x==='new')S.pms.push({id:'PM-'+(S.pms.length+3),type:t,bank:b,holder:ME.name,acct:ac});else Object.assign(S.pms.find(p=>p.id===x),{type:t,bank:b,acct:ac});closeModal(true);toast('Payment method saved');render()},
  pmDel:x=>confirmBox('Delete this payment method?','Ads that use it will need another one.','Delete','pmDelGo',x,1),
  pmDelGo:x=>{S.pms=S.pms.filter(p=>p.id!==x);closeModal(true);toast('Deleted');render()},
  tfaOn:()=>openModal('tfa'),
  tfaGo:()=>{if(!/^\d{6}$/.test(val('tfa-code')))return ferr('tfa-err','Type the 6 digits from the app.');ME.tfa=true;closeModal(true);notify('Two-step login is on','Releases and withdrawals now need your authenticator code.','pg:account/security','Security alerts');render()},
  tfaOff:()=>confirmBox('Turn off the authenticator?','Releases and withdrawals will use codes from the Telegram bot instead.','Turn off','tfaOffGo','',1),
  tfaOffGo:()=>{ME.tfa=false;closeModal(true);notify('Two-step login is off','If this was not you, contact support now.','pg:account/security','Security alerts');render()},
  phish:()=>openModal('phish'),
  phishGo:()=>{const c=val('ph-code');if(!/^[\w-]{4,20}$/.test(c))return ferr('ph-err','Use 4 to 20 letters or numbers.');ME.phish=c;closeModal(true);toast('Anti-phishing code saved');render()},
  logoutDev:x=>{S.sessions=S.sessions.filter(s=>s.id!==x);toast('Device logged out');render()},
  logoutOthers:()=>{S.sessions=S.sessions.filter(s=>s.cur);toast('All other devices logged out');render()},
  npref:x=>{const [k,i]=x.split('|');S.nprefs[k][+i]=S.nprefs[k][+i]?0:1;render()},
  shareTg:()=>toast('Opening Telegram to share your link'),
  merchApply:()=>{const id='MA-'+(32+S.mapps.length);S.merchApp={id,t:now()};S.mapps.unshift({id,user:'you',t:now(),st:'pending',note:'Applied from the app.'});toast('Request sent');render()},
  kycStart:()=>{S.kyc2={step:0,doc:'National ID card',front:false,back:false,selfie:false,st:'draft'};render()},
  kycShot:x=>{S.kyc2[x]=true;toast(x==='selfie'?'Selfie matched':'Photo looks good');render()},
  kycCancel:()=>{S.kyc2=null;render()},
  kycStep:x=>{const k=S.kyc2;if(+x<0){k.step--;return render()}if(k.step<3){k.step++;return render()}
    k.st='pending';const kid='KYC-'+(203+S.kycq.length);S.kycq.unshift({id:kid,user:'you',lvl:2,doc:k.doc,t:now(),st:'pending'});notify('ID sent for checking','Usually under 10 minutes. We tell you here and in Telegram.','pg:account/verify','Security alerts');
    later(25000,()=>{const q=S.kycq.find(y=>y.id===kid);if(q&&q.st==='pending')kycDecide(kid,'approved','Approved automatically by the ID check service')});render()},
  ptab:x=>{S.ptab=x;render()},
  /* help */
  hsClear:()=>{S.hq='';render()},
  kbVote:x=>{const [id]=x.split('|');S.kbVote=S.kbVote||{};S.kbVote[id]=1;toast('Thanks for the feedback');render()},
  caseFile:()=>{readCase();S.caseDraft.file=!S.caseDraft.file;render()},
  caseSubmit:()=>{readCase();const c=S.caseDraft;c.err=c.subj.length<5?'Write a short subject.':c.desc.length<10?'Tell us a bit more about what happened.':'';if(c.err)return render();
    const k=newCase(c.subj,c.cat,c.order,c.desc+(c.file?' (screenshot attached)':''));S.caseDraft=null;S.tabs=S.tabs.filter(t=>t!=='case:new');toast('Request '+k.id+' sent');openTab('case:'+k.id)},
  caseReopen:x=>{const c=S.cases.find(y=>y.id===x);c.st='progress';c.upd=now();c.msgs.push({from:'sys',text:'You reopened the request.',t:now()});render()},
  caseAccept:x=>{const c=S.cases.find(y=>y.id===x);c.st='closed';c.upd=now();c.msgs.push({from:'sys',text:'You accepted the solution. Request closed.',t:now()});toast('Thanks! Request closed');render()},
  caseClose:x=>{const c=S.cases.find(y=>y.id===x);c.st='closed';c.upd=now();c.msgs.push({from:'sys',text:'You closed the request.',t:now()});render()},
  /* market */
  mrange:x=>{S.mrange=x;render()},
  paToggle:x=>{const a=S.alerts.find(y=>y.id===x);a.on=!a.on;if(a.on)a.hit=0;render()},
  paDel:x=>{S.alerts=S.alerts.filter(y=>y.id!==x);render()},
  /* telegram */
  tg:x=>{S.tg=x;if(x==='bot')S.unread=0;if(S.page!=='telegram'||S.active!=='page')return goPage('telegram');render()},
  topic:x=>{S.tg='group';S.topic=x;render()},
  tgUnlink:()=>toast('In the real app you would confirm this in Telegram.'),
  botcmd:x=>{S.bot.push({t:now(),text:x,me:true});const am=activeMine(),bs=bestSell()[0],bb=bestBuy()[0];
    const r=x==='/balance'?`Balance: ${u(S.wallet.avail)} USDT free, ${u(S.wallet.held+S.wallet.ads)} locked.`:x==='/orders'?(am.length?am.map(d=>`${d.id} · ${u(d.usdt)} USDT · ${ST[d.st][0]}`).join('\n'):'You have no orders in progress.'):x==='/price'?`Buy from ${m2(bs.price)} LC · sell up to ${m2(bb.price)} LC.`:'I send order updates, codes and price alerts. Trading happens in the app, never in chat.';
    S.bot.push({t:now(),text:r,btn:x==='/orders'&&am.length?{label:'Open order',x:'deal:'+am[0].id}:{label:'Open app',x:x==='/balance'?'pg:wallet/assets':x==='/price'?'pg:market':'pg:home'}});render()},
  /* admin */
  pause:()=>{S.paused=!S.paused;adminLog(S.paused?'Paused new orders':'Turned new orders back on');if(S.paused)S.channel.push({kind:'news',text:'New orders are paused for a short check. Open orders still finish.',t:now()});render()},
  rule:x=>openModal('rule',x),
  ruleGo:x=>{const [id,to]=x.split('|'),why=val('rule-why');if(why.length<10)return ferr('rule-err','Write a short reason (10 letters or more).');
    const ds=S.disputes.find(y=>y.id===id);Object.assign(ds,{st:'decided',to,why,dt:now()});closeModal(true);adminLog(`Appeal ${id} · ${to==='buyer'?'gave USDT to buyer':'returned to seller'} · ${why}`);
    if(ds.mine){const d=deal(ds.deal);say(d,'admin',`Decision: ${to==='buyer'?'the USDT goes to the buyer':'the USDT goes back to the seller'}. ${why}`,'msg');finish(d,to==='buyer'?'done':'refunded',why);sys(d,`State: ${to==='buyer'?'Done':'Returned'} (was Appeal).`,to==='buyer'?'ok':'bad');notify(`Admin decided ${d.id}`,to==='buyer'?'The USDT went to the buyer.':'The USDT went back to the seller.','deal:'+d.id,'Order updates')}
    toast('Decision saved');render()},
  approve:x=>{const a=S.approvals.find(y=>y.id===x);S.approvals=S.approvals.filter(y=>y.id!==x);S.wdDone.unshift(Object.assign({},a,{st:'Approved'}));adminLog(`Approved withdrawal ${x} · ${u(a.amt)} USDT · ${nm(a.mine?'you':a.user)}`);
    if(a.mine){a.h.st='Sending';later(3000,()=>{a.h.st='Done';S.hot-=a.amt;notify('Withdrawal sent',`${u(a.amt-1)} USDT after admin approval.`,'pg:wallet/history','Deposits and withdrawals')})}else{S.others-=a.amt;S.hot-=a.amt}toast('Approved');render()},
  reject:x=>{const a=S.approvals.find(y=>y.id===x);S.approvals=S.approvals.filter(y=>y.id!==x);S.wdDone.unshift(Object.assign({},a,{st:'Rejected'}));adminLog(`Rejected withdrawal ${x} · ${u(a.amt)} USDT`);if(a.mine){a.h.st='Rejected';S.wallet.avail+=a.amt;notify('Withdrawal rejected','The USDT is back in your wallet.','pg:wallet/history','Deposits and withdrawals')}toast('Rejected');render()},
  kycReview:x=>openModal('kycReview',x),
  kycDecide:x=>{const [id,st]=x.split('|');kycDecide(id,st,val('kyc-why'));closeModal(true);render()},
  merchDecide:x=>{const [id,st]=x.split('|'),m=S.mapps.find(y=>y.id===id);m.st=st;if(st==='approved')trader(m.user).merchant=true;if(m.user==='you')notify(st==='approved'?'You are a verified merchant':'Merchant request declined','',st==='approved'?'profile:you':'pg:account/merchant','Security alerts');adminLog(`Merchant request ${id} · ${nm(m.user)} · ${st}`);toast('Saved');render()},
  riskDismiss:x=>{const r=S.risk.find(y=>y.id===x);r.st='dismissed';adminLog(`Dismissed risk alert ${x} · ${nm(r.user)}`);render()},
  adHide:x=>{const o=S.offers.find(y=>y.id===x);o.status=o.status==='hidden'?'online':'hidden';adminLog(`${o.status==='hidden'?'Hid':'Restored'} ad ${x} · ${nm(o.by)}`);render()},
  treas:x=>openModal('treas',x),
  treasGo:x=>{const a=parseFloat(val('tr-x'));if(!(a>0))return ferr('tr-xerr','Enter an amount.');
    if(x==='sweep'){if(a>S.hot)return ferr('tr-xerr','More than the hot wallet holds.');S.hot-=a;S.cold+=a;S.chain.push({id:'5a'+String(now()).slice(-6),dir:'Out',amt:a,what:'Sweep hot → cold',t:now()});adminLog(`Moved ${u(a)} USDT hot → cold`);closeModal(true);toast('Moved to cold wallet');render()}
    else{if(a>S.cold)return ferr('tr-xerr','More than the cold wallet holds.');S.modal={type:'ledger',data:a};drawModal();later(3200,()=>{S.cold-=a;S.hot+=a;S.chain.push({id:'b1'+String(now()).slice(-6),dir:'In',amt:a,what:'Refill cold → hot',t:now()});adminLog(`Refilled hot wallet with ${u(a)} USDT (Ledger approved)`);if(S.modal&&S.modal.type==='ledger')closeModal(true);toast('Ledger approved. Hot wallet refilled.')})}},
  setSave:()=>{const n=k=>parseFloat(val('set-'+k));const s=S.set;['taker','maker','auto','user','plat'].forEach(k=>{const v=n(k);if(v>=0)s[k]=v});adminLog(`Saved settings · fees ${s.taker}%/${s.maker}% · auto-approve ${u(s.auto)} USDT`);toast('Settings saved');render()},
  setMethod:x=>{S.set.methods[x]=!S.set.methods[x];adminLog(`${x} turned ${S.set.methods[x]?'on':'off'}`);render()},
  setCur:x=>{S.set.cur[x]=!S.set.cur[x];adminLog(`${x} turned ${S.set.cur[x]?'on':'off'}`);render()},
  uSet:x=>{const [id,st]=x.split('|');ustat(id).st=st;S.offers.forEach(o=>{if(o.by===id){if(st!=='active'&&o.status==='online')o.status='hidden';if(st==='active'&&o.status==='hidden')o.status='online'}});adminLog(`User ${nm(id)} · status ${st}`);toast('User is now '+st);render()},
  uMsg:x=>toast('Message sent to '+nm(x)+' by the bot'),
  uLimit:x=>{const v=+val('u-limit-'+x);ustat(x).limit=v;adminLog(`User ${nm(x)} · daily limit ${u(v)} USDT`);toast('Limit saved');render()},
  copy:x=>{try{navigator.clipboard.writeText(x).then(()=>toast('Copied'),()=>toast(x))}catch(e){toast(x)}},
  mclose:()=>closeModal()
});
function kycDecide(id,st,why){const k=S.kycq.find(y=>y.id===id);k.st=st;adminLog(`ID check ${id} · ${nm(k.user)} · ${st}${why?' · '+why:''}`);
  if(st==='approved'){const t=trader(k.user);t.kyc=2;ustat(k.user).limit=20000}
  if(k.user==='you'){S.kyc2=null;notify(st==='approved'?'You are now level 2':'ID check not passed',st==='approved'?'Your limits went up to 20,000 USDT a day.':'Reason: '+(why||'photo not clear')+'. You can try again.','pg:account/verify','Security alerts')}}
function readPrefs(){const p=S.prefs,r=document.querySelector('input[name="pf-den"]:checked');if(r)p.density=r.value;['home','lang','cur','tz'].forEach(k=>{const v=val('pf-'+k);if(v)p[k]=v})}
function readCase(){const c=S.caseDraft;if(!c||!$('#csnf'))return;c.cat=val('cn-cat');c.order=val('cn-order');c.subj=val('cn-subj');c.desc=val('cn-desc')}
function chatSend(d,t){if(SCAMRX.test(t)){sys(d,'Your message was not sent: it had a phone number, a link or another app\'s name. Keep everything in this chat, so the admin can help if something goes wrong.','bad');S.draft[d.id]='';render();return}
  say(d,'you',t);S.draft[d.id]='';render();const reply=/paid|check|receipt/i.test(t)?'OK, checking now.':/release/i.test(t)?'One moment please.':/account name|right account/i.test(t)?`Yes, the account is in the name ${d.holder}.`:pick(['OK.','Sure, one moment.','Got it.','Thanks!'],d.msgs.length);
  later(1300,()=>typing(d,d.cp));later(3000,()=>{if(ACTIVE.includes(d.st))say(d,d.cp,reply)})}

/* ---------- events ---------- */
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-a]');
  if(S.pop&&!e.target.closest('#menuOv,#pop,.hm,.hi,.hme,#gs-box')&&!(el&&(el.dataset.a==='menu'||el.dataset.a==='pop')))closePops();
  if(!el||/INPUT|SELECT|TEXTAREA/.test(el.tagName))return;
  const f=A[el.dataset.a];if(!f)return;
  e.preventDefault();f(el.dataset.x,el);
});
document.addEventListener('change',e=>{const el=e.target,id=el.id||'',L=el.dataset&&el.dataset.l;
  if(el.dataset.a==='tick'){const g=el.dataset.g,all=[...document.querySelectorAll(`#modal [data-a="tick"][data-g="${g}"]`)];$('#tickGo').disabled=!all.every(i=>i.checked);return}
  if(el.dataset.a==='lselRow'){const s=lst(L).sel;el.checked?s.add(el.dataset.x):s.delete(el.dataset.x);render();return}
  if(el.dataset.a==='lselAll'){const s=lst(L).sel;lpage(L).rows.forEach(r=>{const k=lkey(LCFG[L],r);el.checked?s.add(k):s.delete(k)});render();return}
  if(el.dataset.nav){go(el.value);return}
  if(id.startsWith('lsel-')){lst(L).view=el.value;resetL(L);render();return}
  if(id.startsWith('lqf-')){lst(L).qf=el.value;lst(L).q='';render();return}
  if(id.startsWith('lper-')){const s=lst(L);s.per=+el.value;s.pg=1;render();return}
  if(id.startsWith('lact-')){const s=lst(L),ids=[...s.sel],v=el.value;
    if(L==='trade'){if(v==='follow'){const tr=[...new Set(ids.map(i=>(S.offers.find(o=>o.id===i)||{}).by).filter(x=>x&&x!=='you'))];tr.forEach(t=>S.follow.add(t));toast(`Following ${tr.length} trader${tr.length===1?'':'s'}`)}else if(v==='hide'){ids.forEach(i=>s.hidden.add(i));toast(`${ids.length} row${ids.length===1?'':'s'} hidden`)}}
    if(L==='notifs')S.notifs.forEach(n=>{if(ids.includes(n.id))n.read=v==='read'});
    s.sel=new Set();render();return}
  if(id.startsWith('lb-'))return;
  if(el.name==='st-pm'||id==='st-pm'){if(S.modal)S.modal.data.pm=el.value;return}
  if(id==='ex-fiat'||id==='ex-m'){S.ex[id==='ex-fiat'?'fiat':'m']=el.value;render();return}
  if(id==='wd-book'){const b=S.book.find(x=>x.id===el.value);$('#wd-addr').value=b?b.addr:'';return}
  if(id==='pm-type'){const isM=el.value==='Mobile money';$('#pm-bank').innerHTML=opts(isM?['PayLink','MoMo Cash','CityPay']:['National Bank','Union Bank','First City Bank']);const lb=document.querySelector('label[for="pm-bank"]'),la=document.querySelector('label[for="pm-acct"]');if(lb)lb.textContent=isM?'Provider':'Bank';if(la)la.textContent=isM?'Phone number':'Account number';return}
  if(el.name==='kyc-doc'){S.kyc2.doc=el.value;render();return}
  if(el.closest&&el.closest('#adf')){readAd();if(id==='af-fiat'){const c=S.create;if(c.ptype==='fixed')c.price=(CUR[c.fiat].market+(c.side==='sell'?0.02:-0.02)).toFixed(2);render()}else updAd();return}
  if(id==='cn-cat'){readCase();render();return}
});
document.addEventListener('input',e=>{const el=e.target,id=el.id||'';
  if(id.startsWith('lq-')){lst(el.dataset.l).q=el.value;refreshL(el.dataset.l);return}
  if(id==='st-a'||id==='st-b'){const m=S.modal.data,o=S.offers.find(y=>y.id===m.id);if(!o)return;const v=parseFloat(el.value)||0,buyIt=o.side==='sell';
    let other;if(id==='st-a')other=buyIt?(v/o.price).toFixed(2):(v*o.price).toFixed(2);else other=buyIt?(v*o.price).toFixed(2):(v/o.price).toFixed(2);
    const t=$(id==='st-a'?'#st-b':'#st-a');if(t)t.value=v?other:'';m.a=val('st-a');m.b=val('st-b');ferr('st-err','');return}
  if(id==='ex-amt'){S.ex.amt=el.value;const r=$('#ex-res');if(r)r.innerHTML=exResult();return}
  if(id==='ch-in'){const d=S.active.startsWith('deal:')&&S.active.slice(5);if(d)S.draft[d]=el.value;return}
  if(id==='cs-in'){S.draft[S.active]=el.value;return}
  if(id==='va-in'){S.vaDraft=el.value;return}
  if(id==='rate-txt'){S.rate.text=el.value;return}
  if(id==='wd-amt'){const a=parseFloat(el.value)||0;$('#wd-get').textContent=u(Math.max(0,a-1))+' USDT';return}
  if(id==='mo-q'||id==='pin-q'){S.menuQ=el.value;const l=$(id==='mo-q'?'#mo-list':'#pin-list');if(l)l.innerHTML=menuList(id==='mo-q'?S.pop:'all',el.value.trim().toLowerCase());return}
  if(id==='gsearch'||id==='gsearch2'){S.q=el.value;if(id==='gsearch'&&S.pop!=='search'){S.pop='search';renderPop()}else{const r=$('#srch');if(r)r.innerHTML=searchList()}return}
  if(el.closest&&el.closest('#adf')){readAd();updAd();return}
  if(el.closest&&el.closest('#csnf')){readCase();return}
});
$('#gsearch').addEventListener('focus',()=>{if(S.q.trim()&&S.pop!=='search'){S.pop='search';renderPop()}});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){if(S.modal){closeModal();return}if(S.pop){const p=S.pop;closePops();const b=document.querySelector(`[data-x="${p}"]`);if(b)b.focus();return}}
  if(e.key==='Enter'&&e.target.id==='gsearch'){e.preventDefault();const r=searchResults(S.q);if(r[0]){go(r[0].k);e.target.blur()}}
});
document.addEventListener('submit',e=>{e.preventDefault();const f=e.target,id=f.id;
  if(id==='chf'){const d=deal(S.active.slice(5)),t=val('ch-in');if(!t||!d)return;chatSend(d,t);const n=$('#ch-in');if(n){n.value='';n.focus()}return}
  if(id==='vaf'){const t=val('va-in');if(!t)return;S.vaDraft='';vaHandle(t,t);renderVA();const n=$('#va-in');if(n)n.focus();return}
  if(id==='csf'){const c=S.cases.find(y=>y.id===f.dataset.x),t=val('cs-in');if(!t)return;c.msgs.push({from:'you',text:t,t:now()});c.upd=now();S.draft['case:'+c.id]='';const was=c.st;if(was==='waiting'||was==='resolved'){c.st='progress';c.msgs.push({from:'sys',text:'State changed to In progress.',t:now()})}render();
    later(5000,()=>{c.msgs.push({from:'agent',text:was==='waiting'?'Thanks for confirming. Then you are all set: pay from that account and it will be accepted. I will mark this as resolved.':'Thanks, I have added this to your request. I will update you soon.',t:now()});if(was==='waiting'){c.st='resolved';c.msgs.push({from:'sys',text:'State changed to Resolved.',t:now()})}c.upd=now();notify(`Request ${c.id} updated`,'Support replied.','case:'+c.id,'Order updates')});return}
  if(id==='hsf'){S.hq=val('hs-q');render();return}
  if(id==='vcf'){S.vc=vcCheck(val('vc-q'));render();return}
  if(id==='psf'){const r=searchResults(S.q);if(r[0])go(r[0].k);return}
  if(id==='paf'){const p=parseFloat(val('pa-price'));if(!(p>0))return toast('Enter a price.');S.alerts.push({id:'PA-'+(S.alerts.length+2),side:val('pa-side'),op:val('pa-op'),price:p,on:true,hit:0});toast('Alert added');render();return}
  if(id==='anf'){const t=val('an-t'),b=val('an-b'),ch=[...f.querySelectorAll('input[name="an-ch"]:checked')].map(i=>i.value);if(!t||!b)return ferr('an-err','Write a title and a message.');if(!ch.length)return ferr('an-err','Pick at least one place to send it.');
    S.anns.unshift({id:'AN-'+(AID++),title:t,body:b,t:now(),ch});if(ch.includes('App banner'))S.annOff=false;if(ch.includes('Telegram channel'))S.channel.push({kind:'news',text:t+'. '+b,t:now()});if(ch.includes('Bot message'))notify(t,b,'pg:home','News and announcements');adminLog('Posted announcement: '+t);toast('Announcement posted');render();return}
  if(id==='wnf'){const x=S.disputes.find(y=>y.id===f.dataset.x),t=val('wn-in');if(!t)return;x.notes.push({t:now(),text:t});render();return}
  if(id==='unf'){const t=val('un-in');if(!t)return;ustat(f.dataset.x).notes.push({t:now(),text:t});render();return}
  if(id==='tgf'){const t=val('tg-in');if(!t)return;if(/\d{8,}|\d{4}[ -]\d{4}/.test(t))S.group.push({topic:S.topic,del:true,text:'Message removed by the bot: it contained a bank account number. Share bank details only inside an order.',t:now()});else S.group.push({topic:S.topic,from:'you',me:true,text:t,t:now()});render();return}
});
document.addEventListener('pointermove',chartHover);document.addEventListener('pointerdown',chartHover);
window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(PAGES[h]&&!(S.page===h&&S.active==='page'))goPage(h,true)});
let rz;window.addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{if(S.pop)renderPop();render()},150)});

/* ---------- clocks: timers each second, the market moves every 4 s ---------- */
function tickTimers(){
  document.querySelectorAll('[data-left]').forEach(el=>{el.textContent=dur(+el.dataset.left-now())});
  document.querySelectorAll('[data-since]').forEach(el=>{el.textContent=dur(now()-+el.dataset.since)});
  document.querySelectorAll('[data-unlock]').forEach(el=>{if(now()>=+el.dataset.unlock&&el.disabled)el.disabled=false});
  document.querySelectorAll('[data-appeal]').forEach(el=>{if(now()>=+el.dataset.appeal&&el.disabled){el.disabled=false;const s=el.querySelector('[data-left]');if(s)s.remove()}});
}
let tick=0;
setInterval(()=>{tickTimers();tickDeals();tick++;if(tick%4===0)moveBoard()},1000);
function moveBoard(){const k=tick/4,lock=S.board.filter(b=>b.st==='locked'),paid=S.board.filter(b=>b.st==='paid'),done=S.board.filter(b=>b.st==='done');
  if(k%3===0&&lock.length){const b=lock[0];b.st='paid';b.t=now();b.fresh=true}
  else if(k%3===1&&paid.length){const b=paid[0];b.st='done';b.t=now();b.fresh=true;S.doneToday++;if(k%2)S.channel.push({kind:'done',usdt:b.usdt,fiat:b.fiat,rating:trader(b.seller).rating,mins:3+(k%9),t:now()})}
  else{const others=S.offers.filter(o=>o.by!=='you'&&o.status==='online'&&!o.keep);if(others.length>9&&!S.paused){const o=others[others.length-1];o.status='closed';S.channel.forEach(p=>{if(p.kind==='new'&&p.o.id===o.id)p.taken=true});const cp=T[(T.indexOf(trader(o.by))+3)%T.length].id;S.board.push({id:'D-'+(DID++),buyer:o.side==='sell'?cp:o.by,seller:o.side==='sell'?o.by:cp,usdt:Math.min(o.avail,500),fiat:o.fiat,price:o.price,method:o.methods[0],st:'locked',t:now(),fresh:true})}}
  if(done.length>4)S.board=S.board.filter(b=>b!==done[0]);
  if(k%2===0&&S.offers.filter(o=>o.by!=='you'&&o.status==='online').length<14&&!S.paused){const t=T[k%T.length],side=k%4===0?'buy':'sell',amt=pick([100,200,300,500,750,1000,1500],k),pr=+(side==='sell'?3.66+(k%5)/100:3.60+(k%4)/100).toFixed(2);const o=mkAd(t.id,side,amt,pr,[pick(METHODS,k)],{min:50,max:Math.round(amt*pr)});o.t=now();S.offers.push(o);maCheck(o);if(k%4===2)S.channel.push({kind:'new',o,t:now(),taken:false})}
  const ph=S.priceHist;ph.push(+(ph[ph.length-1]+((k*13)%5-2)/500).toFixed(3));ph.shift();CUR.LC.market=ph[ph.length-1];
  S.offers.forEach(o=>{if(o.ptype==='float')o.price=adPrice(o)});checkAlerts();
  T.forEach((t,i)=>{if((k+i)%11===0)t.online=!t.online});
  const busy=S.modal||tipOn||(document.activeElement&&/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)&&$('#main').contains(document.activeElement));
  if(S.active==='page'&&['home','market'].includes(S.page)&&!busy||(S.active==='page'&&S.page==='telegram'&&S.tg==='channel'&&!busy))render();else{renderRail();renderHeader()}
}

/* ---------- start ---------- */
{const h=location.hash.slice(1);if(PAGES[h])S.page=h}
addHist(pageKey());render();
