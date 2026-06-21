import { useDraggable } from '@dnd-kit/core'
import { LOOPS, type GlyphId } from '../config/loops'
import { CATEGORY_COLORS, CATEGORY_LABELS, type LoopCategory } from '../config/constants'
import SoundProp from './SoundProp'

function PaletteTile({
  id,
  category,
  displayName,
  glyph,
}: {
  id: string
  category: LoopCategory
  displayName: string
  glyph: GlyphId
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id })
  const color = CATEGORY_COLORS[category]

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="palette-chip"
      style={{
        background: color,
        opacity: isDragging ? 0.35 : 1,
      }}
      title={`${CATEGORY_LABELS[category]}: ${displayName}`}
    >
      <SoundProp category={category} glyph={glyph} size={28} color="#fff" />
      <span className="palette-chip-name">{displayName}</span>
    </div>
  )
}

const topCategories: LoopCategory[] = ['Drums', 'Bass', 'HiHat', 'Guitar', 'Perc']
const bottomCategories: LoopCategory[] = ['Vocals', 'FX', 'Synth', 'Pads', 'Risers']

export default function SoundPalette({ position }: { position?: 'top' | 'bottom' }) {
  const categories = position === 'top' ? topCategories
    : position === 'bottom' ? bottomCategories
    : [...topCategories, ...bottomCategories]

  return (
    <div className="sound-palette">
      {categories.map(cat => {
        const catLoops = LOOPS.filter(l => l.category === cat)
        if (catLoops.length === 0) return null

        return (
          <div key={cat} className="palette-group">
            <div className="palette-group-label" style={{ color: CATEGORY_COLORS[cat] }}>
              {CATEGORY_LABELS[cat]}
            </div>
            <div className="palette-group-chips">
              {catLoops.map(l => (
                <PaletteTile
                  key={l.id}
                  id={l.id}
                  category={l.category}
                  displayName={l.displayName}
                  glyph={l.glyph}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
