import type {Metadata} from 'next';
import './globals.css';
import LayoutContent from '@/components/LayoutContent';
import {Toaster} from 'react-hot-toast'
import SocketProvider from '@/components/SocketProvider';

export const metadata: Metadata = {
  title: 'E-Guard AI: Intelligent Safety System',
  description: 'Your Digital Guardian Never Sleeps',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-white antialiased">
        <Toaster/>
        <SocketProvider>
          <LayoutContent>{children}</LayoutContent>
        </SocketProvider>
      </body>
    </html>
  );
}
