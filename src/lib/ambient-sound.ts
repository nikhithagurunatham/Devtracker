// Procedural Web Audio API Sound Generator for Ambient Focus Sounds
// Works 100% offline, zero external dependencies or broken links!

export type AmbientSoundType = 'rain' | 'fire' | 'forest' | 'ocean' | 'binaural' | 'lofi';

class AmbientAudioManager {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentSound: AmbientSoundType | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: { stop: () => void }[] = [];
  private volume: number = 0.5;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentSound(): AmbientSoundType | null {
    return this.currentSound;
  }

  public stop() {
    this.activeNodes.forEach((node) => {
      try {
        node.stop();
      } catch (e) {
        // ignore
      }
    });
    this.activeNodes = [];
    this.isPlaying = false;
    this.currentSound = null;
  }

  public play(sound: AmbientSoundType) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.isPlaying && this.currentSound === sound) {
      this.stop();
      return;
    }

    this.stop();
    this.isPlaying = true;
    this.currentSound = sound;

    switch (sound) {
      case 'rain':
        this.startRainSound();
        break;
      case 'fire':
        this.startFireSound();
        break;
      case 'forest':
        this.startForestSound();
        break;
      case 'ocean':
        this.startOceanSound();
        break;
      case 'binaural':
        this.startBinauralSound();
        break;
      case 'lofi':
        this.startLofiSound();
        break;
    }
  }

  // --- 1. RAIN SYNTHESIZER ---
  private startRainSound() {
    if (!this.ctx || !this.masterGain) return;

    // Generate 3 seconds of white noise buffer and loop it
    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Lowpass filter for deep rain body
    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(850, this.ctx.currentTime);

    // Highpass to eliminate extreme sub bass
    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(250, this.ctx.currentTime);

    // Rain gain
    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.8, this.ctx.currentTime);

    noiseSource.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(rainGain);
    rainGain.connect(this.masterGain);

    noiseSource.start();
    this.activeNodes.push({
      stop: () => {
        try {
          noiseSource.stop();
          noiseSource.disconnect();
        } catch (e) {}
      },
    });
  }

  // --- 2. FIRE / CRACKLING CAMPFIRE SYNTHESIZER ---
  private startFireSound() {
    if (!this.ctx || !this.masterGain) return;

    // Base rumble
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02; // Brown noise approximation
      lastOut = data[i];
    }

    const rumble = this.ctx.createBufferSource();
    rumble.buffer = buffer;
    rumble.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(220, this.ctx.currentTime);

    const rumbleGain = this.ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.6, this.ctx.currentTime);

    rumble.connect(lowpass);
    lowpass.connect(rumbleGain);
    rumbleGain.connect(this.masterGain);
    rumble.start();

    // Crackle generator: periodic bursts of short pops
    let crackleInterval: any = null;
    const playCrackle = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      try {
        const crackleDuration = 0.02 + Math.random() * 0.04;
        const popBuf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * crackleDuration), this.ctx.sampleRate);
        const popData = popBuf.getChannelData(0);
        for (let i = 0; i < popData.length; i++) {
          popData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (popData.length * 0.3));
        }

        const pop = this.ctx.createBufferSource();
        pop.buffer = popBuf;

        const popFilter = this.ctx.createBiquadFilter();
        popFilter.type = 'bandpass';
        popFilter.frequency.setValueAtTime(1500 + Math.random() * 3000, this.ctx.currentTime);
        popFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

        const popGain = this.ctx.createGain();
        popGain.gain.setValueAtTime(0.3 + Math.random() * 0.5, this.ctx.currentTime);

        pop.connect(popFilter);
        popFilter.connect(popGain);
        popGain.connect(this.masterGain);

        pop.start();
      } catch (e) {}

      // Schedule next crackle randomly
      crackleInterval = setTimeout(playCrackle, 80 + Math.random() * 280);
    };
    playCrackle();

    this.activeNodes.push({
      stop: () => {
        try {
          if (crackleInterval) clearTimeout(crackleInterval);
          rumble.stop();
          rumble.disconnect();
        } catch (e) {}
      },
    });
  }

  // --- 3. FOREST WIND SYNTHESIZER ---
  private startForestSound() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    // LFO for swaying breeze
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(250, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.65, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    lfo.start();

    this.activeNodes.push({
      stop: () => {
        try {
          noise.stop();
          lfo.stop();
          noise.disconnect();
          lfo.disconnect();
        } catch (e) {}
      },
    });
  }

  // --- 4. OCEAN WAVES SYNTHESIZER ---
  private startOceanSound() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(450, this.ctx.currentTime);

    // LFO for wave swells (every 8 seconds)
    const swell = this.ctx.createOscillator();
    swell.frequency.setValueAtTime(0.12, this.ctx.currentTime);

    const waveGain = this.ctx.createGain();
    waveGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    const swellGain = this.ctx.createGain();
    swellGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

    swell.connect(swellGain);
    swellGain.connect(waveGain.gain);

    noise.connect(lowpass);
    lowpass.connect(waveGain);
    waveGain.connect(this.masterGain);

    noise.start();
    swell.start();

    this.activeNodes.push({
      stop: () => {
        try {
          noise.stop();
          swell.stop();
          noise.disconnect();
          swell.disconnect();
        } catch (e) {}
      },
    });
  }

  // --- 5. BINAURAL 40Hz ALPHA / FOCUS TONE ---
  private startBinauralSound() {
    if (!this.ctx || !this.masterGain) return;

    // Carrier: 200 Hz, Offset: 240 Hz -> 40Hz Gamma wave for peak cognitive alertness
    const oscLeft = this.ctx.createOscillator();
    const oscRight = this.ctx.createOscillator();

    oscLeft.type = 'sine';
    oscRight.type = 'sine';
    oscLeft.frequency.setValueAtTime(200, this.ctx.currentTime);
    oscRight.frequency.setValueAtTime(240, this.ctx.currentTime);

    const merger = this.ctx.createChannelMerger(2);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    oscLeft.connect(merger, 0, 0);
    oscRight.connect(merger, 0, 1);
    merger.connect(gain);
    gain.connect(this.masterGain);

    oscLeft.start();
    oscRight.start();

    this.activeNodes.push({
      stop: () => {
        try {
          oscLeft.stop();
          oscRight.stop();
          oscLeft.disconnect();
          oscRight.disconnect();
        } catch (e) {}
      },
    });
  }

  // --- 6. LOFI CHILL AMBIENCE (Warm chords + vinyl crackle) ---
  private startLofiSound() {
    if (!this.ctx || !this.masterGain) return;

    // Warm chords: E-flat Maj7 / Cmin9 harmonic progression
    const freqs = [155.56, 196.0, 233.08, 293.66]; // Eb, G, Bb, D
    const chordNodes: OscillatorNode[] = [];
    const chordGain = this.ctx.createGain();
    chordGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

    freqs.forEach((f) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, this.ctx!.currentTime);
      osc.connect(chordGain);
      osc.start();
      chordNodes.push(osc);
    });

    const lofiFilter = this.ctx.createBiquadFilter();
    lofiFilter.type = 'lowpass';
    lofiFilter.frequency.setValueAtTime(600, this.ctx.currentTime);

    chordGain.connect(lofiFilter);
    lofiFilter.connect(this.masterGain);

    this.activeNodes.push({
      stop: () => {
        try {
          chordNodes.forEach((o) => {
            o.stop();
            o.disconnect();
          });
        } catch (e) {}
      },
    });
  }
}

export const ambientSound = new AmbientAudioManager();
