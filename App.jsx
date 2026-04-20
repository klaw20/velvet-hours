import { useState, useEffect, useRef } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Cinzel:wght@400;500&family=EB+Garamond:ital@0;1&display=swap');`;

const css = `
  ${FONTS}
  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --ink: #1a0f0a;
    --parchment: #f5ede0;
    --gold: #c9a84c;
    --gold-light: #e8c97a;
    --burgundy: #6b1f2a;
    --rose: #c4687a;
    --cream: #faf4ec;
    --smoke: #3d2420;
  }

  body {
    background: var(--ink);
    color: var(--parchment);
    font-family: 'EB Garamond', serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .app { min-height: 100vh; position: relative; }

  .bg-layer {
    position: fixed; inset: 0;
    background:
      radial-gradient(ellipse 60% 40% at 80% 10%, rgba(107,31,42,0.25) 0%, transparent 60%),
      radial-gradient(ellipse 40% 60% at 10% 90%, rgba(201,168,76,0.08) 0%, transparent 50%),
      radial-gradient(ellipse 80% 80% at 50% 50%, #1a0f0a 0%, #0d0705 100%);
    pointer-events: none; z-index: 0;
  }

  .grain {
    position: fixed; inset: 0; opacity: 0.035;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-size: 128px; pointer-events: none; z-index: 1;
  }

  .content {
    position: relative; z-index: 2;
    max-width: 680px; margin: 0 auto; padding: 0 24px 80px;
  }

  .header {
    text-align: center; padding: 48px 0 32px;
    border-bottom: 1px solid rgba(201,168,76,0.2); margin-bottom: 40px;
  }

  .logo-ornament {
    font-size: 11px; letter-spacing: 5px; color: var(--gold);
    text-transform: uppercase; margin-bottom: 16px; opacity: 0.7;
  }

  .logo {
    font-family: 'Cinzel', serif; font-size: clamp(28px, 6vw, 42px);
    font-weight: 400; letter-spacing: 4px; color: var(--parchment);
    text-shadow: 0 0 40px rgba(201,168,76,0.3); margin-bottom: 8px;
  }

  .logo span { color: var(--gold); }

  .tagline {
    font-family: 'Cormorant Garamond', serif; font-style: italic;
    font-size: 16px; color: rgba(245,237,224,0.5); letter-spacing: 1px;
  }

  .onboarding { animation: fadeUp 0.8s ease forwards; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .welcome-text {
    font-family: 'Cormorant Garamond', serif; font-size: 20px;
    font-style: italic; line-height: 1.7; color: rgba(245,237,224,0.8); margin-bottom: 40px;
  }

  .field-group { margin-bottom: 28px; }

  label {
    display: block; font-family: 'Cinzel', serif; font-size: 10px;
    letter-spacing: 3px; text-transform: uppercase; color: var(--gold);
    opacity: 0.7; margin-bottom: 10px;
  }

  input, select {
    width: 100%; background: rgba(255,255,255,0.04);
    border: 1px solid rgba(201,168,76,0.25); border-radius: 2px;
    padding: 14px 18px; font-family: 'EB Garamond', serif;
    font-size: 17px; color: var(--parchment); outline: none;
    transition: border-color 0.3s, background 0.3s;
  }

  input:focus, select:focus {
    border-color: rgba(201,168,76,0.6); background: rgba(255,255,255,0.07);
  }

  select option { background: #1a0f0a; color: var(--parchment); }

  .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  .btn-primary {
    width: 100%; padding: 18px;
    background: linear-gradient(135deg, var(--burgundy), #8b2535);
    border: 1px solid rgba(201,168,76,0.3); border-radius: 2px;
    font-family: 'Cinzel', serif; font-size: 13px; letter-spacing: 4px;
    text-transform: uppercase; color: var(--gold-light); cursor: pointer;
    transition: all 0.3s; margin-top: 12px; position: relative; overflow: hidden;
  }

  .btn-primary::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(201,168,76,0.15), transparent);
    opacity: 0; transition: opacity 0.3s;
  }

  .btn-primary:hover::before { opacity: 1; }
  .btn-primary:hover { box-shadow: 0 0 30px rgba(107,31,42,0.5); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

  .story-view { animation: fadeUp 0.6s ease forwards; }

  .chapter-meta {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 32px; padding-bottom: 20px;
    border-bottom: 1px solid rgba(201,168,76,0.15);
  }

  .chapter-label {
    font-family: 'Cinzel', serif; font-size: 10px;
    letter-spacing: 4px; text-transform: uppercase; color: var(--gold); opacity: 0.7;
  }

  .chapter-date {
    font-family: 'Cormorant Garamond', serif; font-style: italic;
    font-size: 14px; color: rgba(245,237,224,0.35);
  }

  .chapter-title {
    font-family: 'Cormorant Garamond', serif; font-size: clamp(26px, 5vw, 36px);
    font-weight: 300; line-height: 1.3; color: var(--parchment); margin-bottom: 8px;
  }

  .chapter-subtitle {
    font-family: 'Cormorant Garamond', serif; font-style: italic;
    font-size: 16px; color: var(--rose); margin-bottom: 36px; opacity: 0.8;
  }

  .story-body {
    font-size: clamp(17px, 2.5vw, 20px); line-height: 1.9;
    color: rgba(245,237,224,0.85); letter-spacing: 0.01em;
  }

  .story-body p { margin-bottom: 24px; }

  .story-body p:first-child::first-letter {
    font-family: 'Cinzel', serif; font-size: 4.5em; line-height: 0.8;
    float: left; margin: 8px 12px 0 0; color: var(--gold);
  }

  .typing-cursor {
    display: inline-block; width: 2px; height: 1em;
    background: var(--gold); margin-left: 2px;
    vertical-align: text-bottom; animation: blink 1s step-end infinite;
  }

  @keyframes blink { 50% { opacity: 0; } }

  .choice-section {
    margin-top: 48px; padding-top: 32px;
    border-top: 1px solid rgba(201,168,76,0.15);
  }

  .choice-prompt {
    font-family: 'Cormorant Garamond', serif; font-style: italic;
    font-size: 18px; color: rgba(245,237,224,0.6); margin-bottom: 20px; text-align: center;
  }

  .choices { display: flex; flex-direction: column; gap: 12px; }

  .choice-btn {
    padding: 16px 24px; background: rgba(255,255,255,0.03);
    border: 1px solid rgba(201,168,76,0.2); border-radius: 2px;
    font-family: 'EB Garamond', serif; font-size: 17px; font-style: italic;
    color: rgba(245,237,224,0.75); cursor: pointer; text-align: left;
    transition: all 0.3s; line-height: 1.5;
  }

  .choice-btn:hover {
    border-color: rgba(196,104,122,0.5); background: rgba(196,104,122,0.06);
    color: var(--parchment);
  }

  .choice-btn.selected {
    border-color: var(--rose); background: rgba(196,104,122,0.1); color: var(--parchment);
  }

  .ornament {
    text-align: center; color: var(--gold); opacity: 0.4;
    margin: 40px 0; font-size: 20px; letter-spacing: 16px;
  }

  .loading-state { text-align: center; padding: 60px 0; }

  .candle { font-size: 40px; margin-bottom: 20px; animation: flicker 2s ease-in-out infinite; }

  @keyframes flicker {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(0.97); }
  }

  .loading-text {
    font-family: 'Cormorant Garamond', serif; font-style: italic;
    font-size: 18px; color: rgba(245,237,224,0.5);
  }

  .profile-bar {
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(201,168,76,0.15);
    border-radius: 2px; padding: 12px 18px; margin-bottom: 32px;
  }

  .profile-name { font-family: 'Cormorant Garamond', serif; font-size: 16px; color: rgba(245,237,224,0.7); }
  .profile-name span { color: var(--gold-light); font-style: italic; }
  .streak { font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 2px; color: var(--rose); opacity: 0.8; }

  .restart-btn {
    background: none; border: none; font-family: 'Cinzel', serif;
    font-size: 9px; letter-spacing: 2px; color: rgba(201,168,76,0.3);
    cursor: pointer; text-transform: uppercase; transition: color 0.2s;
  }

  .restart-btn:hover { color: rgba(201,168,76,0.7); }

  .error-msg {
    background: rgba(107,31,42,0.2); border: 1px solid rgba(196,104,122,0.3);
    border-radius: 2px; padding: 16px 20px; font-family: 'Cormorant Garamond', serif;
    font-style: italic; font-size: 16px; color: var(--rose); margin-top: 16px; text-align: center;
  }

  .continue-btn {
    margin-top: 32px; padding: 14px 32px; background: transparent;
    border: 1px solid rgba(201,168,76,0.35); border-radius: 2px;
    font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 3px;
    text-transform: uppercase; color: var(--gold); cursor: pointer;
    transition: all 0.3s; display: block; margin-left: auto; margin-right: auto;
  }

  .continue-btn:hover { background: rgba(201,168,76,0.08); box-shadow: 0 0 20px rgba(201,168,76,0.1); }
  .continue-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .skip-hint {
    font-family: 'Cinzel', serif; font-size: 9px; letter-spacing: 2px;
    text-transform: uppercase; color: rgba(201,168,76,0.25);
    text-align: center; margin-top: 24px; cursor: pointer;
    transition: color 0.2s;
  }
  .skip-hint:hover { color: rgba(201,168,76,0.5); }
`;

