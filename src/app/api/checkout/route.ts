// src/app/api/checkout/route.ts - VERSIÓN CORREGIDA
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const { items } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      );
    }

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.titulo,
          images: [item.portada_url],
        },
        unit_amount: Math.round(item.precio * 100),
      },
      quantity: item.cantidad || 1,
    }));

    // ✅ URL CORREGIDA - USA TU URL REAL
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://ia-ebook-store.vercel.app'  // ← ESTA ES TU URL REAL
      : 'http://localhost:3000';

    console.log('🎯 Creando sesión con URL:', baseUrl);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/carrito`,
    });

    console.log('✅ Sesión creada:');
    console.log(' - ID:', session.id);
    console.log(' - Success URL:', session.success_url);
    console.log(' - Stripe URL:', session.url);

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });
    
  } catch (error) {
    console.error('❌ Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}