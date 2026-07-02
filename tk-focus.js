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
    fields: fields || [],
    sets: []
  });

  /**
   * Returns default application state
   */
  const DEFAULT = () => ({
    mode: 'home', history: [], templates: [], activeTemplateId: null, title: 'Кросс-день', description: '',
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
  let state, editId = null, menuId = null, sheetExId = null, timerInt = null;
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
      if (e.notes === undefined) e.notes = '';
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
    const cls = 'card' + (canCheck ? ' tappable' : '') + ((active || state.type === 'habit') && ex.done ? ' done' : '') + ((active || state.type === 'habit') && ex.skipped ? ' skipped' : '') + (editing ? ' editing' : '');
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
      if (!isFirst) h += '<button data-act="moveup" data-id="' + ex.id + '">▲ Переместить вверх</button>';
      if (!isLast) h += '<button data-act="movedown" data-id="' + ex.id + '">▼ Переместить вниз</button>';
      h += '<button data-act="dup" data-id="' + ex.id + '">Дублировать</button><button data-act="edit" data-id="' + ex.id + '">Изменить</button><button class="danger" data-act="del" data-id="' + ex.id + '">Удалить</button></div>';
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
    state.sections.forEach((s) => {
      h += '<table class="rtable"><tr class="sech"><td>' + esc(s.name) + '</td><td class="hd">План</td><td class="hd">Факт</td></tr>';
      s.ex.forEach((e) => {
        let statusText = '';
        if (e.skipped) statusText = ' <span class="skip skipped-status">пропущено</span>';
        else if (!e.done) statusText = ' <span class="skip">не отмечено</span>';
        
        h += '<tr class="exh"><td colspan="3">' + esc(e.name) + statusText + '</td></tr>';
        
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
      '<div class="wb-rating' + (state.isViewingHistory ? ' readonly' : '') + '">';
    const emojis = { 1: '😞', 2: '😐', 3: '🙂', 4: '😃', 5: '🤩' };
    for (let rating = 1; rating <= 5; rating++) {
      const activeClass = state.wellBeingRating === rating ? ' active' : '';
      const disabledAttr = state.isViewingHistory ? ' disabled' : '';
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
          '<div class="h-top"><span class="h-title">' + esc(t.title || 'Без названия') + '</span>' + typeBadge + '<span class="h-arrow">›</span></div>' +
          '<div class="h-stats">' + (t.sections ? t.sections.length : 0) + ' секций</div>' +
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
  function render() {
    const mode = state.mode;
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

    if (mode === 'home') {
      snav.style.display = 'none'; dots.style.display = 'none';
      crumb.textContent = 'Главная';
      wtitle.textContent = 'Train Keeper'; wtitle.contentEditable = 'false';
      wpill.className = 'timer draft mono'; wpill.textContent = 'архив';
      if (wdesc) wdesc.style.display = 'none';
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
      if (wdesc) wdesc.style.display = 'none';
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
    else { 
      wpill.className = 'timer draft mono'; 
      wpill.textContent = state.type === 'habit' ? 'привычки' : 'черновик'; 
    }
    const showProgress = mode === 'active' || (mode === 'build' && state.type === 'habit');
    $('#ssub').textContent = 'Секция ' + (state.i + 1) + ' из ' + state.sections.length +
      (showProgress ? ' · выполнено ' + done + '/' + total : ' · ' + total + ' упр.');

    let h = sec.ex.map(cardHTML).join('');
    if (mode === 'build') h += '<div class="addexc" data-act="addexc">＋ упражнение</div>';
    exBody.innerHTML = h;

    dots.innerHTML = state.sections.map((s, k) => {
      const full = (mode === 'active' || state.type === 'habit') && s.ex.length && s.ex.every((e) => e.done || e.skipped);
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
    state.mode = 'active'; state.i = 0; state.startedAt = Date.now(); state.comment = ''; state.wellBeingRating = 0;
    state.sections.forEach((s) => s.ex.forEach((e) => {
      e.done = false;
      e.skipped = false;
      e.fields.forEach((f) => { f.plan = f.value; });
      initSetsForExercise(e);
    }));
    editId = null; menuId = null; render(); startTimer(); exBody.scrollTop = 0;
  }
  
  /**
   * Transition from 'active' to 'summary' mode
   */
  function finishWorkout() { state.mode = 'summary'; state.elapsed = state.type === 'habit' ? 0 : Date.now() - state.startedAt; stopTimer(); render(); exBody.scrollTop = 0; }
  
  /**
   * Handle summary closure: either save to history or return from history view
   */
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
      sections: JSON.parse(JSON.stringify(state.sections))
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
    state.sections.forEach((s) => s.ex.forEach((e) => { 
      e.done = false; 
      e.skipped = false;
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
            ex.done = ex.sets.every(s => s.done || s.skipped);
            ex.skipped = ex.sets.every(s => s.skipped);
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
    if (menuId !== null && !e.target.closest('.kmenu') && !(e.target.closest('[data-act]') && e.target.closest('[data-act]').dataset.act === 'menu')) { menuId = null; render(); return; }
    const el = e.target.closest('[data-act]'); if (!el) return;
    const act = el.dataset.act,
          id = el.dataset.id || el.dataset.exId,
          fid = el.dataset.fid,
          i = el.dataset.i,
          tid = el.dataset.tid,
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
      case 'viewhistory': {
        const h = state.history[i];
        localStorage.setItem(LSKEY + '_draft', JSON.stringify(state));
        state.isViewingHistory = true; state.mode = 'summary';
        state.title = h.title; state.elapsed = h.elapsed; state.comment = h.comment; state.wellBeingRating = h.wellBeingRating || 0; state.sections = h.sections;
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
            ex.done = ex.sets.every(s => s.done || s.skipped);
            ex.skipped = ex.sets.every(s => s.skipped);
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
      case 'menu': menuId = (menuId === ex.id ? null : ex.id); render(); return;
      case 'dup': { const c = JSON.parse(JSON.stringify(ex)); c.id = nid(); c.done = false; c.fields.forEach((f) => (f.id = nid())); const idx = curSec().ex.indexOf(ex); curSec().ex.splice(idx + 1, 0, c); menuId = null; render(); tkLogic.saveTemplate(state); toast('Карточка продублирована'); return; }
      case 'edit': editId = ex.id; menuId = null; render(); return;
      case 'editdone': if (editId === ex.id) editId = null; render(); return;
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
      case 'dot': state.i = +i; menuId = null; editId = null; render(); exBody.scrollTop = 0; return;
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
        if (state.isViewingHistory) return;
        state.wellBeingRating = Number(el.dataset.val);
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
        const sec = curSec(); if (!sec.ex.length || !sec.ex.every((x) => x.done || x.skipped)) return;
        if (state.i < state.sections.length - 1) { state.i++; render(); exBody.scrollTop = 0; }
        else finishWorkout();
        return;
      }
    }
  });

  $('[data-prev]').addEventListener('click', () => { if (state.mode === 'summary') return; state.i = (state.i - 1 + state.sections.length) % state.sections.length; menuId = null; editId = null; render(); exBody.scrollTop = 0; });
  $('[data-next]').addEventListener('click', () => { if (state.mode === 'summary') return; state.i = (state.i + 1) % state.sections.length; menuId = null; editId = null; render(); exBody.scrollTop = 0; });

  exBody.addEventListener('input', (e) => {
    if (!e.target || typeof e.target.closest !== 'function') return;
    const el = e.target.closest('[data-act]'); if (!el) return;
    if (el.dataset.act === 'comment') { state.comment = el.value; save(); return; }
    if (el.dataset.act === 'exnotes') {
      const ex = findEx(el.dataset.id);
      if (ex) { ex.notes = el.value; tkLogic.saveTemplate(state); }
      return;
    }
    const exId = el.dataset.id || el.dataset.exId;
    const ex = exId ? findEx(exId) : null;
    if (el.dataset.act === 'cname' && ex) { ex.name = el.textContent; tkLogic.saveTemplate(state); }
    else if (el.dataset.act === 'label' && ex) { const f = findField(ex, el.dataset.fid); if (f) { f.label = el.textContent; tkLogic.saveTemplate(state); } }
  });
  exBody.addEventListener('focusout', (e) => {
    if (!e.target || typeof e.target.closest !== 'function') return;
    const el = e.target.closest('[data-act]'); if (!el || el.dataset.act === 'comment' || el.dataset.act === 'exnotes') { save(); return; }
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
