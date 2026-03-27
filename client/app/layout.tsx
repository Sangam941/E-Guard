import type {Metadata} from 'next';
import './globals.css';
import LayoutContent from '@/components/LayoutContent';

export const metadata: Metadata = {
  title: 'E-Guard AI: Intelligent Safety System',
  description: 'Your Digital Guardian Never Sleeps',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-white antialiased">
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
