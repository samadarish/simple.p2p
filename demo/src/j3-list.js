/* ---------- generic list pages (saved lists, filter breadcrumb, condition builder, sortable table, pager) ---------- */
const LCFG={};
function lst(id){return S.L[id]||(S.L[id]={view:LCFG[id]?LCFG[id].views[0].id:'',q:'',qf:'',sort:null,conds:[],builder:false,bf:{},sel:new Set(),hidden:new Set(),preview:null,pg:1,per:10})}
function resetL(id){const L=lst(id);L.conds=[];L.sort=null;L.sel=new Set();L.preview=null;L.q='';L.bf={};L.pg=1}
const lview=id=>{const c=LCFG[id],L=lst(id);return c.views.find(v=>v.id===L.view)||c.views[0]};
const lkey=(c,r)=>c.key?c.key(r):r.id;
function lsortOf(id){const c=LCFG[id],L=lst(id),v=lview(id);return L.sort||v.sort||c.sort||null}
function lrows(id){const c=LCFG[id],L=lst(id),v=lview(id);let rows=c.rows(v).filter(r=>!L.hidden.has(lkey(c,r)));
  L.conds.forEach(x=>{rows=rows.filter(x.f)});
  const q=L.q.trim().toLowerCase();if(q&&c.search){const sf=c.search.find(s=>s[0]===(L.qf||c.search[0][0]))||c.search[0];rows=rows.filter(r=>sf[2](r,q))}
  const s=lsortOf(id);if(s){const col=c.cols.find(x=>x.k===s.k);if(col&&col.s)rows=rows.slice().sort((a,b)=>{const x=col.s(a),y=col.s(b);return (x>y?1:x<y?-1:0)*s.dir})}
  return rows}
function lpage(id){const L=lst(id),all=lrows(id),pages=Math.max(1,Math.ceil(all.length/L.per));if(L.pg>pages)L.pg=pages;return {all,rows:all.slice((L.pg-1)*L.per,L.pg*L.per),pages}}
const pagerText=(L,n)=>n?`${(L.pg-1)*L.per+1} to ${Math.min(n,L.pg*L.per)} of ${n}`:'0 of 0';
function lcrumbs(id){const c=LCFG[id],L=lst(id),v=lview(id);const p=[`<button type="button" data-a="lcrumb" data-x="${id}|all">All</button>`];
  (v.cr||[]).forEach((x,i)=>p.push(`<button type="button" data-a="lcrumb" data-x="${id}|v${i}">${esc(x)}</button>`));
  L.conds.forEach((x,i)=>p.push(`<button type="button" data-a="lcrumb" data-x="${id}|c${i}">${esc(x.l)}</button>`));
  return p.join('<span class="sep" aria-hidden="true">&gt;</span>')+(L.conds.length?` <button type="button" data-a="lcrumb" data-x="${id}|clear">Clear</button>`:'')}
function lsortBtn(id,k,l){const s=lsortOf(id);const on=s&&s.k===k;return `<button class="sort" data-a="lsort" data-x="${id}|${k}" aria-label="Sort by ${esc(l)}">${esc(l)}${on?ico(s.dir>0?'chevU':'chevD',13):''}</button>`}
function ltable(id,rows){const c=LCFG[id],L=lst(id);
  if(!rows.length)return c.empty?c.empty(lview(id)):'<p class="empty">No records to display.</p>';
  const all=rows.length&&rows.every(r=>L.sel.has(lkey(c,r)));
  return `<table class="tbl stack"><thead><tr>${c.sel?`<th class="cb"><input type="checkbox" data-a="lselAll" data-l="${id}" aria-label="Select all rows on this page"${all?' checked':''}></th>`:''}${c.preview?'<th class="pv"><span class="sr">Preview</span></th>':''}${c.cols.map(x=>`<th class="${x.r?'r':''}">${x.s?lsortBtn(id,x.k,x.l):esc(x.l)}</th>`).join('')}${c.act?'<th><span class="sr">Action</span></th>':''}</tr></thead><tbody>${rows.map(r=>{const k=lkey(c,r),sel=L.sel.has(k);
    return `<tr class="${sel?'sel ':''}${c.rowCls?c.rowCls(r):''}">${c.sel?`<td class="cb"><input type="checkbox" data-a="lselRow" data-l="${id}" data-x="${esc(k)}" aria-label="Select ${esc(k)}"${sel?' checked':''}></td>`:''}${c.preview?`<td class="pv"><button class="ib" data-a="lprev" data-x="${id}|${esc(k)}" aria-label="Preview ${esc(k)}">${ico('info')}</button></td>`:''}${c.cols.map(x=>`<td data-l="${esc(x.l)}" class="${x.r?'r ':''}${x.cls||''}">${x.v(r)}</td>`).join('')}${c.act?`<td class="act">${c.act(r)}</td>`:''}</tr>`}).join('')}</tbody></table>`}