const ARCHETYPES = [
  { id: "brooding",  label: "The Brooding Stranger",   desc: "Dark, mysterious, speaks little but means everything" },
  { id: "charming",  label: "The Charming Rogue",       desc: "Quick-witted, irreverent, dangerously magnetic" },
  { id: "gentle",    label: "The Tender Protector",     desc: "Strong, patient, devastatingly gentle" },
  { id: "rival",     label: "The Reluctant Rival",      desc: "Tension-soaked history, undeniable pull" },
];

const SETTINGS = [
  { id: "paris",    label: "Paris, 1920s" },
  { id: "tuscany",  label: "Tuscany Villa" },
  { id: "london",   label: "Rainy London" },
  { id: "newyork",  label: "New York Rooftop" },
  { id: "coastal",  label: "Coastal Estate" },
];

const LOADING_MSGS = [
  "Lighting the candles…",
  "Setting the scene…",
  "The story stirs…",
  "He waits in the shadows…",
  "Turning the page…",
];

// ── API call — goes to /api/story (our Vercel proxy) ─────────────────────────
async function callProxy(messages, system) {
  const res = await fetch("/api/story", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, system }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.content.map((b) => b.text ?? "").join("");
}

// ── System prompt factory ─────────────────────────────────────────────────────
function buildSystem(profile) {
  const archetype = ARCHETYPES.find((a) => a.id === profile.archetype);
  const setting   = SETTINGS.find((s) => s.id === profile.setting);

  return `You are writing a serialized intimate romantic fiction story for women. The tone is literary, sensual, emotionally rich — NOT explicit or pornographic. Think of the best romance novels: slow burn, charged tension, emotional intimacy, yearning.

PROTAGONIST: "${profile.heroine || profile.name}" — intelligent, complex, self-possessed.
LOVE INTEREST ARCHETYPE: ${archetype?.label} — ${archetype?.desc}
SETTING: ${setting?.label}
READER'S NAME: ${profile.name}

WRITING STYLE:
- Literary, evocative prose with beautiful sentences
- Emotional depth over physical description
- Tension through what is NOT said or done
- End every chapter on a charged cliffhanger
- Sensual but tasteful — the anticipation IS the story

OUTPUT FORMAT — respond ONLY with valid JSON, no markdown fences:
{
  "chapterTitle": "A poetic chapter title",
  "subtitle": "A short evocative tagline",
  "story": "The full chapter. 4-6 paragraphs. Richly written. Use \\n between paragraphs.",
  "choices": [
    "First choice (one sentence, poetic)",
    "Second choice (one sentence, poetic)",
    "Third choice (one sentence, poetic)"
  ]
}`;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function VelvetHours() {
  const [screen,        setScreen]        = useState("onboarding");
  const [profile,       setProfile]       = useState({ name: "", heroine: "", archetype: "brooding", setting: "paris" });
  const [chapter,       setChapter]       = useState(null);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping,      setIsTyping]      = useState(false);
  const [selectedChoice,setSelectedChoice]= useState(null);
  const [chapterNum,    setChapterNum]    = useState(1);
  const [storyHistory,  setStoryHistory]  = useState([]);
  const [error,         setError]         = useState("");
  const [loadingMsg,    setLoadingMsg]    = useState(LOADING_MSGS[0]);

  const typingRef  = useRef(null);
  const loadingRef = useRef(null);

  // Rotate loading messages
  useEffect(() => {
    if (screen === "loading") {
      let i = 0;
      loadingRef.current = setInterval(() => {
        i = (i + 1) % LOADING_MSGS.length;
        setLoadingMsg(LOADING_MSGS[i]);
      }, 1800);
    }
    return () => clearInterval(loadingRef.current);
  }, [screen]);

  async function generateChapter(choiceMade = null) {
    setScreen("loading");
    setError("");
    setLoadingMsg(LOADING_MSGS[0]);

    try {
      const userMsg = storyHistory.length === 0
        ? "Begin Chapter 1 of this romantic serial story. Set the scene, introduce the love interest with intrigue. Make the reader immediately invested."
        : `Story so far:\n${storyHistory.join("\n\n")}\n\nChapter ${chapterNum}. ${choiceMade ? `She chose: ${choiceMade}` : "Continue the story."}`;

      const raw     = await callProxy([{ role: "user", content: userMsg }], buildSystem(profile));
      const clean   = raw.replace(/```json|```/g, "").trim();
      const parsed  = JSON.parse(clean);

      setChapter(parsed);
      setStoryHistory((prev) => [
        ...prev,
        `Chapter ${chapterNum} — ${parsed.chapterTitle}: ${parsed.story.substring(0, 300)}…`,
      ]);
      setSelectedChoice(null);
      setScreen("story");
      typeStory(parsed.story);
    } catch (e) {
      console.error(e);
      setError("Something went wrong weaving your story. Please try again.");
      setScreen(chapter ? "story" : "onboarding");
    }
  }

  function typeStory(text) {
    clearTimeout(typingRef.current);
    setDisplayedText("");
    setIsTyping(true);
    let i = 0;
    function tick() {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
        typingRef.current = setTimeout(tick, 16);
      } else {
        setIsTyping(false);
      }
    }
    tick();
  }

  function skipTyping() {
    if (!isTyping || !chapter) return;
    clearTimeout(typingRef.current);
    setDisplayedText(chapter.story);
    setIsTyping(false);
  }

  function handleStart() {
    if (!profile.name.trim()) return;
    generateChapter();
  }

  function handleNextChapter() {
    setChapterNum((n) => n + 1);
    generateChapter(selectedChoice);
  }

  function handleRestart() {
    clearTimeout(typingRef.current);
    setScreen("onboarding");
    setChapter(null);
    setChapterNum(1);
    setStoryHistory([]);
    setSelectedChoice(null);
    setDisplayedText("");
    setError("");
  }

  const paragraphs  = displayedText.split("\n").filter((p) => p.trim());
  const showChoices = !isTyping && chapter?.choices?.length > 0;

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="bg-layer" />
        <div className="grain" />

        <div className="content">
          {/* ── Header ── */}
          <header className="header">
            <div className="logo-ornament">✦ A Daily Romance ✦</div>
            <div className="logo">Velvet <span>Hours</span></div>
            <div className="tagline">Your story, one breathless chapter at a time</div>
          </header>

          {/* ── Onboarding ── */}
          {screen === "onboarding" && (
            <div className="onboarding">
              <p className="welcome-text">
                Every evening, a new chapter awaits — written for you alone. Your name, your choices, your story woven into every line.
              </p>

              <div className="field-group">
                <label>Your Name</label>
                <input
                  type="text"
                  placeholder="How shall we address you?"
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div className="field-group">
                <label>Your Heroine's Name (optional)</label>
                <input
                  type="text"
                  placeholder="Leave blank to use your own name"
                  value={profile.heroine}
                  onChange={(e) => setProfile((p) => ({ ...p, heroine: e.target.value }))}
                />
              </div>

              <div className="row-2">
                <div className="field-group">
                  <label>His Archetype</label>
                  <select value={profile.archetype} onChange={(e) => setProfile((p) => ({ ...p, archetype: e.target.value }))}>
                    {ARCHETYPES.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
                  </select>
                </div>
                <div className="field-group">
                  <label>Setting</label>
                  <select value={profile.setting} onChange={(e) => setProfile((p) => ({ ...p, setting: e.target.value }))}>
                    {SETTINGS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              {error && <div className="error-msg">{error}</div>}

              <button className="btn-primary" onClick={handleStart} disabled={!profile.name.trim()}>
                Begin My Story
              </button>
            </div>
          )}

          {/* ── Loading ── */}
          {screen === "loading" && (
            <div className="loading-state">
              <div className="candle">🕯️</div>
              <div className="loading-text">{loadingMsg}</div>
            </div>
          )}

          {/* ── Story ── */}
          {screen === "story" && chapter && (
            <div className="story-view">
              <div className="profile-bar">
                <div className="profile-name">Welcome back, <span>{profile.name}</span></div>
                <div className="streak">Chapter {chapterNum}</div>
                <button className="restart-btn" onClick={handleRestart}>New Story</button>
              </div>

              <div className="chapter-meta">
                <span className="chapter-label">Chapter {chapterNum}</span>
                <span className="chapter-date">
                  {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                </span>
              </div>

              <h2 className="chapter-title">{chapter.chapterTitle}</h2>
              <div className="chapter-subtitle">{chapter.subtitle}</div>

              <div className="story-body">
                {paragraphs.map((p, i) => (
                  <p key={i}>
                    {p}
                    {isTyping && i === paragraphs.length - 1 && <span className="typing-cursor" />}
                  </p>
                ))}
              </div>

              {isTyping && (
                <div className="skip-hint" onClick={skipTyping}>Tap to reveal all</div>
              )}

              {error && <div className="error-msg">{error}</div>}

              {showChoices && (
                <div className="choice-section">
                  <div className="ornament">· · ·</div>
                  <p className="choice-prompt">The moment holds its breath. What does she do?</p>
                  <div className="choices">
                    {chapter.choices.map((c, i) => (
                      <button
                        key={i}
                        className={`choice-btn ${selectedChoice === c ? "selected" : ""}`}
                        onClick={() => setSelectedChoice(c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  {selectedChoice && (
                    <button className="continue-btn" onClick={handleNextChapter}>
                      Continue the Story →
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
