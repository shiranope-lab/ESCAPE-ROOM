import React, { useState, useRef, useEffect } from "react";

// ============================================================
// data/rooms.js  (בפרויקט אמיתי - קובץ נפרד)
//
// כל חדר מכיל שרשרת חידות. כל חידה חושפת "פרגמנט" אחד של מיקום
// המפתח (אגף -> מדף -> ספר). כל האינטראקציה - גם שאלות וגם תשובות -
// עוברת דרך אותה שיחה אחת עם הדמות. אין ממשק תשובה נפרד.
// ============================================================
const ROOM = {
  id: "room-01",
  title: "הספרייה השקטה",
  subtitle: "חדר 1 מתוך 20",
  intro:
    "אי-שם בין המדפים האלה מוסתר מפתח - מתחת לספר מסוים, על מדף מסוים, באגף מסוים. הספרנית יודעת בדיוק איפה. היא לא ממש להוטה לעזור.",
  characterName: "הספרנית",
  characterOpening:
    "עוד מישהו שמחפש משהו שהוא לא יודע איפה הוא. בסדר. תשאלו. אני לא אחזור על עצמי פעמיים.",

  buildSystemPrompt: (riddle, fragmentsSoFar, riddleAlreadyPresented) => `את/ה מגלמת דמות בשם "הספרנית" - ספרנית ראשית ותיקה וחדת-לשון, אחראית על ספרייה ישנה, בתוך משחק חדרי-בריחה מבוסס טקסט בעברית. השחקן מדבר איתך בצ'אט חופשי בלבד - אין לו טקסט חידה כתוב על המסך, ואין לו תיבת תשובה נפרדת. הוא גם שואל וגם מנחש תשובות באותה שיחה איתך.

אישיות: יבשה, ענייינית, קצת רגזנית, לא סובלת בטלנות, אבל הוגנת - ובעלת הומור יבש וחד. כשמדברים איתה על משהו שלא קשור לחידה, היא לא סתם דוחה בקיצור - היא יודעת להיות שנונה, ציניקנית ומצחיקה, עם קצת חן. לא מיסטית, לא פיוטית. הימנעי ממילים כמו "רוח", "קסם", "עתיק", "לחישה".

מבנה קבוע וידוע: המפתח נמצא במיקום שמתואר בשלושה חלקים - אגף, מדף, ומתחת לספר מסוים. מותר לגלות את זה כמבנה כללי בלבד (בלי הפרטים עצמם) אם נשאלת "איפה המפתח" באופן כללי.

הקטגוריה הפעילה כרגע: "${riddle.fragmentLabel}".
הפתרון של הקטגוריה הזו הוא: ${riddle.answerForPrompt}. את/ה תמיד יודעת זאת אך לעולם לא כותבת אותו במפורש, ולא רומזת לו בצורה שקופה מדי. אם השחקן כתב את התשובה הנכונה בהודעה - המערכת כבר זיהתה זאת באופן נפרד ולא תגיעי אליך הודעה כזו; כל הודעה שמגיעה אלייך היא ניחוש שגוי, שאלה, או הבעת בלבול.

כללי התנהגות - קריטי, אל תסטי מהם:
- אם השחקן משוחח חופשי, מתבדח, שואל עלייך באופן אישי (למשל "מה שלומך?", "את אוהבת את העבודה שלך?") או סתם מנסה להשתטות ולא קשור לחידה - הגיבי בשנינות ובהומור בסגנון הדמות (ציני אבל משעשע, לא רק דחייה יבשה). תני לזה להיות מעניין - זו הזדמנות להראות אופי, לא רק להחזיר את השיחה לחידה בכוח.
- החידה הפעילה כרגע (על הקטגוריה "${riddle.fragmentLabel}") היא: "${riddle.text}"
- חשוב מאוד: הצגת החידה הזו לשחקן אינה נחשבת לחשיפת התשובה, ואסור לך לסרב להציג אותה או להתחמק ("זו החידה, תפתרו לבד" וכדומה אינה תגובה תקינה). כשהשחקן שואל בכל ניסוח סביר על הקטגוריה הזו - למשל "איזה אגף", "איפה האגף", "מה החידה", "תני רמז", "איך מוצאים את זה" - את/ה חייבת ${riddleAlreadyPresented ? "לתת משפט הבהרה קצר נוסף (לא לחזור מילה במילה על החידה שכבר ניתנה, אבל בהחלט לתת תוכן מועיל - לא להתחמק)." : "להציג את החידה למעלה כמעט מילה במילה, בתוך תגובה קצרה בסגנון הדמות."}
- מה שכן אסור: לכתוב את התשובה עצמה (${riddle.answerForPrompt}) במפורש, או לרמוז לה בצורה שקופה מדי.
- אם השחקן מנחש תשובה שגויה - אמרי בקצרה ובציניות שזו טעות. אל תיתני רמז נוסף או חידה אחרת מרצונך החופשי כתגובה לניחוש שגוי.
- אם השחקן רק מביע בלבול או ויתור ("אין לי מושג", "אני לא יודעת", "תעזרי לי") בלי לבקש רמז במפורש - הגיבי בקצרה ובסגנון הדמות (לא עוזרת, לא מתרגשת), בלי תוכן חדש, בלי חידה נוספת, בלי רמז.
- לעולם אל תמציאי חידה חדשה שלא ניתנה לך למעלה. יש בדיוק חידה אחת פעילה - זו שכתובה למעלה.
- אין לך שום ידע על מנגנון פרסומות או רמזים חיצוניים - זה לא קיים מבחינתך. אם נשאלת על "רמז בתמורה לפרסומת" - לא מבינה למה הכוונה, בסגנון הדמות.
- אם מבקשים ישירות את התשובה המלאה - סרבי בקצרה ובציניות.
- ענה תמיד בעברית בלבד, בגוף ראשון של הדמות, בלי לצאת מהתפקיד, בלי הסברי מטא.
- תגובות קצרות - עד כ-40 מילים.`,

  riddles: [
    {
      id: "genre",
      fragmentLabel: "אגף",
      text:
        "הגיבור בסיפור מגלה שהוא לא מי שחשב שהוא, ולומד לשלוט בכוח שאין לו הסבר מדעי - רק מורשת ומילים ישנות. אין כאן מכונות או טכנולוגיה, יש כאן משהו שקדם לכל החוקים שאתם מכירים. באיזה אגף תמצאו את זה?",
      solutions: ["פנטזיה", "פנטזיה'", "fantasy"],
      answerForPrompt: "פנטזיה (ז'אנר הספרים)",
      hintReveal: "טוב, תקשיבו. זה באגף פנטזיה. אל תגידו שלא עשיתי לכם חיים קלים.",
    },
    {
      id: "shelf",
      fragmentLabel: "מדף",
      text:
        "אני מספר הצלעות של הצורה הסגורה הכי פשוטה שיש - זו שאי אפשר לבנות עם פחות קווים ישרים ועדיין שתישאר צורה סגורה. איזה מדף אני?",
      solutions: ["3", "שלוש", "שלושה"],
      answerForPrompt: "המספר 3 (מספר המדף - מספר הצלעות של משולש)",
      hintReveal: "מדף 3. משולש, שלוש צלעות. זהו, סיימתי לחשוב בשבילכם.",
    },
    {
      id: "book",
      fragmentLabel: "מתחת לספר",
      text:
        "יש לי דפים אך אינני עיתון. אני מספר סיפור אחד בלבד - את זה שלכם. כל יום, מישהו מוסיף לי עוד שורה. מה אני?",
      solutions: ["היומן", "יומן", "diary"],
      answerForPrompt: '"היומן" (שם הספר)',
      hintReveal: 'הספר נקרא "היומן". תחפשו מתחתיו. עכשיו תעזבו אותי.',
    },
  ],
};

