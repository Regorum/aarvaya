/* ════════════════════════════════════════════
   EMAILJS CONFIG
════════════════════════════════════════════ */
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
const EMAILJS_ORDER_TPL   = 'YOUR_ORDER_TEMPLATE_ID';
const EMAILJS_CONTACT_TPL = 'YOUR_CONTACT_TEMPLATE_ID';
const OWNER_EMAIL         = 'your@email.com';

const EJS_OK = EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY';
if (EJS_OK) emailjs.init(EMAILJS_PUBLIC_KEY);
else {
  document.getElementById('order-notice').classList.add('show');
  document.getElementById('contact-notice').classList.add('show');
}

/* ═══════ PRODUCTS DATA ═══════ */
const PRODUCTS = {
  oils: [
    { id:'o1', name:'Coconut Oil',    weight:'500 ml',  price:280, icon:'🥥', badge:'Best Seller' },
    { id:'o2', name:'Coconut Oil',    weight:'1 Litre', price:530, icon:'🥥', badge:null },
    { id:'o3', name:'Groundnut Oil',  weight:'500 ml',  price:220, icon:'🥜', badge:null },
    { id:'o4', name:'Groundnut Oil',  weight:'1 Litre', price:420, icon:'🥜', badge:null },
    { id:'o5', name:'Sesame Oil',     weight:'500 ml',  price:320, icon:'🌿', badge:'Premium' },
    { id:'o6', name:'Sesame Oil',     weight:'1 Litre', price:600, icon:'🌿', badge:null },
    { id:'o7', name:'Castor Oil',     weight:'500 ml',  price:180, icon:'🌰', badge:null },
    { id:'o8', name:'Mustard Oil',    weight:'1 Litre', price:380, icon:'🟡', badge:null },
  ],
  flours: [
    { id:'f1', name:'Whole Wheat Flour', weight:'1 kg', price:80,  icon:'🌾', badge:'Popular' },
    { id:'f2', name:'Whole Wheat Flour', weight:'5 kg', price:360, icon:'🌾', badge:null },
    { id:'f3', name:'Ragi Flour',        weight:'1 kg', price:100, icon:'🟤', badge:null },
    { id:'f4', name:'Jowar Flour',       weight:'1 kg', price:90,  icon:'🌾', badge:null },
    { id:'f5', name:'Bajra Flour',       weight:'1 kg', price:85,  icon:'🌿', badge:null },
    { id:'f6', name:'Besan (Gram Flour)',weight:'1 kg', price:120, icon:'💛', badge:null },
    { id:'f7', name:'Rice Flour',        weight:'1 kg', price:75,  icon:'🤍', badge:null },
    { id:'f8', name:'Multigrain Flour',  weight:'1 kg', price:130, icon:'🌾', badge:'New' },
  ]
};

function renderProducts() {
  renderGrid('oils-grid', PRODUCTS.oils);
  renderGrid('flours-grid', PRODUCTS.flours);
}

function renderGrid(id, items) {
  document.getElementById(id).innerHTML = items.map(p => `
    <div class="product-card">
      <div class="product-img">
        <span>${p.icon}</span>
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-weight">${p.weight}</div>
        <div class="product-price"><span class="currency">₹</span>${p.price.toLocaleString('en-IN')}</div>
        <button class="add-to-cart" id="btn-${p.id}" onclick="addToCart('${p.id}')">Add to Cart</button>
      </div>
    </div>
  `).join('');
}

/* ═══════ CART ═══════ */
let cart = {};

function getProduct(id) {
  return [...PRODUCTS.oils, ...PRODUCTS.flours].find(p => p.id === id);
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  updateCartUI();
  const btn = document.getElementById('btn-' + id);
  if (btn) {
    btn.textContent = '✓ Added';
    btn.classList.add('added');
    setTimeout(() => { btn.textContent = 'Add to Cart'; btn.classList.remove('added'); }, 1400);
  }
}

