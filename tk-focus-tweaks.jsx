/* ===== Train Keeper Focus — Tweaks ===== */
const TKF_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#11998a",
  "paper": "тёплая",
  "sketch": true,
  "bignum": 24
}/*EDITMODE-END*/;

const TKF_INK = { "#11998a": "#0b6b60", "#0bb5d6": "#077e96", "#ff6f59": "#c1442f" };
const TKF_PAPER = {
  "тёплая":     { paper: "#f4f1ea", card: "#fbfaf6", line: "#cfc8ba" },
  "прохладная": { paper: "#eceff2", card: "#fafbfc", line: "#c5ccd3" },
  "белая":      { paper: "#ffffff", card: "#ffffff", line: "#e3e1db" },
};

function TKFTweaks() {
  const [t, setTweak] = useTweaks(TKF_DEFAULTS);
  React.useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty('--accent', t.accent);
    r.setProperty('--accent-ink', TKF_INK[t.accent] || t.accent);
    const p = TKF_PAPER[t.paper] || TKF_PAPER["тёплая"];
    r.setProperty('--paper', p.paper); r.setProperty('--card', p.card); r.setProperty('--line', p.line);
    r.setProperty('--valsize', t.bignum + 'px');
    document.body.classList.toggle('clean', !t.sketch);
  }, [t.accent, t.paper, t.sketch, t.bignum]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Стиль" />
      <TweakColor label="Акцент" value={t.accent}
        options={["#11998a", "#0bb5d6", "#ff6f59"]} onChange={(v) => setTweak('accent', v)} />
      <TweakRadio label="Бумага" value={t.paper}
        options={["тёплая", "прохладная", "белая"]} onChange={(v) => setTweak('paper', v)} />
      <TweakToggle label="Рисованные линии" value={t.sketch} onChange={(v) => setTweak('sketch', v)} />
      <TweakSection label="Значения" />
      <TweakSlider label="Крупность цифр" value={t.bignum} min={18} max={34} step={1} unit="px"
        onChange={(v) => setTweak('bignum', v)} />
      <TweakSection label="Данные" />
      <TweakButton label="Сбросить всё" onClick={() => { try { localStorage.removeItem('tk_focus_v3'); localStorage.removeItem('tk_focus_v3_draft'); } catch (e) {} location.reload(); }} />
    </TweaksPanel>
  );
}
ReactDOM.createRoot(document.getElementById('panel-root')).render(<TKFTweaks />);