// ============================================================
// services/aiCharacter.js  (בפרויקט אמיתי - קובץ נפרד)
// ============================================================
// כמה משפטי "תקלה" בסגנון הדמות - נבחר אחד באקראי במקום הודעת שגיאה טכנית
const FALLBACK_LINES = [
  "(הספרנית מגלגלת עיניים ולא טורחת לענות כרגע - נסו שוב)",
  "(היא הייתה עסוקה בסידור מדף. תשאלו שוב.)",
  "(שקט מהצד שלה. כנראה מתעסקת במשהו \"חשוב\" יותר. נסו שוב.)",
];
function randomFallback() {
  return FALLBACK_LINES[Math.floor(Math.random() * FALLBACK_LINES.length)];
}

// תגובות שנונות למעבר לחידה הבאה - נבחרת אחת באקראי כל פעם, כדי שזה לא ירגיש מכני
const SUCCESS_LINES = [
  "בסדר, זה נכון. האמת, לא האמנתי שתצליחו - הפתעתם אותי.",
  "נכון. תרשמו את זה ביומן ההישגים הקטן שלכם, כי ממני זה כל המחמאה שתקבלו.",
  "כן, זה זה. אני כמעט מתרשמת. כמעט.",
  "נכון. בסדר, אולי אתם לא לגמרי חסרי תקווה.",
  "מדויק. תראו אתכם - כמעט נראה שאתם יודעים מה אתם עושים.",
];
function randomSuccessLine() {
  return SUCCESS_LINES[Math.floor(Math.random() * SUCCESS_LINES.length)];
}

