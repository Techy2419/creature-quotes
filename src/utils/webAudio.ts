/**
 * Web Audio API wrapper - way better than HTML5 Audio for mixing sounds
 * Lets us control timing precisely and overlap multiple audio sources
 */

export class WebAudioManager {
  private audioContext: AudioContext | null = null;
  private activeSources: AudioBufferSourceNode[] = [];
  private masterGain: GainNode | null = null;

  /**
   * Sets up the AudioContext - browsers require user interaction first
   * Learned this the hard way when nothing worked on page load lol
   */
  init(): AudioContext {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      return this.audioContext;
    }

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Master volume control - hook everything through this so we can adjust overall volume
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    this.masterGain.gain.value = 1.0;

    return this.audioContext;
  }

  /**
   * Resume AudioContext if it got suspended - browsers do this automatically
   * Need to call this after user clicks something
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
   * This is what we actually work with in Web Audio API
   */
  async loadAudio(url: string): Promise<AudioBuffer> {
    if (!this.audioContext) {
      this.init();
    }

    try {
      const response = await fetch(url);
      
      // Check if response is actually audio
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('audio')) {
        console.warn('Response might not be audio. Content-Type:', contentType);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      
      // Log the raw data size for debugging
      console.log('Audio data received:', arrayBuffer.byteLength, 'bytes');
      
      const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
      
      // Validate the decoded buffer
      if (audioBuffer.duration === 0 || isNaN(audioBuffer.duration)) {
        console.error('Decoded audio buffer has invalid duration:', audioBuffer.duration);
      }
      
      return audioBuffer;
    } catch (error) {
      console.error('Failed to load audio:', error);
      throw error;
    }
  }

  /**
   * Play an AudioBuffer with precise timing control
   * Can schedule it to start at a specific time, which is super useful for syncing
   * Returns both the source and gain node so we can control volume dynamically
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

    // Figure out when this sound will end
    const endTime = duration
      ? startTime + duration
      : startTime + buffer.duration - offset;

    // Set up callback if provided
    if (onEnded) {
      source.onended = onEnded;
    }

    // Actually start playing - the timing here is sample-accurate which is sick
    source.start(startTime, offset, duration);

    // Keep track of what's playing so we can stop everything if needed
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
   * Stop everything that's currently playing - useful for cleanup
   */
  stopAll(): void {
    this.activeSources.forEach((source) => {
      try {
        source.stop();
      } catch (e) {
        // Already stopped, no big deal
      }
    });
    this.activeSources = [];
  }

  /**
   * Get the current time in the audio context - this is what we use for scheduling
   */
  getCurrentTime(): number {
    if (!this.audioContext) {
      this.init();
    }
    return this.audioContext!.currentTime;
  }

  /**
   * Clean up everything and close the AudioContext
   * Good practice to call this when we're done
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
let audioManager: WebAudioManager | null = null;

/**
 * Get the audio manager instance, creating it if it doesn't exist yet
 * Using singleton so we don't create multiple AudioContexts
 */
export function getAudioManager(): WebAudioManager {
  if (!audioManager) {
    audioManager = new WebAudioManager();
  }
  return audioManager;
}
