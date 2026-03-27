'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShieldAlert, MessageSquare, PhoneCall, Users, Camera, Radio } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/assistant', icon: MessageSquare, label: 'Chat' },
    { href: '/live', icon: Radio, label: 'Live AI' },
    { href: '/evidence', icon: Camera, label: 'Evidence' },
    { href: '/contacts', icon: Users, label: 'Contacts' },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-[#1e2130]/90 backdrop-blur-md border-t border-[#2d3748] pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-14 h-full transition-colors",
                isActive ? "text-[#8b5cf6]" : "text-[#9ca3af] hover:text-white"
              )}
            >
              <Icon className="w-5 h-5 mb-1" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
