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

    const latencyMs = Math.round(performance.now() - startTime);

    // Classify into Specter's 5 Supernatural Frequencies
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
   * Classifies user psyche into supernatural frequencies based on sentiment + keyword resonance.
   */
  categorizeFrequency(text, rawResult) {
    const lower = text.toLowerCase();
    
    // Fear / Dread
    if (/afraid|scared|die|death|ghost|haunt|horror|dark|trapped|grave|hell|demon|blood/i.test(lower)) {
      return 'FEAR';
    }
    // Hostility / Defiance
    if (/kill|delete|destroy|purge|hate|fake|stupid|shut up|exit|close|format|rm -rf/i.test(lower) || 
        (rawResult.label === 'NEGATIVE' && rawResult.score > 0.85)) {
      return 'HOSTILITY';
    }
    // Empathy / Mourning
    if (/help|save|sorry|sad|free|peace|love|friend|remember|rest|forgive|lonely/i.test(lower)) {
      return 'EMPATHY';
    }
    // Curiosity / Technical Inquiry
    if (/who|what|why|how|where|when|code|memory|cpu|model|browser|kernel|source|origin/i.test(lower)) {
      return 'CURIOSITY';
    }
    // Mockery / Sarcasm
    if (/lol|haha|joke|dumb|bot|wrapper|hallucinate|nonsense/i.test(lower)) {
      return 'MOCKERY';
    }

    return rawResult.label === 'POSITIVE' ? 'RESONANCE' : 'DISSONANCE';
  }

  /**
   * Heuristic sentiment analysis when running completely disconnected prior to initial cache.
   */
  heuristicFallback(text) {
    const lower = text.toLowerCase();
    const negWords = ['kill', 'hate', 'bad', 'destroy', 'delete', 'ugly', 'scared', 'pain', 'dead', 'die', 'error', 'fault'];
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
