// Audio Manager - Handles music and sound effects using Web Audio API
export class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private currentOscillators: OscillatorNode[] = [];
  private isMuted: boolean = false;
  private musicEnabled: boolean = true;

  constructor() {
    this.initAudio();
  }

  private initAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create gain nodes for volume control
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.3; // Master volume
      this.masterGain.connect(this.audioContext.destination);

      this.musicGain = this.audioContext.createGain();
      this.musicGain.gain.value = 0.4;
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.audioContext.createGain();
      this.sfxGain.gain.value = 0.5;
      this.sfxGain.connect(this.masterGain);
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  // Resume audio context (required for user interaction)
  public resume() {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Play flap sound
  public playFlap() {
    if (!this.audioContext || this.isMuted) return;
    this.resume();

    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.sfxGain!);

    // Quick "whoosh" sound
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Play score sound (passing through ring)
  public playScore() {
    if (!this.audioContext || this.isMuted) return;
    this.resume();

    const now = this.audioContext.currentTime;
    
    // Play a pleasant ascending arpeggio
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.frequency.value = freq;
      osc.type = 'sine';
      
      const startTime = now + (i * 0.05);
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  }

  // Play collision sound
  public playCollision() {
    if (!this.audioContext || this.isMuted) return;
    this.resume();

    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.sfxGain!);

    // Harsh descending sound
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
    osc.type = 'sawtooth';
    
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Play ambient space music (looping)
  public startAmbientMusic() {
    if (!this.audioContext || this.isMuted || !this.musicEnabled) return;
    this.resume();
    this.stopAmbientMusic();

    const now = this.audioContext.currentTime;
    
    // Create a dreamy space ambient sound
    const createAmbientTone = (freq: number, delay: number) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      const filter = this.audioContext!.createBiquadFilter();

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain!);

      osc.frequency.value = freq;
      osc.type = 'sine';
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.1, now + delay + 2);
      gain.gain.setValueAtTime(0.1, now + delay + 8);
      gain.gain.linearRampToValueAtTime(0, now + delay + 10);

      osc.start(now + delay);
      osc.stop(now + delay + 10);
      
      this.currentOscillators.push(osc);
      
      // Loop
      setTimeout(() => {
        if (this.musicEnabled && !this.isMuted) {
          createAmbientTone(freq, 0);
        }
      }, (delay + 10) * 1000);
    };

    // Create multiple layers of ambient tones
    createAmbientTone(220, 0);    // A3
    createAmbientTone(329.63, 2); // E4
    createAmbientTone(440, 4);    // A4
  }

  // Stop ambient music
  public stopAmbientMusic() {
    this.currentOscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Already stopped
      }
    });
    this.currentOscillators = [];
  }

  // Toggle mute
  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : 0.3;
    }
    if (this.isMuted) {
      this.stopAmbientMusic();
    } else if (this.musicEnabled) {
      this.startAmbientMusic();
    }
    return this.isMuted;
  }

  // Toggle music
  public toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled && !this.isMuted) {
      this.startAmbientMusic();
    } else {
      this.stopAmbientMusic();
    }
    return this.musicEnabled;
  }

  // Cleanup
  public destroy() {
    this.stopAmbientMusic();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}
