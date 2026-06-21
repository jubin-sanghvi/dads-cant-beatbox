import { create } from 'zustand'
import { CHARACTER_COUNT } from '../config/constants'
import { LOOP_MAP } from '../config/loops'
import { engine } from '../audio/AudioEngine'

export interface Character {
  id: number
  loopId: string | null
  muted: boolean
  solo: boolean
}

interface Store {
  transport: 'stopped' | 'playing'
  characters: Character[]
  initialized: boolean
  downloading: boolean
  playStartTime: number | null
  autoStopped: boolean
  play: () => void
  stop: () => void
  assignLoop: (charId: number, loopId: string) => Promise<void>
  clearLoop: (charId: number) => void
  clearAll: () => void
  toggleMute: (charId: number) => void
  toggleSolo: (charId: number) => void
  eqStyle: number
  toggleEqStyle: () => void
  initAudio: () => Promise<void>
  downloadMix: () => Promise<void>
  dismissAutoStop: () => void
  getShareString: () => string
  applyShareState: (encoded: string) => Promise<void>
}

const makeCharacters = (): Character[] =>
  Array.from({ length: CHARACTER_COUNT }, (_, i) => ({
    id: i,
    loopId: null,
    muted: false,
    solo: false,
  }))

export const useStore = create<Store>((set, get) => ({
  transport: 'stopped',
  characters: makeCharacters(),
  initialized: false,
  downloading: false,
  playStartTime: null,
  autoStopped: false,
  eqStyle: 0,

  toggleEqStyle() {
    set(s => ({ eqStyle: s.eqStyle === 0 ? 1 : 0 }))
  },

  async initAudio() {
    if (get().initialized) return
    await engine.init()
    await engine.resume()
    set({ initialized: true })
  },

  play() {
    engine.resume()
    engine.start(get().characters)
    set({ transport: 'playing', playStartTime: Date.now(), autoStopped: false })
  },

  stop() {
    engine.stop()
    set({ transport: 'stopped', playStartTime: null })
  },

  async assignLoop(charId, loopId) {
    await engine.loadBuffer(loopId)
    set(state => ({
      characters: state.characters.map(c =>
        c.id === charId ? { ...c, loopId } : c,
      ),
    }))
    engine.updateCharacter(charId, get().characters[charId])
    if (get().transport === 'stopped') {
      get().play()
    }
  },

  clearLoop(charId) {
    set(state => ({
      characters: state.characters.map(c =>
        c.id === charId ? { ...c, loopId: null } : c,
      ),
    }))
    engine.updateCharacter(charId, get().characters[charId])
  },

  clearAll() {
    engine.stop()
    set({
      transport: 'stopped',
      characters: makeCharacters(),
    })
  },

  toggleMute(charId) {
    set(state => ({
      characters: state.characters.map(c =>
        c.id === charId ? { ...c, muted: !c.muted } : c,
      ),
    }))
    engine.updateGains(get().characters)
  },

  toggleSolo(charId) {
    set(state => ({
      characters: state.characters.map(c =>
        c.id === charId ? { ...c, solo: !c.solo } : c,
      ),
    }))
    engine.updateGains(get().characters)
  },

  dismissAutoStop() {
    set({ autoStopped: false })
  },

  async downloadMix() {
    const { characters, initialized } = get()
    if (!initialized) return
    const hasLoops = characters.some(c => c.loopId && !c.muted)
    if (!hasLoops) return
    set({ downloading: true })
    try {
      const blob = await engine.exportMix(characters, 30)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'dads-cant-beatbox-mix.wav'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      set({ downloading: false })
    }
  },

  getShareString() {
    return get().characters.map(c => c.loopId || '-').join(',')
  },

  async applyShareState(encoded: string) {
    const parts = encoded.split(',')
    const loopIds = parts.filter(id => id !== '-' && LOOP_MAP.has(id))
    await engine.loadBuffers(loopIds)
    parts.forEach((loopId, i) => {
      if (loopId !== '-' && LOOP_MAP.has(loopId)) {
        get().assignLoop(i, loopId)
      }
    })
  },
}))
