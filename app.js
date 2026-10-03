let products=[];
let saved=new Set(readSaved());
let state={query:"",category:"Alle",merchant:"Alle",price:"Alle",discount:"Alle",sort:"featured"};
let filterMenu=null;

const $=s=>document.querySelector(s);
const escapeHtml=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
const money=v=>new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"}).format(Number(v)||0);
const imagesOf=p=>[...new Set((Array.isArray(p.images)&&p.images.length?p.images:[p.image]).filter(Boolean))];

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
    $("#year").textContent=new Date().getFullYear();
    $("#heroProducts").innerHTML=products.slice(0,4).map((p,i)=>heroCard(p,i)).join("");
    $("#heroLiveCount").textContent=String(products.length).padStart(2,"0");
    const catCount=new Set(products.map(p=>p.category).filter(Boolean)).size;
    const merchantCount=new Set(products.map(p=>p.merchant).filter(Boolean)).size;
    $("#heroStatsProducts").textContent=String(products.length).padStart(2,"0");
    $("#heroStatsCategories").textContent=String(catCount).padStart(2,"0");
    $("#heroStatsMerchants").textContent=String(merchantCount).padStart(2,"0");
    renderFocus();
    renderCategories();
    renderProducts();
    renderSaved();
    bindEvents();
    setupOrbit();
    setupScrollSpy();
    setupReveal();
  }catch{
    $("#productGrid").innerHTML='<div class="empty-state"><div class="empty-glyph">!</div><h3>Katalog konnte nicht geladen werden.</h3><p>Bitte später erneut versuchen.</p></div>';
  }
}

function heroCard(p,i){
  const image=imagesOf(p)[0];
  return '<a class="hero-product pos-'+String.fromCharCode(97+i)+'" href="'+href(p)+'" data-hero-card>'+
    '<div class="hero-product-card">'+
      (p.badge?'<span class="hero-badge">'+escapeHtml(p.badge)+'</span>':'')+
      '<div class="hero-product-image">'+(image?'<img src="'+escapeHtml(image)+'" alt="'+escapeHtml(p.name)+'" loading="eager" referrerpolicy="no-referrer">':'')+'</div>'+
      '<div class="hero-product-meta"><strong>'+escapeHtml(shortName(p.name))+'</strong><span class="hero-price">'+money(p.price)+'</span></div>'+
    '</div>'+
  '</a>';
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
        (image?'<img src="'+escapeHtml(image)+'" alt="'+escapeHtml(p.name)+'" loading="lazy" referrerpolicy="no-referrer">':'')+
      '</div>'+
    '</article>';
}

function categories(){
  const map=new Map();
  products.forEach(p=>map.set(p.category,(map.get(p.category)||0)+1));
  return [...map.entries()].sort((a,b)=>b[1]-a[1]);
}
function renderCategories(){
  const all=[["Alle",products.length],...categories()];
  $("#categoryRail").innerHTML=all.map(([name,count])=>
    '<button type="button" class="category-tile '+(state.category===name?'active':'')+'" data-category="'+escapeHtml(name)+'">'+
      '<strong>'+escapeHtml(name)+'</strong><span>'+count+" "+(count===1?"Produkt":"Produkte")+"</span>"+
    '</button>'
  ).join("");
  $("#categoryRail").querySelectorAll("[data-category]").forEach(btn=>btn.addEventListener("click",()=>{
    state.category=btn.dataset.category;
    state.price="Alle";state.discount="Alle";state.merchant="Alle";
    closeFilterMenu();
    renderCategories();renderProducts();
    document.querySelector("#discover").scrollIntoView({behavior:"smooth",block:"start"});
  }));
}

