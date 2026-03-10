# 🎯 Scrabble — Browser Word Game

A full-stack, production-ready Scrabble game built with **Next.js 16**, **TypeScript**, and **Tailwind CSS**. Play the classic word game against an AI opponent with three difficulty tiers, smooth animations, and a polished dark glassmorphism UI.

---

## ✨ Features

- **Full Scrabble rules** — premium squares (TWS/DWS/TLS/DLS), standard 100-tile bag, 7-tile rack, bingo bonus (+50 for using all tiles)
- **AI opponent** with three difficulties:
  - **Easy** — plays random valid moves
  - **Medium** — selects from top-5 scoring moves randomly
  - **Hard** — always plays the highest-scoring move
- **Word validation** — built-in dictionary of 2–8 letter valid Scrabble words
- **Blank tile support** — click to assign any letter
- **Swap tiles** — exchange any rack tiles with the bag (costs a turn)
- **Pass / Recall** — full turn management
- **Shuffle rack** — rearrange your tiles
- **Pause / Resume** — pause at any time
- **Sound effects** — synthesised audio via Web Audio API (toggle on/off)
- **Win / lose detection** with animated end screen and confetti
- **Move history** — scrollable log with word and score per turn
- **Keyboard shortcuts** — Enter to play, Esc to recall, Space to shuffle
- **Fully responsive** — works on desktop, tablet, and mobile
- **Dark neon aesthetic** with glassmorphism cards and smooth Framer Motion animations
- **Custom favicon** — themed tile icon

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Confetti | canvas-confetti |
| Audio | Web Audio API |
| State | useReducer hook |
| Deploy | Vercel |

---

## 🎮 Controls

### Desktop
| Action | Control |
|---|---|
| Select a tile | Click the tile in your rack |
| Place a tile | Click a board square |
| Submit word | Click **Play** or press **Enter** |
| Return tiles to rack | Click **Recall** or press **Esc** |
| Shuffle rack | Click **🔀** or press **Space** |
| Pass turn | Click **Pass** |
| Swap tiles | Click **Swap**, select tiles, confirm |
| Pause | Click **⏸** |
| Toggle sound | Click **🔊 / 🔇** |

### Mobile / Touch
- Tap a tile in your rack to select it (it lifts up)
- Tap a board cell to place the selected tile
- Use the on-screen buttons for all actions

---

## 🚀 Run Locally

### Prerequisites
- Node.js 18+
- npm / pnpm / bun

### Steps

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd scrabble

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
npm run build
npm start
```

---

## ☁️ Deploy to Vercel

1. Push your code to a GitHub / GitLab / Bitbucket repository
2. Go to [vercel.com](https://vercel.com) and click **Add New Project**
3. Import your repository — Vercel auto-detects Next.js
4. Click **Deploy** — no extra configuration required

The project is **zero-config** for Vercel deployment.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main game page + orchestration
│   ├── layout.tsx        # Root layout + metadata
│   └── globals.css       # Global styles
├── components/
│   ├── Board.tsx         # 15×15 Scrabble board
│   ├── Tile.tsx          # Individual letter tile
│   ├── TileRack.tsx      # Player tile rack
│   ├── ScoreBoard.tsx    # Scores + move history
│   ├── GameControls.tsx  # Action buttons
│   ├── SetupScreen.tsx   # Welcome / difficulty screen
│   ├── EndScreen.tsx     # Game over + confetti
│   ├── PauseOverlay.tsx  # Pause modal
│   └── BlankTileModal.tsx # Blank tile letter picker
├── hooks/
│   ├── useGame.ts        # Game state machine (useReducer)
│   └── useSound.ts       # Web Audio sound effects
├── utils/
│   ├── board.ts          # Board layout + premium squares
│   ├── tiles.ts          # Tile bag distribution
│   ├── dictionary.ts     # Built-in word list (~3000+ words)
│   ├── scoring.ts        # Word scoring + move validation
│   └── ai.ts             # AI move generation engine
└── types/
    └── game.ts           # All TypeScript type definitions
```

---

## 📜 Game Rules Summary

- Each player draws **7 tiles** from a shuffled bag of 100
- The first word must cover the **centre star (★)**
- Every subsequent play must **connect** to an existing word
- All tiles placed in one turn must be in a **single row or column**
- All newly formed words are validated against the dictionary
- **Premium squares** multiply tile or word scores (only when first covered)
- Using all **7 tiles** in one move scores a **+50 Bingo bonus**
- Game ends when the bag is empty and one player empties their rack, or after **6 consecutive passes**
- Unplayed tiles are **deducted** from each player's score at game end
