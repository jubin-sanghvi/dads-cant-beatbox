import { useMemo } from 'react'
import { createAvatar } from '@dicebear/core'
import { openPeeps } from '@dicebear/collection'
import { CATEGORY_COLORS, type LoopCategory } from '../../config/constants'

interface DadAvatarProps {
  index: number
  active: boolean
  category: LoopCategory | null
}

interface DadProfile {
  head: string
  facialHair: string | null
  skinColor: string
  accessory: string | null
  idleFace: string
  activeFace: string
}

const DADS: DadProfile[] = [
  { head: 'short1',    facialHair: 'full',       skinColor: 'edb98a', accessory: 'glasses2',    idleFace: 'calm',    activeFace: 'cheeky' },
  { head: 'flatTop',   facialHair: 'goatee1',    skinColor: 'd08b5b', accessory: null,          idleFace: 'serious', activeFace: 'smileLOL' },
  { head: 'noHair1',    facialHair: 'full2',       skinColor: '614335', accessory: 'glasses',     idleFace: 'smile',   activeFace: 'concernedFear' },
  { head: 'turban',    facialHair: 'moustache7', skinColor: 'ae5d29', accessory: null,          idleFace: 'tired',    activeFace: 'lovingGrin2' },
  { head: 'hatBeanie', facialHair: null,       skinColor: 'edb98a', accessory: null,          idleFace: 'blank',   activeFace: 'smileBig' },
  { head: 'afro',      facialHair: 'goatee2',    skinColor: '694d3d', accessory: 'sunglasses',  idleFace: 'calm',    activeFace: 'explaining' },
  { head: 'short5',    facialHair: 'full3',       skinColor: '8d5524', accessory: null,          idleFace: 'suspicious',   activeFace: 'fear' },
]

function buildAvatar(
  index: number,
  active: boolean,
  category: LoopCategory | null,
): string {
  const dad = DADS[index % DADS.length]
  const face = active ? dad.activeFace : dad.idleFace

  const clothingColor =
    category !== null
      ? CATEGORY_COLORS[category].replace('#', '')
      : '94a3b8'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- DiceBear's strict literal unions vs our string config
  const opts: Record<string, any> = {
    seed: `dad-${index}`,
    head: [dad.head],
    ...(dad.facialHair
      ? { facialHair: [dad.facialHair], facialHairProbability: 100 }
      : { facialHairProbability: 0 }),
    face: [face],
    skinColor: [dad.skinColor],
    clothingColor: [clothingColor],
  }
  if (dad.accessory) {
    opts.accessories = [dad.accessory]
    opts.accessoriesProbability = 100
  } else {
    opts.accessoriesProbability = 0
  }
  return createAvatar(openPeeps, opts).toString()
}

export default function DadAvatar({ index, active, category }: DadAvatarProps) {
  const svg = useMemo(
    () => buildAvatar(index, active, category),
    [index, active, category],
  )

  const stateClass = category === null ? 'dad-empty' : 'dad-assigned'
  const className = `dad-avatar ${stateClass}${active ? ' dad-active' : ''}`

  return (
    <div
      className={className}
      style={{ width: '100%' }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
