import { useState, useEffect, lazy, Suspense } from 'react'
import { DndContext, DragOverlay, type DragStartEvent, type DragEndEvent } from '@dnd-kit/core'
import { useStore } from '../store/useStore'
import { LOOP_MAP } from '../config/loops'
import { CATEGORY_COLORS } from '../config/constants'
import HeaderBar from './HeaderBar'
import Stage from './Stage'
import SoundPalette from './SoundPalette'
import SoundProp from './SoundProp'
import CursorParticles from './CursorParticles'
import Equalizer from './Equalizer'

// ponytail: hash routing, no router lib
const LabPage = lazy(() => import('./lab/LabPage'))

function useHash() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

function MainApp() {
  const assignLoop = useStore(s => s.assignLoop)
  const transport = useStore(s => s.transport)
  const playStartTime = useStore(s => s.playStartTime)
  const autoStopped = useStore(s => s.autoStopped)
  const stopMusic = useStore(s => s.stop)
  const dismissAutoStop = useStore(s => s.dismissAutoStop)
  const [activeId, setActiveId] = useState<string | null>(null)

  // Apply shared mix from URL on mount
  useEffect(() => {
    const hash = window.location.hash
    const match = hash.match(/[?&]s=([^&]+)/) || window.location.search.match(/[?&]s=([^&]+)/)
    if (!match) return
    const shareString = decodeURIComponent(match[1])
    const { initAudio, applyShareState, play } = useStore.getState()
    initAudio().then(() => {
      applyShareState(shareString)
      play()
    })
    history.replaceState(null, '', window.location.pathname)
  }, [])

  useEffect(() => {
    if (transport !== 'playing' || !playStartTime) return
    const FOUR_HOURS = 4 * 60 * 60 * 1000
    const elapsed = Date.now() - playStartTime
    const remaining = FOUR_HOURS - elapsed
    if (remaining <= 0) {
      stopMusic()
      useStore.setState({ autoStopped: true })
      return
    }
    const timer = setTimeout(() => {
      stopMusic()
      useStore.setState({ autoStopped: true })
    }, remaining)
    return () => clearTimeout(timer)
  }, [transport, playStartTime, stopMusic])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over) return
    const overId = String(over.id)
    if (!overId.startsWith('char-')) return
    const charId = parseInt(overId.replace('char-', ''), 10)
    assignLoop(charId, String(active.id))
  }

  const activeMeta = activeId ? LOOP_MAP.get(activeId) : null

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Equalizer />
      <CursorParticles />
      <div className="app">
        <HeaderBar />
        {transport === 'playing' && (
          <div style={{
            textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)',
            marginTop: -16, marginBottom: -8, letterSpacing: '0.05em',
          }}>
            Auto-stops after 4 hrs
          </div>
        )}
        <SoundPalette position="top" />
        <Stage />
        <SoundPalette position="bottom" />
        <div className="credit-line">
          Beats by <a href="https://romogroove.com" target="_blank" rel="noopener noreferrer">Romo Groove</a>
        </div>
      </div>
      {autoStopped && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 14, padding: '12px 20px', zIndex: 100,
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          fontFamily: "'Nunito', sans-serif", fontSize: '0.85rem',
          color: 'var(--text)',
        }}>
          <span>Music auto-stopped after 4 hours. Hit play to continue.</span>
          <button onClick={dismissAutoStop} style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1,
          }}>&#10005;</button>
        </div>
      )}
      <DragOverlay dropAnimation={null}>
        {activeMeta && (
          <div
            className="drag-overlay-tile"
            style={{
              background: CATEGORY_COLORS[activeMeta.category],
              boxShadow: `0 12px 30px ${CATEGORY_COLORS[activeMeta.category]}55`,
            }}
          >
            <SoundProp category={activeMeta.category} size={30} color="#fff" />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

export default function App() {
  const hash = useHash()

  if (hash === '#/lab') {
    return (
      <Suspense fallback={<div style={{ color: 'var(--text)', padding: 40 }}>Loading Lab...</div>}>
        <LabPage />
      </Suspense>
    )
  }

  return <MainApp />
}