function lbuilder(id){const c=LCFG[id],L=lst(id);return `<div class="builder">${c.builder.map(f=>f.num?`<div class="fld"><label class="lbl" for="lb-${id}-${f.k}">${esc(f.l)}</label><input class="in" id="lb-${id}-${f.k}" inputmode="decimal" value="${esc(L.bf[f.k]||'')}"></div>`:`<div class="fld"><label class="lbl" for="lb-${id}-${f.k}">${esc(f.l)}</label><select class="in" id="lb-${id}-${f.k}">${opts([['','-- any --']].concat(f.opts),L.bf[f.k]||'')}</select></div>`).join('')}<div class="btns"><button class="btn pri" data-a="lrun" data-x="${id}">Run</button><button class="btn plain" data-a="lbclear" data-x="${id}">Clear</button></div></div>`}
function lmenu(id){const c=LCFG[id],L=lst(id);const gs=[...new Set(c.views.map(v=>v.g))];
  return `<p class="lmenu-h">${esc(c.menuTitle||'Lists')}</p>`+gs.map(g=>{const ck=id+'|'+g,open=!S.lclosed.has(ck);return `<button class="lg" data-a="lgroup" data-x="${esc(ck)}" aria-expanded="${open}">${ico(open?'chevD':'chevR',14)}${esc(g)}</button>${open?c.views.filter(v=>v.g===g).map(v=>`<button class="li${v.id===L.view?' on':''}" data-a="lv" data-x="${id}|${v.id}"${v.id===L.view?' aria-current="true"':''}><span>${esc(v.l)}</span><span class="c">${c.rows(v).length}</span></button>`).join(''):''}`}).join('')}
function listHTML(id,o){o=o||{};const c=LCFG[id],L=lst(id),v=lview(id),{all,rows,pages}=lpage(id);
  const menu=c.menu==='left'&&!o.inner,pills=!menu&&c.views.length>1;
  const prevId=c.preview&&L.preview&&wide()?L.preview:null,prev=prevId?c.preview(prevId):'';
  const sf=c.search?(c.search.find(s=>s[0]===(L.qf||c.search[0][0]))||c.search[0]):null;
  return `<div class="lp${menu?'':' nomenu'}${prev?' prev':''}${o.inner?' inner':''}">
  ${menu?`<nav class="lmenu" aria-label="Lists">${lmenu(id)}</nav>`:''}
  <section class="lmain">
    ${menu?`<div class="lsel"><label class="sr" for="lsel-${id}">List</label><select class="in" id="lsel-${id}" data-l="${id}">${c.views.map(x=>`<option value="${x.id}"${x.id===v.id?' selected':''}>${esc(x.g)}: ${esc(x.l)}</option>`).join('')}</select></div>`:''}
    <div class="lbar"><h2>${esc(c.title?c.title(v):v.g+': '+v.l)}</h2><span class="cnt" id="lcnt-${id}">${all.length}</span>
      ${c.search?`<div class="lsearch"><label class="sr" for="lqf-${id}">Search in</label><select class="in" id="lqf-${id}" data-l="${id}">${opts(c.search.map(s=>[s[0],s[1]]),sf[0])}</select><label class="sr" for="lq-${id}">Search</label><input class="in" id="lq-${id}" data-l="${id}" type="search" placeholder="${esc(sf[3]||'Search')}" value="${esc(L.q)}" autocomplete="off"></div>`:''}
      <div class="btns ml"><button class="ib" data-a="lrefresh" data-x="${id}" aria-label="Refresh list" title="Refresh">${ico('refresh')}</button>${c.head?c.head(v):''}</div></div>
    ${pills?`<div class="fpills" role="group" aria-label="Lists">${c.views.map(x=>`<button class="fp${x.id===v.id?' on':''}" data-a="lv" data-x="${id}|${x.id}" aria-pressed="${x.id===v.id}">${esc(x.l)} <span class="c">${c.rows(x).length}</span></button>`).join('')}</div>`:''}
    <div class="crumbs">${c.builder?`<button class="ib${L.builder?' on':''}" data-a="lbuilder" data-x="${id}" aria-expanded="${L.builder}" aria-label="Filter" title="Filter">${ico('filter')}</button>`:''}${lcrumbs(id)}</div>
    ${L.builder&&c.builder?lbuilder(id):''}
    ${o.before||''}
    <div class="tbl-wrap" id="lt-${id}">${ltable(id,rows)}</div>
    <div class="lfoot">${c.bulk?`<span><label class="sr" for="lact-${id}">Actions on selected rows</label><select class="in" id="lact-${id}" data-l="${id}"${L.sel.size?'':' disabled'}><option value="">Actions on selected rows${L.sel.size?` (${L.sel.size})`:''}</option>${c.bulk.map(b=>`<option value="${b[0]}">${esc(b[1])}</option>`).join('')}</select></span>`:'<span></span>'}
      ${L.hidden.size?`<span class="small">${L.hidden.size} hidden · <button class="link" data-a="lunhide" data-x="${id}">Show</button></span>`:''}
      <span class="pager"><label class="small muted" for="lper-${id}">Rows</label><select class="in" id="lper-${id}" data-l="${id}" style="width:auto;height:28px;padding:0 4px">${opts([10,20,50],L.per)}</select><button class="ib" data-a="lpg" data-x="${id}|-1" aria-label="Previous page"${L.pg<=1?' disabled':''}>${ico('chevL')}</button><span id="lpg-${id}">${pagerText(L,all.length)}</span><button class="ib" data-a="lpg" data-x="${id}|1" aria-label="Next page"${L.pg>=pages?' disabled':''}>${ico('chevR')}</button></span></div>
  </section>
  ${prev?`<aside class="lprev" aria-label="Preview">${prev}</aside>`:''}</div>`}
