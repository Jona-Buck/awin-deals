let products=[];
let featuredOrder=[];
let saved=new Set(readSaved());
let state={query:"",category:"Alle",merchant:"Alle",price:"Alle",discount:"Alle",sort:"featured"};
let visibleLimit=pageSize();

const $=s=>document.querySelector(s);
const escapeHtml=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
const money=v=>new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"}).format(Number(v)||0);
const imagesOf=p=>[...new Set((Array.isArray(p.images)&&p.images.length?p.images:[p.image]).filter(Boolean))];
function pageSize(){return window.matchMedia("(max-width:760px)").matches?32:64;}

function readSaved(){
  try{
    const v=JSON.parse(localStorage.getItem("awinSaved")||"[]");
    return Array.isArray(v)?v.map(String):[];
  }catch{return []}
}
function writeSaved(){localStorage.setItem("awinSaved",JSON.stringify([...saved]));}
function discountOf(p){return p.oldPrice&&p.price<p.oldPrice?Math.round((1-p.price/p.oldPrice)*100):0;}
function href(p){return "product.html?id="+encodeURIComponent(p.id);}
function bestDiscountProduct(list){return [...list].sort((a,b)=>discountOf(b)-discountOf(a))[0]||list[0];}

async function init(){
  try{
    const response=await fetch("products.json",{cache:"no-store"});
    if(!response.ok)throw new Error("products");
    products=(await response.json()).products||[];
    featuredOrder=products.map((_,i)=>i);
    for(let i=featuredOrder.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [featuredOrder[i],featuredOrder[j]]=[featuredOrder[j],featuredOrder[i]];
    }
    $("#year").textContent=new Date().getFullYear();
    const catCount=new Set(products.map(p=>p.category).filter(Boolean)).size;
    const merchantCount=new Set(products.map(p=>p.merchant).filter(Boolean)).size;
    $("#heroStatsProducts").textContent=String(products.length).padStart(2,"0");
    $("#heroStatsCategories").textContent=String(catCount).padStart(2,"0");
    $("#heroStatsMerchants").textContent=String(merchantCount).padStart(2,"0");
    renderProducts(true);
    renderBrandTicker();
    renderSaved();
    bindEvents();
    setupReveal();
  }catch{
    $("#productGrid").innerHTML='<div class="empty-state"><div class="empty-glyph">!</div><h3>Katalog konnte nicht geladen werden.</h3><p>Bitte später erneut versuchen.</p></div>';
  }
}

const welcomeBrands=["NAVEE","adidas","PUMA","macron","Samsung","Apple","Jack Wolfskin","Zalando","OTTO","REWE"];

function brandOf(p){
  if(p.brand)return String(p.brand);
  const n=String(p.name||"").trim();
  if(/^adidas\b/i.test(n))return "adidas";
  if(/^puma\b/i.test(n))return "PUMA";
  if(/^macron\b/i.test(n))return "macron";
  if(/^navee\b/i.test(n))return "NAVEE";
  return (n.split(/\s+/)[0]||p.merchant||"Shop").replace(/[.,].*$/g,"");
}
function renderBrandTicker(){
  const track=$("#brandTrack");
  if(!track)return;
  const brands=[...new Set([...products.map(brandOf).filter(Boolean),...welcomeBrands])];
  const items=brands.map(b=>'<span>'+escapeHtml(b)+'</span>').join('');
  track.innerHTML='<div class="brand-set">'+items+'</div><div class="brand-set" aria-hidden="true">'+items+'</div>';
}

function shortName(name){
  return String(name).replace(" adidas Originals"," adidas").replace(" Herren "," ").replace(" Unisex "," ").slice(0,34);
}

function renderFocus(){
  const p=bestDiscountProduct(products);
  if(!p)return;
  const image=imagesOf(p)[0];
  $("#focusWrap").innerHTML=
    '<article class="focus-card">'+
      '<div class="focus-copy">'+
        '<span class="merchant">'+escapeHtml(p.merchant||"Shop")+'</span>'+
        '<h3>'+escapeHtml(p.name)+'</h3>'+
        '<p>'+escapeHtml(p.description||"")+'</p>'+
        '<div class="focus-price"><strong>'+money(p.price)+'</strong>'+(p.oldPrice?'<s>'+money(p.oldPrice)+'</s>':'')+'</div>'+
        '<div class="focus-actions"><a class="primary-btn" href="'+href(p)+'">Produkt ansehen <span>↗</span></a></div>'+
      '</div>'+
      '<div class="focus-visual">'+
        (p.badge?'<span class="pill">'+escapeHtml(p.badge)+'</span>':'')+
        (image?'<img src="'+escapeHtml(image)+'" alt="'+escapeHtml(p.name)+'" loading="lazy" decoding="async" referrerpolicy="no-referrer">':'')+
      '</div>'+
    '</article>';
}

