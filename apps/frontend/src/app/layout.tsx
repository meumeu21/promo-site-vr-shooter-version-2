import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { AppLayout } from '@/components/layout';
export const metadata: Metadata = {
  title: 'SHOOTER VR',
  description: 'Командные матчи в виртуальной реальности. Выбирай карту, собирай команду и возвращайся к истории матчей, чтобы смотреть счёт, составы и K/D.'
};
export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return <html lang="ru">
      <body>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>;
}
