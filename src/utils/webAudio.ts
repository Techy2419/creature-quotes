/**
 * Web Audio API utility for loading and playing audio
 * Provides better control, mixing, and timing than HTML5 Audio API
 */

export class WebAudioManager {
  private audioContext: AudioContext | null = null;
  private activeSources: AudioBufferSourceNode[] = [];
  private masterGain: GainNode | null = null;

  /**
   * Initialize AudioContext (must be called after user interaction)
   */
  init(): AudioContext {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      return this.audioContext;
    }

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create master gain node for overall volume control
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    this.masterGain.gain.value = 1.0;

    return this.audioContext;
  }

  /**
   * Resume AudioContext if suspended (required after user interaction)
   */
  async resume(): Promise<void> {
    if (!this.audioContext) {
      this.init();
    }
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * Load audio from URL and decode to AudioBuffer
   */
  async loadAudio(url: string): Promise<AudioBuffer> {
    if (!this.audioContext) {
      this.init();
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
      return audioBuffer;
    } catch (error) {
      console.error('Failed to load audio:', error);
      throw error;
    }
  }

  /**
   * Play an AudioBuffer at a specific time with volume control
   */
  playBuffer(
    buffer: AudioBuffer,
    options: {
      startTime?: number;
      offset?: number;
      duration?: number;
      volume?: number;
      onEnded?: () => void;
    } = {}
  ): AudioBufferSourceNode {
    if (!this.audioContext) {
      this.init();
    }

    const {
      startTime = this.audioContext!.currentTime,
      offset = 0,
      duration,
      volume = 1.0,
      onEnded,
    } = options;

    const source = this.audioContext!.createBufferSource();
    const gainNode = this.audioContext!.createGain();

    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(this.masterGain!);
    gainNode.gain.value = volume;

    // Calculate end time
    const endTime = duration
      ? startTime + duration
      : startTime + buffer.duration - offset;

    // Handle ended event
    if (onEnded) {
      source.onended = onEnded;
    }

    // Start playback
    source.start(startTime, offset, duration);

    // Track active sources
    this.activeSources.push(source);

    // Clean up when finished
    source.onended = () => {
      const index = this.activeSources.indexOf(source);
      if (index > -1) {
        this.activeSources.splice(index, 1);
      }
      if (onEnded) {
        onEnded();
      }
    };

    return source;
  }

  /**
   * Stop all active audio sources
   */
  stopAll(): void {
    this.activeSources.forEach((source) => {
      try {
        source.stop();
      } catch (e) {
        // Source may already be stopped
      }
    });
    this.activeSources = [];
  }

  /**
   * Get current time in AudioContext
   */
  getCurrentTime(): number {
    if (!this.audioContext) {
      this.init();
    }
    return this.audioContext!.currentTime;
  }

  /**
   * Clean up and close AudioContext
   */
  dispose(): void {
    this.stopAll();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    this.audioContext = null;
    this.masterGain = null;
  }
}

// Singleton instance
let audioManager: WebAudioManager | null = null;

/**
 * Get or create the Web Audio Manager instance
 */
export function getAudioManager(): WebAudioManager {
  if (!audioManager) {
    audioManager = new WebAudioManager();
  }
  return audioManager;
}
