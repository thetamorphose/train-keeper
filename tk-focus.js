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
    { key: 'подходы',     label: 'Подходы',     unit: '',   type: 'num',  step: 1,   def: 3 },
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
   * @param {string} notes
   */
  const mkEx = (name, fields, notes = '') => ({
    id: nid(),
    name,
    done: false,
    skipped: false,
    notes,
    sessionNote: '',
    sessionRating: 0,
    fields: fields || [],
    sets: []
  });

  /**
   * Returns default application state
   */
  const DEFAULT = () => ({
    mode: 'home', history: [], templates: [], activeTemplateId: null, settingsTemplateId: null, title: 'Кросс-день', description: '',
    type: 'workout',
    i: 0, comment: '', startedAt: 0, elapsed: 0, wellBeingRating: 0,
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

  function initSetsForExercise(ex) {
    const setsField = ex.fields.find(f => f.key === 'подходы');
    if (!setsField) {
      ex.sets = [];
      return;
    }
    const count = Math.max(1, parseInt(setsField.value) || 1);
    if (!ex.sets) ex.sets = [];
    
    if (ex.sets.length !== count) {
      if (ex.sets.length < count) {
        const toAdd = count - ex.sets.length;
        for (let s = 0; s < toAdd; s++) {
          const inheritedFields = ex.fields
            .filter(f => f.key !== 'подходы')
            .map(f => ({
              id: nid(),
              key: f.key,
              label: f.label,
              unit: f.unit,
              type: f.type,
              step: f.step,
              value: f.value,
              plan: f.plan !== undefined ? f.plan : f.value,
              ph: f.ph
            }));
          ex.sets.push({
            id: nid(),
            done: false,
            skipped: false,
            fields: inheritedFields
          });
        }
      } else {
        ex.sets = ex.sets.slice(0, count);
      }
    }
  }

  const LSKEY = 'tk_focus_v4';
  let state, editId = null, menuId = null, sheetExId = null, timerInt = null, dupMode = null;
  try {
    const raw = localStorage.getItem(LSKEY);
    state = raw ? JSON.parse(raw) : DEFAULT();
    if (!state.history) state.history = [];
    if (!state.templates) state.templates = [];
    if (!state.title) state.title = 'Кросс-день';
    if (!state.description) state.description = '';
    if (!state.type) state.type = 'workout';
    if (state.wellBeingRating === undefined) state.wellBeingRating = 0;
    state.sections.forEach((s) => s.ex.forEach((e) => {
      if (e.id >= _id) _id = e.id + 1;
      if (e.skipped === undefined) e.skipped = false;
      if (e.enabled === undefined) e.enabled = true;
      if (e.notes === undefined) e.notes = '';
      if (e.sessionNote === undefined) e.sessionNote = '';
      if (e.sessionRating === undefined) e.sessionRating = 0;
      if (!e.sets) e.sets = [];
      e.fields.forEach((f) => {
        if (f.id >= _id) _id = f.id + 1;
      });
      e.sets.forEach((set) => {
        if (set.id >= _id) _id = set.id + 1;
        set.fields.forEach((f) => {
          if (f.id >= _id) _id = f.id + 1;
        });
      });
    }));
  } catch (e) { state = DEFAULT(); }
  const save = () => { try { localStorage.setItem(LSKEY, JSON.stringify(state)); } catch (e) {} };

  async function syncAll() {
    try {
      const [hRes, tRes] = await Promise.all([
        fetch('/api/history'),
        fetch('/api/templates')
      ]);
      if (hRes.ok) state.history = await hRes.json();
      if (tRes.ok) state.templates = await tRes.json();
      render();
    } catch (e) { console.error('Sync failed:', e); }
  }

  const exBody = $('#exBody');
  const curSec = () => state.sections[state.i];
  const findEx = (id) => curSec().ex.find((e) => e.id == id);
  const findField = (ex, fid) => ex.fields.find((f) => f.id == fid);

  const tkLogic = {
    addSection(state) {
      const ne = mkEx('Новое упражнение', [mkField(tpl('повторения'), 10)]);
      state.sections.push({ name: 'Новая секция', ex: [ne] });
      state.i = state.sections.length - 1;
      return ne.id;
    },
    deleteExercise(state, id) {
      const sec = state.sections[state.i];
      sec.ex = sec.ex.filter((x) => x.id != id);
      let res = { sectionDeleted: false, newEditId: null };
      if (sec.ex.length === 0) {
        state.sections.splice(state.i, 1);
        res.sectionDeleted = true;
        if (state.sections.length === 0) {
          const ne = mkEx('Новое упражнение', [mkField(tpl('повторения'), 10)]);
          state.sections.push({ name: 'Новая секция', ex: [ne] });
          state.i = 0;
          res.newEditId = ne.id;
        } else if (state.i >= state.sections.length) {
          state.i = state.sections.length - 1;
        }
      }
      return res;
    },
    async fetchTemplates(state) {
      try {
        const res = await fetch('/api/templates');
        if (res.ok) {
          state.templates = await res.json();
        }
      } catch (e) { console.error('Fetch templates failed:', e); }
    },
    async createNewTemplate(state, type = 'workout') {
      try {
        const title = type === 'habit' ? 'Новый список привычек' : 'Новый список';
        const res = await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, type, sections: [] })
        });
        if (res.ok) {
          const t = await res.json();
          state.templates.unshift(t);
          state.activeTemplateId = t.id;
          state.title = t.title;
          state.type = t.type || 'workout';
          state.sections = t.sections.length ? t.sections : [
            { 
              name: type === 'habit' ? 'Привычки' : 'Новая секция', 
              ex: [mkEx(type === 'habit' ? 'Новая привычка' : 'Новое упражнение', [mkField(tpl(type === 'habit' ? 'время' : 'повторения'), 10)])] 
            }
          ];
          state.mode = 'build';
          state.i = 0;
        }
      } catch (e) { console.error('Create template failed:', e); }
    },
    async saveTemplate(state) {
      if (!state.activeTemplateId) return;
      try {
        await fetch('/api/templates/' + state.activeTemplateId, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: state.title, type: state.type || 'workout', sections: state.sections, description: state.description })
        });
      } catch (e) { console.error('Save template failed:', e); }
    },
    cloneExercise(ex) {
      const c = JSON.parse(JSON.stringify(ex));
      c.id = nid();
      c.done = false;
      c.skipped = false;
      (c.fields || []).forEach((f) => (f.id = nid()));
      (c.sets || []).forEach((s) => (s.id = nid()));
      return c;
    },
    addExerciseToSection(sections, si, clone) {
      if (!sections || !sections[si]) return false;
      sections[si].ex.push(clone);
      return true;
    },
    exerciseStatus(ex) {
      if (ex.enabled === false) return 'disabled';
      if (ex.sets && ex.sets.length > 0) {
        const t = ex.sets.length;
        const d = ex.sets.filter((s) => s.done).length;
        const k = ex.sets.filter((s) => s.skipped).length;
        if (d > t / 2) return 'done';
        if (k > t / 2) return 'skipped';
        if (d === k && d + k === t) return 'done';
        return 'open';
      }
      if (ex.done) return 'done';
      if (ex.skipped) return 'skipped';
      return 'open';
    },
    sectionProgress(sec) {
      const p = { done: 0, skipped: 0, total: 0 };
      for (const e of sec.ex) {
        if (e.enabled === false) continue;
        p.total++;
        const st = this.exerciseStatus(e);
        if (st === 'done') p.done++;
        else if (st === 'skipped') p.skipped++;
      }
      return p;
    },
    setExerciseEnabled(state, id, enabled) {
      for (const sec of state.sections) {
        const ex = sec.ex.find((x) => x.id == id);
        if (ex) { ex.enabled = !!enabled; return true; }
      }
      return false;
    },
    isEnabled(e) { return e.enabled !== false; },
    moveExerciseUp(state, id) {
      const sec = state.sections[state.i];
      const idx = sec.ex.findIndex(x => x.id == id);
      if (idx > 0) {
        const temp = sec.ex[idx];
        sec.ex[idx] = sec.ex[idx - 1];
        sec.ex[idx - 1] = temp;
      }
    },
    moveExerciseDown(state, id) {
      const sec = state.sections[state.i];
      const idx = sec.ex.findIndex(x => x.id == id);
      if (idx !== -1 && idx < sec.ex.length - 1) {
        const temp = sec.ex[idx];
        sec.ex[idx] = sec.ex[idx + 1];
        sec.ex[idx + 1] = temp;
      }
    }
  };
  if (typeof window !== 'undefined') {
    window.__tkLogic = tkLogic;
    window.__tkState = state;
    window.initSetsForExercise = initSetsForExercise;
    window.__tkRender = render;
    window.__tkTrackSectionTime = trackSectionTime;
    window.__tkSwitchSection = switchSection;
  }

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

  function setFieldHTML(ex, set, f) {
    if (f.type === 'text') {
      return '<span class="set-tpill" contenteditable="true" spellcheck="false" data-act="set-text" data-ex-id="' + ex.id + '" data-set-id="' + set.id + '" data-fid="' + f.id + '" data-ph="' + esc(f.ph || '—') + '">' + esc(f.value || '') + '</span>';
    }
    const disp = f.type === 'time' ? mmss(f.value) : fmt(f.value);
    const unit = f.type === 'time' ? 'мин:сек' : f.unit;
    return '<span class="set-mstep">' +
      '<button data-act="set-dec" data-ex-id="' + ex.id + '" data-set-id="' + set.id + '" data-fid="' + f.id + '">−</button>' +
      '<span class="v" contenteditable="true" spellcheck="false" data-act="set-val" data-ex-id="' + ex.id + '" data-set-id="' + set.id + '" data-fid="' + f.id + '">' + disp + '</span>' +
      '<button data-act="set-inc" data-ex-id="' + ex.id + '" data-set-id="' + set.id + '" data-fid="' + f.id + '">+</button>' +
      '</span>' + (unit ? '<span class="set-funit">' + esc(unit) + '</span>' : '');
  }

  function setRowHTML(ex, set, index) {
    const cls = 'set-row' + (set.done ? ' done' : '') + (set.skipped ? ' skipped' : '');
    let h = '<div class="' + cls + '" data-ex-id="' + ex.id + '" data-set-id="' + set.id + '" data-act="set-row">';
    h += '<button class="set-check-btn" data-act="set-toggle" data-ex-id="' + ex.id + '" data-set-id="' + set.id + '">';
    if (set.done) h += '✓';
    else if (set.skipped) h += '✕';
    h += '</button>';
    h += '<span class="set-num">Сет ' + (index + 1) + '</span>';
    h += '<div class="set-fields">' + set.fields.map(f => setFieldHTML(ex, set, f)).join('') + '</div>';
    h += '</div>';
    return h;
  }

  function cardHTML(ex) {
    const active = state.mode === 'active';
    const editing = ex.id === editId && state.mode === 'build';
    const canCheck = active || (state.type === 'habit' && state.mode === 'build' && !editing);
    const disabled = ex.enabled === false;
    const cls = 'card' + (canCheck ? ' tappable' : '') + ((active || state.type === 'habit') && ex.done ? ' done' : '') + ((active || state.type === 'habit') && ex.skipped ? ' skipped' : '') + (editing ? ' editing' : '') + (disabled ? ' disabled' : '');
    let h = '<div class="' + cls + '"' + (canCheck ? ' data-act="toggle" data-id="' + ex.id + '"' : '') + '>';
    h += '<div class="card-top">';
    if (canCheck) {
      if (ex.skipped) h += '<span class="check skipped">✕</span>';
      else h += '<span class="check">✓</span>';
    }
    h += '<span class="cname"' + (editing ? ' contenteditable="true" spellcheck="false" data-act="cname" data-id="' + ex.id + '"' : '') + '>' + esc(ex.name) + '</span>';
    if (state.mode === 'build') h += '<button class="kebab" data-act="menu" data-id="' + ex.id + '">⋯</button>';
    h += '</div>';
    if (editing) {
      h += '<div class="ex-notes-edit"><textarea class="ex-notes-input" data-act="exnotes" data-id="' + ex.id + '" placeholder="Заметки по технике и особенности...">' + esc(ex.notes || '') + '</textarea></div>';
    } else if (ex.notes) {
      h += '<div class="ex-notes-display">📝 ' + esc(ex.notes) + '</div>';
    }
    if (active) {
      const fbOpen = sheetExId == ex.id;
      const emojis = { 1: '😞', 2: '😐', 3: '🙂', 4: '😃', 5: '🤩' };
      const hasFb = ex.sessionRating || ex.sessionNote;
      h += '<div class="sfb">';
      h += '<button class="sfb-toggle' + (fbOpen || hasFb ? ' open' : '') + '" data-act="sfb-toggle" data-id="' + ex.id + '">' + (ex.sessionRating ? emojis[ex.sessionRating] + ' ' : '') + (ex.sessionNote ? '💬 ' + esc(ex.sessionNote.slice(0, 30)) : '💬 Как прошло?') + '</button>';
      if (fbOpen) {
        h += '<div class="sfb-body">';
        h += '<div class="wb-rating">' + [1, 2, 3, 4, 5].map(r => '<button class="wb-btn' + (ex.sessionRating === r ? ' active' : '') + '" data-act="sfb-rate" data-id="' + ex.id + '" data-val="' + r + '">' + emojis[r] + '</button>').join('') + '</div>';
        h += '<textarea class="sfb-note" data-act="sfbnote" data-id="' + ex.id + '" placeholder="Комментарий к упражнению...">' + esc(ex.sessionNote || '') + '</textarea>';
        h += '</div>';
      }
      h += '</div>';
    }
    if (canCheck && ex.sets && ex.sets.length > 0) {
      const planStr = ex.fields.map(f => {
        if (f.key === 'подходы') return f.value + ' подх.';
        return f.value + (f.unit ? ' ' + f.unit : '');
      }).join(' · ');
      h += '<div class="card-target">План: ' + esc(planStr) + '</div>';
      h += '<div class="sets-list">' + ex.sets.map((s, idx) => setRowHTML(ex, s, idx)).join('') + '</div>';
    } else {
      if (ex.fields.length) h += '<div class="fldrow">' + ex.fields.map((f) => fieldHTML(ex, f, editing)).join('') + '</div>';
    }
    if (editing) h += '<div class="cardedit"><span class="addfield" data-act="addfield" data-id="' + ex.id + '">＋ поле</span><button class="editdone" data-act="editdone" data-id="' + ex.id + '">Готово</button></div>';
    if (ex.id === menuId && state.mode === 'build') {
      const idx = curSec().ex.indexOf(ex);
      const isFirst = idx === 0;
      const isLast = idx === curSec().ex.length - 1;
      h += '<div class="kmenu">';
      if (dupMode === 'section') {
        h += '<button data-act="dupback" data-id="' + ex.id + '">← К меню</button>';
        h += state.sections.map((s, si) => '<button data-act="dupgo" data-si="' + si + '" data-id="' + ex.id + '">' + esc(s.name || 'Секция ' + (si + 1)) + '</button>').join('') + '</div>';
      } else if (dupMode === 'workout') {
        h += '<button data-act="dupback" data-id="' + ex.id + '">← К меню</button>';
        const others = (state.templates || []).filter((t) => t.id !== state.activeTemplateId);
        h += (others.length
          ? others.map((t) => '<button data-act="duppick" data-tid="' + t.id + '" data-id="' + ex.id + '">' + esc(t.title || 'Без названия') + '</button>').join('')
          : '<span class="dupempty">Нет других списков</span>') + '</div>';
      } else if (dupMode && typeof dupMode === 'object') {
        const t = (state.templates || []).find((x) => x.id === dupMode.tid);
        h += '<button data-act="dupback" data-id="' + ex.id + '">← К спискам</button>';
        h += ((t && t.sections && t.sections.length)
          ? t.sections.map((s, si) => '<button data-act="dupgo2" data-tid="' + t.id + '" data-si="' + si + '" data-id="' + ex.id + '">' + esc(s.name || 'Секция ' + (si + 1)) + '</button>').join('')
          : '<span class="dupempty">В этом списке нет секций</span>') + '</div>';
      } else {
        if (!isFirst) h += '<button data-act="moveup" data-id="' + ex.id + '">▲ Переместить вверх</button>';
        if (!isLast) h += '<button data-act="movedown" data-id="' + ex.id + '">▼ Переместить вниз</button>';
        h += '<button data-act="dup" data-id="' + ex.id + '">Дублировать</button><button data-act="dupsec" data-id="' + ex.id + '">В секцию…</button><button data-act="dupwrk" data-id="' + ex.id + '">В тренировку…</button><button data-act="toggle-en" data-id="' + ex.id + '">' + (disabled ? 'Включить' : 'Выключить') + '</button><button data-act="edit" data-id="' + ex.id + '">Изменить</button><button class="danger" data-act="del" data-id="' + ex.id + '">Удалить</button></div>';
      }
      h += '</div>';
    }
    h += '</div>';
    return h;
  }

  /* ---------------- summary render ---------------- */
  function summaryHTML() {
    let diffs = 0, total = 0;
    state.sections.forEach((s) => s.ex.forEach((e) => {
      if (e.sets && e.sets.length > 0) {
        e.sets.forEach((set) => set.fields.forEach((f) => {
          total++;
          const parentField = e.fields.find(pf => pf.key === f.key);
          const plan = (parentField && parentField.plan !== undefined) ? parentField.plan : f.value;
          if (isDiff({ ...f, plan })) diffs++;
        }));
      } else {
        e.fields.forEach((f) => {
          total++;
          if (isDiff(f)) diffs++;
        });
      }
    }));
    let h = '<div class="summary">';
    const isHabit = state.type === 'habit';
    const titleText = isHabit ? 'Чек-лист выполнен' : 'Тренировка завершена';
    const subText = isHabit 
      ? (diffs ? '<span class="hl">' + diffs + ' откл. от плана</span>' : 'всё выполнено') 
      : ('⏱ ' + mmss(Math.floor(state.elapsed / 1000)) + ' · ' + (diffs ? '<span class="hl">' + diffs + ' откл. от плана</span>' : 'всё по плану'));
    h += '<div class="sumhead"><div class="big">' + titleText + '</div>' +
      '<div class="sub">' + subText + '</div></div>';
    const sectionTimes = state.sectionTimes || [];
    state.sections.forEach((s, si) => {
      const timeBadge = (!isHabit && sectionTimes[si]) ? ' <span class="sec-time">⏱ ' + mmss(sectionTimes[si]) + '</span>' : '';
      h += '<table class="rtable"><tr class="sech"><td>' + esc(s.name) + timeBadge + '</td><td class="hd">План</td><td class="hd">Факт</td></tr>';
      s.ex.forEach((e) => {
        let statusText = '';
        if (e.skipped) statusText = ' <span class="skip skipped-status">пропущено</span>';
        else if (!e.done) statusText = ' <span class="skip">не отмечено</span>';
        const emojis = { 1: '😞', 2: '😐', 3: '🙂', 4: '😃', 5: '🤩' };
        const fb = (e.sessionRating ? ' <span class="sfb-emoji">' + emojis[e.sessionRating] + '</span>' : '') +
          (e.sessionNote ? ' <div class="sfb-summary-note">💬 ' + esc(e.sessionNote) + '</div>' : '');

        h += '<tr class="exh"><td colspan="3">' + esc(e.name) + statusText + fb + '</td></tr>';
        
        if (e.sets && e.sets.length > 0) {
          e.sets.forEach((set, setIdx) => {
            let setStatus = '';
            if (set.skipped) setStatus = ' <span class="skip skipped-status">(пропущен)</span>';
            else if (!set.done) setStatus = ' <span class="skip">(не отмечен)</span>';
            
            h += '<tr class="seth-row"><td colspan="3" class="set-label-cell">Подход ' + (setIdx + 1) + setStatus + '</td></tr>';
            
            set.fields.forEach((f) => {
              const parentField = e.fields.find(pf => pf.key === f.key);
              const plan = (parentField && parentField.plan !== undefined) ? parentField.plan : f.value;
              const diff = isDiff({ ...f, plan });
              let arrow = '';
              if (diff && f.type !== 'text') arrow = Number(f.value) < Number(plan) ? ' ↓' : ' ↑';
              else if (diff) arrow = ' ✎';
              
              h += '<tr><td class="fl indent-fl">' + esc(f.label) + '</td><td class="pl">' + esc(dispVal(f, plan)) + '</td>' +
                '<td class="fa' + (diff ? ' diff' : '') + '">' + esc(dispVal(f, f.value)) + arrow + '</td></tr>';
            });
          });
        } else {
          e.fields.forEach((f) => {
            const plan = f.plan === undefined ? f.value : f.plan;
            const diff = isDiff(f);
            let arrow = '';
            if (diff && f.type !== 'text') arrow = Number(f.value) < Number(plan) ? ' ↓' : ' ↑';
            else if (diff) arrow = ' ✎';
            h += '<tr><td class="fl">' + esc(f.label) + '</td><td class="pl">' + esc(dispVal(f, plan)) + '</td>' +
              '<td class="fa' + (diff ? ' diff' : '') + '">' + esc(dispVal(f, f.value)) + arrow + '</td></tr>';
          });
        }
      });
      h += '</table>';
    });
    h += '<div class="wellbeing-box"><div class="clab">Самочувствие</div>' +
      '<div class="wb-rating">';
    const emojis = { 1: '😞', 2: '😐', 3: '🙂', 4: '😃', 5: '🤩' };
    for (let rating = 1; rating <= 5; rating++) {
      const activeClass = state.wellBeingRating === rating ? ' active' : '';
      const disabledAttr = '';
      h += '<button class="wb-btn' + activeClass + '" data-act="rate-wellbeing" data-val="' + rating + '"' + disabledAttr + '>' +
        '<span class="wb-emoji">' + emojis[rating] + '</span>' +
        '<span class="wb-num">' + rating + '</span>' +
        '</button>';
    }
    h += '</div></div>';

    h += '<div class="commentbox"><div class="clab">Комментарий к тренировке</div>' +
      '<textarea class="comment" data-act="comment" placeholder="Как прошло? Самочувствие, заметки…">' + esc(state.comment || '') + '</textarea></div>';
    h += '<div class="legend-diff"><span class="sw"></span> — значение отличается от запланированного</div>';
    h += '</div>';
    return h;
  }

  /* ---------------- home render ---------------- */
  function homeHTML() {
    let h = '<div class="home">';
    
    h += '<div class="h-head">Мои списки</div>';
    if (!state.templates || state.templates.length === 0) {
      h += '<div class="h-empty">У вас пока нет списков. Создайте первый!</div>';
    } else {
      h += '<div class="h-list templates">' + state.templates.map((t) => {
        const isHabit = t.type === 'habit';
        const typeBadge = isHabit 
          ? '<span class="h-badge habit">привычки</span>' 
          : '<span class="h-badge">тренировка</span>';
        return '<div class="h-item template" data-act="viewtemplate" data-tid="' + t.id + '">' +
          '<div class="h-top"><span class="h-title">' + esc(t.title || 'Без названия') + '</span>' + typeBadge +
          '<button class="h-menu" data-act="tmenu" data-tid="' + t.id + '" title="Действия">⋯</button><span class="h-arrow">›</span></div>' +
          '<div class="h-stats">' + (t.sections ? t.sections.length : 0) + ' секций</div>' +
          (t.id === menuId ? '<div class="kmenu"><button data-act="tdup" data-tid="' + t.id + '">Дублировать</button><button data-act="tset" data-tid="' + t.id + '">Настройки</button><button class="danger" data-act="tdel" data-tid="' + t.id + '">Удалить</button></div>' : '') +
          '</div>';
      }).join('') + '</div>';
    }
    h += '<div class="h-actions" style="display:flex; flex-direction:column; gap:8px;">' +
      '<button class="secbtn go" data-act="createtemplate" data-type="workout">＋ Новый список тренировок</button>' +
      '<button class="secbtn finish" data-act="createtemplate" data-type="habit">＋ Новый список привычек</button>' +
      '</div>';

    h += '<div class="h-head" style="margin-top: 32px">История</div>';
    if (!state.history || state.history.length === 0) {
      h += '<div class="h-empty">История пока пуста.</div>';
    } else {
      h += '<div class="h-list">' + state.history.map((h, idx) => {
        const ratingVal = h.wellBeingRating;
        const ratingStars = ratingVal ? ' · ⭐ ' + ratingVal + '/5' : '';
        const stats = (h.type === 'habit' ? 'привычки' : '⏱ ' + mmss(Math.floor(h.elapsed / 1000))) + ratingStars;
        return '<div class="h-item" data-act="viewhistory" data-i="' + idx + '">' +
          '<div class="h-top"><span class="h-title">' + esc(h.title || 'Тренировка') + '</span><span class="h-date">' + new Date(h.date).toLocaleDateString() + '</span></div>' +
          '<div class="h-stats">' + stats + '</div>' +
          '<button class="h-del" data-act="delhistory" data-i="' + idx + '" title="Удалить запись">✕</button>' +
          '</div>';
      }).join('') + '</div>';
    }
    h += '</div>';
    return h;
  }

  /* ---------------- main render ---------------- */
  /**
   * Main rendering function. Updates the DOM based on the current application state.
   */
  const secfootHTML = () => '<div class="secfoot"><button class="secbtn ghost" id="secbtn" data-act="nextsec">—</button></div>';

  function render() {
    const mode = state.mode;
    updateHeaderCollapse();
    const snav = $('#snav'), dots = $('#dots'), wtitle = $('#wtitle'), wpill = $('#wpill'), crumb = $('#crumb');
    const wdesc = $('#wdesc');

    const backBtn = $('#backBtn') || (() => {
      const btn = document.createElement('button');
      btn.id = 'backBtn';
      btn.className = 'back-btn';
      btn.dataset.act = 'back';
      btn.textContent = '← Назад';
      if (crumb && crumb.parentNode) {
        crumb.parentNode.insertBefore(btn, crumb);
      } else {
        document.body.appendChild(btn);
      }
      return btn;
    })();
    backBtn.style.display = mode === 'build' ? '' : 'none';

    if (wdesc) {
      wdesc.textContent = state.description || '';
      wdesc.contentEditable = mode === 'build' ? 'true' : 'false';
      wdesc.style.display = (mode === 'active' && !state.description) ? 'none' : '';
    }

    if (mode === 'settings') {
      snav.style.display = 'none'; dots.style.display = 'none';
      crumb.textContent = 'Настройки';
      const t = (state.templates || []).find((x) => x.id === state.settingsTemplateId);
      wtitle.textContent = t ? (t.title || 'Без названия') : 'Настройки';
      wtitle.contentEditable = 'false';
      if (wdesc) wdesc.style.display = 'none';
      wpill.className = 'timer mono'; wpill.textContent = '⚙';
      exBody.innerHTML = '<div class="home"><div class="h-empty">Страница настроек — параметры появятся позже.</div></div>' + secfootHTML();
      const btn = $('#secbtn'); btn.className = 'secbtn go'; btn.dataset.act = 'closesettings';
      btn.textContent = '← К спискам';
      save(); return;
    }
    if (mode === 'home') {
      snav.style.display = 'none'; dots.style.display = 'none';
      crumb.textContent = 'Главная';
      wtitle.textContent = 'Train Keeper'; wtitle.contentEditable = 'false';
      wpill.className = 'timer draft mono'; wpill.textContent = 'архив';
      if (wdesc) wdesc.style.display = 'none';
      exBody.innerHTML = homeHTML() + secfootHTML();
      $('#secbtn').style.display = 'none';
      save(); return;
    }
    const sb = $('#secbtn'); if (sb) sb.style.display = '';

    if (mode === 'summary') {
      snav.style.display = 'none'; dots.style.display = 'none';
      crumb.textContent = state.isViewingHistory ? 'История' : 'Итог';
      wtitle.textContent = state.title;
      wtitle.contentEditable = 'false'; wpill.className = 'timer mono'; wpill.textContent = '✓ готово';
      if (wdesc) wdesc.style.display = 'none';
      exBody.innerHTML = summaryHTML() + secfootHTML();
      const btn = $('#secbtn'); btn.className = 'secbtn go'; btn.dataset.act = 'closesummary';
      btn.textContent = state.isViewingHistory ? '← Назад к истории' : 'Готово · к редактированию';
      save(); return;
    }

    snav.style.display = ''; dots.style.display = '';
    wtitle.textContent = state.title;
    const sec = curSec();
    $('#sname').textContent = sec.name;
    const prog = tkLogic.sectionProgress(sec), total = prog.total, done = prog.done, skipped = prog.skipped;
    crumb.textContent = mode === 'active' ? 'Активная тренировка' : 'Создание тренировки';
    wtitle.contentEditable = mode === 'build' ? 'true' : 'false';
    
    if (mode === 'active') { wpill.className = 'timer mono'; wpill.textContent = '⏱ ' + mmss(Math.floor((Date.now() - state.startedAt) / 1000)); }
    else { 
      wpill.className = 'timer draft mono'; 
      wpill.textContent = state.type === 'habit' ? 'привычки' : 'черновик'; 
    }
    const showProgress = mode === 'active' || (mode === 'build' && state.type === 'habit');
    $('#ssub').textContent = 'Секция ' + (state.i + 1) + ' из ' + state.sections.length +
      (showProgress ? ' · выполнено ' + done + '/' + total + (skipped ? ' · пропущено ' + skipped : '') : ' · ' + total + ' упр.');

    const renderEx = mode === 'active' ? sec.ex.filter(tkLogic.isEnabled) : sec.ex;
    let h = renderEx.map(cardHTML).join('');
    if (mode === 'build') h += '<div class="addexc" data-act="addexc">＋ упражнение</div>';
    h += secfootHTML();
    exBody.innerHTML = h;

    dots.innerHTML = state.sections.map((s, k) => {
      const full = (mode === 'active' || state.type === 'habit') && s.ex.length && s.ex.every((e) => e.enabled === false || e.done || e.skipped);
      return '<i class="' + (k === state.i ? 'on ' : '') + (full ? 'full' : '') + '" data-act="dot" data-i="' + k + '"></i>';
    }).join('') + (mode === 'build' ? '<i class="addx" data-act="addsec" title="добавить секцию"></i>' : '');

    const btn = $('#secbtn'), last = state.i === state.sections.length - 1;
    if (mode === 'build') { 
      if (state.type === 'habit') {
        if (done === 0) {
          btn.className = 'secbtn reset-btn'; 
          btn.dataset.act = 'resethabits'; 
          btn.textContent = 'Сбросить отметки';
        } else if (done < total) {
          btn.className = 'secbtn ghost'; 
          btn.dataset.act = 'nextsec'; 
          btn.textContent = 'Выполнено ' + done + ' из ' + total;
        } else if (!last) {
          btn.className = 'secbtn go'; 
          btn.dataset.act = 'nextsec'; 
          btn.textContent = 'Следующая секция →';
        } else {
          btn.className = 'secbtn finish'; 
          btn.dataset.act = 'nextsec'; 
          btn.textContent = '✓ Завершить';
        }
      } else {
        btn.className = 'secbtn go'; 
        btn.dataset.act = 'startworkout'; 
        btn.textContent = '▶ Начать тренировку'; 
      }
    }
    else if (total === 0) { btn.className = 'secbtn ghost'; btn.dataset.act = 'nextsec'; btn.textContent = 'Нет упражнений'; }
    else if (done + skipped < total) { btn.className = 'secbtn ghost'; btn.dataset.act = 'nextsec'; btn.textContent = 'Выполнено ' + done + (skipped ? ' · пропущено ' + skipped : '') + ' из ' + total; }
    else if (!last) { btn.className = 'secbtn go'; btn.dataset.act = 'nextsec'; btn.textContent = 'Следующая секция →'; }
    else { btn.className = 'secbtn finish'; btn.dataset.act = 'nextsec'; btn.textContent = '✓ Завершить тренировку'; }
    save();
  }

  /* ---------------- timer ---------------- */
  function startTimer() { stopTimer(); timerInt = setInterval(() => { if (state.mode === 'active') { const p = $('#wpill'); if (p) p.textContent = '⏱ ' + mmss(Math.floor((Date.now() - state.startedAt) / 1000)); } }, 1000); }
  function stopTimer() { if (timerInt) clearInterval(timerInt); timerInt = null; }

  /* ---------------- header collapse on scroll (specs/009) ---------------- */
  function updateHeaderCollapse() {
    const screen = $('#screen');
    if (!screen) return;
    if (state.mode !== 'active') { screen.classList.remove('scrolled'); return; }
    screen.classList.toggle('scrolled', exBody.scrollTop > 40);
  }
  exBody.addEventListener('scroll', updateHeaderCollapse, { passive: true });

  /* ---------------- mode transitions ---------------- */
  /**
   * Transition from 'build' to 'active' mode
   */
  function startWorkout() {
    state.mode = 'active'; state.i = 0; state.startedAt = Date.now(); state.comment = ''; state.wellBeingRating = 0;
    state.sectionTimes = [0]; state.curSectionStartedAt = Date.now();
    state.sections.forEach((s) => s.ex.forEach((e) => {
      e.done = false;
      e.skipped = false;
      e.sessionNote = '';
      e.sessionRating = 0;
      if (e.enabled === undefined) e.enabled = true;
      e.fields.forEach((f) => { f.plan = f.value; });
      initSetsForExercise(e);
      if (e.sets) e.sets.forEach((set) => { set.done = false; set.skipped = false; });
    }));
    editId = null; menuId = null; render(); startTimer(); exBody.scrollTop = 0;
  }
  
  /* ---------------- per-section time tracking (specs/011) ---------------- */
  function trackSectionTime(state, now) {
    if (state.mode !== 'active' || !state.startedAt) return;
    if (!state.sectionTimes) state.sectionTimes = [];
    if (state.curSectionStartedAt === undefined || state.curSectionStartedAt === null) {
      state.curSectionStartedAt = state.startedAt;
    }
    const delta = Math.max(0, Math.floor((now - state.curSectionStartedAt) / 1000));
    state.sectionTimes[state.i] = (state.sectionTimes[state.i] || 0) + delta;
    state.curSectionStartedAt = now;
  }
  function switchSection(state, newIndex, now) {
    if (state.mode === 'active') trackSectionTime(state, now || Date.now());
    state.i = newIndex;
  }

  /**
   * Transition from 'active' to 'summary' mode
   */
  function finishWorkout() { trackSectionTime(state, Date.now()); state.mode = 'summary'; state.elapsed = state.type === 'habit' ? 0 : Date.now() - state.startedAt; state.curSectionStartedAt = null; stopTimer(); render(); exBody.scrollTop = 0; }
  
  /**
   * Handle summary closure: either save to history or return from history view
   */
  function syncHistoryEntry(entry) {
    fetch('/api/history/' + entry.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wellBeingRating: entry.wellBeingRating, comment: entry.comment })
    });
  }

  function closeSummary() {
    if (state.isViewingHistory) {
      state.isViewingHistory = false;
      const draft = JSON.parse(localStorage.getItem(LSKEY + '_draft'));
      if (draft) {
        const history = state.history;
        const templates = state.templates;
        Object.assign(state, draft);
        state.history = history;
        state.templates = templates;
      }
      state.mode = 'home';
      render(); exBody.scrollTop = 0;
      return;
    }
    const finished = {
      title: state.title || $('#wtitle').textContent || 'Тренировка',
      type: state.type || 'workout',
      date: Date.now(),
      elapsed: state.elapsed,
      comment: state.comment,
      wellBeingRating: state.wellBeingRating || 0,
      sections: state.sections
        .map((s) => ({ ...s, ex: s.ex.filter((e) => e.enabled !== false) }))
        .filter((s) => s.ex.length > 0)
        .map((s) => JSON.parse(JSON.stringify(s))),
      sectionTimes: (state.sectionTimes || []).slice()
    };

    // Save to server
    fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finished)
    }).then(syncAll);

    state.mode = 'home';
    state.i = 0;
    state.comment = '';
    state.wellBeingRating = 0;
    state.sectionTimes = [];
    state.curSectionStartedAt = null;
    state.sections.forEach((s) => s.ex.forEach((e) => { 
      e.done = false; 
      e.skipped = false;
      e.sessionNote = '';
      e.sessionRating = 0;
      if (e.sets) {
        e.sets.forEach((set) => {
          set.done = false;
          set.skipped = false;
        });
      }
      e.fields.forEach((f) => { if (f.plan !== undefined) f.value = f.plan; }); 
    }));
    if (state.type === 'habit') {
      tkLogic.saveTemplate(state);
    }
    render(); exBody.scrollTop = 0;
  }

  /* ---------------- long-press detection for skipping ---------------- */
  let longPressTimer = null;
  let isLongPress = false;
  let pressX = 0, pressY = 0;

  function startPress(e, element) {
    if (state.mode !== 'active') return;
    isLongPress = false;
    const touch = e.touches ? e.touches[0] : e;
    pressX = touch.clientX;
    pressY = touch.clientY;
    
    longPressTimer = setTimeout(() => {
      isLongPress = true;
      const act = element.dataset.act;
      const exId = element.dataset.id || element.dataset.exId;
      const setId = element.dataset.setId;
      
      if (act === 'toggle' && exId) {
        const ex = findEx(exId);
        if (ex && (!ex.sets || ex.sets.length === 0)) {
          ex.skipped = !ex.skipped;
          if (ex.skipped) ex.done = false;
          render();
          toast(ex.skipped ? 'Упражнение пропущено' : 'Упражнение возвращено');
        }
      } else if ((act === 'set-row' || act === 'set-toggle') && exId && setId) {
        const ex = findEx(exId);
        if (ex && ex.sets) {
          const set = ex.sets.find(s => s.id == setId);
          if (set) {
            set.skipped = !set.skipped;
            if (set.skipped) set.done = false;
            const st = tkLogic.exerciseStatus(ex);
            ex.done = st === 'done';
            ex.skipped = st === 'skipped';
            render();
            toast(set.skipped ? 'Подход пропущен' : 'Подход возвращен');
          }
        }
      }
    }, 600);
  }

  function cancelPress() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }

  document.addEventListener('mousedown', (e) => {
    if (!e.target || typeof e.target.closest !== 'function') return;
    const el = e.target.closest('[data-act="toggle"], [data-act="set-row"], [data-act="set-toggle"]');
    if (el) startPress(e, el);
  });

  document.addEventListener('touchstart', (e) => {
    if (!e.target || typeof e.target.closest !== 'function') return;
    const el = e.target.closest('[data-act="toggle"], [data-act="set-row"], [data-act="set-toggle"]');
    if (el) startPress(e, el);
  }, { passive: true });

  document.addEventListener('mousemove', (e) => {
    if (longPressTimer) {
      const touch = e.touches ? e.touches[0] : e;
      if (Math.abs(touch.clientX - pressX) > 10 || Math.abs(touch.clientY - pressY) > 10) {
        cancelPress();
      }
    }
  });

  document.addEventListener('touchmove', (e) => {
    if (longPressTimer) {
      const touch = e.touches ? e.touches[0] : e;
      if (Math.abs(touch.clientX - pressX) > 10 || Math.abs(touch.clientY - pressY) > 10) {
        cancelPress();
      }
    }
  }, { passive: true });

  document.addEventListener('mouseup', cancelPress);
  document.addEventListener('touchend', cancelPress);

  /* ---------------- interactions ---------------- */
  document.addEventListener('click', (e) => {
    if (isLongPress) {
      isLongPress = false;
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (!e.target || typeof e.target.closest !== 'function') return;
    if (menuId !== null && !e.target.closest('.kmenu') && !(e.target.closest('[data-act]') && ['menu', 'tmenu'].includes(e.target.closest('[data-act]').dataset.act))) { menuId = null; dupMode = null; render(); return; }
    const el = e.target.closest('[data-act]'); if (!el) return;
    const act = el.dataset.act,
          id = el.dataset.id || el.dataset.exId,
          fid = el.dataset.fid,
          i = el.dataset.i,
          tid = el.dataset.tid,
          si = el.dataset.si,
          setId = el.dataset.setId;
    const ex = id ? findEx(id) : null;
    switch (act) {
      case 'val': case 'text': case 'label': case 'cname': case 'secname': case 'comment': case 'exnotes': return;
      case 'back': {
        if (state.mode !== 'build') return;
        save();
        tkLogic.saveTemplate(state);
        state.activeTemplateId = null;
        state.i = 0;
        state.mode = 'home';
        editId = null;
        menuId = null;
        render();
        return;
      }
      case 'newworkout': state.mode = 'build'; render(); return;
      case 'createtemplate': {
        const type = el.dataset.type || 'workout';
        tkLogic.createNewTemplate(state, type).then(render);
        return;
      }
      case 'tmenu': menuId = (menuId === tid ? null : tid); render(); return;
      case 'tdup': {
        menuId = null;
        fetch('/api/templates/' + tid + '/duplicate', { method: 'POST' }).then(async (r) => {
          if (r.ok) { await tkLogic.fetchTemplates(state); render(); toast('Список продублирован'); }
        });
        return;
      }
      case 'tset': {
        const t = state.templates.find((x) => x.id === tid);
        if (!t) return;
        menuId = null; dupMode = null;
        state.settingsTemplateId = tid; state.mode = 'settings'; state.title = t.title;
        render();
        return;
      }
      case 'closesettings': state.mode = 'home'; render(); return;
      case 'tdel': {
        const t = state.templates.find(x => x.id === tid);
        if (!t) return;
        menuId = null;
        if (!confirm('Удалить «' + (t.title || 'Без названия') + '»?')) { render(); return; }
        fetch('/api/templates/' + tid, { method: 'DELETE' }).then(async () => {
          if (state.activeTemplateId === tid) state.activeTemplateId = null;
          await tkLogic.fetchTemplates(state);
          render();
          toast('Список удалён');
        });
        return;
      }
      case 'viewtemplate': {
        const t = state.templates.find(x => x.id === tid);
        if (t) {
          state.activeTemplateId = t.id;
          state.title = t.title;
          state.type = t.type || 'workout';
          state.description = t.description || '';
          state.sections = t.sections.length ? JSON.parse(JSON.stringify(t.sections)) : [
            { 
              name: t.type === 'habit' ? 'Привычки' : 'Новая секция', 
              ex: [mkEx(t.type === 'habit' ? 'Новая привычка' : 'Новое упражнение', [mkField(tpl(t.type === 'habit' ? 'время' : 'повторения'), 10)])] 
            }
          ];
          state.mode = 'build';
          state.i = 0;
          render();
        }
        return;
      }
      case 'sfb-toggle': {
        sheetExId = (sheetExId == id) ? null : id;
        render();
        return;
      }
      case 'sfb-rate': {
        const fex = findEx(id);
        if (fex) { fex.sessionRating = (+el.dataset.val === fex.sessionRating) ? 0 : +el.dataset.val; save(); }
        render();
        return;
      }
      case 'delhistory': {
        const entry = state.history[i];
        if (!entry) return;
        if (!confirm('Удалить запись «' + (entry.title || 'Тренировка') + '» от ' + new Date(entry.date).toLocaleDateString() + '?')) return;
        fetch('/api/history/' + entry.id, { method: 'DELETE' })
          .then((res) => { if (res.ok || res.status === 404) { state.history.splice(i, 1); save(); toast('Запись удалена'); render(); } })
          .catch(() => {});
        return;
      }
      case 'viewhistory': {
        const h = state.history[i];
        localStorage.setItem(LSKEY + '_draft', JSON.stringify(state));
        state.isViewingHistory = true; state.viewingHistoryIndex = i; state.mode = 'summary';
        state.title = h.title; state.elapsed = h.elapsed; state.comment = h.comment; state.wellBeingRating = h.wellBeingRating || 0; state.sections = h.sections;
        state.sectionTimes = h.sectionTimes || []; state.curSectionStartedAt = null;
        render(); return;
      }
      case 'toggle':
        if ((state.mode === 'active' || (state.mode === 'build' && state.type === 'habit')) && ex) {
          if (ex.id === editId) return;
          if (!ex.sets || ex.sets.length === 0) {
            ex.done = !ex.done;
            if (ex.done) ex.skipped = false;
            render();
            if (state.mode === 'build' && state.type === 'habit') {
              tkLogic.saveTemplate(state);
            }
          }
        }
        return;
      case 'set-toggle':
      case 'set-row':
        if ((state.mode === 'active' || (state.mode === 'build' && state.type === 'habit')) && ex && setId) {
          if (ex.id === editId) return;
          const set = ex.sets.find(s => s.id == setId);
          if (set) {
            set.done = !set.done;
            if (set.done) set.skipped = false;
            const st = tkLogic.exerciseStatus(ex);
            ex.done = st === 'done';
            ex.skipped = st === 'skipped';
            render();
            if (state.mode === 'build' && state.type === 'habit') {
              tkLogic.saveTemplate(state);
            }
          }
        }
        return;
      case 'set-inc':
      case 'set-dec':
        if (ex && setId && fid) {
          const set = ex.sets.find(s => s.id == setId);
          if (set) {
            const f = set.fields.find(x => x.id == fid);
            if (f) {
              const d = act === 'set-inc' ? f.step : -f.step;
              f.value = Math.max(0, Math.round((Number(f.value) + d) * 100) / 100);
              render();
              tkLogic.saveTemplate(state);
            }
          }
        }
        return;
      case 'moveup':
        if (state.mode === 'build' && ex) {
          tkLogic.moveExerciseUp(state, ex.id);
          menuId = null;
          render();
          tkLogic.saveTemplate(state);
        }
        return;
      case 'movedown':
        if (state.mode === 'build' && ex) {
          tkLogic.moveExerciseDown(state, ex.id);
          menuId = null;
          render();
          tkLogic.saveTemplate(state);
        }
        return;
      case 'inc': case 'dec': {
        const f = findField(ex, fid);
        const d = act === 'inc' ? f.step : -f.step;
        f.value = Math.max(0, Math.round((Number(f.value) + d) * 100) / 100);
        if (f.key === 'подходы') {
          initSetsForExercise(ex);
        }
        render();
        tkLogic.saveTemplate(state);
        return;
      }
      case 'rmfield': ex.fields = ex.fields.filter((f) => f.id != fid); render(); tkLogic.saveTemplate(state); return;
      case 'addfield': sheetExId = ex.id; openSheet(); return;
      case 'menu': menuId = (menuId === ex.id ? null : ex.id); dupMode = null; render(); return;
      case 'dupsec': dupMode = 'section'; render(); return;
      case 'dupwrk': dupMode = 'workout'; render(); return;
      case 'dupback': dupMode = (dupMode && typeof dupMode === 'object') ? 'workout' : null; render(); return;
      case 'duppick': dupMode = { tid }; render(); return;
      case 'dupgo': {
        if (!ex) return;
        const c = tkLogic.cloneExercise(ex);
        if (!tkLogic.addExerciseToSection(state.sections, +si, c)) { toast('Секция не найдена'); return; }
        menuId = null; dupMode = null; render();
        tkLogic.saveTemplate(state);
        toast('Упражнение продублировано в «' + (state.sections[+si].name || 'Секция') + '»');
        return;
      }
      case 'dupgo2': {
        if (!ex) return;
        const c = tkLogic.cloneExercise(ex);
        const targetTid = (dupMode && typeof dupMode === 'object') ? dupMode.tid : tid;
        const target = (state.templates || []).find((x) => x.id === targetTid);
        if (!target) { toast('Список не найден'); return; }
        const sections = target.sections || [];
        if (!tkLogic.addExerciseToSection(sections, +si, c)) { toast('В этом списке нет секций'); return; }
        fetch('/api/templates/' + targetTid, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sections })
        }).then(async (r) => {
          if (r.ok) {
            menuId = null; dupMode = null;
            await tkLogic.fetchTemplates(state);
            render();
            toast('Упражнение продублировано');
          }
        });
        return;
      }
      case 'dup': { const c = JSON.parse(JSON.stringify(ex)); c.id = nid(); c.done = false; c.fields.forEach((f) => (f.id = nid())); const idx = curSec().ex.indexOf(ex); curSec().ex.splice(idx + 1, 0, c); menuId = null; render(); tkLogic.saveTemplate(state); toast('Карточка продублирована'); return; }
      case 'edit': editId = ex.id; menuId = null; render(); return;
      case 'editdone': if (editId === ex.id) editId = null; render(); return;
      case 'toggle-en': {
        tkLogic.setExerciseEnabled(state, id, ex.enabled === false);
        menuId = null;
        toast(ex.enabled === false ? 'Упражнение выключено' : 'Упражнение включено');
        render();
        tkLogic.saveTemplate(state);
        return;
      }
      case 'del': {
        const res = tkLogic.deleteExercise(state, id);
        menuId = null;
        if (editId == id) editId = null;
        if (res.newEditId) editId = res.newEditId;
        toast(res.sectionDeleted ? 'Секция удалена' : 'Упражнение удалено');
        render();
        tkLogic.saveTemplate(state);
        return;
      }
      case 'addexc': { const ne = mkEx('Новое упражнение', [mkField(tpl('повторения'), 10)]); curSec().ex.push(ne); editId = ne.id; render(); tkLogic.saveTemplate(state); exBody.scrollTop = exBody.scrollHeight; return; }
      case 'dot': switchSection(state, +i); menuId = null; editId = null; render(); exBody.scrollTop = 0; return;
      case 'addsec': {
        editId = tkLogic.addSection(state);
        render();
        tkLogic.saveTemplate(state);
        exBody.scrollTop = 0;
        return;
      }
      case 'startworkout': startWorkout(); return;
      case 'closesummary': closeSummary(); return;
      case 'rate-wellbeing': {
        state.wellBeingRating = Number(el.dataset.val);
        if (state.isViewingHistory && state.viewingHistoryIndex !== undefined) {
          const entry = state.history[state.viewingHistoryIndex];
          if (entry) {
            entry.wellBeingRating = state.wellBeingRating;
            if (entry.id) syncHistoryEntry(entry);
          }
        }
        render();
        save();
        return;
      }
      case 'resethabits': {
        state.sections.forEach((s) => s.ex.forEach((e) => {
          e.done = false;
          e.skipped = false;
          if (e.sets) {
            e.sets.forEach((set) => {
              set.done = false;
              set.skipped = false;
            });
          }
        }));
        render();
        tkLogic.saveTemplate(state);
        toast('Отметки сброшены');
        return;
      }
      case 'nextsec': {
        if (state.mode !== 'active' && !(state.mode === 'build' && state.type === 'habit')) return;
        const sec = curSec(); if (!sec.ex.length || !sec.ex.every((x) => x.enabled === false || x.done || x.skipped)) return;
        if (state.i < state.sections.length - 1) { switchSection(state, state.i + 1); render(); exBody.scrollTop = 0; }
        else finishWorkout();
        return;
      }
    }
  });

  $('[data-prev]').addEventListener('click', () => { if (state.mode === 'summary') return; switchSection(state, (state.i - 1 + state.sections.length) % state.sections.length); menuId = null; editId = null; render(); exBody.scrollTop = 0; });
  $('[data-next]').addEventListener('click', () => { if (state.mode === 'summary') return; switchSection(state, (state.i + 1) % state.sections.length); menuId = null; editId = null; render(); exBody.scrollTop = 0; });

  exBody.addEventListener('input', (e) => {
    if (!e.target || typeof e.target.closest !== 'function') return;
    const el = e.target.closest('[data-act]'); if (!el) return;
    if (el.dataset.act === 'comment') { state.comment = el.value; save(); return; }
    if (el.dataset.act === 'exnotes') {
      const ex = findEx(el.dataset.id);
      if (ex) { ex.notes = el.value; tkLogic.saveTemplate(state); }
      return;
    }
    if (el.dataset.act === 'sfbnote') {
      const ex = findEx(el.dataset.id);
      if (ex) { ex.sessionNote = el.value; save(); }
      return;
    }
    const exId = el.dataset.id || el.dataset.exId;
    const ex = exId ? findEx(exId) : null;
    if (el.dataset.act === 'cname' && ex) { ex.name = el.textContent; tkLogic.saveTemplate(state); }
    else if (el.dataset.act === 'label' && ex) { const f = findField(ex, el.dataset.fid); if (f) { f.label = el.textContent; tkLogic.saveTemplate(state); } }
  });
  exBody.addEventListener('focusout', (e) => {
    if (!e.target || typeof e.target.closest !== 'function') return;
    const el = e.target.closest('[data-act]'); if (!el || el.dataset.act === 'comment' || el.dataset.act === 'exnotes') {
      if (el && el.dataset.act === 'comment' && state.isViewingHistory && state.viewingHistoryIndex !== undefined) {
        const entry = state.history[state.viewingHistoryIndex];
        if (entry) {
          entry.comment = state.comment;
          if (entry.id) syncHistoryEntry(entry);
        }
      }
      save(); return;
    }
    const exId = el.dataset.id || el.dataset.exId;
    const ex = exId ? findEx(exId) : null; if (!ex) return;
    let f = null;
    if (el.dataset.fid) {
      if (ex.sets && el.dataset.setId) {
        const set = ex.sets.find(s => s.id == el.dataset.setId);
        if (set) {
          f = set.fields.find(x => x.id == el.dataset.fid);
        }
      } else {
        f = findField(ex, el.dataset.fid);
      }
    }
    if ((el.dataset.act === 'val' || el.dataset.act === 'set-val') && f) {
      f.value = f.type === 'time' ? parseTime(el.textContent) : Math.max(0, parseFloat(el.textContent) || 0);
      if (f.key === 'подходы') {
        initSetsForExercise(ex);
      }
      render(); tkLogic.saveTemplate(state);
    }
    else if ((el.dataset.act === 'text' || el.dataset.act === 'set-text') && f) {
      f.value = el.textContent.trim();
      save(); tkLogic.saveTemplate(state);
    }
    else { save(); tkLogic.saveTemplate(state); }
  });

  $('#sname').addEventListener('input', () => { if (state.mode === 'build') { curSec().name = $('#sname').textContent; tkLogic.saveTemplate(state); } });
  $('#sname').addEventListener('focusout', save);
  $('#wtitle').addEventListener('input', () => { if (state.mode === 'build') { state.title = $('#wtitle').textContent; tkLogic.saveTemplate(state); } });
  $('#wtitle').addEventListener('focusout', save);
  $('#wdesc').addEventListener('input', () => { if (state.mode === 'build') { state.description = $('#wdesc').textContent; tkLogic.saveTemplate(state); } });
  $('#wdesc').addEventListener('focusout', save);

  /* ---------------- add-field sheet ---------------- */
  const sheet = $('#sheet'), scrim = $('#scrim'), tchips = $('#tchips');
  let custType = 'num';
  const sheetEx = () => curSec().ex.find((e) => e.id == sheetExId);
  function renderChips() { const ex = sheetEx(); const have = new Set((ex ? ex.fields : []).map((f) => f.key)); tchips.innerHTML = TEMPLATES.map((t) => '<button class="tchip' + (have.has(t.key) ? ' disabled' : '') + '" data-tpl="' + t.key + '">' + t.label + (t.unit ? ' <small>' + t.unit + '</small>' : '') + '</button>').join(''); }
  function openSheet() { renderChips(); resetCustom(); scrim.classList.add('open'); sheet.classList.add('open'); }
  function closeSheet() { scrim.classList.remove('open'); sheet.classList.remove('open'); }
  function resetCustom() { $('#cName').value = ''; $('#cUnit').value = ''; custType = 'num'; Array.from($('#cType').children).forEach((b) => b.classList.toggle('on', b.dataset.t === 'num')); $('#cUnit').style.display = ''; }
  scrim.addEventListener('click', closeSheet);
  tchips.addEventListener('click', (e) => { const b = e.target.closest('[data-tpl]'); if (!b || b.classList.contains('disabled')) return; const ex = sheetEx(); if (!ex) return; const t = tpl(b.dataset.tpl); ex.fields.push(mkField(t)); tkLogic.saveTemplate(state); closeSheet(); render(); toast('Поле «' + t.label + '» добавлено'); });
  $('#cType').addEventListener('click', (e) => { const b = e.target.closest('[data-t]'); if (!b) return; custType = b.dataset.t; Array.from($('#cType').children).forEach((x) => x.classList.toggle('on', x === b)); $('#cUnit').style.display = custType === 'num' ? '' : 'none'; });
  $('#cAdd').addEventListener('click', () => { const name = $('#cName').value.trim(); if (!name) { toast('Введите название поля'); $('#cName').focus(); return; } const ex = sheetEx(); if (!ex) return; const unit = custType === 'num' ? $('#cUnit').value.trim() : ''; ex.fields.push(mkField({ key: 'custom', label: name, unit, type: custType, step: custType === 'time' ? 5 : 1, def: custType === 'text' ? '' : 0 })); tkLogic.saveTemplate(state); closeSheet(); render(); toast('Поле «' + name + '» добавлено'); });

  let tt; function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('show'), 1700); }

  syncAll();
  render();
  if (state.mode === 'active') startTimer();
})();
