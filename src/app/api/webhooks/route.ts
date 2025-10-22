// src/app/api/webhooks/route.ts - VERSIÓN COMPLETA CON USUARIOS GUEST/REGISTERED
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature')!;

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
  } catch (error) {
    console.error('❌ Firma de webhook inválida:', error);
    return new NextResponse('Webhook signature verification failed', { status: 400 });
  }

  console.log(`🔔 Webhook recibido: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
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

    return new NextResponse(null, { status: 200 });

  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    return new NextResponse('Webhook processing failed', { status: 500 });
  }
}

// ✅ FUNCIÓN PRINCIPAL ACTUALIZADA PARA GUEST/REGISTERED
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('🎉 Checkout completado exitosamente!');
  
  try {
    // 1. Guardar la orden en la base de datos
    const orden = await guardarOrdenEnDB(session);
    
    // 2. Manejar usuario (guest o registered)
    if (session.customer_email) {
      await manejarUsuario(session.customer_email, session.id, orden);
    }
    
    // 3. Actualizar inventario si es necesario
    await actualizarInventario(session);
    
    console.log('✅ Procesamiento del pago completado correctamente');
    
  } catch (error) {
    console.error('❌ Error en handleCheckoutSessionCompleted:', error);
    throw error;
  }
}

// ✅ MANEJAR USUARIO (GUEST O REGISTERED)
async function manejarUsuario(email: string, sessionId: string, orden: any) {
  console.log('👤 Manejando usuario:', email);
  
  try {
    // Verificar si el usuario ya existe
    const { data: usuarioExistente } = await supabase
      .from('usuarios')
      .select('id, email, tipo, descargas_habilitadas')
      .eq('email', email)
      .single();

    let usuarioId;
    let tipoUsuario = 'guest';

    if (usuarioExistente) {
      // Usuario existente (puede ser guest o registered)
      usuarioId = usuarioExistente.id;
      tipoUsuario = usuarioExistente.tipo || 'guest';
      
      console.log(`✅ Usuario existente (${tipoUsuario}):`, email);
      
      // Actualizar último acceso y habilitar descargas
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
      // Nuevo usuario GUEST (no registrado)
      tipoUsuario = 'guest';
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

      usuarioId = nuevoUsuario.id;
      console.log('✅ Nuevo usuario GUEST creado:', email);
    }

    // Habilitar descargas independientemente del tipo de usuario
    await habilitarDescargas(email, sessionId, orden);
    
    // Enviar email de confirmación
    await enviarEmailConfirmacion(email, sessionId, orden, tipoUsuario);

  } catch (error) {
    console.error('❌ Error en manejarUsuario:', error);
  }
}

// ✅ GUARDAR ORDEN EN SUPABASE (igual que antes)
async function guardarOrdenEnDB(session: Stripe.Checkout.Session) {
  console.log('💾 Guardando orden en la base de datos...');
  
  const stripeSession = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ['line_items.data.price.product']
  });

  const lineItems = stripeSession.line_items?.data || [];
  
  const items = lineItems.map(item => {
    const product = item.price?.product as Stripe.Product;
    return {
      libro_id: product.id || 'unknown',
      titulo: product.name || 'Libro sin título',
      precio: item.price?.unit_amount ? item.price.unit_amount / 100 : 0,
      cantidad: item.quantity || 1,
      portada_url: product.images?.[0] || ''
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

  const { data, error } = await supabase
    .from('ordenes')
    .insert([ordenData])
    .select()
    .single();

  if (error) {
    console.error('❌ Error guardando orden en Supabase:', error);
    throw new Error(`Error guardando orden: ${error.message}`);
  }

  console.log('✅ Orden guardada con ID:', data.id);
  return data;
}

// ✅ HABILITAR DESCARGAS (actualizado)
async function habilitarDescargas(email: string, sessionId: string, orden: any) {
  console.log('🔓 Habilitando descargas para:', email);
  
  try {
    // Crear registros de descarga para cada libro comprado
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

// ACTUALIZA solo la función enviarEmailConfirmacion:
async function enviarEmailConfirmacion(email: string, sessionId: string, orden: any, tipoUsuario: string) {
  console.log('📧 Enviando email de confirmación a:', email);
  
  try {
    const esGuest = tipoUsuario === 'guest';
    const textoRegistro = esGuest 
      ? '<p>📝 <strong>¿Quieres guardar tu historial?</strong> Regístrate con este email para acceder a tus libros siempre.</p>'
      : '<p>✅ <strong>¡Gracias por ser usuario registrado!</strong> Puedes acceder a tus libros desde tu cuenta.</p>';

    // ✅ IMPLEMENTACIÓN REAL CON RESEND
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      const { data, error } = await resend.emails.send({
        from: 'IA eBook Store <onboarding@resend.dev>', // Email temporal de Resend
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
              <p><strong>Tipo de cuenta:</strong> ${esGuest ? 'Invitado' : 'Registrado'}</p>
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

            ${textoRegistro}

            <p style="margin-top: 20px; color: #6B7280;">
              Si tienes algún problema con tu descarga, contáctanos en soporte@iaebookstore.com
            </p>
          </div>
        `
      });

      if (error) {
        console.error('❌ Error enviando email con Resend:', error);
      } else {
        console.log('✅ Email enviado exitosamente via Resend:', data);
      }
    } else {
      console.log('ℹ️ RESEND_API_KEY no configurada - Email simulado');
      // Simulación (como antes)
    }

  } catch (error) {
    console.error('❌ Error en enviarEmailConfirmacion:', error);
  }
}

// ✅ FUNCIONES RESTANTES (igual que antes)
async function actualizarInventario(session: Stripe.Checkout.Session) {
  console.log('📦 Actualizando inventario...');
  // Lógica de inventario aquí...
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