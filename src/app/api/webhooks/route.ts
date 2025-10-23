// src/app/api/webhooks/route.ts - VERSIÓN COMPLETA CORREGIDA
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  console.log('=== 🟢 WEBHOOK INICIADO ===');
  
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature');

  console.log('📦 Body length:', body.length);
  console.log('🔐 Signature:', signature ? 'PRESENT' : 'MISSING');

  if (!signature) {
    console.error('❌ Stripe signature missing');
    return new NextResponse('Stripe signature missing', { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('❌ STRIPE_WEBHOOK_SECRET no está configurado');
    return new NextResponse('Webhook secret missing', { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('✅ Evento verificado:', event.type);
  } catch (error) {
    console.error('❌ Firma de webhook inválida:', error);
    return new NextResponse('Webhook signature verification failed', { status: 400 });
  }

  try {
    console.log(`🔔 Webhook recibido: ${event.type}`);
    console.log('🔍 Event ID:', event.id);
    
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('🎯 EJECUTANDO checkout.session.completed...');
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        console.log('✅ checkout.session.completed COMPLETADO');
        break;
      
      case 'checkout.session.async_payment_succeeded':
        console.log('🔄 Ejecutando async_payment_succeeded...');
        await handlePaymentSucceeded(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'checkout.session.async_payment_failed':
        console.log('💀 Ejecutando async_payment_failed...');
        await handlePaymentFailed(event.data.object as Stripe.Checkout.Session);
        break;
      
      default:
        console.log(`ℹ️ Evento no manejado: ${event.type}`);
    }

    console.log('✅ Webhook procesado exitosamente');
    return new NextResponse(null, { status: 200 });

  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    if (error instanceof Error) {
      console.error('❌ Stack trace:', error.stack);
    }
    return new NextResponse(
      JSON.stringify({ 
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('=== 🚨 WEBHOOK handleCheckoutSessionCompleted INICIADO ===');
  console.log('📧 Email del cliente:', session.customer_email);
  console.log('🆔 Session ID:', session.id);
  
  try {
    // PASO 1: Guardar orden
    console.log('1. 💾 Guardando orden...');
    const orden = await guardarOrdenEnDB(session);
    console.log('1. ✅ Orden guardada ID:', orden.id);

    // PASO 2: Verificar si tenemos email
    if (!session.customer_email) {
      console.log('❌ SALIENDO: No hay customer_email');
      return;
    }

    console.log('2. 👤 Manejando usuario...');
    await manejarUsuario(session.customer_email, session.id, orden);
    console.log('2. ✅ Usuario manejado');

    console.log('3. 🔓 Habilitando descargas...');
    await habilitarDescargas(session.customer_email, session.id, orden);
    console.log('3. ✅ Descargas habilitadas');

    console.log('🎉 WEBHOOK COMPLETADO EXITOSAMENTE');

  } catch (error) {
    console.error('❌ ERROR CRÍTICO EN WEBHOOK:', error);
    if (error instanceof Error) {
      console.error('❌ Stack:', error.stack);
    }
    throw error;
  }
}

async function guardarOrdenEnDB(session: Stripe.Checkout.Session) {
  console.log('💾 Guardando orden en la base de datos...');
  
  try {
    const stripeSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items.data.price.product']
    });

    const lineItems = stripeSession.line_items?.data || [];
    
    console.log('📋 Procesando line items:', lineItems.length);
    
    const items = lineItems.map((item: any, index: number) => {
      const product = item.price?.product as Stripe.Product;
      console.log(`   Item ${index + 1}:`, product?.name || 'Sin nombre');
      
      return {
        libro_id: product?.id || 'unknown',
        titulo: product?.name || 'Libro sin título',
        precio: item.price?.unit_amount ? item.price.unit_amount / 100 : 0,
        cantidad: item.quantity || 1,
        portada_url: product?.images?.[0] || ''
      };
    });

    const ordenData = {
      stripe_session_id: session.id,
      customer_email: session.customer_email,
      customer_name: session.customer_details?.name,
      amount_total: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency,
      payment_status: session.payment_status,
      items: items,
      created_at: new Date().toISOString()
    };

    console.log('📝 Insertando orden en Supabase...');
    
    const { data, error } = await supabase
      .from('ordenes')
      .insert([ordenData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error guardando orden en Supabase:');
      console.error('   Code:', error.code);
      console.error('   Message:', error.message);
      throw new Error(`Error guardando orden: ${error.message}`);
    }

    console.log('✅ Orden guardada con ID:', data.id);
    return data;

  } catch (error) {
    console.error('❌ Error en guardarOrdenEnDB:', error);
    throw error;
  }
}

async function manejarUsuario(email: string, sessionId: string, orden: any) {
  console.log('👤 Manejando usuario:', email);
  
  try {
    const { data: usuarioExistente } = await supabase
      .from('usuarios')
      .select('id, email, tipo, descargas_habilitadas')
      .eq('email', email)
      .single();

    if (usuarioExistente) {
      console.log(`✅ Usuario existente (${usuarioExistente.tipo || 'guest'}):`, email);
      
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ 
          descargas_habilitadas: true,
          ultima_compra: new Date().toISOString(),
          sesion_compra: sessionId
        })
        .eq('email', email);

      if (updateError) {
        console.error('❌ Error actualizando usuario:', updateError);
      }
    } else {
      console.log('👤 Creando nuevo usuario GUEST...');
      const { data: nuevoUsuario, error: insertError } = await supabase
        .from('usuarios')
        .insert([{
          email: email,
          tipo: 'guest',
          descargas_habilitadas: true,
          ultima_compra: new Date().toISOString(),
          sesion_compra: sessionId,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error creando usuario guest:', insertError);
        throw insertError;
      }

      console.log('✅ Nuevo usuario GUEST creado:', email);
    }

  } catch (error) {
    console.error('❌ Error en manejarUsuario:', error);
  }
}

async function habilitarDescargas(email: string, sessionId: string, orden: any) {
  console.log('🔓 Habilitando descargas para:', email);
  console.log('📦 Orden recibida:', orden);
  console.log('📚 Items en orden:', orden?.items?.length);
  
  try {
    if (orden && orden.items) {
      console.log(`🔄 Procesando ${orden.items.length} items...`);
      
      for (const item of orden.items) {
        console.log(`   📖 Procesando: ${item.titulo} (ID: ${item.libro_id})`);
        
        const descargaData = {
          usuario_email: email,
          libro_id: item.libro_id,
          libro_titulo: item.titulo,
          sesion_id: sessionId,
          descargas_disponibles: 3,
          descargas_usadas: 0,
          expira_en: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };

        console.log('   💾 Insertando descarga:', descargaData);
        
        const { data, error: descargaError } = await supabase
          .from('descargas')
          .insert([descargaData])
          .select();

        if (descargaError) {
          console.error('   ❌ Error insertando descarga:', descargaError);
        } else {
          console.log('   ✅ Descarga insertada:', data);
        }
      }
    }

    console.log('✅ Proceso de descargas completado');

  } catch (error) {
    console.error('❌ Error en habilitarDescargas:', error);
  }
}

async function enviarEmailConfirmacion(email: string, sessionId: string, orden: any, tipoUsuario: string) {
  console.log('📧 Email simulado para:', email);
  return true;
}

async function handlePaymentSucceeded(session: Stripe.Checkout.Session) {
  console.log('✅ Pago asíncrono exitoso:', session.id);
  await handleCheckoutSessionCompleted(session);
}

async function handlePaymentFailed(session: Stripe.Checkout.Session) {
  console.log('❌ Pago fallido:', session.id);
  
  const { error } = await supabase
    .from('ordenes')
    .update({ 
      payment_status: session.payment_status,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_session_id', session.id);

  if (error) {
    console.error('❌ Error actualizando orden fallida:', error);
  }
}