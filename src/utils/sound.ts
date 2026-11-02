// Web Audio API ambient sound generator (zero external assets needed)

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private activeNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;
  private currentType: 'rain' | 'binaural' | 'whitenoise' | 'brownnoise' | 'bell' | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public play(type: 'rain' | 'binaural' | 'whitenoise' | 'brownnoise') {
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.08, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    if (type === 'whitenoise' || type === 'brownnoise') {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'brownnoise') {
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5; // gain boost for brown noise
        } else {
          data[i] = white * 0.3;
        }
      }

      const noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = buffer;
      noiseNode.loop = true;
      noiseNode.connect(this.gainNode);
      noiseNode.start();
      this.activeNode = noiseNode;
    } else if (type === 'binaural') {
      // 200 Hz carrier left, 210 Hz right -> 10 Hz Alpha Wave for Focus
      const oscLeft = this.ctx.createOscillator();
      const oscRight = this.ctx.createOscillator();
      const merger = this.ctx.createChannelMerger(2);

      oscLeft.frequency.value = 200;
      oscRight.frequency.value = 210;

      oscLeft.connect(merger, 0, 0);
      oscRight.connect(merger, 0, 1);
      merger.connect(this.gainNode);

      oscLeft.start();
      oscRight.start();

      this.activeNode = merger;
    } else if (type === 'rain') {
      // Pink noise + low pass filter modulated
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.2;
      }

      const rainNode = this.ctx.createBufferSource();
      rainNode.buffer = buffer;
      rainNode.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);

      rainNode.connect(filter);
      filter.connect(this.gainNode);
      rainNode.start();
      this.activeNode = rainNode;
    }

    this.isPlaying = true;
    this.currentType = type;
  }

  public playChime() {
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 1.3);
  }

  public stop() {
    if (this.activeNode) {
      try {
        if ('stop' in this.activeNode && typeof (this.activeNode as any).stop === 'function') {
          (this.activeNode as any).stop();
        }
        this.activeNode.disconnect();
      } catch {}
      this.activeNode = null;
    }
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch {}
      this.gainNode = null;
    }
    this.isPlaying = false;
    this.currentType = null;
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      currentType: this.currentType,
    };
  }
}

export const ambientSound = new AmbientSoundEngine();
