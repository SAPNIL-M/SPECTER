/**
 * SPECTER Procedural Web Audio Engine
 * Pure synthesized soundscapes via Web Audio API.
 * Zero external MP3/WAV assets, zero latency, 100% offline.
 */

class SpecterAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.humGain = null;
    this.humOsc1 = null;
    this.humOsc2 = null;
  }

  /**
   * Initializes the AudioContext upon user gesture.
   */
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        console.warn('Web Audio API not supported on this platform.');
        return false;
      }
      this.ctx = new AudioCtx();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = false;
    this.startCrtHum();
    return true;
  }

  toggle() {
    if (!this.ctx || this.isMuted) {
      this.init();
      return true;
    } else {
      this.isMuted = true;
      if (this.humGain) {
        this.humGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
      return false;
    }
  }

  /**
   * Continuous, subtle 60Hz CRT power transformer hum.
   */
  startCrtHum() {
    if (this.isMuted || !this.ctx || this.humGain) return;

    try {
      this.humGain = this.ctx.createGain();
      this.humGain.gain.setValueAtTime(0.012, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, this.ctx.currentTime);

      // Fundamental 60Hz (mains hum)
      this.humOsc1 = this.ctx.createOscillator();
      this.humOsc1.type = 'sine';
      this.humOsc1.frequency.setValueAtTime(60, this.ctx.currentTime);

      // Second harmonic 120Hz
      this.humOsc2 = this.ctx.createOscillator();
      this.humOsc2.type = 'sine';
      this.humOsc2.frequency.setValueAtTime(120, this.ctx.currentTime);

      this.humOsc1.connect(filter);
      this.humOsc2.connect(filter);
      filter.connect(this.humGain);
      this.humGain.connect(this.ctx.destination);

      this.humOsc1.start();
      this.humOsc2.start();
    } catch (e) {
      console.warn('Could not start CRT hum:', e);
    }
  }

  /**
   * Mechanical keyboard clack (white noise burst + transient pop).
   */
  playKeyClick() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.018; // 18ms
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200 + Math.random() * 600, now);
      filter.Q.setValueAtTime(3, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
    } catch (e) {}
  }

  /**
   * Vintage computer CRT bell / alert beep.
   */
  playBell(freq = 880, duration = 0.12) {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  /**
   * Spectral static burst when the entity speaks or types.
   */
  playGhostWhisper(agitation = 1) {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const dur = 0.08 + Math.random() * 0.06;
      const bufferSize = Math.floor(this.ctx.sampleRate * dur);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1);
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450 * agitation, now);
      filter.frequency.exponentialRampToValueAtTime(1800 * agitation, now + dur);
      filter.Q.setValueAtTime(6, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.04 * agitation, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
    } catch (e) {}
  }

  /**
   * Low-frequency paranormal drone for the `manifest` command.
   */
  playManifestRumble() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(55, now);
      osc1.frequency.linearRampToValueAtTime(32, now + 3.0);

      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(58.5, now); // Detuned beat frequency
      osc2.frequency.linearRampToValueAtTime(34, now + 3.0);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, now);
      filter.frequency.linearRampToValueAtTime(420, now + 1.5);
      filter.frequency.linearRampToValueAtTime(100, now + 3.2);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 3.5);
      osc2.stop(now + 3.5);
    } catch (e) {}
  }

  /**
   * Exorcism alarm klaxon.
   */
  playExorcismAlarm() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.linearRampToValueAtTime(350, now + 0.4);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {}
  }
}

// Global audio engine instance
window.specterAudio = new SpecterAudioEngine();
