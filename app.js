let P=[],S=JSON.parse(localStorage.getItem('awinSaved')||'[]'),C='Alle',Q='';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const eur=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(n||0);

async function init(){
  P=(await (await fetch('products.json')).json()).products||[];
  cats(); render(); saved();
  $('#year').textContent=new Date().getFullYear();
}

function productHref(p){ return 'product.html?id='+encodeURIComponent(p.id); }

function cats(){
  let x={Alle:P.length};
  P.forEach(p=>x[p.category]=(x[p.category]||0)+1);
  $('#cats').innerHTML=Object.entries(x).filter(([k,v])=>k==='Alle'||v).map(([n,c])=>
    '<button class="cat '+(C===n?'active':'')+'" data-c="'+esc(n)+'"><b>✦</b><strong>'+esc(n)+'</strong><small>'+c+' Produkt'+(c===1?'':'e')+'</small></button>'
  ).join('');
  document.querySelectorAll('.cat').forEach(b=>b.onclick=()=>{C=b.dataset.c;cats();render()});
}

function list(){
  let l=P.filter(p=>(C==='Alle'||p.category===C)&&(!Q||[p.name,p.merchant,p.category,p.description].join(' ').toLowerCase().includes(Q.toLowerCase())));
  let s=$('#sort').value;
  if(s==='low')l.sort((a,b)=>a.price-b.price);
  if(s==='high')l.sort((a,b)=>b.price-a.price);
  if(s==='name')l.sort((a,b)=>a.name.localeCompare(b.name));
  return l;
}

function render(){
  let l=list();
  $('#products').innerHTML=l.map(p=>{
    const images=Array.isArray(p.images)&&p.images.length?p.images:(p.image?[p.image]:[]);
    const first=images[0]||'';
    return '<article class="product">'+
      '<a class="product-main" href="'+productHref(p)+'">'+
        '<div class="pic">'+(first?'<img src="'+esc(first)+'" alt="'+esc(p.name)+'" loading="lazy" referrerpolicy="no-referrer">':'<span class="placeholder">◇</span>')+
          (p.badge?'<span class="badge">'+esc(p.badge)+'</span>':'')+
        '</div>'+
        '<div class="info">'+
          '<span class="merchant">'+esc(p.merchant||'Shop')+'</span>'+
          '<h3>'+esc(p.name)+'</h3>'+
          '<p class="desc">'+esc(p.description||'')+'</p>'+
          '<div class="price">'+eur(p.price)+(p.oldPrice?'<span class="old">'+eur(p.oldPrice)+'</span>':'')+'</div>'+
        '</div>'+
      '</a>'+
      '<div class="row">'+
        '<a class="deal" href="'+productHref(p)+'">Produkt ansehen →</a>'+
        '<button class="save '+(S.includes(p.id)?'saved':'')+'" onclick="toggle('+JSON.stringify(p.id)+')">♡</button>'+
      '</div>'+
    '</article>';
  }).join('');
  $('#empty').hidden=!!l.length;
}

function toggle(id){
  let i=S.indexOf(id);
  i<0?S.push(id):S.splice(i,1);
  localStorage.setItem('awinSaved',JSON.stringify(S));
  render(); saved();
}

function saved(){
  let l=S.map(id=>P.find(p=>String(p.id)===String(id))).filter(Boolean);
  $('#count').textContent=l.length;
  $('#saved').innerHTML=l.length?l.map(p=>{
    const first=(Array.isArray(p.images)&&p.images[0])||p.image||'';
    return '<div class="saved-item">'+
      '<a href="'+productHref(p)+'" class="saved-link">'+
        (first?'<img src="'+esc(first)+'" alt="" loading="lazy" referrerpolicy="no-referrer">':'<div class="saved-placeholder"></div>')+
        '<div><b>'+esc(p.name)+'</b><div>'+eur(p.price)+'</div></div>'+
      '</a>'+
      '<button onclick="toggle('+JSON.stringify(p.id)+')">×</button>'+
    '</div>';
  }).join(''):'<p style="color:#777;text-align:center;padding:50px 0">Noch keine Produkte gemerkt.</p>';
}

function reset(){C='Alle';Q='';$('#search').value='';cats();render()}

$('#sort').onchange=render;
$('#searchBtn').onclick=()=>{$('#searchbar').classList.toggle('open');$('#search').focus()};
$('#search').oninput=e=>{Q=e.target.value;render()};
$('#savedBtn').onclick=()=>{$('#drawer').classList.add('open');$('#overlay').classList.add('open')};
$('#close').onclick=close;
$('#overlay').onclick=close;

function close(){
  $('#drawer').classList.remove('open');
  $('#overlay').classList.remove('open');
}

init();