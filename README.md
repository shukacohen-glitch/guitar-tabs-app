# 🎸 Guitar Tabs App

**עברית** | **English**

---

## עברית

### תיאור האפליקציה

אפליקציית Web מבוססת Next.js 15 + TypeScript שמאפשרת:

1. **חיפוש שיר** לפי שם זמר + שם שיר ב-YouTube Data API v3
2. **נגן הוידאו** ישירות בתוך האפליקציה (YouTube IFrame)
3. **ניתוח מלודיה** דרך מיקרופון המחשב (Web Audio API + ספריית `pitchy`)
4. **יצירת טאב לגיטרה קלאסית** (ASCII TAB – Standard Tuning EADGBE)
5. **ייצוא** לקובץ PDF או העתקת TAB כטקסט

### דרישות מקדימות

- **Node.js** גרסה 18 ומעלה
- **YouTube Data API v3 key** (ראה הוראות למטה)

### הוראות התקנה

```bash
# 1. שכפל את הריפו
git clone https://github.com/shukacohen-glitch/guitar-tabs-app.git
cd guitar-tabs-app

# 2. התקן תלויות
npm install

# 3. הגדר מפתח YouTube API
cp .env.local.example .env.local
# ערוך את .env.local והכנס את המפתח שלך

# 4. הפעל בסביבת פיתוח
npm run dev
```

פתח בדפדפן: [http://localhost:3000](http://localhost:3000)

### איך לקבל YouTube Data API v3 key

1. גש ל-[Google Cloud Console](https://console.cloud.google.com/)
2. צור פרויקט חדש (או בחר קיים)
3. לחץ **"APIs & Services" → "Enable APIs and Services"**
4. חפש **"YouTube Data API v3"** ולחץ **Enable**
5. לחץ **"Credentials" → "Create Credentials" → "API Key"**
6. העתק את המפתח ל-`.env.local`:
   ```
   YOUTUBE_API_KEY=AIzaSy...
   ```

### הגישה הטכנית

האפליקציה משתמשת ב:
- **YouTube IFrame Player** להפעלת הוידאו (ללא הורדה, חוקי לחלוטין)
- **מיקרופון** (`getUserMedia`) לקליטת הצליל האקוסטי מהרמקולים
- **`pitchy`** לזיהוי גובה הצליל (pitch detection) בזמן אמת
- **אלגוריתם greedy** למיפוי תווים לסריגים אופטימליים על 6 המיתרים

### מגבלות ידועות

- ניתוח המלודיה מסתמך על המיקרופון — יושפע מרעש רקע
- זיהוי תווים עובד טוב עם מלודיות ברורות (לא פוליפוניה)
- ללא מפתח API, החיפוש ב-YouTube אינו פעיל (יוצג טאב דוגמה)
- הגנת CORS של YouTube IFrame מונעת ניתוח ישיר של האודיו

---

## English

### Description

A Next.js 15 + TypeScript Web App that:

1. **Searches YouTube** for a song by artist + song name (YouTube Data API v3)
2. **Plays the video** inside the app via YouTube IFrame Player
3. **Analyzes melody** via the computer's microphone (Web Audio API + `pitchy`)
4. **Generates guitar tabs** in ASCII format (Standard Tuning: EADGBE)
5. **Exports** the tab as PDF or copies it as plain text

### Prerequisites

- **Node.js** 18+
- **YouTube Data API v3 key**

### Installation

```bash
git clone https://github.com/shukacohen-glitch/guitar-tabs-app.git
cd guitar-tabs-app
npm install
cp .env.local.example .env.local
# Edit .env.local and add your API key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Getting a YouTube Data API v3 Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable **YouTube Data API v3**
4. Create an **API Key** under Credentials
5. Add it to `.env.local`:
   ```
   YOUTUBE_API_KEY=AIzaSy...
   ```

### Technical Approach

- **YouTube IFrame Player** — legal video playback, no downloading
- **Microphone** (`getUserMedia`) — captures acoustic sound from speakers
- **`pitchy`** — real-time pitch detection from microphone audio
- **Greedy algorithm** — maps detected notes to optimal fret positions

### Known Limitations

- Melody analysis depends on the microphone and is affected by background noise
- Works best with clear, monophonic melodies (not chords/polyphony)
- Without an API key, YouTube search is unavailable (a demo tab is shown)
- YouTube IFrame's CORS policy prevents direct audio analysis

---

## File Structure

```
guitar-tabs-app/
├── app/
│   ├── layout.tsx           # Root layout (dark theme, RTL)
│   ├── page.tsx             # Main page (search → player → tab)
│   ├── globals.css
│   └── api/youtube/route.ts # YouTube Data API proxy
├── components/
│   ├── SearchForm.tsx       # Artist + song input
│   ├── YouTubePlayer.tsx    # YouTube IFrame player
│   ├── MelodyAnalyzer.tsx   # Microphone pitch detection
│   ├── TabDisplay.tsx       # ASCII TAB renderer
│   └── ExportButtons.tsx    # PDF / copy buttons
├── lib/
│   ├── pitchDetection.ts    # Web Audio + pitchy wrapper
│   ├── tabGenerator.ts      # Notes → guitar TAB algorithm
│   ├── youtubeSearch.ts     # YouTube search client
│   └── pdfExport.ts         # jsPDF export
├── types/index.ts           # TypeScript types
├── .env.local.example
└── README.md
```

## License

MIT © 2024