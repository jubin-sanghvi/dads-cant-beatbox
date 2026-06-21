import {
  BAR_DURATION,
  CHARACTER_COUNT,
  LOOP_DURATION,
  SAMPLE_RATE,
} from '../config/constants'
import { LOOPS, LOOP_MAP } from '../config/loops'
import { audioBufferToWav } from './exportWav'
import type { Character } from '../store/useStore'

// ============================================================================
// AudioEngine
//
// Per-character path:  BufferSource(loop) -> loopGain -> charGain -> panner -> master bus
//
// Master bus:
//   characters -> masterGain --+--> saturation (WaveShaper tanh)
//                              |        -> compressor (glue) -> limiter -> analyser -> dest
//                              +--> reverbSend -> convolver -> reverbReturn -> compressor
// ============================================================================

export class AudioEngine {
  private ctx: AudioContext | null = null
  private buffers = new Map<string, AudioBuffer>()

  // per-character chain nodes
  private charGains: GainNode[] = []
  private charPanners: StereoPannerNode[] = []

  // master bus nodes
  private masterGain: GainNode | null = null
  private saturator: WaveShaperNode | null = null
  private compressor: DynamicsCompressorNode | null = null
  private limiter: DynamicsCompressorNode | null = null
  private analyser: AnalyserNode | null = null
  private reverbSend: GainNode | null = null
  private convolver: ConvolverNode | null = null
  private reverbReturn: GainNode | null = null

  private playing = false
  private transportStartTime = 0
  private activeSources = new Map<number, AudioBufferSourceNode>()

  // -------------------------------------------------------------------------

  async init(): Promise<void> {
    const ctx = new AudioContext({ sampleRate: SAMPLE_RATE })
    this.ctx = ctx

    this.buildMasterBus(ctx)

    // per-character chains
    this.charGains = []
    this.charPanners = []
    for (let i = 0; i < CHARACTER_COUNT; i++) {
      const g = ctx.createGain()
      g.gain.value = 1
      const p = ctx.createStereoPanner()
      p.pan.value =
        CHARACTER_COUNT > 1 ? (i / (CHARACTER_COUNT - 1)) * 1.4 - 0.7 : 0
      g.connect(p)
      p.connect(this.masterGain!)
      this.charGains.push(g)
      this.charPanners.push(p)
    }

    await this.loadAllBuffers(ctx)
  }

  private buildMasterBus(ctx: BaseAudioContext) {
    this.masterGain = ctx.createGain()
    this.masterGain.gain.value = 0.85

    this.saturator = ctx.createWaveShaper()
    this.saturator.curve = makeTanhCurve(2.2)
    this.saturator.oversample = '2x'

    this.compressor = ctx.createDynamicsCompressor()
    this.compressor.threshold.value = -18
    this.compressor.knee.value = 12
    this.compressor.ratio.value = 3
    this.compressor.attack.value = 0.005
    this.compressor.release.value = 0.12

    this.limiter = ctx.createDynamicsCompressor()
    this.limiter.threshold.value = -2
    this.limiter.knee.value = 0
    this.limiter.ratio.value = 20
    this.limiter.attack.value = 0.001
    this.limiter.release.value = 0.05

    this.analyser = ctx.createAnalyser()
    this.analyser.fftSize = 2048
    this.analyser.smoothingTimeConstant = 0.8

    // main chain
    this.masterGain.connect(this.saturator)
    this.saturator.connect(this.compressor)
    this.compressor.connect(this.limiter)
    this.limiter.connect(this.analyser)
    this.analyser.connect(ctx.destination)

    // parallel reverb send (off master, pre-limiter), mixed back in lightly
    this.reverbSend = ctx.createGain()
    this.reverbSend.gain.value = 0.18
    this.convolver = ctx.createConvolver()
    this.convolver.buffer = makeImpulseResponse(ctx, 1.2)
    this.reverbReturn = ctx.createGain()
    this.reverbReturn.gain.value = 1

    this.masterGain.connect(this.reverbSend)
    this.reverbSend.connect(this.convolver)
    this.convolver.connect(this.reverbReturn)
    this.reverbReturn.connect(this.compressor)
  }

  private async loadAllBuffers(ctx: BaseAudioContext) {
    this.buffers.clear()
    for (const loop of LOOPS) {
      const res = await fetch(loop.filePath)
      const arr = await res.arrayBuffer()
      const decoded = await ctx.decodeAudioData(arr)
      this.buffers.set(loop.id, decoded)
    }
  }

  private ensureCtx() {
    if (!this.ctx) throw new Error('AudioEngine not initialized')
    return this.ctx
  }

  async resume() {
    const ctx = this.ensureCtx()
    if (ctx.state === 'suspended') await ctx.resume()
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser
  }

  // -------------------------------------------------------------------------

  private getNextBarTime(): number {
    const ctx = this.ensureCtx()
    const now = ctx.currentTime
    if (!this.playing) return now + 0.05
    const elapsed = now - this.transportStartTime
    const barsPassed = Math.max(0, Math.floor(elapsed / BAR_DURATION))
    return this.transportStartTime + (barsPassed + 1) * BAR_DURATION
  }

  start(characters: Character[]) {
    if (this.playing) return
    const ctx = this.ensureCtx()
    this.playing = true
    this.transportStartTime = ctx.currentTime + 0.08

    for (const ch of characters) {
      if (ch.loopId && !ch.muted) {
        this.startSource(ctx, ch.id, ch.loopId, this.transportStartTime)
      }
    }
    this.updateGains(characters)
  }

