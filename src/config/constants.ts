export const BPM = 92
export const BEATS_PER_BAR = 4
export const BARS_PER_LOOP = 4
export const CHARACTER_COUNT = 7
export const SAMPLE_RATE = 44100

export const BEAT_DURATION = 60 / BPM
export const BAR_DURATION = BEAT_DURATION * BEATS_PER_BAR
export const LOOP_DURATION = BAR_DURATION * BARS_PER_LOOP

export type LoopCategory =
  | 'Drums'
  | 'Bass'
  | 'HiHat'
  | 'Guitar'
  | 'Perc'
  | 'Vocals'
  | 'FX'
  | 'Synth'
  | 'Pads'
  | 'Risers'

export const CATEGORY_COLORS: Record<LoopCategory, string> = {
  Drums: '#e07070',
  Bass: '#6ba3b5',
  HiHat: '#e8b86d',
  Guitar: '#e5a04a',
  Perc: '#e08a6a',
  Vocals: '#5db8a8',
  FX: '#a07ed4',
  Synth: '#c76bbe',
  Pads: '#7b9e6b',
  Risers: '#d4637a',
}

export const CATEGORY_BG: Record<LoopCategory, string> = {
  Drums: 'rgba(224, 112, 112, 0.12)',
  Bass: 'rgba(107, 163, 181, 0.12)',
  HiHat: 'rgba(232, 184, 109, 0.12)',
  Guitar: 'rgba(229, 160, 74, 0.12)',
  Perc: 'rgba(224, 138, 106, 0.12)',
  Vocals: 'rgba(93, 184, 168, 0.12)',
  FX: 'rgba(160, 126, 212, 0.12)',
  Synth: 'rgba(199, 107, 190, 0.12)',
  Pads: 'rgba(123, 158, 107, 0.12)',
  Risers: 'rgba(212, 99, 122, 0.12)',
}

export const CATEGORY_LABELS: Record<LoopCategory, string> = {
  Drums: 'Drums',
  Bass: 'Bass',
  HiHat: 'Hi-Hat',
  Guitar: 'Guitar',
  Perc: 'Perc',
  Vocals: 'Vocals',
  FX: 'FX',
  Synth: 'Synth',
  Pads: 'Pads',
  Risers: 'Risers',
}