function filtered(){
  const q=state.query.trim().toLowerCase();
  let list=products.filter(p=>{
    const hay=[p.name,p.merchant,p.category,p.description,...(p.highlights||[])].join(" ").toLowerCase();
    if(q&&!hay.includes(q))return false;
    if(state.merchant!=="Alle"&&p.merchant!==state.merchant)return false;
    if(state.price==="0-25"&&!(p.price<=25))return false;
    if(state.price==="25-50"&&!(p.price>25&&p.price<=50))return false;
    if(state.price==="50+"&&!(p.price>50))return false;
    const d=discountOf(p);
    if(state.discount==="25+"&&d<25)return false;
    if(state.discount==="50+"&&d<50)return false;
    if(state.discount==="70+"&&d<70)return false;
    return true;
  });
  const s=state.sort;
  if(s==="featured"){
    const rank=new Map(featuredOrder.map((productIndex,rank)=>[String(products[productIndex]?.id),rank]));
    list.sort((a,b)=>(rank.get(String(a.id))??9999)-(rank.get(String(b.id))??9999));
  }
  if(s==="discount")list.sort((a,b)=>discountOf(b)-discountOf(a));
  if(s==="low")list.sort((a,b)=>a.price-b.price);
  if(s==="high")list.sort((a,b)=>b.price-a.price);
  if(s==="name")list.sort((a,b)=>a.name.localeCompare(b.name,"de"));
  return list;
}

function updateLoadMore(list){
  const wrap=$("#loadMoreWrap"),button=$("#loadMore");
  if(!wrap||!button)return;
  const remaining=Math.max(0,list.length-visibleLimit);
  wrap.hidden=remaining===0;
  button.textContent=remaining>0
    ?"Mehr Produkte laden · "+Math.min(pageSize(),remaining)+" weitere"
    :"";
}

function renderProducts(resetLimit=false){
  if(resetLimit)visibleLimit=pageSize();
  const list=filtered();
  const visible=list.slice(0,visibleLimit);
  $("#resultSummary").textContent=list.length+" "+(list.length===1?"Produkt":"Produkte")+(state.query?' · Suche: “'+state.query+'”':"");
  $("#productGrid").innerHTML=visible.map(productCard).join("");
  $("#emptyState").hidden=!!list.length;
  bindSaveButtons();
  setupProductTilt();
  syncSortControl();
  updateLoadMore(list);
}

function loadMoreProducts(){
  const list=filtered();
  if(visibleLimit>=list.length)return;
  const start=visibleLimit;
  visibleLimit=Math.min(visibleLimit+pageSize(),list.length);
  $("#productGrid").insertAdjacentHTML("beforeend",list.slice(start,visibleLimit).map(productCard).join(""));
  bindSaveButtons();
  setupProductTilt();
  updateLoadMore(list);
}

function productCard(p){
  const image=imagesOf(p)[0];
  const id=String(p.id);
  const isSaved=saved.has(id);
  return '<article class="product-card">'+
    '<a class="product-card-main" href="'+href(p)+'">'+
      '<div class="product-media">'+
        (image?'<img src="'+escapeHtml(image)+'" alt="'+escapeHtml(p.name)+'" loading="lazy" referrerpolicy="no-referrer">':'')+
        (p.badge?'<span class="product-tag">'+escapeHtml(p.badge)+'</span>':'')+
      '</div>'+
      '<div class="product-body">'+
        '<div class="merchant-line"><span>'+escapeHtml(p.merchant||"Shop")+'</span><span>'+escapeHtml(p.category||"")+'</span></div>'+
        '<h3>'+escapeHtml(p.name)+'</h3>'+
        '<p>'+escapeHtml(p.description||"")+'</p>'+
        '<div class="price-row"><strong>'+money(p.price)+'</strong>'+(p.oldPrice?'<s>'+money(p.oldPrice)+'</s>':'')+'</div>'+
      '</div>'+
    '</a>'+
    '<button type="button" class="card-save '+(isSaved?"saved":"")+'" data-save-id="'+escapeHtml(id)+'" aria-label="'+(isSaved?"Von Merkliste entfernen":"Zur Merkliste hinzufügen")+'" aria-pressed="'+(isSaved?"true":"false")+'">'+(isSaved?"♥":"♡")+'</button>'+
  '</article>';
}

