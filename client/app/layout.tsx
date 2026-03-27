import type {Metadata} from 'next';
import './globals.css';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import SilentModeManager from '@/components/SilentModeManager';
import GlobalVoiceAssistant from '@/components/GlobalVoiceAssistant';

export const metadata: Metadata = {
  title: 'E-Guard AI: Intelligent Safety System',
  description: 'AI That Acts When You Can\'t',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0f111a] text-white antialiased selection:bg-[#8b5cf6]/30">
        <div className="flex flex-col min-h-screen max-w-md mx-auto bg-[#0f111a] relative shadow-2xl shadow-black/50 overflow-hidden">
          <SilentModeManager />
          <TopBar />
          <main className="flex-1 overflow-y-auto pt-14 pb-16 px-4">
            {children}
          </main>
          <BottomNav />
          <GlobalVoiceAssistant />
        </div>
      </body>
    </html>
  );
}
