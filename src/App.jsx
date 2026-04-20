
import { useState, useEffect, useRef } from "react";

export default function VelvetHours() {
  const [screen, setScreen] = useState("onboarding");
  const [profile, setProfile] = useState({ name: "", heroine: "", archetype: "brooding", setting: "paris" });
  const [chapter, setChapter] = useState(null);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [chapterNum, setChapterNum] = useState(1);
  const [storyHistory, setStoryHistory] = useState([]);
  const [choiceHistory, setChoiceHistory] = useState([]);
  const [error, setError] = useState("");
  const [loadingMsg, setLoadingMsg] = useState("Lighting the candles…");
  const typingRef = useRef(null);
  const loadingRef = useRef(null);
  const timeoutRef = useRef(null);

  const LOADING_MSGS = ["Lighting the candles…","Setting the scene…","The story stirs…","He waits in the shadows…","Turning the page…"];
  const ARCHETYPES = [
    { id: "brooding", label: "The Brooding Stranger", desc: "Dark, mysterious, speaks little but means everything" },
    { id: "charming", label: "The Charming Rogue", desc: "Quick-witted, irreverent, dangerously magnetic" },
    { id: "gentle", label: "The Tender Protector", desc: "Strong, patient, devastatingly gentle" },
    { id: "rival", label: "The Reluctant Rival", desc: "Tension-soaked history, undeniable pull" },
  ];
  const SETTINGS = [
    { id: "paris", label: "Paris, 1920s" },
    { id: "tuscany", label: "Tuscany Villa" },
    { id: "london", label: "Rainy London" },
    { id: "newyork", label: "New York Rooftop" },
    { id: "coastal", label: "Coastal Estate" },
  ];
  const CHOICE_TAGS = {
    bold: { label: "Bold", color: "#c4687a" },
    soft: { label: "Tender", color: "#c9a84c" },
    wild: { label: "Reckless", color: "#e8a87c" },
    dark: { label: "Walk Away", color: "#666" },
  };

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

  function stopLoading() {
    clearInterval(loadingRef.current);
    clearTimeout(timeoutRef.current);
  }

  function buildSystem() {
    const archetype = ARCHETYPES.find((a) => a.id === profile.archetype);
    const setting = SETTINGS.find((s) => s.id === profile.setting);
    return `You are writing a serialized choose-your-own-adventure romantic fiction story for women. Literary, sensual, emotionally rich — NOT explicit. Slow burn romance with real consequences.

PROTAGONIST: "${profile.heroine || profile.name}"
LOVE INTEREST: ${archetype?.label} — ${archetype?.desc}
SETTING: ${setting?.label}

Always provide exactly 4 choices with types: bold, soft, wild, dark.

Respond ONLY with valid JSON, no markdown:
{
  "chapterTitle": "title",
  "subtitle": "tagline",
  "story": "4-6 paragraphs separated by \\n",
  "choices": [
    { "type": "bold", "text": "choice text", "hint": "short hint" },
    { "type": "soft", "text": "choice text", "hint": "short hint" },
    { "type": "wild", "text": "choice text", "hint": "short hint" },
    { "type": "dark", "text": "choice text", "hint": "short hint" }
  ]
}`;
  }

  async function generateChapter(choiceMade = null) {
    setScreen("loading");
    setError("");

    timeoutRef.current = setTimeout(() => {
      stopLoading();
      setError("Timed out after 30 seconds. Please check your Anthropic API key in Vercel settings and try again.");
      setScreen(chapter ? "story" : "onboarding");
    }, 30000);

    try {
      const userMsg = storyHistory.length === 0
        ? "Begin Chapter 1. Set the scene, introduce the love interest with mystery and tension."
        : `Story so far:\n${storyHistory.join("\n\n")}\n\nChapter ${chapterNum}. She chose: [${choiceMade?.type}] "${choiceMade?.text}". Show the consequence.`;

      const res = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: buildSystem(),
          messages: [{ role: "user", content: userMsg }],
        }),
      });

      const data = await res.json();
      stopLoading();

      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

      const text = data.content.map((b) => b.text || "").join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      setChapter(parsed);
      setStoryHistory((prev) => [...prev, `Chapter ${chapterNum} — ${parsed.chapterTitle}: ${parsed.story.substring(0, 200)}…`]);
      setSelectedChoice(null);
      setScreen("story");
      typeStory(parsed.story);
    } catch (e) {
      stopLoading();
      setError(`Error: ${e.message}`);
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

  function handleNextChapter() {
    if (!selectedChoice) return;
    setChoiceHistory((prev) => [...prev, selectedChoice]);
    setChapterNum((n) => n + 1);
    generateChapter(selectedChoice);
  }

  function handleRestart() {
    clearTimeout(typingRef.current);
    stopLoading();
    setScreen("onboarding");
    setChapter(null);
    setChapterNum(1);
    setStoryHistory([]);
    setChoiceHistory([]);
    setSelectedChoice(null);
    setDisplayedText("");
    setError("");
  }

  const paragraphs = displayedText.split("\n").filter((p) => p.trim());
  const showChoices = !isTyping && chapter?.choices?.length > 0;

  const styles = {
    app: { minHeight: "100vh", background: "#1a0f0a", color: "#f5ede0", fontFamily: "Georgia, serif" },
    content: { maxWidth: 680, margin: "0 auto", padding: "0 24px 80px" },
    header: { textAlign: "center", padding: "48px 0 32px", borderBottom: "1px solid rgba(201,168,76,0.2)", marginBottom: 40 },
    logo: { fontSize: 36, letterSpacing: 4, color: "#f5ede0", marginBottom: 8 },
    logoSpan: { color: "#c9a84c" },
    tagline: { fontStyle: "italic", fontSize: 16, color: "rgba(245,237,224,0.5)" },
    welcomeText: { fontStyle: "italic", fontSize: 20, lineHeight: 1.7, color: "rgba(245,237,224,0.8)", marginBottom: 40 },
    fieldGroup: { marginBottom: 28 },
    label: { display: "block", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#c9a84c", opacity: 0.7, marginBottom: 10 },
    input: { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 2, padding: "14px 18px", fontFamily: "Georgia, serif", fontSize: 17, color: "#f5ede0", outline: "none", boxSizing: "border-box" },
    row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
    btnPrimary: { width: "100%", padding: 18, background: "linear-gradient(135deg, #6b1f2a, #8b2535)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 2, fontSize: 13, letterSpacing: 4, textTransform: "uppercase", color: "#e8c97a", cursor: "pointer", marginTop: 12 },
    profileBar: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 2, padding: "12px 18px", marginBottom: 32 },
    chapterMeta: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, paddingBottom: 20, borderBottom: "1px solid rgba(201,168,76,0.15)" },
    chapterTitle: { fontSize: 32, fontWeight: 300, lineHeight: 1.3, color: "#f5ede0", marginBottom: 8 },
    chapterSubtitle: { fontStyle: "italic", fontSize: 16, color: "#c4687a", marginBottom: 36, opacity: 0.8 },
    storyBody: { fontSize: 19, lineHeight: 1.9, color: "rgba(245,237,224,0.85)" },
    storyP: { marginBottom: 24 },
    choiceSection: { marginTop: 48, paddingTop: 32, borderTop: "1px solid rgba(201,168,76,0.15)" },
    choicePrompt: { fontStyle: "italic", fontSize: 18, color: "rgba(245,237,224,0.6)", marginBottom: 20, textAlign: "center" },
    choices: { display: "flex", flexDirection: "column", gap: 12 },
    choiceBtn: { padding: "16px 24px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 2, fontSize: 17, fontStyle: "italic", color: "rgba(245,237,224,0.75)", cursor: "pointer", textAlign: "left", lineHeight: 1.5 },
    choiceBtnSelected: { padding: "16px 24px", background: "rgba(196,104,122,0.1)", border: "1px solid #c4687a", borderRadius: 2, fontSize: 17, fontStyle: "italic", color: "#f5ede0", cursor: "pointer", textAlign: "left", lineHeight: 1.5 },
    choiceHint: { fontSize: 12, color: "rgba(245,237,224,0.35)", marginTop: 6, fontStyle: "italic" },
    continueBtn: { marginTop: 32, padding: "14px 32px", background: "transparent", border: "1px solid rgba(201,168,76,0.35)", borderRadius: 2, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#c9a84c", cursor: "pointer", display: "block", marginLeft: "auto", marginRight: "auto" },
    loadingState: { textAlign: "center", padding: "60px 0" },
    candle: { fontSize: 40, marginBottom: 20 },
    loadingText: { fontStyle: "italic", fontSize: 18, color: "rgba(245,237,224,0.5)" },
    errorMsg: { background: "rgba(107,31,42,0.2)", border: "1px solid rgba(196,104,122,0.3)", borderRadius: 2, padding: "16px 20px", fontStyle: "italic", fontSize: 16, color: "#c4687a", marginTop: 16, textAlign: "center" },
    restartBtn: { background: "none", border: "none", fontSize: 9, letterSpacing: 2, color: "rgba(201,168,76,0.3)", cursor: "pointer", textTransform: "uppercase" },
    ornament: { textAlign: "center", color: "#c9a84c", opacity: 0.4, margin: "40px 0", fontSize: 20, letterSpacing: 16 },
    skipHint: { fontSize: 11, color: "rgba(201,168,76,0.25)", textAlign: "center", marginTop: 24, cursor: "pointer", letterSpacing: 2, textTransform: "uppercase" },
  };

  return (
    <div style={styles.app}>
      <div style={styles.content}>
        <header style={styles.header}>
          <div style={{ fontSize: 11, letterSpacing: 5, color: "#c9a84c", textTransform: "uppercase", marginBottom: 16, opacity: 0.7 }}>✦ A Daily Romance ✦</div>
          <div style={styles.logo}>Velvet <span style={styles.logoSpan}>Hours</span></div>
          <div style={styles.tagline}>Your story, one breathless chapter at a time</div>
        </header>

        {screen === "onboarding" && (
          <div>
            <p style={styles.welcomeText}>Every chapter, a choice. Every choice, a consequence. Your story goes where you dare to take it.</p>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Your Name</label>
              <input style={styles.input} type="text" placeholder="How shall we address you?" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Your Heroine's Name (optional)</label>
              <input style={styles.input} type="text" placeholder="Leave blank to use your own name" value={profile.heroine} onChange={(e) => setProfile((p) => ({ ...p, heroine: e.target.value }))} />
            </div>
            <div style={styles.row2}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>His Archetype</label>
                <select style={styles.input} value={profile.archetype} onChange={(e) => setProfile((p) => ({ ...p, archetype: e.target.value }))}>
                  {ARCHETYPES.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
                </select>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Setting</label>
                <select style={styles.input} value={profile.setting} onChange={(e) => setProfile((p) => ({ ...p, setting: e.target.value }))}>
                  {SETTINGS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
            </div>
            {error && <div style={styles.errorMsg}>{error}</div>}
            <button style={styles.btnPrimary} onClick={() => { if (profile.name.trim()) generateChapter(); }} disabled={!profile.name.trim()}>
              Begin My Story
            </button>
          </div>
        )}

        {screen === "loading" && (
          <div style={styles.loadingState}>
            <div style={styles.candle}>🕯️</div>
            <div style={styles.loadingText}>{loadingMsg}</div>
          </div>
        )}

        {screen === "story" && chapter && (
          <div>
            <div style={styles.profileBar}>
              <div style={{ fontStyle: "italic", fontSize: 16, color: "rgba(245,237,224,0.7)" }}>Welcome back, <span style={{ color: "#e8c97a" }}>{profile.name}</span></div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#c4687a" }}>Chapter {chapterNum}</div>
              <button style={styles.restartBtn} onClick={handleRestart}>New Story</button>
            </div>
            <div style={styles.chapterMeta}>
              <span style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#c9a84c", opacity: 0.7 }}>Chapter {chapterNum}</span>
              <span style={{ fontStyle: "italic", fontSize: 14, color: "rgba(245,237,224,0.35)" }}>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}</span>
            </div>
            <h2 style={styles.chapterTitle}>{chapter.chapterTitle}</h2>
            <div style={styles.chapterSubtitle}>{chapter.subtitle}</div>
            <div style={styles.storyBody}>
              {paragraphs.map((p, i) => <p key={i} style={styles.storyP}>{p}</p>)}
            </div>
            {isTyping && <div style={styles.skipHint} onClick={() => { clearTimeout(typingRef.current); setDisplayedText(chapter.story); setIsTyping(false); }}>Tap to reveal all</div>}
            {error && <div style={styles.errorMsg}>{error}</div>}
            {showChoices && (
              <div style={styles.choiceSection}>
                <div style={styles.ornament}>· · ·</div>
                <p style={styles.choicePrompt}>The moment is yours. What does she do?</p>
                <div style={styles.choices}>
                  {chapter.choices.map((c, i) => {
                    const tag = CHOICE_TAGS[c.type] || CHOICE_TAGS.soft;
                    return (
                      <button key={i} style={selectedChoice?.text === c.text ? styles.choiceBtnSelected : styles.choiceBtn} onClick={() => setSelectedChoice(c)}>
                        <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: tag.color, marginBottom: 6 }}>{tag.label}</div>
                        {c.text}
                        <div style={styles.choiceHint}>{c.hint}</div>
                      </button>
                    );
                  })}
                </div>
                {selectedChoice && <button style={styles.continueBtn} onClick={handleNextChapter}>Live with this choice →</button>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
