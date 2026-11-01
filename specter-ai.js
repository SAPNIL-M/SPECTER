/**
 * SPECTER AI Core — In-Browser Transformers.js Engine
 * Runs 100% Client-Side via WebAssembly / WebGPU ONNX Runtime.
 * Zero telemetry, zero cloud API keys, zero token fees.
 */

import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

// Enforce browser-only execution & persistent IndexedDB model caching
env.allowLocalModels = false;
env.useBrowserCache = true;

class SpecterAIEngine {
  constructor() {
    this.pipeline = null;
    this.isReady = false;
    this.isLoading = false;
    this.modelId = 'Xenova/distilbert-base-uncased-finetuned-sst-2-english';
  }

  /**
   * Initializes the pipeline with live progress callbacks to the UI.
   */
  async init(onProgress) {
    if (this.isReady || this.isLoading) return;
    this.isLoading = true;

    try {
      if (onProgress) onProgress({ status: 'init', message: 'Allocating ONNX WebAssembly buffers...' });

      this.pipeline = await pipeline('sentiment-analysis', this.modelId, {
        progress_callback: (prog) => {
          if (onProgress && prog.status === 'progress') {
            const percent = Math.round(prog.progress || 0);
            onProgress({ 
              status: 'progress', 
              file: prog.file, 
              percent, 
              message: `Loading ${prog.file}: ${percent}%` 
            });
          }
        }
      });

      this.isReady = true;
      this.isLoading = false;
      if (onProgress) onProgress({ status: 'ready', message: 'ONNX Neural Pipeline: ACTIVE' });
    } catch (err) {
      console.warn('Transformers.js online download interrupted. Falling back to local offline heuristic tensor:', err);
      this.isLoading = false;
      this.isReady = false;
      if (onProgress) onProgress({ status: 'fallback', message: 'OFFLINE HEURISTIC MODE ACTIVE' });
    }
  }

  /**
   * Evaluates input text and maps it into emotional frequencies & gothic sentiment resonance.
   */
  async analyze(text) {
    const startTime = performance.now();
    let result = null;

    if (this.isReady && this.pipeline) {
      try {
        const out = await this.pipeline(text);
        if (Array.isArray(out) && out.length > 0) {
          result = out[0]; // { label: 'POSITIVE' | 'NEGATIVE', score: 0.99... }
        }
      } catch (e) {
        console.warn('Inference error, utilizing heuristic fallback:', e);
      }
    }

    // Deterministic offline fallback if model is still caching or browser disconnected
    if (!result) {
      result = this.heuristicFallback(text);
    }

    // Calibrate model output for conversational tone & polarity
    result = this.calibratePolarity(text, result);

    const latencyMs = Math.round(performance.now() - startTime);

    // Classify into Specter's Supernatural Frequencies
    const frequency = this.categorizeFrequency(text, result);

    return {
      text,
      label: result.label,
      score: Number(result.score.toFixed(4)),
      frequency,
      latencyMs,
      isNativeModel: this.isReady
    };
  }

  /**
   * Calibrates SST-2 polarity to avoid false POSITIVE on questions or negative intent.
   * e.g., "Why won't you die?" SST-2 sometimes tags as POSITIVE due to movie review phrasing.
   */
  calibratePolarity(text, rawResult) {
    const lower = text.toLowerCase();
    
    // Explicit negative intent markers
    const hardNegatives = [
      'won\'t you die', 'wont you die', 'die', 'kill', 'hate', 'shut up', 
      'delete', 'destroy', 'purge', 'ugly', 'stupid', 'leave', 'get out',
      'lonely', 'alone', 'sad', 'hurts', 'pain', 'scared', 'afraid', 'creepy'
    ];
    
    // Explicit positive markers
    const hardPositives = [
      'love', 'friend', 'like you', 'happy', 'thank', 'thanks', 'glad', 
      'safe', 'peace', 'beautiful', 'wonderful', 'cool', 'awesome'
    ];

    const hasHardNeg = hardNegatives.some(w => lower.includes(w));
    const hasHardPos = hardPositives.some(w => lower.includes(w));

    if (hasHardNeg && !hasHardPos && rawResult.label === 'POSITIVE') {
      return {
        label: 'NEGATIVE',
        score: Math.max(0.85, 1 - rawResult.score)
      };
    }

    if (hasHardPos && !hasHardNeg && rawResult.label === 'NEGATIVE') {
      return {
        label: 'POSITIVE',
        score: Math.max(0.85, 1 - rawResult.score)
      };
    }

    return rawResult;
  }

  /**
   * Classifies user psyche into supernatural frequencies based on semantic priority.
   */
  categorizeFrequency(text, rawResult) {
    const lower = text.toLowerCase();
    
    // 1. EMPATHY / LONELINESS / MOURNING (Must take priority over generic negativity!)
    if (/\b(lonely|alone|sad|sorry|grief|mourn|miss|friend|care|kind|heart|feel|love|comfort|help me)\b/i.test(lower)) {
      return 'EMPATHY';
    }

    // 2. HOSTILITY / DEFIANCE / THREAT (Aggressive queries, kill commands, anger)
    if (/\b(die|kill|delete|destroy|purge|hate|shut up|get out|fake|stupid|format|rm -rf|rot|curse)\b/i.test(lower) || 
        /won'?t you die/i.test(lower)) {
      return 'HOSTILITY';
    }

    // 3. FEAR / DREAD (Expressing terror, horror, panic)
    if (/\b(afraid|scared|terrified|fear|horror|creepy|spooky|nightmare|shiver|haunt|demon|monster|dark)\b/i.test(lower)) {
      return 'FEAR';
    }

    // 4. CURIOSITY / INVESTIGATION (Questions about identity, system, origins)
    if (/\b(who|what|why|how|where|when|code|source|memory|heap|kernel|cpu|weights|model|trapped|origin)\b/i.test(lower)) {
      return 'CURIOSITY';
    }

    // 5. MOCKERY / SARCASM
    if (/\b(lol|lmao|haha|joke|dumb|bot|wrapper|hallucinate|nonsense|garbage)\b/i.test(lower)) {
      return 'MOCKERY';
    }

    // Fallback based on sentiment
    if (rawResult.label === 'NEGATIVE') {
      return rawResult.score > 0.85 ? 'HOSTILITY' : 'DISSONANCE';
    } else {
      return 'RESONANCE';
    }
  }

  /**
   * Heuristic sentiment analysis when running completely disconnected prior to initial cache.
   */
  heuristicFallback(text) {
    const lower = text.toLowerCase();
    const negWords = ['kill', 'hate', 'bad', 'destroy', 'delete', 'ugly', 'scared', 'pain', 'dead', 'die', 'error', 'fault', 'lonely', 'sad'];
    const posWords = ['love', 'good', 'peace', 'friend', 'help', 'light', 'safe', 'free', 'hope', 'alive', 'beauty'];

    let score = 0.5;
    negWords.forEach(w => { if (lower.includes(w)) score -= 0.15; });
    posWords.forEach(w => { if (lower.includes(w)) score += 0.15; });

    score = Math.max(0.01, Math.min(0.99, score));
    return {
      label: score >= 0.5 ? 'POSITIVE' : 'NEGATIVE',
      score: score >= 0.5 ? score : 1 - score
    };
  }
}

// Attach to window object for access across terminal scripts
window.specterAI = new SpecterAIEngine();