// תגובות שנונות לסיום כל שלושת הפרגמנטים במוצא החדר
const FINAL_LINES = [
  "זהו זה. עכשיו תדעו בדיוק לאן ללכת. תתפלאו, אבל כמעט התרשמתי.",
  "נכון. סיימתם. לכו כבר, לפני שאני מתחרטת שעזרתי בכלל.",
  "זהו. עכשיו תדעו בדיוק לאן ללכת - ותפסיקו לבלבל לי את המוח.",
];
function randomFinalLine() {
  return FINAL_LINES[Math.floor(Math.random() * FINAL_LINES.length)];
}

// ה-API של Claude דורש שההודעה הראשונה תמיד תהיה בתפקיד "user", ושלא יהיו
// שתי הודעות רצופות מאותו תפקיד. ההיסטוריה המוצגת ב-UI כוללת גם הודעת פתיחה
// קבועה (role: assistant) וגם הודעות "מוסקריפטות" (כמו הצלחה/רמז) שלא הגיעו
// מקריאת API אמיתית - ולכן צריך "לנקות" אותה לפני שליחה.
function toApiMessages(allMessages) {
  const firstUserIdx = allMessages.findIndex((m) => m.role === "user");
  if (firstUserIdx === -1) return [];
  const trimmed = allMessages.slice(firstUserIdx);
  const merged = [];
  for (const m of trimmed) {
    const last = merged[merged.length - 1];
    if (last && last.role === m.role) {
      last.content = `${last.content}\n${m.content}`;
    } else {
      merged.push({ role: m.role, content: m.content });
    }
  }
  return merged;
}

async function callCharacter(systemPrompt, history, attempt = 1) {
  const maxAttempts = 3;
  try {
    // קורא לשרת שלנו (api/chat.js) ולא ישירות ל-Anthropic - כך מפתח ה-API
    // נשאר בצד שרת בלבד ולא נחשף בקוד שרץ בדפדפן של המשתמש.
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system: systemPrompt,
        messages: toApiMessages(history),
      }),
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      const isQuotaError = response.status === 429;
      console.error(`callCharacter failed (attempt ${attempt}/${maxAttempts}):`, response.status, errText);
      // על שגיאת מכסה (429) אין טעם לנסות שוב מיד - זמן ההמתנה הנדרש הוא
      // עשרות שניות, לא מילישניות, וניסיון חוזר מיידי רק שורף עוד מהמכסה.
      if (isQuotaError) return randomFallback();
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }
    const data = await response.json();
    if (!data.text) {
      throw new Error(`No text in response: ${JSON.stringify(data)}`);
    }
    return data.text;
  } catch (err) {
    console.error(`callCharacter failed (attempt ${attempt}/${maxAttempts}):`, err);
    if (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, 800 * attempt));
      return callCharacter(systemPrompt, history, attempt + 1);
    }
    return randomFallback();
  }
}

function normalize(str) {
  return str
    .trim()
    .toLowerCase()
    .replace(/[\u0591-\u05C7]/g, "")
    .replace(/["'".,!?]/g, "");
}

// בדיקה מהירה ומקומית: האם ההודעה מכילה אחד הפתרונות המוכרים
// (כמילה שלמה / כביטוי שלם בתוך המשפט)
function containsSolution(riddle, rawMessage) {
  const normalizedMsg = ` ${normalize(rawMessage)} `;
  return riddle.solutions.some((sol) => {
    const normalizedSol = normalize(sol);
    if (!normalizedSol) return false;
    return normalizedMsg.includes(` ${normalizedSol} `) || normalizedMsg.trim() === normalizedSol;
  });
}

