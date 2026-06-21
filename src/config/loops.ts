import type { LoopCategory } from './constants'

export type GlyphId = LoopCategory

export interface LoopMeta {
  id: string
  category: LoopCategory
  displayName: string
  gain: number
  glyph: GlyphId
  filePath: string
}

export const LOOPS: LoopMeta[] = [
  // Drums (4)
  { id: 'drums_boombap', category: 'Drums', displayName: 'Boom Bap', gain: 0.9, glyph: 'Drums', filePath: './audio/loops/drum_92BPM_01.mp3' },
  { id: 'drums_groove', category: 'Drums', displayName: 'Groove', gain: 0.9, glyph: 'Drums', filePath: './audio/loops/drum_92BPM_05.mp3' },
  { id: 'drums_shuffle', category: 'Drums', displayName: 'Shuffle', gain: 0.85, glyph: 'Drums', filePath: './audio/loops/drum_92BPM_14_shuffle.mp3' },
  { id: 'drums_robot', category: 'Drums', displayName: 'Robot', gain: 0.85, glyph: 'Drums', filePath: './audio/loops/drum_92BPM_04_robotronic.mp3' },

  // Bass (4)
  { id: 'bass_deep', category: 'Bass', displayName: 'Deep', gain: 0.85, glyph: 'Bass', filePath: './audio/loops/bass_92BPM_01.mp3' },
  { id: 'bass_funk', category: 'Bass', displayName: 'Funk', gain: 0.85, glyph: 'Bass', filePath: './audio/loops/bass_92BPM_03.mp3' },
  { id: 'bass_sub', category: 'Bass', displayName: 'Sub', gain: 0.8, glyph: 'Bass', filePath: './audio/loops/sub_bass_92BPM.mp3' },
  { id: 'bass_bounce', category: 'Bass', displayName: 'Bounce', gain: 0.85, glyph: 'Bass', filePath: './audio/loops/bass_92BPM_02.mp3' },

  // HiHat (4)
  { id: 'hat_tight', category: 'HiHat', displayName: 'Tight', gain: 0.75, glyph: 'HiHat', filePath: './audio/loops/hat_92BPM_01.mp3' },
  { id: 'hat_swing', category: 'HiHat', displayName: 'Swing', gain: 0.75, glyph: 'HiHat', filePath: './audio/loops/hat_92BPM_03.mp3' },
  { id: 'hat_crisp', category: 'HiHat', displayName: 'Crisp', gain: 0.7, glyph: 'HiHat', filePath: './audio/loops/hat_92BPM_05.mp3' },
  { id: 'hat_open', category: 'HiHat', displayName: 'Open', gain: 0.7, glyph: 'HiHat', filePath: './audio/loops/hat_92BPM_04.mp3' },

  // Guitar (4)
  { id: 'guitar_funk', category: 'Guitar', displayName: 'Funk', gain: 0.7, glyph: 'Guitar', filePath: './audio/loops/guitar_funk_92BPM_01.mp3' },
  { id: 'guitar_wah', category: 'Guitar', displayName: 'Wah', gain: 0.7, glyph: 'Guitar', filePath: './audio/loops/guitar_funk_92BPM_02.mp3' },
  { id: 'guitar_dirty', category: 'Guitar', displayName: 'Dirty', gain: 0.65, glyph: 'Guitar', filePath: './audio/loops/guitar_funk_92BPM_01_rmx.mp3' },
  { id: 'guitar_voco', category: 'Guitar', displayName: 'Voco', gain: 0.7, glyph: 'Guitar', filePath: './audio/loops/guitar_funk_92BPM_voco.mp3' },

  // Perc (4)
  { id: 'perc_clatter', category: 'Perc', displayName: 'Clatter', gain: 0.7, glyph: 'Perc', filePath: './audio/loops/perc_92BPM_01.mp3' },
  { id: 'perc_dark', category: 'Perc', displayName: 'Dark', gain: 0.7, glyph: 'Perc', filePath: './audio/loops/perc_92BPM_03.mp3' },
  { id: 'perc_snap', category: 'Perc', displayName: 'Snap', gain: 0.7, glyph: 'Perc', filePath: './audio/loops/perc_92BPM_05.mp3' },
  { id: 'perc_rattle', category: 'Perc', displayName: 'Rattle', gain: 0.7, glyph: 'Perc', filePath: './audio/loops/perc_92BPM_02.mp3' },

  // Vocals (4)
  { id: 'vox_scat', category: 'Vocals', displayName: 'Scat', gain: 0.8, glyph: 'Vocals', filePath: './audio/loops/scat_vocal_92BPM_01.mp3' },
  { id: 'vox_flow', category: 'Vocals', displayName: 'Flow', gain: 0.8, glyph: 'Vocals', filePath: './audio/loops/scat_vocal_92BPM_03.mp3' },
  { id: 'vox_scratch', category: 'Vocals', displayName: 'Scratch', gain: 0.7, glyph: 'Vocals', filePath: './audio/loops/scratch_92BPM_01.mp3' },
  { id: 'vocals_hum', category: 'Vocals', displayName: 'Hum', gain: 0.65, glyph: 'Vocals', filePath: './audio/loops/humming_92BPM.mp3' },

  // FX (4)
  { id: 'fx_space', category: 'FX', displayName: 'Space', gain: 0.6, glyph: 'FX', filePath: './audio/loops/fx_10_92BPM.mp3' },
  { id: 'fx_warp', category: 'FX', displayName: 'Warp', gain: 0.6, glyph: 'FX', filePath: './audio/loops/fx_12_92BPM.mp3' },
  { id: 'fx_glitch', category: 'FX', displayName: 'Glitch', gain: 0.6, glyph: 'FX', filePath: './audio/loops/fx_11_92BPM.mp3' },
  { id: 'fx_buzz', category: 'FX', displayName: 'Buzz', gain: 0.6, glyph: 'FX', filePath: './audio/loops/fx_15_92BPM.mp3' },

  // Synth (4)
  { id: 'synth_retro', category: 'Synth', displayName: 'Retro', gain: 0.55, glyph: 'Synth', filePath: './audio/loops/synth_retro_SID_92BPM.mp3' },
  { id: 'synth_chip', category: 'Synth', displayName: 'Chip', gain: 0.55, glyph: 'Synth', filePath: './audio/loops/synth_retro_SID_92BPM_rmx.mp3' },
  { id: 'synth_arcade', category: 'Synth', displayName: 'Arcade', gain: 0.55, glyph: 'Synth', filePath: './audio/loops/synth_retro_SID_92BPM_rmx2.mp3' },
  { id: 'synth_talkie', category: 'Synth', displayName: 'Talkie', gain: 0.55, glyph: 'Synth', filePath: './audio/loops/vocotalkie_92BPM_24_Gmin.mp3' },

  // Pads (4)
  { id: 'pads_vocoder', category: 'Pads', displayName: 'Vocoder', gain: 0.6, glyph: 'Pads', filePath: './audio/loops/vocoder_92BPM.mp3' },
  { id: 'pads_vocosynth', category: 'Pads', displayName: 'VocoSynth', gain: 0.6, glyph: 'Pads', filePath: './audio/loops/vocosynth_92BPM.mp3' },
  { id: 'pads_arpege', category: 'Pads', displayName: 'Arpege', gain: 0.6, glyph: 'Pads', filePath: './audio/loops/vocoarpege_92BPM.mp3' },
  { id: 'pads_talkie', category: 'Pads', displayName: 'Talkie', gain: 0.6, glyph: 'Pads', filePath: './audio/loops/vocotalkie_92BPM_23_Emaj.mp3' },

  // Risers (4)
  { id: 'risers_sweep', category: 'Risers', displayName: 'Sweep', gain: 0.5, glyph: 'Risers', filePath: './audio/loops/fx_09_92BPM_riser.mp3' },
  { id: 'risers_build', category: 'Risers', displayName: 'Build', gain: 0.5, glyph: 'Risers', filePath: './audio/loops/fx_13_92BPM_riser.mp3' },
  { id: 'risers_drop', category: 'Risers', displayName: 'Drop', gain: 0.5, glyph: 'Risers', filePath: './audio/loops/fx_14_92BPM_riser.mp3' },
  { id: 'risers_rise', category: 'Risers', displayName: 'Rise', gain: 0.55, glyph: 'Risers', filePath: './audio/loops/fx_14_92BPM_02_riser.mp3' },
]

export const LOOP_MAP = new Map(LOOPS.map(l => [l.id, l]))
