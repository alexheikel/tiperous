import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PublicProfileClient from '@/components/profile/PublicProfileClient'

export async function generateMetadata({ params }: { params: { username: string } }) {
  const supabase = createClient()
  const { data } = await supabase.from('profiles').select('full_name,username').eq('username', params.username).single()
  if (!data) return { title: 'Usuario no encontrado' }
  return { title: `${data.full_name||data.username} — Tiperous` }
}

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const supabase = createClient()
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('username', params.username).single()
  if (!profile) notFound()

  const { data: tips } = await supabase
    .from('tips').select('*, company:companies(name,slug)')
    .eq('user_id', profile.id)
    .order('created_at', { ascending:false }).limit(20)

  const { data: { user } } = await supabase.auth.getUser()
  let isFollowing = false
  if (user) {
    const { data: follow } = await supabase.from('follows')
      .select('follower_id').eq('follower_id', user.id).eq('following_id', profile.id).single()
    isFollowing = !!follow
  }

  return <PublicProfileClient profile={profile} tips={tips||[]} isFollowing={isFollowing} isOwn={user?.id === profile.id} />
}
