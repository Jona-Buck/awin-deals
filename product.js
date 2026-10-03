const id=new URLSearchParams(location.search).get("id");
let products=[];let product=null;let current=0;let saved=new Set(readSaved());

const $=s=>document.querySelector(s);
const escapeHtml=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
const money=v=>new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"}).format(Number(v)||0);
const imagesOf=p=>[...new Set((Array.isArray(p.images)&&p.images.length?p.images:[p.image]).filter(Boolean))];
function readSaved(){try{const v=JSON.parse(localStorage.getItem("awinSaved")||"[]");return Array.isArray(v)?v.map(String):[]}catch{return[]}}
function writeSaved(){localStorage.setItem("awinSaved",JSON.stringify([...saved]));}
function href(p){return "product.html?id="+encodeURIComponent(p.id);}

async function init(){
  restoreTheme();
  try{
    const response=await fetch("products.json",{cache:"no-store"});
    if(!response.ok)throw new Error("products");
    products=(await response.json()).products||[];
    product=products.find(p=>String(p.id)===String(id));
    $("#loading").hidden=true;
    if(!product){$("#notFound").hidden=false;renderSaved();return;}
    document.title=product.name+" — Awin Deals";
    $("#productDetail").hidden=false;
    $("#merchant").textContent=product.merchant||"Shop";
    $("#merchant").href=product.affiliateUrl||product.productUrl||"#";
    $("#name").textContent=product.name;
    $("#description").textContent=product.description||"";
    $("#price").textContent=money(product.price);
    if(product.oldPrice){$("#oldPrice").hidden=false;$("#oldPrice").textContent=money(product.oldPrice);}
    if(product.badge){$("#badge").hidden=false;$("#badge").textContent=product.badge;}
    $("#affiliate").href=product.affiliateUrl||product.productUrl||"#";
    const highlights=Array.isArray(product.highlights)?product.highlights:[];
    $("#highlights").innerHTML=highlights.map(x=>"<span>"+escapeHtml(x)+"</span>").join("");
    setupGallery();
    renderRelated();
    renderSaved();
    updateSave();
    bindEvents();
  }catch{
    $("#loading").textContent="Das Produkt konnte nicht geladen werden.";
  }
}
function setupGallery(){
  const list=imagesOf(product);
  $("#thumbs").innerHTML=list.map((src,i)=>'<button type="button" class="thumb '+(i===0?"active":"")+'" data-index="'+i+'" aria-label="Bild '+(i+1)+'"><img src="'+escapeHtml(src)+'" alt="" loading="lazy" referrerpolicy="no-referrer"></button>').join("");
  $("#thumbs").querySelectorAll("[data-index]").forEach(btn=>btn.addEventListener("click",()=>showImage(Number(btn.dataset.index))));
  $("#prev").addEventListener("click",()=>showImage(current-1));
  $("#next").addEventListener("click",()=>showImage(current+1));
  showImage(0);
  const first=imagesOf(product)[0];
  if(first) $("#mainImage").fetchPriority="high";
  const stage=$("#stage");let startX=null;
  stage.addEventListener("pointerdown",e=>{startX=e.clientX;stage.setPointerCapture?.(e.pointerId)});
  stage.addEventListener("pointerup",e=>{if(startX===null)return;const dx=e.clientX-startX;startX=null;if(Math.abs(dx)>45)showImage(current+(dx<0?1:-1))});
  stage.addEventListener("pointercancel",()=>startX=null);
}
function showImage(i){
  const list=imagesOf(product);
  if(!list.length){$("#mainImage").removeAttribute("src");return;}
  current=(i+list.length)%list.length;
  $("#mainImage").src=list[current];
  $("#mainImage").alt=product.name+" – Bild "+(current+1);
  $("#thumbs").querySelectorAll(".thumb").forEach((x,j)=>x.classList.toggle("active",j===current));
  $("#dots").innerHTML=list.length>1?list.map((_,j)=>'<button type="button" class="dot '+(j===current?"active":"")+'" data-index="'+j+'" aria-label="Bild '+(j+1)+'"></button>').join(""):"";
  $("#dots").querySelectorAll("[data-index]").forEach(x=>x.addEventListener("click",()=>showImage(Number(x.dataset.index))));
  $("#prev").style.display=list.length>1?"grid":"none";$("#next").style.display=list.length>1?"grid":"none";
}
function renderRelated(){
  const related=products.filter(p=>p.id!==product.id&&p.category===product.category);
  const fallback=products.filter(p=>p.id!==product.id);
  const list=[...related,...fallback].slice(0,3);
  if(!list.length)return;
  $("#relatedSection").hidden=false;
  $("#relatedGrid").innerHTML=list.map(card).join("");
  $("#relatedGrid").querySelectorAll("[data-save-id]").forEach(btn=>btn.addEventListener("click",e=>{e.preventDefault();toggleSaved(btn.dataset.saveId)}));
}
function card(p){
  const img=imagesOf(p)[0],isSaved=saved.has(String(p.id));
  return '<article class="product-card"><a class="product-card-main" href="'+href(p)+'"><div class="product-media">'+(img?'<img src="'+escapeHtml(img)+'" alt="'+escapeHtml(p.name)+'" loading="lazy" referrerpolicy="no-referrer">':'')+(p.badge?'<span class="product-tag">'+escapeHtml(p.badge)+'</span>':'')+'</div><div class="product-body"><div class="merchant-line"><span>'+escapeHtml(p.merchant||"Shop")+'</span><span>'+escapeHtml(p.category||"")+'</span></div><h3>'+escapeHtml(p.name)+'</h3><p>'+escapeHtml(p.description||"")+'</p><div class="price-row"><strong>'+money(p.price)+'</strong>'+(p.oldPrice?'<s>'+money(p.oldPrice)+'</s>':'')+'</div></div></a><div class="card-actions"><a class="card-deal" href="'+href(p)+'">Produkt ansehen</a><button type="button" class="card-save '+(isSaved?"saved":"")+'" data-save-id="'+escapeHtml(p.id)+'">'+(isSaved?"♥":"♡")+'</button></div></article>';
}
function toggleSaved(v){const key=String(v);saved.has(key)?saved.delete(key):saved.add(key);writeSaved();renderSaved();updateSave();renderRelated();}
function updateSave(){if(!product)return;const active=saved.has(String(product.id));$("#saveProduct").textContent=active?"♥ Gespeichert":"♡ Merkliste";$("#saveProduct").classList.toggle("saved",active);}
function renderSaved(){
  $("#savedCount").textContent=saved.size;$("#mobileSavedCount").textContent=saved.size;
  const list=[...saved].map(x=>products.find(p=>String(p.id)===x)).filter(Boolean);
  $("#savedList").innerHTML=list.length?list.map(p=>{
    const img=imagesOf(p)[0];
    return '<div class="saved-item">'+(img?'<img src="'+escapeHtml(img)+'" alt="" loading="lazy" referrerpolicy="no-referrer">':'<div class="saved-placeholder"></div>')+'<a class="saved-copy" href="'+href(p)+'"><b>'+escapeHtml(p.name)+'</b><span>'+money(p.price)+'</span></a><button class="saved-remove" type="button" data-remove="'+escapeHtml(p.id)+'">×</button></div>';
  }).join(""):'<div style="padding:60px 0;text-align:center;color:var(--muted)">Noch keine Produkte gespeichert.</div>';
  $("#savedList").querySelectorAll("[data-remove]").forEach(x=>x.addEventListener("click",()=>toggleSaved(x.dataset.remove)));
}
function bindEvents(){
  $("#themeBtn").addEventListener("click",toggleTheme);
  $("#savedBtn").addEventListener("click",()=>setDrawer(true));
  $("#mobileSaved").addEventListener("click",()=>setDrawer(true));
  $("#drawerClose").addEventListener("click",()=>setDrawer(false));
  $("#drawerScrim").addEventListener("click",()=>setDrawer(false));
  document.addEventListener("keydown",e=>{if(e.key==="Escape")setDrawer(false)});
}
function setDrawer(open){$("#savedDrawer").classList.toggle("open",open);$("#savedDrawer").setAttribute("aria-hidden",String(!open));$("#savedBtn").setAttribute("aria-expanded",String(open));document.body.classList.toggle("drawer-open",open)}
function restoreTheme(){const v=localStorage.getItem("awinTheme");if(v==="light"||v==="dark")document.documentElement.dataset.theme=v}
function toggleTheme(){const next=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=next;localStorage.setItem("awinTheme",next)}
init();