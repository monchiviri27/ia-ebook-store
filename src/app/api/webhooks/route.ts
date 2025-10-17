// src/app/api/webhooks/route.ts - CORREGIDO
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('❌ Error en webhook:', error);
    return new NextResponse('Webhook error', { status: 400 });
  }

  // ✅ SOLUCIÓN: Agregar type casting
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session; // ← AQUÍ ESTÁ LA SOLUCIÓN
    
    try {
      console.log('✅ Pago completado:', session.id); // ← Ahora session.id funciona
      console.log('📧 Customer:', session.customer_email);
      console.log('💰 Amount:', session.amount_total);
      
    } catch (error) {
      console.error('❌ Error procesando pago:', error);
    }
  }

  return new NextResponse(null, { status: 200 });
}