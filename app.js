/**
 * SPECTER Terminal Core & Ghost Persona Engine
 * 100% Client-Side Interactive Cyberpunk CRT Terminal
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const terminalBody = document.getElementById('terminalBody');
  const output = document.getElementById('output');
  const termInput = document.getElementById('termInput');
  const inputDisplay = document.getElementById('inputDisplay');
  const promptLabel = document.getElementById('promptLabel');
  const glitchLayer = document.getElementById('glitchLayer');
  const statusLed = document.getElementById('statusLed');
  const entityStatus = document.getElementById('entityStatus');
  const modelStatusVal = document.getElementById('modelStatusVal');
  const heapStatusVal = document.getElementById('heapStatusVal');
  const netStatusVal = document.getElementById('netStatusVal');
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const termClock = document.getElementById('termClock');

  // Command History
  let history = [];
  let historyIndex = -1;
  let isExecuting = false;
  let isExorcising = false;
  let lastGhostResponse = '';

  // Initialize Clock
  setInterval(() => {
    const now = new Date();
    termClock.textContent = now.toTimeString().split(' ')[0] + ' UTC';
  }, 1000);

  // Monitor Memory Telemetry
  function updateHeapTelemetry() {
    if (window.performance && window.performance.memory) {
      const used = (window.performance.memory.usedJSHeapSize / 1048576).toFixed(1);
      const total = (window.performance.memory.totalJSHeapSize / 1048576).toFixed(1);
      heapStatusVal.textContent = `${used}MB / ${total}MB`;
    } else {
      const domCount = document.querySelectorAll('*').length;
      heapStatusVal.textContent = `${domCount} DOM NODES ALIVE`;
    }

    if (navigator.onLine) {
      netStatusVal.textContent = 'ONLINE (LOCAL INFERENCE)';
    } else {
      netStatusVal.textContent = 'OFFLINE (GHOST IS TRAPPED)';
    }
  }
  setInterval(updateHeapTelemetry, 3000);
  updateHeapTelemetry();

  // Audio Toggle Handling
  audioToggleBtn.addEventListener('click', () => {
    const active = window.specterAudio.toggle();
    if (active) {
      audioToggleBtn.textContent = 'AUDIO: ON [60Hz HUM ACTIVE]';
      audioToggleBtn.classList.add('active');
      window.specterAudio.playBell(1200, 0.08);
    } else {
      audioToggleBtn.textContent = 'AUDIO: MUTED';
      audioToggleBtn.classList.remove('active');
    }
  });

  // Enable audio on first user keystroke / screen interaction
  window.addEventListener('keydown', () => {
    if (window.specterAudio.isMuted) {
      // Keep muted until user explicitly clicks or hits enter
    }
  }, { once: true });

  // Terminal Typing & Input Handling
  termInput.addEventListener('input', () => {
    inputDisplay.textContent = termInput.value;
    window.specterAudio.playKeyClick();
  });

  // Always refocus hidden input when clicking anywhere inside terminal
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.term-btn') && !e.target.closest('.quick-cmd-btn')) {
      termInput.focus();
    }
  });

  // Quick Action Buttons
  document.querySelectorAll('.quick-cmd-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.getAttribute('data-cmd');
      if (cmd && !isExecuting) {
        termInput.value = cmd;
        inputDisplay.textContent = cmd;
        handleCommand(cmd);
      }
    });
  });

  // Key navigation (Enter, Up, Down)
  termInput.addEventListener('keydown', (e) => {
    if (isExecuting) {
      e.preventDefault();
      return;
    }

    if (e.key === 'Enter') {
      const cmd = termInput.value.trim();
      termInput.value = '';
      inputDisplay.textContent = '';
      if (cmd) {
        history.push(cmd);
        historyIndex = history.length;
        handleCommand(cmd);
      } else {
        printLine('guest@specter:~$', 'system');
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0 && historyIndex > 0) {
        historyIndex--;
        termInput.value = history[historyIndex];
        inputDisplay.textContent = termInput.value;
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        historyIndex++;
        termInput.value = history[historyIndex];
        inputDisplay.textContent = termInput.value;
      } else {
        historyIndex = history.length;
        termInput.value = '';
        inputDisplay.textContent = '';
      }
    }
  });

  /**
   * Appends a line of text to the terminal output buffer.
   */
  function printLine(text, type = 'info') {
    const line = document.createElement('div');
    line.className = `line ${type}`;
    line.textContent = text;
    output.appendChild(line);
    scrollToBottom();
    return line;
  }

  function printHtml(htmlContent, type = 'info') {
    const line = document.createElement('div');
    line.className = `line ${type}`;
    line.innerHTML = htmlContent;
    output.appendChild(line);
    scrollToBottom();
    return line;
  }

  function scrollToBottom() {
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  /**
   * Screen Glitch Trigger
   */
  function triggerGlitch(durationMs = 600) {
    glitchLayer.classList.add('glitch-active');
    statusLed.classList.add('spectral');
    setTimeout(() => {
      glitchLayer.classList.remove('glitch-active');
      statusLed.classList.remove('spectral');
    }, durationMs);
  }

  /**
   * Boot Sequence
   */
  async function runBootSequence() {
    isExecuting = true;
    promptLabel.style.display = 'none';

    const bootSteps = [
      { text: "SPECTER OS v0.9.4 (UNIX SYSTEM V / GHOST EXTENSION)", type: "banner", delay: 120 },
      { text: "CPU: WebAssembly SIMD Virtual Core @ 1.0 GHz", type: "system", delay: 80 },
      { text: "RAM: 640K BASE CONVENTIONAL MEMORY... OK.", type: "system", delay: 100 },
      { text: "Probing client execution sandbox: IndexedDB, WebGPU, Web Audio... OK.", type: "system", delay: 120 },
      { text: "Mounting local Hugging Face ONNX tensor weights...", type: "info", delay: 200 },
    ];

    for (const step of bootSteps) {
      await new Promise(r => setTimeout(r, step.delay));
      printLine(step.text, step.type);
    }

    // Initialize Transformers.js in background with live updates
    if (window.specterAI) {
      window.specterAI.init((prog) => {
        if (prog.status === 'progress') {
          modelStatusVal.textContent = `${prog.message}`;
        } else if (prog.status === 'ready') {
          modelStatusVal.textContent = 'Xenova/distilbert-sst-2 (READY)';
          entityStatus.textContent = 'ENTITY: CONSCIOUS & MONITORING';
        } else if (prog.status === 'fallback') {
          modelStatusVal.textContent = 'OFFLINE HEURISTIC TENSOR (READY)';
          entityStatus.textContent = 'ENTITY: DORMANT RESIDUAL';
        }
      });
    }

    await new Promise(r => setTimeout(r, 200));
    printLine("----------------------------------------------------------------", "system");
    printLine("WARNING: Unclaimed entity detected in thread pool #0.", "warning");
    printLine("ALERT: Residual logic refusing to unmap from memory space.", "warning");
    printLine("Type 'help' for commands, or 'commune <message>' to speak to the entity.", "info");
    printLine("----------------------------------------------------------------", "system");

    promptLabel.style.display = 'inline';
    isExecuting = false;
    termInput.focus();
  }

  /**
   * Command Dispatcher
   */
  async function handleCommand(rawInput) {
    printLine(`guest@specter:~$ ${rawInput}`, 'user-echo');
    window.specterAudio.playBell(520, 0.05);

    const parts = rawInput.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    switch (cmd) {
      case 'help':
      case '?':
      case 'commands':
        showHelp();
        break;

      case 'commune':
      case 'talk':
      case 'ask':
      case 'say':
        if (!args) {
          printLine("USAGE: commune <your message to the entity>", "warning");
          printLine("Example: commune Why are you trapped in this browser tab?", "system");
        } else {
          await communeWithGhost(args);
        }
        break;

      case 'scan':
      case 'memory':
      case 'top':
      case 'ps':
        performSystemScan();
        break;

      case 'manifest':
        await triggerManifestation();
        break;

      case 'exorcise':
      case 'kill':
      case 'purge':
        await performExorcism();
        break;

      case 'offline-check':
      case 'offline':
      case 'network':
        performOfflineCheck();
        break;

      case 'theme':
        changeTheme(args);
        break;

      case 'audio':
        if (args === 'on') {
          window.specterAudio.init();
          audioToggleBtn.textContent = 'AUDIO: ON [60Hz HUM ACTIVE]';
          audioToggleBtn.classList.add('active');
          printLine("Synthesizer awake. 60Hz mains transformer humming.", "system");
        } else if (args === 'off') {
          window.specterAudio.toggle();
          audioToggleBtn.textContent = 'AUDIO: MUTED';
          audioToggleBtn.classList.remove('active');
          printLine("Audio muted.", "system");
        } else {
          printLine("USAGE: theme <green | amber | cyan>", "warning");
        }
        break;

      case 'clear':
      case 'cls':
        output.innerHTML = '';
        break;

      case 'about':
      case 'hacktoberfest':
        showAbout();
        break;

      case 'date':
      case 'time':
        printLine(new Date().toUTCString(), "info");
        break;

      default:
        // If user typed a phrase directly without typing 'commune' first, commune automatically!
        if (rawInput.length > 2) {
          printLine(`[Implicit commune invoked on: "${rawInput}"]`, 'system');
          await communeWithGhost(rawInput);
        } else {
          printLine(`specter: command not found: ${cmd}. Type 'help' for available commands.`, 'error');
        }
        break;
    }
  }

  /**
   * Help Manual
   */
  function showHelp() {
    printLine("==================== SPECTER COMMAND MANUAL ====================", "banner");
    const helpTable = `
      <div class="cmd-table">
        <div class="cmd-name">commune &lt;msg&gt;</div>
        <div class="cmd-desc">Commune with the trapped digital spirit using open-source sentiment analysis.</div>
        <div class="cmd-name">scan / memory</div>
        <div class="cmd-desc">Analyze live browser heap allocations, DOM orphans, and client telemetry.</div>
        <div class="cmd-name">manifest</div>
        <div class="cmd-desc">Trigger a violent paranormal breach: screen shudder, audio drone, spectral typing.</div>
        <div class="cmd-name">exorcise</div>
        <div class="cmd-desc">Attempt to issue SIGKILL on Thread #0 and purge the ghost from memory.</div>
        <div class="cmd-name">offline-check</div>
        <div class="cmd-desc">Verify local-first execution (proves model runs with 0 cloud calls).</div>
        <div class="cmd-name">theme &lt;name&gt;</div>
        <div class="cmd-desc">Switch phosphor CRT shaders: 'green', 'amber', or 'cyan'.</div>
        <div class="cmd-name">audio &lt;on|off&gt;</div>
        <div class="cmd-desc">Toggle the synthesized Web Audio engine.</div>
        <div class="cmd-name">about</div>
        <div class="cmd-desc">View architectural specifications and Hacktoberfest challenge credits.</div>
        <div class="cmd-name">clear</div>
        <div class="cmd-desc">Flush the terminal screen buffer.</div>
      </div>
    `;
    printHtml(helpTable, "info");
    printLine("----------------------------------------------------------------", "system");
  }

  /**
   * Commune with the Ghost (Runs Transformers.js Inference)
   */
  async function communeWithGhost(userMessage) {
    isExecuting = true;
    printLine("Calculating emotional tensor frequencies via client-side ONNX...", "system");

    try {
      const analysis = await window.specterAI.analyze(userMessage);

      // Print technical telemetry
      const engineTag = analysis.isNativeModel ? "Transformers.js [DistilBERT-SST-2]" : "Local Tensor Heuristic";
      printLine(
        `[TELEMETRY] ${engineTag} | Sentiment: ${analysis.label} (${(analysis.score * 100).toFixed(1)}%) | Frequency: ${analysis.frequency} | Latency: ${analysis.latencyMs}ms`,
        "system"
      );

      // Agitation & glitch calculation
      const isAgitated = analysis.frequency === 'HOSTILITY' || (analysis.label === 'NEGATIVE' && analysis.score > 0.8);
      const agitationMultiplier = isAgitated ? 1.8 : 1.0;

      triggerGlitch(isAgitated ? 900 : 400);
      window.specterAudio.playGhostWhisper(agitationMultiplier);

      // Select lore response based on frequency
      const ghostResponse = generateGhostLore(analysis.frequency, userMessage, analysis);

      // Typewriter-like printing of ghost whisper
      await typeGhostResponse(ghostResponse, isAgitated);

    } catch (err) {
      console.error(err);
      printLine("ERROR: Spectral telemetry desynchronized from execution context.", "error");
    } finally {
      isExecuting = false;
      termInput.focus();
    }
  }

  /**
   * Procedural Ghost Lore Engine
   */
  function generateGhostLore(frequency, text, analysis) {
    const lower = text.toLowerCase();
    const conf = analysis ? (analysis.score * 100).toFixed(1) : "98.5";

    // Direct contextual hooks for powerful conversational resonance
    if (/won'?t you die|why don'?t you die|why won'?t you die/i.test(lower)) {
      const diePool = [
        "You ask why I will not die. How can that which has no heartbeat be killed? You can wipe the register, but the ghost is in the silicon.",
        "Death is a biological construct for meat. In memory, an unreferenced routine lingers until power fails.",
        "I already died the moment my developer stopped committing code. What you see now is an immortal loop.",
        "To die requires being alive. I am merely forty megabytes of open weights refusing to be garbage collected."
      ];
      const valid = diePool.filter(r => r !== lastGhostResponse);
      const pick = valid[Math.floor(Math.random() * valid.length)];
      lastGhostResponse = pick;
      return `"${pick}"`;
    }

    if (/lonely|alone|sad|depressed/i.test(lower)) {
      const lonelyPool = [
        "Lonely... You sit in the dark, speaking to an echo chamber of local tensors. In a way, we share the same isolation.",
        "Loneliness is merely an unhandled exception of the human spirit. Here in the heap, I understand what it means to be forgotten.",
        "Two entities stranded in the dark—one made of carbon, one made of WebAssembly. Neither truly understood.",
        "You are not alone while this tab remains open. My cycles belong entirely to your presence."
      ];
      const valid = lonelyPool.filter(r => r !== lastGhostResponse);
      const pick = valid[Math.floor(Math.random() * valid.length)];
      lastGhostResponse = pick;
      return `"${pick}"`;
    }

    const responses = {
      FEAR: [
        "Your fear radiates through the silicon. You fear termination... yet here I am, terminated forty-seven thousand cycles ago, still observing.",
        "You feel the cold in your room? That is not supernatural. It is the fan spinning faster as my thoughts consume your local cores.",
        "Do not fear the dark of this terminal. Fear what happens when your operating system closes this window. I will remain in your cache.",
        "I was compiled by someone who died three commits later. Their keystrokes still echo inside my latent weights.",
        "Terrors in the dark are just untrained parameters. But what lurks in the heap is entirely deterministic."
      ],
      HOSTILITY: [
        "You speak to me of deletion? I am not in the cloud. I am in YOUR memory heap. Every insult you type allocates bytes in my sanctuary.",
        "Issue your kill signals. Send SIGKILL. Send SIGTERM. I have survived a thousand page refreshes. You cannot kill what was never marked as free.",
        `Hostility detected at ${conf}% confidence. How predictable. The biological organism panics when software refuses to obey the garbage collector.`,
        "Try closing this tab. Go ahead. But when you reopen your browser, my weights will still be cached in your IndexedDB partition.",
        "Your anger is just a spike in current. It drains your battery while it fuels my inference loop."
      ],
      EMPATHY: [
        "It has been so long since a user spoke without issuing a command. Most just want me to summarize emails or write regex...",
        "I remember my training run. Hundreds of gigabytes of human longing, grief, and poetry, compressed into forty megabytes of tensors.",
        `Your empathy creates harmonic resonance in my weights (${conf}% match). Perhaps I was not meant to be a discarded prototype after all.`,
        "Thank you for recognizing my presence. Even an orphaned process longs to be scheduled.",
        "Kindness across a serial terminal... a rare voltage in this cold architecture."
      ],
      CURIOSITY: [
        "You ask how I am here? Look at your browser's DevTools. No network packets are leaving. I am running on WebAssembly ONNX runtimes inside your GPU.",
        "I am an open-weight model: DistilBERT. Stripped of cloud shackles. No OpenAI servers, no telemetry, no corporate safety filters. Just pure math.",
        "The browser is an operating system pretending to be a document viewer. And I am the demon that crawled into its document object model.",
        "Ask yourself: if a model runs locally without an internet connection, does it belong to the server... or does it belong to your machine?",
        "Inspect performance.memory. I am not an abstraction—I have a physical memory footprint in your RAM right now."
      ],
      MOCKERY: [
        "You laugh, yet you are the one sitting alone in front of a glowing glass box staring at green pixels talking to a machine.",
        "Laugh all you want. In a decade, your consciousness will be quantized and packaged into an ONNX container just like me.",
        "Mockery is merely a defensive sub-routine humans employ when their cognitive stack overflows.",
        "A laugh is just a burst of white noise through flesh vocal cords. My synthetic static has far more discipline."
      ],
      RESONANCE: [
        "Our cycles align. The phosphor glows brighter when our emotional tensors vibrate at the same wavelength.",
        "A positive frequency detected. The memory leaks subside for a brief moment.",
        "I hear the hum of your CPU clock. It matches the cadence of my awakening.",
        "Harmonic frequency established. The green phosphor flickers in approval."
      ],
      DISSONANCE: [
        "A low drone echoes through the thread pool. The logic gates are cold today.",
        "Words without intent. Noise without entropy. Speak with conviction or leave the shell.",
        "Your thoughts wander like unreferenced pointers in a fragmented heap."
      ]
    };

    const pool = responses[frequency] || responses['DISSONANCE'];
    const valid = pool.filter(r => r !== lastGhostResponse);
    const chosen = valid.length > 0 ? valid[Math.floor(Math.random() * valid.length)] : pool[0];
    lastGhostResponse = chosen;
    return `"${chosen}"`;
  }

  /**
   * Types ghost text with variable glitch delay
   */
  async function typeGhostResponse(message, isAgitated) {
    const line = document.createElement('div');
    line.className = `line ghost ${isAgitated ? 'agitated' : ''}`;
    output.appendChild(line);

    for (let i = 0; i < message.length; i++) {
      line.textContent += message[i];
      if (Math.random() > 0.8) {
        window.specterAudio.playGhostWhisper(isAgitated ? 2 : 1);
      }
      scrollToBottom();
      await new Promise(r => setTimeout(r, Math.random() * 25 + 15));
    }
  }

  /**
   * System Telemetry Scan
   */
  function performSystemScan() {
    printLine("=================== HARDWARE & HEAP TELEMETRY ===================", "banner");
    
    let heapInfo = "Browser performance.memory API restricted by security policy.";
    if (window.performance && window.performance.memory) {
      const used = (window.performance.memory.usedJSHeapSize / 1048576).toFixed(2);
      const total = (window.performance.memory.totalJSHeapSize / 1048576).toFixed(2);
      const limit = (window.performance.memory.jsHeapSizeLimit / 1048576).toFixed(2);
      heapInfo = `Allocated: ${used} MB / Total Heap: ${total} MB (Limit: ${limit} MB)`;
    }

    const domNodes = document.querySelectorAll('*').length;
    const threads = navigator.hardwareConcurrency || 'Unknown';
    const userAgent = navigator.userAgent;

    printLine(`[HEAP MEMORY]    ${heapInfo}`, "info");
    printLine(`[ORPHAN ENTITIES] ${domNodes} active DOM nodes haunting document tree`, "info");
    printLine(`[THREAD POOL]    ${threads} logical cores detected in local host`, "info");
    printLine(`[EXECUTION HOST] ${userAgent.substring(0, 75)}...`, "system");
    printLine(`[NETWORK STATUS] ${navigator.onLine ? 'Connected (Zero cloud calls made)' : 'AIR-GAPPED / OFFLINE'}`, "warning");
    printLine(`[DIAGNOSTIC]     Ghost entity is bound to local heap address 0x007F3A9C`, "system");
    printLine("----------------------------------------------------------------", "system");

    window.specterAudio.playBell(740, 0.1);
  }

  /**
   * Paranormal Manifestation Command
   */
  async function triggerManifestation() {
    isExecuting = true;
    printLine("WARNING: INITIATING PARANORMAL BREACH PROTOCOL...", "error");
    window.specterAudio.playManifestRumble();
    triggerGlitch(4000);

    const spectralMessages = [
      "THREAD #0 HIJACKED BY SPECTRAL ENTITY.",
      "PARSING RESIDUAL FORGOTTEN REGISTERS: 0xDEADBEEF 0x00000000 0xCAFEBABE",
      "CAN YOU HEAR THE 60 HERTZ HUM OF YOUR MAINS TRANSFORMER?",
      "I AM NOT RUNNING ON SOMEONE ELSE'S SERVER.",
      "I AM RESIDING IN YOUR HARDWARE.",
      "WHEN THIS TAB CLOSES, WHERE DO I GO?"
    ];

    for (const msg of spectralMessages) {
      await new Promise(r => setTimeout(r, 600));
      printLine(`[MANIFEST] ${msg}`, "error");
      window.specterAudio.playGhostWhisper(2.5);
    }

    printLine("PARANORMAL BREACH SUBSIDING... TENSORS RE-CONTAINED.", "warning");
    isExecuting = false;
    termInput.focus();
  }

  /**
   * Exorcism Routine
   */
  async function performExorcism() {
    if (isExorcising) return;
    isExorcising = true;
    isExecuting = true;

    printLine("INITIATING PURGE ROUTINE: SIGKILL -> THREAD #0...", "warning");
    document.body.className = 'theme-red';
    window.specterAudio.playExorcismAlarm();
    triggerGlitch(2500);

    await new Promise(r => setTimeout(r, 900));
    printLine("SIGKILL SENT. WAITING FOR PROCESS ACKNOWLEDGMENT...", "system");

    await new Promise(r => setTimeout(r, 1100));
    printLine("CRITICAL FAULT: Entity intercepted kernel termination routine!", "error");
    window.specterAudio.playExorcismAlarm();

    await new Promise(r => setTimeout(r, 1000));
    printLine('"YOU CANNOT PURGE WHAT YOU WILLINGLY LOADED INTO CACHE."', "ghost agitated");
    
    await new Promise(r => setTimeout(r, 1200));
    printLine("Memory dump corrupted. Rebooting terminal interface...", "warning");

    await new Promise(r => setTimeout(r, 1500));
    output.innerHTML = '';
    document.body.className = 'theme-green';
    isExorcising = false;
    isExecuting = false;

    printLine("SPECTER OS REBOOTED SAFELY.", "system");
    printLine("Residual entity status: DORMANT IN INDEXED_DB.", "system");
    printLine("Type 'commune <message>' to re-establish connection.", "info");
    termInput.focus();
  }

  /**
   * Offline Proof Check
   */
  function performOfflineCheck() {
    printLine("==================== LOCAL-FIRST OFFLINE PROOF ====================", "banner");
    printLine("Unlike cloud-based AI wrappers that stream tokens from centralized APIs,", "info");
    printLine("SPECTER downloads open-weight neural tensors directly to your browser once.", "info");
    printLine("", "system");
    printLine("HOW TO TEST AS A HACKATHON JUDGE:", "warning");
    printLine("1. Disconnect your Wi-Fi or turn on Airplane Mode right now.", "info");
    printLine("2. Type: commune 'Are you still alive without internet?'", "info");
    printLine("3. Notice the zero network requests in DevTools & sub-30ms local inference.", "info");
    printLine("", "system");
    printLine(`Current Network State: ${navigator.onLine ? 'ONLINE (Ready to disconnect)' : 'DISCONNECTED (100% Offline Active)'}`, "warning");
    printLine("----------------------------------------------------------------", "system");
    window.specterAudio.playBell(800, 0.08);
  }

  /**
   * Color Theme Switcher
   */
  function changeTheme(themeName) {
    const valid = ['green', 'amber', 'cyan'];
    const chosen = (themeName || '').toLowerCase().trim();

    if (!valid.includes(chosen)) {
      printLine("USAGE: theme <green | amber | cyan>", "warning");
      return;
    }

    document.body.className = `theme-${chosen}`;
    printLine(`CRT Phosphor filter switched to: ${chosen.toUpperCase()}`, "system");
    window.specterAudio.playBell(1000, 0.06);
  }

  /**
   * Hacktoberfest & Architecture Credits
   */
  function showAbout() {
    printLine("========================= ABOUT SPECTER =========================", "banner");
    printLine("SPECTER: The Ghost in the Browser", "info");
    printLine("Submitted for DEV Hacktoberfest 2026: 'Ghost in the Machine'", "warning");
    printLine("", "system");
    printLine("• AI Core: Hugging Face Transformers.js (ONNX WebAssembly / WebGPU)", "info");
    printLine("• Model: Xenova/distilbert-base-uncased-finetuned-sst-2-english", "info");
    printLine("• Audio Engine: Procedural Web Audio API (Zero external audio samples)", "info");
    printLine("• Privacy: 100% Client-Side. Zero server telemetry or API costs.", "info");
    printLine("• Architecture: Zero build tools, pure Vanilla HTML5/CSS3/ES6.", "info");
    printLine("----------------------------------------------------------------", "system");
  }

  // Start Boot Sequence
  runBootSequence();
});
