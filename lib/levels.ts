export interface Level {
  level:    number
  name:     string
  emoji:    string
  color:    string
  minScore: number
  desc:     string
}

export const LEVELS: Level[] = [
  { level:1, name:'Curioso',   emoji:'👀', color:'#6e6e7a', minScore:0,   desc:'Apenas empezando a tipear' },
  { level:2, name:'Vecino',    emoji:'🏘️', color:'#7c9ab5', minScore:8,   desc:'Conoce el barrio' },
  { level:3, name:'Conocedor', emoji:'🎯', color:'#5ba85a', minScore:20,  desc:'Sabe lo que dice' },
  { level:4, name:'Crítico',   emoji:'⚡', color:'#e8b84b', minScore:45,  desc:'Voz influyente' },
  { level:5, name:'Experto',   emoji:'🔥', color:'#e87c34', minScore:90,  desc:'Referente de la comunidad' },
  { level:6, name:'Gurú',      emoji:'💎', color:'#9b59b6', minScore:150, desc:'Fuente de confianza total' },
  { level:7, name:'Leyenda',   emoji:'👑', color:'#e8341c', minScore:300, desc:'Voz legendaria de Tiperous' },
]

export type Vibe = 'optimista' | 'equilibrado' | 'critico'

export interface UserStats {
  tips_count?:       number | null
  good_tips_count?:  number | null
  bad_tips_count?:   number | null
  reports_received?: number | null
  followers_count?:  number | null
  following_count?:  number | null
}

export function getUserLevel(profile: UserStats): {
  level:       Level
  score:       number
  vibe:        Vibe
  vibePercent: number
  breakdown:   { label:string; value:number; color:string }[]
} {
  const total     = profile.tips_count       || 0
  const good      = profile.good_tips_count  || 0
  const bad       = profile.bad_tips_count   || 0
  const reports   = profile.reports_received || 0
  const followers = profile.followers_count  || 0

  // Score formula with good sense:
  // Each tip = +2 base (engagement matters)
  // Good tips add +1 (positive contribution bonus)
  // Bad tips add +0.5 (still valuable, just critical)
  // Followers = +1 each (community trust)
  // Reports = -5 each (serious penalty, abusers lose level fast)
  // High bad ratio (>70%) = -10 penalty (chronic pessimist tax)
  const badRatioPenalty = total > 5 && bad/total > 0.7 ? -10 : 0
  const baseScore = (total * 2) + (good * 1) + (bad * 0.5) + (followers * 1) - (reports * 5) + badRatioPenalty
  const score = Math.max(0, Math.round(baseScore))

  const level = [...LEVELS].reverse().find(l => score >= l.minScore) || LEVELS[0]

  // Vibe: % of good tips
  const vibePercent = total > 0 ? Math.round((good / total) * 100) : 50
  const vibe: Vibe  = vibePercent >= 60 ? 'optimista' : vibePercent <= 40 ? 'critico' : 'equilibrado'

  const breakdown = [
    { label: `${total} tips`,         value: total * 2,        color:'var(--muted2)' },
    { label: `${good} positivos`,     value: good,             color:'var(--green)'  },
    { label: `${followers} seguid.`,  value: followers,        color:'#7c9ab5'       },
    { label: `${reports} denuncias`,  value: -(reports * 5),   color:'var(--bad)'    },
  ]

  return { level, score, vibe, vibePercent, breakdown }
}

export const VIBE_CONFIG: Record<Vibe, { color:string; emoji:string; label:string; desc:string }> = {
  optimista:   { color:'#1db954', emoji:'😊', label:'Optimista',   desc:'Mayoría de tips positivos' },
  equilibrado: { color:'#e8b84b', emoji:'⚖️', label:'Equilibrado', desc:'Balance entre buenos y críticos' },
  critico:     { color:'#e8341c', emoji:'😤', label:'Crítico',     desc:'Mayoría de tips negativos' },
}

export const COUNTRY_FLAGS: Record<string, string> = {
  AR:'🇦🇷', PY:'🇵🇾', UY:'🇺🇾', BR:'🇧🇷', CL:'🇨🇱',
  MX:'🇲🇽', CO:'🇨🇴', PE:'🇵🇪', US:'🇺🇸', ES:'🇪🇸',
  GB:'🇬🇧', DE:'🇩🇪', FR:'🇫🇷', IT:'🇮🇹', JP:'🇯🇵',
}
