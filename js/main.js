// js/main.js - white UI + 3D star transition + animated tab switching
(function () {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  const loader = $('#loader');
  const app = $('#app');
  const enterBtn = $('#enterBtn');
  const homeBtn = $('#homeBtn');
  const tabs = $$('.tab');
  const panels = $$('.panel');
  const merchModal = $('#merchModal');
  const merchClose = $('#merchClose');
  const merchGotIt = $('#merchGotIt');
  const merchNotify = $('#merchNotify');
  const toast = $('#toast');
  const emblem = document.querySelector('.emblem-svg');

  function show(el){ if(!el) return; el.classList.remove('hidden'); el.style.display=''; }
  function hide(el){ if(!el) return; el.classList.add('hidden'); el.style.display='none'; }
  function showToast(msg){ if(!toast) return; toast.textContent = msg; toast.classList.remove('hidden'); setTimeout(()=> toast.classList.add('hidden'),2400); }

  // Play emblem 3D animation (adds class then removes it)
  function playEmblem3D() {
    try {
      if(!emblem) return;
      emblem.classList.remove('emblem-3d');
      // force reflow to restart animation
      void emblem.offsetWidth;
      emblem.classList.add('emblem-3d');
    } catch (e) {
      // silent
    }
  }

  // Switch panel with animation and trigger emblem 3D effect
  function switchPanel(targetId) {
    if(!targetId) return;
    const target = document.getElementById(targetId);
    if(!target) return;
    // hide hero if visible
    const hero = $('#hero'); if(hero && !hero.classList.contains('hidden')) hero.classList.add('hidden');
    // hide all panels
    panels.forEach(p => { p.classList.remove('active'); p.classList.add('hidden'); p.setAttribute('aria-hidden','true'); });
    // show target
    target.classList.remove('hidden');
    // small delay to allow CSS to apply then set active (triggers CSS animation)
    setTimeout(()=> {
      target.classList.add('active');
      target.setAttribute('aria-hidden','false');
    }, 20);
    // update tabs aria
    tabs.forEach(t => t.setAttribute('aria-selected', t.dataset.tab === targetId ? 'true' : 'false'));
    // play emblem 3D effect
    playEmblem3D();
    // focus content for accessibility
    $('#content')?.focus();
  }

  // Loader: 3s then reveal app
  function startLoader(ms = 3000) {
    if(!loader) { if(app) app.classList.remove('hidden'); return; }
    setTimeout(()=> {
      loader.style.transition = 'opacity 420ms ease';
      loader.style.opacity = '0';
      loader.style.pointerEvents = 'none';
      setTimeout(()=> {
        try { loader.remove(); } catch(e){}
        if(app) app.classList.remove('hidden');
      }, 480);
    }, ms);
  }

  function init() {
    if(!tabs.length || !panels.length) return;
    // hide all panels initially (hero visible)
    panels.forEach(p => { p.classList.remove('active'); p.classList.add('hidden'); p.setAttribute('aria-hidden','true'); });

    // tab click handlers
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.tab;
        if(!id) return;
        if(id === 'merch') { if(merchModal) merchModal.classList.remove('hidden'); return; }
        switchPanel(id);
      });
      tab.addEventListener('keydown', (e) => {
        if(e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const idx = tabs.indexOf(tab);
          const next = e.key === 'ArrowRight' ? (idx + 1) % tabs.length : (idx - 1 + tabs.length) % tabs.length;
          tabs[next].focus();
        }
      });
    });

    // Enter button
    if(enterBtn) {
      enterBtn.addEventListener('click', () => switchPanel('owners'));
    }

    // Home button returns to hero
    if(homeBtn) {
      homeBtn.addEventListener('click', () => {
        const hero = $('#hero'); if(hero) hero.classList.remove('hidden');
        panels.forEach(p => { p.classList.remove('active'); p.classList.add('hidden'); p.setAttribute('aria-hidden','true'); });
        tabs.forEach(t => t.setAttribute('aria-selected','false'));
      });
    }

    // friend buttons delegation
    document.body.addEventListener('click', async (e) => {
      const btn = e.target.closest && e.target.closest('.friend-btn');
      if(!btn) return;
      const username = btn.dataset?.username || '';
      if(username) {
        try {
          if(navigator.clipboard) { await navigator.clipboard.writeText(username); showToast(`Copied username: ${username}`); }
          else { const tmp = document.createElement('input'); tmp.value = username; document.body.appendChild(tmp); tmp.select(); document.execCommand('copy'); tmp.remove(); showToast(`Copied username: ${username}`); }
        } catch { showToast('Could not copy username'); }
      }
      window.open('https://discord.com/invite/3stars', '_blank', 'noopener');
    });

    // merch modal controls
    if(merchNotify) merchNotify.addEventListener('click', () => { if(merchModal) merchModal.classList.remove('hidden'); });
    if(merchClose) merchClose.addEventListener('click', () => { if(merchModal) merchModal.classList.add('hidden'); });
    if(merchGotIt) merchGotIt.addEventListener('click', () => { if(merchModal) merchModal.classList.add('hidden'); });
    if(merchModal) { merchModal.addEventListener('click', (e) => { if(e.target === merchModal) merchModal.classList.add('hidden'); }); document.addEventListener('keydown', (e) => { if(e.key === 'Escape') merchModal.classList.add('hidden'); }); }
  }

  // start
  startLoader(3000);
  setTimeout(init, 3200);

  // safety fallback
  setTimeout(()=> { if(document.getElementById('loader')) { try{ document.getElementById('loader').remove(); }catch{} if(app) app.classList.remove('hidden'); } }, 7000);

})();
