// src/utils/AudioEngine.js

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.analyser = null;
    this.source = null;
    this.dataArray = null;

    // 回声系统节点
    this.masterDelay = null;
    this.masterFeedback = null;

    this.pentatonicScale = [
      196.0, 220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33,
      659.25,
    ];
  }

  init() {
    if (this.ctx) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    // 回声系统
    this.masterDelay = this.ctx.createDelay();
    this.masterDelay.delayTime.value = 0.35;

    this.masterFeedback = this.ctx.createGain();
    this.masterFeedback.gain.value = 0.4;

    const delayFilter = this.ctx.createBiquadFilter();
    delayFilter.type = "lowpass";
    delayFilter.frequency.value = 2000;

    this.masterDelay.connect(delayFilter);
    delayFilter.connect(this.masterFeedback);
    this.masterFeedback.connect(this.masterDelay);

    this.masterDelay.connect(this.ctx.destination);
  }

  getFrequencyData() {
    if (!this.analyser) return new Uint8Array(0);
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  // 【修复】智能处理 URL 或 File 对象
  async playTrack(input) {
    this.init();
    if (this.ctx.state === "suspended") await this.ctx.resume();

    if (this.source) {
      this.source.stop();
      this.source.disconnect();
    }

    try {
      let arrayBuffer;

      // 判断 input 是 URL 还是 File 对象
      if (input instanceof File) {
        arrayBuffer = await input.arrayBuffer(); // File 直接转 ArrayBuffer
      } else {
        const response = await fetch(input); // URL 需要 fetch
        arrayBuffer = await response.arrayBuffer();
      }

      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);

      this.source = this.ctx.createBufferSource();
      this.source.buffer = audioBuffer;
      this.source.loop = true;

      this.source.connect(this.analyser);
      this.source.connect(this.ctx.destination);

      this.source.start(0);
      return true; // 加载成功
    } catch (e) {
      console.error("Audio Load Error:", e);
      return false;
    }
  }

  playSynth(xRatio) {
    this.init();
    // 只要有交互，就唤醒 AudioContext
    if (this.ctx.state === "suspended") this.ctx.resume();

    const now = this.ctx.currentTime;
    const noteIndex = Math.floor(xRatio * this.pentatonicScale.length);
    const frequency = this.pentatonicScale[noteIndex] || 440;

    const masterGain = this.ctx.createGain();
    masterGain.connect(this.ctx.destination);
    masterGain.connect(this.masterDelay);

    masterGain.gain.setValueAtTime(0.3, now);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const osc3 = this.ctx.createOscillator();

    osc1.type = "sawtooth";
    osc1.frequency.value = frequency;
    osc2.type = "sawtooth";
    osc2.frequency.value = frequency + 2;
    osc3.type = "square";
    osc3.frequency.value = frequency - 2;

    osc1.connect(masterGain);
    osc2.connect(masterGain);
    osc3.connect(masterGain);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);
    const stopTime = now + 1.0;
    osc1.stop(stopTime);
    osc2.stop(stopTime);
    osc3.stop(stopTime);

    return noteIndex;
  }

  resume() {
    this.ctx?.resume();
  }
  pause() {
    this.ctx?.suspend();
  }
  // 获取当前 Context 状态
  getState() {
    return this.ctx?.state;
  }
}

export const audioEngine = new AudioEngine();
