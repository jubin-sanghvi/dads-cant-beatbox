import { useDroppable } from '@dnd-kit/core'
import { useStore } from '../store/useStore'
import { LOOP_MAP } from '../config/loops'
import { CATEGORY_COLORS } from '../config/constants'
import DadAvatar from './characters/DadAvatar'
import SoundProp from './SoundProp'
import Icon from './Icon'

function CharacterSlot({ id }: { id: number }) {
  const ch = useStore(s => s.characters[id])
  const transport = useStore(s => s.transport)
  const toggleMute = useStore(s => s.toggleMute)
  const toggleSolo = useStore(s => s.toggleSolo)
  const clearLoop = useStore(s => s.clearLoop)
  const { isOver, setNodeRef } = useDroppable({ id: `char-${id}` })

  const meta = ch.loopId ? LOOP_MAP.get(ch.loopId) : null
  const hasLoop = !!meta
  const isPlaying = transport === 'playing'
  const active = isPlaying && hasLoop && !ch.muted
  const accent = meta ? CATEGORY_COLORS[meta.category] : undefined

  return (
    <div
      ref={setNodeRef}
      className={`char-slot ${isOver ? 'char-slot-over' : ''} ${ch.muted ? 'char-muted' : ''} ${hasLoop ? 'has-loop' : ''}`}
    >
      <div
        className="char-svg-wrap"
        style={accent ? {
          boxShadow: `0 0 0 2px ${accent}, 0 0 20px ${accent}40`,
          borderRadius: '50%',
          transition: 'box-shadow 0.4s ease',
        } : undefined}
      >
        <DadAvatar
          index={id}
          active={active}
          category={meta?.category ?? null}
        />
      </div>

      {meta && (
        <div className="char-loop-badge" style={{ background: accent }}>
          <SoundProp category={meta.category} size={14} color="#fff" />
          <span className="char-loop-name">{meta.displayName}</span>
          <button
            className="char-loop-remove"
            onClick={() => clearLoop(id)}
            title="Remove loop"
          >
            <Icon name="remove" size={12} />
          </button>
        </div>
      )}

      <div className="char-controls">
        <button
          className={`char-ctrl ${ch.muted ? 'active' : ''}`}
          onClick={() => toggleMute(id)}
          title={ch.muted ? 'Unmute' : 'Mute'}
        >
          <Icon name={ch.muted ? 'mute' : 'unmute'} size={14} />
        </button>
        <button
          className={`char-ctrl solo ${ch.solo ? 'active' : ''}`}
          onClick={() => toggleSolo(id)}
          title="Solo"
        >
          <Icon name="solo" size={14} />
        </button>
      </div>
    </div>
  )
}

export default function Stage() {
  const characters = useStore(s => s.characters)
  const transport = useStore(s => s.transport)
  const isPlaying = transport === 'playing'
  const hasAny = characters.some(c => c.loopId)

  return (
    <div className={`stage${isPlaying ? ' stage-playing' : ''}`}>
      <div className="stage-inner">
        {characters.map(c => (
          <CharacterSlot key={c.id} id={c.id} />
        ))}
      </div>
      {!hasAny && (
        <div className="stage-hint">Drag a sound onto a dad to start</div>
      )}
    </div>
  )
}
