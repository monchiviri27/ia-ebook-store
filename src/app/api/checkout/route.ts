// src/app/api/checkout/route.ts - VERSIÓN ACTUALIZADA
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const { items } = await request.json();

    // Crear línea de productos para Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.titulo,
          images: [item.portada_url],
          metadata: {
            libro_id: item.id,
          },
        },
        unit_amount: Math.round(item.precio * 100), // Stripe espera centavos
      },
      quantity: item.cantidad,
    }));

    // Crear sesión de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/carrito`,
      metadata: {
        libros: JSON.stringify(items.map((item: any) => ({
          id: item.id,
          titulo: item.titulo,
          cantidad: item.cantidad,
        }))),
      },
    });

    // Devolver tanto sessionId como url para compatibilidad
    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
}