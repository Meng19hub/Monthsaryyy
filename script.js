/* ==========================================================================
   ✏️  EDIT ME — everything personal lives in this one object
   ========================================================================== */
const CONFIG = {
  title:     "Happy Monthsary, baby!",
  subtitle:  "wanna see my gift?",
  yesLabel:  "YES LOVIE",
  noLabel:   "NO THANKS",
  sadText:   "u sure, baby? i'm sure you'll love it :(",

  menuTitle:  "pick and click !",
  menuFooter: "i hope you'll love them, baby",

  /* photo page ---------------------------------------------------------- */
  photoHeading: "ME|WHEN:",          // shown vertically; "|" makes a gap
  // order: top-left, top-right, middle, bottom-left, bottom-right
  captions: ["asar moko", "busy ikaw", "compliment moko", "u make lambing", "u reply so tagal"],
  // Optional: pre-load photos by URL / relative path (e.g. "img/us1.jpg").
  // Leave empty to use the tap-to-upload slots (saved in this browser).
  photos: {
    strip:   [],   // up to 2  (the two frames on the left)
    circles: []    // up to 5  (matches the captions above)
  },

  /* letter -------------------------------------------------------------- */
  letterTitle: "happy monthsary, lovie!",
  letter:
    "another month has passed and i'm beyond grateful that i get to spend it with you. " +
    "things aren't always perfect, but what matters most is that we always choose each other in the end. " +
    "you've shown me love in ways i never thought i deserved, and that makes me feel so lucky to have you. " +
    "i love how you make me laugh, how you understand me even in silence, and how you remind me that i'm never alone. " +
    "thank you for staying, for trying, and for loving me through both the good and tough days. " +
    "you're my comfort, my safe place, and my partner in everything. " +
    "i'm so proud of us, of how far we've come, and i know there's still so much more to look forward to together. " +
    "no matter what, i'll keep choosing you every single day. " +
    "i love you endlessly, and i'll never stop saying it. cheers to more months and years with you, my love.",
  signature: "- ur baby",

  /* flowers + song ------------------------------------------------------ */
  flowersTitle: ["flowers!", "and a song 4 you"],
  // Add your own song(s): put the mp3 next to this file and list it here, e.g.
  //   songs: [{ title: "Your Song", artist: "Artist", src: "song.mp3" }]
  // If empty, a gentle music-box lullaby is generated in the browser.
  // (You can also tap the “+” on the player to add a song from your device.)
  songs: []
};

/* ==========================================================================
   Helpers
   ========================================================================== */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ==========================================================================
   Music-box synth (original melody, generated in-browser -> WAV blob)
   ========================================================================== */
