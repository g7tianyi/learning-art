import Link from 'next/link';
import { getTodayReviewQueue, getProgressStats } from '@/lib/db';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default function ReviewPage() {
  const queue = getTodayReviewQueue(10);
  const stats = getProgressStats();

  return (
    <div className="section-padding">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl font-bold mb-8">Review Mode</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow">
            <div className="text-3xl font-bold text-accent-ochre mb-2">
              {stats.totalArtworks}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Artworks
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow">
            <div className="text-3xl font-bold text-accent-sage mb-2">
              {stats.reviewed}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Reviewed
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow">
            <div className="text-3xl font-bold text-accent-rose mb-2">
              {stats.dueToday}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Due Today
            </div>
          </div>
        </div>

        {/* Review Queue */}
        {queue.length > 0 ? (
          <div>
            <h2 className="font-serif text-2xl font-semibold mb-6">
              Today&apos;s Review Queue ({queue.length})
            </h2>

            <div className="space-y-6">
              {queue.map((artwork) => (
                <Link
                  key={artwork.id}
                  href={`/works/${artwork.id}`}
                  className="block bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex gap-6">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0">
                      {artwork.imageUrl ? (
                        <div className="relative w-32 h-32 rounded overflow-hidden">
                          <Image
                            src={artwork.imageUrl}
                            alt={artwork.title}
                            fill
                            className="object-cover"
                            sizes="128px"
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-4xl">
                          {artwork.category === 'painting' && '🎨'}
                          {artwork.category === 'sculpture' && '🗿'}
                          {artwork.category === 'architecture' && '🏛️'}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="font-serif text-xl font-semibold mb-2 hover:text-accent-ochre transition-colors">
                        {artwork.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">
                        {artwork.artist}
                      </p>
                      <p className="text-sm text-gray-500">
                        {artwork.year} • {artwork.category}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center text-gray-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold mb-2">How it works:</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                The SM-2 spaced repetition algorithm schedules reviews when you&apos;re about to forget.
                Click each artwork to study it, then rate your recall: Hard, Medium, or Easy.
                The system adapts the next review date based on your performance.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="font-serif text-2xl font-semibold mb-4">
              All caught up!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              No artworks due for review today. Great work!
            </p>
            <Link
              href="/browse"
              className="inline-block px-8 py-3 bg-accent-ochre text-white font-semibold rounded-lg hover:bg-accent-ochre/90 transition-colors"
            >
              Browse Collection
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