function filtered(){
  const q=state.query.trim().toLowerCase();
  let list=products.filter(p=>{
    const hay=[p.name,p.merchant,p.category,p.description,...(p.highlights||[])].join(" ").toLowerCase();
    if(q&&!hay.includes(q))return false;
    if(state.category!=="Alle"&&p.category!==state.category)return false;
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
  if(s==="discount")list.sort((a,b)=>discountOf(b)-discountOf(a));
  if(s==="low")list.sort((a,b)=>a.price-b.price);
  if(s==="high")list.sort((a,b)=>b.price-a.price);
  if(s==="name")list.sort((a,b)=>a.name.localeCompare(b.name,"de"));
  return list;
}

function renderProducts(){
  const list=filtered();
  $("#resultSummary").textContent=list.length+" "+(list.length===1?"Produkt":"Produkte")+(state.query?' · Suche: “'+state.query+'”':"");
  $("#productGrid").innerHTML=list.map(productCard).join("");
  $("#emptyState").hidden=!!list.length;
  bindSaveButtons();
  setupProductTilt();
  syncFilterChips();
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
    '<div class="card-actions"><a class="card-deal" href="'+href(p)+'">Produkt ansehen</a>'+
      '<button type="button" class="card-save '+(isSaved?"saved":"")+'" data-save-id="'+escapeHtml(id)+'" aria-label="'+(isSaved?"Von Merkliste entfernen":"Zur Merkliste hinzufügen")+'">'+(isSaved?"♥":"♡")+'</button>'+
    '</div>'+
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
  $("#sort").addEventListener("change",e=>{state.sort=e.target.value;renderProducts()});
  $("#searchBtn").addEventListener("click",toggleSearch);
  $("#mobileSearch").addEventListener("click",()=>{toggleSearch(true);window.scrollTo({top:0,behavior:"smooth"})});
  $("#searchInput").addEventListener("input",e=>{state.query=e.target.value;renderProducts()});
  $("#searchClear").addEventListener("click",()=>{$("#searchInput").value="";state.query="";renderProducts();$("#searchInput").focus()});
  $("#themeBtn").addEventListener("click",toggleTheme);
  $("#savedBtn").addEventListener("click",()=>setDrawer(true));
  $("#heroSaved").addEventListener("click",()=>setDrawer(true));
  $("#mobileSaved").addEventListener("click",()=>setDrawer(true));
  $("#drawerClose").addEventListener("click",()=>setDrawer(false));
  $("#drawerScrim").addEventListener("click",()=>setDrawer(false));
  $("#resetFilters").addEventListener("click",resetAll);
  $("#emptyReset").addEventListener("click",resetAll);
  $("#filterbar").addEventListener("click",handleFilterBar);
  document.addEventListener("keydown",e=>{
    const target=e.target;
    const typing=target&&((target.tagName==="INPUT")||(target.tagName==="TEXTAREA")||(target.tagName==="SELECT")||target.isContentEditable);
    if(!typing&&(e.key==="/"||((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"))){e.preventDefault();toggleSearch(true);return;}
    if(e.key==="Escape"){
      if(!$("#searchPanel").hidden)toggleSearch(false);
      if($("#savedDrawer").classList.contains("open"))setDrawer(false);
      closeFilterMenu();
    }
  });
}

function handleFilterBar(e){
  const chip=e.target.closest("[data-filter]");
  if(!chip)return;
  const type=chip.dataset.filter;
  if(type==="category"){
    state.category="Alle";renderCategories();renderProducts();return;
  }
  openFilterMenu(type);
}
function openFilterMenu(type){
  const menu=$("#filterMenu");
  const current=state[type];
  let options=[];
  if(type==="merchant")options=[["Alle","Alle"],...[...new Set(products.map(p=>p.merchant).filter(Boolean))].map(v=>[v,v])];
  if(type==="price")options=[["Alle","Alle"],["Bis 25 €","0-25"],["25–50 €","25-50"],["Über 50 €","50+"]]; 
  if(type==="discount")options=[["Alle","Alle"],["Ab 25 %","25+"],["Ab 50 %","50+"],["Ab 70 %","70+"]]; 
  menu.innerHTML=options.map(([label,value])=>'<button type="button" class="filter-option '+(current===value?"active":"")+'" data-option="'+escapeHtml(value)+'">'+escapeHtml(label)+'</button>').join("");
  menu.hidden=false;
  menu.dataset.type=type;
  menu.querySelectorAll("[data-option]").forEach(btn=>btn.addEventListener("click",()=>{
    state[type]=btn.dataset.option;menu.hidden=true;renderProducts();
  }));
}
function closeFilterMenu(){$("#filterMenu").hidden=true}
function syncFilterChips(){
  document.querySelectorAll(".filter-chip").forEach(btn=>{
    const type=btn.dataset.filter;
    let active=false;
    if(type==="category")active=state.category!=="Alle";
    if(type==="merchant")active=state.merchant!=="Alle";
    if(type==="price")active=state.price!=="Alle";
    if(type==="discount")active=state.discount!=="Alle";
    btn.classList.toggle("active",active||type==="category"&&!active&&state.category==="Alle");
  });
}
function resetAll(){
  state={query:"",category:"Alle",merchant:"Alle",price:"Alle",discount:"Alle",sort:"featured"}; $("#sort").value="featured";
  $("#searchInput").value="";
  closeFilterMenu();renderCategories();renderProducts();
}

function toggleSaved(id){
  id=String(id);
  saved.has(id)?saved.delete(id):saved.add(id);
  writeSaved();renderProducts();renderSaved();
}
function renderSaved(){
  const list=[...saved].map(id=>products.find(p=>String(p.id)===id)).filter(Boolean);
  $("#savedCount").textContent=list.length;
  $("#mobileSavedCount").textContent=list.length;
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
  $("#savedBtn").setAttribute("aria-expanded",String(open));
  document.body.classList.toggle("drawer-open",open);
}
function toggleSearch(force){
  const panel=$("#searchPanel");
  const open=typeof force==="boolean"?force:panel.hidden;
  panel.hidden=!open;
  $("#searchBtn").setAttribute("aria-expanded",String(open));
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
  const v=localStorage.getItem("awinTheme");
  if(v==="light"||v==="dark")document.documentElement.dataset.theme=v;
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
function setupOrbit(){
  const orbit=$("#heroOrbit");
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  if(!window.matchMedia("(hover: hover)").matches)return;
  const cards=[...orbit.querySelectorAll("[data-hero-card]")];
  let raf=0,px=0,py=0;
  orbit.addEventListener("pointermove",e=>{
    orbit.style.setProperty("--orbit-x",String((e.clientX-orbit.getBoundingClientRect().left)/orbit.getBoundingClientRect().width-.5));
    orbit.style.setProperty("--orbit-y",String((e.clientY-orbit.getBoundingClientRect().top)/orbit.getBoundingClientRect().height-.5));
    const r=orbit.getBoundingClientRect();
    px=(e.clientX-r.left)/r.width-.5;py=(e.clientY-r.top)/r.height-.5;
    if(!raf)raf=requestAnimationFrame(()=>{
      cards.forEach((card,i)=>{
        const amount=(i%2?1:-1);
        const x=px*18*amount,y=py*12*amount;
        card.style.transform="translate3d("+x+"px,"+y+"px,0)";
      });
      raf=0;
    });
  });
  orbit.addEventListener("pointerleave",()=>{
    cards.forEach(card=>card.style.transform="translate3d(0,0,0)");
  });
}

restoreTheme();
init();