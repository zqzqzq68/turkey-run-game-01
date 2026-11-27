// audio.js — every sound is synthesized with WebAudio, so the game ships
// no audio files at all. A short plucked bassline loops under the run;
// the effects are little oscillator phrases.
export class SoundBank {
  constructor() {
    this.context = null;
    this.muted = false;
    this.musicTimer = null;
    this.musicStep = 0;
  }

  // Browsers only allow audio after a gesture, so create the context lazily.
  ensure() {
    if (!this.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return false;
      this.context = new AudioContext();
    }
    if (this.context.state === 'suspended') void this.context.resume();
    return true;
  }

  setMuted(muted) {
    this.muted = muted;
    if (muted) this.stopMusic();
    else if (this.context) this.startMusic();
  }

  // One short tone: frequency slides from `from` to `to` over `seconds`.
  tone(from, to, seconds, type, volume, when = 0) {
    if (!this.context || this.muted) return;
    const t0 = this.context.currentTime + when;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + seconds);
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + seconds);
    osc.connect(gain).connect(this.context.destination);
    osc.start(t0);
    osc.stop(t0 + seconds + 0.02);
  }

  click() {
    this.tone(660, 520, 0.06, 'triangle', 0.12);
  }

  jump() {
    this.tone(280, 640, 0.16, 'sine', 0.16);
  }

  slide() {
    this.tone(420, 180, 0.14, 'sawtooth', 0.05);
  }

  pickup() {
    this.tone(880, 880, 0.07, 'triangle', 0.14);
    this.tone(1318, 1318, 0.1, 'triangle', 0.12, 0.06);
  }

  pie() {
    this.tone(523, 523, 0.09, 'triangle', 0.14);
    this.tone(659, 659, 0.09, 'triangle', 0.14, 0.08);
    this.tone(784, 784, 0.14, 'triangle', 0.14, 0.16);
  }

  stumble() {
    this.tone(220, 70, 0.25, 'sawtooth', 0.18);
    this.tone(110, 55, 0.3, 'square', 0.08, 0.05);
  }

  // The turkey's own two-note gobble: a low cluck, then a higher one.
  gobble() {
    this.tone(300, 180, 0.09, 'square', 0.1);
    this.tone(420, 240, 0.09, 'square', 0.1, 0.11);
    this.tone(340, 200, 0.12, 'square', 0.09, 0.22);
  }

  caught() {
    const notes = [392, 370, 349, 311];
    notes.forEach((n, i) => this.tone(n, n * 0.94, 0.22, 'sawtooth', 0.12, i * 0.2));
  }

  escaped() {
    const notes = [523, 659, 784, 1046, 1318];
    notes.forEach((n, i) => this.tone(n, n, 0.18, 'triangle', 0.14, i * 0.11));
  }

  // A lazy bassline in C major, one plucked note per beat, quiet on purpose.
  startMusic() {
    if (!this.context || this.muted || this.musicTimer) return;
    const bass = [130.8, 98.0, 87.3, 98.0, 130.8, 98.0, 146.8, 196.0];
    this.musicTimer = window.setInterval(() => {
      if (this.muted) return;
      const note = bass[this.musicStep % bass.length];
      this.tone(note, note, 0.32, 'triangle', 0.05);
      this.musicStep += 1;
    }, 340);
  }

  stopMusic() {
    if (this.musicTimer) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}
