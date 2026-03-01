'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import ImageUpload from '@/components/ImageUpload';
import type { Artwork } from '@/lib/db';
import type { Era } from '@/lib/eras';

interface ArtworkDetailProps {
  artwork: Artwork;
  prevArtwork: Artwork | null;
  nextArtwork: Artwork | null;
  era?: Era;
}

export default function ArtworkDetail({ artwork, prevArtwork, nextArtwork, era }: ArtworkDetailProps) {
  const router = useRouter();
  const [localImagePath, setLocalImagePath] = useState(artwork.imagePath);

  // Determine which image to display (local takes priority)
  const displayImage = localImagePath || artwork.imageUrl;

  // Enable keyboard shortcuts for prev/next navigation
  useKeyboardShortcuts({
    onPrevious: prevArtwork ? () => router.push(`/works/${prevArtwork.id}`) : undefined,
    onNext: nextArtwork ? () => router.push(`/works/${nextArtwork.id}`) : undefined,
  });

  return (
    <div className="section-padding">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/browse" className="text-gray-600 dark:text-gray-400 hover:text-accent-ochre transition-colors">
            ← Back to Browse
          </Link>

          <div className="flex gap-4">
            {prevArtwork && (
              <Link
                href={`/works/${prevArtwork.id}`}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                ← Previous
              </Link>
            )}
            {nextArtwork && (
              <Link
                href={`/works/${nextArtwork.id}`}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Next →
              </Link>
            )}
          </div>
        </div>

        {/* Artwork */}
        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Image */}
          <div className="space-y-6">
            {displayImage ? (
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={displayImage}
                  alt={artwork.title}
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  key={displayImage} // Force re-render when image changes
                />
              </div>
            ) : (
              <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-6xl">
                {artwork.category === 'painting' && '🎨'}
                {artwork.category === 'sculpture' && '🗿'}
                {artwork.category === 'architecture' && '🏛️'}
              </div>
            )}

            {/* Image Upload */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">
                Local Image Upload
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {localImagePath
                  ? 'Using local image. You can replace or delete it.'
                  : 'Upload a local image for faster, offline-accessible viewing.'}
              </p>
              <ImageUpload
                artworkId={artwork.id}
                currentImagePath={localImagePath}
                onUploadSuccess={(path) => {
                  setLocalImagePath(path || undefined);
                  router.refresh();
                }}
              />
            </div>
          </div>

          {/* Metadata */}
          <div>
            <h1 className="font-serif text-4xl font-bold mb-4">
              {artwork.title}
            </h1>

            <div className="space-y-3 mb-8">
              <p className="text-xl text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Artist:</span> {artwork.artist}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Year:</span> {artwork.year}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Category:</span>{' '}
                <span className="capitalize">{artwork.category}</span>
              </p>
              {artwork.medium && (
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Medium:</span> {artwork.medium}
                </p>
              )}
              {artwork.dimensions && (
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Dimensions:</span> {artwork.dimensions}
                </p>
              )}
              {artwork.location && (
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Location:</span> {artwork.location}
                </p>
              )}
              {artwork.movement && (
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Movement:</span> {artwork.movement}
                </p>
              )}
            </div>

            {/* Links */}
            <div className="flex gap-4">
              {artwork.wikiUrl && (
                <a
                  href={artwork.wikiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-accent-ochre text-white rounded-lg hover:bg-accent-ochre/90 transition-colors"
                >
                  Wikipedia →
                </a>
              )}
              {artwork.museumUrl && (
                <a
                  href={artwork.museumUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Museum →
                </a>
              )}
            </div>

            {/* Era Context Badge */}
            {era && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  📜 This work is from the{' '}
                  <Link
                    href={`/timeline/${era.slug}`}
                    className="font-semibold text-accent-ochre hover:underline"
                  >
                    {era.name}
                  </Link>
                  {' '}
                  ({era.startYear < 0 ? `${Math.abs(era.startYear)} BCE` : era.startYear} - {era.endYear < 0 ? `${Math.abs(era.endYear)} BCE` : era.endYear})
                </p>
                <Link
                  href={`/timeline/${era.slug}`}
                  className="text-sm text-accent-ochre hover:underline inline-flex items-center gap-1"
                >
                  Learn about this era →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Commentary placeholder */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 border border-gray-200 dark:border-gray-800">
          <h2 className="font-serif text-2xl font-bold mb-4">Commentary</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Multi-dimensional commentary coming soon. This will include:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600 dark:text-gray-400">
            <li>Art & Technique - Visual analysis and formal elements</li>
            <li>Historical Context - Creation circumstances and reception</li>
            <li>Social & Cultural Impact - Influence and meaning over time</li>
            <li>Economics - Patronage, sales, and market value</li>
            <li>Psychology - Artist&apos;s state and viewer response</li>
            <li>Philosophy - Existential themes and aesthetic questions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
