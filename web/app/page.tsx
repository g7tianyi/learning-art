import Link from 'next/link';
import { getTodayReviewQueue, getProgressStats } from '@/lib/db';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default function Home() {
  const reviewQueue = getTodayReviewQueue(5);
  const stats = getProgressStats();

  return (
    <div className="section-padding">
      <div className="max-w-4xl mx-auto">
        {/* Hero section */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-5xl md:text-6xl font-bold mb-6">
            Master the Great Works
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed">
            A serene space to study, memorize, and deeply understand
            masterworks of painting, sculpture, and architecture.
          </p>
        </div>

        {/* Stats */}
        {stats.totalArtworks > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-accent-ochre mb-2">
                {stats.totalArtworks}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Artworks
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent-sage mb-2">
                {stats.reviewed}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Studied
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent-rose mb-2">
                {stats.dueToday}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Due Today
              </div>
            </div>
          </div>
        )}

        {/* Today's Reviews */}
        {reviewQueue.length > 0 && (
          <div className="mb-16">
            <h3 className="font-serif text-2xl font-semibold mb-6">
              Today&apos;s Review Queue
            </h3>
            <div className="grid gap-4 mb-6">
              {reviewQueue.slice(0, 3).map((artwork) => (
                <Link
                  key={artwork.id}
                  href={`/works/${artwork.id}`}
                  className="flex gap-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-lg transition-shadow"
                >
                  <div className="flex-shrink-0">
                    {artwork.imageUrl ? (
                      <div className="relative w-20 h-20 rounded overflow-hidden">
                        <Image
                          src={artwork.imageUrl}
                          alt={artwork.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-2xl">
                        🎨
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-semibold truncate">
                      {artwork.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {artwork.artist}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <Link
              href="/review"
              className="block text-center px-8 py-3 bg-accent-ochre text-white font-semibold rounded-lg hover:bg-accent-ochre/90 transition-colors"
            >
              Start Reviewing
            </Link>
          </div>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="font-serif text-xl font-semibold mb-2">
              Curated Collection
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Masterworks from across time and cultures, carefully selected
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="font-serif text-xl font-semibold mb-2">
              Deep Understanding
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Multi-dimensional analysis covering history, culture, and philosophy
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="font-serif text-xl font-semibold mb-2">
              Smart Learning
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Spaced repetition adapts to your memory for optimal retention
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/browse"
            className="inline-block px-8 py-4 bg-accent-ochre text-white font-semibold rounded-lg transition-gentle hover:bg-accent-ochre/90 focus-ring"
          >
            {stats.totalArtworks > 0 ? 'Explore Collection' : 'Get Started'}
          </Link>
        </div>

        {/* Getting started message */}
        {stats.totalArtworks === 0 && (
          <div className="mt-16 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <h4 className="font-serif text-lg font-semibold mb-2">
              🚀 Getting Started
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              To load artworks into the database, run:
            </p>
            <code className="block bg-gray-800 text-gray-100 p-3 rounded text-sm">
              npm run load-artworks
            </code>
            <p className="text-sm text-gray-500 mt-2">
              This will load 10 masterworks for testing (Starry Night, Mona Lisa, etc.)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
