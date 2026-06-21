import { useState } from 'react'
import { useStore } from '../store/useStore'
import { LOOPS } from '../config/loops'
import { engine } from '../audio/AudioEngine'
import Logo from './Logo'
import Icon from './Icon'
import ThemeToggle from './ThemeToggle'

export default function HeaderBar() {
  const transport = useStore(s => s.transport)
  const play = useStore(s => s.play)
  const stop = useStore(s => s.stop)
  const clearAll = useStore(s => s.clearAll)
  const downloadMix = useStore(s => s.downloadMix)
  const downloading = useStore(s => s.downloading)
  const initAudio = useStore(s => s.initAudio)
  const hasLoops = useStore(s => s.characters.some(c => c.loopId))
  const assignLoop = useStore(s => s.assignLoop)
  const characters = useStore(s => s.characters)

  const handleShuffle = async () => {
    await initAudio()
    const loopIds = LOOPS.map(l => l.id)
    for (let i = loopIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[loopIds[i], loopIds[j]] = [loopIds[j], loopIds[i]]
    }
    const picks = loopIds.slice(0, characters.length)
    await engine.loadBuffers(picks)
    for (let i = 0; i < picks.length; i++) {
      assignLoop(i, picks[i])
    }
  }

  const [shared, setShared] = useState(false)

  const handleShare = async () => {
    const shareString = useStore.getState().getShareString()
    const url = `${window.location.origin}${window.location.pathname}#/?s=${shareString}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Fallback for non-HTTPS or permission denied
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  const handlePlayStop = async () => {
    await initAudio()
    transport === 'stopped' ? play() : stop()
  }

  return (
    <header className="header-bar">
      <div className="header-left">
        <Logo size={44} />
        <span className="wordmark">Dads Can&apos;t<br/>Beatbox</span>
      </div>
      <div className="header-center">
        <button className={`play-btn ${transport === 'playing' ? 'playing' : ''}`} onClick={handlePlayStop} title={transport === 'stopped' ? 'Play' : 'Stop'}>
          <Icon name={transport === 'stopped' ? 'play' : 'stop'} size={30} />
        </button>
      </div>
      <div className="header-right">
        <button className="header-action" onClick={() => useStore.getState().toggleEqStyle()} title="Switch EQ">
          <Icon name="eq" size={18} />
        </button>
        <button className="header-action" onClick={handleShuffle} title="Shuffle">
          <Icon name="shuffle" size={18} />
        </button>
        <button className="header-action" onClick={clearAll} title="Clear All" disabled={!hasLoops}>
          <Icon name="reset" size={18} />
        </button>
        <button className="header-action" onClick={downloadMix} title="Download 30s Mix" disabled={!hasLoops || downloading}>
          <Icon name={downloading ? 'stop' : 'download'} size={18} />
        </button>
        <div style={{ position: 'relative' }}>
          <button className="header-action" onClick={handleShare} title={shared ? 'Copied!' : 'Share'} disabled={!hasLoops}>
            <Icon name="share" size={18} />
          </button>
          {shared && <span className="copied-label">Copied!</span>}
        </div>
        <ThemeToggle />
        <a href="#/lab" className="header-action" title="Lab" style={{ textDecoration: 'none' }}>
          <Icon name="lab" size={18} />
        </a>
      </div>
    </header>
  )
}
