// Versión con verificación de tipos más robusta
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
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

  // ✅ Manejar específicamente checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // ✅ Verificaciones adicionales para mayor seguridad
    if (!session.id) {
      console.error('❌ Session ID no encontrado');
      return new NextResponse('Session ID missing', { status: 400 });
    }

    try {
      console.log('✅ Pago completado - Session ID:', session.id);
      console.log('📧 Customer:', session.customer_email);
      console.log('💰 Amount:', session.amount_total ? session.amount_total / 100 : 'N/A');
      
      // Tu lógica de procesamiento aquí
      // await procesarPagoExitoso(session);

    } catch (error) {
      console.error('❌ Error procesando pago exitoso:', error);
      // No devolver error 500 para no reintentar el webhook
    }
  }

  // ✅ Manejar otros eventos importantes
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('💳 PaymentIntent succeeded:', paymentIntent.id);
      break;
      
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      console.log('❌ Payment failed:', failedPayment.id);
      break;
      
    default:
      console.log(`⚡ Evento no manejado: ${event.type}`);
  }

  return new NextResponse(null, { status: 200 });
}