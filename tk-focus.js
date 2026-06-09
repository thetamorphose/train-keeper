/* ===== Train Keeper — build / active / summary ===== */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const fmt = (n) => (Math.round(n * 100) / 100).toString();
  const pad = (n) => (n < 10 ? '0' + n : '' + n);
  const mmss = (s) => pad(Math.floor(s / 60)) + ':' + pad(Math.round(s % 60));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const parseTime = (str) => {
    str = (str || '').trim();
    if (str.indexOf(':') >= 0) { const [m, s] = str.split(':'); return (parseInt(m) || 0) * 60 + (parseInt(s) || 0); }
    return Math.max(0, parseInt(str) || 0);
  };

  /**
   * Field templates for standard workout metrics
   * @type {Array<{key: string, label: string, unit: string, type: string, step?: number, def: (number|string)}>}
   */
  const TEMPLATES = [
    { key: 'вес',         label: 'Вес',         unit: 'кг', type: 'num',  step: 2.5, def: 60 },
    { key: 'повторения',  label: 'Повторения',  unit: 'раз', type: 'num', step: 1,   def: 10 },
    { key: 'дистанция',   label: 'Дистанция',   unit: 'км', type: 'num',  step: 0.5, def: 5 },
    { key: 'время',       label: 'Время',       unit: '',   type: 'time', step: 5,   def: 60 },
    { key: 'поза',        label: 'Поза',        unit: '',   type: 'text', def: '' },
  ];

  /**
   * Get template by key
   * @param {string} k 
   */
  const tpl = (k) => TEMPLATES.find((t) => t.key === k);

  let _id = 1;
  const nid = () => _id++;

  /**
   * Create a new field object based on a template
   * @param {Object} t - Template object 
   * @param {*} value - Initial value
   */
  const mkField = (t, value) => ({
    id: nid(), key: t.key, label: t.label, unit: t.unit || '', type: t.type, step: t.step || 1,
    value: value !== undefined ? value : (t.type === 'text' ? '' : t.def || 0), plan: undefined,
    ph: t.key === 'поза' ? 'Поза…' : '—',
  });

  /**
   * Create a new exercise object
   * @param {string} name 
   * @param {Array} fields 
   */
  const mkEx = (name, fields) => ({ id: nid(), name, done: false, fields: fields || [] });

  /**
   * Returns default application state
   */
  const DEFAULT = () => ({
    mode: 'home', history: [], title: 'Кросс-день',
    i: 0, comment: '', startedAt: 0, elapsed: 0,
    sections: [
      { name: 'Разминка', ex: [
        mkEx('Беговая дорожка', [mkField(tpl('время'), 300)]),
        mkEx('Суставная гимнастика', [mkField(tpl('время'), 180)]),
      ] },
      { name: 'Основная', ex: [
        mkEx('Подтягивания', [mkField(tpl('повторения'), 10)]),
        mkEx('Жим лёжа', [mkField(tpl('вес'), 50), mkField(tpl('повторения'), 8)]),
        mkEx('Становая тяга', [mkField(tpl('вес'), 80), mkField(tpl('повторения'), 5)]),
      ] },
      { name: 'Заминка', ex: [
        mkEx('Поза голубя', [mkField(tpl('поза'), 'Голубь'), mkField(tpl('время'), 60)]),
        mkEx('Планка', [mkField(tpl('время'), 45)]),
      ] },
    ],
  });

  const LSKEY = 'tk_focus_v3';
  let state, editId = null, menuId = null, sheetExId = null, timerInt = null;
  try {
    const raw = localStorage.getItem(LSKEY);
    state = raw ? JSON.parse(raw) : DEFAULT();
    if (!state.history) state.history = [];
    if (!state.title) state.title = 'Кросс-день';
    state.sections.forEach((s) => s.ex.forEach((e) => { if (e.id >= _id) _id = e.id + 1; e.fields.forEach((f) => { if (f.id >= _id) _id = f.id + 1; }); }));
  } catch (e) { state = DEFAULT(); }
  const save = () => { try { localStorage.setItem(LSKEY, JSON.stringify(state)); } catch (e) {} };

  async function syncHistory() {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        state.history = await res.json();
        render();
      }
    } catch (e) { console.error('History sync failed:', e); }
  }

  const exBody = $('#exBody');
  const curSec = () => state.sections[state.i];
  const findEx = (id) => curSec().ex.find((e) => e.id == id);
  const findField = (ex, fid) => ex.fields.find((f) => f.id == fid);
  const dispVal = (f, v) => (f.type === 'time' ? mmss(v) : fmt(v)) + (f.type !== 'time' && f.unit ? ' ' + f.unit : '');
  const isDiff = (f) => { if (f.plan === undefined) return false; if (f.type === 'text') return String(f.value || '') !== String(f.plan || ''); return Number(f.value) !== Number(f.plan); };

  /* ---------------- field / card render ---------------- */
  function fieldHTML(ex, f, editing) {
    const rm = editing ? '<button class="fx" data-act="rmfield" data-id="' + ex.id + '" data-fid="' + f.id + '" title="убрать поле">✕ убрать</button>' : '';
    const head = '<div class="flabel"><span' + (editing ? ' contenteditable="true" spellcheck="false" data-act="label" data-id="' + ex.id + '" data-fid="' + f.id + '"' : '') + '>' + esc(f.label) + '</span>' + rm + '</div>';
    if (f.type === 'text') {
      return '<div class="fld">' + head +
        '<span class="tpill" contenteditable="true" spellcheck="false" data-act="text" data-id="' + ex.id + '" data-fid="' + f.id + '" data-ph="' + esc(f.ph || '—') + '">' + esc(f.value || '') + '</span></div>';
    }
    const disp = f.type === 'time' ? mmss(f.value) : fmt(f.value);
    const unit = f.type === 'time' ? 'мин:сек' : f.unit;
    return '<div class="fld">' + head +
      '<span class="mstep"><button data-act="dec" data-id="' + ex.id + '" data-fid="' + f.id + '">−</button>' +
      '<span class="v" contenteditable="true" spellcheck="false" data-act="val" data-id="' + ex.id + '" data-fid="' + f.id + '">' + disp + '</span>' +
      '<button data-act="inc" data-id="' + ex.id + '" data-fid="' + f.id + '">+</button></span>' +
      (unit ? '<span class="funit">' + esc(unit) + '</span>' : '') + '</div>';
  }

  function cardHTML(ex) {
    const active = state.mode === 'active';
    const editing = ex.id === editId && state.mode === 'build';
    const cls = 'card' + (active ? ' tappable' : '') + (active && ex.done ? ' done' : '') + (editing ? ' editing' : '');
    let h = '<div class="' + cls + '"' + (active ? ' data-act="toggle" data-id="' + ex.id + '"' : '') + '>';
    h += '<div class="card-top">';
    if (active) h += '<span class="check">✓</span>';
    h += '<span class="cname"' + (editing ? ' contenteditable="true" spellcheck="false" data-act="cname" data-id="' + ex.id + '"' : '') + '>' + esc(ex.name) + '</span>';
    if (state.mode === 'build') h += '<button class="kebab" data-act="menu" data-id="' + ex.id + '">⋯</button>';
    h += '</div>';
    if (ex.fields.length) h += '<div class="fldrow">' + ex.fields.map((f) => fieldHTML(ex, f, editing)).join('') + '</div>';
    if (editing) h += '<div class="cardedit"><span class="addfield" data-act="addfield" data-id="' + ex.id + '">＋ поле</span><button class="editdone" data-act="editdone" data-id="' + ex.id + '">Готово</button></div>';
    if (ex.id === menuId && state.mode === 'build') {
      h += '<div class="kmenu"><button data-act="dup" data-id="' + ex.id + '">Дублировать</button><button data-act="edit" data-id="' + ex.id + '">Изменить</button><button class="danger" data-act="del" data-id="' + ex.id + '">Удалить</button></div>';
    }
    h += '</div>';
    return h;
  }

  /* ---------------- summary render ---------------- */
  function summaryHTML() {
    let diffs = 0, total = 0;
    state.sections.forEach((s) => s.ex.forEach((e) => e.fields.forEach((f) => { total++; if (isDiff(f)) diffs++; })));
    let h = '<div class="summary">';
    h += '<div class="sumhead"><div class="big">Тренировка завершена</div>' +
      '<div class="sub">⏱ ' + mmss(Math.floor(state.elapsed / 1000)) + ' · ' +
      (diffs ? '<span class="hl">' + diffs + ' откл. от плана</span>' : 'всё по плану') + '</div></div>';
    state.sections.forEach((s) => {
      h += '<table class="rtable"><tr class="sech"><td>' + esc(s.name) + '</td><td class="hd">План</td><td class="hd">Факт</td></tr>';
      s.ex.forEach((e) => {
        h += '<tr class="exh"><td colspan="3">' + esc(e.name) + (e.done ? '' : ' <span class="skip">не отмечено</span>') + '</td></tr>';
        e.fields.forEach((f) => {
          const plan = f.plan === undefined ? f.value : f.plan;
          const diff = isDiff(f);
          let arrow = '';
          if (diff && f.type !== 'text') arrow = Number(f.value) < Number(plan) ? ' ↓' : ' ↑';
          else if (diff) arrow = ' ✎';
          h += '<tr><td class="fl">' + esc(f.label) + '</td><td class="pl">' + esc(dispVal(f, plan)) + '</td>' +
            '<td class="fa' + (diff ? ' diff' : '') + '">' + esc(dispVal(f, f.value)) + arrow + '</td></tr>';
        });
      });
      h += '</table>';
    });
    h += '<div class="commentbox"><div class="clab">Комментарий к тренировке</div>' +
      '<textarea class="comment" data-act="comment" placeholder="Как прошло? Самочувствие, заметки…">' + esc(state.comment || '') + '</textarea></div>';
    h += '<div class="legend-diff"><span class="sw"></span> — значение отличается от запланированного</div>';
    h += '</div>';
    return h;
  }

  /* ---------------- home render ---------------- */
  function homeHTML() {
    let h = '<div class="home">';
    h += '<div class="h-head">История тренировок</div>';
    if (!state.history || state.history.length === 0) {
      h += '<div class="h-empty">Тут пока пусто. Время первой тренировки!</div>';
    } else {
      h += '<div class="h-list">' + state.history.map((h, idx) => {
        return '<div class="h-item" data-act="viewhistory" data-i="' + idx + '">' +
          '<div class="h-top"><span class="h-title">' + esc(h.title || 'Тренировка') + '</span><span class="h-date">' + new Date(h.date).toLocaleDateString() + '</span></div>' +
          '<div class="h-stats">⏱ ' + mmss(Math.floor(h.elapsed / 1000)) + '</div>' +
          '</div>';
      }).join('') + '</div>';
    }
    h += '<div class="h-actions"><button class="secbtn go" data-act="newworkout">＋ Новая тренировка</button></div>';
    h += '</div>';
    return h;
  }

  /* ---------------- main render ---------------- */
  /**
   * Main rendering function. Updates the DOM based on the current application state.
   */
  function render() {
    const mode = state.mode;
    const snav = $('#snav'), dots = $('#dots'), wtitle = $('#wtitle'), wpill = $('#wpill'), crumb = $('#crumb');

    if (mode === 'home') {
      snav.style.display = 'none'; dots.style.display = 'none';
      crumb.textContent = 'Главная';
      wtitle.textContent = 'Train Keeper'; wtitle.contentEditable = 'false';
      wpill.className = 'timer draft mono'; wpill.textContent = 'архив';
      exBody.innerHTML = homeHTML();
      $('#secbtn').style.display = 'none';
      save(); return;
    }
    $('#secbtn').style.display = '';

    if (mode === 'summary') {
      snav.style.display = 'none'; dots.style.display = 'none';
      crumb.textContent = state.isViewingHistory ? 'История' : 'Итог';
      wtitle.textContent = state.title;
      wtitle.contentEditable = 'false'; wpill.className = 'timer mono'; wpill.textContent = '✓ готово';
      exBody.innerHTML = summaryHTML();
      const btn = $('#secbtn'); btn.className = 'secbtn go'; btn.dataset.act = 'closesummary';
      btn.textContent = state.isViewingHistory ? '← Назад к истории' : 'Готово · к редактированию';
      save(); return;
    }

    snav.style.display = ''; dots.style.display = '';
    wtitle.textContent = state.title;
    const sec = curSec();
    $('#sname').textContent = sec.name;
    const total = sec.ex.length, done = sec.ex.filter((e) => e.done).length;
    crumb.textContent = mode === 'active' ? 'Активная тренировка' : 'Создание тренировки';
    wtitle.contentEditable = mode === 'build' ? 'true' : 'false';
    if (mode === 'active') { wpill.className = 'timer mono'; wpill.textContent = '⏱ ' + mmss(Math.floor((Date.now() - state.startedAt) / 1000)); }
    else { wpill.className = 'timer draft mono'; wpill.textContent = 'черновик'; }
    $('#ssub').textContent = 'Секция ' + (state.i + 1) + ' из ' + state.sections.length +
      (mode === 'active' ? ' · выполнено ' + done + '/' + total : ' · ' + total + ' упр.');

    let h = sec.ex.map(cardHTML).join('');
    if (mode === 'build') h += '<div class="addexc" data-act="addexc">＋ упражнение</div>';
    exBody.innerHTML = h;

    dots.innerHTML = state.sections.map((s, k) => {
      const full = mode === 'active' && s.ex.length && s.ex.every((e) => e.done);
      return '<i class="' + (k === state.i ? 'on ' : '') + (full ? 'full' : '') + '" data-act="dot" data-i="' + k + '"></i>';
    }).join('') + (mode === 'build' ? '<i class="addx" data-act="addsec" title="добавить секцию"></i>' : '');

    const btn = $('#secbtn'), last = state.i === state.sections.length - 1;
    if (mode === 'build') { btn.className = 'secbtn go'; btn.dataset.act = 'startworkout'; btn.textContent = '▶ Начать тренировку'; }
    else if (total === 0) { btn.className = 'secbtn ghost'; btn.dataset.act = 'nextsec'; btn.textContent = 'Нет упражнений'; }
    else if (done < total) { btn.className = 'secbtn ghost'; btn.dataset.act = 'nextsec'; btn.textContent = 'Выполнено ' + done + ' из ' + total; }
    else if (!last) { btn.className = 'secbtn go'; btn.dataset.act = 'nextsec'; btn.textContent = 'Следующая секция →'; }
    else { btn.className = 'secbtn finish'; btn.dataset.act = 'nextsec'; btn.textContent = '✓ Завершить тренировку'; }
    save();
  }

  /* ---------------- timer ---------------- */
  function startTimer() { stopTimer(); timerInt = setInterval(() => { if (state.mode === 'active') { const p = $('#wpill'); if (p) p.textContent = '⏱ ' + mmss(Math.floor((Date.now() - state.startedAt) / 1000)); } }, 1000); }
  function stopTimer() { if (timerInt) clearInterval(timerInt); timerInt = null; }

  /* ---------------- mode transitions ---------------- */
  /**
   * Transition from 'build' to 'active' mode
   */
  function startWorkout() {
    state.mode = 'active'; state.i = 0; state.startedAt = Date.now(); state.comment = '';
    state.sections.forEach((s) => s.ex.forEach((e) => { e.done = false; e.fields.forEach((f) => { f.plan = f.value; }); }));
    editId = null; menuId = null; render(); startTimer(); exBody.scrollTop = 0;
  }
  
  /**
   * Transition from 'active' to 'summary' mode
   */
  function finishWorkout() { state.mode = 'summary'; state.elapsed = Date.now() - state.startedAt; stopTimer(); render(); exBody.scrollTop = 0; }
  
  /**
   * Handle summary closure: either save to history or return from history view
   */
  function closeSummary() {
    if (state.isViewingHistory) {
      state.isViewingHistory = false;
      const draft = JSON.parse(localStorage.getItem(LSKEY + '_draft'));
      if (draft) {
        const history = state.history;
        Object.assign(state, draft);
        state.history = history;
      }
      state.mode = 'home';
      render(); exBody.scrollTop = 0;
      return;
    }
    const finished = {
      title: state.title || $('#wtitle').textContent || 'Тренировка',
      date: Date.now(),
      elapsed: state.elapsed,
      comment: state.comment,
      sections: JSON.parse(JSON.stringify(state.sections))
    };

    // Save to server
    fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finished)
    }).then(syncHistory);

    state.mode = 'home';
    state.i = 0;
    state.comment = '';
    state.sections.forEach((s) => s.ex.forEach((e) => { e.done = false; e.fields.forEach((f) => { if (f.plan !== undefined) f.value = f.plan; }); }));
    render(); exBody.scrollTop = 0;
  }

  /* ---------------- interactions ---------------- */
  document.addEventListener('click', (e) => {
    if (menuId !== null && !e.target.closest('.kmenu') && !(e.target.closest('[data-act]') && e.target.closest('[data-act]').dataset.act === 'menu')) { menuId = null; render(); return; }
    const el = e.target.closest('[data-act]'); if (!el) return;
    const act = el.dataset.act, id = el.dataset.id, fid = el.dataset.fid, i = el.dataset.i;
    const ex = id ? findEx(id) : null;
    switch (act) {
      case 'val': case 'text': case 'label': case 'cname': case 'secname': case 'comment': return;
      case 'newworkout': state.mode = 'build'; render(); return;
      case 'viewhistory': {
        const h = state.history[i];
        localStorage.setItem(LSKEY + '_draft', JSON.stringify(state));
        state.isViewingHistory = true; state.mode = 'summary';
        state.title = h.title; state.elapsed = h.elapsed; state.comment = h.comment; state.sections = h.sections;
        render(); return;
      }
      case 'toggle': if (state.mode === 'active' && ex) { ex.done = !ex.done; render(); } return;
      case 'inc': case 'dec': { const f = findField(ex, fid); const d = act === 'inc' ? f.step : -f.step; f.value = Math.max(0, Math.round((Number(f.value) + d) * 100) / 100); render(); return; }
      case 'rmfield': ex.fields = ex.fields.filter((f) => f.id != fid); render(); return;
      case 'addfield': sheetExId = ex.id; openSheet(); return;
      case 'menu': menuId = (menuId === ex.id ? null : ex.id); render(); return;
      case 'dup': { const c = JSON.parse(JSON.stringify(ex)); c.id = nid(); c.done = false; c.fields.forEach((f) => (f.id = nid())); const idx = curSec().ex.indexOf(ex); curSec().ex.splice(idx + 1, 0, c); menuId = null; render(); toast('Карточка продублирована'); return; }
      case 'edit': editId = ex.id; menuId = null; render(); return;
      case 'editdone': if (editId === ex.id) editId = null; render(); return;
      case 'del': curSec().ex = curSec().ex.filter((x) => x.id != id); menuId = null; if (editId == id) editId = null; render(); toast('Упражнение удалено'); return;
      case 'addexc': { const ne = mkEx('Новое упражнение', [mkField(tpl('повторения'), 10)]); curSec().ex.push(ne); editId = ne.id; render(); exBody.scrollTop = exBody.scrollHeight; return; }
      case 'dot': state.i = +i; menuId = null; editId = null; render(); exBody.scrollTop = 0; return;
      case 'addsec': state.sections.push({ name: 'Новая секция', ex: [] }); state.i = state.sections.length - 1; editId = null; render(); return;
      case 'startworkout': startWorkout(); return;
      case 'closesummary': closeSummary(); return;
      case 'nextsec': {
        if (state.mode !== 'active') return;
        const sec = curSec(); if (!sec.ex.length || !sec.ex.every((x) => x.done)) return;
        if (state.i < state.sections.length - 1) { state.i++; render(); exBody.scrollTop = 0; }
        else finishWorkout();
        return;
      }
    }
  });

  $('[data-prev]').addEventListener('click', () => { if (state.mode === 'summary') return; state.i = (state.i - 1 + state.sections.length) % state.sections.length; menuId = null; editId = null; render(); exBody.scrollTop = 0; });
  $('[data-next]').addEventListener('click', () => { if (state.mode === 'summary') return; state.i = (state.i + 1) % state.sections.length; menuId = null; editId = null; render(); exBody.scrollTop = 0; });

  exBody.addEventListener('input', (e) => {
    const el = e.target.closest('[data-act]'); if (!el) return;
    if (el.dataset.act === 'comment') { state.comment = el.value; save(); return; }
    const ex = el.dataset.id ? findEx(el.dataset.id) : null;
    if (el.dataset.act === 'cname' && ex) ex.name = el.textContent;
    else if (el.dataset.act === 'label' && ex) { const f = findField(ex, el.dataset.fid); if (f) f.label = el.textContent; }
  });
  exBody.addEventListener('focusout', (e) => {
    const el = e.target.closest('[data-act]'); if (!el || el.dataset.act === 'comment') { save(); return; }
    const ex = el.dataset.id ? findEx(el.dataset.id) : null; if (!ex) return;
    const f = el.dataset.fid ? findField(ex, el.dataset.fid) : null;
    if (el.dataset.act === 'val' && f) { f.value = f.type === 'time' ? parseTime(el.textContent) : Math.max(0, parseFloat(el.textContent) || 0); render(); }
    else if (el.dataset.act === 'text' && f) { f.value = el.textContent.trim(); save(); }
    else save();
  });

  $('#sname').addEventListener('input', () => { if (state.mode === 'build') curSec().name = $('#sname').textContent; });
  $('#sname').addEventListener('focusout', save);
  $('#wtitle').addEventListener('input', () => { if (state.mode === 'build') state.title = $('#wtitle').textContent; });

  /* ---------------- add-field sheet ---------------- */
  const sheet = $('#sheet'), scrim = $('#scrim'), tchips = $('#tchips');
  let custType = 'num';
  const sheetEx = () => curSec().ex.find((e) => e.id == sheetExId);
  function renderChips() { const ex = sheetEx(); const have = new Set((ex ? ex.fields : []).map((f) => f.key)); tchips.innerHTML = TEMPLATES.map((t) => '<button class="tchip' + (have.has(t.key) ? ' disabled' : '') + '" data-tpl="' + t.key + '">' + t.label + (t.unit ? ' <small>' + t.unit + '</small>' : '') + '</button>').join(''); }
  function openSheet() { renderChips(); resetCustom(); scrim.classList.add('open'); sheet.classList.add('open'); }
  function closeSheet() { scrim.classList.remove('open'); sheet.classList.remove('open'); }
  function resetCustom() { $('#cName').value = ''; $('#cUnit').value = ''; custType = 'num'; Array.from($('#cType').children).forEach((b) => b.classList.toggle('on', b.dataset.t === 'num')); $('#cUnit').style.display = ''; }
  scrim.addEventListener('click', closeSheet);
  tchips.addEventListener('click', (e) => { const b = e.target.closest('[data-tpl]'); if (!b || b.classList.contains('disabled')) return; const ex = sheetEx(); if (!ex) return; const t = tpl(b.dataset.tpl); ex.fields.push(mkField(t)); closeSheet(); render(); toast('Поле «' + t.label + '» добавлено'); });
  $('#cType').addEventListener('click', (e) => { const b = e.target.closest('[data-t]'); if (!b) return; custType = b.dataset.t; Array.from($('#cType').children).forEach((x) => x.classList.toggle('on', x === b)); $('#cUnit').style.display = custType === 'num' ? '' : 'none'; });
  $('#cAdd').addEventListener('click', () => { const name = $('#cName').value.trim(); if (!name) { toast('Введите название поля'); $('#cName').focus(); return; } const ex = sheetEx(); if (!ex) return; const unit = custType === 'num' ? $('#cUnit').value.trim() : ''; ex.fields.push(mkField({ key: 'custom', label: name, unit, type: custType, step: custType === 'time' ? 5 : 1, def: custType === 'text' ? '' : 0 })); closeSheet(); render(); toast('Поле «' + name + '» добавлено'); });

  let tt; function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('show'), 1700); }

  syncHistory();
  render();
  if (state.mode === 'active') startTimer();
})();
