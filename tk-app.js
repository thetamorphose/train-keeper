/* ===== Train Keeper wireframes — interactions (vanilla) ===== */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const fmt = (n) => (Math.round(n * 100) / 100).toString();

  /* ---------- shared steppers (A & others using .stepper) ---------- */
  document.addEventListener('click', (e) => {
    const inc = e.target.closest('[data-inc]');
    const dec = e.target.closest('[data-dec]');
    if (inc || dec) {
      const wrap = (inc || dec).closest('.stepper');
      const step = parseFloat(wrap.getAttribute('data-step') || '1');
      const valEl = $('.val', wrap);
      let v = parseFloat(valEl.textContent) || 0;
      v += (inc ? step : -step);
      if (v < 0) v = 0;
      valEl.textContent = fmt(v);
      flash(valEl);
    }
  });

  /* ---------- mark-done circles (A) ---------- */
  document.addEventListener('click', (e) => {
    const sn = e.target.closest('.set [data-done]');
    if (!sn) return;
    sn.closest('.set').classList.toggle('done');
  });

  /* ---------- add set / field / exercise (A & shared) ---------- */
  document.addEventListener('click', (e) => {
    const addSet = e.target.closest('[data-add-set]');
    if (addSet) {
      const exc = addSet.closest('.exc');
      const cont = $('.sets', exc) || $('.cset', exc)?.parentNode;
      const isC = exc.querySelector('.cset');
      const rows = isC ? $$('.cset', exc) : $$('.set', exc);
      const last = rows[rows.length - 1];
      const clone = last.cloneNode(true);
      clone.classList.remove('done', 'cur');
      const sn = clone.querySelector('.snum');
      if (sn) sn.textContent = rows.length + 1;
      if (isC) clone.querySelectorAll('.cval').forEach((c) => { c.classList.add('empty'); c.textContent = '—'; });
      last.after(clone);
      return;
    }

    const addField = e.target.closest('[data-add-field]');
    if (addField) {
      const exc = addField.closest('.exc');
      const tag = document.createElement('span');
      tag.className = 'ftag';
      tag.contentEditable = 'true';
      tag.spellcheck = false;
      tag.textContent = 'Новое поле';
      addField.before(tag);
      $$('.set', exc).forEach((row) => {
        const st = row.querySelector('.stepper');
        if (st) { const c = st.cloneNode(true); c.querySelector('.val').textContent = '0'; c.querySelector('.unit').textContent = '·'; row.appendChild(c); }
      });
      tag.focus();
      return;
    }

    const addExc = e.target.closest('[data-add-exc]');
    if (addExc) {
      const tpl = document.createElement('div');
      tpl.className = 'exc';
      tpl.innerHTML =
        '<div class="exc-h"><span class="grip">⠿</span><span class="ename" contenteditable="true" spellcheck="false">Новое упражнение</span><span class="menu">⋯</span></div>' +
        '<div class="fields"><span class="ftag" contenteditable="true" spellcheck="false">Значение</span><span class="ftag add" data-add-field>＋ поле</span></div>' +
        '<div class="sets"><div class="set"><span class="snum" data-done>1</span><span class="stepper" data-step="1"><button data-dec>−</button><span class="val mono">0</span><button data-inc>+</button><span class="unit">·</span></span></div></div>' +
        '<div class="ghost" data-add-set>＋ подход</div>';
      addExc.before(tpl);
      $('.ename', tpl).focus();
      return;
    }
  });

  /* ---------- finish button ---------- */
  document.addEventListener('click', (e) => {
    const f = e.target.closest('.fbtn');
    if (f) { f.textContent = '✓ Сохранено!'; f.style.background = 'var(--coral)'; setTimeout(() => { f.textContent = 'Завершить тренировку'; f.style.background = ''; }, 1400); }
  });

  function flash(el) { el.style.transition = 'none'; el.style.color = 'var(--accent-ink)'; setTimeout(() => { el.style.transition = 'color .4s'; el.style.color = ''; }, 30); }

  /* ================= VARIANT B — focus ================= */
  const B = [
    { name: 'Приседания', d: [{ l: 'ВЕС · КГ', v: 62, s: 2.5 }, { l: 'ПОВТОРЫ', v: 8, s: 1 }], total: 4, done: 2 },
    { name: 'Жим ногами', d: [{ l: 'ВЕС · КГ', v: 120, s: 5 }, { l: 'ПОВТОРЫ', v: 12, s: 1 }], total: 3, done: 0 },
    { name: 'Выпады', d: [{ l: 'ВЕС · КГ', v: 16, s: 2 }, { l: 'ПОВТОРЫ', v: 12, s: 1 }], total: 3, done: 0 },
    { name: 'Планка', d: [{ l: 'ВРЕМЯ · СЕК', v: 45, s: 5 }], total: 3, done: 0 },
  ];
  let bIdx = 0;
  function bRender() {
    const ex = B[bIdx];
    $('#bName').textContent = ex.name;
    const cur = Math.min(ex.done + 1, ex.total);
    $('#bSub').textContent = 'Подход ' + cur + ' из ' + ex.total;
    // dial 1
    $('#bL1').textContent = ex.d[0].l; $('#bV0').textContent = fmt(ex.d[0].v);
    // dial 2 optional
    const dial2 = $('#bL2').closest('.dial');
    if (ex.d[1]) { dial2.style.display = ''; $('#bL2').textContent = ex.d[1].l; $('#bV1').textContent = fmt(ex.d[1].v); }
    else dial2.style.display = 'none';
    // ticks
    const tk = $('#bTicks'); tk.innerHTML = '';
    for (let i = 0; i < ex.total; i++) {
      const t = document.createElement('span');
      t.className = 't' + (i < ex.done ? ' done' : (i === ex.done ? ' cur' : ''));
      t.textContent = i < ex.done ? '✓' : (i + 1);
      tk.appendChild(t);
    }
    // dots
    const dots = $('#bDots'); dots.innerHTML = '';
    B.forEach((_, i) => { const d = document.createElement('i'); if (i === bIdx) d.className = 'on'; dots.appendChild(d); });
    const btn = $('[data-bdone]');
    if (ex.done >= ex.total) { btn.textContent = '✓ Упражнение готово'; btn.style.background = 'var(--coral)'; }
    else { btn.textContent = '✓ Готов подход'; btn.style.background = ''; }
  }
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-bprev]')) { bIdx = (bIdx - 1 + B.length) % B.length; bRender(); }
    if (e.target.closest('[data-bnext]')) { bIdx = (bIdx + 1) % B.length; bRender(); }
    const di = e.target.closest('[data-binc]'); const dd = e.target.closest('[data-bdec]');
    if (di || dd) { const i = +(di || dd).getAttribute(di ? 'data-binc' : 'data-bdec'); const f = B[bIdx].d[i]; f.v = Math.max(0, f.v + (di ? f.s : -f.s)); bRender(); }
    if (e.target.closest('[data-bdone]')) { const ex = B[bIdx]; ex.done = Math.min(ex.total, ex.done + 1); bRender(); }
  });
  $('#bName') && $('#bName').addEventListener('input', () => { B[bIdx].name = $('#bName').textContent; });
  if ($('#bTicks')) bRender();

  /* ================= VARIANT C — quick tags + numpad ================= */
  const cPresets = { 'повт': [12, 10, 8, 15], 'кг': [52, 50, 55, 45] };
  const cSug = { 'повт': 'обычно 10–12', 'кг': 'послед. 50–52' };
  let cCell = null, cField = null, cBuf = '';
  const tray = () => $('#cTray');
  function cOpen(cell) {
    cCell = cell; cField = cell.getAttribute('data-cfield'); cBuf = '';
    $$('.cval.active').forEach((x) => x.classList.remove('active'));
    cell.classList.add('active');
    $('#cTrayLabel').textContent = cField === 'кг' ? 'Вес · кг' : 'Повторы';
    $('#cSug').textContent = cSug[cField] || '';
    // presets
    const pr = $('#cPreset'); pr.innerHTML = '';
    (cPresets[cField] || []).forEach((v, i) => {
      const b = document.createElement('button');
      b.textContent = v; if (i === 0) b.className = 'sug';
      b.addEventListener('click', () => { setCell(v); cClose(); });
      pr.appendChild(b);
    });
    // pad
    const pad = $('#cPad');
    if (!pad.dataset.built) {
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'].forEach((k) => {
        const b = document.createElement('button'); b.textContent = k;
        if (k === '✓') b.className = 'ok';
        b.addEventListener('click', () => padKey(k));
        pad.appendChild(b);
      });
      pad.dataset.built = '1';
    }
    tray().classList.add('open');
  }
  function setCell(v) { cCell.textContent = v; cCell.classList.remove('empty'); }
  function padKey(k) {
    if (!cCell) return;
    if (k === '✓') { cClose(); return; }
    if (k === '⌫') { cBuf = cBuf.slice(0, -1); cCell.textContent = cBuf || '—'; if (!cBuf) cCell.classList.add('empty'); return; }
    cBuf += k; setCell(cBuf);
  }
  function cClose() { tray().classList.remove('open'); $$('.cval.active').forEach((x) => x.classList.remove('active')); cCell = null; }
  document.addEventListener('click', (e) => {
    const cell = e.target.closest('.cval');
    if (cell) { cOpen(cell); return; }
    const cd = e.target.closest('[data-cdone]');
    if (cd) { cd.closest('.cset').classList.toggle('done'); return; }
    // tap outside tray closes
    if (tray() && tray().classList.contains('open') && !e.target.closest('#cTray') && !e.target.closest('.cval')) cClose();
  });

  /* ================= VARIANT D — free table ================= */
  document.addEventListener('click', (e) => {
    const ac = e.target.closest('[data-add-col]');
    if (ac) {
      const table = ac.closest('table');
      const th = document.createElement('th');
      th.innerHTML = '<span class="lab" contenteditable="true" spellcheck="false">Поле</span>';
      ac.before(th);
      $$('tbody tr', table).forEach((tr) => {
        const td = document.createElement('td'); td.className = 'cell';
        td.innerHTML = '<div class="cin" contenteditable="true"></div>';
        tr.lastElementChild.before(td);
      });
      $('.lab', th).focus();
      return;
    }
    const ar = e.target.closest('[data-add-row]');
    if (ar) {
      const table = ar.previousElementSibling && ar.previousElementSibling.tagName === 'TABLE'
        ? ar.previousElementSibling : ar.closest('.exc').querySelector('table');
      const body = $('tbody', table);
      const rows = $$('tr', body);
      const clone = rows[rows.length - 1].cloneNode(true);
      clone.classList.remove('done');
      clone.querySelector('[data-dnum]').textContent = rows.length + 1;
      clone.querySelectorAll('.cin').forEach((c) => (c.textContent = ''));
      body.appendChild(clone);
      return;
    }
    const dn = e.target.closest('[data-dnum]');
    if (dn) dn.closest('tr').classList.toggle('done');
  });
})();
