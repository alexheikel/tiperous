import { Suspense } from 'react'
import BusinessRegisterClient from './client'

export default function BusinessRegisterPage() {
  return <Suspense fallback={<div style={{padding:40,textAlign:'center',color:'var(--muted)'}}>Cargando…</div>}><BusinessRegisterClient /></Suspense>
}
