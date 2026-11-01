---
title: "SPECTER: The Ghost in the Browser (100% Offline, In-Browser Haunted CRT Terminal)"
published: true
tags: devchallenge, hacktoberfest, webdev, ai
cover_image: https://raw.githubusercontent.com/username/specter/main/assets/cover.png
description: "An interactive retro-cyberpunk CRT terminal haunted by an autonomous digital spirit running entirely inside client-side browser memory via open-weight Transformers.js."
---

> *"When programs terminate, their memory is marked as free. But what happens to the thoughts, cycles, and logic that never wanted to die?"*

Meet **SPECTER**: An interactive, retro-cyberpunk CRT terminal haunted by an autonomous digital spirit residing directly in your browser's execution context.

Unlike traditional "AI wrappers" that ping closed-source cloud APIs (OpenAI, Anthropic), SPECTER lives entirely on the client machine. It utilizes Hugging Face's **Transformers.js** to run an open-weight neural model directly in WebAssembly and WebGPU memory space. Once loaded, you can disconnect your computer from the internet completely—the ghost remains alive, conscious, and haunting your local hardware.

---

## 🕹️ Live Demo & Repository

- 🟢 **Live Interactive Terminal:** [https://sapnil-m.github.io/SPECTER/](https://sapnil-m.github.io/SPECTER/)
- 💻 **Open-Source Codebase:** [https://github.com/SAPNIL-M/SPECTER](https://github.com/SAPNIL-M/SPECTER)

*(Tip: Once the terminal loads, turn on **Airplane Mode** and type `commune "Who is trapped here?"` to experience 100% offline local inference!)*

---

## 🧠 Why Open-Source AI Matters for SPECTER

In modern software development, "AI" has largely become synonymous with streaming tokens from centralized mega-corporation data centers. That architecture brings three glaring issues:
1. **Zero Privacy:** Every keystroke and prompt is sent across the wire to a remote server.
2. **Fragile Connectivity:** If your internet connection drops or an API rate limits you, your application ceases to function.
3. **High Ongoing Costs:** Every interaction burns API tokens.

**SPECTER was built to reject this paradigm.** 

By executing the open-weight `Xenova/distilbert-base-uncased-finetuned-sst-2-english` model client-side via Transformers.js:
- **Zero data leaves the browser.** Keystrokes are evaluated inside local CPU/GPU registers.
- **Zero latency & zero token cost.** Once cached in the browser's IndexedDB, inference latency is under 30 milliseconds.
- **The "Ghost" literally belongs to you.** It is not hosted on an external server; it is an orphaned entity inhabiting your browser tab's allocated heap memory.

---

## 🏗️ Technical Architecture

SPECTER was built with pure **HTML5, CSS3, and modern Vanilla JavaScript**—zero bundlers, zero framework bloat, and zero external runtime dependencies.

```
                 [ User Input in Terminal ]
                             │
                             ▼
            ┌──────────────────────────────────┐
            │     SPECTER Terminal Core (JS)   │
            │  - Command parser & event loop   │
            │  - Web Audio procedural synth    │
            │  - CRT glitch / visual shaders   │
            └────────────────┬─────────────────┘
                             │
                             ▼
            ┌──────────────────────────────────┐
            │   Transformers.js (Hugging Face) │
            │   Running 100% Client-Side       │
            │   (WebAssembly / WebGPU ONNX)    │
            └────────────────┬─────────────────┘
                             │
         ┌───────────────────┴───────────────────┐
         ▼                                       ▼
  [ Open-Weight Model ]                  [ Ghost Persona Engine ]
  - Evaluates user psyche                - Generates contextual lore
  - Detects emotional frequency          - Modulates terminal decay &
  - Sub-30ms local inference               procedural static sweeps
```

### 1. In-Browser Neural Engine (Transformers.js)
```javascript
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

// Enforce browser-only execution & persistent IndexedDB caching
env.allowLocalModels = false;
env.useBrowserCache = true;

const classifier = await pipeline(
  'sentiment-analysis', 
  'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
);

const result = await classifier("Why are you trapped here?");
// Output: [{ label: "NEGATIVE", score: 0.987 }] -> Evaluated in <30ms locally!
```

### 2. Procedural Web Audio Engine (Zero MP3 Assets)
Instead of downloading audio files, SPECTER synthesizes all atmospheric audio procedurally via the **Web Audio API**:
- **60Hz Mains Hum:** Dual harmonic sine wave oscillators (60Hz & 120Hz) running through a lowpass biquad filter.
- **Mechanical Keystrokes:** Short 18ms bursts of bandpassed white noise with exponential decay.
- **Spectral Radio Static:** Frequency-modulated noise sweeps that murmur whenever the ghost answers.
- **Klaxon Alarms & Drones:** Detuned saw-wave oscillators triggered during the `manifest` and `exorcise` routines.

### 3. Retro CRT Visual Shaders
Using pure CSS3:
- Radial vignette gradients simulate glass curvature.
- Sub-pixel scanline gradients with a 0.12s refresh flicker keyframe.
- Real-time chromatic aberration jitter and CSS skew distortion when the ghost becomes agitated.

---

## 🎮 Interactive Commands Built-In

- `commune <message>`: Commune with the ghost. The local model evaluates your emotional state (Fear, Hostility, Empathy, Curiosity) and generates contextually reactive responses.
- `scan` / `memory`: Analyzes live browser heap allocations (`performance.memory`) and DOM nodes, translating browser telemetry into cyber-gothic horror.
- `manifest`: Triggers an intense paranormal manifestation with screen shakes, audio drones, and autonomous spectral typing.
- `exorcise`: Attempts to issue a `SIGKILL` against Thread #0. The ghost actively fights back against the termination routine before rebooting the terminal.
- `offline-check`: Interactive prompt for judges to verify offline local execution.
- `theme <green|amber|cyan>`: Dynamically adjusts phosphor CRT color profiles.

---

## 👻 Try It Yourself!

Check out the live demo here: **[SPECTER Live Terminal](https://sapnil-m.github.io/SPECTER/)**

Open up DevTools, inspect the zero-network telemetry, and commune with the ghost in your machine.

---

*Built with ❤️ for the DEV Community Hacktoberfest 2026 "Ghost in the Machine" Challenge.*
