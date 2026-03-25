// ============================================================
//  hooks/useRealtime.ts — Live tips via Supabase Realtime
// ============================================================
'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tip } from '@/types'

export function useRealtimeTips(companyId?: string) {
  const supabase = createClient()
  const [tips,    setTips]    = useState<Tip[]>([])
  const [loading, setLoading] = useState(true)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    // Initial fetch
    const query = supabase
      .from('tips')
      .select('*, profile:profiles(id, username, full_name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(30)

    if (companyId) {
      query.eq('company_id', companyId)
    }

    query.then(({ data }) => {
      setTips(data || [])
      setLoading(false)
    })

    // Realtime channel
    const filter = companyId
      ? `company_id=eq.${companyId}`
      : undefined

    const channel = supabase
      .channel(companyId ? `tips:${companyId}` : 'tips:global')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tips', ...(filter ? { filter } : {}) },
        async (payload) => {
          // Fetch full tip with profile
          const { data: tip } = await supabase
            .from('tips')
            .select('*, profile:profiles(id, username, full_name, avatar_url)')
            .eq('id', payload.new.id)
            .single()
          if (tip) setTips(prev => [tip, ...prev])
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'tips', ...(filter ? { filter } : {}) },
        (payload) => {
          setTips(prev => prev.filter(t => t.id !== payload.old.id))
        }
      )
      .subscribe()

    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [companyId])

  return { tips, loading }
}

// ─── Hook: live company scores ────────────────────────────────
export function useRealtimeCompany(companyId: string) {
  const supabase = createClient()
  const [company, setCompany] = useState<any>(null)

  useEffect(() => {
    supabase.from('companies').select('*').eq('id', companyId).single()
      .then(({ data }) => setCompany(data))

    const channel = supabase
      .channel(`company:${companyId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'companies', filter: `id=eq.${companyId}` },
        (payload) => setCompany(payload.new)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [companyId])

  return company
}
