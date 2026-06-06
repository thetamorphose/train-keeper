/* ===== Train Keeper wireframes — Tweaks panel ===== */
const TK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#11998a",
  "paper": "тёплая",
  "sketch": true,
  "notes": true
}/*EDITMODE-END*/;

const TK_INK = { "#11998a": "#0b6b60", "#0bb5d6": "#077e96", "#ff6f59": "#c1442f" };
const TK_PAPER = {
  "тёплая":     { paper: "#f4f1ea", card: "#fbfaf6", line: "#cfc8ba" },
  "прохладная": { paper: "#eceff2", card: "#fafbfc", line: "#c5ccd3" },
  "белая":      { paper: "#ffffff", card: "#ffffff", line: "#e3e1db" },
};

function TKTweaks() {
  const [t, setTweak] = useTweaks(TK_DEFAULTS);

  React.useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty('--accent', t.accent);
    r.setProperty('--accent-ink', TK_INK[t.accent] || t.accent);
    const p = TK_PAPER[t.paper] || TK_PAPER["тёплая"];
    r.setProperty('--paper', p.paper);
    r.setProperty('--card', p.card);
    r.setProperty('--line', p.line);
    document.body.classList.toggle('clean', !t.sketch);
    document.body.classList.toggle('no-notes', !t.notes);
  }, [t.accent, t.paper, t.sketch, t.notes]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Стиль" />
      <TweakColor label="Акцент" value={t.accent}
        options={["#11998a", "#0bb5d6", "#ff6f59"]}
        onChange={(v) => setTweak('accent', v)} />
      <TweakRadio label="Бумага" value={t.paper}
        options={["тёплая", "прохладная", "белая"]}
        onChange={(v) => setTweak('paper', v)} />
      <TweakSection label="Скетч" />
      <TweakToggle label="Рисованные линии" value={t.sketch}
        onChange={(v) => setTweak('sketch', v)} />
      <TweakToggle label="Заметки-аннотации" value={t.notes}
        onChange={(v) => setTweak('notes', v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('panel-root')).render(<TKTweaks />);