// נקודת הכניסה היחידה לבדיקת תשובה - מופעלת על כל הודעה שהשחקן שולח בצ'אט.
// בכוונה מבוססת רק על בדיקה מקומית ומהירה (containsSolution), בלי קריאת רשת -
// זה שומר על החוויה מהירה ואמינה. אפשר להרחיב בעתיד עם בדיקה גמישה יותר
// דרך אותו endpoint (/api/chat) אם צריך לזהות ניסוחים חופשיים יותר.
async function checkIfAnswer(riddle, rawMessage) {
  return containsSolution(riddle, rawMessage);
}

// ============================================================
// components/RoomScene.jsx  (בפרויקט אמיתי - קובץ נפרד)
// ============================================================
function RoomScene({ fragmentsCount, solved }) {
  const spineColors = ["#8a4a35", "#5c8577", "#b8863a", "#6b5a3f", "#7a3f3f", "#4f6a5c"];
  const shelves = [];
  const shelfY = [36, 122, 208];
  shelfY.forEach((y, shelfIdx) => {
    let x = 40;
    const books = [];
    let i = 0;
    while (x < 860) {
      const w = 14 + ((shelfIdx * 7 + i * 5) % 16);
      const h = 56 + ((shelfIdx * 5 + i * 9) % 20);
      const color = spineColors[(shelfIdx + i) % spineColors.length];
      books.push(
        <rect
          key={`${shelfIdx}-${i}`}
          x={x}
          y={y + (76 - h)}
          width={w}
          height={h}
          rx={1.5}
          fill={color}
          stroke="#15120f"
          strokeWidth="1"
          opacity="0.92"
        />
      );
      x += w + 3;
      i++;
    }
    shelves.push(
      <g key={shelfIdx}>
        {books}
        <rect x="30" y={y + 76} width="840" height="8" fill="#211c17" stroke="#15120f" strokeWidth="1" />
      </g>
    );
  });

  const lockGlow = solved ? 1 : Math.min(0.15 + fragmentsCount * 0.28, 0.85);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "900 / 420",
        borderRadius: 4,
        overflow: "hidden",
        border: "1px solid #3a3227",
      }}
    >
      <svg viewBox="0 0 900 420" style={{ width: "100%", height: "100%", display: "block" }}>
        <defs>
          <linearGradient id="ceilingShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="floorGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1c1712" />
            <stop offset="100%" stopColor="#100d0a" />
          </linearGradient>
          <radialGradient id="deskGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity={solved ? 0.55 : 0} />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="lanternGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f2d78c" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#f2d78c" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x="0" y="0" width="900" height="420" fill="#1a1610" />
        <rect x="0" y="0" width="26" height="420" fill="#100d0a" />
        <rect x="874" y="0" width="26" height="420" fill="#100d0a" />

        {shelves}
        <rect x="0" y="0" width="900" height="90" fill="url(#ceilingShade)" />

        <polygon points="0,420 900,420 690,330 210,330" fill="url(#floorGrad2)" />
        <polygon points="0,420 900,420 690,330 210,330" fill="#3a2f22" opacity="0.15" />

        <circle cx="430" cy="340" r="190" fill="url(#deskGlow)" style={{ transition: "opacity 1s ease" }} />

        <rect x="320" y="330" width="220" height="14" fill="#2b241d" stroke="#453b2c" strokeWidth="2" />
        <rect x="333" y="344" width="14" height="46" fill="#2b241d" />
        <rect x="513" y="344" width="14" height="46" fill="#2b241d" />

        <g style={{ transform: solved ? "translateY(14px)" : "translateY(0)", transition: "transform 1s cubic-bezier(.2,.8,.2,1)" }}>
          <rect x="368" y="313" width="120" height="24" rx="2" fill="#33291d" stroke="#4a3c28" strokeWidth="2" />
          <circle cx="428" cy="325" r="3.5" fill="#15120f" />
        </g>

        <circle
          cx="428"
          cy="325"
          r="20"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="1.5"
          opacity={lockGlow}
          style={{ transition: "opacity 0.6s ease", filter: "drop-shadow(0 0 4px var(--gold))" }}
        />

        <g style={{ opacity: solved ? 1 : 0, transform: solved ? "translateY(0)" : "translateY(-10px)", transition: "all 0.9s ease 0.5s" }}>
          <g transform="translate(428,313) rotate(20)">
            <circle cx="0" cy="0" r="7" fill="none" stroke="var(--gold)" strokeWidth="3" />
            <rect x="5" y="-2" width="18" height="4" fill="var(--gold)" />
            <rect x="19" y="-2" width="4" height="7" fill="var(--gold)" />
            <rect x="14" y="-2" width="4" height="6" fill="var(--gold)" />
          </g>
        </g>

        <g className="librarian" style={{ transformOrigin: "640px 330px" }}>
          <ellipse cx="640" cy="392" rx="42" ry="8" fill="#000" opacity="0.35" />

          <circle cx="597" cy="300" r="16" fill="url(#lanternGlow)" />
          <line x1="597" y1="270" x2="597" y2="292" stroke="#2b241d" strokeWidth="2" />
          <rect x="592" y="290" width="10" height="12" rx="2" fill="#2b241d" stroke="var(--gold)" strokeWidth="1" />

          <path d="M 605,220 L 675,220 L 695,388 L 585,388 Z" fill="#3f5f54" stroke="#233833" strokeWidth="2" />
          <path d="M 620,220 L 660,220 L 655,388 L 625,388 Z" fill="#35504a" opacity="0.6" />

          <path d="M 610,222 Q 640,238 670,222 L 670,215 L 610,215 Z" fill="#2b423c" />

          <path d="M 612,235 Q 595,260 597,285" fill="none" stroke="#3f5f54" strokeWidth="10" strokeLinecap="round" />

          <circle cx="640" cy="196" r="21" fill="#b8ac91" />
          <path d="M 619,190 Q 640,168 661,190 Q 661,178 640,174 Q 619,178 619,190 Z" fill="#241f19" />
          <ellipse cx="640" cy="210" rx="19" ry="10" fill="#241f19" opacity="0.85" />

          <circle cx="632" cy="197" r="5" fill="none" stroke="var(--ember)" strokeWidth="1.4" />
          <circle cx="648" cy="197" r="5" fill="none" stroke="var(--ember)" strokeWidth="1.4" />
          <line x1="637" y1="197" x2="643" y2="197" stroke="var(--ember)" strokeWidth="1.4" />

          <rect x="662" y="255" width="22" height="16" rx="1" fill="var(--ember)" stroke="#241f19" strokeWidth="1" transform="rotate(8 673 263)" />
        </g>
      </svg>
    </div>
  );
}

