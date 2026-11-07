'use strict';
(function () {
  const $ = id => document.getElementById(id);
  const SCREENS = ['welcome', 'diya', 'create', 'card'];

  // Greeting copy. Edit here to change wording; see README before adding a language.
  const T = {
    en: {
      title: 'Happy Diwali', dear: 'Dear ', share: 'A Diwali card for you',
      msgs: {
        general: 'May the light of this Diwali stay with you all year. Wishing you good health, easy days and plenty of sweets.',
        family: 'Wishing our family a Diwali full of shared meals, easy laughter and a lot of light at home.',
        friends: 'Happy Diwali! Here’s to good company, too many sweets and another year of friendship.',
        elders: 'Your blessings are the brightest light in my life. Wishing you good health and happiness this Diwali.',
        teachers: 'Thank you for everything you have taught me. May your Diwali be bright and your year full of good news.',
        colleagues: 'Wishing you and your family a peaceful, happy Diwali. Enjoy the break; you’ve earned it.'
      }
    },
    hi: {
      title: 'शुभ दीपावली', dear: 'प्रिय ', share: 'आपके लिए दीपावली का कार्ड',
      msgs: {
        general: 'दीपावली की रोशनी आपके जीवन में सुख, स्वास्थ्य और शांति लेकर आए। शुभ दीपावली!',
        family: 'आपके और पूरे परिवार के लिए यह दीपावली खुशियों, मिठास और ढेर सारी रोशनी से भरी हो।',
        friends: 'शुभ दीपावली, दोस्त! हँसी, मिठाइयाँ और अच्छा साथ यूँ ही बना रहे।',
        elders: 'आपका आशीर्वाद ही मेरे लिए सबसे बड़ी रोशनी है। आप सदा स्वस्थ और प्रसन्न रहें। शुभ दीपावली!',
        teachers: 'आपने जो सिखाया, उसके लिए हृदय से धन्यवाद। आपकी दीपावली सुखद हो और आने वाला साल अच्छी खबरें लाए।',
        colleagues: 'आपको और आपके परिवार को दीपावली की हार्दिक शुभकामनाएँ। त्योहार की छुट्टियों का भरपूर आनंद लीजिए।'
      }
    }
  };

  const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = null, lastEnc = null, dirty = false;
  let ctx = null, parts = [], raf = 0, timer = 0, fwOn = false; // fireworks state (declared early: route() can call fx())
  const cv = $('fx');

  // Status messages are announced politely and only describe real outcomes.
  function say(msg) {
    const s = $('status');
    s.textContent = '';
    setTimeout(() => { s.textContent = msg; }, 40);
  }

  function show(id) {
    if (id !== 'card') fx(false);
    SCREENS.forEach(s => { $(s).hidden = s !== id; });
    window.scrollTo(0, 0);
    $('h-' + id).focus({ preventScroll: true });
  }

  // ---- Screen 1 and 2: welcome and diya ----
  $('start').addEventListener('click', () => show('diya'));
  $('lamp').addEventListener('click', () => {
    const on = $('lamp').getAttribute('aria-pressed') !== 'true';
    $('lamp').setAttribute('aria-pressed', on);
    $('diya').classList.toggle('lit', on);
    document.body.classList.toggle('lit', on);
    $('hint').textContent = on ? 'The diya is lit. Continue when you’re ready.' : 'The diya is out. Press it to light it again.';
    $('next').textContent = on ? 'Continue' : 'Skip lighting';
  });
  $('next').addEventListener('click', () => show('create'));

  // ---- Screen 3: creator ----
  const lang = () => document.querySelector('input[name="lang"]:checked').value;
  const count = () => { $('count').textContent = $('msg').value.length + ' of 280 characters'; };
  function suggest(force) {
    if (dirty && !force) return;
    $('msg').value = T[lang()].msgs[$('rel').value];
    dirty = false;
    count();
  }
  $('msg').addEventListener('input', () => { dirty = true; count(); });
  $('rel').addEventListener('change', () => suggest(false));
  document.querySelectorAll('input[name="lang"]').forEach(r => r.addEventListener('change', () => suggest(false)));
  $('suggest').addEventListener('click', () => suggest(true));
  suggest(true);

  $('form').addEventListener('submit', e => {
    e.preventDefault();
    const d = Codec.clean({ n: $('to').value, f: $('from').value, m: $('msg').value, l: lang() });
    if (!d.m) {
      $('err').textContent = 'Write a message first, or press “Use the suggested message”.';
      $('msg').focus();
      return;
    }
    $('err').textContent = '';
    render(d, false);
    show('card');
  });

  // ---- Screen 4: card (user text is only ever set with textContent) ----
  function setHash(enc) {
    lastEnc = enc;
    try { history.replaceState(null, '', '#c=' + enc); } catch (e) { location.hash = 'c=' + enc; }
  }
  function clearHash() {
    lastEnc = null;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { location.hash = ''; }
  }
  function render(d, received) {
    current = d;
    const t = T[d.l], c = $('cardEl');
    c.lang = d.l;
    $('h-card').textContent = t.title;
    $('cTo').textContent = d.n ? t.dear + d.n + ',' : '';
    $('cTo').hidden = !d.n;
    $('cMsg').textContent = d.m;
    $('cBy').textContent = d.f ? '— ' + d.f : '';
    $('cBy').hidden = !d.f;
    setHash(Codec.encode(d));
    $('url').value = location.href;
    $('manual').hidden = true;
    $('status').textContent = '';
    $('native').hidden = typeof navigator.share !== 'function';
    $('edit').hidden = received;
    $('again').textContent = received ? 'Make your own card' : 'Make another card';
    $('shareHead').textContent = received ? 'Pass the light on' : 'Send it to someone';
    c.classList.remove('reveal');
    void c.offsetWidth;
    c.classList.add('reveal');
  }
  $('edit').addEventListener('click', () => show('create'));
  $('again').addEventListener('click', () => {
    clearHash();
    $('to').value = '';
    suggest(true);
    show('create');
  });

  // Opening a shared link: validate, then render, or explain what went wrong.
  function route() {
    if (!location.hash.startsWith('#c=')) return;
    const token = location.hash.slice(3);
    if (token === lastEnc) return;
    const d = Codec.decode(token);
    if (!d) {
      $('notice').textContent = 'That link looks incomplete or damaged, so the card could not be opened. You can make a new one instead.';
      show('welcome');
      return;
    }
    render(d, true);
    show('card');
  }
  addEventListener('hashchange', route);
  route();

  // ---- Sharing ----
  const plain = d => {
    const t = T[d.l];
    return [t.title, d.n ? t.dear + d.n + ',' : '', d.m, d.f ? '— ' + d.f : ''].filter(Boolean).join('\n\n');
  };
  async function copy(text, el, what) {
    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); ok = true; }
    } catch (e) { /* clipboard blocked: fall back to manual copy below */ }
    if (!ok) {
      el.hidden = false;
      el.value = text;
      el.focus();
      el.select();
      try { el.setSelectionRange(0, text.length); ok = document.execCommand('copy'); } catch (e) { ok = false; }
    }
    say(ok ? what + ' copied.' : 'Couldn’t copy automatically. The text is selected in the box: copy it with Ctrl+C, or press and hold.');
  }
  $('copyLink').addEventListener('click', () => copy(location.href, $('url'), 'Link'));
  $('copyText').addEventListener('click', () => copy(plain(current), $('manual'), 'Greeting text'));
  $('native').addEventListener('click', async () => {
    try {
      await navigator.share({ title: T[current.l].title, text: T[current.l].share, url: location.href });
      say('Shared from your device’s share menu.');
    } catch (e) {
      say(e && e.name === 'AbortError' ? 'Sharing cancelled.' : 'Couldn’t open the share menu. Use “Copy link” instead.');
    }
  });

  // ---- Optional fireworks: off by default, capped, paused when hidden ----
  const MAX = 300, COL = ['#f6c04a', '#f29a1f', '#ff7a5c', '#ffd9a0', '#9fd8ff', '#d8a0ff'];
  function size() {
    const d = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = innerWidth * d;
    cv.height = innerHeight * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  function burst() {
    const x = innerWidth * (.15 + Math.random() * .7), y = innerHeight * (.1 + Math.random() * .35);
    const c = COL[Math.random() * COL.length | 0];
    for (let i = 0; i < 36 && parts.length < MAX; i++) {
      const a = i / 36 * 6.283, s = 1.2 + Math.random() * 1.6;
      parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, l: 1, c });
    }
  }
  function frame() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.x += p.vx; p.y += p.vy; p.vy += .03; p.vx *= .99; p.l -= .012;
      if (p.l <= 0) { parts.splice(i, 1); continue; }
      ctx.globalAlpha = p.l;
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, 6.283);
      ctx.fill();
    }
    raf = parts.length || fwOn ? requestAnimationFrame(frame) : 0;
  }
  const kick = () => { if (!raf && !document.hidden) raf = requestAnimationFrame(frame); };
  function fx(on) {
    if (on && reduced()) { say('Fireworks are off because your device is set to reduce motion.'); return; }
    if (on && !ctx) {
      ctx = cv.getContext && cv.getContext('2d');
      if (!ctx) { say('Fireworks aren’t supported on this device.'); return; }
    }
    fwOn = on;
    $('fw').setAttribute('aria-pressed', on);
    $('fw').textContent = on ? 'Fireworks: on' : 'Fireworks: off';
    clearInterval(timer);
    if (on) {
      size();
      burst();
      timer = setInterval(() => { if (!document.hidden) { burst(); kick(); } }, 1500);
      kick();
    }
  }
  $('fw').addEventListener('click', () => fx(!fwOn));
  addEventListener('resize', () => { if (ctx) size(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else kick();
  });
})();