function refreshL(id){const t=$('#lt-'+id);if(!t)return render();const L=lst(id);L.pg=1;const {all,rows,pages}=lpage(id);t.innerHTML=ltable(id,rows);$('#lcnt-'+id).textContent=all.length;$('#lpg-'+id).textContent=pagerText(L,all.length);
  const nx=document.querySelector(`[data-a="lpg"][data-x="${id}|1"]`),pv=document.querySelector(`[data-a="lpg"][data-x="${id}|-1"]`);if(nx)nx.disabled=L.pg>=pages;if(pv)pv.disabled=true}
const LA={
  lv:x=>{const [id,v]=x.split('|');lst(id).view=v;resetL(id);render()},
  lgroup:x=>{S.lclosed.has(x)?S.lclosed.delete(x):S.lclosed.add(x);render()},
  lsort:x=>{const [id,k]=x.split('|'),s=lsortOf(id);lst(id).sort={k,dir:s&&s.k===k?-s.dir:1};render()},
  lbuilder:x=>{const L=lst(x);L.builder=!L.builder;render();if(L.builder){const f=document.querySelector(`[id^="lb-${x}-"]`);if(f)f.focus()}},
  lrun:x=>{const c=LCFG[x],L=lst(x);document.querySelectorAll(`[id^="lb-${x}-"]`).forEach(el=>{L.bf[el.id.slice(4+x.length)]=el.value});L.conds=c.cond(L.bf);L.builder=false;L.pg=1;render()},
  lbclear:x=>{const L=lst(x);L.bf={};L.conds=[];render()},
  lcrumb:x=>{const [id,w]=x.split('|'),c=LCFG[id],L=lst(id),v=lview(id);
    if(w==='all'){L.conds=[];L.bf={};const first=c.views.find(y=>y.g===v.g)||c.views[0];L.view=first.id}
    else if(w[0]==='v'||w==='clear'){L.conds=[];L.bf={}}
    else L.conds=L.conds.slice(0,+w.slice(1)+1);L.pg=1;render()},
  lprev:x=>{const [id,k]=x.split('|');if(wide()){lst(id).preview=k;render()}else if(LCFG[id].onPreview)LCFG[id].onPreview(k)},
  lclosePrev:x=>{lst(x).preview=null;render()},
  lrefresh:x=>{render();toast('List refreshed')},
  lunhide:x=>{lst(x).hidden=new Set();render()},
  lpg:x=>{const [id,d]=x.split('|'),L=lst(id);L.pg=Math.max(1,L.pg+ +d);render()}
};

/* ---------- module pages with a left menu (account, wallet, help, admin) ---------- */
function modPage(page,groups,body){const cur=S.sub[page];
  const nav=`<nav class="lmenu" aria-label="${esc(PAGES[page].l)}"><p class="lmenu-h">${esc(PAGES[page].l)}</p>${groups.map(([g,items])=>`${g?`<p class="lg mg">${esc(g)}</p>`:''}${items.map(([s,l,c])=>`<button class="li${cur===s?' on':''}" data-a="go" data-x="pg:${page}/${s}"${cur===s?' aria-current="page"':''}><span>${esc(l)}</span>${c?`<span class="c">${c}</span>`:''}</button>`).join('')}`).join('')}</nav>`;
  const sel=`<div class="lsel"><label class="sr" for="nav-${page}">Section</label><select class="in" id="nav-${page}" data-nav="1">${groups.map(([g,items])=>items.map(([s,l])=>`<option value="pg:${page}/${s}"${cur===s?' selected':''}>${g?esc(g)+': ':''}${esc(l)}</option>`).join('')).join('')}</select></div>`;
  return `<div class="lp mod">${nav}<section class="lmain mod-b">${sel}${body}</section></div>`}
const phead=(t,s,btns)=>`<div class="ph"><div><h1>${t}</h1>${s?`<p class="sub">${s}</p>`:''}</div>${btns?`<div class="btns">${btns}</div>`:''}</div>`;
