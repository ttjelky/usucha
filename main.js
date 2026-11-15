/* USUCHA — interactions (vanilla, no deps) */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IMG = 'assets/img/';

  /* ---------- Data ---------- */
  const PRODUCTS = {
    'ceremonial': { name: 'Ceremonial Usucha', price: 6.5, img: 'd-classic.webp' },
    'uji-latte':  { name: 'Iced Uji Latte',    price: 6,   img: 'd-cloud.webp' },
    'hojicha':    { name: 'Hojicha Cloud',     price: 6,   img: 'd-oat.webp' },
    'strawberry': { name: 'Strawberry Matcha', price: 7,   img: 'd-berry.webp' },
    'coconut':    { name: 'Coconut Split',     price: 6.5, img: 'd-layer.webp' },
    'yuzu':       { name: 'Yuzu Sparkle',      price: 7,   img: 'd-yuzu.webp' },
    'koicha':     { name: 'Koicha Shot',       price: 4.5, img: 'd-dark.webp' },
    'genmaicha':  { name: 'Genmaicha Latte',   price: 5.5, img: 'r-make.webp' },
    'sencha':     { name: 'Cold-brew Sencha',  price: 4.5, img: 'r-powder.webp' },
    'espresso':   { name: 'Matcha Espresso Fusion', price: 6.5, img: 'd-pour.webp' },
    'onigiri':    { name: 'Salmon Onigiri',    price: 5,   img: 's-interior.webp' },
    'toast':      { name: 'Matcha Milk Toast', price: 7.5, img: 's-light.webp' },
    'sando':      { name: 'Tamago Sando',      price: 8.5, img: 's-window.webp' },
    'mochi':      { name: 'Matcha Mochi (3)',  price: 4,   img: 'hand-bowl.webp' },
    'cheesecake': { name: 'Basque Matcha Cheesecake', price: 6, img: 'whisk-bowl.webp' },
  };

  const MENU = {
    matcha: {
      photo: 'd-pour.webp',
      groups: [
        { title: 'Signatures', items: [
          ['uji-latte', 'Iced latte, first-harvest Uji, oat or whole milk', 'Bestseller'],
          ['ceremonial', 'Pure usucha, whisked thin, served warm or over ice'],
          ['coconut', 'Matcha poured over chilled coconut milk'],
          ['strawberry', 'House strawberry purée, milk, ceremonial shot', 'Seasonal'],
          ['yuzu', 'Sparkling yuzu tonic topped with matcha'],
        ]},
        { title: 'Pure', items: [
          ['koicha', 'Thick, syrup-like matcha — for the brave'],
          ['espresso', 'Half matcha, half single-origin espresso', 'New'],
        ]},
      ],
    },
    tea: {
      photo: 'r-whisk.webp',
      groups: [
        { title: 'Roasted & Green', items: [
          ['hojicha', 'Roasted green tea latte, caramel notes, cold foam'],
          ['genmaicha', 'Toasted rice tea with steamed oat milk'],
          ['sencha', '12-hour cold brew, served in a carafe'],
        ]},
      ],
    },
    kitchen: {
      photo: 's-interior.webp',
      groups: [
        { title: 'Savory', items: [
          ['onigiri', 'Grilled salmon, shiso, nori — made each morning'],
          ['sando', 'Soft egg salad on milk bread, Kewpie, chives'],
        ]},
        { title: 'Sweet', items: [
          ['toast', 'Thick-cut milk bread, matcha butter, sea salt', 'Bestseller'],
          ['cheesecake', 'Burnt top, molten matcha centre'],
          ['mochi', 'Hand-rolled, filled with matcha cream'],
        ]},
      ],
    },
  };

  const money = (n) => '$' + n.toFixed(2);

  /* ---------- Toast ---------- */
  const toastEl = $('[data-toast]');
  let toastT;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('is-on'), 2600);
  };

  /* ---------- Storage (safe) ---------- */
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };

  /* ---------- Cart ---------- */
  let cart = store.get('usucha-cart', {});
  Object.keys(cart).forEach((k) => { if (!PRODUCTS[k]) delete cart[k]; });
  const drawer = $('[data-drawer]');
  const itemsEl = $('[data-cart-items]');
  const countEl = $('[data-cart-count]');
  const cartBtn = $('[data-open-cart]');

  const renderCart = () => {
    const keys = Object.keys(cart);
    const count = keys.reduce((s, k) => s + cart[k], 0);
    const total = keys.reduce((s, k) => s + cart[k] * PRODUCTS[k].price, 0);
    countEl.textContent = count;
    $('[data-cart-total]').textContent = money(total);
    $('[data-cart-empty]').hidden = count > 0;
    $('[data-checkout]').disabled = count === 0;
    itemsEl.innerHTML = keys.map((k) => {
      const p = PRODUCTS[k];
      return `<li>
        <img src="${IMG + p.img}" alt="" />
        <div><div class="name">${p.name}</div><div class="price">${money(p.price)}</div></div>
        <div class="qty" aria-label="Quantity of ${p.name}">
          <button data-dec="${k}" aria-label="Remove one ${p.name}">−</button>
          <span>${cart[k]}</span>
          <button data-inc="${k}" aria-label="Add one ${p.name}">+</button>
        </div>
      </li>`;
    }).join('');
    store.set('usucha-cart', cart);
  };

  const add = (id, btn) => {
    if (!PRODUCTS[id]) return;
    cart[id] = (cart[id] || 0) + 1;
    renderCart();
    toast(`${PRODUCTS[id].name} added to your order`);
    cartBtn.classList.remove('bump'); void cartBtn.offsetWidth; cartBtn.classList.add('bump');
    if (btn) { btn.classList.remove('is-added'); void btn.offsetWidth; btn.classList.add('is-added'); }
  };

  let lastFocus;
  const openCart = () => {
    lastFocus = document.activeElement;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => $('.drawer__close', drawer).focus(), 50);
  };
  const closeCart = () => {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lastFocus?.focus?.();
  };

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-add],[data-inc],[data-dec],[data-open-cart],[data-close-cart],[data-checkout]');
    if (!t) return;
    if (t.dataset.add) add(t.dataset.add, t);
    else if (t.dataset.inc) { cart[t.dataset.inc]++; renderCart(); }
    else if (t.dataset.dec) { const k = t.dataset.dec; if (--cart[k] <= 0) delete cart[k]; renderCart(); }
    else if (t.hasAttribute('data-open-cart')) openCart();
    else if (t.hasAttribute('data-close-cart')) closeCart();
    else if (t.hasAttribute('data-checkout')) {
      cart = {}; renderCart(); closeCart();
      toast('Order placed — see you in ~8 min. (Demo: nothing was charged)');
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeCart();
  });
  renderCart();

  /* ---------- Header / burger ---------- */
  const header = $('.header');
  const burger = $('[data-burger]');
  const mnav = $('[data-mobile-nav]');
  const toggleNav = (open) => {
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mnav.hidden = !open;
  };
  burger.addEventListener('click', () => toggleNav(mnav.hidden));
  mnav.addEventListener('click', (e) => { if (e.target.closest('a')) toggleNav(false); });

  /* ---------- Filters ---------- */
  const grid = $('[data-grid]');
  const setFilter = (cat) => {
    $$('[data-filter]').forEach((b) => b.setAttribute('aria-selected', b.dataset.filter === cat));
    grid.classList.toggle('is-filtered', cat !== 'all');
    let shown = 0;
    $$('.product', grid).forEach((p) => {
      const on = cat === 'all' || p.dataset.cat === cat;
      p.classList.toggle('is-hidden', !on);
      if (on) { shown++; p.classList.add('is-in'); }
    });
    $('[data-empty]').hidden = shown > 0;
  };
  $$('[data-filter]').forEach((b) => b.addEventListener('click', () => setFilter(b.dataset.filter)));
  $$('[data-filter-link]').forEach((a) => a.addEventListener('click', () => setFilter(a.dataset.filterLink)));

  /* ---------- Full menu ---------- */
  const listEl = $('[data-menu-list]');
  const photo = $('[data-menu-photo]');
  const renderMenu = (key) => {
    const m = MENU[key];
    $$('[data-menu-tab]').forEach((b) => b.setAttribute('aria-selected', b.dataset.menuTab === key));
    listEl.innerHTML = m.groups.map((g) => `
      <div class="menu-group">
        <h3>${g.title}</h3>
        ${g.items.map(([id, desc, badge], i) => `
          <div class="menu-item" style="animation-delay:${i * 50}ms">
            <span class="menu-item__name">${PRODUCTS[id].name}${badge ? `<small>${badge}</small>` : ''}</span>
            <span class="menu-item__price">${money(PRODUCTS[id].price)}</span>
            <button class="plus" data-add="${id}" aria-label="Add ${PRODUCTS[id].name}">+</button>
            <span class="menu-item__desc">${desc}</span>
          </div>`).join('')}
      </div>`).join('');
    if (!photo.src.endsWith(m.photo)) {
      photo.classList.add('is-swapping');
      setTimeout(() => { photo.src = IMG + m.photo; }, 250);
      photo.onload = () => photo.classList.remove('is-swapping');
    }
  };
  $$('[data-menu-tab]').forEach((b) => b.addEventListener('click', () => renderMenu(b.dataset.menuTab)));
  renderMenu('matcha');

  /* ---------- Open status (venue local time) ---------- */
  const status = () => {
    const now = new Date();
    const d = now.getDay(), h = now.getHours() + now.getMinutes() / 60;
    const wk = d >= 1 && d <= 5;
    const [o, c] = wk ? [8, 20] : [9, 21];
    const open = h >= o && h < c;
    const label = open ? `Open now · until ${c}:00` : `Closed · opens ${h < o ? 'at' : 'tomorrow'} ${h < o ? o : (d === 5 || d === 6 ? 9 : 8)}:00`;
    $('[data-open-status]').textContent = label;
    $('[data-open-badge]').textContent = open ? 'Open now' : 'Closed right now';
    $$('.dot').forEach((el) => el.classList.toggle('is-closed', !open));
  };
  status();

  /* ---------- Count-up ---------- */
  const countUp = (el) => {
    const end = +el.dataset.count;
    if (reduce) { el.textContent = end; return; }
    const t0 = performance.now(), dur = 1600;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  setTimeout(() => $$('[data-count]').forEach(countUp), 600);

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  $$('[data-reveal], .section-head').forEach((el) => io.observe(el));
  $$('.grid [data-reveal]').forEach((el, i) => el.style.setProperty('--d', `${(i % 4) * 70}ms`));
  $$('.bento [data-reveal]').forEach((el, i) => el.style.setProperty('--d', `${i * 70}ms`));

  /* ---------- Quotes ---------- */
  const quotes = $$('.quote');
  const dots = $$('.quotes__dots button');
  let qi = 0, qTimer;
  const showQuote = (i) => {
    qi = i;
    quotes.forEach((q, j) => q.classList.toggle('is-active', j === i));
    dots.forEach((d, j) => d.setAttribute('aria-selected', j === i));
  };
  const autoQuote = () => { clearInterval(qTimer); if (!reduce) qTimer = setInterval(() => showQuote((qi + 1) % quotes.length), 6000); };
  dots.forEach((d, i) => d.addEventListener('click', () => { showQuote(i); autoQuote(); }));
  autoQuote();

  /* ---------- Forms ---------- */
  const book = $('[data-book]');
  const dateIn = $('input[type="date"]', book);
  const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  dateIn.min = today.toISOString().slice(0, 10);
  book.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = $('[data-book-msg]');
    let ok = true;
    $$('input[required]', book).forEach((i) => {
      const bad = !i.value.trim();
      i.classList.toggle('is-invalid', bad);
      if (bad) ok = false;
    });
    if (!ok) { msg.style.color = '#f0b48e'; msg.textContent = 'Please add your name and a date.'; return; }
    const f = new FormData(book);
    const when = new Date(f.get('date') + 'T00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    msg.style.color = '';
    msg.textContent = `Table for ${f.get('guests')} on ${when}, ${f.get('time')}. See you, ${f.get('name').split(' ')[0]}!`;
    book.reset();
  });

  const news = $('[data-news]');
  news.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('input', news).value.trim();
    const out = $('[data-news-msg]');
    out.textContent = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'You’re in. First letter lands next month.' : 'That email looks a little off.';
    if (out.textContent.startsWith('You')) news.reset();
  });

  /* ---------- Scroll-linked effects ---------- */
  const parallax = $$('[data-parallax]');
  const stack = $('.stack');
  const stackHost = $('[data-explode]');
  const steps = $$('[data-step]');
  const ritualBar = $('[data-ritual-bar]');
  const ritual = $('.ritual__steps');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const vh = innerHeight;
    header.classList.toggle('is-scrolled', scrollY > 8);

    if (!reduce) {
      parallax.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        el.style.transform = `translate3d(0, ${(r.top) * -+el.dataset.parallax}px, 0)`;
      });
    }

    // exploded layers: 0 = stacked, 1 = fully apart
    const sr = stackHost.getBoundingClientRect();
    const p = reduce ? 1 : clamp((vh - sr.top) / (vh * 0.75));
    stack.style.setProperty('--spread', p.toFixed(3));

    // ritual steps
    const mid = vh * 0.55;
    let active = 0;
    steps.forEach((s, i) => { if (s.getBoundingClientRect().top < mid) active = i; });
    steps.forEach((s, i) => s.classList.toggle('is-active', i === active));
    const rr = ritual.getBoundingClientRect();
    ritualBar.style.transform = `scaleX(${clamp((mid - rr.top) / rr.height).toFixed(3)})`;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Tilt (pointer devices) ---------- */
  if (!reduce && matchMedia('(hover: hover)').matches) {
    $$('[data-tilt]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
      el.style.transition = 'transform .5s cubic-bezier(.2,.7,.1,1)';
    });
  }
})();
