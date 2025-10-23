// src/app/api/webhooks/route.ts - VERSIÓN COMPLETAMENTE CORREGIDA
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
  console.log('🔑 STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? 'SET' : 'NOT SET');

  // ✅ CORREGIDO: Validar que signature no sea null
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
    // ✅ CORREGIDO: Ahora signature no puede ser null
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

  console.log(`🔔 Webhook recibido: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('🎯 Procesando checkout.session.completed...');
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'checkout.session.async_payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'checkout.session.async_payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Checkout.Session);
        break;
      
      default:
        console.log(`ℹ️ Evento no manejado: ${event.type}`);
    }

    console.log('✅ Webhook procesado exitosamente');
    return new NextResponse(null, { status: 200 });

  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    
    // ✅ CORREGIDO: Type casting para error
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

// ✅ FUNCIÓN PRINCIPAL MEJORADA
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('=== 🚨 handleCheckoutSessionCompleted INICIADO ===');
  console.log('Session ID:', session.id);
  console.log('Customer email:', session.customer_email);
  
  try {
    // PASO 1: Verificar sesión de Stripe
    console.log('🔍 Paso 1: Recuperando sesión de Stripe...');
    const stripeSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items.data.price.product']
    });
    console.log('✅ Sesión recuperada');
    console.log('📦 Line items count:', stripeSession.line_items?.data?.length || 0);

    // PASO 2: Guardar orden en BD
    console.log('💾 Paso 2: Guardando orden en Supabase...');
    const orden = await guardarOrdenEnDB(session, stripeSession);
    
    // PASO 3: Manejar usuario
    if (session.customer_email) {
      console.log('👤 Paso 3: Manejando usuario...');
      await manejarUsuario(session.customer_email, session.id, orden);
    }
    
    console.log('✅ Procesamiento del pago completado correctamente');
    
  } catch (error) {
    console.error('❌ Error en handleCheckoutSessionCompleted:', error);
    if (error instanceof Error) {
      console.error('❌ Stack:', error.stack);
    }
    throw error;
  }
}

// ✅ GUARDAR ORDEN MEJORADO
async function guardarOrdenEnDB(session: Stripe.Checkout.Session, stripeSession: any) {
  console.log('💾 Guardando orden en la base de datos...');
  
  try {
    // Verificar si la orden ya existe
    const { data: ordenExistente } = await supabase
      .from('ordenes')
      .select('id')
      .eq('stripe_session_id', session.id)
      .single();

    if (ordenExistente) {
      console.log('⚠️ Orden ya existe:', session.id);
      return ordenExistente;
    }

    const lineItems = stripeSession.line_items?.data || [];
    
    console.log('📋 Procesando line items:', lineItems.length);
    
    const items = lineItems.map((item, index) => {
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
      console.error('   Details:', error.details);
      console.error('   Hint:', error.hint);
      throw new Error(`Error guardando orden: ${error.message}`);
    }

    console.log('✅ Orden guardada con ID:', data.id);
    return data;

  } catch (error) {
    console.error('❌ Error en guardarOrdenEnDB:', error);
    throw error;
  }
}

// ✅ MANEJAR USUARIO
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

    await habilitarDescargas(email, sessionId, orden);
    await enviarEmailConfirmacion(email, sessionId, orden, usuarioExistente?.tipo || 'guest');

  } catch (error) {
    console.error('❌ Error en manejarUsuario:', error);
  }
}

// ✅ HABILITAR DESCARGAS
async function habilitarDescargas(email: string, sessionId: string, orden: any) {
  console.log('🔓 Habilitando descargas para:', email);
  
  try {
    if (orden && orden.items) {
      for (const item of orden.items) {
        const { error: descargaError } = await supabase
          .from('descargas')
          .insert([{
            usuario_email: email,
            libro_id: item.libro_id,
            libro_titulo: item.titulo,
            sesion_id: sessionId,
            descargas_disponibles: 3,
            descargas_usadas: 0,
            expira_en: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }]);

        if (descargaError) {
          console.error('❌ Error creando registro de descarga:', descargaError);
        } else {
          console.log(`✅ Descarga habilitada para: ${item.titulo}`);
        }
      }
    }

    console.log('✅ Descargas habilitadas correctamente para:', email);

  } catch (error) {
    console.error('❌ Error en habilitarDescargas:', error);
  }
}

// ✅ ENVIAR EMAIL
async function enviarEmailConfirmacion(email: string, sessionId: string, orden: any, tipoUsuario: string) {
  console.log('📧 Enviando email de confirmación a:', email);
  
  try {
    const esGuest = tipoUsuario === 'guest';
    
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      const { data, error } = await resend.emails.send({
        from: 'IA eBook Store <onboarding@resend.dev>',
        to: email,
        subject: '✅ Confirmación de tu compra - IA eBook Store',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #10B981;">¡Gracias por tu compra!</h1>
            <p>Tu pedido ha sido procesado exitosamente.</p>
            
            <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Detalles de tu orden:</h3>
              <p><strong>ID de orden:</strong> ${sessionId}</p>
              <p><strong>Total:</strong> $${orden.amount_total} ${orden.currency}</p>
              <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
            </div>

            <div style="margin: 20px 0;">
              <h3>📚 Libros comprados:</h3>
              <ul>
                ${orden.items.map((item: any) => 
                  `<li><strong>${item.titulo}</strong> - $${item.precio} x ${item.cantidad}</li>`
                ).join('')}
              </ul>
            </div>

            <div style="background: #DBEAFE; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>🔓 Acceso a descargas:</strong></p>
              <p>Puedes descargar tus libros desde:</p>
              <p><a href="https://ia-ebook-store.vercel.app/success?session_id=${sessionId}" 
                   style="color: #2563EB; text-decoration: none; font-weight: bold;">
                   https://ia-ebook-store.vercel.app/success?session_id=${sessionId}
              </a></p>
            </div>

            <p style="margin-top: 20px; color: #6B7280;">
              Si tienes algún problema con tu descarga, contáctanos en soporte@iaebookstore.com
            </p>
          </div>
        `
      });

      if (error) {
        console.error('❌ Error enviando email con Resend:', error);
      } else {
        console.log('✅ Email enviado exitosamente via Resend');
      }
    } else {
      console.log('ℹ️ RESEND_API_KEY no configurada - Email simulado');
    }

  } catch (error) {
    console.error('❌ Error en enviarEmailConfirmacion:', error);
  }
}

// ✅ FUNCIONES RESTANTES
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