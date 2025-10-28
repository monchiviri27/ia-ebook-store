// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CarritoProvider } from "@/context/CarritoContext";
import { ToastProvider } from "@/context/ToastContext";
import ChatbotWidget from "@/components/ChatbotWidget"; // ← Importar el chatbot

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono", 
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "eBookStore - Tienda de Libros Digitales",
  description: "Descubre libros únicos generados con IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased flex flex-col min-h-screen">
        <ToastProvider>
          <CarritoProvider>
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <ChatbotWidget /> {/* ← Agregar el chatbot aquí */}
          </CarritoProvider>
        </ToastProvider>
      </body>
    </html>
  );
}