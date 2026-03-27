import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error:`Webhook error: ${err.message}` }, { status:400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session    = event.data.object as any
    const user_id    = session.metadata?.user_id
    const company_id = session.metadata?.company_id

    if (user_id) {
      const admin = createAdminClient()
      await admin.from('profiles').update({
        is_business:       true,
        business_verified: true,
        stripe_payment_id: session.payment_intent,
        stripe_customer_id: session.customer,
      }).eq('id', user_id)

      if (company_id) {
        await admin.from('business_claims').upsert({
          profile_id: user_id,
          company_id,
          verified: true,
        }, { onConflict: 'profile_id,company_id' })
      }
    }
  }

  return NextResponse.json({ received: true })
}

