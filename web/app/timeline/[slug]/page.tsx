/**
 * Era Detail Page
 *
 * Shows detailed introduction and artworks for a specific era.
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllEras, getEraBySlug, getEraIntroduction, getAdjacentEras, getArtworksByEra } from '@/lib/eras';
import { getAllArtworks } from '@/lib/db';
import EraIntroduction from '@/components/EraIntroduction';
import ArtworkGrid from '@/components/ArtworkGrid';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const eras = getAllEras();
  return eras.map(era => ({
    slug: era.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const era = getEraBySlug(slug);

  if (!era) {
    return {
      title: 'Era Not Found | Learning Art',
    };
  }

  return {
    title: `${era.name} (${era.startYear}-${era.endYear}) | Timeline | Learning Art`,
    description: era.description,
  };
}

export default async function EraDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const era = getEraBySlug(slug);

  if (!era) {
    notFound();
  }

  // Load era introduction
  const introduction = getEraIntroduction(slug);

  // Get all eras and find adjacent ones
  const eras = getAllEras();
  const { prev, next } = getAdjacentEras(slug, eras);

  // Get artworks for this era
  const allArtworks = getAllArtworks();
  const eraArtworks = getArtworksByEra(allArtworks, era.id, eras);

  return (
    <div className="section-padding">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/timeline"
            className="text-gray-600 dark:text-gray-400 hover:text-accent-ochre transition-colors"
          >
            ← Back to Timeline
          </Link>

          <div className="flex gap-3">
            {prev && (
              <Link
                href={`/timeline/${prev.slug}`}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                ← {prev.name}
              </Link>
            )}
            {next && (
              <Link
                href={`/timeline/${next.slug}`}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                {next.name} →
              </Link>
            )}
          </div>
        </div>

        {/* Era Title */}
        <div
          className="mb-12 pb-6 border-b-4"
          style={{ borderColor: era.color || '#D4AF37' }}
        >
          <h1 className="font-serif text-5xl font-bold mb-2">
            {era.name}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {era.startYear < 0 ? `${Math.abs(era.startYear)} BCE` : era.startYear} -{' '}
            {era.endYear < 0 ? `${Math.abs(era.endYear)} BCE` : era.endYear}
          </p>
        </div>

        {/* Era Introduction */}
        {introduction ? (
          <div className="mb-16">
            <EraIntroduction introduction={introduction} />
          </div>
        ) : (
          <div className="mb-16 p-8 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <p className="text-gray-600 dark:text-gray-400">
              Introduction content for this era is not yet available.
            </p>
          </div>
        )}

        {/* Artworks Section */}
        <div>
          <h2 className="font-serif text-3xl font-bold mb-8">
            Artworks from this Era ({eraArtworks.length})
          </h2>

          <ArtworkGrid
            artworks={eraArtworks}
            emptyMessage="No artworks from this era in the collection yet."
          />
        </div>

        {/* Navigation Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          {prev ? (
            <Link
              href={`/timeline/${prev.slug}`}
              className="group flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-accent-ochre transition-colors"
            >
              <span className="text-2xl">←</span>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-500">Previous Era</p>
                <p className="font-semibold">{prev.name}</p>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {next ? (
            <Link
              href={`/timeline/${next.slug}`}
              className="group flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-accent-ochre transition-colors text-right"
            >
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-500">Next Era</p>
                <p className="font-semibold">{next.name}</p>
              </div>
              <span className="text-2xl">→</span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
