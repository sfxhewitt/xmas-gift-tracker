/* Christmas Gift Tracker — pure client-side, data in localStorage. */
(function () {
  'use strict';

  var KEY = 'xmasGiftTracker.v1';
  var BANNED = /foot\s*ball|soccer|fifa|ea\s*sports?\s*fc|\bea fc\b|premier league/i;
  var STATUSES = ['Idea', 'Saved', 'Bought', 'Wrapped'];
  var PRI = { 1: '🔥', 2: '⭐', 3: '🙂' };
  var PRI_LABEL = { 1: 'Must-have', 2: 'Really want', 3: 'Nice to have' };
  var KID_COLOURS = ['var(--josh)', 'var(--jude)', 'var(--joey)', '#c084fc', '#f472b6'];

  var SHOPS = [
    { id: 'amazon', name: 'Amazon', url: function (q) { return 'https://www.amazon.co.uk/s?k=' + enc(q); }, host: /amazon\./ },
    { id: 'argos', name: 'Argos', url: function (q) { return 'https://www.argos.co.uk/search/' + enc(q).replace(/%20/g, '-') + '/'; }, host: /argos\./ },
    { id: 'smyths', name: 'Smyths', url: function (q) { return 'https://www.smythstoys.com/uk/en-gb/search/?text=' + enc(q); }, host: /smythstoys\./ },
    { id: 'johnlewis', name: 'John Lewis', url: function (q) { return 'https://www.johnlewis.com/search?search-term=' + enc(q); }, host: /johnlewis\./ },
    { id: 'currys', name: 'Currys', url: function (q) { return 'https://www.currys.co.uk/search?q=' + enc(q); }, host: /currys\./ },
    { id: 'ebay', name: 'eBay UK', url: function (q) { return 'https://www.ebay.co.uk/sch/i.html?_nkw=' + enc(q); }, host: /ebay\./ },
    { id: 'google', name: 'Google Shopping', url: function (q) { return 'https://www.google.co.uk/search?tbm=shop&gl=uk&hl=en-GB&q=' + enc(q); }, host: /google\./ }
  ];
  var EXTRA_HOSTS = [[/very\.co\.uk/, 'Very'], [/game\.co\.uk/, 'GAME'], [/scan\.co\.uk/, 'Scan'], [/overclockers/, 'Overclockers UK'],
    [/ikea\./, 'IKEA'], [/hobbycraft/, 'Hobbycraft'], [/waterstones/, 'Waterstones'], [/thetoyshop|entertainer/, 'The Entertainer'],
    [/sportsdirect/, 'Sports Direct'], [/jdsports/, 'JD Sports'], [/lego\.com/, 'LEGO'], [/pokemoncenter/, 'Pokémon Center'],
    [/hamleys/, 'Hamleys'], [/next\.co\.uk/, 'Next'], [/marksandspencer/, 'M&S'], [/tesco/, 'Tesco'], [/asda/, 'Asda'],
    [/boots\.com/, 'Boots'], [/hmv/, 'HMV'], [/zavvi/, 'Zavvi'], [/totalcards/, 'Total Cards'], [/wilko/, 'Wilko']];

  // Interest synonyms -> catalogue tags
  var SYN = {
    gaming: ['gaming', 'games', 'video games', 'videogames', 'gamer', 'console', 'switch', 'nintendo', 'xbox', 'playstation', 'ps5', 'minecraft', 'roblox', 'fortnite', 'mario', 'sonic'],
    pc: ['pc', 'pc gaming', 'computer', 'computers', 'rtx', 'steam', 'streaming', 'streamer', 'twitch', 'youtube', 'coding', 'programming'],
    desk: ['desk', 'desk setup', 'setup', 'desk mat', 'gaming setup', 'bedroom', 'room decor', 'rgb'],
    pokemon: ['pokemon', 'pokémon', 'pikachu', 'tcg', 'trading cards', 'cards', 'card collecting'],
    lego: ['lego', 'duplo', 'bricks'],
    building: ['building', 'construction', 'making', 'engineering', 'model making', 'models'],
    books: ['books', 'book', 'stories', 'manga', 'comics', 'comic', 'graphic novels'],
    reading: ['reading', 'read', 'reader'],
    sport: ['sport', 'sports', 'rugby', 'basketball', 'tennis', 'swimming', 'cricket', 'running', 'boxing', 'martial arts', 'karate', 'skating', 'skateboarding', 'skateboard', 'cycling', 'bike', 'biking', 'fitness', 'gym', 'climbing', 'gymnastics', 'dance', 'dancing', 'golf', 'badminton', 'table tennis', 'trampoline', 'scooter'],
    art: ['art', 'drawing', 'painting', 'colouring', 'coloring', 'sketching', 'design', 'photography'],
    crafts: ['crafts', 'craft', 'making things', 'slime', 'beads', 'diy'],
    tech: ['tech', 'technology', 'gadgets', 'gadget', 'electronics', 'robots', 'robotics', 'drones', 'headphones'],
    outdoors: ['outdoors', 'outdoor', 'nature', 'camping', 'garden', 'adventure', 'exploring', 'walking', 'hiking'],
    music: ['music', 'singing', 'guitar', 'piano', 'drums', 'instruments', 'band', 'dj'],
    science: ['science', 'experiments', 'space', 'astronomy', 'chemistry', 'dinosaurs', 'nature', 'stem', 'maths'],
    animals: ['animals', 'animal', 'pets', 'dogs', 'cats', 'horses', 'dinosaurs', 'wildlife', 'plush', 'soft toys', 'teddies'],
    vehicles: ['vehicles', 'cars', 'trains', 'trucks', 'racing', 'planes', 'tractors', 'f1', 'formula 1', 'motorsport'],
    cooking: ['cooking', 'baking', 'food', 'sweets', 'chocolate'],
    fashion: ['fashion', 'clothes', 'trainers', 'sneakers', 'makeup', 'jewellery', 'style', 'hoodies'],
    puzzles: ['puzzles', 'puzzle', 'board games', 'boardgames', 'card games', 'jigsaws', 'rubiks', 'brain teasers', 'games night'],
    movies: ['movies', 'films', 'tv', 'marvel', 'star wars', 'disney', 'harry potter', 'anime', 'superheroes', 'bluey', 'paw patrol'],
    collecting: ['collecting', 'collectibles', 'figures', 'funko', 'squishmallows'],
    baby: ['baby', 'toddler', 'sensory']
  };
  var TAG_LABELS = { pc: 'PC', desk: 'desk setup', pokemon: 'Pokémon', lego: 'LEGO' };
  var SUGGESTED_INTERESTS = ['Gaming', 'PC gaming', 'Pokémon cards', 'LEGO', 'Books', 'Art', 'Tech', 'Outdoors', 'Music', 'Science', 'Animals', 'Cars', 'Swimming', 'Skateboarding', 'Basketball', 'Rugby', 'Crafts', 'Baking', 'Puzzles', 'Marvel', 'Minecraft', 'Fashion'];

  // ---------- helpers
  function enc(s) { return encodeURIComponent(String(s).trim()); }
  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim(); }
  function num(v) { var n = parseFloat(v); return isFinite(n) && n >= 0 ? n : null; }
  function gbp(n, approx) {
    if (n == null || n === '') return '—';
    var neg = n < 0; n = Math.abs(n);
    var s = (neg ? '−' : '') + '£' + Number(n).toLocaleString('en-GB', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
    return approx ? '~' + s : s;
  }
  function safeUrl(u) { try { var x = new URL(u); return /^https?:$/.test(x.protocol) ? x.href : ''; } catch (e) { return ''; } }
  function shopFromUrl(u) {
    var url = safeUrl(u); if (!url) return '';
    var h = new URL(url).hostname;
    for (var i = 0; i < SHOPS.length; i++) if (SHOPS[i].host.test(h)) return SHOPS[i].name === 'Google Shopping' ? '' : SHOPS[i].name;
    for (var j = 0; j < EXTRA_HOSTS.length; j++) if (EXTRA_HOSTS[j][0].test(h)) return EXTRA_HOSTS[j][1];
    return h.replace(/^www\./, '');
  }
  function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('show'); }, 2200); }

  // ---------- state
  function defaultState() {
    var josh = uid() + 'j', jude = uid() + 'u', joey = uid() + 'o';
    return {
      version: 1,
      kids: [
        { id: josh, name: 'Joshua', nick: 'Josh', age: '', budget: '', interests: ['PC gaming', 'Gaming', 'Desk setup', 'Tech'],
          notes: 'Plays PC games on an RTX 5090 gaming PC with an ASUS 32" 4K 144Hz monitor (PG32UQ). Wants a white desk and a desk mat for Christmas.' },
        { id: jude, name: 'Jude', nick: '', age: '', budget: '', interests: [], notes: '' },
        { id: joey, name: 'Joey', nick: '', age: '', budget: '', interests: [], notes: '' }
      ],
      items: [
        { id: uid(), kidId: josh, name: 'White desk', link: '', price: null, shop: '', notes: 'Asked for this for Christmas. Needs room for a 32" monitor.', priority: 1, status: 'Saved', created: Date.now() },
        { id: uid(), kidId: josh, name: 'Desk mat (XXL)', link: '', price: null, shop: '', notes: 'Asked for this for Christmas. White would match the desk.', priority: 1, status: 'Saved', created: Date.now() + 1 }
      ],
      dismissed: {},
      settings: { theme: '', tab: '', cash: '' }
    };
  }
  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && Array.isArray(s.kids) && Array.isArray(s.items)) return fix(s); } catch (e) {}
    return defaultState();
  }
  function fix(s) {
    s.dismissed = s.dismissed || {}; s.settings = s.settings || {};
    s.items.forEach(function (i) { i.priority = +i.priority || 2; if (STATUSES.indexOf(i.status) < 0) i.status = 'Saved'; });
    s.kids.forEach(function (k) { k.interests = Array.isArray(k.interests) ? k.interests : []; });
    return s;
  }
  var state = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { toast('⚠️ Could not save (storage full or private mode)'); } }

  var ui = { tab: state.settings.tab || state.kids[0].id, filter: {}, ideaShow: {}, ideaTag: {}, ideaMax: {}, shuffle: {}, profileOpen: {} };

  // ---------- catalogue
  var CATALOGUE = (window.GIFT_CATALOGUE || []).map(function (r, i) {
    return { id: 'c' + i, name: r[0], tags: r[1].split(' '), min: r[2], max: r[3], price: r[4], q: r[5] || r[0] };
  }).filter(function (c) { return !BANNED.test(c.name + ' ' + c.q + ' ' + c.tags.join(' ')); });

  function interestToTags(interest) {
    var t = norm(interest), out = [];
    Object.keys(SYN).forEach(function (tag) {
      var hit = SYN[tag].some(function (s) {
        s = norm(s);
        return t === s || (s.length >= 3 && (' ' + t + ' ').indexOf(' ' + s + ' ') >= 0) || (t.length >= 4 && s.indexOf(t) === 0);
      });
      if (hit || t === tag) out.push(tag);
    });
    return out;
  }
  function kidTags(kid) {
    var set = {};
    kid.interests.forEach(function (i) { interestToTags(i).forEach(function (t) { set[t] = 1; }); });
    return Object.keys(set);
  }
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }

  function ideasFor(kid) {
    var age = num(kid.age), tags = kidTags(kid), words = kid.interests.map(norm);
    var savedNames = state.items.filter(function (i) { return i.kidId === kid.id; }).map(function (i) { return norm(i.name); });
    var dismissed = state.dismissed[kid.id] || [];
    var budgetLeft = budgetRemaining(kid);
    var seed = ui.shuffle[kid.id] || 0;
    var onlyTag = ui.ideaTag[kid.id] || '';
    var maxP = num(ui.ideaMax[kid.id]);
    var res = [];
    CATALOGUE.forEach(function (c) {
      if (dismissed.indexOf(c.id) >= 0 || savedNames.indexOf(norm(c.name)) >= 0) return;
      if (age != null && (age < c.min - 1 || age > c.max + 1)) return;
      if (onlyTag && c.tags.indexOf(onlyTag) < 0) return;
      if (maxP != null && c.price > maxP) return;
      var score = 0, why = [];
      var matched = c.tags.filter(function (t) { return tags.indexOf(t) >= 0; });
      score += matched.length * 10;
      var nm = norm(c.name + ' ' + c.q);
      words.forEach(function (w) { if (w.length >= 3 && nm.indexOf(w) >= 0) { score += 8; matched.push(w); } });
      if (matched.length) why.push('Matches ' + uniq(matched).map(function (t) { return TAG_LABELS[t] || t; }).join(', '));
      if (age != null) {
        if (age >= c.min && age <= c.max) { score += 3; why.push('Good for age ' + age); } else { score -= 2; why.push('Borderline for age ' + age); }
        if (c.max >= 99 && age < 8 && !matched.length) score -= 2;
      }
      if (budgetLeft != null) { if (c.price > budgetLeft) { score -= 6; why.push('Over remaining budget'); } else score += 1; }
      if (tags.length && !matched.length) score -= 5;
      if (c.tags.indexOf('baby') >= 0 && (age == null || age > 4)) score -= 4;
      score += (seed ? hash(c.id + ':' + seed) * 9 : hash(c.id) * 2);
      res.push({ c: c, score: score, why: why.join(' · '), matched: matched.length > 0 });
    });
    res.sort(function (a, b) { return b.score - a.score; });
    return res;
  }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }

  // ---------- money
  function sum(items) { return items.reduce(function (t, i) { return t + (num(i.price) || 0); }, 0); }
  function kidItems(kid) { return state.items.filter(function (i) { return i.kidId === kid.id; }); }
  function planned(items) { return items.filter(function (i) { return i.status === 'Idea' || i.status === 'Saved'; }); }
  function bought(items) { return items.filter(function (i) { return i.status === 'Bought' || i.status === 'Wrapped'; }); }
  function budgetRemaining(kid) { var b = num(kid.budget); if (b == null) return null; return b - sum(bought(kidItems(kid))); }

  // ---------- rendering
  function kidColour(kid) { return KID_COLOURS[state.kids.indexOf(kid) % KID_COLOURS.length]; }
  function kidLabel(kid) { return kid.name + (kid.nick ? ' (' + kid.nick + ')' : ''); }

  function renderTabs() {
    var html = state.kids.map(function (k) {
      return '<button class="tab" role="tab" data-tab="' + k.id + '" aria-selected="' + (ui.tab === k.id) + '"><span class="dot" style="background:' + kidColour(k) + '"></span>' + esc(k.name) + '</button>';
    }).join('');
    html += '<button class="tab" role="tab" data-tab="money" aria-selected="' + (ui.tab === 'money') + '">💷 Money</button>';
    html += '<button class="tab" role="tab" data-tab="search" aria-selected="' + (ui.tab === 'search') + '">🔎 Search shops</button>';
    $('#tabs').innerHTML = html;
  }

  function render() {
    if (ui.tab !== 'money' && ui.tab !== 'search' && !getKid(ui.tab)) ui.tab = state.kids[0].id;
    renderTabs();
    var a = document.activeElement, fk = a && a.getAttribute && a.getAttribute('data-kf'), fkid = fk && a.getAttribute('data-kid');
    var m = $('#main');
    if (ui.tab === 'money') m.innerHTML = renderMoney();
    else if (ui.tab === 'search') m.innerHTML = renderSearch();
    else m.innerHTML = renderKid(getKid(ui.tab));
    if (fk) { var re = $('[data-kf="' + fk + '"][data-kid="' + fkid + '"]'); if (re) re.focus(); }
  }
  function getKid(id) { for (var i = 0; i < state.kids.length; i++) if (state.kids[i].id === id) return state.kids[i]; return null; }

  function statBlock(kid) {
    var its = kidItems(kid), p = sum(planned(its)), b = sum(bought(its)), bud = num(kid.budget);
    var rem = bud == null ? null : bud - b, after = bud == null ? null : bud - b - p;
    var bar = '';
    if (bud) {
      var bp = Math.min(100, b / bud * 100), pp = Math.min(100 - bp, p / bud * 100);
      bar = '<div class="bar" title="Bought vs planned vs budget"><span style="width:' + bp + '%;background:var(--green)"></span><span style="width:' + pp + '%;background:var(--blue)"></span></div>';
    }
    return '<div class="stats">' +
      '<div class="stat"><div class="k">Budget</div><div class="v">' + (bud == null ? '<span class="muted">not set</span>' : gbp(bud)) + '</div></div>' +
      '<div class="stat"><div class="k">Bought</div><div class="v">' + gbp(b) + '</div></div>' +
      '<div class="stat"><div class="k">Still to buy</div><div class="v">' + gbp(p) + '</div></div>' +
      '<div class="stat"><div class="k">Budget left</div><div class="v ' + (after != null && after < 0 ? 'over' : '') + '">' + (rem == null ? '—' : gbp(rem)) + '</div>' +
      (after == null ? '' : '<div class="k ' + (after < 0 ? 'over' : '') + '">' + (after < 0 ? gbp(-after) + ' over if all bought' : gbp(after) + ' after plan') + '</div>') + '</div>' +
      '</div>' + bar;
  }

  function renderKid(kid) {
    var its = kidItems(kid), f = ui.filter[kid.id] || 'All';
    var counts = {}; STATUSES.forEach(function (s) { counts[s] = its.filter(function (i) { return i.status === s; }).length; });
    var shown = its.filter(function (i) { return f === 'All' || (f === 'To buy' ? (i.status === 'Idea' || i.status === 'Saved') : i.status === f); })
      .sort(function (a, b) { return STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status) || a.priority - b.priority || (a.created || 0) - (b.created || 0); });
    var needsProfile = !kid.interests.length || kid.age === '';
    var h = '';
    h += '<section class="card"><div class="kid-head"><div class="avatar" style="background:' + kidColour(kid) + '">' + esc((kid.name || '?')[0]) + '</div>' +
      '<div><h2>' + esc(kidLabel(kid)) + '</h2><div class="muted small">' + (kid.age !== '' ? 'Age ' + esc(kid.age) + ' · ' : '') + its.length + ' item' + (its.length === 1 ? '' : 's') + ' · ' + (counts.Bought + counts.Wrapped) + ' bought</div></div></div>' +
      statBlock(kid) + '</section>';

    // profile
    h += '<section class="card"><details data-profile="' + kid.id + '" ' + (needsProfile || ui.profileOpen[kid.id] ? 'open' : '') + '><summary>👤 Profile: age, interests, budget</summary>' +
      '<div class="row3">' +
      '<label>Name<input data-kf="name" data-kid="' + kid.id + '" value="' + esc(kid.name) + '" maxlength="30"></label>' +
      '<label>Age<input data-kf="age" data-kid="' + kid.id + '" type="number" inputmode="numeric" min="0" max="99" placeholder="Add age" value="' + esc(kid.age) + '"></label>' +
      '<label>Budget (£)<input data-kf="budget" data-kid="' + kid.id + '" type="number" inputmode="decimal" min="0" step="1" placeholder="e.g. 250" value="' + esc(kid.budget) + '"></label>' +
      '</div>' +
      '<label>Interests <span class="small">(drives the idea finder)</span></label>' +
      '<div class="tags">' + kid.interests.map(function (t, i) { return '<span class="tag">' + esc(t) + '<button data-act="rmInterest" data-kid="' + kid.id + '" data-i="' + i + '" aria-label="Remove ' + esc(t) + '">✕</button></span>'; }).join('') + '</div>' +
      '<form class="searchbox" data-act="addInterest" data-kid="' + kid.id + '" style="margin-top:8px"><input name="interest" placeholder="Add an interest, e.g. Minecraft, art, swimming" maxlength="40"><button class="btn sm">Add</button></form>' +
      '<div class="tags">' + SUGGESTED_INTERESTS.filter(function (s) { return kid.interests.map(norm).indexOf(norm(s)) < 0; }).slice(0, 14).map(function (s) {
        return '<span class="tag suggest" data-act="quickInterest" data-kid="' + kid.id + '" data-v="' + esc(s) + '">+ ' + esc(s) + '</span>'; }).join('') + '</div>' +
      '<label>Notes<textarea data-kf="notes" data-kid="' + kid.id + '" rows="2" maxlength="600" placeholder="Sizes, wishes, things they already have…">' + esc(kid.notes) + '</textarea></label>' +
      '</details></section>';

    // list
    h += '<section class="card"><h2>🎁 Gift list <span class="right"><button class="btn sm primary" data-act="addItem" data-kid="' + kid.id + '">+ Add item</button></span></h2>' +
      '<div class="filters">' + ['All', 'To buy'].concat(STATUSES).map(function (s) {
        var c = s === 'All' ? its.length : s === 'To buy' ? counts.Idea + counts.Saved : counts[s];
        return '<button class="chip ' + (f === s ? 'on' : '') + '" data-act="filter" data-kid="' + kid.id + '" data-v="' + s + '">' + s + ' (' + c + ')</button>';
      }).join('') + '</div>' +
      '<div class="items">' + (shown.length ? shown.map(function (i) { return itemRow(i, false); }).join('') :
        '<div class="empty">Nothing here yet. Tap <b>Find ideas</b> below or <b>+ Add item</b> to paste a link.</div>') + '</div></section>';

    // ideas
    var all = ideasFor(kid), n = ui.ideaShow[kid.id] || 12, list = all.slice(0, n);
    var tags = kidTags(kid);
    h += '<section class="card" id="ideasCard"><h2>✨ Find ideas <span class="right"><button class="btn sm" data-act="shuffle" data-kid="' + kid.id + '">🔀 Shuffle</button></span></h2>' +
      '<p class="muted small" style="margin:0">' + (tags.length || kid.age !== '' ? 'Picked from ' + CATALOGUE.length + ' curated ideas using ' + esc(kid.name) + '’s ' + [kid.age !== '' ? 'age' : '', tags.length ? 'interests' : ''].filter(Boolean).join(' and ') + (num(kid.budget) != null ? ' and budget' : '') + '. Updates automatically when the profile changes.' :
        'Add an age and a few interests above and these ideas tailor themselves automatically.') + ' Prices are rough guides; tap a shop to see live prices.</p>' +
      '<div class="row2" style="margin-top:6px"><label>Category<select data-act="ideaTag" data-kid="' + kid.id + '"><option value="">All categories</option>' +
      uniq(tags.concat(['gaming', 'pc', 'desk', 'pokemon', 'lego', 'books', 'sport', 'art', 'crafts', 'tech', 'outdoors', 'music', 'science', 'animals', 'vehicles', 'puzzles', 'movies', 'fashion', 'cooking', 'collecting']))
        .map(function (t) { return '<option value="' + t + '"' + (ui.ideaTag[kid.id] === t ? ' selected' : '') + '>' + esc(cap(TAG_LABELS[t] || t)) + (tags.indexOf(t) >= 0 ? ' ★' : '') + '</option>'; }).join('') + '</select></label>' +
      '<label>Max price<select data-act="ideaMax" data-kid="' + kid.id + '"><option value="">Any price</option>' + [10, 20, 30, 50, 75, 100, 150, 250].map(function (p) {
        return '<option value="' + p + '"' + (String(ui.ideaMax[kid.id]) === String(p) ? ' selected' : '') + '>Up to £' + p + '</option>'; }).join('') + '</select></label></div>' +
      '<div class="ideas">' + (list.length ? list.map(function (r) { return ideaCard(kid, r); }).join('') : '<div class="empty">No ideas match those filters.</div>') + '</div>' +
      (all.length > n ? '<div class="btns"><button class="btn" data-act="more" data-kid="' + kid.id + '">Show more ideas (' + (all.length - n) + ' more)</button></div>' : '') +
      ((state.dismissed[kid.id] || []).length ? '<div class="btns"><button class="btn ghost sm" data-act="undismiss" data-kid="' + kid.id + '">Restore ' + state.dismissed[kid.id].length + ' hidden idea(s)</button></div>' : '') +
      '</section>';
    return h;
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function shopLinks(q) {
    return '<div class="shops">' + SHOPS.map(function (s) { return '<a class="shop" target="_blank" rel="noopener noreferrer" href="' + esc(s.url(q)) + '">' + s.name + '</a>'; }).join('') + '</div>';
  }
  function ideaCard(kid, r) {
    var c = r.c;
    return '<div class="idea"><div class="t">' + esc(c.name) + '</div>' +
      '<div><span class="price">' + gbp(c.price, true) + '</span> <span class="muted small">· ages ' + c.min + (c.max >= 99 ? '+' : '–' + c.max) + '</span></div>' +
      (r.why ? '<div class="why">' + esc(r.why) + '</div>' : '') +
      shopLinks(c.q) +
      '<div class="acts"><button class="btn sm green" data-act="saveIdea" data-kid="' + kid.id + '" data-c="' + c.id + '">＋ Save</button>' +
      '<button class="btn sm ghost" data-act="dismiss" data-kid="' + kid.id + '" data-c="' + c.id + '" title="Hide this idea">Not for them</button></div></div>';
  }
  function itemRow(i, money) {
    var kid = getKid(i.kidId), link = safeUrl(i.link);
    var q = i.searchQ || i.name;
    return '<div class="item" data-item="' + i.id + '">' +
      '<div class="pri" title="' + PRI_LABEL[i.priority] + '">' + PRI[i.priority] + '</div>' +
      '<div><div class="nm">' + (link ? '<a href="' + esc(link) + '" target="_blank" rel="noopener noreferrer">' + esc(i.name) + '</a>' : esc(i.name)) + '</div>' +
      '<div class="meta">' + (money && kid ? '<span style="color:' + kidColour(kid) + ';font-weight:700">' + esc(kid.name) + '</span>' : '') +
      (i.shop ? '<span>🏬 ' + esc(i.shop) + '</span>' : '') +
      (!link ? '<a target="_blank" rel="noopener noreferrer" href="' + esc(SHOPS[6].url(q)) + '">🔎 find prices</a>' : '') +
      (i.notes ? '<span>📝 ' + esc(i.notes) + '</span>' : '') + '</div></div>' +
      '<div class="side"><span class="price">' + (num(i.price) == null ? '<span class="muted">£?</span>' : gbp(i.price, i.estimate)) + '</span>' +
      '<div style="display:flex;gap:6px;align-items:center">' +
      (money ? '<button class="btn sm green" data-act="markBought" data-id="' + i.id + '">✓ Bought</button>' :
        '<button class="status st-' + i.status + '" data-act="cycle" data-id="' + i.id + '" title="Tap to change status">' + i.status + '</button>') +
      '<button class="btn sm ghost" data-act="edit" data-id="' + i.id + '" aria-label="Edit">✏️</button></div></div></div>';
  }

  function renderMoney() {
    var rows = state.kids.map(function (k) {
      var its = kidItems(k), p = sum(planned(its)), b = sum(bought(its)), bud = num(k.budget);
      var left = bud == null ? null : bud - b - p;
      return { k: k, p: p, b: b, bud: bud, left: left };
    });
    var T = rows.reduce(function (t, r) { t.p += r.p; t.b += r.b; if (r.bud != null) { t.bud += r.bud; t.left += r.left; t.hasBud = true; } return t; }, { p: 0, b: 0, bud: 0, left: 0, hasBud: false });
    var h = '<section class="card"><h2>💷 Money overview</h2><div style="overflow-x:auto"><table class="sum"><thead><tr><th>Kid</th><th>Budget</th><th>Bought</th><th>To buy</th><th>Left after plan</th></tr></thead><tbody>' +
      rows.map(function (r) {
        return '<tr><td><span class="dot" style="display:inline-block;width:9px;height:9px;border-radius:50%;background:' + kidColour(r.k) + '"></span> ' + esc(r.k.name) + '</td><td>' + (r.bud == null ? '—' : gbp(r.bud)) + '</td><td>' + gbp(r.b) + '</td><td>' + gbp(r.p) + '</td><td class="' + (r.left != null && r.left < 0 ? 'over' : '') + '">' + (r.left == null ? '—' : gbp(r.left)) + '</td></tr>';
      }).join('') +
      '</tbody><tfoot><tr><td>Total</td><td>' + (T.hasBud ? gbp(T.bud) : '—') + '</td><td>' + gbp(T.b) + '</td><td>' + gbp(T.p) + '</td><td class="' + (T.hasBud && T.left < 0 ? 'over' : '') + '">' + (T.hasBud ? gbp(T.left) : '—') + '</td></tr></tfoot></table></div>' +
      '<p class="muted small">Left after plan only counts kids with a budget set. Everything = ' + gbp(T.p + T.b) + ' (bought ' + gbp(T.b) + ' + still to buy ' + gbp(T.p) + '). Items without a price count as £0; “~” prices are estimates. Set budgets on each kid’s profile.</p></section>';

    var toBuy = state.items.filter(function (i) { return i.status === 'Idea' || i.status === 'Saved'; })
      .sort(function (a, b) { return a.priority - b.priority || (a.status === 'Saved' ? -1 : 0) - (b.status === 'Saved' ? -1 : 0) || (num(a.price) || 0) - (num(b.price) || 0); });
    var cash = num(state.settings.cash), fits = {}, spend = 0;
    if (cash != null) toBuy.forEach(function (i) { var p = num(i.price); if (p != null && spend + p <= cash) { spend += p; fits[i.id] = 1; } });
    var nFit = Object.keys(fits).length;
    h += '<section class="card"><h2>🛒 Buy when I have money</h2>' +
      '<div class="money-input"><label style="margin:0">I have £ now</label><input id="cashInput" type="number" inputmode="decimal" min="0" step="1" placeholder="e.g. 120" value="' + esc(state.settings.cash || '') + '">' +
      (cash != null ? '<span class="small"><b>' + nFit + '</b> item' + (nFit === 1 ? '' : 's') + ' fit (' + gbp(spend) + '), ' + gbp(cash - spend) + ' spare</span>' : '<span class="muted small">Highlights what you can afford, top priority first.</span>') + '</div>' +
      '<p class="muted small">Sorted by priority (🔥 must-have → 🙂 nice to have), then cheapest first.</p>' +
      '<div class="items">' + (toBuy.length ? toBuy.map(function (i) { return itemRow(i, true).replace('class="item"', 'class="item' + (fits[i.id] ? ' fits' : '') + '"'); }).join('') : '<div class="empty">Nothing waiting to be bought 🎉</div>') + '</div></section>';
    return h;
  }

  function renderSearch() {
    var q = ui.searchQ || '';
    return '<section class="card"><h2>🔎 Search UK shops for anything</h2>' +
      '<form class="searchbox" data-act="search"><input id="searchQ" name="q" placeholder="e.g. white gaming desk 140cm" value="' + esc(q) + '" maxlength="120"><button class="btn primary">Search</button></form>' +
      (q ? '<p class="muted small">Open “' + esc(q) + '” at:</p><div class="btns">' + SHOPS.map(function (s) { return '<a class="btn" target="_blank" rel="noopener noreferrer" href="' + esc(s.url(q)) + '">' + s.name + ' ↗</a>'; }).join('') + '</div>' +
        '<div class="btns">' + state.kids.map(function (k) { return '<button class="btn sm green" data-act="addFromSearch" data-kid="' + k.id + '">＋ Save “' + esc(q.length > 24 ? q.slice(0, 24) + '…' : q) + '” for ' + esc(k.name) + '</button>'; }).join('') + '</div>'
        : '<p class="muted small">Searches Amazon.co.uk, Argos, Smyths Toys, John Lewis, Currys, eBay UK and Google Shopping UK. Found the one? Copy its link and add it with <b>+ Add item</b> on a kid’s tab.</p>') +
      '</section>' +
      '<section class="card"><h2>💡 Tips</h2><ul class="muted small" style="margin:0;padding-left:18px">' +
      '<li>Tap a status pill to cycle Idea → Saved → Bought → Wrapped.</li>' +
      '<li>Use the 💷 Money tab’s “I have £X now” box on payday to see what fits.</li>' +
      '<li>Export a backup now and then; data lives only in this browser.</li>' +
      '<li>On a phone, use your browser’s “Add to Home Screen” to open it like an app.</li></ul></section>';
  }

  // ---------- item dialog
  var dlg = $('#itemDialog'), form = $('#itemForm'), editingId = null;
  function openItem(opts) {
    editingId = opts.id || null;
    var it = editingId ? state.items.filter(function (i) { return i.id === editingId; })[0] : null;
    $('#fKid').innerHTML = state.kids.map(function (k) { return '<option value="' + k.id + '">' + esc(kidLabel(k)) + '</option>'; }).join('');
    $('#shopList').innerHTML = SHOPS.slice(0, 6).map(function (s) { return '<option value="' + s.name + '">'; }).join('') + EXTRA_HOSTS.map(function (h) { return '<option value="' + esc(h[1]) + '">'; }).join('');
    $('#itemDialogTitle').textContent = it ? 'Edit item' : 'Add item';
    $('#deleteItemBtn').hidden = !it;
    var d = it || { kidId: opts.kidId || state.kids[0].id, name: opts.name || '', link: '', price: '', shop: '', notes: '', priority: 2, status: 'Saved' };
    form.kidId.value = d.kidId; form.name.value = d.name; form.link.value = d.link || ''; form.price.value = d.price == null ? '' : d.price;
    form.shop.value = d.shop || ''; form.notes.value = d.notes || ''; form.priority.value = String(d.priority); form.status.value = d.status;
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    setTimeout(function () { (it ? form.price : form.name).focus(); }, 50);
  }
  function closeItem() { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); }
  form.link.addEventListener('input', function () { if (!form.shop.value) { var s = shopFromUrl(form.link.value); if (s) form.shop.value = s; } });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.name.value.trim(); if (!name) return;
    if (BANNED.test(name)) { toast('That one’s off the list 🚫'); return; }
    var link = form.link.value.trim();
    if (link && !safeUrl(link)) { if (safeUrl('https://' + link)) link = 'https://' + link; else { toast('That link doesn’t look right'); return; } }
    var data = { kidId: form.kidId.value, name: name, link: link, price: num(form.price.value), shop: form.shop.value.trim() || shopFromUrl(link),
      notes: form.notes.value.trim(), priority: +form.priority.value, status: form.status.value };
    if (editingId) {
      var it = state.items.filter(function (i) { return i.id === editingId; })[0];
      if (it) { if (num(it.price) !== data.price) it.estimate = false; Object.assign(it, data); }
      toast('Saved ✓');
    } else { data.id = uid(); data.created = Date.now(); state.items.push(data); toast('Added to ' + getKid(data.kidId).name + '’s list 🎁'); }
    save(); closeItem(); render();
  });
  $('#cancelItemBtn').addEventListener('click', closeItem);
  $('#deleteItemBtn').addEventListener('click', function () {
    if (!editingId || !confirm('Remove this item from the list?')) return;
    state.items = state.items.filter(function (i) { return i.id !== editingId; });
    save(); closeItem(); render(); toast('Removed');
  });

  // ---------- events
  document.addEventListener('click', function (e) {
    var tab = e.target.closest('[data-tab]');
    if (tab) { ui.tab = tab.getAttribute('data-tab'); state.settings.tab = ui.tab; save(); render(); window.scrollTo({ top: 0 }); return; }
    var el = e.target.closest('[data-act]'); if (!el || el.tagName === 'FORM' || el.tagName === 'SELECT') return;
    var act = el.getAttribute('data-act'), kidId = el.getAttribute('data-kid'), kid = kidId && getKid(kidId), id = el.getAttribute('data-id');
    var item = id && state.items.filter(function (i) { return i.id === id; })[0];
    switch (act) {
      case 'addItem': openItem({ kidId: kidId }); break;
      case 'edit': openItem({ id: id }); break;
      case 'cycle': item.status = STATUSES[(STATUSES.indexOf(item.status) + 1) % STATUSES.length]; save(); render(); toast(item.name + ' → ' + item.status); break;
      case 'markBought': item.status = 'Bought'; save(); render(); toast('Marked bought ✓'); break;
      case 'filter': ui.filter[kidId] = el.getAttribute('data-v'); render(); break;
      case 'rmInterest': kid.interests.splice(+el.getAttribute('data-i'), 1); save(); render(); break;
      case 'quickInterest': addInterest(kid, el.getAttribute('data-v')); break;
      case 'shuffle': ui.shuffle[kidId] = (ui.shuffle[kidId] || 0) + 1; render(); var ic = $('#ideasCard'); if (ic) ic.scrollIntoView({ behavior: 'smooth', block: 'start' }); break;
      case 'more': ui.ideaShow[kidId] = (ui.ideaShow[kidId] || 12) + 12; render(); break;
      case 'dismiss': (state.dismissed[kidId] = state.dismissed[kidId] || []).push(el.getAttribute('data-c')); save(); render(); break;
      case 'undismiss': state.dismissed[kidId] = []; save(); render(); break;
      case 'saveIdea':
        var c = CATALOGUE.filter(function (x) { return x.id === el.getAttribute('data-c'); })[0];
        state.items.push({ id: uid(), kidId: kidId, name: c.name, link: '', price: c.price, estimate: true, shop: '', notes: '', priority: 2, status: 'Idea', searchQ: c.q, created: Date.now() });
        save(); render(); toast('Saved “' + c.name + '” for ' + kid.name + '. Tap ✏️ to add the real link & price.'); break;
      case 'addFromSearch': openItem({ kidId: kidId, name: ui.searchQ || '' }); break;
    }
  });
  function addInterest(kid, v) {
    v = String(v || '').trim(); if (!v) return;
    if (BANNED.test(v)) { toast('Skipped: that one’s off the list 🚫'); return; }
    if (kid.interests.map(norm).indexOf(norm(v)) >= 0) return;
    kid.interests.push(v); save(); render(); toast('Ideas updated for ' + kid.name + ' ✨');
  }
  document.addEventListener('submit', function (e) {
    var f = e.target; if (f === form) return;
    var act = f.getAttribute('data-act'); if (!act) return;
    e.preventDefault();
    if (act === 'addInterest') { addInterest(getKid(f.getAttribute('data-kid')), f.interest.value); var inp = $('form[data-act="addInterest"] input'); if (inp) inp.focus(); }
    if (act === 'search') { ui.searchQ = f.q.value.trim(); if (BANNED.test(ui.searchQ)) { toast('That one’s off the list 🚫'); ui.searchQ = ''; } render(); }
  });
  document.addEventListener('change', function (e) {
    var t = e.target, kidId = t.getAttribute('data-kid'), kf = t.getAttribute('data-kf'), act = t.getAttribute('data-act');
    if (kf && kidId) {
      var kid = getKid(kidId), v = t.value.trim();
      if (kf === 'name' && !v) { t.value = kid.name; return; }
      kid[kf] = (kf === 'age' || kf === 'budget') ? (num(v) == null ? '' : String(num(v))) : v;
      save(); setTimeout(render, 0); if (kf === 'age' || kf === 'budget') toast('Ideas updated for ' + kid.name + ' ✨');
    }
    if (act === 'ideaTag') { ui.ideaTag[kidId] = t.value; ui.ideaShow[kidId] = 12; render(); }
    if (act === 'ideaMax') { ui.ideaMax[kidId] = t.value; ui.ideaShow[kidId] = 12; render(); }
    if (t.id === 'cashInput') { state.settings.cash = t.value.trim(); save(); render(); }
    if (t.id === 'importFile' && t.files[0]) importFile(t.files[0]);
  });

  document.addEventListener('toggle', function (e) { var d = e.target; if (d.getAttribute && d.getAttribute('data-profile')) ui.profileOpen[d.getAttribute('data-profile')] = d.open; }, true);

  // ---------- backup
  $('#exportBtn').addEventListener('click', function () {
    var blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'gift-tracker-backup-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    toast('Backup downloaded ⬇️');
  });
  function importFile(file) {
    var r = new FileReader();
    r.onload = function () {
      try {
        var s = JSON.parse(r.result);
        if (!s || !Array.isArray(s.kids) || !Array.isArray(s.items) || !s.kids.length) throw new Error('bad');
        if (!confirm('Replace the current list with this backup (' + s.items.length + ' items)?')) return;
        state = fix(s); save(); ui.tab = state.kids[0].id; render(); toast('Backup restored ✓');
      } catch (e) { toast('⚠️ That file isn’t a gift tracker backup'); }
      $('#importFile').value = '';
    };
    r.readAsText(file);
  }

  // ---------- theme, countdown, snow
  function applyTheme() {
    var t = state.settings.theme || (window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', t);
    $('meta[name="theme-color"]').setAttribute('content', t === 'light' ? '#f7f4ee' : '#0f1a17');
  }
  $('#themeBtn').addEventListener('click', function () {
    var cur = document.documentElement.getAttribute('data-theme');
    state.settings.theme = cur === 'light' ? 'dark' : 'light'; save(); applyTheme();
  });
  function tick() {
    var now = new Date(), y = now.getFullYear(), xmas = new Date(y, 11, 25);
    var el = $('#countdown');
    if (now.getMonth() === 11 && now.getDate() === 25) { el.innerHTML = '<b>🎅</b>Happy Christmas!'; return; }
    if (now > xmas) xmas = new Date(y + 1, 11, 25);
    var ms = xmas - now, d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5);
    el.innerHTML = '<b>' + d + '</b>day' + (d === 1 ? '' : 's') + ' ' + h + 'h to go';
    el.title = 'Until Christmas Day ' + xmas.getFullYear();
  }
  function snow() {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var s = document.createElement('div'); s.className = 'snow'; s.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 18; i++) {
      var f = document.createElement('i'); f.textContent = i % 3 ? '•' : '❄';
      f.style.left = (Math.random() * 100) + '%'; f.style.fontSize = (6 + Math.random() * 10) + 'px';
      f.style.animationDuration = (9 + Math.random() * 14) + 's'; f.style.animationDelay = (-Math.random() * 20) + 's';
      s.appendChild(f);
    }
    document.body.appendChild(s);
  }

  applyTheme(); tick(); setInterval(tick, 60000); snow(); render();
})();
