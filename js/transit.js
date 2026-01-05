// js/transit.js
// TRANSIT site script (updated)
// - Injects favicon and welcome logo from provided URL
// - Removes Keenbot from pros list (per request)
// - Builds UI inside #transit-root
// - Visible train moving across a tunnel (side-to-side)
// - Owners and pros (without Keenbot) from provided data
// - Robust image fallback, modals, copy-to-clipboard, keyboard support
// - Defensive checks and helpful console logging

(function () {
  'use strict';

  /* -------------------------
     Configuration
     ------------------------- */
  const ASSETS = {
    // user-provided logo / favicon (used for both favicon and welcome logo)
    logoUrl: 'https://media.discordapp.net/attachments/1455083612650344576/1457623721643610152/whitetransit.png?ex=695cad60&is=695b5be0&hm=55d0234f994f6db1583458578e4823efc7451c437ff325d2a56f2caf72bd15d8&=&format=webp&quality=lossless&width=2430&height=2430'
  };

  /* -------------------------
     Lightweight helpers
     ------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from((root || document).querySelectorAll(sel));
  const log = (...args) => { if (window.console) console.log('[TRANSIT]', ...args); };
  const noop = () => {};

  /* -------------------------
     Data (owners & pros)
     NOTE: Keenbot removed from PROS as requested
     ------------------------- */
  const OWNERS = [
    { name: 'Kipp', username: 'kipp3fn', img: 'https://images-ext-1.discordapp.net/external/M0zcMPtaci4aOljOitKoHOtQbv_znpXHeEC6UXy8p9w/%3Fsize%3D4096/https/cdn.discordapp.com/guilds/1444872814896222392/users/713058653673881682/avatars/951ed5a1314f01b06148407ca0ae5f56.png?format=webp&quality=lossless&width=763&height=763', bio: 'Founder & strategist.' },
    { name: 'Ensena', username: 'lukybot._88357', img: 'https://images-ext-1.discordapp.net/external/xQ4Td3b5El4A8TjfusnrbQKCgqgBX935NqGzrLekqbw/%3Fsize%3D4096/https/cdn.discordapp.com/avatars/1307439758732955708/6037054eb875e07ff4d22d61af56552c.png?format=webp&quality=lossless&width=1013&height=1013', bio: 'Community & ops.' },
    { name: 'Holy', username: 'holyfnbr', img: 'https://images-ext-1.discordapp.net/external/mZQexBEjCD3rS8WvswW6xrWDtBZlh50JR1Nv99f73Zs/%3Fsize%3D4096/https/cdn.discordapp.com/guilds/1444872814896222392/users/1232563371086315545/avatars/cc3f50b02fb014e6aacd3919e4ce7856.png?format=webp&quality=lossless&width=412&height=412', bio: 'Lead streamer.' },
    { name: 'Cash', username: 'whoiscashmgmt', img: 'https://images-ext-1.discordapp.net/external/3QKXVep6orGn1FtRkgCSYxqmdK7URKnnBKy3cByJFcs/%3Fsize%3D4096/https/cdn.discordapp.com/avatars/1413051312970662001/c0ca44841ab70e9545312b8fbab4a281.png?format=webp&quality=lossless&width=412&height=412', bio: 'Sponsorships & finance.' },
    { name: 'Kaz', username: 'transitkaz', img: 'https://images-ext-1.discordapp.net/external/uUZG3M7-4fbygRDcD5MuhxK9ueoN6UcEQRWU2M3inDQ/%3Fsize%3D4096/https/cdn.discordapp.com/avatars/1399583063490695272/cd27417a73d4348c74b5df5b4a60f927.png?format=webp&quality=lossless&width=184&height=184', bio: 'Server admin.' },
    { name: 'Zay', username: 'og4ra', img: 'https://images-ext-1.discordapp.net/external/Hz8xVbrTTDyqleTkRtpY1NFk5zJjPiMjNNRZyMWwrR8/%3Fsize%3D4096/https/cdn.discordapp.com/avatars/1107473562559844392/e8330612db7a445731ada1f81b034971.png?format=webp&quality=lossless&width=412&height=412', bio: 'Content & socials.' },
    { name: 'Luk', username: '5k0', img: 'https://images-ext-1.discordapp.net/external/-u1M4WTFN0JwL3MKsuIK3ccUU2jJX-kx3fqN_oLuXAo/%3Fsize%3D4096/https/cdn.discordapp.com/avatars/955738199307735050/68917b3b3c17efa83cb7fab0f5740f31.png?format=webp&quality=lossless&width=412&height=412', bio: 'Support & moderation.' }
  ];

  // PROS: Keenbot removed per user request
  const PROS = [
    { name: 'Lucks', url: 'https://fortnitetracker.com/profile/all/transit%20lucks/events', img: 'https://images-ext-1.discordapp.net/external/cry7tYWunMlvaIf50lryV2Gn8u2GTqLuUrmzeJeeskg/%3Fsize%3D4096/https/cdn.discordapp.com/avatars/1247334665296285803/b2f4ee16100c0900a314df8e7547a878.png?format=webp&quality=lossless&width=325&height=325' },
    { name: 'Trunks', url: 'https://fortnitetracker.com/profile/all/trunk', img: 'https://images-ext-1.discordapp.net/external/GyQicPLz_zQO15bOMtiGTtC4Kud7JjQbs1Ecuz7RrtU/https/cdn.discordapp.com/embed/avatars/1.png?format=webp&quality=lossless&width=371&height=371' }
  ];

  /* -------------------------
     Utility functions
     ------------------------- */
  function injectFavicon(url) {
    try {
      if (!url) return;
      // remove existing favicons
      const existing = document.querySelectorAll('link[rel~="icon"]');
      existing.forEach(n => n.remove());
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = url;
      link.type = 'image/png';
      document.head.appendChild(link);
      // also add shortcut icon for compatibility
      const link2 = document.createElement('link');
      link2.rel = 'shortcut icon';
      link2.href = url;
      document.head.appendChild(link2);
      log('Favicon injected:', url);
    } catch (e) {
      log('favicon injection failed', e);
    }
  }

  function safeCreateElement(tag, props = {}, children = []) {
    const el = document.createElement(tag);
    Object.keys(props).forEach(k => {
      if (k === 'class') el.className = props[k];
      else if (k === 'text') el.textContent = props[k];
      else if (k === 'html') el.innerHTML = props[k];
      else el.setAttribute(k, props[k]);
    });
    children.forEach(c => el.appendChild(c));
    return el;
  }

  function placeholderDataURI(text = 'Image unavailable') {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="#0b0b0b"/><text x="50%" y="50%" fill="#ffffff" font-size="18" font-family="Arial" text-anchor="middle" dominant-baseline="middle">${text}</text></svg>`
    );
  }

  /* -------------------------
     Build UI (root)
     ------------------------- */
  function buildUI() {
    const root = document.getElementById('transit-root');
    if (!root) {
      console.error('No #transit-root found in DOM');
      return;
    }

    root.innerHTML = `
      <div class="loader-wrap" id="loader" role="status" aria-live="polite">
        <div class="loader-title">TRANSIT</div>
        <div class="loader-sub">Preparing the rails...</div>
        <div class="tunnel-container" id="tunnel">
          <div class="tunnel-overlay"></div>
          <div class="tunnel-track" id="tunnel-track" aria-hidden="true"></div>
        </div>
      </div>

      <header class="topbar" role="banner">
        <div class="brand" id="brand" tabindex="0" aria-label="Home">
          <img class="logo" id="brand-logo" src="" alt="TRANSIT logo" width="40" height="40" style="border-radius:6px;object-fit:cover">
          <div class="title">TRANSIT</div>
        </div>

        <nav class="tabs" role="navigation" aria-label="Main tabs">
          <button class="tab" data-tab="welcome" aria-selected="true">Welcome</button>
          <button class="tab" data-tab="owners" aria-selected="false">Owners</button>
          <button class="tab" data-tab="pros" aria-selected="false">Pros</button>
          <button class="tab" data-tab="map" aria-selected="false">Map</button>
          <button class="tab" data-tab="merch" aria-selected="false">Merch</button>
        </nav>

        <div class="top-actions">
          <a class="icon-btn" href="https://x.com/3StarsEsports" target="_blank" rel="noopener" aria-label="Twitter">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M22 5.92c-.7.31-1.45.52-2.24.62.81-.49 1.43-1.27 1.72-2.2-.76.45-1.6.78-2.5.96C18.6 4.2 17.5 3.75 16.3 3.75c-2.1 0-3.8 1.7-3.8 3.8 0 .3.03.6.1.88-3.16-.16-5.96-1.67-7.84-3.97-.33.57-.52 1.24-.52 1.95 0 1.35.69 2.54 1.74 3.24-.64-.02-1.24-.2-1.77-.5v.05c0 1.86 1.32 3.41 3.07 3.76-.32.09-.66.14-1.01.14-.25 0-.5-.02-.74-.07.5 1.56 1.95 2.7 3.67 2.73-1.35 1.06-3.05 1.69-4.9 1.69-.32 0-.64-.02-.95-.06 1.76 1.13 3.85 1.79 6.09 1.79 7.31 0 11.32-6.06 11.32-11.32v-.52c.78-.56 1.45-1.26 1.98-2.06-.72.32-1.5.54-2.3.64z"/></svg>
          </a>
          <a class="icon-btn" href="https://discord.com/invite/3stars" target="_blank" rel="noopener" aria-label="Discord">
            <img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/discord-white-icon.png" alt="Discord" width="20" height="20">
          </a>
        </div>
      </header>

      <main class="main" id="main">
        <section id="welcome" class="panel active" aria-hidden="false">
          <div class="welcome">
            <div class="logo-large" aria-hidden="true">
              <img id="welcome-logo" src="" alt="TRANSIT welcome logo" style="width:220px;height:220px;border-radius:12px;object-fit:cover">
            </div>
            <div class="welcome-title">TRANSIT</div>
            <div class="welcome-quote">"In Transit, Momentum Matters"</div>
            <div style="margin-top:18px"><button id="enter-btn" class="small-btn">Enter Site</button></div>
          </div>
        </section>

        <section id="owners" class="panel hidden" aria-hidden="true">
          <h2>Owners & Staff</h2>
          <div class="cards" id="owners-grid" role="list"></div>
        </section>

        <section id="pros" class="panel hidden" aria-hidden="true">
          <h2>Main Pro Players</h2>
          <div class="cards" id="pros-grid" role="list"></div>
        </section>

        <section id="map" class="panel hidden" aria-hidden="true">
          <h2>Server & Map</h2>
          <p>Join our Discord server: <a class="small-btn" href="https://discord.com/invite/3stars" target="_blank" rel="noopener">Discord Invite</a></p>
          <p>Map: <a class="small-btn" href="https://www.fortnite.com/@blagoje/9179-7247-4725?lang=en-US" target="_blank" rel="noopener">Open Map</a></p>
        </section>

        <section id="merch" class="panel hidden" aria-hidden="true">
          <h2>Merch</h2>
          <p class="muted">Merch is not available yet. We'll add it soon.</p>
          <button id="merch-notify" class="small-btn">Notify me</button>
        </section>
      </main>

      <div id="toast" class="toast" role="status" aria-live="polite"></div>
    `;
  }

  /* -------------------------
     Tunnel / train visuals
     ------------------------- */
  function runTunnelAnimation() {
    const track = document.getElementById('tunnel-track');
    if (!track) return;
    track.innerHTML = '';
    // create a long visible train (8 cars)
    for (let i = 0; i < 8; i++) {
      const car = safeCreateElement('div', { class: 'train-car' });
      car.innerHTML = `
        <svg class="train-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="6" y="18" width="44" height="22" rx="3" fill="currentColor" />
          <circle cx="20" cy="46" r="4" fill="currentColor" />
          <circle cx="44" cy="46" r="4" fill="currentColor" />
          <rect x="10" y="10" width="12" height="8" rx="2" fill="currentColor" />
        </svg>
      `;
      track.appendChild(car);
    }
    // animate track with a visible duration
    track.style.animation = 'train-slide 1800ms cubic-bezier(.2,.9,.2,1) forwards';
    track.addEventListener('animationend', () => { track.style.animation = ''; }, { once: true });
  }

  /* -------------------------
     Populate owners & pros
     ------------------------- */
  function populatePeople() {
    const ownersGrid = document.getElementById('owners-grid');
    const prosGrid = document.getElementById('pros-grid');

    if (ownersGrid) {
      ownersGrid.innerHTML = '';
      OWNERS.forEach(o => {
        const card = safeCreateElement('div', { class: 'card' });
        const img = safeCreateElement('img', { src: o.img, alt: `${o.name} avatar`, loading: 'lazy' });
        img.onerror = () => imageFallback(img);
        const meta = safeCreateElement('div', { html: `<div style="font-weight:800">${o.name}</div><div style="color:var(--muted);font-size:13px">${o.username}</div>` });
        const actions = safeCreateElement('div', { class: 'owner-actions' });
        const friend = safeCreateElement('button', { class: 'small-btn', text: 'Friend' });
        friend.addEventListener('click', async () => {
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              await navigator.clipboard.writeText(o.username);
              showToast(`Copied ${o.username}`);
            } else {
              const tmp = document.createElement('input');
              tmp.value = o.username;
              document.body.appendChild(tmp);
              tmp.select();
              document.execCommand('copy');
              tmp.remove();
              showToast(`Copied ${o.username}`);
            }
          } catch (e) {
            showToast('Copy failed');
          }
          try { window.open('https://discord.com/invite/3stars', '_blank', 'noopener'); } catch (e) {}
        });
        const profile = safeCreateElement('button', { class: 'small-btn', text: 'Profile' });
        profile.addEventListener('click', () => openOwnerModal(o));
        actions.appendChild(friend);
        actions.appendChild(profile);
        card.appendChild(img);
        card.appendChild(meta);
        card.appendChild(actions);
        ownersGrid.appendChild(card);
      });
    }

    if (prosGrid) {
      prosGrid.innerHTML = '';
      PROS.forEach(p => {
        const a = safeCreateElement('a', { class: 'card', href: p.url, target: '_blank', rel: 'noopener' });
        const img = safeCreateElement('img', { src: p.img, alt: p.name, loading: 'lazy' });
        img.onerror = () => imageFallback(img);
        const meta = safeCreateElement('div', { html: `<div style="font-weight:800">${p.name}</div>` });
        a.appendChild(img);
        a.appendChild(meta);
        prosGrid.appendChild(a);
      });
    }
  }

  /* -------------------------
     Image fallback
     ------------------------- */
  function imageFallback(img) {
    if (!img) return;
    if (img.dataset._tried) {
      img.src = placeholderDataURI();
      return;
    }
    img.dataset._tried = '1';
    try {
      const url = new URL(img.src, location.href);
      const filename = url.pathname.split('/').pop();
      if (filename) {
        img.src = '/assets/images/' + filename;
        return;
      }
    } catch (e) { /* ignore */ }
    img.src = placeholderDataURI();
  }

  /* -------------------------
     Owner modal
     ------------------------- */
  function openOwnerModal(owner) {
    const backdrop = safeCreateElement('div', { class: 'modal-backdrop' });
    const modal = safeCreateElement('div', { class: 'modal' });
    modal.innerHTML = `
      <h3>${owner.name} — ${owner.username}</h3>
      <div style="display:flex;gap:12px;align-items:center">
        <img src="${owner.img}" alt="${owner.name}" style="width:120px;height:120px;border-radius:12px;object-fit:cover" onerror="this.src='${placeholderDataURI()}'">
        <div>
          <p style="margin:0 0 8px">${owner.bio || ''}</p>
          <div style="display:flex;gap:8px;margin-top:8px">
            <button id="modal-copy" class="small-btn">Copy Username</button>
            <button id="modal-invite" class="small-btn">Open Discord</button>
            <button id="modal-close" class="small-btn">Close</button>
          </div>
        </div>
      </div>
    `;
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    const copyBtn = $('#modal-copy', modal);
    const inviteBtn = $('#modal-invite', modal);
    const closeBtn = $('#modal-close', modal);

    if (copyBtn) copyBtn.addEventListener('click', async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(owner.username);
          showToast('Copied ' + owner.username);
        }
      } catch (e) { showToast('Copy failed'); }
    });

    if (inviteBtn) inviteBtn.addEventListener('click', () => {
      try { window.open('https://discord.com/invite/3stars', '_blank', 'noopener'); } catch (e) {}
    });

    if (closeBtn) closeBtn.addEventListener('click', () => backdrop.remove());
    backdrop.addEventListener('click', (ev) => { if (ev.target === backdrop) backdrop.remove(); });
    document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { backdrop.remove(); document.removeEventListener('keydown', esc); }});
  }

  /* -------------------------
     Tabs and top overlay animation
     ------------------------- */
  function initTabs() {
    const tabs = $$('.tab');
    const panels = $$('.panel');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const id = tab.dataset.tab;
        if (!id) return;
        playTopOverlay();
        setTimeout(() => {
          panels.forEach(p => { p.classList.remove('active'); p.classList.add('hidden'); p.setAttribute('aria-hidden', 'true'); });
          const target = document.getElementById(id);
          if (target) {
            target.classList.remove('hidden');
            setTimeout(() => { target.classList.add('active'); target.setAttribute('aria-hidden', 'false'); }, 18);
          }
          tabs.forEach(t => t.setAttribute('aria-selected', t === tab ? 'true' : 'false'));
        }, 360);
      });

      tab.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const idx = tabs.indexOf(tab);
          const next = e.key === 'ArrowRight' ? (idx + 1) % tabs.length : (idx - 1 + tabs.length) % tabs.length;
          tabs[next].focus();
        }
      });
    });
  }

  function playTopOverlay() {
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.right = '0';
    overlay.style.height = '64px';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '60';
    const train = document.createElement('div');
    train.style.position = 'absolute';
    train.style.left = '-30%';
    train.style.top = '8px';
    train.style.display = 'flex';
    train.style.gap = '12px';
    train.style.alignItems = 'center';
    for (let i = 0; i < 4; i++) {
      const car = document.createElement('div');
      car.style.width = '100px';
      car.style.height = '44px';
      car.style.borderRadius = '8px';
      car.style.background = 'linear-gradient(180deg,#111,#070707)';
      car.style.border = '1px solid rgba(255,255,255,0.04)';
      car.style.display = 'flex';
      car.style.alignItems = 'center';
      car.style.justifyContent = 'center';
      car.style.boxShadow = '0 12px 36px rgba(0,0,0,0.6)';
      car.style.color = 'var(--white)';
      car.style.fontWeight = '800';
      car.textContent = 'TRANSIT';
      train.appendChild(car);
    }
    overlay.appendChild(train);
    document.body.appendChild(overlay);
    train.animate([
      { transform: 'translateX(0)', opacity: 0.0, filter: 'blur(6px)' },
      { transform: 'translateX(120vw)', opacity: 1.0, filter: 'blur(0px)' }
    ], { duration: 900, easing: 'cubic-bezier(.2,.9,.2,1)' });
    setTimeout(() => overlay.remove(), 1000);
  }

  /* -------------------------
     Toast helper
     ------------------------- */
  function showToast(msg, ms = 2200) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    t.style.display = 'block';
    setTimeout(() => { t.classList.remove('show'); t.style.display = 'none'; }, ms);
  }

  /* -------------------------
     Image safety initialization
     ------------------------- */
  function initImageSafety() {
    $$('img').forEach(img => {
      if (!img.loading) img.loading = 'lazy';
      if (img.complete && img.naturalWidth === 0) imageFallback(img);
      img.addEventListener('error', () => imageFallback(img));
    });
  }

  /* -------------------------
     Start sequence
     ------------------------- */
  function start() {
    try {
      // inject favicon and set welcome/brand logos
      injectFavicon(ASSETS.logoUrl);

      buildUI();

      // set brand and welcome logo src (defensive)
      const brandLogo = document.getElementById('brand-logo');
      const welcomeLogo = document.getElementById('welcome-logo');
      if (brandLogo) brandLogo.src = ASSETS.logoUrl;
      if (welcomeLogo) welcomeLogo.src = ASSETS.logoUrl;

      runTunnelAnimation();
      populatePeople();
      initTabs();
      initImageSafety();

      // Enter button behavior
      const enter = document.getElementById('enter-btn');
      if (enter) enter.addEventListener('click', () => {
        const ownersTab = Array.from($$('.tab')).find(t => t.dataset.tab === 'owners');
        if (ownersTab) ownersTab.click();
      });

      // Brand click -> welcome
      const brand = document.getElementById('brand');
      if (brand) brand.addEventListener('click', () => {
        $$('.panel').forEach(p => { p.classList.remove('active'); p.classList.add('hidden'); p.setAttribute('aria-hidden', 'true'); });
        const welcome = document.getElementById('welcome');
        if (welcome) { welcome.classList.remove('hidden'); welcome.classList.add('active'); welcome.setAttribute('aria-hidden', 'false'); }
      });

      // Merch notify
      const merchNotify = document.getElementById('merch-notify');
      if (merchNotify) merchNotify.addEventListener('click', () => showToast('We will notify when merch is available'));

      // Hide loader after 3s
      setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) {
          loader.style.transition = 'opacity 420ms ease';
          loader.style.opacity = '0';
          setTimeout(() => { try { loader.remove(); } catch (e) {} }, 480);
        }
      }, 3000);

      // Safety fallback: remove loader if still present after 8s
      setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) try { loader.remove(); } catch (e) {}
      }, 8000);

      log('TRANSIT started');
    } catch (err) {
      console.error('[TRANSIT] initialization error', err);
    }
  }

  /* -------------------------
     Run on DOM ready
     ------------------------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  /* -------------------------
     Expose for debugging
     ------------------------- */
  window.TRANSIT = {
    start,
    rebuild: start,
    owners: OWNERS,
    pros: PROS
  };

})();
