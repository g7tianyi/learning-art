import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Learning Art - Master the Great Works',
  description: 'A local-first application for memorizing major artworks with multi-dimensional commentary and spaced repetition.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
      >
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent-ochre focus:text-white focus:rounded-lg focus:shadow-lg"
        >
          Skip to main content
        </a>

        <ClientLayout>
          <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            {/* Header */}
            <header className="border-b border-gray-200 dark:border-gray-800" role="banner">
              <div className="max-w-7xl mx-auto px-6 py-4 md:px-12 lg:px-16">
                <nav className="flex items-center justify-between" role="navigation" aria-label="Main navigation">
                  <h1 className="font-serif text-2xl md:text-3xl font-semibold">
                    <Link href="/" className="hover:text-accent-ochre transition-colors focus-ring">
                      Learning Art
                    </Link>
                  </h1>

                  <ul className="flex items-center gap-6" role="list">
                    <li>
                      <Link
                        href="/"
                        className="transition-gentle hover:text-accent-ochre focus-ring"
                        aria-label="Go to home page"
                      >
                        Home
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/browse"
                        className="transition-gentle hover:text-accent-ochre focus-ring"
                        aria-label="Browse artwork collection"
                      >
                        Browse
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/timeline"
                        className="transition-gentle hover:text-accent-ochre focus-ring"
                        aria-label="Explore artworks by historical era"
                      >
                        Timeline
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/review"
                        className="transition-gentle hover:text-accent-ochre focus-ring"
                        aria-label="Review artworks due today"
                      >
                        Review
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </header>

            {/* Main content */}
            <main id="main-content" role="main">
              {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 dark:border-gray-800 mt-24" role="contentinfo">
              <div className="max-w-7xl mx-auto px-6 py-8 md:px-12 lg:px-16">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Learning Art - A local-first art education tool
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
                  Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-xs font-mono">?</kbd> for keyboard shortcuts
                </p>
              </div>
            </footer>
          </div>
        </ClientLayout>
      </body>
    </html>
  );
}
