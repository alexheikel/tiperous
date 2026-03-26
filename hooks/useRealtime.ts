'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tip } from '@/types'

async function fetchTipsWithProfiles(supabase: any, companyId?: string) {
  let query = supabase.from('tips').select('*').order('created_at', { ascending:false }).limit(30)
  if (companyId) query = query.eq('company_id', companyId)
  const { data: tips } = await query
  if (!tips?.length) return []
  const userIds = [...new Set(tips.map((t: any) => t.user_id))]
  const { data: profiles } = await supabase.from('profiles').select('id, username, full_name, avatar_url').in('id', userIds)
  const profileMap = Object.fromEntries((profiles||[]).map((p: any) => [p.id, p]))
  return tips.map((t: any) => ({ ...t, profile: profileMap[t.user_id] || null }))
}

export function useRealtimeTips(companyId?: string) {
  const supabase = createClient()
  const [tips,    setTips]    = useState<Tip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTipsWithProfiles(supabase, companyId).then(data => {
      setTips(data)
      setLoading(false)
    })

    const filter = companyId ? `company_id=eq.${companyId}` : undefined
    const channel = supabase
      .channel(companyId ? `tips:${companyId}` : 'tips:global')
      .on('postgres_changes',
        { event:'INSERT', schema:'public', table:'tips', ...(filter?{filter}:{}) },
        async (payload: any) => {
          const { data: profile } = await supabase.from('profiles').select('id, username, full_name, avatar_url').eq('id', payload.new.user_id).single()
          setTips(prev => [{ ...payload.new, profile }, ...prev])
        }
      )
      .on('postgres_changes',
        { event:'DELETE', schema:'public', table:'tips', ...(filter?{filter}:{}) },
        (payload: any) => setTips(prev => prev.filter(t => t.id !== payload.old.id))
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [companyId])

  return { tips, loading }
}

export function useRealtimeCompany(companyId: string) {
  const supabase = createClient()
  const [company, setCompany] = useState<any>(null)

  useEffect(() => {
    supabase.from('companies').select('*').eq('id', companyId).single()
      .then(({ data }) => setCompany(data))

    const channel = supabase
      .channel(`company:${companyId}`)
      .on('postgres_changes',
        { event:'UPDATE', schema:'public', table:'companies', filter:`id=eq.${companyId}` },
        (payload: any) => setCompany(payload.new)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [companyId])

  return company
}