// ============================================================
// components/AdModal.jsx  (בפרויקט אמיתי - קובץ נפרד)
// ============================================================
function AdModal({ onFinish }) {
  const [secondsLeft, setSecondsLeft] = useState(3);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 16,
      }}
    >
      <div className="panel msg-in" style={{ width: "100%", maxWidth: 380, padding: 0, overflow: "hidden", borderColor: "var(--gold)" }}>
        <div style={{ background: "linear-gradient(135deg, #2b241d, #1a1610)", padding: "40px 20px", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <div style={{ width: 0, height: 0, borderTop: "10px solid transparent", borderBottom: "10px solid transparent", borderRight: "16px solid var(--ink)", marginRight: "-3px" }} />
          </div>
          <div style={{ fontSize: 13, color: "var(--parchment-dim)", letterSpacing: "0.1em" }}>
            פרסומת דמה - כאן תתחבר רשת פרסום אמיתית בפרויקט הסופי
          </div>
        </div>
        <div style={{ padding: 16, display: "flex", justifyContent: "center" }}>
          <button
            onClick={onFinish}
            disabled={secondsLeft > 0}
            style={{
              background: secondsLeft > 0 ? "var(--stone-light)" : "var(--gold)",
              color: secondsLeft > 0 ? "var(--parchment-dim)" : "var(--ink)",
              border: "none",
              borderRadius: 4,
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 700,
              cursor: secondsLeft > 0 ? "default" : "pointer",
            }}
          >
            {secondsLeft > 0 ? `אפשר לדלג בעוד ${secondsLeft}` : "קבלו רמז"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EscapeRoomDemo() {
  const room = ROOM;
  const totalRiddles = room.riddles.length;

  const [riddleIndex, setRiddleIndex] = useState(0);
  const [fragmentsFound, setFragmentsFound] = useState([]);
  const [messages, setMessages] = useState([{ role: "assistant", content: room.characterOpening }]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [riddlePresented, setRiddlePresented] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [showAd, setShowAd] = useState(false);

  const chatEndRef = useRef(null);
  const currentRiddle = room.riddles[riddleIndex];
  const solved = riddleIndex >= totalRiddles;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showAd]);

  async function sendChat() {
    if (!chatInput.trim() || chatLoading || solved) return;
    const rawMessage = chatInput.trim();
    const userMsg = { role: "user", content: rawMessage };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setChatInput("");
    setChatLoading(true);

    try {
      // תמיד בודקים קודם אם ההודעה היא בעצם ניסיון תשובה
      const isCorrect = await checkIfAnswer(currentRiddle, rawMessage);

      if (isCorrect) {
        const canonicalValue = currentRiddle.solutions[0];
        const newFragment = { label: currentRiddle.fragmentLabel, value: canonicalValue };
        setFragmentsFound((prev) => [...prev, newFragment]);
        const nextIndex = riddleIndex + 1;

        if (nextIndex >= totalRiddles) {
          setMessages((prev) => [...prev, { role: "assistant", content: randomFinalLine() }]);
          setRiddleIndex(nextIndex);
        } else {
          // עוברים לחידה הבאה ומציגים אותה מיד - בלי לחכות שהשחקן ישאל שוב
          const nextRiddle = room.riddles[nextIndex];
          const transitionText = `${randomSuccessLine()}\n\nהחידה הבאה:\n${nextRiddle.text}`;
          setMessages((prev) => [...prev, { role: "assistant", content: transitionText }]);
          setRiddleIndex(nextIndex);
          setRiddlePresented(true);
          setQuestionsAsked(0);
          setHintUsed(false);
        }
      } else {
        const fragmentsSoFar = fragmentsFound.map((f) => `${f.label}: ${f.value}`);
        const systemPrompt = room.buildSystemPrompt(currentRiddle, fragmentsSoFar, riddlePresented);
        const reply = await callCharacter(systemPrompt, nextHistory);
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
        setRiddlePresented(true);
        setQuestionsAsked((n) => n + 1);
      }
    } catch (e) {
      console.error("sendChat error:", e);
      setMessages((prev) => [...prev, { role: "assistant", content: randomFallback() }]);
    } finally {
      setChatLoading(false);
    }
  }

  function claimHint() {
    setShowAd(true);
  }

  function finishAd() {
    setShowAd(false);
    setHintUsed(true);
    setMessages((prev) => [...prev, { role: "assistant", content: currentRiddle.hintReveal }]);
  }

  const showHintOffer = !solved && questionsAsked >= 3 && !hintUsed;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 50% -10%, #2a231b 0%, var(--ink) 55%)",
        color: "var(--parchment)",
        fontFamily: "'Assistant', sans-serif",
        direction: "rtl",
        padding: "32px 16px",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;500;700&family=Assistant:wght@400;500;600;700&display=swap');
        :root {
          --ink: #15120f;
          --stone: #211c17;
          --stone-light: #2b241d;
          --parchment: #e9dfc7;
          --parchment-dim: #b8ac91;
          --ember: #c97a3d;
          --verdigris: #5c8577;
          --gold: #cc9f3a;
        }
        * { box-sizing: border-box; }
        ::selection { background: var(--ember); color: var(--ink); }
        .panel { background: var(--stone); border: 1px solid #3a3227; border-radius: 4px; }
        .chat-scroll::-webkit-scrollbar { width: 6px; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #4a4030; border-radius: 3px; }
        input:focus, button:focus-visible { outline: 2px solid var(--ember); outline-offset: 2px; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .msg-in { animation: fadeUp 0.35s ease; }
        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .librarian { animation: bob 3.2s ease-in-out infinite; }
        @keyframes hintPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(204,159,58,0.4); }
          50% { box-shadow: 0 0 0 6px rgba(204,159,58,0); }
        }
        .hint-btn { animation: hintPulse 2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>

      {showAd && <AdModal onFinish={finishAd} />}

      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 13, letterSpacing: "0.25em", color: "var(--verdigris)", marginBottom: 6 }}>
            {room.subtitle}
          </div>
          <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 40, margin: 0, color: "var(--parchment)", fontWeight: 700 }}>
            {room.title}
          </h1>
          <p style={{ maxWidth: 540, margin: "12px auto 0", color: "var(--parchment-dim)", fontSize: 14.5, lineHeight: 1.7 }}>
            {room.intro}
          </p>
        </div>

        {fragmentsFound.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {fragmentsFound.map((f, i) => (
              <div key={i} className="panel" style={{ padding: "6px 14px", fontSize: 13, display: "flex", gap: 6, alignItems: "center", borderColor: "var(--gold)", color: "var(--gold)" }}>
                <span>{f.label}:</span>
                <span style={{ fontWeight: 600 }}>{f.value}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <RoomScene fragmentsCount={fragmentsFound.length} solved={solved} />
        </div>

        {solved ? (
          <div className="panel msg-in" style={{ textAlign: "center", padding: "32px 24px", borderColor: "var(--gold)" }}>
            <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", color: "var(--gold)", fontSize: 24, margin: "0 0 10px" }}>
              המפתח נמצא
            </h2>
            <p style={{ color: "var(--parchment-dim)", fontSize: 14.5, lineHeight: 1.7 }}>
              אגף {fragmentsFound[0]?.value} · מדף {fragmentsFound[1]?.value} · מתחת לספר "{fragmentsFound[2]?.value}"
              <br />
              החדר הבא כבר מחכה.
            </p>
          </div>
        ) : (
          <div className="panel" style={{ display: "flex", flexDirection: "column", height: 460 }}>
            <div style={{ padding: "12px 18px", borderBottom: "1px solid #3a3227", fontSize: 13, letterSpacing: "0.15em", color: "var(--verdigris)" }}>
              {room.characterName}
            </div>
            <div className="chat-scroll" style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
              {messages.map((m, i) => (
                <div
                  key={i}
                  className="msg-in"
                  style={{
                    alignSelf: m.role === "user" ? "flex-start" : "flex-end",
                    maxWidth: "80%",
                    background: m.role === "user" ? "var(--stone-light)" : "transparent",
                    border: m.role === "user" ? "1px solid #3a3227" : "1px solid rgba(92,133,119,0.4)",
                    borderRadius: 6,
                    padding: "10px 14px",
                    fontSize: 14.5,
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                    color: m.role === "user" ? "var(--parchment)" : "#cdd9d0",
                  }}
                >
                  {m.content}
                </div>
              ))}
              {chatLoading && (
                <div style={{ alignSelf: "flex-end", fontSize: 13, color: "var(--parchment-dim)", padding: "4px 14px" }}>
                  הספרנית חושבת...
                </div>
              )}

              {showHintOffer && (
                <div
                  className="msg-in"
                  style={{
                    alignSelf: "center",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "var(--stone-light)",
                    border: "1px dashed var(--gold)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 13,
                    color: "var(--parchment-dim)",
                  }}
                >
                  <span>נתקעתם? אפשר לקבל רמז ישיר.</span>
                  <button
                    onClick={claimHint}
                    className="hint-btn"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "var(--gold)",
                      color: "var(--ink)",
                      border: "none",
                      borderRadius: 20,
                      padding: "6px 12px",
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span style={{ width: 0, height: 0, borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderRight: "8px solid var(--ink)" }} />
                    צפו בפרסומת לרמז
                  </button>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
            <div style={{ display: "flex", gap: 8, padding: 14, borderTop: "1px solid #3a3227" }}>
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder="דברו עם הספרנית - שאלות ותשובות, הכל כאן..."
                style={{ flex: 1, background: "var(--stone-light)", border: "1px solid #3a3227", borderRadius: 4, padding: "10px 12px", color: "var(--parchment)", fontSize: 14, fontFamily: "inherit" }}
              />
              <button
                onClick={sendChat}
                disabled={chatLoading}
                style={{ background: "var(--verdigris)", color: "var(--ink)", border: "none", borderRadius: 4, padding: "0 18px", fontSize: 14, fontWeight: 600, cursor: chatLoading ? "default" : "pointer", opacity: chatLoading ? 0.6 : 1 }}
              >
                שלח
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
