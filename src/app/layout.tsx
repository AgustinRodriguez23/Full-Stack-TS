import type { Metadata } from 'next';
import './globals.css';
import { TRPCProvider } from '@/lib/trpc/Provider';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'PinsApp',
  description: 'Galería de imágenes: tatuajes, paisajes, dibujos y ropa',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <Header />
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}