function makeMusicBox() {
  const sr = 16000, bpm = 68, beat = 60 / bpm, barBeats = 4;
  const passes = 2;                                   // play the 8-bar phrase twice
  const chords = [
    [48,55,59,64], [45,55,60,64], [41,57,60,64], [43,55,59,62],   // C  Am7  Fmaj7  G
    [40,55,59,62], [45,55,60,64], [41,57,60,64], [43,55,59,62]    // Em7 Am7 Fmaj7  G
  ];
  const melody = [
    [[0,76],[1.5,74],[2,72],[3,74]],
    [[0,76],[1,79],[2.5,76],[3,74]],
    [[0,72],[1.5,76],[2,77],[3,76]],
    [[0,74],[2,71],[3,74]],
    [[0,76],[1.5,79],[2,81],[3,79]],
    [[0,76],[1,72],[2,76],[3,74]],
    [[0,72],[1,77],[2,76],[3,72]],
    [[0,74],[1.5,71],[2,72]]
  ];
  const bars = chords.length * passes;
  const dur = bars * barBeats * beat + 3.5;
  const N = Math.floor(sr * dur);
  const out = new Float32Array(N);
  const TAU = Math.PI * 2;
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);

  function note(t, m, vel, len) {
    const f = hz(m), start = Math.floor(t * sr), L = Math.min(Math.floor(len * sr), N - start);
    if (L <= 0) return;
    const d1 = Math.exp(-2.4 / sr), d2 = Math.exp(-5.5 / sr), d3 = Math.exp(-10 / sr);
    let e1 = 1, e2 = 1, e3 = 1;
    for (let i = 0; i < L; i++) {
      const x = i / sr;
      const atk = x < 0.004 ? x / 0.004 : 1;
      const s = Math.sin(TAU * f * x) * e1
              + 0.34 * Math.sin(TAU * f * 2 * x) * e2
              + 0.16 * Math.sin(TAU * f * 4.1 * x) * e3;
      out[start + i] += s * atk * vel;
      e1 *= d1; e2 *= d2; e3 *= d3;
    }
  }

  for (let b = 0; b < bars; b++) {
    const ci = b % chords.length, ch = chords[ci], t0 = b * barBeats * beat;
    const v = 0.17 * (b >= chords.length ? 1.06 : 1);
    note(t0, ch[0] - 12, v * 1.3, 3.2);                       // bass on 1
    note(t0 + 2 * beat, ch[1] - 12, v * 0.9, 2.4);            // bass on 3
    const pat = [1, 2, 3, 2, 1, 2, 3, 2];
    pat.forEach((p, k) => note(t0 + k * beat / 2, ch[p], v * 0.55, 1.6));
    melody[ci].forEach(([bt, m]) => note(t0 + bt * beat, m, v * 0.85, 2.4));
  }

  // soft echo for a bit of room
  const dA = Math.floor(0.31 * sr), dB = Math.floor(0.53 * sr);
  for (let i = dA; i < N; i++) out[i] += 0.22 * out[i - dA] + (i >= dB ? 0.12 * out[i - dB] : 0);

  // fade tail + normalise
  let peak = 0;
  for (let i = 0; i < N; i++) { const a = Math.abs(out[i]); if (a > peak) peak = a; }
  const g = peak ? 0.85 / peak : 1, fade = Math.floor(sr * 1.2);
  for (let i = 0; i < N; i++) {
    const r = N - i; out[i] *= g * (r < fade ? r / fade : 1);
  }

  // encode 16-bit mono WAV
  const buf = new ArrayBuffer(44 + N * 2), v = new DataView(buf);
  const wr = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  wr(0, 'RIFF'); v.setUint32(4, 36 + N * 2, true); wr(8, 'WAVE'); wr(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  wr(36, 'data'); v.setUint32(40, N * 2, true);
  for (let i = 0; i < N; i++) {
    const s = Math.max(-1, Math.min(1, out[i]));
    v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
}

/* ==========================================================================
   App
   ========================================================================== */
(() => {
  'use strict';

  /* ---------- text from CONFIG ---------- */
  document.title = CONFIG.title;
  $('#homeTitle').textContent  = CONFIG.title;
  $('#homeSub').textContent    = CONFIG.subtitle;
  $('#yesBtn').textContent     = CONFIG.yesLabel;
  $('#noBtn').textContent      = CONFIG.noLabel;
  $('#sadText').textContent    = CONFIG.sadText;
  $('#menuTitle').textContent  = CONFIG.menuTitle;
  $('#menuFooter').textContent = CONFIG.menuFooter;
  $('#letterTitle').textContent= CONFIG.letterTitle;
  $('#letterBody').textContent = CONFIG.letter;
  $('#letterSig').textContent  = CONFIG.signature;
  $('#fTitle').innerHTML = CONFIG.flowersTitle.map(t => `<span>${esc(t)}</span>`).join('');

  /* vertical heading letters ("|" = gap) */
  $('#mewhen').setAttribute('aria-label', CONFIG.photoHeading.replace('|', ' '));
  $('#mewhen').innerHTML = Array.from(CONFIG.photoHeading)
    .map(ch => ch === '|' ? '<span class="gap"></span>' : `<span aria-hidden="true">${esc(ch)}</span>`).join('');

  /* ---------- screen navigation ---------- */
  const order = ['home', 'sad', 'menu', 'photos', 'letter', 'flowers'];
  const screens = Object.fromEntries(order.map(n => [n, document.getElementById(n)]));
  let current = 'home';

  function go(name) {
    if (!screens[name] || name === current) return;
    const from = current;
    screens[from].classList.remove('active');
    screens[from].inert = true;
    screens[name].classList.add('active');
    screens[name].inert = false;
    current = name;
    screens[name].scrollTop = 0;
    if (from === 'flowers') player.pause();
    if (name === 'flowers') player.start();
    const f = screens[name].querySelector('button');
    if (f) f.focus({ preventScroll: true });
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-go]');
    if (b) go(b.dataset.go);
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (['photos', 'letter', 'flowers'].includes(current)) go('menu');
    else if (['menu', 'sad'].includes(current)) go('home');
  });

  /* ---------- photos ---------- */
  const KEY = 'monthsary-photos-v1';
  const CIRCLES = [
    { cx: 72,  cy: 66,  r: 44, tx: 150, ty: 24,  arrow: 'M120 20 Q108 22 106 34' },
    { cx: 250, cy: 60,  r: 40, tx: 178, ty: 60,  arrow: 'M188 47 Q196 32 210 33' },
    { cx: 160, cy: 128, r: 42, tx: 168, ty: 208, arrow: 'M126 202 Q116 186 134 174' },
    { cx: 52,  cy: 182, r: 44, tx: 82,  ty: 250, arrow: 'M36 246 Q16 244 24 226' },
    { cx: 268, cy: 190, r: 38, tx: 252, ty: 128, arrow: 'M234 132 Q226 148 234 160' }
  ];
  const photos = Array(7).fill(null);
  const cfgStrip = (CONFIG.photos && CONFIG.photos.strip) || [];
  const cfgCirc  = (CONFIG.photos && CONFIG.photos.circles) || [];
  photos[0] = cfgStrip[0] || null;
  photos[1] = cfgStrip[1] || null;
  for (let i = 0; i < 5; i++) photos[2 + i] = cfgCirc[i] || null;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (Array.isArray(saved)) saved.forEach((u, i) => { if (i < 7 && u) photos[i] = u; });
  } catch (_) { /* storage unavailable: fine */ }

  function savePhotos() {
    try {
      localStorage.setItem(KEY, JSON.stringify(photos.map(u => (u && u.startsWith('data:')) ? u : null)));
    } catch (_) {
      toast("couldn't save that photo on this device, but it'll show for now");
    }
  }

  function placeholder(i) {
    const h = [350, 210, 20, 280, 170, 40, 320][i % 7];
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h},26%,86%)"/><stop offset="1" stop-color="hsl(${h},22%,70%)"/></linearGradient></defs>` +
      `<rect width="200" height="200" fill="url(#g)"/>` +
      `<circle cx="100" cy="82" r="30" fill="#fff" fill-opacity=".55"/>` +
      `<path d="M40 200c0-42 27-64 60-64s60 22 60 64z" fill="#fff" fill-opacity=".55"/>` +
      `<g transform="translate(150 150)"><circle r="15" fill="#fff" fill-opacity=".9"/>` +
      `<path d="M0-7v14M-7 0h14" stroke="#555" stroke-width="2.6" stroke-linecap="round"/></g></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  /* build the circle cluster */
  (function buildCluster() {
    let defs = '<defs>' +
      '<marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">' +
      '<path d="M1.5 1.5 L8.5 5 L1.5 8.5" fill="none" stroke="#2a2a2e" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker>' +
      '<filter id="sh" x="-25%" y="-25%" width="150%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity=".26"/></filter>';
    CIRCLES.forEach((c, i) => { defs += `<clipPath id="clip${i}"><circle cx="${c.cx}" cy="${c.cy}" r="${c.r}"/></clipPath>`; });
    defs += '</defs>';
    let body = '';
    CIRCLES.forEach((c, i) => {
      body += `<path d="${c.arrow}" class="arrow" marker-end="url(#ah)"/>`;
      body += `<text x="${c.tx}" y="${c.ty}" text-anchor="middle" class="cap">${esc(CONFIG.captions[i] || '')}</text>`;
      body += `<g class="slot" data-slot="${i + 2}" tabindex="0" role="button" aria-label="Change photo ${i + 3}" filter="url(#sh)">` +
        `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r + 7}" class="ring"/>` +
        `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r + 3}" class="ring2"/>` +
        `<image id="img${i}" x="${c.cx - c.r}" y="${c.cy - c.r}" width="${c.r * 2}" height="${c.r * 2}" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip${i})"/>` +
        `</g>`;
    });
    $('#cluster').innerHTML = defs + body;
  })();

  const frames = $$('.frame');
  function applyPhoto(i) {
    const src = photos[i] || placeholder(i);
    if (i < 2) frames[i].style.backgroundImage = `url("${src}")`;
    else $('#img' + (i - 2)).setAttribute('href', src);
  }
  for (let i = 0; i < 7; i++) applyPhoto(i);

  /* pick + shrink + store a photo */
  const photoInput = $('#photoInput');
  let pendingSlot = null;

  function fileToDataURL(file, max = 900) {
    return new Promise(resolve => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.width * s));
        c.height = Math.max(1, Math.round(img.height * s));
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  }

  function openPicker(el) {
    const slot = el && el.closest('[data-slot]');
    if (!slot) return;
    pendingSlot = +slot.dataset.slot;
    photoInput.value = '';
    photoInput.click();
  }
  screens.photos.addEventListener('click', e => openPicker(e.target));
  screens.photos.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('[data-slot]')) {
      e.preventDefault(); openPicker(e.target);
    }
  });
  photoInput.addEventListener('change', async () => {
    const f = photoInput.files && photoInput.files[0];
    if (!f || pendingSlot === null) return;
    const data = await fileToDataURL(f);
    if (!data) { toast("hmm, couldn't read that image"); return; }
    photos[pendingSlot] = data;
    applyPhoto(pendingSlot);
    savePhotos();
    pendingSlot = null;
  });

  /* ---------- player ---------- */
  const player = (() => {
    const audio = new Audio();
    audio.preload = 'auto';
    const el = {
      title: $('#pTitle'), artist: $('#pArtist'), seek: $('#pSeek'), cur: $('#pCur'), dur: $('#pDur'),
      play: $('#pPlay'), icon: $('#pPlayIcon'), prev: $('#pPrev'), next: $('#pNext'),
      shuffle: $('#pShuffle'), repeat: $('#pRepeat'), add: $('#pAdd'),
      mute: $('#pMute'), muteIcon: $('#pMuteIcon'), share: $('#pShare'), file: $('#songInput')
    };
    const ICON_PLAY  = '<path d="M6 4l14 8-14 8z"/>';
    const ICON_PAUSE = '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>';
    const ICON_VOL   = '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/>';
    const ICON_MUTE  = '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/>';

    let tracks = [], idx = 0, shuffle = false, repeat = false, seeking = false;

    const fmt = s => {
      if (!isFinite(s) || s < 0) s = 0;
      s = Math.floor(s);
      return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    };

    function ensureTracks() {
      if (tracks.length) return;
      const custom = (CONFIG.songs || []).filter(s => s && s.src);
      tracks = custom.length
        ? custom.map(s => ({ title: s.title || 'Untitled', artist: s.artist || '', src: s.src }))
        : [{ title: 'Our Little Song', artist: 'made for you, baby', src: makeMusicBox() }];
      load(0, false);
    }

    function load(i, autoplay) {
      idx = ((i % tracks.length) + tracks.length) % tracks.length;
      const t = tracks[idx];
      audio.src = t.src;
      el.title.textContent = t.title;
      el.artist.textContent = t.artist;
      paintProgress(0);
      el.cur.textContent = '0:00';
      el.dur.textContent = '-0:00';
      if (autoplay) play();
    }

    function play() {
      ensureTracks();
      const p = audio.play();
      if (p && p.catch) p.catch(() => setIcon(false));
    }
    function pause() { audio.pause(); }
    function setIcon(playing) {
      el.icon.innerHTML = playing ? ICON_PAUSE : ICON_PLAY;
      el.play.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    }
    function paintProgress(p) {
      el.seek.value = Math.round(p * 1000);
      el.seek.style.setProperty('--p', (p * 100) + '%');
    }
    function nextIndex() {
      if (tracks.length < 2) return idx;
      if (!shuffle) return idx + 1;
      let n; do { n = Math.floor(Math.random() * tracks.length); } while (n === idx);
      return n;
    }

    audio.addEventListener('play',  () => setIcon(true));
    audio.addEventListener('pause', () => setIcon(false));
    audio.addEventListener('loadedmetadata', () => { el.dur.textContent = '-' + fmt(audio.duration); });
    audio.addEventListener('timeupdate', () => {
      const d = audio.duration;
      if (!seeking) paintProgress(d ? audio.currentTime / d : 0);
      el.cur.textContent = fmt(audio.currentTime);
      el.dur.textContent = '-' + fmt(d - audio.currentTime);
    });
    audio.addEventListener('ended', () => {
      if (repeat) { audio.currentTime = 0; play(); }
      else if (tracks.length > 1) load(nextIndex(), true);
      else { audio.currentTime = 0; paintProgress(0); setIcon(false); }
    });
    audio.addEventListener('error', () => { if (audio.src) toast("couldn't play that song"); });

    el.play.addEventListener('click', () => { audio.paused ? play() : pause(); });
    el.prev.addEventListener('click', () => {
      ensureTracks();
      if (audio.currentTime > 3 || tracks.length < 2) { audio.currentTime = 0; }
      else load(idx - 1, !audio.paused);
    });
    el.next.addEventListener('click', () => {
      ensureTracks();
      if (tracks.length < 2) { audio.currentTime = 0; return; }
      load(nextIndex(), !audio.paused);
    });
    el.shuffle.addEventListener('click', () => {
      shuffle = !shuffle;
      el.shuffle.classList.toggle('on', shuffle);
      el.shuffle.setAttribute('aria-pressed', shuffle);
    });
    el.repeat.addEventListener('click', () => {
      repeat = !repeat;
      el.repeat.classList.toggle('on', repeat);
      el.repeat.setAttribute('aria-pressed', repeat);
    });

    el.seek.addEventListener('pointerdown', () => { seeking = true; });
    el.seek.addEventListener('input', () => {
      const p = el.seek.value / 1000;
      el.seek.style.setProperty('--p', (p * 100) + '%');
      if (isFinite(audio.duration)) {
        audio.currentTime = p * audio.duration;
        el.cur.textContent = fmt(audio.currentTime);
      }
    });
    const endSeek = () => { seeking = false; };
    el.seek.addEventListener('change', endSeek);
    window.addEventListener('pointerup', endSeek);

    el.mute.addEventListener('click', () => {
      audio.muted = !audio.muted;
      el.muteIcon.innerHTML = audio.muted ? ICON_MUTE : ICON_VOL;
      el.mute.setAttribute('aria-label', audio.muted ? 'Unmute' : 'Mute');
    });

    el.share.addEventListener('click', async () => {
      const url = location.href.split('#')[0];
      try {
        if (navigator.share) { await navigator.share({ title: document.title, url }); return; }
        await navigator.clipboard.writeText(url);
        toast('link copied 💌');
      } catch (_) { /* user cancelled or clipboard blocked */ }
    });

    el.add.addEventListener('click', () => { el.file.value = ''; el.file.click(); });
    el.file.addEventListener('change', () => {
      const files = Array.from(el.file.files || []).filter(f => f.type.startsWith('audio/') || /\.(mp3|m4a|wav|ogg|aac|flac)$/i.test(f.name));
      if (!files.length) { toast('please pick an audio file'); return; }
      ensureTracks();
      const firstNew = tracks.length;
      files.forEach(f => tracks.push({
        title: f.name.replace(/\.[^.]+$/, ''), artist: 'your song', src: URL.createObjectURL(f)
      }));
      load(firstNew, true);
    });

    setIcon(false);

    return {
      warm() { ensureTracks(); },
      start() { ensureTracks(); if (audio.ended) audio.currentTime = 0; play(); },
      pause
    };
  })();

  /* warm up the generated song shortly after load so the first tap is instant */
  window.addEventListener('load', () => setTimeout(() => { try { player.warm(); } catch (_) {} }, 300));
})();