function bindSaveButtons(){
  document.querySelectorAll("[data-save-id]").forEach(btn=>{
    btn.addEventListener("click",e=>{
      e.preventDefault();e.stopPropagation();
      toggleSaved(btn.dataset.saveId);
    });
  });
}
function bindEvents(){
  $("#sortTrigger").addEventListener("click",toggleSortMenu);
  $("#sortMenu").addEventListener("click",e=>{
    const option=e.target.closest("[data-sort]");
    if(!option)return;
    state.sort=option.dataset.sort;
    closeSortMenu();
    renderProducts(true);
  });
  document.addEventListener("click",e=>{
    if(!$("#sorter").contains(e.target))closeSortMenu();
  });
  $("#mobileQuickToggle").addEventListener("click",toggleQuickMenu);
  $("#mobileSearch").addEventListener("click",()=>{setQuickMenu(false);toggleSearch(true);window.scrollTo({top:0,behavior:"smooth"})});
  $("#searchInput").addEventListener("input",e=>{state.query=e.target.value;renderProducts(true)});
  $("#searchClear").addEventListener("click",()=>{$("#searchInput").value="";state.query="";renderProducts(true);$("#searchInput").focus()});
  $("#heroSaved").addEventListener("click",()=>setDrawer(true));
  $("#mobileSaved").addEventListener("click",()=>{setQuickMenu(false);setDrawer(true)});
  $("#drawerClose").addEventListener("click",()=>setDrawer(false));
  $("#drawerScrim").addEventListener("click",()=>setDrawer(false));
  $("#emptyReset").addEventListener("click",resetAll);
  $("#loadMore")?.addEventListener("click",loadMoreProducts);
  document.addEventListener("keydown",e=>{
    const target=e.target;
    const typing=target&&((target.tagName==="INPUT")||(target.tagName==="TEXTAREA")||(target.tagName==="SELECT")||target.isContentEditable);
    if(!typing&&(e.key==="/"||((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"))){e.preventDefault();toggleSearch(true);return;}
    if(e.key==="Escape"){
      if(!$("#searchPanel").hidden)toggleSearch(false);
      if($("#savedDrawer").classList.contains("open"))setDrawer(false);
      closeSortMenu();
    }
  });
}

const sortLabels={featured:"Empfohlen",discount:"Rabatt zuerst",low:"Preis aufsteigend",high:"Preis absteigend",name:"Name A–Z"};
function toggleSortMenu(){
  const menu=$("#sortMenu"), open=!menu.hidden;
  menu.hidden=open;
  $("#sortTrigger").setAttribute("aria-expanded",String(!open));
}
function closeSortMenu(){
  const menu=$("#sortMenu");
  if(menu)menu.hidden=true;
  const trigger=$("#sortTrigger");
  if(trigger)trigger.setAttribute("aria-expanded","false");
}
function syncSortControl(){
  document.querySelectorAll("#sortMenu [data-sort]").forEach(btn=>btn.classList.toggle("active",btn.dataset.sort===state.sort));
}
function resetAll(){
  state={query:"",category:"Alle",merchant:"Alle",price:"Alle",discount:"Alle",sort:"featured"};
  $("#searchInput").value="";
  closeSortMenu();renderProducts(true);
}

function toggleSaved(id){
  id=String(id);
  saved.has(id)?saved.delete(id):saved.add(id);
  writeSaved();renderProducts(false);renderSaved();
}
function renderSaved(){
  const list=[...saved].map(id=>products.find(p=>String(p.id)===id)).filter(Boolean);
  const savedCount=$("#savedCount");
  if(savedCount)savedCount.textContent=list.length;
  const mobileSavedCount=$("#mobileSavedCount");
  if(mobileSavedCount)mobileSavedCount.textContent=list.length;
  $("#savedList").innerHTML=list.length?list.map(p=>{
    const img=imagesOf(p)[0];
    return '<div class="saved-item">'+
      (img?'<img src="'+escapeHtml(img)+'" alt="" loading="lazy" referrerpolicy="no-referrer">':'<div class="saved-placeholder"></div>')+
      '<a class="saved-copy" href="'+href(p)+'"><b>'+escapeHtml(p.name)+'</b><span>'+money(p.price)+'</span></a>'+
      '<button class="saved-remove" type="button" data-remove-saved="'+escapeHtml(p.id)+'" aria-label="Entfernen">×</button>'+
    '</div>';
  }).join(""):'<div style="padding:60px 0;text-align:center;color:var(--muted)">Noch keine Produkte gespeichert.</div>';
  $("#savedList").querySelectorAll("[data-remove-saved]").forEach(btn=>btn.addEventListener("click",()=>toggleSaved(btn.dataset.removeSaved)));
}
function setDrawer(open){
  $("#savedDrawer").classList.toggle("open",open);
  $("#savedDrawer").setAttribute("aria-hidden",String(!open));
  ["#mobileSaved","#heroSaved"].forEach(selector=>{
    const btn=$(selector);
    if(btn)btn.setAttribute("aria-expanded",String(open));
  });
  document.body.classList.toggle("drawer-open",open);
}
function toggleQuickMenu(force){
  const wrap=$("#mobileQuickMenu");
  const toggle=$("#mobileQuickToggle");
  if(!wrap||!toggle)return;
  const open=typeof force==="boolean"?force:!wrap.classList.contains("open");
  wrap.classList.toggle("open",open);
  toggle.setAttribute("aria-expanded",String(open));
  toggle.setAttribute("aria-label",open?"Navigation schließen":"Navigation öffnen");
  const actions=wrap.querySelector(".quick-actions");
  if(actions)actions.setAttribute("aria-hidden",String(!open));
}
function setQuickMenu(open){
  toggleQuickMenu(!!open);
}

function toggleSearch(force){
  const panel=$("#searchPanel");
  if(!panel)return;
  const open=typeof force==="boolean"?force:panel.hidden;
  panel.hidden=!open;
  const mobileButton=$("#mobileSearch");
  if(mobileButton)mobileButton.setAttribute("aria-expanded",String(open));
  if(open)setTimeout(()=>$("#searchInput").focus(),0);
}
function applyThemeMeta(){const meta=$("#themeColor");if(meta)meta.content=document.documentElement.dataset.theme==="light"?"#f4f4f1":"#080808"}
function toggleTheme(){
  const html=document.documentElement;
  const next=html.dataset.theme==="dark"?"light":"dark";
  html.dataset.theme=next;
  localStorage.setItem("awinTheme",next);
  applyThemeMeta();
}
function restoreTheme(){
  document.documentElement.dataset.theme="light";
  localStorage.setItem("awinTheme","light");
  applyThemeMeta();
}

function setupProductTilt(){
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches||!window.matchMedia("(hover: hover)").matches)return;
  document.querySelectorAll(".product-card:not([data-tilt-bound])").forEach(card=>{
    card.dataset.tiltBound="1";
    card.addEventListener("pointermove",e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      card.style.setProperty("--mx",String((x+.5)*100)+"%");
      card.style.setProperty("--my",String((y+.5)*100)+"%");
      card.style.transform="perspective(900px) rotateX("+(-y*4)+"deg) rotateY("+(x*5)+"deg) translateY(-7px)";
      card.classList.add("is-tilting");
    });
    card.addEventListener("pointerleave",()=>{card.style.transform="";card.classList.remove("is-tilting")});
  });
}
function setupReveal(){
  const targets=[...document.querySelectorAll(".section,.about-section,.focus-card,.category-tile")];
  targets.forEach((el,i)=>{if(!el.classList.contains("reveal")){el.classList.add("reveal");el.style.transitionDelay=Math.min(i*35,240)+"ms";}});
  if(!("IntersectionObserver" in window)){targets.forEach(el=>el.classList.add("revealed"));return;}
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("revealed");observer.unobserve(entry.target);}}),{threshold:.08,rootMargin:"0px 0px -8% 0px"});
  targets.forEach(el=>observer.observe(el));
}
function setupScrollSpy(){
  if(!("IntersectionObserver" in window))return;
  const links=[...document.querySelectorAll(".main-nav .nav-item")];
  const sections=links.map(link=>document.querySelector(link.getAttribute("href"))).filter(Boolean);
  const observer=new IntersectionObserver(entries=>{
    const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(!visible)return;
    links.forEach(link=>link.classList.toggle("active",link.getAttribute("href")==="#"+visible.target.id));
  },{rootMargin:"-25% 0px -58% 0px",threshold:[0,.15,.35,.6]});
  sections.forEach(section=>observer.observe(section));
}
restoreTheme();
init();