  stop() {
    this.playing = false
    for (const [id, src] of this.activeSources) {
      try { src.stop() } catch { /* already stopped */ }
      this.activeSources.delete(id)
    }
  }

  private startSource(
    ctx: BaseAudioContext,
    charId: number,
    loopId: string,
    startTime: number,
    targetGain?: GainNode,
  ) {
    const buf = this.buffers.get(loopId)
    const dest = targetGain ?? this.charGains[charId]
    if (!buf || !dest) return

    const meta = LOOP_MAP.get(loopId)
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.loop = true
    src.loopStart = 0
    src.loopEnd = LOOP_DURATION

    const loopGain = ctx.createGain()
    loopGain.gain.value = meta?.gain ?? 0.7
    src.connect(loopGain)
    loopGain.connect(dest)

    src.start(startTime)
    src.onended = () => {
      if (this.activeSources.get(charId) === src) {
        this.activeSources.delete(charId)
      }
    }
    this.activeSources.set(charId, src)
    return src
  }

  private stopSource(charId: number, stopTime: number) {
    const src = this.activeSources.get(charId)
    if (src) {
      try { src.stop(stopTime) } catch { /* ok */ }
      this.activeSources.delete(charId)
    }
  }

  updateCharacter(charId: number, ch: Character) {
    if (!this.playing) return

    const ctx = this.ensureCtx()
    const nextBar = this.getNextBarTime()
    if (this.activeSources.get(charId)) {
      this.stopSource(charId, nextBar)
    }
    if (ch.loopId && !ch.muted) {
      this.startSource(ctx, charId, ch.loopId, nextBar)
    }
  }

  updateGains(characters: Character[]) {
    const anySolo = characters.some(c => c.solo)
    for (let i = 0; i < CHARACTER_COUNT; i++) {
      const c = characters[i]
      if (!c || !this.charGains[i]) continue
      const audible = !c.muted && (!anySolo || c.solo)
      this.charGains[i].gain.value = audible ? 1 : 0
    }
  }

  // -------------------------------------------------------------------------
  // Offline export
  // -------------------------------------------------------------------------

  async exportMix(characters: Character[], durationSec: number): Promise<Blob> {
    const sampleRate = SAMPLE_RATE
    const offlineCtx = new OfflineAudioContext(2, sampleRate * durationSec, sampleRate)

    // Build master bus into offline context
    const prevMasterGain = this.masterGain
    const prevSaturator = this.saturator
    const prevCompressor = this.compressor
    const prevLimiter = this.limiter
    const prevAnalyser = this.analyser
    const prevReverbSend = this.reverbSend
    const prevConvolver = this.convolver
    const prevReverbReturn = this.reverbReturn

    this.buildMasterBus(offlineCtx)

    // Per-character chains in the offline context
    const offlineCharGains: GainNode[] = []
    for (let i = 0; i < CHARACTER_COUNT; i++) {
      const g = offlineCtx.createGain()
      g.gain.value = 1
      const p = offlineCtx.createStereoPanner()
      p.pan.value =
        CHARACTER_COUNT > 1 ? (i / (CHARACTER_COUNT - 1)) * 1.4 - 0.7 : 0
      g.connect(p)
      p.connect(this.masterGain!)
      offlineCharGains.push(g)
    }

    // Apply solo/mute logic
    const anySolo = characters.some(c => c.solo)
    for (let i = 0; i < CHARACTER_COUNT; i++) {
      const c = characters[i]
      if (!c || !offlineCharGains[i]) continue
      const audible = !c.muted && (!anySolo || c.solo)
      offlineCharGains[i].gain.value = audible ? 1 : 0
    }

    // Start looping sources for each active character
    for (const ch of characters) {
      if (!ch.loopId || ch.muted) continue
      const buf = this.buffers.get(ch.loopId)
      if (!buf) continue

      const meta = LOOP_MAP.get(ch.loopId)
      const src = offlineCtx.createBufferSource()
      src.buffer = buf
      src.loop = true
      src.loopStart = 0
      src.loopEnd = LOOP_DURATION

      const loopGain = offlineCtx.createGain()
      loopGain.gain.value = meta?.gain ?? 0.7
      src.connect(loopGain)
      loopGain.connect(offlineCharGains[ch.id])

      src.start(0)
    }

    const renderedBuffer = await offlineCtx.startRendering()

    // Restore real-time master bus nodes
    this.masterGain = prevMasterGain
    this.saturator = prevSaturator
    this.compressor = prevCompressor
    this.limiter = prevLimiter
    this.analyser = prevAnalyser
    this.reverbSend = prevReverbSend
    this.convolver = prevConvolver
    this.reverbReturn = prevReverbReturn

    return audioBufferToWav(renderedBuffer)
  }

  isPlaying() {
    return this.playing
  }
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function makeTanhCurve(drive: number, n = 1024): Float32Array<ArrayBuffer> {
  const curve = new Float32Array(new ArrayBuffer(n * 4))
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1
    curve[i] = Math.tanh(x * drive) / Math.tanh(drive)
  }
  return curve
}

function makeImpulseResponse(ctx: BaseAudioContext, seconds: number): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * seconds)
  const ir = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = ir.getChannelData(ch)
    for (let i = 0; i < len; i++) {
      const decay = Math.pow(1 - i / len, 2.5)
      data[i] = (Math.random() * 2 - 1) * decay
    }
  }
  return ir
}

export const engine = new AudioEngine()
