import type { LoopCategory } from '../config/constants'
import { CATEGORY_COLORS } from '../config/constants'
import type { GlyphId } from '../config/loops'
import { GLYPH_MAP } from './GlyphIcons'

interface SoundPropProps {
  category: LoopCategory
  size?: number
  color?: string
  glyph?: GlyphId
}

export default function SoundProp({ category, size = 30, color, glyph }: SoundPropProps) {
  const finalColor = color ?? CATEGORY_COLORS[category]
  const Component = GLYPH_MAP[glyph ?? category]
  return <Component color={finalColor} size={size} />
}
