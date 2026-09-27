import type { Metadata } from 'next';
import { TRPCProvider } from '@/lib/trpc/Provider';

export const metadata: Metadata = {
  title: 'Full Stack Type Safe',
  description: 'Proyecto con tRPC + Drizzle + Supabase',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}