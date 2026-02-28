'use client';

import { useEffect, useState } from 'react';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  { keys: ['?'], description: 'Show this help overlay', category: 'General' },
  { keys: ['Esc'], description: 'Close overlay or go back', category: 'General' },
  { keys: ['g', 'h'], description: 'Go to Home', category: 'Navigation' },
  { keys: ['g', 'b'], description: 'Go to Browse', category: 'Navigation' },
  { keys: ['g', 'r'], description: 'Go to Review', category: 'Navigation' },
  { keys: ['←', '→'], description: 'Previous/Next artwork', category: 'Artwork View' },
  { keys: ['j', 'k'], description: 'Navigate list items', category: 'Lists' },
];

export default function HelpOverlay() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show help on '?' or Shift+'/'
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setIsOpen(true);
      }
      // Close on Escape
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  // Group shortcuts by category
  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-3xl font-bold">Keyboard Shortcuts</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Close help overlay"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {categories.map((category) => (
            <div key={category} className="mb-8 last:mb-0">
              <h3 className="font-semibold text-lg mb-3 text-accent-ochre">{category}</h3>
              <div className="space-y-2">
                {shortcuts
                  .filter((s) => s.category === category)
                  .map((shortcut, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <span className="text-gray-700 dark:text-gray-300">{shortcut.description}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, keyIdx) => (
                          <kbd
                            key={keyIdx}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono min-w-[2rem] text-center"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500">
            Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">?</kbd> anytime to show this help
          </div>
        </div>
      </div>
    </div>
  );
}
