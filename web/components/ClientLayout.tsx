'use client';

import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import HelpOverlay from './HelpOverlay';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // Enable global keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <>
      {children}
      <HelpOverlay />
    </>
  );
}
