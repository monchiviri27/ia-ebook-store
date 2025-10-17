// src/app/api/webhooks/route.ts - VERSIÓN CORREGIDA
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const body = await req.text();
  
  // ✅ CORRECCIÓN: Agregar await a headers()
  const signature = (await headers()).get('stripe-signature')!;

  let event;

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

  const session = event.data.object;

  if (event.type === 'checkout.session.completed') {
    try {
      console.log('✅ Pago completado:', session.id);
      
      // Aquí puedes agregar lógica adicional como:
      // - Actualizar estado en tu base de datos
      // - Enviar email de confirmación
      // - Registrar la venta
      
      // Ejemplo de actualización en Supabase:
      // await supabase
      //   .from('ventas')
      //   .insert({
      //     session_id: session.id,
      //     customer_email: session.customer_email,
      //     amount_total: session.amount_total / 100, // Convertir de centavos
      //     status: 'completed'
      //   });

    } catch (error) {
      console.error('❌ Error procesando pago:', error);
    }
  }

  return new NextResponse(null, { status: 200 });
}