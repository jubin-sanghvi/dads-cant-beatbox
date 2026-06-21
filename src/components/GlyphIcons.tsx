import type { GlyphId } from '../config/loops'
import {
  MusicNote, WaveSine, CircleHalf, Guitar, HandsClapping,
  Microphone, Waveform, WaveSawtooth, CloudFog, TrendUp,
} from '@phosphor-icons/react'

interface GlyphProps { color: string; size: number }

const wrap = (Icon: any) =>
  ({ color, size }: GlyphProps) => <Icon size={size} color={color} weight={size <= 16 ? "regular" : "bold"} />

export const GLYPH_MAP: Record<GlyphId, React.FC<GlyphProps>> = {
  Drums: wrap(MusicNote),
  Bass: wrap(WaveSine),
  HiHat: wrap(CircleHalf),
  Guitar: wrap(Guitar),
  Perc: wrap(HandsClapping),
  Vocals: wrap(Microphone),
  FX: wrap(Waveform),
  Synth: wrap(WaveSawtooth),
  Pads: wrap(CloudFog),
  Risers: wrap(TrendUp),
}
