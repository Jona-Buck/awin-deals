const params = new URLSearchParams(location.search);
const productId = params.get('id');
let products = [];
let product = null;
let current = 0;
let savedIds = JSON.parse(localStorage.getItem('awinSaved') || '[]');
let dragStartX = null;

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const eur = (n) => new Intl.NumberFormat('de-DE', {style:'currency', currency:'EUR'}).format(Number(n) || 0);

async function init() {
  try {
    products = (await (await fetch('products.json')).json()).products || [];
    product = products.find(p => String(p.id) === String(productId));

    $('#loading').hidden = true;

    if (!product) {
      $('#notFound').hidden = false;
      return;
    }

    $('#detail').hidden = false;
    renderProduct();
    setupGallery();
    renderSaved();
  } catch {
    $('#loading').textContent = 'Das Produkt konnte nicht geladen werden.';
  }
}

function imageList() {
  const list = Array.isArray(product.images) && product.images.length
    ? product.images
    : (product.image ? [product.image] : []);
  return [...new Set(list.filter(Boolean))];
}

function renderProduct() {
  const images = imageList();

  document.title = product.name + ' – Awin Deals';
  $('#merchant').textContent = product.merchant || 'Shop';
  $('#merchant').href = product.affiliateUrl || product.productUrl || '#';
  $('#name').textContent = product.name;
  $('#description').textContent = product.description || '';
  $('#price').textContent = eur(product.price);

  if (product.oldPrice) {
    $('#oldPrice').hidden = false;
    $('#oldPrice').textContent = eur(product.oldPrice);
  }

  if (product.badge) {
    $('#badge').hidden = false;
    $('#badge').textContent = product.badge;
  }

  const highlights = Array.isArray(product.highlights) ? product.highlights : [];
  $('#highlights').innerHTML = highlights.map(h => '<div class="highlight">' + esc(h) + '</div>').join('');

  $('#affiliate').href = product.affiliateUrl || product.productUrl || '#';
  $('#merchantDirect').href = product.productUrl || product.affiliateUrl || '#';

  $('#thumbs').innerHTML = images.map((src, i) =>
    '<button class="thumb ' + (i === current ? 'active' : '') + '" data-index="' + i + '" aria-label="Bild ' + (i + 1) + '">' +
    '<img src="' + esc(src) + '" alt="" loading="lazy">' +
    '</button>'
  ).join('');

  $('#thumbs').querySelectorAll('.thumb').forEach(btn => {
    btn.addEventListener('click', () => showImage(Number(btn.dataset.index)));
  });

  showImage(current);
  updateSaveButton();
}

function showImage(index) {
  const images = imageList();
  if (!images.length) {
    $('#mainImage').removeAttribute('src');
    $('#mainImage').alt = product.name;
    $('#dots').innerHTML = '';
    return;
  }

  current = (index + images.length) % images.length;
  const img = $('#mainImage');
  img.src = images[current];
  img.alt = product.name + ' – Bild ' + (current + 1);

  $('#thumbs').querySelectorAll('.thumb').forEach((el, i) => el.classList.toggle('active', i === current));

  $('#dots').innerHTML = images.map((_, i) =>
    '<button class="dot ' + (i === current ? 'active' : '') + '" data-index="' + i + '" aria-label="Bild ' + (i + 1) + '"></button>'
  ).join('');
  $('#dots').querySelectorAll('.dot').forEach(btn => {
    btn.addEventListener('click', () => showImage(Number(btn.dataset.index)));
  });
}

function setupGallery() {
  $('#prev').onclick = () => showImage(current - 1);
  $('#next').onclick = () => showImage(current + 1);

  const stage = $('#stage');
  stage.addEventListener('pointerdown', (e) => {
    dragStartX = e.clientX;
    stage.setPointerCapture?.(e.pointerId);
  });
  stage.addEventListener('pointerup', (e) => {
    if (dragStartX === null) return;
    const dx = e.clientX - dragStartX;
    dragStartX = null;
    if (Math.abs(dx) > 45) showImage(current + (dx < 0 ? 1 : -1));
  });
  stage.addEventListener('pointercancel', () => { dragStartX = null; });
}

function updateSaveButton() {
  const active = savedIds.includes(String(product.id));
  $('#saveProduct').classList.toggle('saved', active);
  $('#saveProduct').innerHTML = active ? '♥ <span>Gemerkt</span>' : '♡ <span>Merkliste</span>';
}

$('#saveProduct').onclick = () => {
  const id = String(product.id);
  const i = savedIds.indexOf(id);
  if (i === -1) savedIds.push(id);
  else savedIds.splice(i, 1);
  localStorage.setItem('awinSaved', JSON.stringify(savedIds));
  updateSaveButton();
  renderSaved();
};

$('#savedBtn').onclick = () => {
  $('#drawer').classList.add('open');
  $('#overlay').classList.add('open');
};

$('#close').onclick = closeDrawer;
$('#overlay').onclick = closeDrawer;

function closeDrawer() {
  $('#drawer').classList.remove('open');
  $('#overlay').classList.remove('open');
}

function renderSaved() {
  const list = savedIds.map(id => products.find(p => String(p.id) === String(id))).filter(Boolean);
  $('#count').textContent = list.length;
  $('#saved').innerHTML = list.length
    ? list.map(p => '<a class="saved-item" href="product.html?id=' + encodeURIComponent(p.id) + '">' +
        (p.image ? '<img src="' + esc(p.image) + '" alt="">' : '<div class="saved-placeholder"></div>') +
        '<div><b>' + esc(p.name) + '</b><div>' + eur(p.price) + '</div></div></a>'
      ).join('')
    : '<p style="color:#777;text-align:center;padding:50px 0">Noch keine Produkte gemerkt.</p>';
}

init();