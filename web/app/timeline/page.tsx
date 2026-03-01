/**
 * Timeline Page
 *
 * Chronological view of art eras with representative artworks.
 */

import { getAllEras, getEraStats } from '@/lib/eras';
import { getAllArtworks } from '@/lib/db';
import EraCard from '@/components/EraCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Timeline | Learning Art',
  description: 'Explore artworks through art historical eras from Renaissance to Modern',
};

export default function TimelinePage() {
  const eras = getAllEras();
  const artworks = getAllArtworks();
  const eraStats = getEraStats(artworks, eras);

  // For each era, get up to 3 thumbnail images
  const eraThumbnails: Record<string, string[]> = {};
  eras.forEach(era => {
    const eraArtworks = artworks.filter(artwork => {
      const { getEraForArtwork } = require('@/lib/eras');
      const artworkEra = getEraForArtwork(artwork, eras);
      return artworkEra?.id === era.id;
    });

    // Get up to 3 image URLs (prefer local, fallback to remote)
    eraThumbnails[era.id] = eraArtworks
      .slice(0, 3)
      .map(artwork => artwork.imagePath || artwork.imageUrl)
      .filter(Boolean) as string[];
  });

  return (
    <div className="section-padding">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl font-bold mb-4">
            Timeline: Explore Art Through History
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Journey through art historical eras, from the Renaissance to Modern Art,
            and discover the evolution of human creativity across centuries.
          </p>
        </div>

        {/* Era Cards */}
        {eras.length > 0 ? (
          <div className="space-y-8">
            {eras.map(era => {
              const stats = eraStats.find(s => s.eraId === era.id);
              const artworkCount = stats?.count || 0;
              const thumbnails = eraThumbnails[era.id] || [];

              return (
                <EraCard
                  key={era.id}
                  era={era}
                  artworkCount={artworkCount}
                  thumbnails={thumbnails}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No eras defined yet. Check your data/eras/eras.json configuration.
            </p>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-500 text-center">
            Timeline spans {eras.length} art historical eras •{' '}
            {artworks.length} artworks in collection
          </p>
        </div>
      </div>
    </div>
  );
}
