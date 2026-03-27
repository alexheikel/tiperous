export interface Level {
  level:    number
  name:     string
  emoji:    string
  color:    string
  minScore: number
  desc:     string
}

export const LEVELS: Level[] = [
  { level:1, name:'Curioso',      emoji:'👀', color:'#6e6e7a', minScore:0,   desc:'Apenas empezando a tipear' },
  { level:2, name:'Vecino',       emoji:'🏘️', color:'#7c9ab5', minScore:5,   desc:'Conoce el barrio' },
  { level:3, name:'Conocedor',    emoji:'🎯', color:'#5ba85a', minScore:15,  desc:'Sabe lo que dice' },
  { level:4, name:'Crítico',      emoji:'⚡', color:'#e8b84b', minScore:30,  desc:'Voz influyente' },
  { level:5, name:'Experto',      emoji:'🔥', color:'#e87c34', minScore:60,  desc:'Referente de la comunidad' },
  { level:6, name:'Gurú',         emoji:'💎', color:'#9b59b6', minScore:100, desc:'Fuente de confianza total' },
  { level:7, name:'Leyenda',      emoji:'👑', color:'#e8341c', minScore:200, desc:'Voz legendaria de Tiperous' },
]

export type Vibe = 'optimista' | 'neutro' | 'pesimista'

export function getUserLevel(profile: {
  tips_count?: number | null
  good_tips_count?: number | null
  bad_tips_count?: number | null
  reports_received?: number | null
}): { level: Level; score: number; vibe: Vibe; vibePercent: number } {
  const total   = profile.tips_count      || 0
  const good    = profile.good_tips_count || 0
  const bad     = profile.bad_tips_count  || 0
  const reports = profile.reports_received || 0

  // Score formula:
  // base = total tips * 2
  // bonus = good tips (positive engagement)
  // penalty = reports received * 3
  const score = Math.max(0, (total * 2) + good - (reports * 3))

  const level = [...LEVELS].reverse().find(l => score >= l.minScore) || LEVELS[0]

  // Vibe: balance between good and bad tips
  const vibePercent = total > 0 ? Math.round((good / total) * 100) : 50
  const vibe: Vibe = vibePercent >= 65 ? 'optimista' : vibePercent <= 35 ? 'pesimista' : 'neutro'

  return { level, score, vibe, vibePercent }
}

export const VIBE_CONFIG = {
  optimista: { color:'#1db954', emoji:'😊', label:'Optimista' },
  neutro:    { color:'#e8b84b', emoji:'😐', label:'Neutro'    },
  pesimista: { color:'#e8341c', emoji:'😤', label:'Crítico'   },
}

// Country flags from tips
export const COUNTRY_FLAGS: Record<string, string> = {
  AR:'🇦🇷', PY:'🇵🇾', UY:'🇺🇾', BR:'🇧🇷', CL:'🇨🇱',
  MX:'🇲🇽', CO:'🇨🇴', PE:'🇵🇪', US:'🇺🇸', ES:'🇪🇸',
  GB:'🇬🇧', DE:'🇩🇪', FR:'🇫🇷', IT:'🇮🇹', JP:'🇯🇵',
}
