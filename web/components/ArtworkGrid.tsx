/**
 * Reusable Artwork Grid Component
 *
 * Displays artworks in a responsive grid layout.
 * Used in browse page, era detail pages, and search results.
 */

import Link from 'next/link';
import Image from 'next/image';
import type { Artwork } from '@/lib/db';

interface ArtworkGridProps {
  artworks: Artwork[];
  emptyMessage?: string;
}

export default function ArtworkGrid({ artworks, emptyMessage }: ArtworkGridProps) {
  if (artworks.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          {emptyMessage || 'No artworks found.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {artworks.map((artwork) => (
        <Link
          key={artwork.id}
          href={`/works/${artwork.id}`}
          className="group block transition-gentle hover:-translate-y-1"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
            {/* Image */}
            <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-700">
              {(artwork.imagePath || artwork.imageUrl) ? (
                <Image
                  src={artwork.imagePath || artwork.imageUrl!}
                  alt={artwork.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  {artwork.category === 'painting' && '🎨'}
                  {artwork.category === 'sculpture' && '🗿'}
                  {artwork.category === 'architecture' && '🏛️'}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-6">
              <h3 className="font-serif text-xl font-semibold mb-2 group-hover:text-accent-ochre transition-colors">
                {artwork.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                {artwork.artist}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {artwork.year} • {artwork.category}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
