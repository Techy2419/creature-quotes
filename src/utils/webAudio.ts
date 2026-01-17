/**
 * Web Audio API wrapper - honestly way better than HTML5 Audio for mixing sounds
 * Gives us precise timing control and lets us overlap multiple audio sources without issues
 */

export class WebAudioManager {
  private audioContext: AudioContext | null = null;
  private activeSources: AudioBufferSourceNode[] = [];
  private masterGain: GainNode | null = null;

  /**
   * Sets up the AudioContext - browsers require user interaction first
   * Learned this the hard way when nothing worked on page load, classic browser security thing
   */
  init(): AudioContext {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      return this.audioContext;
    }

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Master volume control - everything goes through this so we can adjust overall volume easily
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    this.masterGain.gain.value = 1.0;

    return this.audioContext;
  }

  /**
   * Resume AudioContext if it got suspended - browsers suspend it automatically for performance
   * Gotta call this after user interaction (like clicking play)
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
   * Fetch audio from URL and decode it into an AudioBuffer
   * AudioBuffer is what we actually work with in Web Audio API - way more flexible than HTML5 Audio
   */
  async loadAudio(url: string): Promise<AudioBuffer> {
    if (!this.audioContext) {
      this.init();
    }

    try {
      const response = await fetch(url);
      
      // Quick check if response is actually audio (just in case)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('audio')) {
        // Not a big deal, but good to know if something's wrong
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
      
      // Validate the decoded buffer - make sure it's actually valid audio
      if (audioBuffer.duration === 0 || isNaN(audioBuffer.duration)) {
        throw new Error('Invalid audio buffer duration');
      }
      
      return audioBuffer;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Play an AudioBuffer with precise timing control
   * Can schedule it to start at a specific time - super useful for syncing multiple sounds
   * Returns both the source and gain node so we can control volume on the fly
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
  ): { source: AudioBufferSourceNode; gainNode: GainNode } {
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

    // Calculate when this sound will end (useful for scheduling other sounds)
    const endTime = duration
      ? startTime + duration
      : startTime + buffer.duration - offset;

    // Set up callback if provided (for cleanup or chaining)
    if (onEnded) {
      source.onended = onEnded;
    }

    // Actually start playing - timing here is sample-accurate which is pretty cool
    source.start(startTime, offset, duration);

    // Track what's playing so we can stop everything if needed
    this.activeSources.push(source);

    // Clean up when the sound finishes playing
    source.onended = () => {
      const index = this.activeSources.indexOf(source);
      if (index > -1) {
        this.activeSources.splice(index, 1);
      }
      if (onEnded) {
        onEnded();
      }
    };

    return { source, gainNode };
  }

  /**
   * Stop everything that's currently playing - useful for cleanup or when user hits pause
   */
  stopAll(): void {
    this.activeSources.forEach((source) => {
      try {
        source.stop();
      } catch (e) {
        // Already stopped, no big deal - happens sometimes
      }
    });
    this.activeSources = [];
  }

  /**
   * Get the current time in the audio context - this is what we use for scheduling sounds
   */
  getCurrentTime(): number {
    if (!this.audioContext) {
      this.init();
    }
    return this.audioContext!.currentTime;
  }

  /**
   * Clean up everything and close the AudioContext
   * Good practice to call this when component unmounts or we're done with audio
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

// Singleton pattern - only one audio manager instance
// Don't want multiple AudioContexts running around, that'd be messy
let audioManager: WebAudioManager | null = null;

/**
 * Get the audio manager instance, creating it if it doesn't exist yet
 * Using singleton pattern so we don't accidentally create multiple AudioContexts
 */
export function getAudioManager(): WebAudioManager {
  if (!audioManager) {
    audioManager = new WebAudioManager();
  }
  return audioManager;
}
