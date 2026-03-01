/**
 * Era Card Component
 *
 * Displays an art historical era with representative thumbnails,
 * date range, description, and artwork count.
 */

import Link from 'next/link';
import Image from 'next/image';
import type { Era } from '@/lib/eras';

interface EraCardProps {
  era: Era;
  artworkCount: number;
  thumbnails: string[]; // Array of image URLs (max 3)
}

export default function EraCard({ era, artworkCount, thumbnails }: EraCardProps) {
  return (
    <Link
      href={`/timeline/${era.slug}`}
      className="block group transition-gentle hover:-translate-y-1"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
        {/* Header with Era Name and Date Range */}
        <div
          className="p-6 pb-4"
          style={{
            borderLeft: `4px solid ${era.color || '#D4AF37'}`
          }}
        >
          <h2 className="font-serif text-2xl font-bold mb-2 group-hover:text-accent-ochre transition-colors">
            {era.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold">
            {era.startYear < 0 ? `${Math.abs(era.startYear)} BCE` : era.startYear} -{' '}
            {era.endYear < 0 ? `${Math.abs(era.endYear)} BCE` : era.endYear}
          </p>
        </div>

        {/* Thumbnails */}
        {thumbnails.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 px-6 pb-4">
            {thumbnails.slice(0, 3).map((thumbnail, index) => (
              <div
                key={index}
                className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden"
              >
                <Image
                  src={thumbnail}
                  alt={`${era.name} artwork ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 15vw"
                />
              </div>
            ))}
            {thumbnails.length < 3 && [...Array(3 - thumbnails.length)].map((_, index) => (
              <div
                key={`placeholder-${index}`}
                className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center"
              >
                <span className="text-gray-400 text-2xl">🎨</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 pb-4">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-md py-8 flex items-center justify-center">
              <span className="text-gray-400 text-4xl">🎨</span>
            </div>
          </div>
        )}

        {/* Description and Count */}
        <div className="px-6 pb-6">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
            {era.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-accent-ochre">
              {artworkCount} {artworkCount === 1 ? 'work' : 'works'}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-500 group-hover:text-accent-ochre transition-colors">
              View Era →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