function changeQty(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  updateCartUI();
}

function removeItem(id) {
  delete cart[id];
  updateCartUI();
}

function updateCartUI() {
  const count = Object.values(cart).reduce((a,b) => a+b, 0);
  const total = Object.entries(cart).reduce((s,[id,qty]) => {
    const p = getProduct(id); return s + (p ? p.price * qty : 0);
  }, 0);

  document.getElementById('cart-count').textContent = count;
  document.getElementById('cart-total-price').textContent = '₹' + total.toLocaleString('en-IN');
  document.getElementById('place-order-btn').disabled = count === 0;

  const wrap = document.getElementById('cart-items-container');
  const empty = document.getElementById('cart-empty');

  // Clear previous items
  [...wrap.querySelectorAll('.cart-item')].forEach(e => e.remove());
  empty.style.display = count === 0 ? '' : 'none';

  Object.entries(cart).forEach(([id, qty]) => {
    const p = getProduct(id); if (!p) return;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="cart-item-icon">${p.icon}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${p.name} (${p.weight})</div>
        <div class="cart-item-price">₹${p.price} each</div>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" onclick="changeQty('${id}',-1)">−</button>
        <span class="qty-num">${qty}</span>
        <button class="qty-btn" onclick="changeQty('${id}',1)">+</button>
      </div>
      <span class="remove-item" onclick="removeItem('${id}')" title="Remove">🗑</span>
    `;
    wrap.appendChild(div);
  });
}

function toggleCart() {
  document.getElementById('cart-overlay').classList.toggle('open');
  document.getElementById('cart-sidebar').classList.toggle('open');
}

/* ═══════ ORDER MODAL ═══════ */
function openOrderModal() {
  if (!Object.keys(cart).length) return;
  toggleCart();
  document.getElementById('order-modal').classList.add('open');
  document.getElementById('order-form-view').style.display = '';
  document.getElementById('order-success-view').style.display = 'none';
  document.getElementById('o-contact-err').style.display = 'none';
}

function closeOrderModal() {
  document.getElementById('order-modal').classList.remove('open');
}

function getCartSummary() {
  const total = Object.entries(cart).reduce((s,[id,qty]) => {
    const p = getProduct(id); return s + (p ? p.price*qty : 0);
  }, 0);
  const lines = Object.entries(cart).map(([id,qty]) => {
    const p = getProduct(id);
    return p ? `${p.name} (${p.weight}) × ${qty} = ₹${(p.price*qty).toLocaleString('en-IN')}` : '';
  }).join('\n');
  return `${lines}\n\nTotal: ₹${total.toLocaleString('en-IN')}`;
}

async function confirmOrder() {
  const phone = document.getElementById('o-phone').value.trim();
  const email = document.getElementById('o-email').value.trim();
  const err = document.getElementById('o-contact-err');
  if (!phone && !email) { err.style.display = 'block'; return; }
  err.style.display = 'none';

  if (EJS_OK) {
    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_ORDER_TPL, {
        to_email: OWNER_EMAIL,
        customer_phone: phone || 'Not provided',
        customer_email: email || 'Not provided',
        order_details: getCartSummary(),
        order_time: new Date().toLocaleString('en-IN', { timeZone:'Asia/Kolkata' })
      });
    } catch(e) { console.warn('EmailJS order send failed:', e); }
  }

  document.getElementById('order-form-view').style.display = 'none';
  document.getElementById('order-success-view').style.display = '';
}

function finishOrder() {
  cart = {};
  updateCartUI();
  closeOrderModal();
  document.getElementById('o-phone').value = '';
  document.getElementById('o-email').value = '';
}

/* ═══════ CONTACT FORM ═══════ */
async function submitContact() {
  const name    = document.getElementById('c-name').value.trim();
  const phone   = document.getElementById('c-phone').value.trim();
  const email   = document.getElementById('c-email').value.trim();
  const message = document.getElementById('c-message').value.trim();
  let valid = true;

  document.getElementById('c-email-err').style.display = 'none';
  document.getElementById('c-msg-err').style.display = 'none';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('c-email-err').style.display = 'block'; valid = false;
  }
  if (!message) {
    document.getElementById('c-msg-err').style.display = 'block'; valid = false;
  }
  if (!valid) return;

  if (EJS_OK) {
    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_CONTACT_TPL, {
        to_email: OWNER_EMAIL,
        from_name: name || 'Not provided',
        from_phone: phone || 'Not provided',
        from_email: email,
        message
      });
    } catch(e) { console.warn('EmailJS contact send failed:', e); }
  }

  document.getElementById('contact-form-container').style.display = 'none';
  document.getElementById('contact-success').classList.add('show');
}

/* ═══════ NAVIGATION ═══════ */
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  ['home','products','contact'].forEach(n => {
    document.getElementById('nav-' + n).classList.toggle('active', n === name);
    document.getElementById('mnav-' + n).classList.toggle('active', n === name);
  });
  window.scrollTo({ top:0, behavior:'smooth' });
}

/* ═══════ HAMBURGER ═══════ */
function toggleMenu() {
  const menu = document.getElementById('mobile-menu');
  const btn  = document.getElementById('hamburger');
  const open = menu.classList.toggle('open');
  btn.classList.toggle('open', open);
}
function closeMenu() {
  document.getElementById('mobile-menu').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
}

/* ═══════ SCROLL REVEAL ═══════ */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ═══════ COCONUT CANVAS ═══════ */
(function() {
  const canvas = document.getElementById('coconut-canvas');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = Array.from({ length: 50 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 2.5 + 0.8,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -Math.random() * 0.6 - 0.15,
    alpha: Math.random() * 0.6,
    color: Math.random() > 0.5 ? '#C49A6C' : '#D9BE96'
  }));

  let scrollProgress = 0;
  window.addEventListener('scroll', () => {
    const h = canvas.offsetHeight;
    scrollProgress = Math.min(1, window.scrollY / (h * 0.9));
  });

  let t = 0;

  function drawCoconut(cx, cy, scale, crack, splash) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    // Shadow
    ctx.beginPath();
    ctx.ellipse(0, 85, 55, 13, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fill();

    const body = () => {
      const g = ctx.createRadialGradient(-18,-22,4,0,0,68);
      g.addColorStop(0, '#7A5030');
      g.addColorStop(0.5, '#3E1E0A');
      g.addColorStop(1, '#1C0900');
      return g;
    };

    if (crack <= 0) {
      ctx.beginPath();
      ctx.ellipse(0,0,66,60,-0.2,0,Math.PI*2);
      ctx.fillStyle = body(); ctx.fill();
    } else {
      const oy = crack * 28;
      // top half
      ctx.beginPath(); ctx.ellipse(0,-oy*.5,66,60,-0.2,Math.PI,Math.PI*2); ctx.fillStyle = body(); ctx.fill();
      // bottom half
      ctx.beginPath(); ctx.ellipse(0,oy*.5,66,60,-0.2,0,Math.PI); ctx.fillStyle = body(); ctx.fill();

      if (crack > 0.3) {
        const fa = Math.min(1,(crack-0.3)/0.4);
        ctx.beginPath(); ctx.ellipse(0,-oy*.5,53,48,-0.2,Math.PI,Math.PI*2);
        ctx.fillStyle = `rgba(245,228,195,${fa*0.92})`; ctx.fill();
        ctx.beginPath(); ctx.ellipse(0,oy*.5,53,48,-0.2,0,Math.PI);
        ctx.fillStyle = `rgba(245,228,195,${fa*0.92})`; ctx.fill();
        ctx.beginPath(); ctx.ellipse(0,0,28,13,0,0,Math.PI*2);
        ctx.fillStyle = `rgba(196,154,108,${fa*0.65})`; ctx.fill();
      }
    }

    // Texture
    ctx.strokeStyle = 'rgba(0,0,0,0.22)'; ctx.lineWidth = 1.2;
    for (let i=-2;i<=2;i++) {
      ctx.beginPath();
      ctx.moveTo(i*17-8,-58);
      ctx.bezierCurveTo(i*19,-18,i*19,18,i*17+8,58);
      ctx.stroke();
    }

    // Highlight
    ctx.beginPath(); ctx.ellipse(-20,-20,18,12,-0.5,0,Math.PI*2);
    ctx.fillStyle='rgba(255,255,255,0.08)'; ctx.fill();

    if (crack > 0) {
      ctx.beginPath(); ctx.setLineDash([4,3]);
      ctx.moveTo(-68,0); ctx.lineTo(68,0);
      ctx.strokeStyle=`rgba(90,45,10,${Math.min(1,crack*2)})`; ctx.lineWidth=1.8; ctx.stroke();
      ctx.setLineDash([]);
    }

    if (splash > 0) {
      for (let i=0;i<10;i++) {
        const a=(i/10)*Math.PI*2;
        const dist=75+splash*55;
        const dr=(2+Math.random()*4)*splash;
        ctx.beginPath();
        ctx.ellipse(Math.cos(a)*dist,Math.sin(a)*dist*.5,dr,dr*1.4,a,0,Math.PI*2);
        ctx.fillStyle=`rgba(196,154,108,${splash*0.75})`; ctx.fill();
      }
    }

    ctx.restore();
  }

  function draw() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H);

    // Warm dark background
    const bg = ctx.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,'#1A0C04'); bg.addColorStop(.5,'#2E1608'); bg.addColorStop(1,'#3D2010');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    // Warm radial glow
    const glow = ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,W*.55);
    glow.addColorStop(0,'rgba(196,154,108,0.09)'); glow.addColorStop(1,'transparent');
    ctx.fillStyle=glow; ctx.fillRect(0,0,W,H);

    // Particles
    particles.forEach(p => {
      p.x+=p.vx; p.y+=p.vy;
      p.alpha+=(Math.random()>.5?.004:-.004);
      if(p.y<-5){p.y=H+5;p.x=Math.random()*W;}
      p.alpha=Math.max(0,Math.min(0.65,p.alpha));
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=p.color+(Math.round(p.alpha*255).toString(16).padStart(2,'0'));
      ctx.fill();
    });

    const fallY = Math.max(0,1-scrollProgress*2);
    const crackP = Math.max(0,(scrollProgress-.3)/.5);
    const splashP = Math.max(0,(scrollProgress-.7)/.3);
    const bob = Math.sin(t*.022)*5;
    const cy = H*.5 + bob - fallY*H*.55 + scrollProgress*35;
    const sc = W < 500 ? 0.75 : 1;

    drawCoconut(W/2, cy, sc+scrollProgress*.12, Math.min(1,crackP), Math.min(1,splashP));

    if (crackP > .5) {
      const sa = Math.min(.65,(crackP-.5)*2);
      for (let i=0;i<7;i++) {
        const xo=(i-3.5)*11+Math.sin(t*.05+i)*4;
        ctx.beginPath();
        ctx.moveTo(W/2+xo, cy+18);
        ctx.bezierCurveTo(
          W/2+xo+Math.sin(t*.03)*12,cy+50,
          W/2+xo+Math.sin(t*.04)*18,cy+95,
          W/2+xo+Math.sin(t*.02)*8,cy+140
        );
        ctx.strokeStyle=`rgba(196,154,108,${sa*(1-i*.06)})`; ctx.lineWidth=2.5; ctx.stroke();
      }
    }

    t++;
    requestAnimationFrame(draw);
  }
  draw();
})();

renderProducts();