import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

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
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          {/* Header */}
          <header className="border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-6 py-4 md:px-12 lg:px-16">
              <nav className="flex items-center justify-between">
                <h1 className="font-serif text-2xl md:text-3xl font-semibold">
                  Learning Art
                </h1>

                <div className="flex items-center gap-6">
                  <Link href="/" className="transition-gentle hover:text-accent-ochre focus-ring">
                    Home
                  </Link>
                  <Link href="/browse" className="transition-gentle hover:text-accent-ochre focus-ring">
                    Browse
                  </Link>
                  <Link href="/review" className="transition-gentle hover:text-accent-ochre focus-ring">
                    Review
                  </Link>
                </div>
              </nav>
            </div>
          </header>

          {/* Main content */}
          <main>
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-gray-200 dark:border-gray-800 mt-24">
            <div className="max-w-7xl mx-auto px-6 py-8 md:px-12 lg:px-16">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Learning Art - A local-first art education tool
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
